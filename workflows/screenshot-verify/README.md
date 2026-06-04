# verify Workflow

verify skill 的 Workflow 自动化版本，用 7 个 agent 并行检查 7 个验收维度，最后汇总成一份偏差报告。

## 功能

- **并行检查**：7 个维度（布局、字体、颜色、组件、状态、交互、响应式）同时检查，不相互等待
- **结构化输出**：每个维度返回 JSON 格式的检查结果（符合项、问题列表、偏差等级、修正建议）
- **自动汇总**：所有维度完成后，自动汇总成最终偏差报告

## 使用方式

### Claude Code

```
使用 workflow 运行 screenshot-verify
```

### 手动触发（如果工具支持 Workflow API）

```javascript
Workflow({
  name: 'screenshot-verify'
})
```

## Workflow 结构

### 第一阶段：读取上下文
- 读取 DESIGN.md、UI_SPEC.md、Handoff.md、implement 交接输出
- 提取关键信息供后续验收使用

### 第二阶段：并行验收
7 个 agent 并行运行，每个负责一个维度：

1. **布局**：模块顺序、对齐、间距、页面重心
2. **字体**：字号、字重、行高、层级
3. **颜色**：主色、背景色、状态色、token 一致性
4. **组件**：样式一致性、token 引用
5. **状态**：默认态、空状态、加载态、错误态、无权限态
6. **交互**：点击反馈、hover、表单校验、弹窗、删除确认
7. **响应式**：大屏、小屏、表格、按钮换行

每个维度返回：
```json
{
  "dimension": "布局",
  "passed": ["模块顺序正确", "对齐规范"],
  "issues": [
    {
      "description": "卡片间距不一致",
      "severity": "中等",
      "suggestion": "统一使用 spacing.base"
    }
  ],
  "severity": "中等"
}
```

### 第三阶段：汇总报告
- 合并所有维度结果
- 取最高偏差等级（有严重→严重，无严重有中等→中等）
- 按严重→中等→轻微排序修正建议
- 判断是否需要继续修改代码

最终返回：
```json
{
  "report": {
    "符合": [...],
    "不符合": [...],
    "偏差等级": "中等",
    "修正建议": [...],
    "是否继续修改代码": true,
    "迭代轮次说明": "当前为第 1 轮验收"
  },
  "dimensionDetails": [...]
}
```

## 与手动版本对比

| | 手动版（/verify） | Workflow 版 |
|---|---|---|
| 执行方式 | 单个 agent 逐个检查 7 个维度 | 7 个 agent 并行检查 |
| 耗时 | 约 7 次串行调用 | 约 1 次并行调用（取最慢的维度） |
| Token 消耗 | 较少（单个 agent） | 较多（7 个 agent） |
| 适用场景 | 快速验收、简单页面 | 复杂页面、需要详细报告 |

## 前置条件

- 页面已实现完成（implement 完成）
- 用户提供了参考图或 Figma 截图
- 项目中存在 DESIGN.md、UI_SPEC.md、Handoff.md

## 输出

- `report`：最终偏差报告
- `dimensionDetails`：7 个维度的详细检查结果

## 注意事项

1. **Token 消耗**：Workflow 版本会并行跑 7 个 agent，token 消耗约为手动版的 7 倍
2. **适用场景**：建议在复杂页面或需要详细验收时使用，简单页面可直接用 `/verify`
3. **依赖 pipeline**：Workflow 内部使用 `pipeline()` 实现 7 个维度的并行检查，符合 Claude Code Workflow 的最佳实践

## 安装

### Claude Code

```bash
cp workflow.js ~/.claude/workflows/screenshot-verify.js
```

触发后，Workflow 会在后台运行，完成后自动通知你。

## 技术细节

- 使用 `pipeline()` 实现 7 个维度的并行处理
- 每个维度通过 `schema` 参数强制返回结构化 JSON
- 汇总阶段通过 `await pipeline(...)` 自然等待全部完成
- 无需额外 `parallel()` barrier，符合 Workflow 规范的 DEFAULT TO pipeline() 原则
