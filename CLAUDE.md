# CLAUDE.md

本文是本仓库的工程事实与编码约束。AI 或开发者修改代码前必须完整读取；实现变化后同步更新本文，但禁止通过修改文档为不符合原框架的实现背书。

## 1. 项目定位

`ai-product-factory` 是一个供复制后填充真实业务的中大型多端脚手架，不是仓库名称所描述的业务系统。

工程包含两个 Spring Boot 应用与五个独立前端：

- `ruoyi-admin`：Admin 总工程；`ruoyi-admin-server` 只对接 `web/admin`，固定端口 `8080`。
- `ruoyi-client`：Client 总工程；`ruoyi-client-server` 对接 H5、App、微信小程序、HarmonyOS，固定端口 `8082`。
- `ruoyi-common`：Common 总工程，只承载两侧可复用的技术能力。
- `web/admin`、`web/h5`、`web/app`、`web/miniapp`、`web/harmony` 是五个独立工程，不共享运行时源码、依赖包或构建产物。

Client 是客户端后台业务主体；Admin 是独立的运营管理后台。Admin 可以通过 Client 管理接口或独立的数据访问适配层管理 Client 数据，Client 不反向依赖 Admin。

### 1.1 两条不可违反的铁律

1. **UI 服从设计系统。** 修改任一界面前，完整读取 `docs/AI-设计系统上下文.md` 和对应的 `docs/平台适配/<端>.md`。颜色、间距、字号、圆角、触控尺寸和交互语义只能来自 Token 与平台规范。
2. **前端服从真实后端契约。** API 路径、字段、加密与鉴权以后端 Controller/VO 为准。禁止根据页面需要虚构字段，也禁止把 Admin DTO 套给 Client。

## 2. 架构与职责边界

```text
PC Admin ── Admin Gateway ── ruoyi-admin-server:8080 ── sys_* 管理身份
                                      │
                                      ├─ 调用 Client 管理接口
                                      └─ 经独立适配层管理 Client 数据

H5 / App / 微信小程序 / HarmonyOS
         └─ Client Gateway ── ruoyi-client-server:8082 ── Client API
                                      │
                                      └─ Client 用户与业务数据
```

### 2.1 身份隔离

| 维度 | Admin | Client |
|---|---|---|
| 用户 | `sys_user` | 当前为 `client_user`，后续迁移为 `app_user` |
| 客户端应用 | `sys_client` | 当前为 `client_application`，后续迁移为 `app_client` |
| 第三方身份 | `sys_social` | 当前为 `client_identity`，后续迁移为 `app_user_identity` |
| 当前用户接口 | `/system/user/getInfo` | `/client/user/info` |
| Redis 会话 | Admin database/keyPrefix | Client 独立 database/keyPrefix |

Admin 管理员 Token 不能访问 Client 用户接口，Client Token 也不能访问 Admin 管理接口。两个应用即使复用 Sa-Token 技术底座，也必须通过不同 Redis 命名空间和不同 clientid 数据源隔离。

### 2.2 目标边界与当前阶段

- 根总工程主要负责版本、依赖与插件治理；当前还暂管历史 `ruoyi-api` 桥接模块和既有独立扩展服务。Admin、Client、Common 分别由自己的聚合 POM 管理。
- 目标边界：Admin 与 Client 是两套工程，分别拥有身份、接口、业务模块和运行配置，不共享 Entity、Service、LoginUser 或安全会话模型。
- 目标边界：Common 只放与业务和身份无关的技术能力，不得新增对 Admin 或 Client 业务实现的依赖。
- Admin 管理 Client 时，复杂业务操作调用 Client 管理接口；确需直接访问数据时，通过 Admin 专属适配层访问 Client 所拥有的表。
- Client 模块由 Client 总工程聚合；Admin 模块由 Admin 总工程聚合。物理上继续使用 `backend/ruoyi-modules/` 存放既有模块，不再使用混合的 `ruoyi-modules` 聚合 POM。
- 不创建没有真实代码的 API、UM、微服务或分层空壳工程。

当前阶段只完成 Maven 所有权划分，仍有两项历史耦合：Admin Server 直接依赖 `ruoyi-client-system`；Client 与部分 Common 模块仍依赖根工程暂管的 `ruoyi-api` 和其中的 System 登录模型。它们是后续解耦对象，不是新代码可以继续复制的范例，也不得通过修改文档宣称已经完成隔离。

当前受支持的完整构建入口是 `backend/pom.xml`。Admin、Client、Common 的 POM 首先表达模块所有权；在上述历史桥接依赖解除前，不把三个子总工程宣称为可在全新 Maven 仓库中完全独立发布的发行单元。

