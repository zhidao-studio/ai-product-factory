# PC Admin 前端

`web/admin` 是独立的 PC 运营管理工程，只对接 Admin Backend `8080`。它不直接调用 Client Backend，不使用 Client Token，也不与 H5、App、小程序或 HarmonyOS 共享源码包。

开始修改前请阅读：

- [工程现状](../../docs/工程现状.md)
- [根工程约束](../../CLAUDE.md)
- [Web 工程约束](../CLAUDE.md)
- [AI 设计系统上下文](../../docs/AI-设计系统上下文.md)
- [PC Web 平台适配](../../docs/平台适配/PC-Web.md)

## 技术栈

- React 19 + TypeScript
- Umi Max 4
- Ant Design 6 + ProComponents
- ahooks、TanStack Query、Zustand
- pnpm

## 运行与验证

```bash
pnpm install
pnpm dev
```

开发地址为 `http://localhost:8000`，请求通过开发代理进入 Admin Backend `8080`。

```bash
pnpm lint
pnpm build
```

`pnpm lint` 包含 TypeScript 检查；修改页面、API、生成模板或公共组件后，至少按影响范围执行上述命令。

## 目录职责

```text
web/admin/
├── src/api/            # Admin 浏览器契约与请求封装
├── src/pages/          # Admin 管理页面
├── src/components/     # 本工程内通用组件
├── src/hooks/          # 本工程内 hooks
├── src/theme/          # 设计 Token 镜像与主题配置
└── gen/                # React/TSX FreeMarker 生成模板
```

运行时代码生成的唯一事实源是 `backend/ruoyi-admin/ruoyi-gen/src/main/resources/fm/react/`。本工程的 `gen/` 是便于前端开发和 AI 查阅的镜像，单独修改它不会影响后端生成器；如确需调整生成结果，必须先修改后端运行时模板，再同步此镜像。

## 接口边界

- Admin 登录、权限、系统管理接口均进入 Admin Backend。
- 应用用户和接入客户端的浏览器管理路径仍为 `/client/user/**` 与 `/client/application/**`，但由 Admin Backend 检查管理员权限和记录日志。
- Admin Backend 再使用私有服务签名调用 Client；浏览器不知道 `/internal/admin/**`，也不得直连 Client Backend。
- API 字段以真实 Admin Controller/VO 为准，页面不得为了显示需求虚构后端字段。

## 页面实现规则

- 标准列表优先复用 `ProTable`、`ModalForm`、`RowActions`、`useTableSelection`、`useDateRangeQuery` 和 `useTableExport`。
- 优先阅读同目录最相似的真实页面，再参考后端 `fm/react/*.ftl` 事实源并核对 `gen/` 镜像；不引入第二套路由、请求、状态或表格体系。
- 修改 UI 前必须读取设计系统与 PC Web 规范；样式只使用本工程 Token。
- 危险操作使用 `danger` 与二次确认，每个页面不制造多个主操作。
- 五端只统一设计语义和后端契约；不为“复用”建立跨前端共享运行包。

## 上游参考

本工程来源于 RuoYi React 前端生态，但当前仓库的页面、工具、契约和设计系统更高优先。上游文档只用于理解原始框架，不得覆盖本项目的 Admin/Client 分界。
