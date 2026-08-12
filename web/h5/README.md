# web/h5 —— 移动端 H5（React + antd-mobile + Vite）

开箱即用的移动端 H5 工程，已对接后端。

- 技术栈：React 19 + TypeScript + Vite + antd-mobile 5 + react-router-dom + axios
- UI 规范：Ant Design Mobile（与 PC 端 antd 同源设计规范）
- 已内置：`<NavBar>/<Card>/<Button>` 示范页 + 对接后端 `/captchaImage` 的 axios 封装（含 token 拦截、/dev-api 代理）

## 开发

```bash
pnpm install
pnpm dev        # 默认 http://localhost:8081
```

Vite 已配置 `/dev-api` 代理到 `http://localhost:8080`（后端），与 `web/admin` 约定一致。

## 构建

```bash
pnpm build      # 产物在 dist/
pnpm preview
```

## 对接后端

- 接口 baseURL：`/dev-api`（见 `src/api/request.ts`）
- 登录后把后端返回的 `token` 写入 `localStorage['token']`，请求拦截器自动携带 `Authorization: Bearer <token>`
- 后端运行要求见根目录 `README.md` 与 `infra/docker-compose.yml`
