# CLAUDE.md

本文是本仓库的工程事实与编码约束。AI 或开发者修改代码前必须完整读取；实现变化后同步更新本文，但禁止通过修改文档为不符合原框架的实现背书。

## 1. 项目定位

`ai-product-factory` 是一个供复制后填充真实业务的中大型多端脚手架，不是仓库名称所描述的业务系统。

工程包含两个 Spring Boot 应用与五个独立前端：

- `ruoyi-admin`：Admin 总工程；`ruoyi-admin-server` 只对接 `web/admin`，固定端口 `8080`。
- `ruoyi-client`：Client 总工程；`ruoyi-client-server` 对接 H5、App、微信小程序、HarmonyOS，固定端口 `8082`。
- `ruoyi-common`：Common 总工程，只承载两侧可复用的技术能力。
- `web/admin`、`web/h5`、`web/app`、`web/miniapp`、`web/harmony` 是五个独立工程，不共享运行时源码、依赖包或构建产物。

Client 是客户端后台业务主体；Admin 是独立的运营管理后台。Admin 默认通过 Client 私有管理接口管理 Client 数据，Client 不反向依赖 Admin；只有经过明确架构决策的特殊场景才增加 Admin 专属数据访问适配层。

### 1.1 两条不可违反的铁律

1. **UI 服从设计系统。** 修改任一界面前，完整读取 `docs/AI-设计系统上下文.md` 和对应的 `docs/平台适配/<端>.md`。颜色、间距、字号、圆角、触控尺寸和交互语义只能来自 Token 与平台规范。
2. **前端服从真实后端契约。** API 路径、字段、加密与鉴权以后端 Controller/VO 为准。禁止根据页面需要虚构字段，也禁止把 Admin DTO 套给 Client。

## 2. 架构与职责边界

```text
PC Admin ── Admin Gateway ── ruoyi-admin-server:8080 ── sys_* 管理身份
                                      │
                                      └─ 私有管理 API（服务签名）
                                                   │
                                                   ▼
                                      ruoyi-client-server:8082 ── app_*

H5 / App / 微信小程序 / HarmonyOS
         └─ Client Gateway ── ruoyi-client-server:8082 ── Client API
                                      │
                                      └─ Client 用户与业务数据
```

### 2.1 身份隔离

| 维度 | Admin | Client |
|---|---|---|
| 用户 | `sys_user` | `app_user` |
| 接入客户端 | `sys_client` | `app_client` |
| 第三方身份 | `sys_social` | `app_user_identity` |
| 当前用户接口 | `/system/user/getInfo` | `/client/user/info` |
| Redis 会话 | Admin database/keyPrefix | Client 独立 database/keyPrefix |

Admin 管理员 Token 不能访问 Client 用户接口，Client Token 也不能访问 Admin 管理接口。两个应用即使复用 Sa-Token 技术底座，也必须通过不同 Redis 命名空间和不同 clientid 数据源隔离。

### 2.2 目标边界与当前阶段

- 根总工程主要负责版本、依赖与插件治理，并继续聚合既有独立扩展服务。Admin、Client、Common 分别由自己的聚合 POM 管理。
- 目标边界：Admin 与 Client 是两套工程，分别拥有身份、接口、业务模块和运行配置，不共享 Entity、Service、LoginUser 或安全会话模型。
- `ruoyi-admin-api` 只承载 Admin 的 System、Workflow 与管理身份 Java 契约；`ruoyi-client-api` 只承载 Client 自己的会话和认证请求契约。
- Common 不设 `common-api`：跨两侧复用的最小会话和数据权限技术接口属于既有 `ruoyi-common-core`，Common 不得定义 Admin/Client 业务契约，也不得依赖任一侧 API。
- Admin 管理 Client 时默认调用 Client 私有管理接口；确需直接访问数据时，必须经过单独架构决策，并通过 Admin 专属适配层访问 Client 所拥有的表。
- Admin 模块全部直接位于 `backend/ruoyi-admin/`，Client 模块全部直接位于 `backend/ruoyi-client/`；物理目录与 Maven 所有权必须一致，不再设立泛化的 `ruoyi-modules` 中间桶。`ruoyi-client-um` 拥有应用用户、接入客户端和第三方身份的数据模型、Mapper 与 Service。
- 不创建没有真实代码的 API、UM、微服务或分层空壳工程。

当前已完成 Maven 所有权、Java API、Client UM 与运行边界拆分：旧 `ruoyi-api` 已删除，Admin/Client 使用各自登录上下文，Common 不再依赖 System API。Client Server 使用 `ruoyi-client-um` 完成认证与身份管理；Admin Server 只依赖 `ruoyi-client-api`，通过私有 HTTP 管理接口完成应用用户和接入客户端运营，不再装载 UM 实现。

