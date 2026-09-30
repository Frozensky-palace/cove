/**
 * 动态社交分享图生成（IMPL-056，评审报告 4.10 / 4.11）：构建期为已发布
 * 的文章、笔记、项目与值守者档案各生成一张 1200x630 品牌分享卡，输出到
 * dist/og/<类型>/<id>.png（页面元数据按同一约定引用，见各页 imagePath）。
 *
 * - satori（JSX 对象 → SVG，文字转路径）+ @resvg/resvg-js（SVG → PNG）；
 *   中文渲染使用 @fontsource/noto-sans-sc 的 woff 分块（构建期依赖，
 *   不进客户端 bundle）；
 * - 只为生产可见内容生成（draft / 未来日期除外，与 lib/content.ts
 *   isPublicContent 同口径）；值守者卡替换原 2–3MB 立绘 PNG 作为 og:image
 *   （评审 4.11：分享卡不应是兆级原图）；
 * - 卡面设计取自 tokens.css 浅色令牌：顶部蓝粉渐变条、品牌字标、
 *   类型/日期元信息行、标题与描述、页脚署名。
 *
 * 用法：构建链内自动执行（package.json build，astro build 之后）；单独
 * 调试：`node scripts/generate-og-images.mjs`。
 */
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = join(root, 'src', 'content');
const distOg = join(root, 'dist', 'og');
const FONT_DIR = join(root, 'node_modules', '@fontsource', 'noto-sans-sc', 'files');
const FONT_WEIGHTS = [400, 700];

/** 卡面配色（tokens.css 浅色令牌；分享卡不跟随访客主题，固定浅色） */
const C = {
  bg: '#f8fbfc',
  text: '#243746',
  muted: '#687b87',
  blue: '#6799bd',
  blueStrong: '#3f789f',
  pink: '#dea0af',
};

function todayInShanghai() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

/** frontmatter 日期规范化：js-yaml 裸日期按 UTC 零点解析成 Date（同 content.config 口径） */
function normalizeDate(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return typeof value === 'string' ? value : '';
}

function listMarkdown(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (isDirectory(full)) out.push(...listMarkdown(full));
    else if (name.endsWith('.md')) out.push(full);
  }
  return out;
}

function isDirectory(path) {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
}

function readFrontmatter(file) {
  return matter(readFileSync(file, 'utf8')).data;
}

/** 标题/描述截断：卡面为固定行数设计，超出以省略号收尾（CJK 全宽保守估计） */
function truncate(text, maxChars) {
  const flat = String(text).replace(/\s+/g, ' ').trim();
  return flat.length > maxChars ? `${flat.slice(0, maxChars - 1).trimEnd()}…` : flat;
}

/* ------------------------------- 字体收集 -------------------------------- */

/**
 * 中文渲染用整包子集（chinese-simplified 单文件，约 1.5MB/字重，构建期
 * 内存加载、不进客户端 bundle）。注意不用按 unicode-range 切片的编号分块：
 * satori 对同名字体不做逐字回退，多块同名家字体会导致缺字（豆腐块），
 * 实测单文件（含基本拉丁）才是可用方案。
 */
function loadFonts() {
  const fonts = FONT_WEIGHTS.map((weight) => {
    const file = join(FONT_DIR, `noto-sans-sc-chinese-simplified-${weight}-normal.woff`);
    try {
      return {
        name: 'Noto Sans SC',
        data: readFileSync(file),
        weight,
        style: 'normal',
      };
    } catch {
      console.error(`[og] 缺少字体文件 ${file}——请先 pnpm install`);
      process.exit(1);
    }
  });
  return fonts;
}

/* ------------------------------- 卡面设计 -------------------------------- */

/** 品牌骨架：顶部渐变条 + 页眉（字标 / 域名）+ 页脚署名，中段由调用方填充 */
function cardFrame({ meta, children }) {
  return {
    type: 'div',
    props: {
      style: {
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '64px 84px 56px',
        backgroundColor: C.bg,
        fontFamily: 'Noto Sans SC',
        position: 'relative',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: '0',
              left: '0',
              width: '1200px',
              height: '10px',
              backgroundImage: `linear-gradient(90deg, ${C.blue}, ${C.pink})`,
            },
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: { display: 'flex', alignItems: 'center', gap: '18px' },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          width: '34px',
                          height: '34px',
                          borderRadius: '10px',
                          backgroundImage: `linear-gradient(135deg, ${C.blue}, ${C.pink})`,
                        },
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: '34px',
                          fontWeight: 700,
                          color: C.blueStrong,
                          letterSpacing: '1px',
                        },
                        children: 'Cove',
                      },
                    },
                  ],
                },
              },
              {
                type: 'div',
                props: { style: { fontSize: '24px', color: C.muted }, children: 'cove.xin' },
              },
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column', gap: '26px' },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: '26px',
                    color: C.muted,
                    letterSpacing: '4px',
                  },
                  children: meta,
                },
              },
              ...children,
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: { fontSize: '24px', color: C.muted },
            children: '温晚安 · 小海湾里的文字、项目与技术分享',
          },
        },
      ],
    },
  };
}

