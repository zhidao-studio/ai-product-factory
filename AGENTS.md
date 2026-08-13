# AGENTS.md

本文是 `ai-product-factory` 的 Agent 快速入口。完整工程约束、接口契约和运行说明见 [CLAUDE.md](./CLAUDE.md)；当前完成度、业务留白与角色化阅读路径见 [docs/工程现状.md](./docs/工程现状.md)。

## 项目定位

这是一个供复制后填充真实业务的中大型多端脚手架，不承载仓库名称所描述的业务。

- `ruoyi-admin`：Admin 总工程，只服务 PC 管理端；启动模块端口 `8080`。
- `ruoyi-client`：Client 总工程，服务 H5、App、微信小程序和 HarmonyOS；启动模块端口 `8082`。
- `ruoyi-common`：Common 总工程，只承载两侧可复用的中立技术能力；Common 不设业务 API 工程。
- Admin 身份使用 `sys_*`；Client 身份使用 `app_user`、`app_client`、`app_user_identity`，两套身份数据隔离。
- Admin 是 Client 的运营管理后台；默认通过 Client 私有管理接口管理 Client 数据，不直接依赖 Client UM、Mapper 或 Entity，Client 不反向依赖 Admin。
- 五个前端都是独立工程，禁止运行时源码共享、公共包共享或跨工程引用。

## 不可违反的规则

1. 生成或修改 UI 前，完整读取 `docs/AI-设计系统上下文.md` 和对应的 `docs/平台适配/<端>.md`；Token 是唯一样式来源。
2. 前端契约必须以后端真实 Controller 与 VO 为准，禁止发明接口路径或返回字段。
3. 后端沿用 RuoYi 的 `controller / service / mapper / domain.bo / domain.vo`、MyBatis-Plus、`R<T>` 与现有认证策略写法，禁止另造 DDD/Port/JdbcTemplate 体系。
4. Admin 与 Client 的业务模块和 API 契约分别由各自总工程拥有；Common 不得定义业务 API，也不得依赖任何一侧的业务实现。
5. 新增模块必须加入其所属总工程的 `pom.xml`；不要提前创建无实现的 API、UM 或微服务空壳。
6. 新增 Client 表统一使用 `app_*`；表七要素固定为 `id`、`valid_flag`、`del_flag`、`create_by`、`create_time`、`update_by`、`update_time`，不含部门和通用乐观锁版本。Admin 的 `sys_*` 表继续沿用原 RuoYi 字段，两套表允许存在结构差异。
7. Admin 调用 Client 的 `/internal/admin/**` 只允许后端私有网络访问，必须使用独立服务签名与防重放校验；内部审计只传并签名操作人 ID，不传 Admin 部门 ID，禁止经过任一 Gateway 或转发浏览器 Token。

## 关键目录

- 后端根总工程：`backend/pom.xml`
- Admin 总工程：`backend/ruoyi-admin/pom.xml`；契约模块：`backend/ruoyi-admin/ruoyi-admin-api/`；启动模块：`backend/ruoyi-admin/ruoyi-admin-server/`
- Client 总工程：`backend/ruoyi-client/pom.xml`；认证与内部管理契约：`backend/ruoyi-client/ruoyi-client-api/`；启动模块：`backend/ruoyi-client/ruoyi-client-server/`
- Client 用户与身份管理：`backend/ruoyi-client/ruoyi-client-um/`，拥有 `AppUser`、`AppClient`、`AppUserIdentity` 及对应 Mapper/Service
- Common 总工程：`backend/ruoyi-common/pom.xml`
- 既有 Admin 业务模块物理目录：`backend/ruoyi-modules/`；模块归属以所属总工程的聚合声明为准
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
- 新增 Client 业务：在 `backend/ruoyi-client/` 下建立真实模块并加入 Client 总工程；需要运营能力时，由 Client 提供私有管理契约与接口，Admin 通过适配层接入。
- 新增前端接口：只修改目标前端自己的 `src/api/<模块>.ts`，返回类型逐字段对齐后端 VO。
- 新增 UI：先从 `docs/design-tokens.*` 与对应平台规范取值，不跨端复制平台专属实现。

## 易错点

- Admin 固定 `8080`，Client 固定 `8082`，不要把用户端代理回 Admin。
- Admin clientid 位于 `sys_client`，四个 Client clientid 位于 `app_client`，不能混用。
- Client 的 `valid_flag` 固定使用 `1=有效、0=无效`；不要复用 Admin `sys_normal_disable` 的反向状态语义。
- Client Redis 使用独立数据库与键前缀，避免 Admin/Client 会话互相读取。
- Admin 与 Client 的内部管理共享密钥只存在于两个 Backend；本地两侧值必须一致，生产环境必须使用独立高熵密钥。
- Docker 初始化 SQL 只在空数据卷首次执行；已有开发环境需重建数据卷，需保留数据的环境必须备份后人工迁移至 `app_*`。
- 登录脚本必须带 `User-Agent`；RSA 密钥必须与后端配置一致。
- HarmonyOS 不是微信小程序副本，禁止保留 `xcx`、微信 AppID、小程序存储键或 `rpx` 语义。
