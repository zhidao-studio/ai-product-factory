# RuoYi-Vue-Plus 多端产品脚手架（Boot 版）

面向中大型项目的可复制工程脚手架：后台管理服务与产品用户服务双入口，配套五个互不共享源码的前端工程。

```text
ai-product-factory/
├── backend/
│   ├── ruoyi-admin/          # 后台管理服务，8080，仅服务 PC Admin
│   ├── ruoyi-client/         # 产品用户服务，8082，服务四个用户端
│   ├── ruoyi-modules/        # RuoYi 业务模块及共享产品业务模块
│   │   └── ruoyi-client-system/ # 产品用户/应用/第三方身份数据能力
│   ├── ruoyi-common/         # 原框架通用技术底座
│   └── script/sql/           # MySQL/Oracle/PostgreSQL/SQL Server 初始化脚本
├── web/
│   ├── admin/                # PC 后台管理系统
│   ├── h5/                   # 产品 H5
│   ├── app/                  # React Native App
│   ├── miniapp/              # 微信小程序
│   └── harmony/              # HarmonyOS
├── infra/                    # MySQL、Redis 与网关配置
├── docs/                     # 设计系统与各平台适配规范
└── scripts/                  # 双后端一键启动/停止脚本
```

## 架构边界

- Admin 是运营管理侧，不是四个用户端的统一容器。
- Client 是产品用户侧，承载 H5、App、微信小程序与 HarmonyOS 的认证和产品接口。
- 后台管理员使用 `sys_*` 身份表；产品用户使用 `client_*` 身份表。
- Admin 运营 Client 的同一份产品业务数据。未来产品业务模块可被两个后端依赖，但两侧 Controller 与权限语义分别维护。
- 五个前端分别安装依赖、构建、部署，不建立共享前端包。

## 本地基础设施

```bash
docker compose -f infra/docker-compose.yml up -d
```

- MySQL：`localhost:3306`，`root / root`，数据库 `ry-vue`
- Redis：`localhost:6379`，密码 `ruoyi123`
- Admin 和 Client 共用产品业务数据库；会话通过 Redis database/keyPrefix 隔离。

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
./mvnw -pl ruoyi-admin,ruoyi-client -am package -DskipTests
java -jar ruoyi-admin/target/ruoyi-admin.jar --server.port=8080 --captcha.enable=false
java -jar ruoyi-client/target/ruoyi-client.jar --server.port=8082 --captcha.enable=false
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
| 身份数据 | `sys_user/sys_client` | `client_user/client_application/client_identity` |
| 运营产品用户 | `client:user:*` | 不暴露 |
| 运营产品应用 | `client:application:*` | 不暴露 |

两个服务可以使用同名认证路径，因为部署域名和服务入口不同。受保护请求必须同时发送 Token 与对应的 `clientid`。

微信小程序使用 `xcx` 授权；首次有效登录会自动创建产品用户和 `client_identity` 绑定，不会自动授予产品角色或权益。

产品用户或产品应用被停用、产品用户密码被重置后，已签发的 Client Token 会在下一次受保护请求时失效。产品应用标识创建后不可变且不提供删除，运营下线统一使用“停用”。

## 增加产品业务

1. 在 `backend/ruoyi-modules/` 新建真实业务模块，沿用 RuoYi 的 Entity/BO/VO/Mapper/Service 结构。
2. Admin 与 Client 按需依赖同一业务模块，不复制产品表和 Service。
3. 管理接口放 `ruoyi-admin`，面向用户的接口放 `ruoyi-client`，分别定义 DTO、权限和路径。
4. 每个前端只在自身工程封装需要的 API，不引用其他前端源码。

完整约束见 [CLAUDE.md](./CLAUDE.md)，协作规范见 [CONTRIBUTING.md](./CONTRIBUTING.md)，UI 规范见 [docs/AI-设计系统上下文.md](./docs/AI-设计系统上下文.md)。
