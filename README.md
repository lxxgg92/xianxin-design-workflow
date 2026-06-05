# Page Delivery Skills

一套覆盖**从设计规范到最终交付**的完整 AI 页面交付流程，支持 7 种 AI 编程工具。

---

## 这是什么

写了 DESIGN.md，AI 还是做出来一堆问题：风格跑偏、接上真实数据就崩、验收没标准。

问题不是 AI 不够聪明，是它没有足够的上下文——不知道颜色该用在哪、不知道列表超过 100 条该怎么处理、不知道验收的时候要检查哪些维度。

这套 skill 把页面交付拆成 6 个阶段，每个阶段都给 AI 明确的职责、输入、输出和验收标准，让 AI 知道该做什么、不该做什么、做到什么程度才算完。

```
design → spec → handoff → implement → verify → deliver
```

---

## 6 个 Skill

### 1. design — 建立项目设计规范

生成 `DESIGN.md`，定义整个项目的视觉基准。

核心内容：
- 颜色系统（含 `on-*` 配对色，确保文字与背景对比度永远达标）
- 字体系统（9-15 个 typography token，覆盖标题到辅助文字）
- 间距、圆角的 token 体系
- 组件 token（每个组件显式绑定颜色、字体、圆角，含 hover/active/disabled 变体）
- Do's and Don'ts（成对出现，每条 Don't 必须有对应的 Do）

