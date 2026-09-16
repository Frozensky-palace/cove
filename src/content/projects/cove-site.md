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
    url: https://github.com/cove/example-repo
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

另一个教训是端口统一：dev 与 preview 曾配置在不同端口，验收时经常对错服务，统一成 4321 后世界安静了。

## 现状

站点随内容持续迭代，技术栈保持克制。
