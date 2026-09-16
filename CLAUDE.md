# CLAUDE.md

## 工作流约定

- 涉及启动或运行服务器（`pnpm dev`、`pnpm preview` 等）时：不要代为运行，先告知用户命令，由用户自行启动并验收结果。
- 新增根目录配置文件时，同步更新 `README.md` 的「根目录配置速查表」。
- 开发以 `docs/COVE-DEVELOPMENT-GUIDE.md` 为基线，遵循分阶段方案（第 19 节）与 Agent 协作规则（第 21.4 节）。
- 实施级决策与对基线的变更记录在 `docs/decision-log.md`，新增依赖需说明理由（指南 21.2）。

## 常用命令

- `pnpm dev` — 本地开发预览
- `pnpm check` — 类型与内容检查
- `pnpm build` — 检查 + 生产构建
- `pnpm preview` — 预览生产构建（用户自行运行）
