# CLAUDE.md

本文是本仓库的工程事实与编码约束。AI 或开发者修改代码前必须完整读取；实现变化后同步更新本文，但禁止通过修改文档为不符合原框架的实现背书。

## 1. 项目定位

`ai-product-factory` 是一个供复制后填充产品业务的中大型多端脚手架，不是“AI 产品工厂”自身的业务系统。

工程包含两个 Spring Boot 应用与五个独立前端：

- `ruoyi-admin`：后台管理服务，只对接 `web/admin`，固定端口 `8080`。
- `ruoyi-client`：产品用户服务，对接 H5、App、微信小程序、HarmonyOS，固定端口 `8082`。
- `web/admin`、`web/h5`、`web/app`、`web/miniapp`、`web/harmony` 是五个独立工程，不共享运行时源码、依赖包或构建产物。

业务关系不是“先有 Admin，再有 Client”，而是：产品业务首先为 Client 用户提供能力，Admin 对同一份产品业务做运营和管理。

### 1.1 两条不可违反的铁律

1. **UI 服从设计系统。** 修改任一界面前，完整读取 `docs/AI-设计系统上下文.md` 和对应的 `docs/平台适配/<端>.md`。颜色、间距、字号、圆角、触控尺寸和交互语义只能来自 Token 与平台规范。
2. **前端服从真实后端契约。** API 路径、字段、加密与鉴权以后端 Controller/VO 为准。禁止根据页面需要虚构字段，也禁止把 Admin DTO 套给 Client。

## 2. 架构与职责边界

```text
PC Admin ── Admin Gateway ── ruoyi-admin:8080 ── sys_* 管理身份
                                      │
                                      ├─ 运营 client_* 产品用户身份
                                      └─ 运营共享产品业务数据

H5 / App / 微信小程序 / HarmonyOS
         └─ Client Gateway ── ruoyi-client:8082 ── client_* 产品用户身份
                                      │
                                      └─ 使用共享产品业务数据
```

### 2.1 身份隔离

| 维度 | Admin | Client |
|---|---|---|
| 用户 | `sys_user` | `client_user` |
| 客户端应用 | `sys_client` | `client_application` |
| 第三方身份 | `sys_social` | `client_identity` |
| 当前用户接口 | `/system/user/getInfo` | `/client/user/info` |
| Redis 会话 | Admin database/keyPrefix | Client 独立 database/keyPrefix |

Admin 管理员 Token 不能访问 Client 用户接口，Client Token 也不能访问 Admin 管理接口。两个应用即使复用 Sa-Token 技术底座，也必须通过不同 Redis 命名空间和不同 clientid 数据源隔离。

### 2.2 产品业务共享规则

- 产品业务表、Entity、BO、VO、Mapper、Service 只维护一份，放在 `backend/ruoyi-modules/<真实业务模块>`。
- Admin 和 Client 按需依赖同一个产品业务模块，不复制数据库 Schema 与 Service。
- Admin 管理接口放 `ruoyi-admin`；Client 用户接口放 `ruoyi-client`。两侧 Controller、请求 DTO、响应 DTO、权限标识和限流策略可以不同。
- `ruoyi-client-system` 只承载产品用户/应用/第三方身份的共享数据能力；Client 登录 Controller 与认证策略属于 `ruoyi-client`。
- 不创建没有真实代码的 application/domain/interface/security 等空壳聚合工程。

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
├── ruoyi-admin/                    # Admin Boot 与 Admin 专属 Controller
├── ruoyi-client/                   # Client Boot、认证与 Client 专属 Controller
├── ruoyi-api/                      # 原框架内部 API
├── ruoyi-common/                   # 原框架技术通用层，不放 Client 业务配置
├── ruoyi-modules/
│   ├── ruoyi-system/               # Admin 系统管理
│   ├── ruoyi-client-system/        # 产品用户身份共享数据能力
│   └── ...                         # 真实产品业务模块继续放这里
└── script/sql/                     # 多数据库初始化脚本

