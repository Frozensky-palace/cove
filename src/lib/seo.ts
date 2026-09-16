import { siteConfig } from '@/data/site';

export interface PageMetadataInput {
  /** 页面标题（不含站名后缀） */
  title: string;
  /** 页面描述；缺省回退站点描述 */
  description?: string;
  /** 站内路径，用于生成 canonical（如 `/posts/example/`） */
  path?: string;
  /** 预览环境、草稿等不进入索引的页面设为 true（指南 13.1） */
  noindex?: boolean;
  /** og:type，文章页后续覆盖为 article */
  ogType?: 'website' | 'article';
}

export interface PageMetadata {
  /** 已拼接站名后缀的完整标题 */
  title: string;
  description: string;
  canonical: string;
  noindex: boolean;
  ogType: 'website' | 'article';
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
}: PageMetadataInput): PageMetadata {
  return {
    title: title === siteConfig.name ? title : `${title} · ${siteConfig.name}`,
    description: description?.trim() || siteConfig.description,
    canonical: resolveSiteURL(path),
    noindex,
    ogType,
  };
}
