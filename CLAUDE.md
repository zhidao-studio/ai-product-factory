# CLAUDE.md

本文件是仓库结构、运行方式和真实接口契约的主要事实来源。工程演进时必须同步维护。

## 1. 项目定位

`ai-product-factory` 是可复制的中大型多端产品脚手架，不是“AI 产品工厂”自身业务。复制后再由开发者或 AI 按具体产品填充共享业务域。

系统的业务顺序是：**先有 Client 产品用户业务，再有围绕同一业务进行运营和管理的 Admin 后台。**

- Client 是业务发生端。
- Admin 是业务管理端。
- 两端接口、身份、Token、权限和 clientid 隔离。
- 两端复用同一套业务领域规则和业务数据。
- Admin 不是 Client 的上游运行依赖，Client 也不调用 Admin API。

五个前端完全独立，不共享运行时代码、源码包、依赖配置或锁文件：PC Admin、H5、原生 App、微信小程序和 HarmonyOS。

任何改动必须遵守：

1. **UI 遵循设计系统。** 修改界面或样式前阅读 `docs/AI-设计系统上下文.md`，Design Token 是唯一事实来源。
2. **前端遵循真实后端契约。** 只接入本文件第 4 节及真实 Controller 已存在的路径和字段。
3. **身份域不可混用。** `sys_user` 只代表管理员，`client_user` 只代表产品用户。
4. **业务规则不可复制。** Admin/Client 对订单、内容等业务的操作必须进入同一个领域模块。

## 2. 技术栈

| 层级 | 技术 |
| --- | --- |
| 后端 | Spring Boot 4.1、JDK 21、Sa-Token、JDBC/MyBatis-Plus、Jetty |
| Admin | UmiJS 4、React、Ant Design |
| H5 | Vite、React 19、antd-mobile |
| App | React Native CLI、Ant Design RN |
| 微信小程序 | Taro 4、React DSL |
| HarmonyOS | Taro 4、React DSL |
| 基础设施 | MySQL 8、Redis 7、Nginx Gateway |

## 3. 仓库结构

```text
ai-product-factory/
├── backend/
│   ├── ruoyi-admin/              # Admin 启动入口，8080
│   ├── ruoyi-client/             # Client 启动入口，8082
│   ├── ruoyi-interfaces/         # Admin / Client HTTP 接口
│   ├── ruoyi-applications/       # 管理用例 / 用户用例
│   ├── ruoyi-domains/            # 产品用户域与共享产品业务域
│   ├── ruoyi-security/           # Admin / Client 身份安全策略
│   ├── ruoyi-admin-modules/      # system/workflow/gen/job/ai/demo
│   ├── ruoyi-infrastructure/     # 数据库和中间件适配
│   ├── ruoyi-integrations/       # 微信、短信等外部适配
│   ├── ruoyi-common/             # 技术底座
│   ├── ruoyi-api/                # RuoYi 现有内部 Java API/DTO
│   └── ruoyi-extend/             # monitor/snailjob/snail-ai
├── web/
│   ├── admin/
│   ├── h5/
│   ├── app/
│   ├── miniapp/
│   └── harmony/
├── infra/
│   ├── gateway/                  # Admin / Client 两套 Nginx Gateway
│   ├── init/01-init.sql
│   ├── docker-compose.yml
│   └── docker-compose.prod.yml
├── docs/
└── scripts/
```

不存在 `ruoyi-channel-admin/h5/app/miniapp/harmony`。Admin 本身就是管理接口入口；四个用户端统一使用 Client API。端差异进入认证策略和外部集成，不按前端技术栈复制后端模块。

## 4. 后端真实契约

### 4.1 服务入口

| 服务 | 本地地址 | 使用者 |
| --- | --- | --- |
| Admin | `http://localhost:8080` | 仅 `web/admin` |
| Client | `http://localhost:8082` | H5、App、小程序、HarmonyOS |

Admin Web 开发代理指向 `8080`；H5、Miniapp/Harmony H5 调试代理指向 `8082`；React Native 开发地址指向设备可访问的 `8082`。

