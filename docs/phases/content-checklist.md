# Cove 真实测试内容与品牌资产清单

> Phase 0 交付物。**2026-09-24 复核**：下文「品牌资产」与「站点信息确认」
> 已全部落地——域名与作者名见 IMPL-045/047，品牌视觉定稿见 IMPL-022~037，
> 社交链接见 IMPL-047/055。本文保留作历史记录与字段速查，不再作为待办清单维护。
> 当前内容待办见 `docs/reviews/BLOG-PROJECT-REVIEW.md` 路线图。原用途：
>
> 1. 收集开发与验收所需的真实内容（指南 18.1、20 节）。
> 2. 收集品牌资产，替换临时占位。
>
> 内容录入前请先阅读指南第 11 节（内容模型）。字段要求摘录见下表。

## 一、文章（Posts，目标 3–5 篇）

| # | 主题 / 暂定标题 | slug 建议（小写 ASCII + 连字符） | 分类 | 标签 | 状态 |
| --- | --- | --- | --- | --- | --- |
| 1 | | | | | ☐ 待收集 |
| 2 | | | | | ☐ 待收集 |
| 3 | | | | | ☐ 待收集 |
| 4 | | | | | ☐ 待收集（可选） |
| 5 | | | | | ☐ 待收集（可选） |

其中至少 1 篇为「富文本测试文章」：覆盖标题层级、列表、引用、代码块、表格、图片和脚注（Phase 2 验收要求）。

必填字段：`title`、`description`（40–160 中文字符）、`publishedAt`（`YYYY-MM-DD`）、`category`（单一主分类）、`tags`（1–5 个）、`draft`（默认 `true`，发布时改 `false`）、`lang`（`zh-CN` / `en`）。
可选字段：`updatedAt`、`featured`、`cover` + `coverAlt`（信息性封面必填 alt）、`canonicalURL`、`series`。

## 二、笔记（Notes，目标 1–2 条）

| # | 内容摘要 | 日期 | 标签 | 状态 |
| --- | --- | --- | --- | --- |
| 1 | | | | ☐ 待收集 |
| 2 | | | | ☐ 待收集（可选） |

必填字段：`publishedAt`、`draft`、`lang`（默认 `zh-CN`）。`title` 可选；`tags` 0–5 个。

## 三、项目（Projects，目标 1–2 个）

| # | 项目名称 | 一句话介绍 | 状态（active/completed/archived） | 相关文章 | 状态 |
| --- | --- | --- | --- | --- | --- |
| 1 | | | | | ☐ 待收集 |
| 2 | | | | | ☐ 待收集（可选） |

必填字段：`title`、`summary`、`status`、`draft`。可选：`startedAt`、`completedAt`、`stack`、`cover`、`featured`、`links`（label/url/type）、`relatedPosts`（需校验引用存在）。

## 四、品牌资产

| 资产 | 说明 | 存放位置 | 状态 |
| --- | --- | --- | --- |
| Cove 标志源文件 | 矢量源文件（蓝粉配色），导航与页脚使用其 SVG 导出 | `src/assets/brand/` | ✅ 已定稿（IMPL-022~037） |
| 标志导出（浅/深色） | 供 `SiteHeader` / `SiteFooter` 内联或引用的 SVG | `src/assets/brand/` | ✅ 已定稿（IMPL-022~037） |
| favicon | 基于 `public/favicon.svg` 临时占位替换 | `public/` | ✅ 已替换（含 `public/cove-icon.svg`） |
| 首页海湾插画 | 低饱和、少细节、大留白（指南 8.5） | `src/assets/illustrations/` | ✅ 已提供（Phase 3） |

约束提醒：蓝粉渐变只用于品牌标志、当前导航细线或一处关键视觉（指南 8.2）。

## 五、站点信息确认

| 项 | 占位值（`src/data/site.ts`） | 正式值 | 状态 |
| --- | --- | --- | --- |
| 正式域名 | `https://cove.example.com` | `https://cove.xin` | ✅ 已确认（IMPL-045） |
| 作者名 | `（待确认）` | 温晚安 | ✅ 已确认（IMPL-047） |
| 站点简介 | 临时占位文案 | 「小海湾里的文字、项目与技术分享」 | ✅ 已定稿 |
| 社交链接 | 空数组 | 邮箱 + GitHub（`siteConfig.social`） | ✅ 已确认（IMPL-047/055） |

## 六、验收口径（Phase 0）

- [x] 新环境能按 README 安装依赖并运行 `pnpm dev`。
- [x] 上表核心内容（≥3 篇文章、≥1 条笔记、≥1 个项目）与品牌资产不再依赖临时占位文本。
