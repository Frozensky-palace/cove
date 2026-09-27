/**
 * 内链断链检查（评审报告 4.5 / CI 质量门禁）：扫描 dist 全部 HTML 的
 * href / src，断言站内链接目标在产物中真实存在。外链（http/https/
 * protocol-relative/mailto/tel/data）与纯锚点不在静态检查范围。
 *
 * 目标匹配按 Astro 目录式构建（/path/ → /path/index.html）优先，
 * 兼容 .html 结尾与裸文件（rss.xml、webmanifest、_astro/* 哈希资源）。
 *
 * 用法：`pnpm guard:links`，需先完成 astro build；CI 在 pnpm build 后执行。
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(root, 'dist');

function listHtml(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      out.push(...listHtml(full));
    } else if (name.endsWith('.html')) {
      out.push(full);
    }
  }
  return out;
}

/** 链接目标是否存在于 dist：文件 / 目录式 index.html / .html 结尾 */
function targetExists(target) {
  if (existsSync(target) && statSync(target).isFile()) return true;
  const asDirectoryIndex = join(target, 'index.html');
  if (existsSync(asDirectoryIndex)) return true;
  const asHtmlFile = `${target}.html`;
  if (existsSync(asHtmlFile)) return true;
  return false;
}

/** 归一化候选目标：原样与百分号解码各试一次（中文 slug 可能被转义） */
function resolveCandidates(rawTarget, fileDir) {
  const candidates = [];
  for (const value of new Set([rawTarget, safeDecode(rawTarget)])) {
    const pathPart = value.startsWith('/') ? join(distDir, value) : join(fileDir, value);
    candidates.push(pathPart);
  }
  return candidates;
}

function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

const htmlFiles = listHtml(distDir);
if (htmlFiles.length === 0) {
  console.error('[link-check] dist 中没有 HTML——请先完成 astro build');
  process.exit(1);
}

const SKIP = /^(https?:|\/\/|mailto:|tel:|data:)/i;
const broken = [];
let checked = 0;

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const rel = relative(distDir, file);
  const attrs = html.matchAll(/\b(?:href|src)="([^"]*)"/g);
  for (const [, raw] of attrs) {
    if (!raw || raw.startsWith('#') || SKIP.test(raw)) continue;
    const withoutFragment = raw.split('#')[0].split('?')[0];
    if (!withoutFragment) continue;
    checked += 1;
    const ok = resolveCandidates(withoutFragment, dirname(file)).some(targetExists);
    if (!ok) broken.push(`${rel} → ${raw}`);
  }
}

if (broken.length > 0) {
  console.error(`[link-check] 发现 ${broken.length} 个断链：`);
  for (const item of broken) console.error(`  - ${item}`);
  process.exit(1);
}

console.log(`[link-check] 已检查 ${htmlFiles.length} 个页面共 ${checked} 个站内链接，无断链`);
