# HarmonyOS 客户端

`web/harmony` 是独立的 Taro + React + TypeScript HarmonyOS 工程，使用 `@tarojs/plugin-platform-harmony-cpp`。它拥有独立源码、依赖、锁文件、存储键和平台登录契约。

## 版本基线

- Node.js `24.19.0` LTS（见 `.node-version`），pnpm `11.21.0`
- Taro 全家桶 `4.2.1`，TypeScript `7.0.2`
- React `18.3.1`，Vite `4.5.14`，`@vitejs/plugin-react` `4.7.0`

Taro 4.2.1 的 React 插件官方 peer 约束为 React 18，Harmony 使用的 Taro Vite runner 官方 peer 约束为 Vite 4；因此这里使用 Taro 当前支持的最新稳定组合，不越过官方兼容边界升级到 React 19 或 Vite 8。Taro 发布支持新主版本的稳定版后再整体升级，并重新执行类型检查、Taro 构建和 DevEco 原生回归。

## 开发与构建

```bash
pnpm install
pnpm type-check
pnpm build:harmony
pnpm dev:harmony
```

生成原生代码后，可使用 DevEco Studio 自带的 Node.js、ohpm 与 Hvigor 6.1.1 工具链完成未签名 HAP 构建：

```bash
cd native
NODE_HOME=/Applications/DevEco-Studio.app/Contents/tools/node \
  /Applications/DevEco-Studio.app/Contents/tools/ohpm/bin/ohpm install --all
NODE_HOME=/Applications/DevEco-Studio.app/Contents/tools/node \
DEVECO_SDK_HOME=/Applications/DevEco-Studio.app/Contents/sdk \
  /Applications/DevEco-Studio.app/Contents/tools/hvigor/bin/hvigorw \
  --mode module -p module=default@default -p product=default \
  -p requiredDeviceType=phone assembleHap --no-daemon
```

Hvigor 的 HarmonyOS 构建插件由 DevEco Studio 6.1.1 工具链提供，工程不再声明官方 ohpm 仓库中不存在的 `@ohos/hvigor-ohos-plugin@5.0.0`。`native/hvigor/hvigor-config.json5` 的模型版本与 DevEco Studio 6.1.1 保持一致；其他安装位置通过等价的 `NODE_HOME`、`DEVECO_SDK_HOME` 和工具绝对路径执行。开发调试构建输出未签名 HAP，发布签名只能在 DevEco Studio 中使用团队证书配置，证书与密钥不得提交仓库。

Taro 4.2.1 的 Harmony 模板在 API 24 的 ArkTS 严格检查下会生成“使用前未赋值”的内存等级变量；`patches/@tarojs__vite-runner@4.2.1.patch` 以最小初始化修正模板，并由 pnpm 锁文件校验应用。升级 Taro 后必须先验证上游是否已修复，再删除补丁和 `patchedDependencies` 配置。

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

Taro 构建负责生成 Stage 工程代码；提交前仍需使用 DevEco Studio 6.1.1 / API 24 完成原生 HAP 编译，并在真机或模拟器验证登录链路。

开发配置默认使用 `http://localhost:8082`，只适用于本机预览或模拟环境；HarmonyOS 真机上的 `localhost` 指向设备自身，联调前必须在 `.env.development` 中改为局域网可访问的 Client Gateway 地址。
