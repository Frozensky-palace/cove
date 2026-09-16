---
title: Tide 潮汐可视化
summary: 用 Canvas 画的一片可以发呆的海：参数化波浪、可调风速与日落色。
status: completed
startedAt: '2025-11-01'
completedAt: '2026-03-01'
stack:
  - Canvas 2D
  - TypeScript
  - Vite
draft: false
---

## 解决什么问题

想给桌面配一个"活的"壁纸页面：低帧率的动态海面，不喧宾夺主，最好还能随手调出日落色。

## 方法与技术

- 波浪用多组正弦叠加驱动 Canvas 路径，参数（波长、振幅、速度）分层；
- 颜色系统与 Cove 令牌同源，日落模式把渐变终点从蓝推到粉；
- 帧率限制在 30fps，`prefers-reduced-motion` 时完全静止。

## 结果与反思

最终成品比预期简单一个数量级——去掉粒子、去掉反射之后反而更像海。教训：**氛围靠留白而不是细节堆叠**。

## 相关链接

成品曾作为 Screenshots 周末项目分享，源码未公开（代码很朴素，效果全靠调参）。
