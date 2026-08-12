# H5 产品端

`web/h5` 是独立的 React + TypeScript + Vite + antd-mobile 工程，只对接 Client 后端。

## 开发与构建

```bash
pnpm install
pnpm dev
pnpm lint
pnpm build
```

开发服务在 `http://localhost:8081` 启动，`/dev-api` 代理到 Client 后端 `http://localhost:8082`。

## 认证契约

- client id：`8f6e7d5c4b3a2910fedcba9876543210`
- 登录：`POST /auth/login`，`grantType=password`
- 当前用户：`GET /client/user/info`
- 退出：`POST /auth/logout`
- Token 存储键：`Client-H5-Token`
- 开发环境产品用户：`client / admin123`
