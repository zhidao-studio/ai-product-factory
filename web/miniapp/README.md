# 微信小程序端

`web/miniapp` 是独立的 Taro + React + TypeScript 微信小程序工程，不承载 H5、React Native 或 HarmonyOS 构建。

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
