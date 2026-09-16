/**
 * robots.txt 端点（指南 13.1 / 19 Phase 5）：动态生成以保持
 * sitemap 地址与 siteConfig.url 单一来源，避免静态文件中的域名漂移。
 * 草稿页无生产路由，天然不可被发现；/dev/ 已输出 noindex，不额外 Disallow
 * （Disallow 会阻止爬虫读取 noindex 标记，反而不利于去索引）。
 */
import type { APIRoute } from 'astro';
import { resolveSiteURL } from '@/lib/seo';

export const GET: APIRoute = () => {
  const body = [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${resolveSiteURL('/sitemap-index.xml')}`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
