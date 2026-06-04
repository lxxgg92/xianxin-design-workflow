# handoff

将 UI Spec 转化为可执行的实现任务书，输出 Handoff.md，作为页面实现阶段的正式交接文档。

## 适用场景

- UI Spec 已完成，需要将设计规范转化为开发可直接执行的任务说明
- 多人协作时，需要明确本轮实现范围、验收标准和禁止事项
- 存在历史 Handoff.md 时，需要追加新轮任务而不覆盖旧记录

## 前置条件

依赖以下上游 skill 的输出：
- **spec**：提供 UI_SPEC.md 或 UI_SPEC_*.md
- **design**：提供 DESIGN.md

两个文件缺一不可，缺失时 skill 会一次性列出所有缺失项并提示先补齐。

## 输出产物

- `Handoff.md`，包含六个章节：本轮任务目标、设计依据、修改范围、实现要求、验收标准、禁止事项

## 下游 Skill

- **implement**：读取 Handoff.md，执行页面实现

## 如何使用

| 工具 | 触发方式 |
|------|----------|
| Kiro | `/handoff` |
| OpenAI Codex CLI | 全局安装后对话描述需求，或在项目根目录说明意图 |
| Claude Code | `/handoff` |
| Cursor | 在对话中说"`handoff`"或描述需求（如"帮我初始化项目设计规范"） |
| Windsurf | 在对话中说"`handoff`"或描述需求 |
| Trae | 在对话中说"`handoff`"或描述需求 |
| 通用 AI 助手 | 粘贴 `skill.md` 内容后描述需求 |
