---
title: 从零到 cove.xin：我是怎么用 Astro 搭起这个站点的
description: 选型、工程结构与部署链的完整复盘：为什么内容型站点值得静态优先，Cove 的目录组织、取数约定与质量门禁是如何长出来的，以及哪些决定我到现在仍然满意。
publishedAt: '2026-09-22'
category: engineering
tags:
  - Astro
  - 静态站点
  - 建站
draft: true
lang: zh-CN
---

<!-- 初稿（未发布）：供温晚安改定后翻转 draft -->

这个站点从第一个 commit 到 cove.xin 上线，前后大概五周。这篇文章把过程中的关键决定串起来讲一遍——不是教程，更像一份带反思的施工记录。内容建模的细节我在[另一篇文章](/posts/astro-content-collections/)里单独写过，这里不重复。

## 选型：读写比决定架构

博客的读写比接近无限大：一次构建，无数次读取。内容更新是低频事件（我写完才发布），而阅读是高频事件（任何人随时打开）。把渲染成本从每次阅读挪到每次发布，是这类站点最划算的一笔账。

所以候选方案从一开始就只剩静态站点生成器。选 Astro 而不是 Hugo 或 Eleventy，主要因为三点：

1. **内容集合是一等公民**。schema 校验、类型安全的取数、构建期报错，这些对"内容结构会不断演进"的个人站点是刚需；
2. **默认零 JS，交互按岛屿注水**。我只有两个真正需要交互的地方——搜索弹窗和移动端导航，其余页面就是 HTML；
3. **可以用自己已经会的技术栈写岛屿**。Astro 的岛屿不挑框架，我用 Vue 写了搜索弹窗，其余全是 `.astro` 组件。

代价也有：为了全局加载体验引入了 ClientRouter，全站多了约 10KB 路由 JS，超出了我最初"首页初始 JS 只包含主题脚本"的预算。这笔账我记在设计决策日志里，至今认为值得——整页白屏和换页闪烁对阅读体验的伤害比 10KB 大得多。

## 工程结构：约定比灵活性重要

Cove 的 `src/` 结构：

```text
src/
├─ content/          # 全部内容：posts / notes / projects / categories / authors / milestones
├─ content.config.ts # zod schema，内容结构的唯一裁判
├─ data/             # 站点配置与派生数据（site / taxonomy / authors / integrations）
├─ lib/              # 构建期工具：content.ts 取数、urls.ts 链接、seo.ts 结构化数据
├─ components/       # base（原语）/ content（内容展示）/ navigation / integrations
├─ layouts/          # Base / Content / Article 三层
└─ pages/            # 路由，只做拼装，不放业务逻辑
```

几条刻意维持的约定：

**数据单源**。分类和值守者（站内的虚构署名角色）都是 content collection，`taxonomy.ts` 和 `authors.ts` 在构建期从目录派生出枚举与映射。删除一个仍被文章引用的分类？`z.enum` 校验直接让构建失败。坏链接在源头上就不可能被发布。

**页面不写过滤逻辑**。草稿过滤、排序、系列聚合全部收敛在 `lib/content.ts`，页面只调 `getPublishedPosts()` 这类函数。生产过滤逻辑写错过一次和写错十次的位置是一样的——收敛它。

**日期永远是字符串**。frontmatter 里的日期按 `YYYY-MM-DD` 书写并保留字符串类型，排序用字典序（与 ISO 日期序一致），展示时才格式化。不用 `z.coerce.date()`，因为它按 UTC 解析，而站点按上海时区展示，一天的时间差会让"9 月 10 日"变成"9 月 9 日"。

## 部署：构建链就是质量门禁

生产环境是 Cloudflare Workers 静态资产，`main` 分支推送即自动构建部署。整个 `pnpm build` 是一条守卫链：

```json
{
  "build": "astro check && node scripts/content-guard.mjs && astro build && node scripts/generate-og-images.mjs && pagefind --site dist && node scripts/noindex-preview.mjs && node scripts/dist-guard.mjs && node scripts/link-check.mjs"
}
```

从左到右：类型检查 → 源码层内容守卫（测试内容不得进生产）→ 构建 → 生成社交分享图 → 搜索索引 → 非 main 分支注入 noindex → 产物层守卫（草稿不得泄漏进 dist）→ 全站内链检查。任何一环失败，构建即止，坏产物不会被部署。同样的链在 GitHub Actions 上对每个 PR 再跑一遍。

这套门禁不是一开始就有的，是每次真实事故后补一道：内链检查器上线第一天就抓到了 39 个断链——页脚罗列了全部分类，但某个分类下已发布的文章被转成草稿后，分类页不再构建。人工检查这类问题永远靠运气。

## 回顾：做对了什么，会改什么

做对了的：

- **第一天就把内容 schema 做对**。内容系统是站点里最难迁移的部分，五周里 schema 经历了几次微调，全部由构建期校验兜底，没有产生过脏数据；
- **设计令牌先行**。颜色、圆角、缓动曲线全部是 CSS 变量，后来做深色模式和动效系统化时几乎没有返工；
- **决策日志**。每个实施决策写一行"是什么、为什么、影响面"，这篇文章的一半素材直接来自它。

会改的：

- 加载体验（ClientRouter + 品牌加载页）应该在有真实内容之后再上，动效抛光花了比内容写作多得多的时间——这正是独立博客的经典陷阱；
- 有些组件抽象来得太早。署名卡五轮修改里，前两轮改的都是抽象边界而不是样式，如果第一版就按"先做具体版式，出现第三次重复再抽象"来，会更快收敛。

下一步是把欠的债还上：这篇以及仓库里其他几篇草稿，就是这个计划的一部分。