## 3. 技术栈与目录

| 层 | 技术 |
|---|---|
| 后端 | RuoYi-Vue-Plus 6.x、Spring Boot 4.1、JDK 21、Sa-Token、MyBatis-Plus、Jetty |
| PC Admin | UmiJS 4、React、Ant Design/ProComponents，端口 8000 |
| H5 | Vite、React、antd-mobile，端口 8081 |
| App | React Native CLI、`@ant-design/react-native` |
| 微信小程序 | Taro 4 React、微信平台插件 |
| HarmonyOS | 独立 Taro 4 Harmony CPP 工程 |
| 基础设施 | MySQL 8、Redis 7、Admin/Client 双网关 |
| 设计系统 | `docs/design-tokens.*` 与 `docs/平台适配/` |

```text
backend/
├── pom.xml                         # 后端根总工程
├── ruoyi-admin/                    # Admin 总工程
│   ├── pom.xml                     # 聚合 Admin 所有模块
│   └── ruoyi-admin-server/         # Admin Boot 与专属 Controller
├── ruoyi-client/                   # Client 总工程
│   ├── pom.xml                     # 聚合 Client 所有模块
│   └── ruoyi-client-server/        # Client Boot、认证与专属 Controller
├── ruoyi-common/                   # Common 总工程
├── ruoyi-api/                      # 根工程暂管的历史契约桥接模块
├── ruoyi-modules/
│   ├── ruoyi-system/               # 归 Admin 总工程
│   ├── ruoyi-client-system/        # 归 Client 总工程，名称待 UM 阶段收口
│   └── ...                         # 新模块必须归属 Admin 或 Client
├── ruoyi-extend/                   # 根工程直接管理的独立扩展服务
└── script/sql/                     # 多数据库初始化脚本

web/
├── admin/
├── h5/
├── app/
├── miniapp/
└── harmony/
```

不要批量改名 `ruoyi-modules` 物理目录；代码生成器和仓库 Skill 仍以该目录为模板入口。模块的 Maven 所有权以 Admin/Client 总工程的 `<modules>` 为准。

## 4. 后端接口契约

### 4.1 统一返回 `R<T>`

```json
{ "code": 200, "msg": "操作成功", "data": {} }
```

- `200`：成功
- `401`：未登录、会话失效或 clientid 不匹配
- `403`：无权限
- `500`：服务异常
- `601`：业务警告

各前端请求层返回完整的 `R<T>`；页面读取 `data`，错误提示读取后端 `msg`。

### 4.2 Token 与 clientid

受保护请求必须同时发送：

```http
Authorization: Bearer <access_token>
clientid: <当前前端对应的 client id>
```

后端会校验请求头 clientid 与 Token 中的 clientid，并继续校验该应用的允许路径和 IP 白名单。Gateway 是第一道入口控制，后端校验仍然保留，防止绕过网关。

Client 受保护请求还会实时复核应用用户、接入客户端状态与凭证版本；停用用户/应用或重置密码后，已有 Token 在下一次请求时失效。

### 4.3 `@ApiEncrypt` 登录加密

`POST /auth/login` 请求体使用原 RuoYi AES+RSA 契约：

1. 生成安全随机 16 字节 AES key；
2. 使用 AES-ECB/PKCS7 加密 JSON 请求体；
3. 使用 RSA 公钥加密 AES key 的 Base64 值，写入 `encrypt-key` 请求头；
4. 前后端 RSA 密钥必须一致；禁止使用 `Math.random()` 代替安全随机数。

各端只复用契约，不跨工程引用加密源码。

### 4.4 Admin 接口（8080）

Admin 使用 `sys_client` 中的 PC clientid：

```text
e5cd7e4891bf95d1d19206ce24a7b32e
```

| 用途 | 方法与路径 | 鉴权 |
|---|---|---|
| 验证码 | `GET /auth/code` | 无 |
| 后台登录 | `POST /auth/login` | 无，`@ApiEncrypt` |
| 后台退出 | `POST /auth/logout` | Admin Token |
| 管理员信息 | `GET /system/user/getInfo` | Admin Token + clientid |
| 应用用户运营 | `/client/user/**` | Admin Token + `client:user:*` |
| 接入客户端运营 | `/client/application/**` | Admin Token + `client:application:*` |

`/system/client` 管理的是 Admin 自身授权客户端；`/client/application` 当前管理四个 Client 接入配置，两者不能合并或混用。

接入客户端的 clientid、key 和 secret 创建后不可变，且不提供删除操作；下线统一使用“停用”，避免已发布前端的身份标识被不可逆破坏。

