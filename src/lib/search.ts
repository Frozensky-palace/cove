/**
 * Pagefind 浏览器端封装（指南 9.7 / 17.2）：
 * 索引由 `pnpm build`（astro build 后执行 pagefind）产出，
 * dev 模式下 /pagefind/pagefind.js 不存在，调用方需处理加载失败并给出提示。
 *
 * 评审整改（BLOG-FRONTEND-REVIEW-2026-09-27）：
 * - F03：searchContent 返回真实总数 total 与 offset/limit 分页取详情——
 *   不再静默 slice(0, 12)；详情只按当前页加载，不一次取完全部正文片段；
 * - F04：Pagefind 加载 Promise 一旦 reject 不再永久缓存失败状态，
 *   清除缓存后下次调用即可重试。
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

export interface SearchOptions {
  /** 从第 offset 条开始加载详情（配合 total 做加载更多） */
  offset?: number;
  /** 本页最多加载多少条详情 */
  limit?: number;
}

export interface SearchResponse {
  items: SearchResultItem[];
  /** Pagefind 报告的匹配总数，不随 limit/offset 截断 */
  total: number;
}

/** Pagefind 运行时路径（构建后由 pagefind --site dist 产出） */
const PAGEFIND_URL = '/pagefind/pagefind.js';

let pagefindPromise: Promise<Pagefind> | null = null;

/**
 * 动态加载 Pagefind 运行时；dev 下会 reject，由调用方捕获。
 * 失败不缓存（评审 F04）：拒绝时清空 pagefindPromise，恢复网络后
 * 再次调用会真正重新加载，而不是读到永久缓存的拒绝状态。
 */
export function loadPagefind(): Promise<Pagefind> {
  if (!pagefindPromise) {
    // 变量 URL + @vite-ignore：保留运行时解析，避免构建期静态分析
    pagefindPromise = import(/* @vite-ignore */ PAGEFIND_URL)
      .then((mod) => {
        const pagefind = ((mod as Record<string, unknown>).default ?? mod) as Pagefind;
        if (typeof pagefind.search !== 'function') {
          throw new Error('Pagefind runtime unavailable');
        }
        return pagefind;
      })
      .catch((error: unknown) => {
        pagefindPromise = null;
        throw error;
      });
  }
  return pagefindPromise;
}

/** 按关键词 + 可选类型搜索；详情按 offset/limit 分页加载，总数不截断 */
export async function searchContent(
  query: string,
  type?: SearchType,
  options: SearchOptions = {},
): Promise<SearchResponse> {
  const trimmed = query.trim();
  if (!trimmed) return { items: [], total: 0 };

  const pagefind = await loadPagefind();
  const response = await pagefind.search(trimmed, type ? { filters: { 类型: [type] } } : undefined);
  const total = response.results.length;
  const { offset = 0, limit = 12 } = options;
  const page = response.results.slice(offset, offset + limit);

  const items = await Promise.all(
    page.map(async (result): Promise<SearchResultItem> => {
      const data = await result.data();
      return {
        id: result.id,
        title: data.meta?.title ?? data.url,
        url: data.url,
        excerpt: data.excerpt ?? '',
        type: data.filters?.类型?.[0] ?? inferTypeFromUrl(data.url),
        date: data.meta?.date,
      };
    }),
  );
  return { items, total };
}

function inferTypeFromUrl(url: string): string {
  if (url.includes('/notes/')) return '笔记';
  if (url.includes('/projects/')) return '项目';
  if (url.includes('/posts/')) return '文章';
  return '页面';
}
