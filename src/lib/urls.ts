/**
 * URL slug 规范化（指南 7.3 / 11.1）：
 * - 标签与分类在构建时统一规范化大小写与空格，展示名与 URL slug 分离；
 * - 全站唯一的 slugify 实现，页面与组件一律复用本模块。
 */

/** 将标签展示名规范化为 URL slug：小写 ASCII、去空白、空格转连字符、保留中日文字符。 */
export function slugifyTag(tag: string): string {
  return tag
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[!/?:;,.，。！？：；、]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * 从「slug → 展示名」映射中反查展示名。
 * 标签展示名以内容中首次出现的写法为准（构建时聚合），slug 碰撞会在
 * collectTags 中抛出构建错误，避免两个不同标签生成同一 URL。
 */
export function tagUrl(tag: string): string {
  return `/tags/${slugifyTag(tag)}/`;
}

/** 系列 URL：slug 规范化与标签同策略（保留中日文字符，构建期碰撞检测见 lib/content）。 */
export function seriesUrl(name: string): string {
  return `/series/${slugifyTag(name)}/`;
}

export function categoryUrl(key: string): string {
  return `/categories/${key}/`;
}

export function postUrl(id: string): string {
  return `/posts/${id}/`;
}

export function noteUrl(id: string): string {
  return `/notes/${id}/`;
}

export function projectUrl(id: string): string {
  return `/projects/${id}/`;
}