### 4.2 统一返回体

```jsonc
{ "code": 200, "msg": "操作成功", "data": {} }
```

- `200`：成功。
- `401`：身份无效或 Token/clientid 不匹配。
- `403`：没有访问权限。
- `500`：业务或服务端错误。

各端请求层负责解包 `data`、展示 `msg`，并在 `401` 时清理本端 Token。

### 4.3 Admin 契约

Admin 继续使用 RuoYi 管理员模型：

| 用途 | 方法与路径 | 鉴权 |
| --- | --- | --- |
| 图片验证码 | `GET /auth/code` | 无 |
| 管理员登录 | `POST /auth/login` | 无，AES+RSA 请求体加密 |
| 管理员退出 | `POST /auth/logout` | Admin Token |
| 管理员信息 | `GET /system/user/getInfo` | Admin Token |

- Admin `clientid`：`e5cd7e4891bf95d1d19206ce24a7b32e`。
- 默认管理员：`admin / admin123`。
- 管理员、角色、菜单、部门和数据权限由 `sys_*` 表及 `ruoyi-system` 管理。

### 4.4 Client 契约

四个用户端使用同一套产品用户 API：

| 用途 | 方法与路径 | 鉴权 |
| --- | --- | --- |
| 验证码能力声明 | `GET /client-auth/code` | 无；当前 `captchaEnabled=false` |
| 产品用户登录 | `POST /client-auth/login` | 无，AES+RSA 请求体加密 |
| 产品用户退出 | `POST /client-auth/logout` | Client Token |
| 当前产品用户 | `GET /client-api/v1/session` | Client Token + clientid |
| 获取短信码 | `GET /client-resource/sms/code?phoneNumber=...` | 无 |

Client 登录公共字段：

```jsonc
{
  "clientId": "本端 clientid",
  "grantType": "password | phonePassword | sms | xcx"
}
```

授权方式附加字段：

| grantType | 字段 | 适用端 |
| --- | --- | --- |
| `password` | `username`, `password` | H5/App/小程序/HarmonyOS |
| `phonePassword` | `username`（手机号）, `password` | H5/App/HarmonyOS |
| `sms` | `phoneNumber`, `smsCode` | H5/App/HarmonyOS |
| `xcx` | `appid`, `xcxCode` | 仅微信小程序 |

登录响应：

```jsonc
{
  "code": 200,
  "data": {
    "access_token": "...",
    "expire_in": 604800,
    "client_id": "..."
  }
}
```

会话响应 `data` 包含：`userId`、`userName`、`nickName`、`avatar`、`clientId`、`deviceType`、`roles`、`permissions`。`roles/permissions` 是产品用户业务授权扩展点，不代表 Admin RBAC。

### 4.5 Client 应用配置

| 前端 | clientid | deviceType | 默认授权 |
| --- | --- | --- | --- |
| H5 | `8f6e7d5c4b3a2910fedcba9876543210` | `h5` | password/sms/phonePassword |
| App | `428a8310cd442757ae699df5d894f051` | `app` | password/sms/phonePassword |
| 微信小程序 | `7f4c1e2d8a9b4c6f9012d3e4f5a6b7c8` | `miniapp` | password/xcx |
| HarmonyOS | `9c8b7a6d5e4f3210a1b2c3d4e5f60718` | `harmony` | password/sms/phonePassword |

默认产品用户：`client / admin123`，手机号 `13800138000`。它只存在于 `client_user`，不是管理员账号。

App 使用 `AppNavigator + SessionContext` 作为登录态路由守卫。登录页保留手机号密码、手机号短信两种方式和 60 秒重发倒计时；登录成功后必须读取 Client 会话接口，不以本地 Token 存在与否代替服务端会话校验。

### 4.6 Token 与加密

