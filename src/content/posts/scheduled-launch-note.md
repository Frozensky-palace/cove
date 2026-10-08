---
title: 「计划发布」这篇文章的日期在未来
description: publishedAt 晚于当前日期的计划发布内容，应与草稿一样被生产构建排除。
publishedAt: '2027-01-01'
category: writing
tags:
  - 测试
draft: true
lang: zh-CN
---

这篇文章的 `publishedAt` 是未来日期，且 `draft: true`。生产构建按两条规则都不应输出它；本地开发预览中带「预览内容」标记可见。

这是「计划发布」过滤的开发样本，长期保持 `draft: true`，永不发布。如果你在生产站点读到这段话，说明草稿或未来日期过滤失效了。
