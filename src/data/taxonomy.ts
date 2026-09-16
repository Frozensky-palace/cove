/**
 * 分类体系（指南 11.1）：分类使用集中维护的稳定 key 与中文 label 映射。
 * key 同时是 URL slug（/categories/<key>/），发布后视为冻结。
 */
export const CATEGORIES = {
  engineering: '工程实践',
  'web-dev': 'Web 开发',
  tools: '工具与效率',
  reading: '阅读与思考',
  life: '海湾生活',
} as const;

export type CategoryKey = keyof typeof CATEGORIES;

export const categoryKeys = Object.keys(CATEGORIES) as CategoryKey[];

export function categoryLabel(key: string): string {
  return CATEGORIES[key as CategoryKey] ?? key;
}

export function isCategoryKey(value: string): value is CategoryKey {
  return Object.hasOwn(CATEGORIES, value);
}

/**
 * 标签展示名（中文/英文原样），URL slug 由 lib/urls.ts 统一规范化，
 * 页面不得各自实现 slugify（指南 11.1）。
 */