当前受支持的完整构建入口是 `backend/pom.xml`。Admin、Client、Common 的 POM 首先表达模块所有权；三个子总工程仍复用根工程的统一版本与构建治理，不宣称为可脱离根工程独立发布的发行单元。

## 3. 技术栈与目录

| 层 | 技术 |
|---|---|
| 后端 | RuoYi-Vue-Plus 6.0、Spring Boot 4.1、JDK 25 LTS、Sa-Token、MyBatis-Plus、Jetty |
| PC Admin | UmiJS 4、React、Ant Design/ProComponents，端口 8000 |
| H5 | Vite、React、antd-mobile，端口 8081 |
| App | React Native CLI、`@ant-design/react-native` |
| 微信小程序 | Taro 4 React、微信平台插件 |
| HarmonyOS | 独立 Taro 4 Harmony CPP 工程 |
| 基础设施 | MySQL 8、Redis 7、Admin/Client 双网关 |
| 设计系统 | `docs/design-tokens.*` 与 `docs/平台适配/` |

精确版本、兼容例外和升级流程以 [`docs/工程版本基线.md`](./docs/工程版本基线.md) 为准。生产运行时采用最新 LTS 的最新补丁；主框架和 TypeScript 编译器采用官方最新 GA。若最新 GA 尚未进入主框架的正式兼容矩阵，只能使用本文登记的最新兼容稳定组合，并在解除条件满足后升级。禁止 Beta、RC、Canary、Nightly、Snapshot，也禁止为了版本号在同一工程并装一套实际不生效的构建器。

```text
backend/
├── pom.xml                         # 后端根总工程
├── ruoyi-admin/                    # Admin 总工程
│   ├── pom.xml                     # 聚合 Admin 所有模块
│   ├── ruoyi-admin-api/            # Admin System、Workflow 与管理身份契约
│   ├── ruoyi-system/               # Admin 系统管理实现
│   ├── ruoyi-gen/                  # Admin 代码生成
│   ├── ruoyi-job/                  # Admin 任务执行
│   ├── ruoyi-workflow/             # Admin 工作流实现
│   ├── ruoyi-ai/                   # Admin AI 接入
│   ├── ruoyi-demo/                 # Admin 技术能力示例
│   └── ruoyi-admin-server/         # Admin Boot 与专属 Controller
├── ruoyi-client/                   # Client 总工程
│   ├── pom.xml                     # 聚合 Client 所有模块
│   ├── ruoyi-client-api/           # Client 会话、认证请求与私有管理契约
│   ├── ruoyi-client-um/            # 应用用户、接入客户端、第三方身份管理
│   └── ruoyi-client-server/        # Client Boot、认证与专属 Controller
├── ruoyi-common/                   # Common 总工程，无业务 API 子工程
├── ruoyi-extend/                   # 根工程直接管理的独立扩展服务
└── script/sql/                     # 多数据库初始化脚本

web/
├── admin/
├── h5/
├── app/
├── miniapp/
└── harmony/
```

Admin 新模块放入 `backend/ruoyi-admin/`，Client 新模块放入 `backend/ruoyi-client/`，并加入对应总工程的 `<modules>`。`ruoyi-admin/ruoyi-gen` 是 Admin 代码生成器，默认模板含 Admin 表结构、权限和 `BaseEntity` 语义；Client 业务可参考其分层，但必须改为 `AppBaseEntity`、`app_*` 与 Client 七要素，禁止原样搬用。

API 模块只放存在真实跨模块消费者的 Java 契约。HTTP Controller、仅启动服务使用的响应 VO 和业务实现不因名称中含“接口”就进入 API 模块；没有消费者时禁止预建空 Service、DTO 或微服务契约。

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

Client 受保护请求还会实时复核应用用户、接入客户端的有效标志与凭证版本；用户/应用被设为无效或重置密码后，已有 Token 在下一次请求时失效。

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

接入客户端的 clientid、key 和 secret 创建后不可变，且不提供删除操作；下线统一设为无效，避免已发布前端的身份标识被不可逆破坏。

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

Client 种子用户的用户名为 `client`、手机号为 `13800138000`、密码为 `admin123`。H5 的 `password` 使用用户名，App 的 `phonePassword` 必须使用手机号；不要把全局用户名直接填入 App 手机号输入框。

登录参数：

