<script setup lang="ts">
/**
 * /search/ 页内联搜索面板（指南 9.7）：可直达、可链接分享的完整搜索页。
 * 与页头 SearchDialog 共用 useSearch；本组件聚焦后直接展示结果。
 * IMPL-056（评审报告 4.6）：q/type 同步到 URL（replaceState），刷新、
 * 复制链接与前进后退均可恢复；autofocus 仅在精确指针（桌面）设备
 * 生效，避免手机打开搜索页直接弹键盘；结果数经 aria-live 播报。
 */
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useSearch, type TypeFilter } from '@/lib/useSearch';

const query = ref('');
const type = ref<TypeFilter>('全部');
const { results, loading, unavailable } = useSearch(query, type);

const filters: TypeFilter[] = ['全部', '文章', '笔记', '项目'];
const hasQuery = computed(() => query.value.trim().length > 0);
const inputEl = ref<HTMLInputElement | null>(null);

/** 从 URL 恢复查询条件（刷新 / 分享链接 / 前进后退） */
function readUrl(): void {
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q');
  if (q !== null) query.value = q;
  const t = params.get('type') as TypeFilter | null;
  if (t && filters.includes(t)) type.value = t;
}

/** 查询条件写入 URL（replaceState：不污染历史，URL 即可分享） */
function writeUrl(): void {
  const params = new URLSearchParams(window.location.search);
  const q = query.value.trim();
  if (q) params.set('q', q);
  else params.delete('q');
  if (type.value !== '全部') params.set('type', type.value);
  else params.delete('type');
  const qs = params.toString();
  window.history.replaceState(null, '', `${window.location.pathname}${qs ? `?${qs}` : ''}`);
}

/* 初始化时由 readUrl 写入的值不应立刻回写 URL */
let hydrating = true;
watch([query, type], () => {
  if (!hydrating) writeUrl();
});

onMounted(() => {
  readUrl();
  hydrating = false;
  window.addEventListener('popstate', readUrl);
  /* 仅桌面（精确指针）自动聚焦；触屏设备不打断滚动、不弹键盘 */
  if (window.matchMedia('(pointer: fine)').matches) inputEl.value?.focus();
});

onBeforeUnmount(() => {
  window.removeEventListener('popstate', readUrl);
});
</script>

<template>
  <div class="search-panel">
    <div class="panel-input-row">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="9" cy="9" r="5.5" stroke="currentColor" stroke-width="1.75" />
        <path d="M13.5 13.5 17 17" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
      </svg>
      <input
        ref="inputEl"
        v-model="query"
        type="search"
        class="panel-input"
        placeholder="输入关键词，搜索文章、笔记与项目…"
        aria-label="搜索关键词"
        autocomplete="off"
        spellcheck="false"
      />
    </div>

    <!-- 结果数播报（评审报告 4.6）：加载与数量状态对读屏稳定可达 -->
    <p class="sr-only" role="status" aria-live="polite">
      {{
        loading
          ? '正在搜索…'
          : hasQuery
            ? `共 ${results.length} 条结果`
            : ''
      }}
    </p>

    <div class="panel-filters" role="group" aria-label="内容类型筛选">
      <button
        v-for="option in filters"
        :key="option"
        type="button"
        class="filter-chip"
        :class="{ 'filter-active': type === option }"
        :aria-pressed="type === option"
        @click="type = option"
      >
        {{ option }}
      </button>
    </div>

    <p v-if="unavailable" class="panel-hint" role="status">
      搜索索引尚未生成：本地执行 <code>pnpm build</code> 后再运行 <code>pnpm preview</code>
      即可体验搜索。
    </p>

    <template v-else-if="!hasQuery">
      <p class="panel-hint">支持中文与英文关键词；可按内容类型过滤。也可以从这里开始：</p>
      <ul class="panel-entries">
        <li><a href="/posts/">全部文章</a></li>
        <li><a href="/notes/">笔记</a></li>
        <li><a href="/projects/">项目</a></li>
        <li><a href="/archive/">归档</a></li>
      </ul>
    </template>

    <p v-else-if="!loading && results.length === 0" class="panel-hint" role="status">
      没有找到相关内容，换个关键词试试，或浏览<a href="/archive/">归档</a>。
    </p>

    <ul v-else class="panel-results" aria-label="搜索结果">
      <li v-for="item in results" :key="item.id">
        <a :href="item.url" class="result-link">
          <span class="result-type">{{ item.type ?? '页面' }}</span>
          <span class="result-title">{{ item.title }}</span>
          <span v-if="item.date" class="result-date">{{ item.date }}</span>
          <!-- eslint-disable-next-line vue/no-v-html -->
          <span class="result-excerpt" v-html="item.excerpt"></span>
        </a>
      </li>
    </ul>
  </div>
