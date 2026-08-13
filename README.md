# RuoYi-Vue-Plus 多端工程脚手架（Boot 版）

面向中大型项目的可复制工程脚手架：Admin 后台与 Client 客户端后台双入口，配套五个互不共享源码的前端工程。

```text
ai-product-factory/
├── backend/
│   ├── pom.xml               # 后端根总工程
│   ├── ruoyi-admin/          # Admin 总工程
│   │   ├── ruoyi-admin-api/     # Admin Java 契约
│   │   └── ruoyi-admin-server/  # Admin 启动模块，8080
│   ├── ruoyi-client/         # Client 总工程
│   │   ├── ruoyi-client-api/    # Client Java 契约
│   │   ├── ruoyi-client-um/     # 应用用户、接入客户端与第三方身份管理
│   │   └── ruoyi-client-server/ # Client 启动模块，8082
│   ├── ruoyi-common/         # Common 通用技术总工程（无业务 API 工程）
│   ├── ruoyi-modules/        # 既有 Admin 业务模块物理目录
│   ├── ruoyi-extend/         # 根工程直接管理的独立扩展服务
│   └── script/sql/           # MySQL/Oracle/PostgreSQL/SQL Server 初始化脚本
├── web/
│   ├── admin/                # PC 后台管理系统
│   ├── h5/                   # H5 客户端
│   ├── app/                  # React Native App
│   ├── miniapp/              # 微信小程序
│   └── harmony/              # HarmonyOS
├── infra/                    # MySQL、Redis 与网关配置
├── docs/                     # 设计系统与各平台适配规范
└── scripts/                  # 双后端一键启动/停止脚本
```

## 架构边界

- Admin 是运营管理侧，不是四个用户端的统一容器。
- Client 是客户端后台，承载 H5、App、微信小程序与 HarmonyOS 的认证和业务接口。
- 后台管理员使用 `sys_*` 身份表；Client 使用 `app_user`、`app_client`、`app_user_identity`。
- Admin 运营 Client 的业务数据，但不装载 Client UM 实现；Admin 保留管理权限和日志，通过 Client 私有管理 API 执行业务操作。
- Admin 与 Client 分别维护 `ruoyi-admin-api`、`ruoyi-client-api`；Common 不承载业务 API。
- 五个前端分别安装依赖、构建、部署，不建立共享前端包。

## 本地基础设施

```bash
docker compose -f infra/docker-compose.yml up -d
```

- MySQL：`localhost:3306`，`root / root`，数据库 `ry-vue`
- Redis：`localhost:6379`，密码 `ruoyi123`
- Admin 和 Client 当前共用 `ry-vue` Schema，但各自拥有不同表；会话通过 Redis database/keyPrefix 隔离。

## 生产双网关部署

生产编排使用 `infra/docker-compose.prod.yml`：只有 Admin Gateway 与 Client Gateway 发布宿主机端口，两个后端、MySQL 和 Redis 均不直接暴露。Gateway 接收 `/prod-api/**` 后去掉前缀再转发；TLS 由外部可信负载均衡器或反向代理终止。

完整的环境变量、网络边界和启动命令见 [infra/README.md](./infra/README.md)。

## 一键启动两个后端

```bash
bash scripts/start-dev.sh
```

脚本会启动 MySQL/Redis，构建并运行：

- Admin：`http://localhost:8080`，开发账号 `admin / admin123`
- Client：`http://localhost:8082`，开发账号 `client / admin123`

停止并保留数据卷：

```bash
bash scripts/stop-dev.sh
```

也可以分别启动：

```bash
cd backend
./mvnw -pl :ruoyi-admin-server,:ruoyi-client-server -am package -DskipTests
java -jar ruoyi-admin/ruoyi-admin-server/target/ruoyi-admin.jar --server.port=8080 --captcha.enable=false
java -jar ruoyi-client/ruoyi-client-server/target/ruoyi-client.jar --server.port=8082 --captcha.enable=false
```

## 启动五个独立前端

```bash
cd web/admin   && pnpm install && pnpm dev        # PC Admin → 8080
cd web/h5      && pnpm install && pnpm dev        # H5 → 8082
cd web/app     && npm install && npm start        # RN App → 8082
cd web/miniapp && pnpm install && pnpm dev:weapp  # 微信小程序 → 8082
cd web/harmony && pnpm install && pnpm dev:harmony # HarmonyOS → 8082
```

App 与 HarmonyOS 还需要各自原生开发工具，详见对应工程 README。

## 后端接口边界

| 能力 | Admin `:8080` | Client `:8082` |
|---|---|---|
| 登录 | `POST /auth/login` | `POST /auth/login` |
| 当前用户 | `GET /system/user/getInfo` | `GET /client/user/info` |
| 身份数据 | `sys_user/sys_client` | `app_user/app_client/app_user_identity` |
| 运营应用用户 | `/client/user/**` + `client:user:*` | 仅向 Admin Backend 提供私有管理接口 |
| 运营接入客户端 | `/client/application/**` + `client:application:*` | 仅向 Admin Backend 提供私有管理接口 |

两个服务可以使用同名认证路径，因为部署域名和服务入口不同。受保护请求必须同时发送 Token 与对应的 `clientid`。

Admin 调用 Client 时不转发浏览器 Token，而是通过仅两个 Backend 加入的内部网络，使用独立服务签名、时间窗口和 nonce 防重放。`/internal/**` 不属于任何前端契约，两个 Gateway 都会固定拒绝。

微信小程序使用 `xcx` 授权；首次有效登录会自动创建应用用户和 `app_user_identity` 绑定，不会自动授予业务角色或权益。

应用用户或接入客户端被停用、用户密码被重置后，已签发的 Client Token 会在下一次受保护请求时失效。接入客户端标识创建后不可变且不提供删除，运营下线统一使用“停用”。

## 增加 Client 业务

1. 在 `backend/ruoyi-client/` 新建真实业务模块，沿用 RuoYi 的 Entity/BO/VO/Mapper/Service 结构。
2. 将模块加入 Client 总工程；Client Server 负责调用其 Service，并为确有运营需求的能力提供私有管理接口。
3. Admin 对浏览器的管理接口放在 `ruoyi-admin-server`，通过 `ruoyi-client-api` 契约和 HTTP 适配层调用 Client；Admin 不依赖 Client Entity、Mapper 或 Service。
4. 每个前端只在自身工程封装需要的 API，不引用其他前端源码。

Client 新表统一使用 `app_*`，并包含七要素：`create_dept`、`create_by`、`create_time`、`update_by`、`update_time`、`version`、`del_flag`。主键与可选的 `remark` 不计入七要素。

已有环境不会因重新启动而自动执行新版初始化 SQL。开发数据可丢弃时重建数据卷；需要保留数据时先备份，再人工迁移至 `app_*` 表。

完整约束见 [CLAUDE.md](./CLAUDE.md)，协作规范见 [CONTRIBUTING.md](./CONTRIBUTING.md)，UI 规范见 [docs/AI-设计系统上下文.md](./docs/AI-设计系统上下文.md)。
