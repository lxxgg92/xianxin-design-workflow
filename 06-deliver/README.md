# deliver

判断页面是否可交付，并生成最终交付报告（delivery-report.md）。

## 适用场景
- verify 偏差报告显示"轻微偏差"，用户确认后需要做最终交付评估
- 用户手动触发，对已实现页面进行全面交付检查
- 需要一份结构化的交付报告用于归档或移交

## 前置条件（依赖哪些上游 skill）
| 上游 skill | 产物 | 必需 |
|---|---|---|
| implement | 改动文件、验证状态、冲突说明 | 是 |
| verify | 偏差报告 | 是 |
| spec | UI_SPEC.md / UI_SPEC_*.md | 是 |

此外还需要项目中存在 DESIGN.md 和 Handoff.md。

## 输出产物
- 控制台输出：可交付状态（是/否）+ 说明与建议
- 文件：项目根目录下的 `delivery-report.md`，包含是否可交付、本次完成内容、主要改动文件、已验证内容、剩余风险、后续建议

## 下游 skill
- 可交付：流程结束（最终节点）；如需开始新页面，进入 spec
- 不可交付：回退到 implement 或 verify

## 如何使用

| 工具 | 触发方式 |
|------|----------|
| Kiro | `/deliver` |
| OpenAI Codex CLI | 全局安装后对话描述需求，或在项目根目录说明意图 |
| Claude Code | `/deliver` |
| Cursor | 在对话中说"`deliver`"或描述需求（如"帮我初始化项目设计规范"） |
| Windsurf | 在对话中说"`deliver`"或描述需求 |
| Trae | 在对话中说"`deliver`"或描述需求 |
| 通用 AI 助手 | 粘贴 `skill.md` 内容后描述需求 |
