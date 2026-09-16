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
