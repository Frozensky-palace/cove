/**
 * RSS 订阅源（指南 7.2 / 19）：仅已发布文章；草稿与未来日期内容不进入。
 * 日期以 Asia/Shanghai（+08:00）当日零点序列化，避免 UTC 偏移（指南 11.1）。
 */
import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { siteConfig } from '@/data/site';
import { categoryLabel } from '@/data/taxonomy';
import { getPublishedPosts, shanghaiDate } from '@/lib/content';

export const GET: APIRoute = async (context) => {
  const posts = await getPublishedPosts();

  return rss({
    title: `${siteConfig.name} · 文章`,
    description: siteConfig.description,
    site: context.site ?? siteConfig.url,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: shanghaiDate(post.data.publishedAt),
      link: `/posts/${post.id}/`,
      categories: [categoryLabel(post.data.category), ...post.data.tags],
    })),
    customData: '<language>zh-CN</language>',
  });
}
