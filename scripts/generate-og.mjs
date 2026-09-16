/**
 * 生成默认社交分享图 public/og-default.png（1200x630）。
 *
 * 用法：node scripts/generate-og.mjs
 * 依赖项目内 sharp（Astro 既有依赖，无新增）。
 * 修改 og-default.svg 后需重新运行并提交 PNG 产物。
 *
 * 设计约束（指南 8.2）：SVG 内不渲染中文文本，避免 libvips/librsvg
 * 环境字体差异导致缺字；中文 slogan 由 og:image:alt 描述承担。
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = fileURLToPath(new URL('..', import.meta.url));
const svgPath = path.join(root, 'scripts', 'og-default.svg');
const outPath = path.join(root, 'public', 'og-default.png');

const svg = await readFile(svgPath, 'utf-8');
await sharp(Buffer.from(svg))
  .resize(1200, 630)
  .png({ compressionLevel: 9 })
  .toFile(outPath);

console.log(`og image written: ${outPath}`);
