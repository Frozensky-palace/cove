# Cove 实施决策记录

> 本文件记录对开发基线（`docs/COVE-DEVELOPMENT-GUIDE.md`）的实施级决策与后续变更。
> 架构级决策 ADR-001 ~ ADR-010 以指南第 23 节为准，此处不重复维护。
> 修改已确认决策时，必须新增条目写明原因、影响范围和迁移方案，不直接覆盖历史判断。

## 记录格式

| 编号 | 日期 | 决策 | 原因 | 影响范围 |
| --- | --- | --- | --- | --- |

## 实施决策

| 编号 | 日期 | 决策 | 原因 | 影响范围 |
| --- | --- | --- | --- | --- |
| IMPL-001 | 2026-09-16 | 工具链版本：Astro 5 + Vue 3.5 + Tailwind CSS 4（`@tailwindcss/vite`，CSS-first 配置）+ TypeScript strict | 以当前主版本官方 API 为准（指南 11.1）；Tailwind v4 无 `tailwind.config.js`，设计令牌经 `@theme inline` 映射 CSS variables | 全站样式与构建链 |
| IMPL-002 | 2026-09-16 | 路径别名 `@/*` → `src/*`（tsconfig paths，Astro 原生解析） | 指南第 6 节推荐结构要求稳定别名 | 全部源码导入 |
| IMPL-003 | 2026-09-16 | shadcn-vue 仅完成初始化（`components.json` + `src/lib/utils.ts` 的 `cn`），本阶段不添加任何 UI 组件 | 指南 Phase 1 要求“只添加当前阶段真正使用的组件”；Button/IconButton/Tag/Divider 均为 Astro 原语，无需 Vue runtime | 后续 Phase 3/4 按需添加 Sheet、Command、Dialog 等 |
| IMPL-004 | 2026-09-16 | 主题方案：`localStorage` 键 `cove:theme`（`light` / `dark` / `system`），`<html>` 同时携带 `data-theme`（三态）与 `.dark` class（二态）；head 内联脚本在绘制前恢复，防闪烁 | 满足指南 9.1（浅色/深色/跟随系统）与 10（`ThemeScript` 原生内联脚本）；`data-theme` 供无 JS 场景的图标显示与 CSS 选择 | `ThemeScript`、`ThemeToggle`、Tailwind `dark` 变体 |
| IMPL-005 | 2026-09-16 | `astro.config.mjs` 的 `site` 与 `src/data/site.ts` 中作者名、简介、社交链接、正式域名均使用明确标记的占位值 | Phase 0 需作者确认真实信息；占位集中在 `src/data/site.ts`，避免散落 | Phase 5 SEO 与 Phase 7 部署前必须替换 |
| IMPL-006 | 2026-09-16 | `build` 脚本暂为 `astro check && astro build`，不含 `pagefind` | Pagefind 属 Phase 4 交付；提前引入会让无索引内容阶段产生空索引误导验收 | Phase 4 将 `build:search` 并入 `build` 并锁定 wrapper 版本 |
| IMPL-007 | 2026-09-16 | 组件展示页置于 `/dev/`，始终输出 `noindex` | Phase 1 交付物需要可检查的令牌与原语页面，但不得进入搜索索引 | `src/pages/dev/index.astro` |
| IMPL-008 | 2026-09-16 | 本阶段页头搜索按钮渲染为指向 `/search/` 的原生链接（带快捷键提示） | 搜索对话框属 Phase 4；先用无 JS 可用的链接占位，保持渐进增强 | `SiteHeader`，Phase 4 替换为 Vue SearchDialog |
| IMPL-009 | 2026-09-16 | 移动导航暂以可换行的原生链接列表实现，不引入 Vue Sheet | `MobileNav`（Vue + Sheet）属 Phase 3 交付，届时与真实页面一起验收焦点管理与滚动锁定 | `SiteHeader` |
| IMPL-010 | 2026-09-16 | 主题按钮图标渲染改为“系统图标为 HTML 默认 + 浅/深图标携带原生 `hidden` 属性”，状态规则移至 `global.css` | 修复视觉验收反馈：原实现三个图标均渲染且仅靠外部 CSS 隐藏，CSS 应用前的一瞬间会同时闪现多个图标（FOUC）；`hidden` 属性由 UA 样式表在任何 CSS 加载前生效，保证任意时刻最多显示一个图标。注意不得给 `.theme-icon` 写统一 display 规则，否则会覆盖 `hidden` 的 UA 默认值 | `ThemeToggle`、`global.css` |
| IMPL-011 | 2026-09-16 | 主题简化为两态：删除“跟随系统”模式，仅保留浅色/深色，点击在两态间切换并持久化 `cove:theme`；首次访问（无存值）由引导脚本按 `prefers-color-scheme` 作一次性初始值；图标仅剩 Sun/Moon，状态规则移出 `@layer`（未分层）并彻底弃用 `hidden` 属性；BaseLayout 引导脚本在首绘前注入一份镜像规则兜底 | 用户决策：简化交互（覆盖指南 9.1 的三态要求，IMPL-004/010 中三态与 `hidden` 兜底描述作废）。同时修复 IMPL-010 方案缺陷：Tailwind preflight 的 `[hidden]{display:none!important}` 为重要声明，非 important 的 `display:flex` 无法覆盖，导致图标全部消失；未分层规则亦可抵御 HMR 残留的分层样式干扰 | `ThemeToggle`、`BaseLayout`、`global.css`、`MonitorIcon`（删除） |
| IMPL-012 | 2026-09-16 | 默认社交分享图：`scripts/og-default.svg` 为源，`node scripts/generate-og.mjs` 用项目内 sharp（Astro 既有依赖，无新增）渲染 1200x630 PNG 提交为 `public/og-default.png`；SVG 内只渲染拉丁文本，中文 slogan 由 `og:image:alt` 承担 | 社交平台普遍不支持 SVG og:image；librsvg 环境字体差异会导致中文缺字，PNG 产物入库保证构建可复现且零构建期开销 | `scripts/`、`public/og-default.png`、`src/lib/seo.ts` |
| IMPL-013 | 2026-09-16 | 文章分享图规则：封面为位图（png/jpeg/webp）时用封面并输出真实宽高，SVG 封面回退默认图 | 主流平台不索引 SVG og:image，样本封面均为装饰性 SVG，回退保证分享卡片始终有有效图 | `ArticleLayout`、`src/lib/seo.ts` |
| IMPL-014 | 2026-09-16 | `robots.txt` 从静态 `public/` 迁移为 `src/pages/robots.txt.ts` 端点，sitemap 地址由 `siteConfig.url` 解析；不 `Disallow: /dev/` | 域名单一来源（IMPL-005 占位值替换时无需改两处）；Disallow 会阻止爬虫读取 /dev/ 的 noindex 标记，反而不利于去索引 | `src/pages/robots.txt.ts`（删除 `public/robots.txt`） |
| IMPL-015 | 2026-09-16 | JSON-LD：Person 全站由 BaseLayout 统一输出；BlogPosting + BreadcrumbList 仅文章页经 `jsonLd` prop 注入；数据全部来自内容 schema 与 siteConfig（指南 13.2），构建器集中在 `src/lib/seo.ts` | 避免页面手写重复信息；`siteConfig.social` 改为 `SocialLink[]` 显式标注（原 `satisfies + as const` 空数组被收窄为 `never` 元组导致类型错误） | `seo.ts`、`BaseLayout`、`ArticleLayout`、`site.ts` |
| IMPL-016 | 2026-09-16 | Web App Manifest 以静态 `public/site.webmanifest` 提供（name/theme_color 取自令牌色 `#3f789f`，icon 复用 favicon.svg），BaseLayout 统一 `<link rel="manifest">` | 指南 19 Phase 5 仅要求 manifest 存在；静态文件即可，不值得为此加端点；V1 不做完整 PWA（无 service worker），Phase 8 观察期再评估 | `public/site.webmanifest`、`BaseLayout` |
| IMPL-017 | 2026-09-16 | 全局加载体验（用户需求，基线未覆盖）：① `astro:transitions` ClientRouter 接管站内导航，旧页保留至新页就绪，消除整页白屏；② `AppSplash` 首次进入品牌加载页（Logo + 波浪动画 + tagline，sessionStorage `cove:splash-shown` 会话去重，解析期内联脚本先于首绘决定显示，`astro:page-load` 或 2500ms 兜底淡出，无 JS 永不出现）；③ `RouteProgress` 导航顶部 2px 进度条（120ms 阈值防闪，`astro:before-preparation` → `after-swap` 补满淡出，与阅读进度同视觉语言） | 用户决策：两个场景（首访 + 导航）都要、形态结合。代价：全站引入约 10KB 路由 JS，超出指南 14「首页初始 JS 只包含主题与必要导航逻辑」的字面预算，记录为对基线的扩展；波浪/进度动画属功能性加载指示，作为指南 8.6「禁止循环动效」的受限例外，reduced-motion 下由全局规则退化为静态。连带改造：打包脚本在 ClientRouter 下仅执行一次，`ThemeToggle` 改 document 事件委托，`ArticleTOC`/`ArticleLayout` 增强改为 `astro:page-load` 初始化（监听器跨换页存活 + AbortController 清理）；主题镜像 style 加 id 防换页累积；放弃 `data-astro-rerun` 方案（任意属性会使脚本退化为 inline、禁用 TS） | `BaseLayout`、`AppSplash`、`RouteProgress`、`ThemeToggle`、`ArticleTOC`、`ArticleLayout`、`global.css` |
