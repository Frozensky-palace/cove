/**
 * 值守者体系（IMPL-052）：唯一数据源是 src/content/authors/*.md
 * （Pages CMS 的 authors collection，可在 CMS 直接增删改）。
 * 与 taxonomy.ts 同一套模式：构建期用 import.meta.glob（?raw, eager）
 * 同步派生 key → name 映射与展示排序，供 content.config.ts 的
 * z.enum 与列表卡片（无异步场景）使用；完整档案（头像、设定文正文）
 * 经 authors content collection 异步读取（lib/content.ts）。
 *
 * key 同时是文件名与 URL slug（/character/<key>/），发布后视为冻结。
 * 只在构建期被引用，不进客户端 bundle。
 */
import matter from 'gray-matter';

export interface AuthorInfo {
  key: string;
  name: string;
  role: string;
  order: number;
}

const authorFiles = import.meta.glob<string>('../content/authors/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

function loadAuthors(): AuthorInfo[] {
  const entries = Object.entries(authorFiles);
  if (entries.length === 0) {
    throw new Error('src/content/authors 中没有作者文件，至少需要一位值守者');
  }

  const authors = entries.map(([filePath, raw]) => {
    const key = filePath.split('/').pop()!.replace(/\.md$/, '');
    const { data } = matter(raw);

    const name = typeof data.name === 'string' ? data.name.trim() : '';
    if (!name) throw new Error(`作者 ${filePath} 缺少 name 字段（string）`);
    const role = typeof data.role === 'string' ? data.role.trim() : '';
    if (!role) throw new Error(`作者 ${filePath} 缺少 role 字段（string）`);
    if (typeof data.key === 'string' && data.key.trim() !== key) {
      throw new Error(`作者 ${filePath} 的 key（${data.key}）与文件名（${key}）不一致`);
    }

    const order = typeof data.order === 'number' ? data.order : Number.MAX_SAFE_INTEGER;
    return { key, name, role, order };
  });

  return authors.sort((a, b) => a.order - b.order || a.key.localeCompare(b.key));
}

const authors = loadAuthors();

/** key → 显示名，键的插入顺序即展示顺序（order 升序，其次 key 字典序）。 */
export const AUTHORS: Readonly<Record<string, string>> = Object.fromEntries(
  authors.map(({ key, name }) => [key, name]),
);

export type AuthorKey = string;

/** 非空元组类型以适配 content.config.ts 的 z.enum。 */
export const authorKeys = authors.map(({ key }) => key) as [AuthorKey, ...AuthorKey[]];

export function authorName(key: string): string {
  return AUTHORS[key] ?? key;
}

export function isAuthorKey(value: string): value is AuthorKey {
  return Object.hasOwn(AUTHORS, value);
}