function titleBlock(title, maxChars) {
  return {
    type: 'div',
    props: {
      style: {
        fontSize: '60px',
        fontWeight: 700,
        color: C.text,
        lineHeight: 1.3,
      },
      children: truncate(title, maxChars),
    },
  };
}

function descBlock(text, maxChars) {
  return {
    type: 'div',
    props: {
      style: { fontSize: '28px', color: C.muted, lineHeight: 1.55 },
      children: truncate(text, maxChars),
    },
  };
}

/** 分类 key → label（与 data/taxonomy.ts 同源：categories/*.md 的 label 字段） */
function loadCategoryLabels() {
  const labels = new Map();
  for (const file of listMarkdown(join(contentDir, 'categories'))) {
    const key = file.replace(/\.md$/, '').split(/[\\/]/).pop();
    labels.set(key, String(readFrontmatter(file).label ?? key));
  }
  return labels;
}

const STATUS_LABEL = { active: '进行中', completed: '已完成', archived: '已归档' };

function buildCards() {
  const today = todayInShanghai();
  const categoryLabels = loadCategoryLabels();
  const cards = [];

  const postsDir = join(contentDir, 'posts');
  for (const file of listMarkdown(postsDir)) {
    const data = readFrontmatter(file);
    if (data.draft === true) continue;
    const publishedAt = normalizeDate(data.publishedAt);
    if (publishedAt && publishedAt > today) continue;
    const id = file.replace(/\.md$/, '').split(/[\\/]/).pop();
    const category = categoryLabels.get(String(data.category)) ?? String(data.category ?? '');
    cards.push({
      out: join(distOg, 'posts', `${id}.png`),
      element: cardFrame({
        meta: `文章 · ${category}${publishedAt ? ` · ${publishedAt}` : ''}`,
        children: [titleBlock(data.title, 32), descBlock(data.description ?? '', 36)],
      }),
    });
  }

  const notesDir = join(contentDir, 'notes');
  for (const file of listMarkdown(notesDir)) {
    const data = readFrontmatter(file);
    if (data.draft === true) continue;
    const publishedAt = normalizeDate(data.publishedAt);
    if (publishedAt && publishedAt > today) continue;
    const id = file.replace(/\.md$/, '').split(/[\\/]/).pop();
    const title = typeof data.title === 'string' ? data.title : `${publishedAt} 的笔记`;
    cards.push({
      out: join(distOg, 'notes', `${id}.png`),
      element: cardFrame({
        meta: `笔记 · ${publishedAt}`,
        children: [titleBlock(title, 32)],
      }),
    });
  }

  const projectsDir = join(contentDir, 'projects');
  for (const file of listMarkdown(projectsDir)) {
    const data = readFrontmatter(file);
    if (data.draft === true) continue;
    const id = file.replace(/\.md$/, '').split(/[\\/]/).pop();
    cards.push({
      out: join(distOg, 'projects', `${id}.png`),
      element: cardFrame({
        meta: `项目 · ${STATUS_LABEL[data.status] ?? ''}`,
        children: [titleBlock(data.title, 32), descBlock(data.summary ?? '', 36)],
      }),
    });
  }

  const authorsDir = join(contentDir, 'authors');
  for (const file of listMarkdown(authorsDir)) {
    const data = readFrontmatter(file);
    cards.push({
      out: join(distOg, 'character', `${data.key}.png`),
      element: cardFrame({
        meta: `值守者档案 · ${data.role}`,
        children: [
          {
            type: 'div',
            props: {
              style: { fontSize: '72px', fontWeight: 700, color: C.text, lineHeight: 1.25 },
              children: truncate(data.name, 12),
            },
          },
          descBlock(data.tagline, 34),
        ],
      }),
    });
  }

  return cards;
}

/* --------------------------------- 主流程 --------------------------------- */

const fonts = loadFonts();
const cards = buildCards();

for (const { out, element } of cards) {
  const svg = await satori(element, { width: 1200, height: 630, fonts });
  const png = new Resvg(svg, { fitTo: { mode: 'original' } }).render().asPng();
  if (png.byteLength > 300 * 1024) {
    console.warn(`[og] ${out} 超过 300KB（${Math.round(png.byteLength / 1024)}KB），请检查卡面`);
  }
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, png);
}

const byType = cards.reduce((acc, { out }) => {
  const type = out.split(/[\\/]/).at(-2);
  acc[type] = (acc[type] ?? 0) + 1;
  return acc;
}, {});
const summary = Object.entries(byType)
  .map(([type, count]) => `${type} ${count} 张`)
  .join('，');
console.log(`[og] 已生成 ${cards.length} 张分享图（${summary}），输出 dist/og/`);
