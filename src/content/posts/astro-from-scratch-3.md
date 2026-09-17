---
title: 'Astro 从零到一（三）：布局、主题与部署'
description: '系列完结篇：双栏阅读布局的网格实现、主题切换的防闪烁方案，以及静态产物的部署清单。'
publishedAt: '2026-09-16'
category: web-dev
tags:
  - Astro
  - CSS
  - 系列测试
draft: false
lang: zh-CN
series: Astro 从零到一
---

<!-- 测试内容：验收系列功能后可删除 astro-from-scratch-*.md 与 cove-retro-solo.md -->

系列的最后一篇收尾：把内容放进合适的布局，处理好主题切换，然后发布出去。

## 阅读布局：网格而不是魔法

文章页用 CSS Grid 的 `grid-template-areas` 划出内容列与侧栏目录列，内容列宽度与正文行宽对齐。粘性目录只需要一行 `position: sticky`，不依赖任何 JS 滚动监听。

## 主题切换的防闪烁

深色模式闪烁的根因是主题状态在 HTML 解析之后才生效。解法是在 `<head>` 里放一段内联脚本，首帧之前读本地存储并打上类名。注意这段脚本要尽量小，且不能用模块异步加载。

## 部署清单

- 产物是纯静态目录，任何对象存储 + CDN 都能托管；
- 搜索索引（如 Pagefind）在构建后生成，无需服务端；
- 提交前跑一遍 `astro check`，内容 schema 的错误在本地就该拦下。

至此，从选型、内容建模到布局与部署的链路完整闭环。系列暂时完结，后续有新的实践会以番外篇补充。
