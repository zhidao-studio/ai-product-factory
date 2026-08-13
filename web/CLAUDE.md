# 前端规范指针（web 作用域）

本目录（web）包含五个彼此独立的前端工程：admin（PC/antd）、h5（antd-mobile）、app（React Native）、miniapp（微信 Taro）和 harmony（HarmonyOS Taro）。各工程不得共享运行时源码、依赖包或构建产物。

## UI 规范
生成任何 UI / 样式 / 高保真描述前，必须先读取并遵守：
- **`../docs/AI-设计系统上下文.md`** ← 硬约束（MUST/NEVER）、精确 Design Token、组件代码范式、跨端差异、自检清单。
- Token 单源：`../docs/design-tokens.json` / `../docs/design-tokens.ts`
- 平台差异：`../docs/平台适配/`

主色永远 `#1677FF`，禁止移动端用 `Table`，间距为 8 的倍数。完整规范见 `../docs/README.md`。

## 前后端对接
所有接口对接严格遵循 **根目录 `../CLAUDE.md` 第 4 节「后端接口契约」**（R 返回体、Sa-Token、`/auth/code`、`/auth/login` 等）。Admin 只连接 `ruoyi-admin:8080`；H5、App、微信小程序和 HarmonyOS 只连接 `ruoyi-client:8082`，不得跨身份域复用 clientid 或 Token。
- 每端请求层：`src/api/request.ts`（与后端 `@ApiEncrypt` 加密、R 解包、401 处理一致）。
- 新增接口：在 `src/api/<模块>.ts` 封装，返回 `R<X>`，页面只消费业务体。
- 禁止臆造接口路径/字段；以后端 `backend/.../controller/*.java` 为准。
