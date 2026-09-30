<script setup lang="ts">
/**
 * /search/ 页内联搜索面板（指南 9.7）：可直达、可链接分享的完整搜索页。
 * 与页头 SearchDialog 共用 useSearch；本组件聚焦后直接展示结果。
 * IMPL-056（评审报告 4.6）：q/type 同步到 URL（replaceState），刷新、
 * 复制链接与前进后退均可恢复；autofocus 仅在精确指针（桌面）设备
 * 生效，避免手机打开搜索页直接弹键盘；结果数经 aria-live 播报。
 *
 * 评审整改（BLOG-FRONTEND-REVIEW-2026-09-27）：
 * - F03：按真实总数播报并区分「找到 N 条 / 已显示 M 条」，超出部分
 *   经「加载更多」按页追加，全部结果可达；
 * - F04：索引不可用提示面向读者并可重试，pnpm 命令说明仅开发环境展示；
 * - F06：readUrl 每次完整映射 URL → 状态（缺省/非法值恢复默认），
 *   writeUrl 保留既有 history.state 与 hash，不再整体覆盖。
 */
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useSearch, type TypeFilter } from '@/lib/useSearch';

const query = ref('');
const type = ref<TypeFilter>('全部');
const { results, total, loading, loadingMore, unavailable, loadMore, retry, dispose } = useSearch(
  query,
  type,
);

/* 评审 F04：失败提示面向读者；pnpm build/preview 说明仅开发环境展示 */
const isDev = import.meta.env.DEV;

const filters: TypeFilter[] = ['全部', '文章', '笔记', '项目'];
const hasQuery = computed(() => query.value.trim().length > 0);
const inputEl = ref<HTMLInputElement | null>(null);

/** 从 URL 完整恢复查询状态（刷新 / 分享链接 / 前进后退，评审 F06）：
    缺省 q 或非法 type 一律映射回默认值，而不是保留上一次的状态 */
function readUrl(): void {
  const params = new URLSearchParams(window.location.search);
  const t = params.get('type') as TypeFilter | null;
  query.value = params.get('q') ?? '';
  type.value = t && filters.includes(t) ? t : '全部';
}

/** 查询条件写入 URL（replaceState：不污染历史，URL 即可分享）；
    保留既有 history.state（ClientRouter 依赖）与 hash（评审 F06） */
function writeUrl(): void {
  const params = new URLSearchParams(window.location.search);
  const q = query.value.trim();
  if (q) params.set('q', q);
  else params.delete('q');
  if (type.value !== '全部') params.set('type', type.value);
  else params.delete('type');
  const qs = params.toString();
  window.history.replaceState(
    window.history.state,
    '',
    `${window.location.pathname}${qs ? `?${qs}` : ''}${window.location.hash}`,
  );
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
  /* 卸载时清理防抖计时器并作废在途响应（评审 F05/D12） */
  dispose();
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

    <!-- 结果数播报（评审报告 4.6 / F03）：按真实总数播报并区分已显示条数 -->
    <p class="sr-only" role="status" aria-live="polite">
      {{
        loading
          ? '正在搜索…'
          : hasQuery && total > 0
            ? `共找到 ${total} 条结果${results.length < total ? `，已显示 ${results.length} 条` : ''}`
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
      搜索暂时不可用，可能是网络原因。
      <button type="button" class="retry-link" @click="retry">重试</button>，
      或从<a href="/posts/">文章</a>、<a href="/archive/">归档</a>继续浏览。
      <template v-if="isDev">
        本地开发需先生成索引：执行 <code>pnpm build</code> 后运行 <code>pnpm preview</code>。
      </template>
    </p>

    <template v-else-if="!hasQuery">
      <p class="panel-hint">输入关键词搜索，或从这里开始：</p>
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

    <!-- 加载更多（评审 F03）：完整页全部结果可达；详情按页取，不一次取完 -->
    <div v-if="!unavailable && !loading && results.length < total" class="panel-more">
      <button type="button" class="load-more" :disabled="loadingMore" @click="loadMore">
        {{ loadingMore ? '正在加载…' : `加载更多（已显示 ${results.length} / ${total} 条）` }}
      </button>
    </div>
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
    transition: color var(--motion-fast) ease, border-color var(--motion-fast) ease;
  }

  .filter-chip:hover {
    color: var(--text);
  }

  /* 触屏（粗指针）：高频筛选的触控目标提升到 44px 并加大间距（评审 L03）；
     桌面精确指针维持紧凑视觉，不放大 */
  @media (pointer: coarse) {
    .panel-filters {
      gap: 0.5rem;
    }

    .filter-chip {
      min-height: 44px;
    }
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

  /* 重试动作：链接样式的按钮（评审 F04——失败提示需可直接操作） */
  .retry-link {
    padding: 0;
    border: none;
    background: none;
    color: var(--cove-blue-strong);
    font: inherit;
    text-decoration: underline;
    text-underline-offset: 0.3em;
    cursor: pointer;
  }

  .panel-more {
    display: flex;
    justify-content: center;
    margin-top: 1.25rem;
  }

  .load-more {
    min-height: 44px;
    padding-inline: 1.25rem;
    border: 1px solid var(--border);
    border-radius: 999px;
    background-color: transparent;
    color: var(--text);
    font-size: 0.875rem;
    cursor: pointer;
    transition: color var(--motion-fast) ease, border-color var(--motion-fast) ease;
  }

  .load-more:hover:not(:disabled) {
    color: var(--cove-blue-strong);
    border-color: color-mix(in srgb, var(--cove-blue-strong) 45%, transparent);
  }

  .load-more:disabled {
    color: var(--text-muted);
    cursor: default;
  }

  .load-more:focus-visible {
    outline: 2px solid var(--cove-blue-strong);
    outline-offset: 2px;
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
    grid-template-columns: auto minmax(0, 1fr) auto;
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

  /* 评审 L03：窄屏日期移到标题次行，标题占主要列——「类型/标题/日期」
     三列在 ~480px 以下互相挤压，标题是读者要读的主信息 */
  @media (max-width: 479px) {
    .result-link {
      grid-template-columns: auto minmax(0, 1fr);
    }

    .result-date {
      grid-column: 2;
    }
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
