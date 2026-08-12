# 鸿蒙端独立工程 (HarmonyOS)

Taro + React + TypeScript 独立工程，**仅构建 HarmonyOS**（通过 `@tarojs/plugin-platform-harmony-cpp`）。
本工程与 `web/miniapp`（微信小程序端）平级、完全独立、互不共享代码，符合「多端工程分开」的架构约定。

## 命令

```bash
pnpm install
pnpm type-check
pnpm build:harmony   # 将 Taro 页面编译进 native/entry/src/main/ets/
pnpm dev:harmony     # 监听构建
pnpm build:h5        # 浏览器预览（开发期调试用，非正式产物）
```

## 环境变量

- `TARO_APP_API_BASE_URL`：鸿蒙端的绝对 HTTPS API 域名。
- `TARO_APP_HARMONY_APP_ID`：鸿蒙应用标识（按需）。

## 说明

- 请求层使用 `Taro.request`，不依赖浏览器 Axios 适配器。
- `native/` 是 Stage 模型工程骨架；先执行 `pnpm build:harmony` 生成 ETS 与运行库，再用 DevEco Studio 打开并同步 OHPM 依赖。
- 设计 Token 对齐 `docs/design-tokens.{json,ts}`，平台规范见 `docs/平台适配/HarmonyOS.md`。
- 后端按 `CLAUDE.md` §4 的 Client 契约对接，统一使用 `/client-*` 接口和 HarmonyOS 独立 clientid；不使用微信 `xcx` 登录。