### 4.5 Client 接口（8082）

| 用途 | 方法与路径 | 鉴权 |
|---|---|---|
| 验证码 | `GET /auth/code` | 无 |
| 应用用户登录 | `POST /auth/login` | 无，`@ApiEncrypt` |
| 短信验证码 | `GET /resource/sms/code` | 无，带手机号参数；`sms.enabled=false` 时返回“短信服务未启用” |
| 应用用户退出 | `POST /auth/logout` | Client Token + clientid |
| 当前应用用户 | `GET /client/user/info` | Client Token + clientid |

四端应用契约：

| 前端 | clientid | deviceType | 允许 grantType |
|---|---|---|---|
| H5 | `8f6e7d5c4b3a2910fedcba9876543210` | `h5` | `password,sms` |
| App | `428a8310cd442757ae699df5d894f051` | `app` | `phonePassword,sms` |
| 微信小程序 | `7f4c1e2d8a9b4c6f9012d3e4f5a6b7c8` | `miniapp` | `xcx` |
| HarmonyOS | `9c8b7a6d5e4f3210a1b2c3d4e5f60718` | `harmony` | `password,sms` |

登录参数：

| grantType | 请求字段 | 说明 |
|---|---|---|
| `password` | `username,password,code?,uuid?,clientId,grantType` | 图形验证码开启时必须传 code/uuid |
| `phonePassword` | `username`（手机号）、`password,clientId,grantType` | App 手机号密码登录 |
| `sms` | `phoneNumber,smsCode,clientId,grantType` | 先获取短信验证码 |
| `xcx` | `xcxCode,clientId,grantType` | 仅微信小程序，来自 `Taro.login` |

微信小程序首次使用有效 `xcxCode` 登录时，Client 会在同一事务内创建应用用户与 `client_identity` 绑定；重复请求通过分布式锁和数据库唯一键保证幂等。该行为只建立用户身份，不自动授予业务角色或权益。

Client 登录成功只返回以下字段，禁止前端声明不存在的 refresh token、scope 或 openid：

```json
{
  "access_token": "...",
  "expire_in": 604800,
  "client_id": "..."
}
```

`GET /client/user/info` 的 `data` 精确字段为：

```json
{
  "userId": 1763000000000000001,
  "userName": "client",
  "nickName": "示例应用用户",
  "avatar": null,
  "clientId": "...",
  "deviceType": "h5",
  "roles": [],
  "permissions": []
}
```

脚手架只建立应用用户身份边界，不预设未来业务角色/权益模型，所以默认 roles/permissions 为空；复制后按真实业务补充。

## 5. 编码规范

### 5.1 后端

- 沿用 RuoYi 的 Entity、BO、VO、`BaseMapperPlus`、Service/impl、Controller 分层。
- 查询使用 MyBatis-Plus、`QueryBuilder` 与现有 Mapper 扩展，不引入 JdbcTemplate/Repository Port 作为第二套范式。
- Controller 统一返回 `R<T>` 或 `PageResult<T>`，列表、导出、权限、日志注解参照现有 `SysUserController`/`SysClientController`。
- 登录策略参照原 `IAuthStrategy` 的 Bean 路由写法，不自建另一套框架级安全上下文。
- 公共技术模块 `ruoyi-common` 不放 Client 密钥、微信 AppID 或业务常量。
- 新模块必须包含真实能力；没有业务代码时不要建立 package-info 空壳。
- 已删除的 `ruoyi-product` 不属于本脚手架，禁止恢复；未来模块直接使用真实业务域名称。

### 5.2 前端

- 五端互相独立，各自拥有 `src/api/request.ts`、API 类型、环境配置、Token key 与锁文件。
- “契约一致”不等于“复制一端实现”：平台专有导航、存储、随机数、触控单位和安全区必须分别适配。
- H5/App/HarmonyOS 不能使用小程序的 xcx/AppID/rpx/存储键；微信小程序不能展示账号密码兜底，除非后端应用明确允许该 grant。
- 登录结果与用户信息逐字段对齐 4.5；验证码 `uuid/img` 在关闭验证码时允许为空。
- 401 清除本端 Token 并回到登录态；禁止使用 `Admin-Token` 作为任一 Client 端存储键。

### 5.3 UI

