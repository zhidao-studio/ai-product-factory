# AGENTS.md

本文件是 `ai-product-factory` 的 AI 助手快速入口。完整结构、运行方式和真实接口契约以 [CLAUDE.md](./CLAUDE.md) 为准。

## 项目定位

这是一个可复制的中大型多端产品脚手架，不是“AI 产品工厂”自身的业务。复制后再按具体产品填充共享业务域。

业务关系必须理解为：**先有 Client 用户业务，再有围绕同一业务进行运营和管理的 Admin 后台。** 两端入口和身份隔离，核心业务规则和业务数据统一。

五个前端完全独立，不共享源码、依赖、锁文件或运行时包：

- `web/admin`：PC 管理后台
- `web/h5`：移动 H5
- `web/app`：iOS / Android App
- `web/miniapp`：微信小程序
- `web/harmony`：HarmonyOS

## 必须遵守

1. 生成 UI 前阅读 `docs/AI-设计系统上下文.md`，Design Token 是唯一事实来源。
2. 前端只能接入 `CLAUDE.md` 第 4 节及真实 Controller 已存在的接口。
3. 禁止建立前端共享包或跨 `web/<end>` 引用源码。
4. Admin 管理员与 Client 产品用户不得共用用户表、Token、权限模型或 clientid。
5. Admin 和 Client 对业务数据的写入都必须经过同一业务域，禁止在管理端复制业务规则或直接绕过领域更新表。

## 后端边界

- `backend/ruoyi-admin`：Admin 启动入口，端口 `8080`。
- `backend/ruoyi-client`：四个用户端统一 Client 启动入口，端口 `8082`。
- `backend/ruoyi-interfaces`：Admin / Client HTTP 接口。
- `backend/ruoyi-applications`：管理用例和用户用例编排。
- `backend/ruoyi-domains`：产品用户域及后续共享产品业务域。
- `backend/ruoyi-security`：Admin / Client 两套身份安全策略。
- `backend/ruoyi-admin-modules`：系统管理、工作流、代码生成、任务等后台能力。
- `backend/ruoyi-infrastructure`：数据库、中间件适配。
- `backend/ruoyi-integrations`：微信、短信等外部平台适配。
- `backend/ruoyi-common`：纯技术底座；不得放产品用户、管理员主体或业务 DTO。

不存在 `ruoyi-channel-h5/app/miniapp/harmony`。四个用户端统一使用 Client API，平台差异由认证/集成适配器处理。

## 接口速览

- Admin：`GET /auth/code`、`POST /auth/login`、`GET /system/user/getInfo`。
- Client：`GET /client-auth/code`、`POST /client-auth/login`、`POST /client-auth/logout`、`GET /client-api/v1/session`。
- Client 短信：`GET /client-resource/sms/code?phoneNumber=...`。
- 受保护请求必须同时携带 `Authorization: Bearer <token>` 和本端 `clientid`。
- Admin 默认账号：`admin / admin123`。
- Client 默认账号：`client / admin123`，手机号 `13800138000`。

## 常用操作

- 启动双入口：`bash scripts/start-dev.sh`
- 停止并保留数据：`bash scripts/stop-dev.sh`
- 编译后端：`cd backend && ./mvnw -B -pl ruoyi-admin,ruoyi-client -am -DskipTests compile`
- 新增产品业务：在 `backend/ruoyi-domains` 下按真实边界建立领域模块，再分别在 Admin/Client application 和 interface 中暴露用例。
