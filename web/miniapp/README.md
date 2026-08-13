# 微信小程序端

`web/miniapp` 是独立的 Taro + React + TypeScript 微信小程序工程，不承载 H5、React Native 或 HarmonyOS 构建。

## 版本基线

- Node.js `24.19.0` LTS（见 `.node-version`），pnpm `11.21.0`
- Taro 全家桶 `4.2.1`，TypeScript `7.0.2`
- React `18.3.1`，webpack `5.91.0`

Taro 4.2.1 的 React 插件官方 peer 约束为 React 18，webpack runner 也将 webpack 精确约束为 5.91.0；因此这两项使用 Taro 当前支持的最新稳定组合，不越过官方兼容边界升级到 React 19 或其他 webpack 版本。Taro 发布支持新主版本的稳定版后再整体升级，并重新执行类型检查与微信小程序构建。

## 开发与构建

```bash
pnpm install
pnpm type-check
pnpm dev:weapp
pnpm build:weapp
```

微信开发者工具打开 `dist/` 目录。开发与生产 API 地址分别配置在 `.env.development`、`.env.production`，构建时由 Taro 静态注入；真机或发布前必须改为已在微信公众平台配置合法域名的 HTTPS Client Gateway。

## 认证契约

- 客户端标识：`7f4c1e2d8a9b4c6f9012d3e4f5a6b7c8`
- 登录：`Taro.login()` 获取 `xcxCode`，然后请求 `POST /auth/login`，`grantType=xcx`
- 用户信息：`GET /client/user/info`
- 退出：`POST /auth/logout`
- 请求层使用 `Taro.request`，加密随机数使用微信小程序的 `Taro.getRandomValues`。
