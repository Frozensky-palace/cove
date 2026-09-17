---
title: 'Astro 从零到一（二）：用内容集合管理文章'
description: '系列第二篇：Content Collections 的类型安全数据模型、日期约定与查询层设计，把内容当作代码一样对待。'
publishedAt: '2026-09-15'
category: web-dev
tags:
  - Astro
  - 内容管理
  - 系列测试
draft: false
lang: zh-CN
series: Astro 从零到一
---

<!-- 测试内容：验收系列功能后可删除 astro-from-scratch-*.md 与 cove-retro-solo.md -->

上一篇定了架构，这一篇解决内容从哪来。Astro 的 Content Collections 提供了一套类型安全的内容管线：frontmatter 用 Zod schema 约束，构建期就能拦住非法数据。

## Schema 即契约

把每类内容的字段写成 schema，编辑器会获得完整的类型提示，写错字段名或日期格式会在 `astro check` 阶段直接报错。这比"靠肉眼检查 frontmatter"可靠得多。

## 日期为什么用字符串

一个容易踩的坑：Zod 的 `z.coerce.date()` 按 UTC 解析，序列化时会产生日期偏移。约定一律写 `YYYY-MM-DD` 字符串，展示时再按明确时区解释，字典序排序还恰好等于时间序。

## 查询层集中化

所有页面从统一的 `lib/content.ts` 取数据：草稿过滤、未来日期判断、排序与聚合都只写一份。页面不重复实现过滤逻辑，预览开关也集中在一处。

## 小结

内容模型定下来之后，页面层只剩纯粹的展示问题。下一篇讲布局与样式系统，把这套内容"穿"起来。
