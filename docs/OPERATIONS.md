# Cove 运维手册

站长的日常运营操作说明：写作与发文、发布验证、回滚、恢复演练与依赖更新。
开发与架构细节见 [`COVE-DEVELOPMENT-GUIDE.md`](COVE-DEVELOPMENT-GUIDE.md)，实施决策见 [`decision-log.md`](decision-log.md)，CMS 编辑操作见 [`PAGES-CMS-GUIDE.md`](PAGES-CMS-GUIDE.md)。

## 0. 部署架构速览

- 以 Git 为唯一事实源：`main` 分支即生产站点 https://cove.xin 。
- 推送到 `main` → Cloudflare Workers Builds 自动执行 `pnpm install && pnpm build`
  （`astro check` → `astro build` → Pagefind 索引 → `noindex-preview.mjs`）→
  `wrangler deploy` 发布 `dist/`。构建到线上生效约 2–3 分钟。
- 非 `main` 分支的构建产物自动注入 `X-Robots-Tag: noindex`
  （`scripts/noindex-preview.mjs`，依据 CI 注入的 `WORKERS_CI_BRANCH` 判断；分支未知一律按预览处理，失败安全）。
- 安全响应头（CSP、HSTS 等）在 `public/_headers` 管理，构建时拷入 `dist/`。
- 构建记录：Cloudflare 控制台 → Workers & Pages → `cove` → Deployments。

## 1. 写作与发文

### 1.1 两条写作路径

**A. Pages CMS（推荐日常）**：登录 pagescms.org → 选择 `Frozensky-palace/cove` →
编辑 文章 / 笔记 / 项目 → 保存。CMS 保存即向仓库提交，字段定义见根目录 `.pages.yml`。

**B. 本地写作**：在 `src/content/`（posts / notes / projects）新建或编辑 Markdown →
`pnpm dev` 本地预览 → `pnpm check` 校验 frontmatter 与类型。

### 1.2 草稿与定时发布

- `draft: true` 的内容不构建进站点（`src/lib/content.ts` 的 `isPublicContent`）。
- `publishedAt` 为未来日期的内容同样不构建，到点后随下一次构建自动出现
  —— 即「定时发布」是把发布时间写进 frontmatter 后提前合入 `main`。

### 1.3 发布

发文 = 内容进入 `main` 分支，无手动部署步骤：

- CMS 路径：保存即提交 `main`，自动发布；
- 本地路径：commit + push 到 `main`，自动发布。

### 1.4 发布后验证（推送约 3 分钟后）

1. 打开 `https://cove.xin` 对应页面，确认新内容出现、排版正常；
2. `https://cove.xin/rss.xml` 已含新条目；
3. `https://cove.xin/sitemap-index.xml` 已收录新页面；
4. 若 404：本地 `pnpm check` 复现，检查文件名（slug）与 frontmatter 是否符合 schema；
5. 新文章页可顺带确认评论区（giscus）正常加载。

## 2. 回滚

适用判定：线上内容错误、构建失败导致站点异常、安全头丢失等。

### 2.1 标准流程：回退到上一已知成功 commit（指南 16）

```bash
git log --oneline -10          # 找到最后一个正常的 commit
git revert <坏提交SHA>          # 生成反向提交（保留历史，推荐）
git push                       # 推送 main，自动重建
```

约 3 分钟后按 1.4 验证。多个坏提交可一次 `git revert <SHA1> <SHA2> ...`。

### 2.2 紧急停损：控制台回退部署

若站点严重异常且等不及重建：Cloudflare 控制台 → Workers & Pages → `cove` →
Deployments → 选择上一个成功部署 → Rollback，秒级生效。

注意：这只回退了「已发布的产物」，仓库 `main` 仍是坏的。随后必须按 2.1 完成
git 反向提交，否则下一次推送会把问题重新带上线。

## 3. 恢复演练（每季度一次）

目的：验证「只靠仓库即可从零重建站点」（指南 16：从空目录安装、构建、预览）。

在新空目录执行：

```bash
git clone https://github.com/Frozensky-palace/cove.git cove-restore
cd cove-restore
corepack enable                # 如尚未启用 pnpm
pnpm install --frozen-lockfile # 锁文件冻结安装
pnpm build                     # 检查 + 构建 + Pagefind 索引
pnpm preview                   # 本地预览 http://localhost:4321
```

验收要点：首页、任一文章页（正文、代码块、图片、目录）、搜索、RSS、暗色主题、404 页均正常。

演练后：把日期与结论记入 `decision-log.md` 新条目。同时每季度确认仓库镜像备份
（本地 / NAS / 第二远端）仍然可用（指南 16）。

## 4. 依赖更新

原则：`pnpm-lock.yaml` 必须提交；依赖更新必须在预览环境验证后才合并（指南 16）。

流程：

1. 从最新 `main` 拉功能分支：`git switch -c deps/update-YYYYMMDD`；
2. 更新依赖：
   - 全量小版本：`pnpm update --latest`；
   - 单个包（推荐）：`pnpm update astro@<目标版本>`；
3. `pnpm build`（含类型检查）→ `pnpm preview` 逐项验证：
   首页、文章页（正文、代码块、图片、目录）、搜索、RSS、暗色主题、404 页；
4. 无误后合并到 `main`，自动发布并按 1.4 验证。

注意事项：

- 主版本升级（Astro、Node 等）单独进行，一次只升一个大件，保证回滚点清晰；
- 仓库要求 Node `>= 22`、pnpm 10（`package.json` engines / packageManager），
  升级 Node 前先确认 Workers Builds 构建环境支持对应版本；
- 新增依赖需在 `decision-log.md` 说明理由（指南 21.2）。

## 5. 附录：运营相关文件索引

| 文件 | 作用 |
| --- | --- |
| `wrangler.jsonc` | Workers Static Assets 部署配置（资源目录、404 回退、兼容日期） |
| `scripts/noindex-preview.mjs` | 非 `main` 分支构建注入 noindex |
| `public/_headers` | 安全响应头（CSP、HSTS 等） |
| `giscus.json` | giscus 评论域名 allowlist（仅 `https://cove.xin` 与本地开发可加载） |
| `.pages.yml` | Pages CMS 内容与媒体配置 |
| `.github/workflows/` | CI/CD 质量门禁工作流 |
