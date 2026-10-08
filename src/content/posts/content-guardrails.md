---
title: 内容质量门禁：从 Schema 到 CI 的四道关
description: 个人博客也需要 CI 门禁：Cove 用四道关卡保证"坏内容不可能被发布"——schema 校验、源码守卫、产物断言与全站内链检查，以及它们各自抓住过的真实事故。
publishedAt: '2026-09-24'
category: tech
tags:
  - 内容管理
  - 工程实践
  - CI
draft: true
lang: zh-CN
---

<!-- 初稿（未发布）：供温晚安改定后翻转 draft -->

[上一篇文章](/posts/astro-content-collections/)讲了 Cove 的内容模型，这篇讲模型之外的东西：怎么保证这个模型**永远不被绕过**。答案是四道门禁，每道都源于一次真实事故。

## 第一道：Schema——让非法数据无法存在

`content.config.ts` 用 zod 的 `.strict()` 模式定义全部五类内容的 schema。strict 意味着 frontmatter 里多写一个字段都是构建错误，拼错字段名（`publishdAt`）不会静默丢数据，而是直接失败。

几个值得展开的校验：

```ts
// 日期：字符串而非 Date，理由见姊妹篇
const dateString = z.preprocess(
  (value) => (value instanceof Date ? /* 取 UTC 分量规范化 */ value : value),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
);

// 分类与作者：枚举即目录，删除仍被引用的分类 = 构建失败
category: z.enum(categoryKeys),
author: z.enum(authorKeys).default('wen-wanan'),

// 修订时间不得早于发布时间
.refine((e) => !e.updatedAt || e.updatedAt >= e.publishedAt)
```

`z.enum` 的来源是内容目录本身：分类文件、值守者档案都是 content collection，taxonomy 映射构建期派生。**引用完整性由构建器保证**，这是任何 lint 都给不了的。

## 第二道：源码守卫——语义层面的闸门

Schema 管不了"合法但不应发布"的内容，比如叫 `test-xxx.md` 的演示文章。`scripts/content-guard.mjs` 在构建前扫描全部内容文件：**文件名、title、description、tags 命中测试标记（test / 测试 / 验收）的内容，除非是草稿，否则构建失败**。

唯一豁免口是 `draft: true`。计划发布（`publishedAt` 在未来）不豁免：未来日期确实能把它挡在生产产物之外，但挡不了一辈子——日期一到，测试内容就自动"转正"。守卫宁可在构建期就拦下，也不赌没人忘记改日期。

## 第三道：产物断言——不信任上游

源码层守卫有一个盲区：它验证的是"过滤规则被执行了"，但过滤规则本身如果被改坏（比如有人改了 `getStaticPaths` 忘了传过滤器），源码守卫照样全绿。所以还有第二层：**构建完成后直接扫 `dist/`**。

`scripts/dist-guard.mjs` 做两件事：

1. 收集全部"仅预览内容"的 id（与生产过滤同口径：草稿 + 未来日期）；
2. 断言这些 id 既不出现在 dist 的任何文件路径里，也不出现在任何 HTML 的链接里。

泄漏一个就退出码 1，构建失败。它和源码守卫的关系是防御纵深：一个守规则，一个验结果，同时被绕过的概率远小于单层。

同一层还有 `noindex-preview.mjs`：非 main 分支的构建向 `dist/_headers` 注入 `X-Robots-Tag: noindex`。它有过一次真实翻车——部署平台的 CI 检出的是 detached HEAD，读 git 分支名得到 `"HEAD"`，失败安全逻辑把生产构建误判成了预览，整个站点被 noindex。修复是优先读平台注入的分支变量，读不到仍按预览处理：**宁可不被索引，不可误索引**。失败安全的方向要在设计时想清楚，因为出事时你没机会选方向。

## 第四道：内链检查——真实事故的直接产物

最后一道是全站内链检查器：扫描 dist 全部 HTML 的 `href`/`src`，跳过外链与特殊协议，逐个验证目标产物存在（含目录式 index、`.html` 后缀、百分号编码三种形态）。

它上线第一天抓到 39 个断链，全部是同一个根因：页脚罗列了全部分类，但某分类下唯一的文章被转为草稿后，该分类页不再构建——**链接的存活依赖内容的状态，而内容状态每天都在变**。修复是让页脚只罗列有已发布内容的分类，检查器则留下防止同类问题复发。

这类问题人工永远查不全：39 个断链分布在 8 个页面的页脚上，而"分类页是否构建"取决于当天哪篇是草稿。**凡是状态会漂移的正确性，都必须机器断言。**

## 串联：一条命令，处处同跑

四道关串进同一条构建链：

```text
astro check → content-guard → astro build
→ generate-og-images → pagefind
→ noindex-preview → dist-guard → link-check
```

本地 `pnpm build`、部署平台、GitHub Actions 跑的是同一条链。PR 上 CI 全绿，合并即是发布——没有"CI 过了但部署挂了"的第三种状态。

## 结语

四道关的共同哲学：**把"别忘了"变成"过不去"**。Code review 能拦住大部分问题，但内容站点的特殊性在于破坏者常常是作者自己——一次手滑的 frontmatter、一篇忘了改的草稿、一个被转存的文章。门禁不审查内容好坏，只保证结构正确性；而结构正确性是访客永远看不见、一旦缺失处处都感觉得到的那种东西。
