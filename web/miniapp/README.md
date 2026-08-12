# web/miniapp —— 微信小程序 / 多端（Taro + React + TypeScript）

由 Taro v4 官方模板等价结构落地（React DSL，可一套代码编译到 微信/支付宝/百度/字节/QQ/京东 小程序、H5、React Native、以及鸿蒙 harmony-cpp）。

> 说明：本环境无交互式 TTY，`taro init` 无法自动回答「框架选择」等交互问题，故按官方 `taro init` 产出结构手搭了完全等价的工程，可直接 `pnpm install` 运行。

- 技术栈：Taro 4.2.1 + React 18 + TypeScript + Sass
- 已包含平台：weapp / h5 / alipay / swan / tt / qq / jd / rn / harmony
- 示范页：`src/pages/index`

## 安装

```bash
cd web/miniapp
pnpm install
```

## 开发

```bash
pnpm dev:weapp    # 微信小程序（用微信开发者工具打开 dist/ 目录）
pnpm dev:h5       # H5
pnpm dev:rn       # React Native
pnpm dev:harmony  # 鸿蒙（需 @tarojs/plugin-platform-harmony-cpp，见 Taro 官方鸿蒙文档）
```

## 构建

```bash
pnpm build:weapp  # 产物在 dist/
```

## 对接后端

在 `src/` 下封装请求层调用后端 `http://localhost:8080`（小程序建议用 `tarojs/axios` 或 `Taro.request`）。
