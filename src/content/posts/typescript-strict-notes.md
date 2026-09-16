---
title: TypeScript strict 模式下的三个习惯
description: 满足 noImplicitAny 只是开始：类型收窄、不可变优先、把边界做薄，是我在 strict 模式下沉淀的三个日常习惯。
publishedAt: '2026-08-20'
category: engineering
tags:
  - TypeScript
  - 工程实践
draft: false
lang: zh-CN
---

打开 `strict` 只是买了一张门票，真正受益来自日常习惯。这篇文章记录三个让我少走弯路的做法。

## 一、先收窄，再使用

类型收窄发生在使用之前。判空、判 undefined、判联合分支，都应贴着使用点：

```ts
function formatLabel(id: string | undefined): string {
  const label = labels[id];
  if (!label) return fallback(id);
  return label.trim(); // 这里已经是 string
}
```

与其到处写非空断言 `!`，不如把"不可能为空"的证据写在收窄逻辑里。

## 二、不可变优先

默认 `const`，需要修改时用展开而不是原地变更。不可变数据让构建期派生逻辑（排序、过滤、聚合）可以放心共享引用：

```ts
const sorted = [...posts].sort(byNewest);
```

## 三、把边界做薄

与外部世界打交道的地方（frontmatter、环境变量、API 响应）用 schema 校验一次，内部就只需要处理已验证的类型。这也是 Content Collections 的思路：验证集中在边界，核心代码保持干净。

这三个习惯没有一个是"高级技巧"，但组合起来，绝大多数类型错误在编写时就被编辑器标红了。
