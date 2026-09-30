# Cove 文档索引

`docs/` 目录的文件地图。2026-09-29 起按状态归类（IMPL-071）：**维护中的文档留在
`docs/` 根**，历史文件按性质分入三个子目录——`reviews/`（评审报告）、`phases/`
（阶段验收与交付清单）、`archive/`（立项提案等原始存档）。

> **旧路径说明**：`decision-log.md` 是追加式日志，IMPL-070 及之前的条目仍以
> `docs/<文件名>` 引用历史文件（如 `docs/BLOG-PROJECT-REVIEW.md`）——这些路径指
> 移动前的位置，对应文件现于子目录中；为保证日志的可追溯性，不回改历史条目。

## 推荐阅读顺序

| 场景 | 路径 |
| --- | --- |
| 第一次接触本项目 | 仓库 [README](../README.md) → [开发指南](COVE-DEVELOPMENT-GUIDE.md)（第 1–7 节建立全局认识） |
| 日常运营（发文 / 回滚 / 依赖更新） | [运维手册](OPERATIONS.md) → [CMS 写作指南](PAGES-CMS-GUIDE.md) |
| 了解某个实现「为什么这样做」 | [决策记录](decision-log.md)（按 IMPL 编号检索） |
| 了解架构推导过程 | [立项提案](archive/personal-blog-project-proposal-v2.html)（历史存档） |

## 文件清单

### 维护中的文档（docs/ 根）

| 文档 | 角色 | 说明 |
| --- | --- | --- |
| [COVE-DEVELOPMENT-GUIDE.md](COVE-DEVELOPMENT-GUIDE.md) | 开发基线 | 产品定义、架构原则、视觉系统、内容模型、测试策略与分阶段方案（第 19 节）；对基线的任何变更须记录进决策记录 |
| [decision-log.md](decision-log.md) | 实施决策记录 | IMPL-001 起逐条记录每次实施的改动、理由与验证结果；新增依赖须在此说明（指南 21.2） |
| [OPERATIONS.md](OPERATIONS.md) | 运维手册 | 写作与发文、发布验证、回滚、季度恢复演练、依赖更新、质量守卫链排查 |
| [PAGES-CMS-GUIDE.md](PAGES-CMS-GUIDE.md) | CMS 写作指南 | Pages CMS 的授权、编辑、发布流程与上线前验证清单 |

### 历史记录（不再更新）

**`reviews/` —— 评审报告**

| 文档 | 说明 |
| --- | --- |
| [BLOG-PROJECT-REVIEW.md](reviews/BLOG-PROJECT-REVIEW.md) | 项目整体评审（2026-09-23）；整改落地见决策记录 IMPL-056 |
| [BLOG-FRONTEND-REVIEW-2026-09-27.md](reviews/BLOG-FRONTEND-REVIEW-2026-09-27.md) | 前端可靠性评审（2026-09-27）；整改落地见 IMPL-059 起 |
| [BLOG-VISUAL-REVIEW-2026-09-28.md](reviews/BLOG-VISUAL-REVIEW-2026-09-28.md) | 视觉与可访问性评审（2026-09-28）；整改落地见 IMPL-061–065 |

**`phases/` —— 阶段验收与交付清单**

| 文档 | 说明 |
| --- | --- |
| [content-checklist.md](phases/content-checklist.md) | Phase 0 交付物：真实内容与品牌资产收集清单；2026-09-24 复核确认全部落地，保留作字段速查 |
| [PHASE6-MANUAL-CHECKLIST.md](phases/PHASE6-MANUAL-CHECKLIST.md) | Phase 6（CMS 与外部集成）手动验收；阶段已关闭 |
| [PHASE7-MANUAL-CHECKLIST.md](phases/PHASE7-MANUAL-CHECKLIST.md) | Phase 7（部署、质量门禁与上线）手动验收；阶段已关闭 |
| [PHASE8.1-MANUAL-CHECKLIST.md](phases/PHASE8.1-MANUAL-CHECKLIST.md) | Phase 8.1（页面优化，IMPL-056–072）浏览器复验清单；**验收中**，全部勾收后阶段关闭 |

**`archive/` —— 原始存档**

| 文档 | 说明 |
| --- | --- |
| [personal-blog-project-proposal-v2.html](archive/personal-blog-project-proposal-v2.html) | 立项提案：架构推导与选型论证的原始文档 |

## 约定

- 评审报告与阶段清单是**当时的快照**：其后实际落地的口径、形态如有出入，以
  `decision-log.md` 对应 IMPL 条目为准（例：报告中的建议方案未必是最终采纳方案）。
- 阶段状态以[开发指南](COVE-DEVELOPMENT-GUIDE.md)第 19 节「分阶段方案」为准。
- 后续新增同类文件按既有归类放置：评审报告进 `reviews/`、阶段验收清单进
  `phases/`；维护中的文档继续留在 `docs/` 根，不另建子目录。
