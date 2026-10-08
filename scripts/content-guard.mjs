/**
 * 生产内容守卫：测试/验收内容不得进入生产构建（评审报告 4.1 建议 5）。
 *
 * 规则：内容文件（src/content/**）的文件名、title、description 或
 * tags 命中测试标记（test / 测试 / 验收）时，除非 draft: true，
 * 否则构建失败。计划发布（publishedAt 在未来）不豁免——测试样本
 * 若只靠未来日期挡在生产外，到期会自动混入生产（IMPL-085）。
 *
 * 用法：`pnpm guard:content`，或构建链内自动执行（package.json
 * build 脚本已接入，在 astro build 之前失败即止）。
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = join(root, 'src', 'content');
const MARKER = /test|测试|验收/i;

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

function stringifyTags(tags) {
  if (!tags) return '';
  return Array.isArray(tags) ? tags.filter((t) => typeof t === 'string').join(' ') : String(tags);
}

const violations = [];
const files = listMarkdown(contentDir);

for (const file of files) {
  let data;
  try {
    ({ data } = matter(readFileSync(file, 'utf8')));
  } catch {
    console.warn(`[content-guard] 跳过无法解析的文件：${relative(root, file)}`);
    continue;
  }

  // 唯一豁免：草稿（生产内容过滤会排除）
  if (data.draft === true) continue;

  const rel = relative(root, file);
  const haystacks = [
    ['文件名', relative(contentDir, file)],
    ['title', typeof data.title === 'string' ? data.title : ''],
    ['description', typeof data.description === 'string' ? data.description : ''],
    ['tags', stringifyTags(data.tags)],
  ];
  for (const [field, text] of haystacks) {
    if (text && MARKER.test(text)) {
      violations.push(`${rel} → ${field} 命中测试标记（"${text.match(MARKER)[0]}"）`);
      break;
    }
  }
}

if (violations.length > 0) {
  console.error('[content-guard] 检测到可能进入生产的测试/验收内容：');
  for (const v of violations) console.error(`  - ${v}`);
  console.error('请改为 draft: true 或移出内容目录。规则见 scripts/content-guard.mjs 头注。');
  process.exit(1);
}

console.log(`[content-guard] 已检查 ${files.length} 个内容文件，无测试内容混入生产`);
