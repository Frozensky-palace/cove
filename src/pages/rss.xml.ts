/**
 * RSS 订阅源（指南 7.2 / 19）：仅已发布文章；草稿与未来日期内容不进入。
 * 日期以 Asia/Shanghai（+08:00）当日零点序列化，避免 UTC 偏移（指南 11.1）。
 *
 * IMPL-056（评审报告 4.11 补全）：
 * - 正文全文 content：构建期用 Astro 同款 markdown 管线
 *   （@astrojs/markdown-remark，已有依赖）渲染；代码块不做高亮
 *   （syntaxHighlight: false，阅读器环境无主题样式）；
 * - 更新时间：updatedAt 以 dc:date 标注（Dublin Core，阅读器普遍识别）；
 * - 作者：dc:creator；
 * - 正文内站内相对链接/图片地址转绝对 URL（阅读器无站点上下文）。
 */
import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import { siteConfig } from '@/data/site';
import { categoryLabel } from '@/data/taxonomy';
import { getPublishedPosts, shanghaiDate } from '@/lib/content';

/** 正文内 href/src 相对地址转绝对：站点绝对路径挂 site，文档相对路径挂本文 URL */
function absolutize(html: string, siteUrl: string, postBase: string): string {
  return html.replace(/(href|src)="([^"]*)"/g, (attr, name: string, raw: string) => {
    if (/^(https?:|mailto:|#|\/\/)/.test(raw)) return attr;
    if (raw.startsWith('/')) return `${name}="${siteUrl}${raw}"`;
    return `${name}="${postBase}${raw}"`;
  });
}

export const GET: APIRoute = async (context) => {
  const posts = await getPublishedPosts();
  const site = context.site ?? new URL(siteConfig.url);
  const base = site.toString().replace(/\/+$/, '');

  /* 全文渲染：与站点页面同一 markdown 管线，gfm 默认开启 */
  const processor = await createMarkdownProcessor({ syntaxHighlight: false });

  return rss({
    title: `${siteConfig.name} · 文章`,
    description: siteConfig.description,
    site,
    items: await Promise.all(
      posts.map(async (post) => {
        const { code } = await processor.render(post.body ?? '');
        const postBase = `${base}/posts/${post.id}/`;
        return {
          title: post.data.title,
          description: post.data.description,
          pubDate: shanghaiDate(post.data.publishedAt),
          link: `/posts/${post.id}/`,
          categories: [categoryLabel(post.data.category), ...post.data.tags],
          content: absolutize(code, base, postBase),
          customData: [
            `<dc:creator>${siteConfig.author.name}</dc:creator>`,
            post.data.updatedAt
              ? `<dc:date>${shanghaiDate(post.data.updatedAt).toISOString()}</dc:date>`
              : '',
          ]
            .filter(Boolean)
            .join(''),
        };
      }),
    ),
    customData: '<language>zh-CN</language>',
    xmlns: {
      dc: 'http://purl.org/dc/elements/1.1/',
    },
  });
}
