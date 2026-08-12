# H5 独立工程

React + Vite + antd-mobile 移动 H5。本工程不引用其他前端的代码或依赖。

## 命令

```bash
pnpm install
pnpm dev
pnpm lint
pnpm build
```

## 结构

- `src/api/`：H5 独立请求层，处理 `clientid`、Bearer Token 和接口加密。
- `src/stores/`：会话状态和 401 失效处理。
- `src/router/`：公开/受保护路由和页面级懒加载。
- `src/features/`：按业务能力分组。
- `src/theme/`：本端独立的设计 Token 适配。

开发环境使用 `.env.development` 的 `/dev-api` 代理到 Client `8082`；生产环境使用 `.env.production` 的 `/prod-api` 经 Client Gateway 转发。
