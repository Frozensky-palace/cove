/**
 * 搜索状态组合式函数：SearchDialog（页头对话框）与 SearchPanel（/search/ 页）共用。
 * 输入防抖 200ms；以请求序号丢弃过期响应；索引不可用时置 unavailable。
 */
import { ref, watch, type Ref } from 'vue';
import { searchContent, type SearchResultItem, type SearchType } from './search';

export type TypeFilter = SearchType | '全部';

export function useSearch(query: Ref<string>, type: Ref<TypeFilter>) {
  const results = ref<SearchResultItem[]>([]);
  const loading = ref(false);
  /** dev 等场景：索引尚未生成 */
  const unavailable = ref(false);

  let seq = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;

  async function run() {
    const current = ++seq;
    const keyword = query.value.trim();
    if (!keyword) {
      results.value = [];
      loading.value = false;
      return;
    }

    loading.value = true;
    try {
      const items = await searchContent(keyword, type.value === '全部' ? undefined : type.value);
      if (current === seq) results.value = items;
    } catch {
      if (current === seq) {
        unavailable.value = true;
        results.value = [];
      }
    } finally {
      if (current === seq) loading.value = false;
    }
  }

  watch(
    [query, type],
    () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(run, 200);
    },
    { immediate: true },
  );

  return { results, loading, unavailable };
}