web/
├── admin/
├── h5/
├── app/
├── miniapp/
└── harmony/
```

不要把 `ruoyi-modules` 改名；代码生成器、仓库 Skill 和既有文档都以该目录为标准入口。

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

Client 受保护请求还会实时复核产品用户、产品应用状态与凭证版本；停用用户/应用或重置密码后，已有 Token 在下一次请求时失效。

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
| 产品用户运营 | `/client/user/**` | Admin Token + `client:user:*` |
| 产品应用运营 | `/client/application/**` | Admin Token + `client:application:*` |

`/system/client` 管理的是 Admin 自身授权客户端；`/client/application` 管理的是四个产品用户端应用，两者不能合并或混用。

产品应用的 clientid、key 和 secret 创建后不可变，且不提供删除操作；下线应用统一使用“停用”，避免已发布前端的身份标识被不可逆破坏。

### 4.5 Client 接口（8082）

| 用途 | 方法与路径 | 鉴权 |
|---|---|---|
| 验证码 | `GET /auth/code` | 无 |
| 产品用户登录 | `POST /auth/login` | 无，`@ApiEncrypt` |
| 短信验证码 | `GET /resource/sms/code` | 无，带手机号参数；`sms.enabled=false` 时返回“短信服务未启用” |
| 产品用户退出 | `POST /auth/logout` | Client Token + clientid |
| 当前产品用户 | `GET /client/user/info` | Client Token + clientid |

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

微信小程序首次使用有效 `xcxCode` 登录时，Client 会在同一事务内创建产品用户与 `client_identity` 绑定；重复请求通过分布式锁和数据库唯一键保证幂等。该行为只建立产品身份，不自动授予业务角色或权益。

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
  "nickName": "示例产品用户",
  "avatar": null,
  "clientId": "...",
  "deviceType": "h5",
  "roles": [],
  "permissions": []
}
```

脚手架只建立产品身份边界，不预设未来业务角色/权益模型，所以默认 roles/permissions 为空；后续产品按真实业务补充。

## 5. 编码规范

### 5.1 后端

- 沿用 RuoYi 的 Entity、BO、VO、`BaseMapperPlus`、Service/impl、Controller 分层。
- 查询使用 MyBatis-Plus、`QueryBuilder` 与现有 Mapper 扩展，不引入 JdbcTemplate/Repository Port 作为第二套范式。
- Controller 统一返回 `R<T>` 或 `PageResult<T>`，列表、导出、权限、日志注解参照现有 `SysUserController`/`SysClientController`。
- 登录策略参照原 `IAuthStrategy` 的 Bean 路由写法，不自建另一套框架级安全上下文。
- 公共技术模块 `ruoyi-common` 不放 Client 密钥、微信 AppID 或业务常量。
- 新模块必须包含真实能力；没有业务代码时不要建立 package-info 空壳。
- `ruoyi-product` 不属于本脚手架，禁止恢复；未来以真实产品业务域命名模块。

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
./mvnw -pl ruoyi-admin,ruoyi-client -am package -DskipTests

java -jar ruoyi-admin/target/ruoyi-admin.jar \
  --server.port=8080 --captcha.enable=false

java -jar ruoyi-client/target/ruoyi-client.jar \
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
- Admin 与 Client 当前共享 `ry-vue` 中的产品业务数据，但身份表明确分区。
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
- **小程序登录失败**：确认微信 AppID/Secret 已通过环境注入、grantType 只有 `xcx`，并检查微信 code 换取响应；首次成功登录会自动创建产品用户和第三方身份绑定。

## 9. 参考

- Agent 摘要：`AGENTS.md`
- 协作规范：`CONTRIBUTING.md`
- 设计系统：`docs/AI-设计系统上下文.md`
- 设计 Token：`docs/design-tokens.json`、`docs/design-tokens.ts`
- 平台规范：`docs/平台适配/`
- RuoYi 生成规范：`backend/.codex/skills/ruoyi-plus-ai-coding/SKILL.md`
