---
title: YAML 裸日期是个时区陷阱
publishedAt: '2026-09-20'
tags:
  - YAML
  - 时区
draft: true
---

frontmatter 里写 `publishedAt: 2026-09-20`（不加引号），YAML 解析出来的不是字符串而是 Date 对象——schema 的字符串正则直接报错。加了引号才是字符串。

更隐蔽的是第二层：js-yaml 对裸日期按 UTC 零点解析。想把它变回字符串，取 UTC 分量（getUTCFullYear 系列）在任何本机时区都能还原原日期；取本地分量（getFullYear）在东八区会把日期变成前一天。

所以在 schema 层做 preprocess：Date 就取 UTC 分量规范化成 `YYYY-MM-DD`，字符串仍走原正则。CMS 生成的日期格式没法配置，schema 容错是唯一可靠的层。
