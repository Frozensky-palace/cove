# Phase 6 手动操作与验证清单

Phase 6（CMS 与外部集成）代码侧已全部就绪，三项功能的**启用与实测**需要你在真实环境中操作。本文按服务分节，每节含「前置 → 操作 → 验证」；全部完成后对照第 5 节验收表勾收，Phase 6 即可关闭。

当前状态：

| 功能 | 代码 | 配置 | 状态 |
| --- | --- | --- | --- |
| Pages CMS | `.pages.yml` 已提交 | 已完成 | 待真实环境验证（第 1 节） |
| Giscus 评论 | `CommentProvider` 已实现 | **关闭**（标识为空） | 待你启用（第 2 节） |
| CF Web Analytics | `Analytics` 组件已实现 | **关闭**（token 为空） | 待你启用（第 3 节） |

功能关闭 = 页面不渲染对应区块、不发任何第三方请求，站点行为与 Phase 5 完全一致。

---

## 1. Pages CMS：授权与真实环境验证

**前置**：`main` 已推送到 <https://github.com/Frozensky-palace/cove>（`.pages.yml` 需在目标分支上，CMS 按分支读取）。

**操作**：

1. 打开 <https://app.pagescms.org> → 用 GitHub 登录 → 安装 Pages CMS 的 GitHub App 时**只授权 `cove` 一个仓库**（指南 16 安全约定）；
2. 打开仓库，确认侧栏出现「文章 / 笔记 / 项目 / 媒体」四个入口，既有内容能正常列出、点开能编辑。

**验证**（新建一篇 `draft: true` 测试文章，对照 `docs/PAGES-CMS-GUIDE.md` 第 7 节逐项确认）：

- [ ] ① date 字段保存后 frontmatter 是带引号的 `'YYYY-MM-DD'` 字符串；
- [ ] ② 上传封面后 frontmatter 写入 `../../assets/posts/...`，拉回本地 `pnpm build` 通过；
- [ ] ③ 上传中文/空格文件名图片被重命名为安全文件名（无效则删 `.pages.yml` 里的 `rename: safe` 行）；
- [ ] ④ 项目封面上传走 `src/assets/projects`（字段级 `media:` 命名源生效）；
- [ ] ⑤ 中文标题新建条目时文件名派生行为可接受（必要时手工重命名）；
- [ ] ⑥ 编辑含 `series`/`canonicalURL` 的旧文并保存，未展示字段未被删除（merge 行为）；
- [ ] ⑦ 含代码块、表格、引用的正文经 CMS 保存后 diff 无改写。

任一项不符合：告诉我结果，我修配置；期间本地写作不受影响。

---

## 2. Giscus 评论：从零启用

**前置**：仓库已为 public（✓ 已满足）。

**操作**：

1. 仓库 → Settings → General → Features → 勾选 **Discussions**；
2. 安装 giscus 的 GitHub App：<https://github.com/apps/giscus> → Configure → 仅授权 `cove`；
3. 仓库 Discussions → 新建分类：名称建议 `评论`（或 `Comments`），类型选 **Announcements**（只有维护者能发起讨论，评论者只能回复——防滥用）；
4. 打开 <https://giscus.app/zh-CN>，填入 `Frozensky-palace/cove`：
   - Discussion 分类：选上一步建的分类；
   - 页面 ↔ discussion 映射：**pathname**（已按此实现）；
   - 主题：light（站点运行时动态同步，无需关心此项）；
   - 页面底部「启用 giscus」区块会生成一段配置，取其中四个值；
5. 编辑 `src/data/integrations.ts` 的 `giscusConfig`，填入：
   - `repo`：`'Frozensky-palace/cove'`
   - `repoId`：`data-repo-id` 的值（base64）
   - `category`：`data-category` 的值（分类名）
   - `categoryId`：`data-category-id` 的值（base64）
6. 在 giscus.app 同一页面的 **origins** 里填正式站点域名——当前 `siteConfig.url` 还是占位符 `cove.example.com`，建议等 Phase 7 域名确定后再填（本地 `localhost:4321` 也可加一条用于测试）；
7. `pnpm build`（或推送触发线上构建）。

**验证**：

- [ ] 任一文章页滚到底部出现「评论」区块（进入视口才开始加载 giscus 脚本，DevTools Network 可确认）；
- [ ] 点击「用 GitHub 登录并评论」，GitHub 授权后能发评论，GitHub Discussions 里出现对应讨论；
- [ ] 打开另一篇文章，评论区为该文章独立的空讨论（pathname 映射生效）；
- [ ] 站内切换浅色/深色主题，评论区（含已加载的）实时跟随；
- [ ] 用 uBlock 等工具屏蔽 `giscus.app` 后刷新：正文与导航完全正常，评论区出现失败占位文案，点「重试加载」有响应；
- [ ] 草稿文章的预览页（`pnpm dev`）**没有**评论区。

---

## 3. Cloudflare Web Analytics：从零启用

**前置**：Cloudflare 账号。正式生效依赖 Phase 7 部署上线，但 token 可先配置（组件只在生产构建输出，先填不会影响 dev）。

**操作**：

1. Cloudflare Dashboard → 左侧 **Web Analytics** → Add a site → 填正式域名 → 获得 JavaScript snippet；
2. 从 snippet 中取出 `token` 值（`data-cf-beacon='{"token": "..."}'` 里的字符串），填入 `src/data/integrations.ts` 的 `analyticsConfig.token`。

**验证**（需生产构建或线上环境）：

- [ ] `pnpm build` 后检查 `dist/**/*.html` 末尾含 `static.cloudflareinsights.com/beacon.min.js`；DevTools Network 可见 beacon 请求且状态 200；
- [ ] `pnpm dev` 下 Network **无**任何 `cloudflareinsights` 请求（仅生产加载，指南约定）；
- [ ] Cloudflare Web Analytics 控制台在几个访问后出现数据。

> token 是公开标识（明文出现在页面源码中），提交进 Git 没有安全问题；滥用防护由 Cloudflare 站点域名绑定承担。

---

## 4. 改动内容的本地快速检查（可选）

`pnpm dev` 后：

- 文章详情页底部应出现「评论 / 评论加载中……」文案（giscus 未配置时，滚动到底约 10 秒后变为失败占位——这是超时兜底逻辑在起作用；配置后此现象消失）；
- 其余页面无任何变化；`pnpm build` 0 错误。

若不希望未配置时看到占位文案，可保持现状（真实环境一配置即消失），或告诉我改成「未配置时完全不渲染占位」。

---

## 5. Phase 6 验收对照（指南 19）

- [ ] CMS 建草稿 → 拉回本地 `pnpm preview` 可见「预览内容」横幅；
- [ ] CMS 修改的内容通过 schema 校验与生产构建；
- [ ] 阻止 Giscus 后，正文和导航不受影响；
- [ ] Analytics 仅生产环境加载；
- [ ] （Phase 7 时）CSP `_headers` 的 allowlist 包含 `giscus.app`（frame-src、script-src、style-src）与 `static.cloudflareinsights.com`（script-src、connect-src）。

## 6. 遗留事项（不阻塞 Phase 6 关闭）

- 正式域名（`src/data/site.ts` 的占位 `cove.example.com`）→ Phase 7，影响 giscus origins、canonical、RSS 链接；
- CMS 首次验证若发现 `.pages.yml` 语法与真实版本不符 → 按第 1 节反馈修正；
- 评论数据备份：GitHub Discussions 随仓库走，定期镜像仓库即同步备份（指南 16 恢复约定）。
