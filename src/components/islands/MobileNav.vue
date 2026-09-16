<script setup lang="ts">
/**
 * 移动导航抽屉（指南 9.1 / 10，ADR-005）：
 * 以 reka-ui Dialog 原语实现 Sheet 行为（焦点圈定、Esc 关闭、背景滚动锁定、
 * aria-modal 等），样式改为 Cove 主题令牌。仅窄屏经 client:media 水合。
 */
import {
  DialogRoot,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from 'reka-ui';

interface NavItem {
  label: string;
  href: string;
  current?: boolean;
}

defineProps<{
  items: NavItem[];
  secondary?: NavItem[];
}>();
</script>

<template>
  <DialogRoot>
    <DialogTrigger class="mobile-nav-trigger" aria-label="打开导航菜单">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M3 5.5h14M3 10h14M3 14.5h14"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
        />
      </svg>
    </DialogTrigger>

    <DialogPortal>
      <DialogOverlay class="sheet-overlay" />
      <DialogContent class="sheet-content">
        <div class="sheet-head">
          <DialogTitle class="sheet-title">站点导航</DialogTitle>
          <p class="sheet-tagline">小海湾里的文字、项目与技术分享</p>
          <DialogClose class="sheet-close" aria-label="关闭菜单">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M4 4l8 8M12 4l-8 8"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
              />
            </svg>
          </DialogClose>
        </div>

        <DialogDescription class="visually-hidden">
          Cove 的一级导航与内容发现入口，点击任意链接将前往对应页面。
        </DialogDescription>

        <nav class="sheet-nav" aria-label="移动端主导航">
          <ul>
            <li v-for="item in items" :key="item.href">
              <DialogClose as-child>
                <a
                  :href="item.href"
                  class="sheet-link"
                  :aria-current="item.current ? 'page' : undefined"
                >
                  {{ item.label }}
                </a>
              </DialogClose>
            </li>
          </ul>
        </nav>

        <div v-if="secondary && secondary.length" class="sheet-secondary">
          <DialogClose as-child>
            <a
              v-for="entry in secondary"
              :key="entry.href"
              :href="entry.href"
              class="sheet-sublink"
            >
              {{ entry.label }}
            </a>
          </DialogClose>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
  /* 触发按钮：仅窄屏可见；no-js 场景由 SiteHeader 的全局规则隐藏并保留原生链接 */
  .mobile-nav-trigger {
    display: none;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border: 1px solid var(--border);
    border-radius: var(--radius-control);
    background-color: transparent;
    color: var(--text-muted);
    cursor: pointer;
    transition: color 150ms ease, border-color 150ms ease;
  }

  .mobile-nav-trigger:hover {
    color: var(--text);
    border-color: color-mix(in srgb, var(--cove-blue-strong) 45%, transparent);
  }

  .mobile-nav-trigger:focus-visible,
  .sheet-close:focus-visible,
  .sheet-link:focus-visible,
  .sheet-sublink:focus-visible {
    outline: 2px solid var(--cove-blue-strong);
    outline-offset: 2px;
  }

  @media (max-width: 899px) {
    .mobile-nav-trigger {
      display: inline-flex;
    }
  }

  .sheet-overlay {
    position: fixed;
    inset: 0;
    z-index: 90;
    background-color: color-mix(in srgb, var(--text) 32%, transparent);
    animation: sheet-fade 180ms ease;
  }

  .sheet-content {
    position: fixed;
    inset-block: 0;
    left: 0;
    z-index: 95;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: min(320px, 85vw);
    padding: 1.25rem 1.25rem 2rem;
    border-right: 1px solid var(--border);
    background-color: var(--background);
    animation: sheet-in 200ms ease;
  }

  .sheet-head {
    position: relative;
    padding-inline: 0.25rem;
  }

  .sheet-title {
    font-size: 1.0625rem;
    font-weight: 700;
    color: var(--text);
  }

  .sheet-tagline {
    margin: 0.375rem 0 0;
    color: var(--text-muted);
    font-size: 0.8125rem;
    line-height: 1.6;
  }

  .sheet-close {
    position: absolute;
    top: -0.375rem;
    right: -0.25rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border: none;
    border-radius: var(--radius-control);
    background-color: transparent;
    color: var(--text-muted);
    cursor: pointer;
    transition: color 150ms ease, background-color 150ms ease;
  }

  .sheet-close:hover {
    color: var(--text);
    background-color: var(--surface-muted);
  }

  .sheet-nav ul {
    display: grid;
    gap: 0.25rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .sheet-link {
    display: flex;
    align-items: center;
    min-height: 44px;
    padding-inline: 0.75rem;
    border-radius: var(--radius-control);
    color: var(--text);
    font-size: 1rem;
    text-decoration-line: none;
    transition: background-color 150ms ease;
  }

  .sheet-link:hover {
    background-color: var(--surface-muted);
  }

  .sheet-link[aria-current='page'] {
    font-weight: 600;
    color: var(--cove-blue-strong);
    text-decoration-line: underline;
    text-decoration-thickness: 2px;
    text-underline-offset: 0.45em;
  }

  .sheet-secondary {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1.25rem;
    margin-top: auto;
    padding-top: 1rem;
    border-top: 1px solid var(--border);
  }

  .sheet-sublink {
    color: var(--text-muted);
    font-size: 0.875rem;
    text-decoration-line: none;
  }

  .sheet-sublink:hover {
    color: var(--cove-blue-strong);
    text-decoration-line: underline;
    text-underline-offset: 0.3em;
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

  @keyframes sheet-fade {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes sheet-in {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .sheet-overlay,
    .sheet-content {
      animation: none;
    }
  }
</style>
