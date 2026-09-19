/**
 * 分类体系（指南 11.1）：唯一数据源是 src/content/categories/*.md
 * （Pages CMS 的 categories collection，可在 CMS 直接增删改）。
 * 本模块在构建期派生 key → label 映射与展示排序；key 同时是文件名与
 * URL slug（/categories/<key>/），发布后视为冻结。
 *
 * 文件内容经 import.meta.glob（?raw, eager）在打包期内联，预渲染的
 * 子进程中不依赖文件系统路径（fs + import.meta.url 会随打包位置漂移）；
 * dev 下 Vite 监听 glob，新增/修改分类文件通常自动生效，未生效则重启。
 * 只在构建期被引用（.astro 前置代码、content.config.ts、lib/），不进
 * 客户端 bundle。
 */
import matter from 'gray-matter';

export interface CategoryInfo {
  key: string;
  label: string;
  order: number;
}

const categoryFiles = import.meta.glob<string>('../content/categories/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

function loadCategories(): CategoryInfo[] {
  const entries = Object.entries(categoryFiles);
  if (entries.length === 0) {
    throw new Error('src/content/categories 中没有分类文件，至少需要一个分类');
  }

  const categories = entries.map(([filePath, raw]) => {
    const key = filePath.split('/').pop()!.replace(/\.md$/, '');
    const { data } = matter(raw);

    const label = typeof data.label === 'string' ? data.label.trim() : '';
    if (!label) throw new Error(`分类 ${filePath} 缺少 label 字段（string）`);
    if (typeof data.key === 'string' && data.key.trim() !== key) {
      throw new Error(`分类 ${filePath} 的 key（${data.key}）与文件名（${key}）不一致`);
    }

    const order = typeof data.order === 'number' ? data.order : Number.MAX_SAFE_INTEGER;
    return { key, label, order };
  });

  return categories.sort((a, b) => a.order - b.order || a.key.localeCompare(b.key));
}

const categories = loadCategories();

/** key → 显示名，键的插入顺序即展示顺序（order 升序，其次 key 字典序）。 */
export const CATEGORIES: Readonly<Record<string, string>> = Object.fromEntries(
  categories.map(({ key, label }) => [key, label]),
);

export type CategoryKey = string;

/** 非空元组类型以适配 content.config.ts 的 z.enum。 */
export const categoryKeys = categories.map(({ key }) => key) as [
  CategoryKey,
  ...CategoryKey[],
];

export function categoryLabel(key: string): string {
  return CATEGORIES[key] ?? key;
}

export function isCategoryKey(value: string): value is CategoryKey {
  return Object.hasOwn(CATEGORIES, value);
}

/**
 * 标签展示名（中文/英文原样），URL slug 由 lib/urls.ts 统一规范化，
 * 页面不得各自实现 slugify（指南 11.1）。
 */