- 受保护请求发送 `Authorization: Bearer <token>` 和 `clientid`。
- Admin 使用默认 Sa-Token loginType；Client 使用 `loginType=client`。
- Client Token 只能访问 `/client-api/**`，不能访问 Admin 接口；反之亦然。
- Admin 与 Client 开发环境使用不同 Redis database/key prefix。
- `@ApiEncrypt` 请求顺序仍为：随机 AES 密钥加密 JSON → RSA 公钥加密 AES 密钥 → 放入 `encrypt-key` 请求头。
- Client 默认密钥在 `ruoyi-common-encrypt/src/main/resources/client-api-encrypt.yml`，生产环境必须通过环境变量替换。

## 5. 后端分层规则

依赖方向：

```text
interfaces -> applications -> domains
security --------------------> domains
infrastructure --------------> domains
integrations ----------------> domains
boot -> interfaces + security + infrastructure + integrations
```

- `ruoyi-domains` 不得依赖 Spring MVC、数据库实现、微信/SMS SDK或前端 DTO。
- `ruoyi-applications` 只编排用例，不实现数据库和外部 HTTP。
- `ruoyi-interfaces` 负责 HTTP 参数、返回 DTO 和协议适配。
- `ruoyi-infrastructure` 实现领域仓储端口。
- `ruoyi-integrations` 实现微信、短信、支付等外部端口。
- `ruoyi-common` 只保存通用技术机制，禁止放 Admin/Client Principal 或产品业务 DTO。

复制脚手架后新增订单、内容、商品等模块时，先在 `ruoyi-domains` 建立真实领域，再分别在 Admin/Client application 暴露管理用例和用户用例。

## 6. 数据库与中间件

开发环境使用同一 MySQL 实例和 `ry-vue` 数据库，但按表边界隔离：

- Admin 身份：`sys_user`、`sys_role`、`sys_menu`、`sys_client` 等。
- Client 身份：`client_user`、`client_identity`、`client_application`。
- 产品业务：后续复制脚手架后新增的统一业务表。

Admin Flyway 历史表使用默认配置；Client 使用 `flyway_client_schema_history` 和 `classpath:db/client`。Client Redis 默认 database `1`、key prefix `client:`；Admin 默认 database `0`。

生产可拆分物理数据库/Redis，但不得在 Admin 和 Client 各保存一份订单等业务事实。

## 7. Gateway

生产参考包含两套基础设施 Gateway：

- `infra/gateway/admin.nginx.conf`：转发到 `ruoyi-admin:8080`，适合内网、IP、MFA和审计策略。
- `infra/gateway/client.nginx.conf`：只暴露 `/client-auth/**`、`/client-resource/**`、`/client-api/**`，带登录/API限流。

生产编排不直接发布后端容器端口；Admin/H5 静态站点分别代理到对应 Gateway。Gateway 不承担用户权限、业务参数校验或 DTO 转换。

## 8. 五端前端约定

- 每端独立维护 `src/api/request.ts`、API 类型、Token 存储、环境变量、设计 Token 适配和锁文件。
- 禁止跨端相对引用源码，禁止建立前端共享 workspace。
- Admin 只能指向 Admin API；其余四端只能指向 Client API。
- 微信平台差异只保留在 `web/miniapp`；HarmonyOS 不允许复用 `xcx`、微信 AppID或小程序 clientid。
- 生产 App、小程序和 HarmonyOS 必须注入设备可访问的 HTTPS Client Gateway 地址。

## 9. 启动

```bash
bash scripts/start-dev.sh
```

脚本启动 MySQL、Redis、Admin `8080` 和 Client `8082`。停止并保留数据：

```bash
bash scripts/stop-dev.sh
```

单独编译双入口：

```bash
cd backend
./mvnw -B -pl ruoyi-admin,ruoyi-client -am -DskipTests compile
```

五个前端仍在各自目录独立安装和启动。

## 10. 参考

- 工程边界：`docs/工程架构基线.md`
- 设计系统：`docs/AI-设计系统上下文.md`
- 前端平台规则：`docs/平台适配/`
- 后端说明：`backend/ARCHITECTURE.md`
- 项目启动：`README.md`
