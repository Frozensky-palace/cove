// @ts-check
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import tailwindcss from '@tailwindcss/vite';

// site 为 SEO/Canonical 派生的事实源（指南 4.4）。
// TODO(Phase 0/7)：正式域名确认后替换，见 docs/content-checklist.md 第五节。
export default defineConfig({
  site: 'https://cove.example.com',
  // 纯静态输出，不安装 Cloudflare adapter（指南 4.4）。
  // trailingSlash 与 Workers Static Assets 的 HTML handling 需保持一致，
  // 在 Phase 7 部署时用 /posts/example 与 /posts/example/ 实测验证。
  integrations: [vue()],
  vite: {
    plugins: [tailwindcss()],
  },
});