- 页面结构与组件优先沿用各端现有工程，不为接口切换引入新路由库或全局状态框架。
- Input 必须有 Label；移动端输入字号至少 16px。
- 每屏最多一个主按钮；危险操作使用 danger 并二次确认。
- H5 最大内容宽 750px并处理安全区；App 触控至少 iOS 44/Android 48；微信小程序至少 88rpx并预留胶囊；HarmonyOS 至少 48vp并适配 600/840/1280 断点。
- 暗色模式必须通过本端 Token/ThemeProvider 生效，不能只切换文字状态。

## 6. 开发与构建

### 6.1 基础设施

```bash
docker compose -f infra/docker-compose.yml up -d
```

MySQL：`root/root`、数据库 `ry-vue`；Redis 密码：`ruoyi123`。

### 6.2 双后端

```bash
cd backend
./mvnw -pl :ruoyi-admin-server,:ruoyi-client-server -am package -DskipTests

java -jar ruoyi-admin/ruoyi-admin-server/target/ruoyi-admin.jar \
  --server.port=8080 --captcha.enable=false

java -jar ruoyi-client/ruoyi-client-server/target/ruoyi-client.jar \
  --server.port=8082 --captcha.enable=false
```

或直接：

```bash
bash scripts/start-dev.sh
bash scripts/stop-dev.sh
```

### 6.3 五个前端

```bash
cd web/admin   && pnpm install && pnpm dev
cd web/h5      && pnpm install && pnpm dev
cd web/app     && npm install && npm start
cd web/miniapp && pnpm install && pnpm dev:weapp
cd web/harmony && pnpm install && pnpm dev:harmony
```

### 6.4 生产双网关

- 使用 `infra/docker-compose.prod.yml`，仅 `admin-gateway`、`client-gateway` 发布宿主机端口。
- `admin-backend:8080`、`client-backend:8082`、MySQL 和 Redis 只在容器网络内可见。
- 浏览器生产请求通过 `/prod-api/**` 进入对应 Gateway，转发到后端前必须去掉 `/prod-api`；Client 去前缀后仍执行显式白名单与限流。
- 仓库内 Gateway 只监听 HTTP，TLS 在外部可信入口终止；不要将明文 Gateway 端口直接开放到公网。
- 生产启动、必需环境变量与 TLS 边界以 `infra/README.md` 为准。
- Client 短信服务默认关闭；生产环境仅在 `CLIENT_SMS_ENABLED=true` 时配置供应商凭据并开放短信验证码与短信登录。

## 7. 数据库与中间件规则

- `infra/init/01-init.sql` 是 Docker 新库的初始化事实来源；不要同时偷偷引入另一套 Flyway baseline。
- MySQL、Oracle、PostgreSQL、SQL Server 脚本的 Client 三表与四端种子必须同步。
- 表主键沿用雪花 ID，不使用自增；脚手架不建立物理外键。
- Admin 与 Client 当前使用同一个 `ry-vue` Schema，但各自拥有不同表；新的 Client 表统一使用 `app_*`，不得与 Admin 的 `sys_*` 共表。
- Client Redis 使用独立 database 与 `client` keyPrefix；keyPrefix 不手工追加冒号。
- 修改 client_application 后无需复用 Admin 的 sys_client 缓存。
- `client_user.credential_version` 随密码重置递增并写入 Client Token；不得绕过版本校验恢复旧会话。

## 8. 常见问题

- **前端打到错误服务**：Admin 代理 `8080`；H5/App/小程序/HarmonyOS 指向 `8082`。
- **401 clientid 不匹配**：检查请求头、Token 中 clientid 和当前应用种子是否一致。
- **登录后无法退出**：Client 应用允许路径必须包含 `/client/**,/auth/logout`。
- **数据库已有旧结构**：Docker init 只在空数据卷首次运行；开发环境需要重建数据卷或手工迁移。
- **登录脚本 NPE**：登录请求必须带有效 `User-Agent`。
- **RSA 解密失败**：前端公私钥和后端 `application.yml` 必须成对一致。
- **HarmonyOS 加密失败**：运行时必须提供安全随机能力；禁止降级到 `Math.random()`，需在 DevEco 真机/模拟器验证。
- **小程序登录失败**：确认微信 AppID/Secret 已通过环境注入、grantType 只有 `xcx`，并检查微信 code 换取响应；首次成功登录会自动创建应用用户和第三方身份绑定。

## 9. 参考

- Agent 摘要：`AGENTS.md`
- 协作规范：`CONTRIBUTING.md`
- 设计系统：`docs/AI-设计系统上下文.md`
- 设计 Token：`docs/design-tokens.json`、`docs/design-tokens.ts`
- 平台规范：`docs/平台适配/`
- RuoYi 生成规范：`backend/.codex/skills/ruoyi-plus-ai-coding/SKILL.md`
