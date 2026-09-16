# Cove 真实测试内容与品牌资产清单

> Phase 0 交付物。用途：
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
| Cove 标志源文件 | 矢量源文件（蓝粉配色），导航与页脚使用其 SVG 导出 | `src/assets/brand/` | ☐ 待提供 |
| 标志导出（浅/深色） | 供 `SiteHeader` / `SiteFooter` 内联或引用的 SVG | `src/assets/brand/` | ☐ 待提供 |
| favicon | 基于 `public/favicon.svg` 临时占位替换 | `public/` | ☐ 待替换 |
| 首页海湾插画 | 低饱和、少细节、大留白（指南 8.5） | `src/assets/illustrations/` | ☐ 待提供（Phase 3） |

约束提醒：蓝粉渐变只用于品牌标志、当前导航细线或一处关键视觉（指南 8.2）。

## 五、站点信息确认

| 项 | 占位值（`src/data/site.ts`） | 正式值 | 状态 |
| --- | --- | --- | --- |
| 正式域名 | `https://cove.example.com` | | ☐ 待确认 |
| 作者名 | `（待确认）` | | ☐ 待确认 |
| 站点简介 | 临时占位文案 | | ☐ 待确认 |
| 社交链接 | 空数组 | GitHub / RSS / Email 等 | ☐ 待确认 |

## 六、验收口径（Phase 0）

- [ ] 新环境能按 README 安装依赖并运行 `pnpm dev`。
- [ ] 上表核心内容（≥3 篇文章、≥1 条笔记、≥1 个项目）与品牌资产不再依赖临时占位文本。
