<!-- trae-rule: handoff -->

# handoff

将 UI Spec 转化为可执行的实现任务书，生成 Handoff.md。在 spec 完成且用户确认后触发。

## 前置判断
- 执行前检查以下文件是否存在，缺少任意一项时，**一次性列出所有缺失项**后统一反馈，不逐条追问：
  - UI_SPEC.md 或 UI_SPEC_*.md（如果没有，提示用户先进入 → spec）
  - DESIGN.md（如果没有，提示用户先进入 → design）
- 执行前检查项目根目录是否已有 Handoff.md：
  - 如果已有：
    1. 读取 Handoff.md，提取其中的任务列表
    2. 检查 delivery-report.md 或上下文中是否有对应的交付记录
    3. 如无交付记录，视为有未完成任务，先告知用户旧任务状态，等用户确认再追加本轮任务
    4. 新项目首次执行不触发此判断
  - 如果没有 Handoff.md：创建新文件

## 输入
- UI_SPEC.md（单页面）或 UI_SPEC_*.md（多页面项目）
- DESIGN.md
- 参考图 / Figma 原型
- 现有页面代码（如有）

## 输出
- Handoff.md 文件，包含以下章节：
  - 本轮任务目标
  - 设计依据
  - 修改范围
  - 实现要求
  - 验收标准
  - 禁止事项

## 职责
将 UI Spec 转化为可执行任务：

1. **本轮任务目标**：指定要实现的页面、要解决的核心问题、最终交付结果
2. **设计依据**：DESIGN.md、UI_SPEC.md、参考图/截图、Figma 信息、现有页面
3. **修改范围**：预计修改哪些页面/组件/样式文件，不允许修改哪些文件或模块
4. **实现要求**：
   - 页面布局、组件结构、字段展示、交互行为、状态处理、响应式处理
   - 保持与现有项目风格一致
   - 样式值引用 DESIGN.md YAML 中定义的 token，不允许硬编码脱离 token 体系的数值
   - **Token 到 CSS 变量的映射**：实现前先执行 token 导出，确认 CSS 变量名称：
     ```bash
     npx @google/design.md export --format css-tailwind DESIGN.md > design-tokens.css
     ```
     导出结果即为代码中应使用的变量名（如 `{colors.primary}` → `var(--color-primary)`）。如果项目使用 Tailwind，也可导出为 `json-tailwind` 格式。
   
   **Token 导出责任**：本轮 handoff 生成后，在进入 implement 前，需要在项目根目录执行上述导出命令生成 CSS 变量映射表（design-tokens.css）。如项目已有此文件或使用其他 token 导出方式，在 Handoff.md 中说明文件位置。
5. **验收标准**（必须对应 verify 的 8 个检查维度）：
   1. **布局**：页面符合 UI_SPEC.md 的页面结构定义，模块顺序、对齐、间距正确
   2. **字体**：符合 DESIGN.md 的 typography token，字号、字重、行高层级清晰
   3. **颜色**：所有颜色引用 DESIGN.md 的 colors token，无硬编码颜色值
   4. **组件**：组件样式与 DESIGN.md components token 定义一致
   5. **状态**：包含完整的状态处理（默认态、空状态、加载态、错误态、数据异常态）
   6. **交互**：交互行为符合 UI_SPEC.md 的交互规则
   7. **响应式**：响应式布局正常，无明显样式错位
   8. **性能**：满足 UI_SPEC.md 中定义的性能约束（虚拟滚动、懒加载等）
   - 控制台无报错
6. **禁止事项**：不要大范围重构无关模块、不要替换技术栈、不要删除无关文件、不要随意改全局样式、不要引入不必要依赖、不要硬编码重复样式、不要破坏已有页面

## 暂停点
- Handoff.md 生成完成后，必须暂停，告诉用户：
  "Handoff.md 已生成，请确认任务范围和验收标准，确认后我再进入 → implement 开始页面实现。"
- 不要在用户确认前自动触发下一步

## 上下游关系
- 依赖：UI_SPEC.md、DESIGN.md
- 输出：Handoff.md，供 implement 使用
- 下游：→ implement
