// @ts-check
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { unified } from '@astrojs/markdown-remark';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { rehypeFigure } from './src/plugins/rehype-figure.ts';

// site 为 SEO/Canonical 派生的事实源（指南 4.4）。
// 正式域名 cove.xin（IMPL-045，作者确认；与 src/data/site.ts 的
// siteConfig.url 保持一致——后者是页面级 URL 的唯一来源）。
export default defineConfig({
  site: 'https://cove.xin',
  // 纯静态输出，不安装 Cloudflare adapter（指南 4.4）。
  // trailingSlash 与 Workers Static Assets 的 HTML handling 需保持一致，
  // 在 Phase 7 部署时用 /posts/example 与 /posts/example/ 实测验证。
  trailingSlash: 'always',
  integrations: [
    vue(),
    // 站点地图（指南 13）：排除 noindex 的设计展示页；草稿页本就不产出
    sitemap({ filter: (page) => !page.includes('/dev/') }),
  ],
  // 统一本地端口：dev 与 preview 均为 4321（Astro 默认值，此处显式固化）
  // 注：astro preview 委托 Vite preview 服务器，其端口在 vite.preview 中配置
  server: { port: 4321 },
  markdown: {
    // Astro 7：remark/rehype 插件经 @astrojs/markdown-remark 的 unified() 处理器传入。
    // 标题稳定锚点 + 悬停/聚焦可见的锚点链接 + 图片转 figure（指南 9.4）。
    processor: unified({
      rehypePlugins: [
        rehypeSlug,
        [
          rehypeAutolinkHeadings,
          {
            behavior: 'append',
            properties: { className: ['heading-anchor'], ariaLabel: '跳转到此标题' },
            content: { type: 'text', value: '#' },
          },
        ],
        rehypeFigure,
      ],
    }),
    shikiConfig: {
      // 双主题：浅色 github-light / 深色 github-dark，由 .dark class 驱动切换
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false,
      // 长行横向滚动，不折行（指南 9.4）
      wrap: false,
    },
  },
  vite: {
    plugins: [tailwindcss()],
    preview: { port: 4321 },
  },
});
