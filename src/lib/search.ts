/**
 * Pagefind 浏览器端封装（指南 9.7 / 17.2）：
 * 索引由 `pnpm build`（astro build 后执行 pagefind）产出，
 * dev 模式下 /pagefind/pagefind.js 不存在，调用方需处理加载失败并给出提示。
 */

/** 内容类型筛选值，与详情页 data-pagefind-filter="类型:…" 一致 */
export type SearchType = '文章' | '笔记' | '项目';

interface PagefindResult {
  id: string;
  data: () => Promise<{
    url: string;
    excerpt?: string;
    meta?: Record<string, string>;
    filters?: Record<string, string[]>;
  }>;
}

interface Pagefind {
  search: (
    query: string,
    options?: { filters?: Record<string, string[]> },
  ) => Promise<{ results: PagefindResult[] }>;
}

export interface SearchResultItem {
  id: string;
  title: string;
  url: string;
  /** 含 <mark> 高亮片段（Pagefind 已转义正文 HTML） */
  excerpt: string;
  type?: string;
  date?: string;
}

/** Pagefind 运行时路径（构建后由 pagefind --site dist 产出） */
const PAGEFIND_URL = '/pagefind/pagefind.js';

let pagefindPromise: Promise<Pagefind> | null = null;

/** 动态加载 Pagefind 运行时；dev 下会 reject，由调用方捕获 */
export function loadPagefind(): Promise<Pagefind> {
  if (!pagefindPromise) {
    // 变量 URL + @vite-ignore：保留运行时解析，避免构建期静态分析
    pagefindPromise = import(/* @vite-ignore */ PAGEFIND_URL).then((mod) => {
      const pagefind = ((mod as Record<string, unknown>).default ?? mod) as Pagefind;
      if (typeof pagefind.search !== 'function') {
        throw new Error('Pagefind runtime unavailable');
      }
      return pagefind;
    });
  }
  return pagefindPromise;
}

/** 按关键词 + 可选类型搜索，返回前 12 条 */
export async function searchContent(
  query: string,
  type?: SearchType,
): Promise<SearchResultItem[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const pagefind = await loadPagefind();
  const response = await pagefind.search(trimmed, type ? { filters: { 类型: [type] } } : undefined);
  const top = response.results.slice(0, 12);

  const items = await Promise.all(top.map((result) => result.data()));
  return items.map((data, index) => ({
    id: top[index].id,
    title: data.meta?.title ?? data.url,
    url: data.url,
    excerpt: data.excerpt ?? '',
    type: data.filters?.类型?.[0] ?? inferTypeFromUrl(data.url),
    date: data.meta?.date,
  }));
}

function inferTypeFromUrl(url: string): string {
  if (url.includes('/notes/')) return '笔记';
  if (url.includes('/projects/')) return '项目';
  if (url.includes('/posts/')) return '文章';
  return '页面';
}
