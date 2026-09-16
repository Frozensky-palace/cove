<script setup lang="ts">
/**
 * 页头搜索对话框（指南 9.7 / 10，IMPL-008）：
 * reka-ui Dialog 承担焦点圈定与 Escape；Ctrl/Cmd+K 与 “/” 全局唤起；
 * 输入框聚焦时不重复触发 “/”。client:idle 水合，未加载 JS 时
 * 触发按钮降级为指向 /search/ 的普通链接（渐进增强，见 SiteHeader）。
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import {
  DialogRoot,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from 'reka-ui';
import { useSearch, type TypeFilter } from '@/lib/useSearch';

const open = ref(false);
const query = ref('');
const type = ref<TypeFilter>('全部');
const { results, loading, unavailable } = useSearch(query, type);

const inputEl = ref<HTMLInputElement | null>(null);
const activeIndex = ref(0);

const filters: TypeFilter[] = ['全部', '文章', '笔记', '项目'];
const hasQuery = computed(() => query.value.trim().length > 0);

watch(open, async (value) => {
  if (value) {
    query.value = '';
    activeIndex.value = 0;
    await nextTick();
    inputEl.value?.focus();
  }
});

watch(results, () => {
  activeIndex.value = 0;
});

function onKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null;
  const typing =
    !!target &&
    (target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable);

  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    open.value = !open.value;
    return;
  }
  if (event.key === '/' && !typing && !open.value) {
    event.preventDefault();
    open.value = true;
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown);
});

function onInputKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    if (results.value.length > 0) {
      activeIndex.value = (activeIndex.value + 1) % results.value.length;
    }
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    if (results.value.length > 0) {
      activeIndex.value = (activeIndex.value - 1 + results.value.length) % results.value.length;
    }
  } else if (event.key === 'Enter') {
    const item = results.value[activeIndex.value];
    if (item) {
      event.preventDefault();
      window.location.href = item.url;
    }
  }
}
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogTrigger class="search-trigger" aria-label="搜索（快捷键 Ctrl 或 Command 加 K）">
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="9" cy="9" r="5.5" stroke="currentColor" stroke-width="1.75" />
        <path d="M13.5 13.5 17 17" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
      </svg>
      <kbd class="search-kbd" aria-hidden="true">Ctrl K</kbd>
    </DialogTrigger>

    <DialogPortal>
      <DialogOverlay class="search-overlay" />
      <DialogContent class="search-dialog">
        <DialogTitle class="visually-hidden">站内搜索</DialogTitle>
        <DialogDescription class="visually-hidden">
          输入关键词搜索文章、笔记与项目，用上下键选择，回车前往。
        </DialogDescription>

        <div class="dialog-input-row">
          <svg
            width="18"
            height="18"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
            class="dialog-search-icon"
          >
            <circle cx="9" cy="9" r="5.5" stroke="currentColor" stroke-width="1.75" />
            <path d="M13.5 13.5 17 17" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
          </svg>
          <input
            ref="inputEl"
            v-model="query"
            type="search"
            class="dialog-input"
            placeholder="搜索文章、笔记、项目…"
            aria-label="搜索关键词"
            autocomplete="off"
            spellcheck="false"
            @keydown="onInputKeydown"
          />
          <span class="dialog-status" aria-live="polite">
            {{ loading ? '搜索中…' : '' }}
          </span>
        </div>

        <div class="dialog-filters" role="group" aria-label="内容类型筛选">
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

        <div class="dialog-body">
          <p v-if="unavailable" class="dialog-hint">
            搜索索引尚未生成：本地执行 <code>pnpm build</code> 后再运行 <code>pnpm preview</code>
            即可体验搜索。
          </p>

          <template v-else-if="!hasQuery">
            <p class="dialog-hint">输入关键词开始搜索，或从这些入口浏览：</p>
            <ul class="dialog-entries">
              <li><a href="/posts/">全部文章</a></li>
              <li><a href="/notes/">笔记</a></li>
              <li><a href="/projects/">项目</a></li>
              <li><a href="/archive/">归档</a></li>
            </ul>
          </template>

          <p v-else-if="!loading && results.length === 0" class="dialog-hint">
            没有找到相关内容，换个关键词试试，或浏览
            <a href="/archive/">归档</a>与<a href="/posts/">全部文章</a>。
          </p>

          <ul v-else class="dialog-results" role="listbox" aria-label="搜索结果">
            <li
              v-for="(item, index) in results"
              :key="item.id"
              role="option"
              :aria-selected="index === activeIndex"
              :class="{ 'result-active': index === activeIndex }"
            >
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
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
  /* 触发按钮：与页头搜索入口视觉一致 */
  .search-trigger {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    height: 44px;
    padding-inline: 0.75rem;
    border: 1px solid var(--border);
    border-radius: var(--radius-control);
    background-color: var(--surface);
    color: var(--text-muted);
    font-size: 14px;
    cursor: pointer;
    transition: color 150ms ease, border-color 150ms ease;
  }

  .search-trigger:hover {
    color: var(--text);
    border-color: color-mix(in srgb, var(--cove-blue-strong) 45%, transparent);
  }

  .search-kbd {
    display: none;
    padding: 0.125rem 0.375rem;
    border: 1px solid var(--border);
    border-radius: 6px;
    background-color: var(--surface-muted);
    color: var(--text-muted);
    font-family: var(--font-mono);
    font-size: 11px;
    line-height: 1.4;
  }

  @media (min-width: 640px) {
    .search-kbd {
      display: inline-block;
    }
  }

  .search-overlay {
    position: fixed;
    inset: 0;
    z-index: 100;
    background-color: color-mix(in srgb, var(--text) 32%, transparent);
    animation: search-fade 150ms ease;
  }

  .search-dialog {
    position: fixed;
    top: min(14vh, 120px);
    left: 50%;
    z-index: 101;
    display: flex;
    flex-direction: column;
    width: min(560px, calc(100vw - 2rem));
    max-height: min(64vh, 560px);
    overflow: hidden;
    border: 1px solid var(--border);
    border-radius: var(--radius-overlay);
    background-color: var(--background);
    box-shadow: 0 18px 50px -20px rgb(0 0 0 / 0.35);
    transform: translateX(-50%);
    animation: search-pop 160ms ease;
  }

  .dialog-input-row {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.875rem 1.125rem;
    border-bottom: 1px solid var(--border);
  }

  .dialog-search-icon {
    flex-shrink: 0;
    color: var(--text-muted);
  }

  .dialog-input {
    flex: 1;
    min-width: 0;
    border: none;
    background-color: transparent;
    color: var(--text);
    font-size: 1rem;
    outline: none;
  }

  .dialog-input::placeholder {
    color: var(--text-muted);
  }

  .dialog-status {
    flex-shrink: 0;
    color: var(--text-muted);
    font-size: 0.75rem;
  }

  .dialog-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
    padding: 0.625rem 1.125rem;
    border-bottom: 1px solid var(--border);
  }

  .filter-chip {
    min-height: 32px;
    padding-inline: 0.75rem;
    border: 1px solid var(--border);
    border-radius: 999px;
    background-color: transparent;
    color: var(--text-muted);
    font-size: 0.8125rem;
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
  .dialog-entries a:focus-visible {
    outline: 2px solid var(--cove-blue-strong);
    outline-offset: 2px;
  }

  .dialog-body {
    flex: 1;
    overflow-y: auto;
    padding: 0.875rem 1.125rem 1.125rem;
  }

  .dialog-hint {
    margin: 0.25rem 0;
    color: var(--text-muted);
    font-size: 0.875rem;
    line-height: 1.8;
  }

  .dialog-hint code {
    padding: 0.0625rem 0.375rem;
    border-radius: 6px;
    background-color: var(--surface-muted);
    font-family: var(--font-mono);
    font-size: 0.8125rem;
  }

  .dialog-hint a {
    color: var(--cove-blue-strong);
    text-underline-offset: 0.3em;
  }

  .dialog-entries {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1.25rem;
    margin: 0.75rem 0 0;
    padding: 0;
    list-style: none;
  }

  .dialog-entries a {
    color: var(--text);
    font-size: 0.9375rem;
    text-decoration-line: none;
  }

  .dialog-entries a:hover {
    color: var(--cove-blue-strong);
    text-decoration-line: underline;
    text-underline-offset: 0.3em;
  }

  .dialog-results {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .result-link {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 0.25rem 0.625rem;
    align-items: baseline;
    padding: 0.625rem 0.625rem;
    border-radius: var(--radius-control);
    text-decoration-line: none;
  }

  .result-active > .result-link {
    background-color: var(--surface-muted);
  }

  .result-type {
    padding: 0.0625rem 0.5rem;
    border: 1px solid var(--border);
    border-radius: 999px;
    color: var(--text-muted);
    font-size: 0.75rem;
    white-space: nowrap;
  }

  .result-title {
    color: var(--text);
    font-size: 0.9375rem;
    font-weight: 600;
    line-height: 1.5;
  }

  .result-date {
    color: var(--text-muted);
    font-size: 0.75rem;
    white-space: nowrap;
  }

  .result-excerpt {
    grid-column: 1 / -1;
    color: var(--text-muted);
    font-size: 0.8125rem;
    line-height: 1.7;
  }

  .result-excerpt :deep(mark) {
    color: var(--cove-blue-strong);
    background-color: transparent;
    font-weight: 600;
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
    border: 0;
  }

  @keyframes search-fade {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes search-pop {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(-6px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .search-overlay,
    .search-dialog {
      animation: none;
    }
  }
</style>
