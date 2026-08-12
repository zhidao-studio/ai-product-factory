# Admin 独立工程

该工程独立拥有 Umi 路由、Zustand 状态、Axios 请求层、Ant Design 主题适配、pnpm 锁文件和 Docker/Nginx 交付配置。

- 页面：`src/pages/`
- 后端契约：`src/services/`
- 通用组件：`src/components/`（仅本工程内复用）
- 主题：`src/theme/`
- 构建门禁：`pnpm lint && pnpm build:prod`

禁止从 `web/h5`、`web/app`、`web/miniapp` 或 `web/harmony` 相对引用源码，也不将本工程组件发布成强制共享包。
