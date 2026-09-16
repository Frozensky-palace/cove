import { siteConfig } from '@/data/site';
import { shanghaiDate, type Post } from '@/lib/content';
import { categoryLabel } from '@/data/taxonomy';
import { categoryUrl, postUrl } from '@/lib/urls';

/** 默认社交分享图（1200x630，scripts/generate-og.mjs 生成） */
export const DEFAULT_OG_IMAGE = {
  path: '/og-default.png',
  width: 1200,
  height: 630,
  alt: 'Cove · 小海湾里的文字、项目与技术分享',
} as const;

export interface PageMetadataInput {
  /** 页面标题（不含站名后缀） */
  title: string;
  /** 页面描述；缺省回退站点描述 */
  description?: string;
  /** 站内路径，用于生成 canonical（如 `/posts/example/`） */
  path?: string;
  /** 预览环境、草稿等不进入索引的页面设为 true（指南 13.1） */
  noindex?: boolean;
  /** og:type，文章页为 article */
  ogType?: 'website' | 'article';
  /** 站内图片路径（如封面构建产物路径）；缺省用默认分享图 */
  imagePath?: string;
  imageWidth?: number;
  imageHeight?: number;
  imageAlt?: string;
  /** 文章发布时间（og:type=article 时输出 article:published_time，ISO 8601） */
  publishedTime?: string;
}

export interface PageMetadata {
  /** 已拼接站名后缀的完整标题 */
  title: string;
  description: string;
  canonical: string;
  noindex: boolean;
  ogType: 'website' | 'article';
  image: { url: string; width: number; height: number; alt: string };
  publishedTime?: string;
}

/** 基于站点 site 配置解析绝对 URL（指南 4.4） */
export function resolveSiteURL(path = '/'): string {
  return new URL(path, siteConfig.url).toString();
}

/** 构建页面元数据；标题与站名相同的页面不加后缀 */
export function buildMetadata({
  title,
  description,
  path = '/',
  noindex = false,
  ogType = 'website',
  imagePath,
  imageWidth,
  imageHeight,
  imageAlt,
  publishedTime,
}: PageMetadataInput): PageMetadata {
  return {
    title: title === siteConfig.name ? title : `${title} · ${siteConfig.name}`,
    description: description?.trim() || siteConfig.description,
    canonical: resolveSiteURL(path),
    noindex,
    ogType,
    image: {
      url: resolveSiteURL(imagePath ?? DEFAULT_OG_IMAGE.path),
      width: imageWidth ?? DEFAULT_OG_IMAGE.width,
      height: imageHeight ?? DEFAULT_OG_IMAGE.height,
      alt: imageAlt ?? DEFAULT_OG_IMAGE.alt,
    },
    publishedTime,
  };
}

/* ------------------------------------------------------------------------- */
/* JSON-LD 构建器（指南 13.2：数据来自内容 schema 与站点配置，不在页面手写） */

type JsonLd = Record<string, unknown>;

/** 全站作者 Person（BaseLayout 输出） */
export function personJsonLd(): JsonLd {
  const author: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: siteConfig.author.name,
  };
  if (siteConfig.author.url) author.url = siteConfig.author.url;
  if (siteConfig.social.length > 0) {
    author.sameAs = siteConfig.social.map((link) => link.href);
  }
  return author;
}

/** Person 节点（嵌套到 BlogPosting 等实体内时不携带独立 @context） */
function personNode(): JsonLd {
  const { ['@context']: _omit, ...node } = personJsonLd();
  return node;
}

/** 文章页 BlogPosting（ArticleLayout 输出）；imageUrl 为绝对地址的分享图 */
export function blogPostingJsonLd(post: Post, imageUrl: string): JsonLd {
  const data = post.data;
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: data.title,
    description: data.description,
    inLanguage: data.lang,
    datePublished: shanghaiDate(data.publishedAt).toISOString(),
    dateModified: shanghaiDate(data.updatedAt ?? data.publishedAt).toISOString(),
    image: imageUrl,
    mainEntityOfPage: resolveSiteURL(postUrl(post.id)),
    author: personNode(),
    keywords: data.tags.join(', '),
  };
}

/** 面包屑 BreadcrumbList（存在可见面包屑时输出，与 ArticleLayout 面包屑一致） */
export function breadcrumbJsonLd(items: ReadonlyArray<{ name: string; path: string }>): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: resolveSiteURL(item.path),
    })),
  };
}

/** 文章页面包屑（首页 → 文章 → 分类） */
export function articleBreadcrumb(post: Post): JsonLd {
  return breadcrumbJsonLd([
    { name: '首页', path: '/' },
    { name: '文章', path: '/posts/' },
    { name: categoryLabel(post.data.category), path: categoryUrl(post.data.category) },
  ]);
}
