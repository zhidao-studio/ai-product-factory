# AGENTS.md

本文是 `ai-product-factory` 的 Agent 快速入口。完整工程约束、接口契约和运行说明见 [CLAUDE.md](./CLAUDE.md)。

## 项目定位

这是一个供复制后填充产品业务的中大型多端脚手架，不承载“AI 产品工厂”自身业务。

- `ruoyi-admin`：后台管理服务，只对接 PC Admin，端口 `8080`。
- `ruoyi-client`：产品用户服务，对接 H5、App、微信小程序、HarmonyOS，端口 `8082`。
- Admin 身份使用 `sys_*`；产品用户身份使用 `client_*`，两套身份数据隔离。
- Admin 运营和管理 Client 的同一份产品业务数据；产品业务不是两套。
- 五个前端都是独立工程，禁止运行时源码共享、公共包共享或跨工程引用。

## 不可违反的规则

1. 生成或修改 UI 前，完整读取 `docs/AI-设计系统上下文.md` 和对应的 `docs/平台适配/<端>.md`；Token 是唯一样式来源。
2. 前端契约必须以后端真实 Controller 与 VO 为准，禁止发明接口路径或返回字段。
3. 后端沿用 RuoYi 的 `controller / service / mapper / domain.bo / domain.vo`、MyBatis-Plus、`R<T>` 与现有认证策略写法，禁止另造 DDD/Port/JdbcTemplate 体系。
4. 共享产品模块只放实体、Mapper、Service 等业务能力；Admin/Client Controller 与认证逻辑分别放进各自启动工程。
5. 新增业务模块放在 `backend/ruoyi-modules/`，不要批量改名原模块，也不要提前创建无实现的空壳模块。

## 关键目录

- Admin 启动入口：`backend/ruoyi-admin/`
- Client 启动入口：`backend/ruoyi-client/`
- 业务模块：`backend/ruoyi-modules/`
- 产品用户身份模块：`backend/ruoyi-modules/ruoyi-client-system/`
- 五个独立前端：`web/admin`、`web/h5`、`web/app`、`web/miniapp`、`web/harmony`
- 各端请求层：`web/<端>/src/api/request.ts`
- 初始化 SQL：`infra/init/01-init.sql`；多数据库脚本：`backend/script/sql/`
- 设计系统：`docs/`
- 一键开发：`scripts/start-dev.sh`、`scripts/stop-dev.sh`

## 契约速览

- 统一返回：`R<T> = { code, msg, data }`，`code=200` 表示成功。
- 所有受保护请求同时携带 `Authorization: Bearer <token>` 和 `clientid`。
- 登录 `POST /auth/login` 使用 AES+RSA 请求体加密，请求头为 `encrypt-key`。
- Admin 当前用户：`GET /system/user/getInfo`。
- Client 当前用户：`GET /client/user/info`。
- Admin 开发账号：`admin / admin123`；Client 开发账号：`client / admin123`。

## 常见任务

- 启动完整开发后端：`bash scripts/start-dev.sh`。
- 新增产品业务：在 `ruoyi-modules` 建真实业务模块，让 Admin/Client 按需依赖；两侧接口放各自启动工程。
- 新增前端接口：只修改目标前端自己的 `src/api/<模块>.ts`，返回类型逐字段对齐后端 VO。
- 新增 UI：先从 `docs/design-tokens.*` 与对应平台规范取值，不跨端复制平台专属实现。

## 易错点

- Admin 固定 `8080`，Client 固定 `8082`，不要把用户端代理回 Admin。
- Admin clientid 与四个 Client clientid 分属不同表，不能混用。
- Client Redis 使用独立数据库与键前缀，避免 Admin/Client 会话互相读取。
- 登录脚本必须带 `User-Agent`；RSA 密钥必须与后端配置一致。
- HarmonyOS 不是微信小程序副本，禁止保留 `xcx`、微信 AppID、小程序存储键或 `rpx` 语义。
