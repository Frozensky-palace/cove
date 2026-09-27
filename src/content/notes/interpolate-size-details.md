---
title: 'height: auto 过渡的零 JS 时代'
publishedAt: '2026-09-17'
tags:
  - CSS
  - 动效
draft: true
---

折叠面板展开动画的老问题是 `height: auto` 不可过渡，历来要么 JS 算高度，要么 grid-template-rows 0fr→1fr 的 hack。现在有了正解：

```css
html {
  interpolate-size: allow-keywords;
}
details::details-content {
  block-size: 0;
  transition: block-size 300ms, content-visibility 300ms;
  overflow: clip;
}
```

`<details>` 原生展开也能丝滑过渡，零 JS、键盘可访问、客户端路由兼容。浏览器不支持时就是普通的瞬时展开——渐进增强的本义。Cove 的折叠目录、系列列表都在用它。

唯一的遗憾是它还在 Chromium 阵营（129+），Firefox/Safari 下自动退化。但退化路径就是"没有动画"，不是"坏掉"，这就是可接受的代价。