| grantType | 请求字段 | 说明 |
|---|---|---|
| `password` | `username,password,code?,uuid?,clientId,grantType` | 图形验证码开启时必须传 code/uuid |
| `phonePassword` | `username`（手机号）、`password,clientId,grantType` | App 手机号密码登录 |
| `sms` | `phoneNumber,smsCode,clientId,grantType` | 先获取短信验证码 |
| `xcx` | `xcxCode,clientId,grantType` | 仅微信小程序，来自 `Taro.login` |

微信小程序首次使用有效 `xcxCode` 登录时，Client 会在同一事务内创建应用用户与 `app_user_identity` 绑定；重复请求通过分布式锁和数据库唯一键保证幂等。该行为只建立用户身份，不自动授予业务角色或权益。

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

### 4.6 Admin 调用 Client 的内部管理边界

- Admin 对浏览器继续暴露 `/client/user/**` 与 `/client/application/**`，权限、操作日志、防重复提交和响应脱敏均属于 Admin。
- Admin 通过 `/internal/admin/v1/users/**`、`/internal/admin/v1/clients/**` 调用 Client；这些路径不是前端契约，不进入 OpenAPI，也不得经过 Admin Gateway 或 Client Gateway。
- 应用用户和接入客户端均使用 `validFlag` 表达有效性，固定为 `1=有效、0=无效`。Admin 对外变更路径为 `/client/user/changeValidFlag`、`/client/application/changeValidFlag`，对应 Client 私有管理路径为 `/internal/admin/v1/users/validFlag`、`/internal/admin/v1/clients/validFlag`；不得复用 `sys_normal_disable` 的反向状态语义。
- `ruoyi-client-api` 只放真实跨应用使用的管理命令、查询和响应，不放 Entity、Mapper、Service、Excel 或脱敏注解。
- Client 负责唯一性校验、密码哈希、授权类型规则、有效性校验和 `app_*` 写入；Admin 不复制这些业务规则。
- 内部请求使用独立共享密钥完成 HMAC-SHA256 签名，并校验时间戳、nonce 和请求体摘要；nonce 由 Client Redis 防重放。禁止转发浏览器的 Authorization、clientid 或 Admin Token。
- 内部管理请求只传递并签名 Admin 操作人 ID，由 Client 写入创建人或修改人审计字段；Client 不接收 Admin 部门 ID，也不能通过构造 Client 登录态模拟管理员。
- 内部共享密钥不得进入前端、Gateway、日志或数据库。跨主机部署时，除服务签名外还必须使用内部 HTTPS 或 mTLS。

## 5. 编码规范

### 5.1 后端

- 沿用 RuoYi 的 Entity、BO、VO、`BaseMapperPlus`、Service/impl、Controller 分层。
- 查询使用 MyBatis-Plus、`QueryBuilder` 与现有 Mapper 扩展，不引入 JdbcTemplate/Repository Port 作为第二套范式。
- Controller 统一返回 `R<T>` 或 `PageResult<T>`，列表、导出、权限、日志注解参照现有 `SysUserController`/`SysClientController`。
- 登录策略参照原 `IAuthStrategy` 的 Bean 路由写法，不自建另一套框架级安全上下文。
- 公共技术模块 `ruoyi-common` 不放 Client 密钥、微信 AppID 或业务常量。
- Admin Controller 不得直接注入 Client UM Service；管理调用必须经过 `ruoyi-client-api` 契约和 Admin HTTP 适配层。
- 新模块必须包含真实能力；没有业务代码时不要建立 package-info 空壳。
- 新模块必须使用真实业务域名称，禁止使用没有明确职责的泛化占位名称。

### 5.2 前端

