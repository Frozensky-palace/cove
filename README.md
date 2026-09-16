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
| `pnpm build` | 检查 + 生产构建 |
| `pnpm preview` | 本地预览生产构建 |

> Pagefind 搜索索引（`build:search`）将在 Phase 4 接入后加入 `build` 链，见 `docs/decision-log.md` IMPL-006。

## 项目结构

```text
cove/
├── docs/                    # 开发指南、提案、决策记录、内容清单
├── public/                  # 静态资源（favicon、robots 等）
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
│   ├── lib/                 # content、seo、urls、utils
│   ├── pages/               # 路由页面
│   └── styles/              # tokens.css、global.css、prose.css
├── astro.config.mjs
└── package.json
```

完整结构与各阶段任务见开发指南第 6、19 节。

## 阶段进度

- [x] Phase 0：项目基线与设计准备
- [x] Phase 1：工程骨架与设计令牌
- [ ] Phase 2：内容系统
- [ ] Phase 3：首页与核心阅读体验
- [ ] Phase 4：内容发现与搜索
- [ ] Phase 5：SEO、分享与可访问性
- [ ] Phase 6：CMS 与外部集成
- [ ] Phase 7：部署、质量门禁与上线
- [ ] Phase 8：上线观察与后续迭代

## Git 约定

`main` 为生产分支，日常开发使用功能分支 + Pull Request。详见开发指南 17.2 节。
