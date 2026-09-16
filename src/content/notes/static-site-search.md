---
title: 静态站点搜索的最小方案
publishedAt: '2026-09-08'
tags:
  - 搜索
  - Pagefind
draft: false
---

静态站点的搜索不需要服务：构建后跑一次 Pagefind，把索引当成静态资源发布，浏览器里全部搞定。中文分词用 extended binary 就够。

关键是划定索引边界——只索引正文区域，导航、页脚和相关推荐全部排除，否则搜索摘要全是噪音。