- 五端互相独立，各自拥有 `src/api/request.ts`、API 类型、环境配置、Token key 与锁文件。
- “契约一致”不等于“复制一端实现”：平台专有导航、存储、随机数、触控单位和安全区必须分别适配。
- H5/App/HarmonyOS 不能使用小程序的 xcx/AppID/rpx/存储键；微信小程序不能展示账号密码兜底，除非后端应用明确允许该 grant。
- 登录结果与用户信息逐字段对齐 4.5；验证码 `uuid/img` 在关闭验证码时允许为空。
- 401 清除本端 Token 并回到登录态；禁止使用 `Admin-Token` 作为任一 Client 端存储键。
- App 使用 npm 与 `package-lock.json` 作为唯一依赖事实源；Token 必须保存到 iOS Keychain / Android Keystore，冷启动恢复完成前不得发业务请求。
- App 当前固定使用 `@ant-design/react-native 5.4.3`、`react-native-gesture-handler 2.32.0`、`react-native-reanimated 4.5.3` 与 `react-native-worklets 0.11.4`。该组合用于兼容 Ant Design RN 的公开 Drawer/Swipeable 入口；升级时必须完成双平台原生回归，禁止改用库内部路径或依赖 peer 自动选版。
- App 的主题偏好可保存到 AsyncStorage，但 Bearer Token 禁止写入该明文存储；Ant Design RN 图标字体必须通过 `react-native.config.js` 同步链接到 iOS 与 Android 原生工程。

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
- `admin-backend` 通过仅两个 Backend 加入的 `admin-client-internal` 网络直连 Client；两个 Gateway 对 `/internal/**` 和 `/prod-api/internal/**` 固定返回 404。
- 浏览器生产请求通过 `/prod-api/**` 进入对应 Gateway，转发到后端前必须去掉 `/prod-api`；Client 去前缀后仍执行显式白名单与限流。
- 仓库内 Gateway 只监听 HTTP，TLS 在外部可信入口终止；不要将明文 Gateway 端口直接开放到公网。
- 生产启动、必需环境变量与 TLS 边界以 `infra/README.md` 为准。
- Client 短信服务默认关闭；生产环境仅在 `CLIENT_SMS_ENABLED=true` 时配置供应商凭据并开放短信验证码与短信登录。

## 7. 数据库与中间件规则

- `infra/init/01-init.sql` 是 Docker 新库的初始化事实来源；不要同时偷偷引入另一套 Flyway baseline。
- MySQL、Oracle、PostgreSQL、SQL Server 脚本的 Client 三表与四端种子必须同步。
- 表主键沿用雪花 ID，不使用自增；脚手架不建立物理外键。
- Admin 与 Client 当前使用同一个 `ry-vue` Schema，但各自拥有不同表；Client 表统一使用 `app_*`，不得与 Admin 的 `sys_*` 共表。
- Client `app_*` 表七要素精确定义为：`id`（主键）、`valid_flag`（是否有效，`1=有效、0=无效`）、`del_flag`（是否删除）、`create_by`（创建人）、`create_time`（创建时间）、`update_by`（修改人）、`update_time`（修改时间）。Client 表不设 `create_dept`，也不设通用 `version`；Admin `sys_*` 表继续沿用各表原有的 RuoYi 字段规范，两套体系允许存在结构差异。
- Client Redis 使用独立 database 与 `client` keyPrefix；keyPrefix 不手工追加冒号。
- 修改 `app_client` 后无需复用 Admin 的 `sys_client` 缓存。
- `app_user.credential_version` 是密码重置后使旧会话失效的凭证安全字段，不是七要素中的通用乐观锁版本；它随密码重置递增并写入 Client Token，不得绕过校验恢复旧会话。
- Docker 初始化脚本只在空数据卷首次执行。已有开发环境可重建数据卷以获得 `app_*` 新结构；需要保留数据的环境必须先备份并人工迁移，不能依赖重启容器自动改表。

## 8. 常见问题

- **前端打到错误服务**：Admin 代理 `8080`；H5/App/小程序/HarmonyOS 指向 `8082`。
- **401 clientid 不匹配**：检查请求头、Token 中 clientid 和当前应用种子是否一致。
- **登录后无法退出**：Client 应用允许路径必须包含 `/client/**,/auth/logout`。
- **数据库已有旧结构**：Docker init 只在空数据卷首次运行；开发环境需要重建数据卷或手工迁移。
- **API 拆分后旧 Token 反序列化失败**：Admin/Client 登录上下文类已独立命名；从旧版本升级时清理两侧各自的 Sa-Token 会话键并重新登录，不迁移旧会话对象。
- **登录脚本 NPE**：登录请求必须带有效 `User-Agent`。
- **RSA 解密失败**：前端公私钥和后端 `application.yml` 必须成对一致。
- **HarmonyOS 加密失败**：运行时必须提供安全随机能力；禁止降级到 `Math.random()`，需在 DevEco 真机/模拟器验证。
- **小程序登录失败**：确认微信 AppID/Secret 已通过环境注入、grantType 只有 `xcx`，并检查微信 code 换取响应；首次成功登录会自动创建应用用户和第三方身份绑定。

## 9. 参考

- Agent 摘要：`AGENTS.md`
- 当前完成度与开发导航：`docs/工程现状.md`
- 协作规范：`CONTRIBUTING.md`
- Git 分支、PR 与合并规范：`git-workflow-spec.md`
- 设计系统：`docs/AI-设计系统上下文.md`
- 设计 Token：`docs/design-tokens.json`、`docs/design-tokens.ts`
- 平台规范：`docs/平台适配/`
- RuoYi 生成规范：`backend/.codex/skills/ruoyi-plus-ai-coding/SKILL.md`
