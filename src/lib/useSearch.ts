/**
 * 搜索状态组合式函数：SearchDialog（页头对话框）与 SearchPanel（/search/ 页）共用。
 *
 * 评审整改（BLOG-FRONTEND-REVIEW-2026-09-27）：
 * - F03：返回真实总数 total 与 loadMore 分页，不再静默截断为 12 条；
 * - F04：索引不可用（unavailable）在成功加载后自动清除；提供 retry
 *   立即重试（配合 search.ts 清除失败缓存，重试会真正重新加载）；
 * - F05：输入/筛选一变化即作废在途请求（不等防抖结束），并立即进入
 *   加载态——过期响应不会被接收，加载窗口内的回车也不会误跳转；
 * - F05/D12：dispose 供组件卸载时清理防抖计时器并作废在途响应。
 */
import { ref, watch, type Ref } from 'vue';
import { searchContent, type SearchResultItem, type SearchType } from './search';

export type TypeFilter = SearchType | '全部';

/** 单页结果数：弹窗取第一页，完整页经 loadMore 追加 */
export const SEARCH_PAGE_SIZE = 12;

export function useSearch(query: Ref<string>, type: Ref<TypeFilter>) {
  const results = ref<SearchResultItem[]>([]);
  /** Pagefind 匹配总数（≥ results.length；两者相等即已全部加载） */
  const total = ref(0);
  const loading = ref(false);
  const loadingMore = ref(false);
  /** 索引不可用（dev 未构建 / 网络失败）；成功后自动清除（评审 F04） */
  const unavailable = ref(false);

  let seq = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const filter = (): SearchType | undefined => (type.value === '全部' ? undefined : type.value);

  async function run(): Promise<void> {
    const current = ++seq;
    const keyword = query.value.trim();
    if (!keyword) {
      results.value = [];
      total.value = 0;
      loading.value = false;
      return;
    }

    loading.value = true;
    try {
      const response = await searchContent(keyword, filter(), {
        offset: 0,
        limit: SEARCH_PAGE_SIZE,
      });
      if (current !== seq) return;
      results.value = response.items;
      total.value = response.total;
      unavailable.value = false;
    } catch {
      if (current !== seq) return;
      unavailable.value = true;
      results.value = [];
      total.value = 0;
    } finally {
      if (current === seq) loading.value = false;
    }
  }

  /** 加载更多：按已加载数量取下一页；失败保留现状，可再次点击 */
  async function loadMore(): Promise<void> {
    const keyword = query.value.trim();
    if (!keyword || loading.value || loadingMore.value) return;
    if (results.value.length === 0 || results.value.length >= total.value) return;

    const current = seq;
    loadingMore.value = true;
    try {
      const response = await searchContent(keyword, filter(), {
        offset: results.value.length,
        limit: SEARCH_PAGE_SIZE,
      });
      if (current !== seq) return;
      results.value = results.value.concat(response.items);
      total.value = response.total;
      unavailable.value = false;
    } catch {
      /* 追加失败：保留已加载结果，loadingMore 复位后可重试 */
    } finally {
      if (current === seq) loadingMore.value = false;
    }
  }

  /** 立即重新执行当前查询（不可用提示中的重试动作） */
  function retry(): void {
    if (timer) clearTimeout(timer);
    void run();
  }

  watch(
    [query, type],
    () => {
      /* 输入/筛选一变化立即作废在途请求（评审 F05），同时清除上一次的
         失败态并进入加载态——阻止过期结果展示与加载窗口内误跳转 */
      seq++;
      unavailable.value = false;
      loading.value = query.value.trim().length > 0;
      if (timer) clearTimeout(timer);
      timer = setTimeout(run, 200);
    },
    { immediate: true },
  );

  /** 组件卸载时调用：清理防抖计时器，作废在途响应 */
  function dispose(): void {
    if (timer) clearTimeout(timer);
    seq++;
  }

  return { results, total, loading, loadingMore, unavailable, loadMore, retry, dispose };
}