</template>

<style scoped>
  .search-panel {
    max-width: 42rem;
  }

  /* 仅读屏可见（结果数 aria-live 播报） */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
    border: 0;
  }

  .panel-input-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.25rem 1rem;
    border: 1px solid var(--border);
    border-radius: var(--radius-control);
    background-color: var(--surface);
    color: var(--text-muted);
  }

  .panel-input-row:focus-within {
    border-color: color-mix(in srgb, var(--cove-blue-strong) 45%, transparent);
  }

  .panel-input {
    flex: 1;
    min-width: 0;
    height: 48px;
    border: none;
    background-color: transparent;
    color: var(--text);
    font-size: 1rem;
    outline: none;
  }

  .panel-input::placeholder {
    color: var(--text-muted);
  }

  .panel-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
    margin: 0.875rem 0 1.5rem;
  }

  .filter-chip {
    min-height: 36px;
    padding-inline: 0.875rem;
    border: 1px solid var(--border);
    border-radius: 999px;
    background-color: transparent;
    color: var(--text-muted);
    font-size: 0.875rem;
    cursor: pointer;
    transition: color 120ms ease, border-color 120ms ease;
  }

  .filter-chip:hover {
    color: var(--text);
  }

  .filter-active {
    border-color: var(--cove-blue-strong);
    color: var(--cove-blue-strong);
    font-weight: 600;
  }

  .filter-chip:focus-visible,
  .result-link:focus-visible,
  .panel-entries a:focus-visible {
    outline: 2px solid var(--cove-blue-strong);
    outline-offset: 2px;
  }

  .panel-hint {
    margin: 0.5rem 0;
    color: var(--text-muted);
    font-size: 0.9375rem;
    line-height: 1.85;
  }

  .panel-hint code {
    padding: 0.0625rem 0.375rem;
    border-radius: 6px;
    background-color: var(--surface-muted);
    font-family: var(--font-mono);
    font-size: 0.8125rem;
  }

  .panel-hint a {
    color: var(--cove-blue-strong);
    text-underline-offset: 0.3em;
  }

  .panel-entries {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1.5rem;
    margin: 0.75rem 0 0;
    padding: 0;
    list-style: none;
  }

  .panel-entries a {
    color: var(--text);
    font-size: 0.9375rem;
    text-decoration-line: none;
  }

  .panel-entries a:hover {
    color: var(--cove-blue-strong);
    text-decoration-line: underline;
    text-underline-offset: 0.3em;
  }

  .panel-results {
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .result-link {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 0.375rem 0.625rem;
    align-items: baseline;
    padding: 0.875rem 0.125rem;
    border-bottom: 1px solid var(--border);
    text-decoration-line: none;
  }

  .result-type {
    padding: 0.125rem 0.5rem;
    border: 1px solid var(--border);
    border-radius: 999px;
    color: var(--text-muted);
    font-size: 0.75rem;
    white-space: nowrap;
  }

  .result-title {
    color: var(--text);
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.5;
  }

  .result-link:hover .result-title {
    color: var(--cove-blue-strong);
    text-decoration-line: underline;
    text-underline-offset: 0.3em;
  }

  .result-date {
    color: var(--text-muted);
    font-size: 0.8125rem;
    white-space: nowrap;
  }

  .result-excerpt {
    grid-column: 1 / -1;
    color: var(--text-muted);
    font-size: 0.875rem;
    line-height: 1.75;
  }

  .result-excerpt :deep(mark) {
    color: var(--cove-blue-strong);
    background-color: transparent;
    font-weight: 600;
  }
</style>