基于 [Google 官方 DESIGN.md 规范](https://github.com/google/design.md)，支持 `npx @google/design.md lint/diff/export` 验证和导出。

### 2. spec — 拆解页面结构

基于 DESIGN.md 对单个页面进行拆解，生成 `UI_SPEC.md`。

固定 8 个章节：页面目标、页面结构、模块拆解、字段说明、交互规则、状态规则、响应式规则、视觉规则引用。

状态规则不只是列出"有哪些状态"，而是明确每个状态的具体实现方式：
- 空状态用什么组件、文案模板、操作引导
- 加载态用骨架屏还是 spinner、超时怎么处理
- 数据异常时字段缺失用什么默认值、格式错误怎么降级
- 列表超过 100 条必须指定虚拟滚动或分页方案

### 3. handoff — 生成开发任务书

将 UI Spec 转化为可执行的 `Handoff.md`，明确本轮改动范围、实现要求、验收标准、禁止事项。

验收标准对应 verify 的 8 个检查维度（布局、字体、颜色、组件、状态、交互、响应式、性能），确保实现阶段和验收阶段标准一致。

包含 token 导出步骤，在实现前将 DESIGN.md 中的 token 导出为 CSS 变量，让 AI 知道 `{colors.primary}` 对应 `var(--color-primary)`，不再猜测变量名。

### 4. implement — 实现页面代码

按照 Handoff.md 实现页面，最小改动原则，优先复用现有组件和样式。

实现前强制执行准备清单：
- 运行 `npx @google/design.md lint DESIGN.md`，有 broken token reference 必须先修复
- 阅读 UI_SPEC.md 时特别关注性能约束，确认虚拟滚动、懒加载等已覆盖
- 不硬编码颜色、字号、间距，必须使用 token 或导出的 CSS 变量

实现完成后必须先暂停，告知用户改动范围，等确认后再开始写代码。

### 5. verify — 截图对比验收

对比页面截图与参考图，输出偏差报告。

检查 8 个维度：布局、字体、颜色、组件、状态、交互、响应式、**性能**（虚拟滚动是否实现、图片是否懒加载、超时处理是否到位）。

颜色维度额外支持 grep 检查代码中的硬编码颜色，确保所有颜色都引用 token。

偏差分三级：严重（回退 implement）、中等（用户决定）、轻微（记录后进入 deliver）。迭代超过 3 轮仍有严重偏差时强制升级给用户决策。

**自动化选项**：Kiro 和 Claude Code 用户可以用 Workflow 自动化版本，8 个 agent 并行检查 8 个维度，最后汇总偏差报告，比手动逐项检查更快。

### 6. deliver — 最终交付检查

检查 9 个条件，判断是否可以交付，生成 `delivery-report.md`。

不可交付时提供明确的回退路径映射：
- 不符合 DESIGN.md/UI_SPEC.md → 回退到 spec 或 design
- 任务未完成/构建失败 → 回退到 implement
- 状态缺失/响应式异常/视觉差异 → 回退到 implement 或 verify
- 破坏其他页面 → 回退到 implement 修复冲突

---

## 支持 8 种 AI 工具

每个 skill 包含 8 种工具的独立 adapter，格式完全对应各工具规范：

| 工具 | 文件 | 安装位置 | 触发方式 |
|------|------|----------|----------|
| Kiro | `kiro.md` | `~/.claude/commands/` | `/design`、`/spec` 等 |
| Claude Code | `claude-code.md` | `~/.claude/commands/` | `/design`、`/spec` 等 |
| OpenAI Codex CLI | `codex.md` | `~/.codex/instructions.md` | 对话中描述需求 |
| Cursor | `cursor.mdc` | `.cursor/rules/` | 对话中描述需求 |
| Windsurf | `windsurf.md` | `.windsurf/rules/` | 对话中描述需求 |
| Trae | `trae.md` | `.trae/rules/` | 对话中描述需求 |
| Google Antigravity | `antigravity.md` | 项目根目录 `GEMINI.md` | 对话中描述需求 |
| 任何 AI 工具 | `system-prompt.md` | 粘贴到 system prompt | 对话中描述需求 |

---

## 调用方式（各工具说明）

### Kiro

在这个环境里，这 6 个 skill 一般不用敲特殊命令，你直接在对话里点名或者说阶段目标就行，AI 会按对应 skill 走。

你可以这样调用：

- **design**
  - 例子：`用 design skill，帮我根据这张图生成 DESIGN.md`
  - 作用：先定项目级设计规范

- **spec**
  - 例子：`进入 spec 阶段，帮我生成这个页面的 UI_SPEC.md`
  - 作用：拆页面结构、字段、交互

- **handoff**
  - 例子：`用 handoff，把 UI_SPEC.md 转成 Handoff.md`
  - 作用：把设计说明变成开发任务书

- **implement**
  - 例子：`进入 implement，按 Handoff.md 开始改代码`
  - 作用：真正改页面代码

- **verify**
  - 例子：`用 verify 验收这个页面，我给你参考图`
  - 作用：做截图对比，出偏差报告

- **deliver**
  - 例子：`进入 deliver，判断现在能不能交付`
  - 作用：出最终交付结论和 delivery-report.md

你也可以不点 skill 名，直接说阶段目标，AI 会自动判断，比如：
- `我想先做这个项目的设计规范`
- `帮我拆这个页面需求`
- `把这个页面需求整理成交付任务书`
- `按任务书开始实现`
- `帮我验收一下现在页面和参考图差多少`
- `现在能不能交付`

### Claude Code

Claude Code 支持 slash command，最直接的方式是输入命令名：

- `/design`
- `/spec`
- `/handoff`
- `/implement`
- `/verify`
- `/deliver`

也可以直接用自然语言描述目标，AI 会根据已安装的 command 内容判断是否进入对应阶段。

### OpenAI Codex CLI

Codex CLI 没有这套 slash command 触发方式，推荐直接在对话里说阶段目标或明确点名 skill：

- `用 design，帮我初始化这个项目的设计规范`
- `进入 spec，帮我拆这个页面`
- `用 handoff，把 UI_SPEC.md 转成交付任务书`
- `进入 implement，按任务书开始实现`
- `用 verify 验收这个页面`
- `进入 deliver，判断是否可交付`

如果已经把 `codex.md` 追加进 `~/.codex/instructions.md`，Codex 会根据这些描述自动按对应 skill 的规则执行。

### Cursor

Cursor 主要通过规则文件 + 自然语言触发，不是 slash command：

- `用 design 先做设计规范`
- `进入 spec，拆这个页面的 UI`
- `用 handoff 生成任务书`
- `进入 implement 开始改代码`
- `用 verify 对照参考图验收`
- `进入 deliver 输出交付结论`

如果已经把对应 `.mdc` 文件放进 `.cursor/rules/`，Cursor 会把这些规则带入上下文。

### Windsurf

Windsurf 的调用方式和 Cursor 类似，推荐直接在对话里说明阶段：

- `用 design`
- `进入 spec`
- `进入 handoff`
- `进入 implement`
- `用 verify`
- `进入 deliver`

或者直接说阶段目标，AI 会结合 rules 文件自动判断。

### Trae

Trae 同样建议用自然语言触发：

- `用 design 生成 DESIGN.md`
- `进入 spec 生成 UI_SPEC.md`
- `用 handoff 生成 Handoff.md`
- `进入 implement 改代码`
- `用 verify 验收`
- `进入 deliver 出交付报告`

### Google Antigravity

Antigravity 的规则文件写入项目根目录的 `GEMINI.md`，安装后直接用自然语言触发：

- `用 design 生成 DESIGN.md`
- `进入 spec 生成 UI_SPEC.md`
- `用 handoff 生成 Handoff.md`
- `进入 implement 改代码`
- `用 verify 验收`
- `进入 deliver 出交付报告`

### 通用方式（任何 AI 工具）

如果某个工具不支持 rules / commands / slash command，最简单的方法是：
1. 打开对应 skill 目录下的 `skill.md` 或 `adapters/system-prompt.md`
2. 把内容粘贴到 system prompt 或对话开头
3. 再用自然语言说明你的阶段目标

例如：
- `请按 design 这套规则，帮我先生成项目的 DESIGN.md`
- `请按 spec 这套规则，拆解这个页面`

## 安装

### Kiro / Claude Code（slash command）

```bash
cp 01-design/adapters/kiro.md ~/.claude/commands/design.md
cp 02-spec/adapters/kiro.md ~/.claude/commands/spec.md
cp 03-handoff/adapters/kiro.md ~/.claude/commands/handoff.md
cp 04-implement/adapters/kiro.md ~/.claude/commands/implement.md
cp 05-verify/adapters/kiro.md ~/.claude/commands/verify.md
cp 06-deliver/adapters/kiro.md ~/.claude/commands/deliver.md

# verify 的 Workflow 自动化版本（可选）
cp workflows/screenshot-verify/workflow.js ~/.claude/workflows/screenshot-verify.js
```

Claude Code 用户把上面的 `kiro.md` 换成 `claude-code.md`，安装路径相同。

触发：`/design`、`/spec`、`/handoff`、`/implement`、`/verify`、`/deliver`

### OpenAI Codex CLI

```bash
# 全局安装（所有项目生效）
cat 01-design/adapters/codex.md >> ~/.codex/instructions.md
cat 02-spec/adapters/codex.md >> ~/.codex/instructions.md
cat 03-handoff/adapters/codex.md >> ~/.codex/instructions.md
cat 04-implement/adapters/codex.md >> ~/.codex/instructions.md
cat 05-verify/adapters/codex.md >> ~/.codex/instructions.md
cat 06-deliver/adapters/codex.md >> ~/.codex/instructions.md

# 或者只在某个项目中启用（放在项目根目录）
cat 01-design/adapters/codex.md > codex.md
cat 02-spec/adapters/codex.md >> codex.md
cat 03-handoff/adapters/codex.md >> codex.md
cat 04-implement/adapters/codex.md >> codex.md
cat 05-verify/adapters/codex.md >> codex.md
cat 06-deliver/adapters/codex.md >> codex.md
```

### Cursor

```bash
mkdir -p .cursor/rules
cp 01-design/adapters/cursor.mdc .cursor/rules/design.mdc
cp 02-spec/adapters/cursor.mdc .cursor/rules/spec.mdc
cp 03-handoff/adapters/cursor.mdc .cursor/rules/handoff.mdc
cp 04-implement/adapters/cursor.mdc .cursor/rules/implement.mdc
cp 05-verify/adapters/cursor.mdc .cursor/rules/verify.mdc
cp 06-deliver/adapters/cursor.mdc .cursor/rules/deliver.mdc
```

### Windsurf

```bash
mkdir -p .windsurf/rules
cp 01-design/adapters/windsurf.md .windsurf/rules/design.md
cp 02-spec/adapters/windsurf.md .windsurf/rules/spec.md
cp 03-handoff/adapters/windsurf.md .windsurf/rules/handoff.md
cp 04-implement/adapters/windsurf.md .windsurf/rules/implement.md
cp 05-verify/adapters/windsurf.md .windsurf/rules/verify.md
cp 06-deliver/adapters/windsurf.md .windsurf/rules/deliver.md
```

### Trae

```bash
mkdir -p .trae/rules
cp 01-design/adapters/trae.md .trae/rules/design.md
cp 02-spec/adapters/trae.md .trae/rules/spec.md
cp 03-handoff/adapters/trae.md .trae/rules/handoff.md
cp 04-implement/adapters/trae.md .trae/rules/implement.md
cp 05-verify/adapters/trae.md .trae/rules/verify.md
cp 06-deliver/adapters/trae.md .trae/rules/deliver.md
```

### Google Antigravity

将所有 skill 的内容合并追加到项目根目录的 `GEMINI.md`：

```bash
cat 01-design/adapters/antigravity.md >> GEMINI.md
cat 02-spec/adapters/antigravity.md >> GEMINI.md
cat 03-handoff/adapters/antigravity.md >> GEMINI.md
cat 04-implement/adapters/antigravity.md >> GEMINI.md
cat 05-verify/adapters/antigravity.md >> GEMINI.md
cat 06-deliver/adapters/antigravity.md >> GEMINI.md
```

### 通用（任何 AI 工具）

```bash
cat 01-design/adapters/system-prompt.md
```

复制输出内容，粘贴到 AI 工具的 system prompt 或对话开头，然后描述需求即可。

---

## 上下游依赖关系

每个 skill 的 `skill.md` 使用语义引用（如 `→ spec`），不依赖特定工具的语法：

- 通用格式：`skill.md` 中写 `→ spec`
- Kiro/Claude Code adapter：自动转成 `/spec`
- Cursor/Windsurf/Trae adapter：保持语义引用 `→ spec`，模型理解后触发
- Codex CLI / system-prompt：保持语义引用，模型按上下文理解执行

这样无论在哪个工具里，skill 之间的依赖关系都能正常工作。

---

## 目录结构

```
skill/
├── 01-design/
│   ├── skill.md              # 通用格式（工具无关，语义引用）
│   ├── README.md             # 说明文档
│   └── adapters/
│       ├── kiro.md
│       ├── claude-code.md
│       ├── cursor.mdc
│       ├── windsurf.md
│       ├── trae.md
│       ├── codex.md
│       ├── antigravity.md
│       └── system-prompt.md
├── 02-spec/
├── 03-handoff/
├── 04-implement/
├── 05-verify/
├── 06-deliver/
├── workflows/
│   └── screenshot-verify/    # verify 的 Workflow 自动化版本
│       ├── workflow.js
│       └── README.md
└── README.md                 # 本文件
```

`skill.md` 是工具无关的通用格式，上下游引用使用语义写法（`→ spec`）。各工具的 adapter 会转换成对应格式：Kiro/Claude Code 转为 `/spec`，Cursor/Windsurf/Trae 保持语义引用，模型直接理解。

---

## 设计思路

**为什么要分成 6 个阶段**

每个阶段都有明确的输入输出和暂停点，AI 不会自动触发下一步，每次都等用户确认。这样每个阶段的产物都是可以审查和调整的，不会一路跑到底发现问题再回头。

**为什么每个 skill 有独立的 adapter**

不同工具对规则文件的格式要求差异很大：Cursor 需要 YAML frontmatter，Windsurf/Trae 需要注释标记，Kiro/Claude Code 需要 slash command 格式。统一格式会让每个工具都有些地方用不上或不兼容，所以每个工具有自己的 adapter，按各自规范写。

**为什么要对齐 Google DESIGN.md 规范**

Google 的 DESIGN.md 格式解决了 AI 理解设计系统时最常见的问题：token 引用关系不清晰、不知道颜色该用在哪、组件样式不一致。这套 skill 的 design 阶段完全按 Google 官方 spec 生成 DESIGN.md，支持 `@google/design.md` CLI 验证工具。

---

## 产出文件

每个项目使用这套 skill 后，会在项目目录生成以下文件：

| 文件 | 由哪个 skill 生成 | 用途 |
|------|------------------|------|
| `DESIGN.md` | design | 项目级设计规范，包含所有 token |
| `UI_SPEC.md` / `UI_SPEC_*.md` | spec | 单页面结构规格 |
| `Handoff.md` | handoff | 开发任务书，含验收标准 |
| `delivery-report.md` | deliver | 交付报告 |

---

## License

MIT
