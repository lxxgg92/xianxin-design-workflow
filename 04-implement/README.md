# implement

按照设计文档实现页面代码的 skill，负责将 UI 规格和设计系统转化为可运行的页面代码。

## 适用场景
- handoff 完成并经用户确认后，需要正式开始编写页面代码
- 需要根据 Handoff.md、UI_SPEC.md、DESIGN.md 三份文档协同实现页面
- 需要在最小改动范围内完成页面开发，避免影响无关代码

## 前置条件（依赖哪些上游 skill）
- 依赖 **handoff** 输出的 Handoff.md（包含改动范围和任务说明）
- 依赖 **spec** 输出的 UI_SPEC.md 或 UI_SPEC_*.md（页面 UI 规格）
- 依赖 **DESIGN.md**（设计系统 token 定义）

## 输出产物
- 页面代码文件（按 Handoff.md 指定的目标文件路径）
- 标准交接信息，包含：
  - 改动文件列表
  - 新增组件列表
  - 验证状态（页面无报错、可正常访问）
  - 冲突说明（如有）

## 下游 skill
- **verify**：对实现完成的页面截图验收
- **deliver**：交付前最终检查

## 如何使用

| 工具 | 触发方式 |
|------|----------|
| Kiro | `/implement` |
| OpenAI Codex CLI | 全局安装后对话描述需求，或在项目根目录说明意图 |
| Claude Code | `/implement` |
| Cursor | 在对话中说"`implement`"或描述需求（如"帮我初始化项目设计规范"） |
| Windsurf | 在对话中说"`implement`"或描述需求 |
| Trae | 在对话中说"`implement`"或描述需求 |
| 通用 AI 助手 | 粘贴 `skill.md` 内容后描述需求 |
