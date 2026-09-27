/**
 * 生产产物守卫：草稿与计划发布内容不得出现在 dist（评审报告 4.1 建议 5）。
 *
 * content-guard.mjs 在源码层拦截测试内容；本脚本在构建产物层做第二道
 * 断言——与 src/lib/content.ts isPublicContent 同口径（draft: true 或
 * publishedAt 晚于「今天」（Asia/Shanghai）的内容仅限本地预览），检查
 * 它们的 id 是否泄漏进 dist：文件/目录路径中出现该 id，或任何 HTML
 * 以链接形式引用 /posts|notes|projects/<id>/。
 *
 * 用法：`pnpm guard:dist`，需先完成 astro build；CI 在 pnpm build 后执行。
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = join(root, 'src', 'content');
const distDir = join(root, 'dist');
const COLLECTIONS = ['posts', 'notes', 'projects'];

function todayInShanghai() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function listMarkdown(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      out.push(...listMarkdown(full));
    } else if (name.endsWith('.md')) {
      out.push(full);
    }
  }
  return out;
}

function listFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      out.push(...listFiles(full));
    } else {
      out.push(full);
    }
  }
  return out;
}

/* 1. 收集「仅预览」内容的 id（与 isPublicContent 同口径，但不受
      showPreviewContent 影响——生产守卫只看生产规则本身） */
const today = todayInShanghai();

/* YAML 未加引号的日期会被解析成 Date 对象（content.config.ts 的
   dateString 预处理在源码层做了同样的事），这里归一化后再比较 */
function normalizeDate(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return value;
}

const excluded = [];

for (const collection of COLLECTIONS) {
  const dir = join(contentDir, collection);
  if (!statSync(dir, { throwIfNoEntry: false })?.isDirectory()) continue;
  for (const file of listMarkdown(dir)) {
    const { data } = matter(readFileSync(file, 'utf8'));
    if (data.draft === true) {
      excluded.push({ collection, id: relative(dir, file).replace(/\.md$/, '') });
      continue;
    }
    const publishedAt = normalizeDate(data.publishedAt);
    if (typeof publishedAt === 'string' && publishedAt > today) {
      excluded.push({ collection, id: relative(dir, file).replace(/\.md$/, '') });
    }
  }
}

if (excluded.length === 0) {
  console.log('[dist-guard] 无仅预览内容，无需断言（这不常见，请确认内容目录）');
  process.exit(0);
}

/* 2. 扫描 dist：路径段命中或 HTML 链接引用都算泄漏 */
const distFiles = listFiles(distDir);
const distRel = distFiles.map((file) => relative(distDir, file).split('\\').join('/'));
const htmlFiles = distFiles.filter((file) => file.endsWith('.html'));
const htmlTexts = new Map(htmlFiles.map((file) => [file, readFileSync(file, 'utf8')]));

const leaks = [];
for (const { collection, id } of excluded) {
  const pathNeedle = `${collection}/${id}`;
  const linkNeedle = `/${pathNeedle}/`;
  for (const rel of distRel) {
    const segments = rel.split('/');
    if (segments.includes(`${id}.html`) || segments.includes(id)) {
      leaks.push(`${rel}（路径包含仅预览内容 ${pathNeedle}）`);
      break;
    }
  }
  for (const [file, html] of htmlTexts) {
    if (html.includes(linkNeedle)) {
      leaks.push(`${relative(distDir, file)}（链接引用了 ${linkNeedle}）`);
      break;
    }
  }
}

if (leaks.length > 0) {
  console.error('[dist-guard] 仅预览内容泄漏进生产产物：');
  for (const leak of leaks) console.error(`  - ${leak}`);
  console.error('请检查 getStaticPaths 是否正确复用 lib/content 的生产过滤。');
  process.exit(1);
}

console.log(
  `[dist-guard] 已断言 ${excluded.length} 条仅预览内容未出现在 dist（${distFiles.length} 个文件）`,
);
