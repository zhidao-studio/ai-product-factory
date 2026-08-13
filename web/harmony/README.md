# HarmonyOS 客户端

`web/harmony` 是独立的 Taro + React + TypeScript HarmonyOS 工程，使用 `@tarojs/plugin-platform-harmony-cpp`。它拥有独立源码、依赖、锁文件、存储键和平台登录契约。

## 开发与构建

```bash
pnpm install
pnpm type-check
pnpm build:harmony
pnpm dev:harmony
```

Taro 配置按插件文档使用 Vite，并显式设置：

- `harmony.compiler: 'vite'`
- `harmony.projectPath: <当前工程>/native`
- `harmony.hapName: 'entry'`

`native/` 只提交 Stage 工程配置骨架。Taro 生成的 ETS、HAR、`static/`、`dist/` 和依赖目录均已忽略，不进入版本库。

## 认证契约

- client id：`9c8b7a6d5e4f3210a1b2c3d4e5f60718`
- 账号密码：`POST /auth/login`，`grantType=password`
- 短信登录：`GET /resource/sms/code` + `POST /auth/login`，`grantType=sms`
- 用户信息：`GET /client/user/info`

## HarmonyOS 原生能力边界

Taro 4.2.1 的 harmony-cpp 运行时没有实现 `Taro.getRandomValues` 和同步 Storage API。本工程不调用这些兼容层：

- 登录请求的 AES 密钥由 HarmonyOS `@ohos.security.cryptoFramework` 生成密码学安全随机数。
- 按 RuoYi 传输加密契约，将 16 字节安全随机熵编码为 32 位 hex 密码；AES-256/ECB/PKCS7 请求体加解密和 RSA-1024/PKCS1 密钥交换均使用 Crypto Framework，不打包 Web Crypto 兼容层或 JavaScript 随机回退。
- Token 与主题偏好由 HarmonyOS `@ohos.data.preferences` 持久化，并通过 Taro 已初始化的 UIAbility Context 获取实例。

Taro 构建只负责生成 Stage 工程代码；提交前仍需使用 DevEco Studio 在 API 12+ 真机或模拟器完成 HAP 编译和登录链路验证。

开发配置默认使用 `http://localhost:8082`，只适用于本机预览或模拟环境；HarmonyOS 真机上的 `localhost` 指向设备自身，联调前必须在 `.env.development` 中改为局域网可访问的 Client Gateway 地址。
