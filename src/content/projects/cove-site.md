---
title: Cove 个人站点
summary: 你正在看的这个站点：Astro + Tailwind 的静态个人内容空间。
status: active
startedAt: '2026-08-01'
stack:
  - Astro
  - TypeScript
  - Tailwind CSS 4
  - Vue Islands
  - Pagefind
featured: true
draft: false
links:
  - label: 源码
    url: https://github.com/Frozensky-palace/cove
    type: source
relatedPosts:
  - hello-cove
  - astro-content-collections
---

## 解决什么问题

市面上的博客平台要么把内容锁在数据库里，要么把样式锁在主题里。我想要的是：内容归 Git、样式归自己、性能归静态站点，三者都不妥协。

## 我的角色

设计、开发、内容，全部一个人。这不是炫技项目，是长期使用的个人基础设施。

## 方法与技术

- **Astro 静态生成**：默认零客户端 JS，交互按 Island 按需加载；
- **Content Collections**：frontmatter 经 zod 校验，草稿与计划发布在构建期过滤；
- **Tailwind v4 CSS-first**：设计令牌是 CSS variables，深浅两套主题自动切换；
- **Pagefind**：构建后生成的静态搜索索引，支持中文分词。

## 过程与反思

第一版主题切换做了三态，实际使用中发现"跟随系统"几乎从不手动切换，于是在上线前简化成两态。这个决定让按钮、图标和引导脚本都变简单了——**功能应该跟着真实使用方式走，而不是跟着完备性走**。

上线过程里最值钱的教训都进了构建链。内链检查器上线第一天抓到 39 个断链：页脚罗列了全部分类，但某分类下唯一的文章转为草稿后，分类页不再构建——链接的存活依赖内容状态，而内容状态每天都在变。此后页脚只列有已发布内容的分类，检查器留下防复发。类似的事故还有一次：部署平台的 CI 检出 detached HEAD，分支判断脚本把生产构建误判为预览，整站被 noindex；修复后规则固定为「读不到分支就按预览处理」——宁可不被索引，不可误索引。

这些守卫如今串成一条链：类型检查 → 内容守卫 → 构建 → 生成分享图 → 搜索索引 → noindex 标记 → 产物断言 → 内链检查。本地、CI、部署平台跑的是同一条链，PR 全绿即等于可发布。

动效是另一个从"随手加过渡"长成系统的地方。边界（什么才配动）、可关闭性（`prefers-reduced-motion` 一条全局规则）、缓动令牌（两条曲线）是分三次迭代才定型的；中间踩过"退场动画从未生效"（display 同帧切换）和"入场动画钉住退场"（fill-mode 驻留）两个时序坑。

## 现状

站点随内容持续迭代，技术栈保持克制。当前每次构建约 42 个页面，其中 12 个进入搜索索引；分享卡、评论区、守卫链均已就位，欠的债只剩内容本身。
