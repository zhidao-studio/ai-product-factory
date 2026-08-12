# 前端规范指针（web 作用域）

本目录（web）包含四端前端：admin（PC/antd）、h5（antd-mobile）、app（React Native）、miniapp（Taro）。

## UI 规范
生成任何 UI / 样式 / 高保真描述前，必须先读取并遵守：
- **`../docs/AI-设计系统上下文.md`** ← 硬约束（MUST/NEVER）、精确 Design Token、组件代码范式、跨端差异、自检清单。
- Token 单源：`../docs/design-tokens.json` / `../docs/design-tokens.ts`
- 平台差异：`../docs/平台适配/`

主色永远 `#1677FF`，禁止移动端用 `Table`，间距为 8 的倍数。完整规范见 `../docs/README.md`。

## 前后端对接
所有接口对接严格遵循 **根目录 `../CLAUDE.md` 第 2 节「后端接口契约」**（R 返回体、`/dev-api` 代理、Sa-Token、`/auth/code`、`/auth/login` 等）。
- 每端请求层：`src/api/request.ts`（与后端 `@ApiEncrypt` 加密、R 解包、401 处理一致）。
- 新增接口：在 `src/api/<模块>.ts` 封装，返回 `R<X>`，页面只消费业务体。
- 禁止臆造接口路径/字段；以后端 `backend/.../controller/*.java` 为准。
