# 项目 UI 规范（AI 必读）

本项目前端（React / React Native + Ant Design 全家桶）严格遵循一套**多端 UI/UX 设计规范**。

## 生成任何 UI / 样式 / 高保真描述前，必须先读取并遵守：

- **`docs/AI-设计系统上下文.md`** ← 硬约束（MUST / NEVER）、精确 Design Token、组件代码范式、跨端差异、反模式、生成前自检清单。**这是 AI 的"宪法"，所有 UI 生成以它为准。**
- `docs/design-tokens.json` ← 机器可读 Token 单源（LLM 可直接 import，或贴进 prompt）
- `docs/design-tokens.ts` ← 类型化绑定，直接喂 antd `ConfigProvider`

## 分层原则（关键，避免把平台规则与通用规则搞混）

1. **通用层（全端一致）**：Token、设计原则、组件定义、UX 准则、图表规范、错误文案 —— 直接套，绝不按端分支。
2. **平台层（仅对应端生效）**：导航范式、手势、安全区、小程序胶囊、断点、组件落地选型（Table→List、Select→Picker、Message→Toast），从 `docs/平台适配/<端>.md` 取。
3. **页面模板 = 通用骨架 + 各端实例化**（PC 用 Table/Menu/Drawer，移动端用 List/NavBar+TabBar/全屏 Drawer）。

## 硬约束速记（完整见上述文件）

- 主色永远 `#1677FF`；改色只改 Seed `colorPrimary`。
- 所有颜色/间距/圆角/字号来自 Token，禁止硬编码魔法值；间距为 8 的倍数。
- 禁止移动端用 `Table`（改用 `List` + 触底加载）。
- 主操作每屏至多 1 个 `primary`；危险操作 `danger` + 二次确认。
- 暗色模式用 `theme.darkAlgorithm` 派生；组件优先用 antd / antd-mobile / antd-mini 原组件。

> 任何业务需求与上述规范冲突时，**以规范为准**。

完整规范索引：`docs/README.md`
