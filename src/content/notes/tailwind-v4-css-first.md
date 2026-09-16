---
title: Tailwind v4 的 CSS-first 配置更顺手了
publishedAt: '2026-09-14'
tags:
  - CSS
  - Tailwind
draft: false
---

没有 `tailwind.config.js` 之后，设计令牌直接活在 CSS variables 里，`@theme inline` 一映射就能生成工具类。

深色模式用 `@custom-variant dark` 指向 `.dark` 类，和三态/两态切换脚本解耦得很干净。
