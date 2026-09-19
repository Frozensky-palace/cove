/**
 * 非生产分支构建注入 X-Robots-Tag: noindex（指南 4.4「预览站点必须
 * noindex」，Phase 7）。
 *
 * 原理：Workers Builds 按分支检出仓库后执行构建，`git rev-parse
 * --abbrev-ref HEAD` 即部署意图分支；本地构建同理。仅 main 缺省
 * 允许索引；分支名不可得（git 不可用等）一律按预览处理——失败安全
 * 方向是「宁可不被索引，不可误索引预览内容」。
 *
 * 用法：构建链末尾执行（package.json build 脚本已接入），读写
 * dist/_headers（public/_headers 的拷贝），幂等可重复执行。
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const headersPath = join(root, 'dist', '_headers');

if (!existsSync(headersPath)) {
  console.error('[noindex-preview] dist/_headers 不存在——请先完成 astro build');
  process.exit(1);
}

let branch = '';
try {
  branch = execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
    encoding: 'utf8',
  }).trim();
} catch {
  branch = '';
}

if (branch === 'main') {
  console.log('[noindex-preview] 生产分支构建，跳过 noindex 注入');
  process.exit(0);
}

const content = readFileSync(headersPath, 'utf8');
if (/X-Robots-Tag:/i.test(content)) {
  console.log('[noindex-preview] _headers 已含 X-Robots-Tag，跳过');
  process.exit(0);
}

const note = `# 预览环境 noindex（scripts/noindex-preview.mjs 注入；分支：${branch || '未知'}）\n/*\n  X-Robots-Tag: noindex\n`;
writeFileSync(headersPath, `${content}\n${note}`);
console.log(
  `[noindex-preview] 非生产分支（${branch || '未知'}）构建，已注入 X-Robots-Tag: noindex`,
);
