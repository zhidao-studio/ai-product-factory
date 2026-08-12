# 微信小程序端独立工程 (WeChat Mini-Program)

Taro + React + TypeScript 独立工程，**仅构建微信小程序**。请求层直接使用 `Taro.request`，
不依赖浏览器 Axios 适配器。本工程与 `web/harmony`（鸿蒙端）平级、完全独立、互不共享代码，
符合「多端工程分开」的架构约定。

## 命令

```bash
pnpm install
pnpm type-check
pnpm build:weapp   # 产出微信小程序工程 → dist/
pnpm dev:weapp     # 监听构建
```

## 环境变量

- `TARO_APP_API_BASE_URL`：小程序/生产环境的绝对 HTTPS API 域名。
- `TARO_APP_WECHAT_APP_ID`：微信小程序 AppID。

后端 `ruoyi-client` 需配置 `WECHAT_MINI_APP_ID` 和 `WECHAT_MINI_APP_SECRET`。微信登录身份写入
`client_identity`，首次登录创建 `client_user`；不会读取 Admin 的 `sys_user/sys_social`。
