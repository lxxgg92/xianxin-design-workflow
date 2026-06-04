export const meta = {
  name: 'screenshot-verify',
  description: '并行检查页面截图的 7 个验收维度，生成偏差报告',
  phases: [
    { title: '读取上下文', detail: '读取 DESIGN.md、UI_SPEC.md、Handoff.md 和交接输出' },
    { title: '并行验收', detail: '7 个维度同时检查：布局、字体、颜色、组件、状态、交互、响应式' },
    { title: '汇总报告', detail: '合并所有维度结果，生成偏差等级和修正建议' },
  ],
}

const DIMENSION_SCHEMA = {
  type: 'object',
  required: ['dimension', 'passed', 'issues', 'severity'],
  properties: {
    dimension: { type: 'string' },
    passed: {
      type: 'array',
      items: { type: 'string' },
      description: '符合设计规范的具体检查项'
    },
    issues: {
      type: 'array',
      items: {
        type: 'object',
        required: ['description', 'severity', 'suggestion'],
        properties: {
          description: { type: 'string' },
          severity: { type: 'string', enum: ['严重', '中等', '轻微'] },
          suggestion: { type: 'string' },
        }
      }
    },
    severity: {
      type: 'string',
      enum: ['严重', '中等', '轻微', '无问题'],
      description: '本维度的最高偏差等级'
    }
  }
}

const REPORT_SCHEMA = {
  type: 'object',
  required: ['符合', '不符合', '偏差等级', '修正建议', '是否继续修改代码', '迭代轮次说明'],
  properties: {
    符合: { type: 'array', items: { type: 'string' } },
    不符合: { type: 'array', items: { type: 'string' } },
    偏差等级: { type: 'string', enum: ['严重', '中等', '轻微'] },
    修正建议: { type: 'array', items: { type: 'string' } },
    是否继续修改代码: { type: 'boolean' },
    迭代轮次说明: { type: 'string' },
  }
}

// 第一阶段：读取上下文
phase('读取上下文')

const context = await agent(
  `读取以下文件内容，提取关键信息，返回结构化文字供后续验收使用：
1. 项目根目录下的 DESIGN.md（提取 colors、typography、components token 的具体值）
2. 当前页面对应的 UI_SPEC.md 或 UI_SPEC_*.md（提取页面结构、交互规则、状态规则摘要）
3. Handoff.md（提取验收标准列表）
4. 本轮 implement 的标准交接输出（改动文件、验证状态、冲突说明），上下文中没有则写"无交接输出"`,
  { label: '读取设计和实现上下文', phase: '读取上下文' }
)

// 第二阶段：7 个维度并行检查
// 每个维度只有一个步骤，互相独立，无跨维度依赖
// 规范默认选择 pipeline；await pipeline 本身等全部完成，不需要额外 barrier
phase('并行验收')

const DIMENSIONS = [
  { key: '布局',   checks: `- 模块顺序是否正确\n- 对齐是否正确（左对齐、居中、右对齐）\n- 间距是否与设计规范一致\n- 页面重心是否合理\n- 页面是否拥挤或过空` },
  { key: '字体',   checks: `- 字号是否与 DESIGN.md typography token 一致\n- 字重是否正确\n- 行高是否舒适\n- 标题、正文、辅助文字的层级是否清晰` },
  { key: '颜色',   checks: `- 主色是否与 DESIGN.md YAML 中 colors token 定义的值一致\n- 背景色是否正确\n- 边框色是否合理\n- 状态色（成功/警告/错误/信息）是否统一\n- 是否出现 DESIGN.md colors token 中未定义的颜色值` },
  { key: '组件',   checks: `- 按钮、输入框、表格、卡片、标签、弹窗的样式是否与 DESIGN.md components token 一致\n- 颜色、圆角、字号、内边距是否符合规范\n- 组件样式是否统一，是否有漂移` },
  { key: '状态',   checks: `- 默认态是否正常\n- 空状态是否有合适的提示\n- 加载态是否有 loading 样式\n- 错误态是否有明确提示\n- 无权限态是否有处理\n- disabled 状态是否清晰可辨` },
  { key: '交互',   checks: `- 点击按钮是否有明确反馈\n- hover 效果是否自然\n- 表单校验提示是否明确\n- 弹窗打开/关闭是否符合预期\n- 删除等危险操作是否有二次确认` },
  { key: '响应式', checks: `- 大屏显示是否正常\n- 小屏是否不溢出\n- 表格在小屏是否可用\n- 按钮换行是否合理\n- 内容是否不会被遮挡` },
]

const dimensionResults = await pipeline(
  DIMENSIONS,
  (d) => agent(
    `对比当前页面截图与参考图，检查【${d.key}】维度。\n\n设计上下文：\n${context}\n\n检查项：\n${d.checks}\n\n必须指出具体问题，不能只说"看起来没问题"。`,
    { label: `检查：${d.key}`, phase: '并行验收', schema: DIMENSION_SCHEMA }
  )
)

const validResults = dimensionResults.filter(Boolean)

// 第三阶段：汇总报告
// pipeline 已 await，validResults 包含全部 7 个维度结果，直接汇总
phase('汇总报告')

const report = await agent(
  `根据以下 7 个维度的检查结果，汇总生成最终偏差报告：

${JSON.stringify(validResults, null, 2)}

汇总规则：
- 符合：列出所有维度中确认符合的检查项
- 不符合：列出所有发现的具体问题（带维度前缀，如"颜色：主色不符"）
- 偏差等级：取所有维度中最高等级（有严重→严重，无严重有中等→中等，全部轻微→轻微）
- 修正建议：按严重→中等→轻微排序列出
- 是否继续修改代码：有严重或中等偏差时为 true，全部轻微时为 false
- 迭代轮次说明：从上下文判断当前是第几轮验收；无法判断则写"当前轮次未知，请用户确认"`,
  { label: '汇总偏差报告', phase: '汇总报告', schema: REPORT_SCHEMA }
)

log(`验收完成 — 偏差等级：${report.偏差等级}，发现 ${report.不符合.length} 个问题`)

return { report, dimensionDetails: validResults }
