---
title: CSP 里的 unsafe-inline：一场诚实的折衷
publishedAt: '2026-09-19'
tags:
  - 安全
  - CSP
draft: true
---

静态站点生成器总要在页面里内联几段小脚本——主题恢复、加载页开关，都要求在首绘前执行，外链文件做不到。于是 CSP 的 script-src 要么放行 `unsafe-inline`，要么上 nonce/hash，而 SSG 的内联脚本内容随构建变化，hash 每次都得重算。

Cove 的选择是放行 `unsafe-inline`，同时把其余指令收紧到最小面：connect、frame、img 逐一枚举。诚实地说这是折衷：内联脚本被 XSS 利用时 CSP 不设防，但静态站点没有注入面（无用户输入、无服务端模板渲染用户数据），这条风险窄到可以接受。安全配置没有满分答卷，只有与架构匹配的取舍。
