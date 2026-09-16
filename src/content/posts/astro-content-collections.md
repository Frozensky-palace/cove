---
title: 用 Astro Content Collections 管理个人内容
description: 从 schema 定义到集中查询：Cove 如何用类型安全的内容层管理文章、笔记与项目，并在构建期过滤草稿与计划发布。
publishedAt: '2026-09-10'
category: web-dev
tags:
  - Astro
  - TypeScript
  - 内容管理
draft: false
featured: true
lang: zh-CN
---

Cove 的所有内容——文章、笔记、项目——都是仓库里的 Markdown 文件，由 Astro Content Collections 统一管理。这篇文章记录关键设计，也是我选择静态站点生成器的理由之一。

## 为什么选 Content Collections

个人站点最容易腐烂的地方不是样式，而是内容结构：字段随手加、日期格式随手写、草稿过滤散落在各个页面。Content Collections 用一个 schema 文件把这些问题变成构建期错误。

## Schema：把约定变成类型

`src/content.config.ts` 里为三类内容分别定义 schema：

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string().min(1),
    publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    draft: z.boolean().default(true),
  }),
});
```

frontmatter 写错任何字段，`astro build` 会直接失败并指出具体文件与字段。这比"上线之后才发现 RSS 日期格式不对"要便宜得多。

### 一个时区陷阱

日期在内容里写成 `YYYY-MM-DD` 后，我刻意没有用 `z.coerce.date()`：它按 UTC 解析，而站点按上海时区展示，序列化一天的时间差会让"9 月 10 日"变成"9 月 9 日"。直接保留字符串排序与展示，构建 RSS 时再显式补上 `+08:00` 偏移。

## 集中查询：页面不写过滤逻辑

所有页面通过 `src/lib/content.ts` 取数：

```ts
const posts = await getCollection('posts', isPublicContent);
return posts.sort(byNewest);
```

草稿与未来发布日期的判断收敛在一个 `isPublicContent` 纯函数里，本地开发可以看到带"预览"标记的草稿，生产构建则全部过滤。这样页面作者不需要记得"这里要过滤草稿吗"。

## 小结

| 关注点 | 方案 |
| --- | --- |
| 字段合法性 | zod schema，构建期报错 |
| 草稿/计划发布 | 集中纯函数 + 环境开关 |
| 日期一致性 | 字符串 + 显式时区 |
| 查询复用 | 单一 content.ts 模块 |

内容系统是站点里最难迁移的部分，值得在第一天就把它做对。[^why]

[^why]: 事实上 Cove 的第一版内容 schema 在写作本文时已经经历了三次微调，全部由构建期校验兜底，没有产生过脏数据。
