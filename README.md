# Cove

个人博客与内容空间。以 Git 为唯一事实源，Astro 静态构建，部署于 Cloudflare Workers Static Assets。

- 开发实施基线：[`docs/COVE-DEVELOPMENT-GUIDE.md`](docs/COVE-DEVELOPMENT-GUIDE.md)
- 架构推导提案：`docs/personal-blog-project-proposal-v2.html`
- 实施决策记录：[`docs/decision-log.md`](docs/decision-log.md)
- 真实内容清单：[`docs/content-checklist.md`](docs/content-checklist.md)

## 技术栈

| 层级 | 选型 |
| --- | --- |
| 页面框架 | Astro（默认静态输出） |
| 交互 | Vue 3 Islands（仅局部组件） |
| 类型 | TypeScript（strict） |
| 样式 | Tailwind CSS v4 + CSS variables 设计令牌 |
| UI 基础 | shadcn-vue（仅复杂交互原语，按阶段添加） |
| 图标 | Lucide（16/18/20px，描边 1.75） |
| 包管理 | pnpm |

## 环境要求

- Node.js `>= 22`（建议当前 LTS）
- pnpm `>= 10`（可通过 `corepack enable` 启用）
- 依赖安装使用锁文件冻结：`pnpm install --frozen-lockfile`

## 快速开始

```bash
corepack enable          # 如尚未启用 pnpm
pnpm install             # 安装依赖
pnpm dev                 # 本地开发预览 http://localhost:4321
```

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 启动本地开发服务器 |
| `pnpm check` | 类型与内容检查（`astro check`） |
| `pnpm build:site` | 生产构建（输出 `dist/`） |
| `pnpm build:search` | 单独运行 Pagefind 索引（已包含在 `build` 链中） |
| `pnpm build` | 检查 + 生产构建 + Pagefind 索引 |
| `pnpm preview` | 本地预览生产构建 |

## 项目结构

```text
cove/
├── docs/                    # 开发指南、提案、决策记录、内容清单
├── public/                  # 静态资源（favicon、og-default.png、site.webmanifest 等）
├── src/
│   ├── assets/              # 品牌、插画、文章与项目媒体
│   ├── components/
│   │   ├── base/            # Button、IconButton、Tag、Divider 等视觉原语
│   │   ├── content/         # ArticleCard、Prose、TOC 等
│   │   ├── home/            # 首页专用区块
│   │   ├── islands/         # Vue Island 组件
│   │   ├── integrations/    # Giscus、Analytics 边界组件
│   │   └── navigation/      # SiteHeader、SiteFooter、MobileNav
│   ├── content/             # posts / notes / projects（Content Collections）
│   ├── data/site.ts         # 站点名称、作者、社交链接等
│   ├── layouts/             # BaseLayout、ContentLayout、ArticleLayout
│   ├── lib/                 # content、seo、search、urls 等
│   ├── pages/               # 路由页面
│   └── styles/              # tokens.css、global.css、prose.css
├── scripts/                 # 工具脚本（og-default.svg 及其 PNG 生成）
├── astro.config.mjs
└── package.json
```

完整结构与各阶段任务见开发指南第 6、19 节。

## 根目录配置速查表

> 新增根目录配置文件时同步更新此表（约定记录于 `CLAUDE.md`）。
> 这些文件的位置均为工具强制约定，不可移入子文件夹统一管理。

| 文件 | 职责 | 所属工具 / 位置约束 |
| --- | --- | --- |
| `package.json` | 依赖声明与脚本命令 | pnpm，必须在根目录 |
| `pnpm-lock.yaml` | 依赖锁文件，冻结安装（必须提交） | pnpm，必须在根目录 |
| `tsconfig.json` | TypeScript strict 配置与 `@/*` 路径别名 | TypeScript / `astro check`，按根目录查找 |
| `astro.config.mjs` | Astro 站点配置：`site`、统一端口 4321、Vue 与 Tailwind 集成 | Astro CLI 自动发现，仅认根目录 |
| `components.json` | shadcn-vue 初始化配置（样式与别名） | shadcn-vue CLI，只认根目录 |
| `.gitignore` | Git 忽略规则（构建产物、依赖、环境变量等） | Git，仓库根目录生效 |
| `.editorconfig` | 编辑器基础格式约定（UTF-8、LF、2 空格缩进） | EditorConfig，从文件向上查找 |
| `.vscode/extensions.json` | 推荐安装的 VS Code 扩展 | VS Code |
| `CLAUDE.md` | AI 协作工作流约定 | Claude Code，每次会话自动读取 |
| `.pages.yml` | Pages CMS 三类内容（文章/笔记/项目）与媒体源编辑配置，字段对齐 `src/content.config.ts` | Pages CMS，强制仓库根目录 |
| `wrangler.jsonc` | Workers Static Assets 部署配置：静态资源目录 `dist/`、404 回退（`not_found_handling`）、兼容日期 | Wrangler / Workers Builds，按根目录约定查找 |
| `.github/workflows/`（Phase 7） | CI/CD 质量门禁工作流 | GitHub Actions，路径固定 |

## 阶段进度

- [x] Phase 0：项目基线与设计准备
- [x] Phase 1：工程骨架与设计令牌
- [x] Phase 2：内容系统
- [x] Phase 3：首页与核心阅读体验
- [x] Phase 4：内容发现与搜索
- [x] Phase 5：SEO、分享与可访问性（Lighthouse 与 200% 缩放等运行时验收待 `pnpm preview` 实测）
- [ ] Phase 6：CMS 与外部集成
- [ ] Phase 7：部署、质量门禁与上线
- [ ] Phase 8：上线观察与后续迭代

## Git 约定

`main` 为生产分支，日常开发使用功能分支 + Pull Request。详见开发指南 17.2 节。
