# CLAUDE.md（项目总指南 · AI 必读）

本仓库是一个**中型项目工程脚手架**：后端 RuoYi-Vue-Plus（Boot 版，Spring Boot 4.1 / JDK 21 / Sa-Token / MyBatis-Plus），前端覆盖 **PC Web（admin）、H5、App（React Native）、微信小程序（Taro）** 四端，统一适配 Ant Design 生态。

> **两条铁律**
> 1. **UI 以设计系统为准**：任何界面/样式生成前，先读 `docs/AI-设计系统上下文.md`。
> 2. **前端以真实后端接口为准**：所有接口对接严格遵循本文「后端接口契约」，禁止臆造路径/字段。

---

## 1. 技术栈与目录

```
ruoyi-plus-boot/
├── backend/                 # RuoYi-Vue-Plus 后端（Maven 多模块）
│   ├── ruoyi-admin/         # 启动模块（含 Auth/Captcha 等 Web 控制器）
│   ├── ruoyi-modules/       # 业务模块（system 等）
│   ├── ruoyi-common/        # 公共（R 返回体、加密、Sa-Token 工具）
│   └── ruoyi-extend/        # 扩展（monitor / snailjob / snail-ai）
├── infra/                   # Docker 基础设施
│   └── docker-compose.yml   # MySQL:3306 / Redis:6379（标准端口；本机已卸载本地 MySQL/Redis）
├── web/                     # 四端前端
│   ├── admin/   # PC 后台（UmiJS 4 + antd，官方 plus-ui-react 6.x）
│   ├── h5/      # H5 移动端（Vite + React 19 + antd-mobile）
│   ├── app/     # App（React Native CLI，@ant-design/react-native）
│   └── miniapp/ # 微信小程序 / 鸿蒙（Taro 4，React DSL）
├── docs/                    # 设计系统（Design Token / 平台适配 / 组件库 / 页面模板）
├── README.md                # 仓库说明
└── AGENTS.md                # 同本文件 UI 规范节（Agent 入口）
```

| 端 | 框架 | 请求层文件 | 启动脚本 | 默认端口 |
|---|---|---|---|---|
| admin | UmiJS4 + antd | `src/api/request.ts`（官方） | `pnpm dev` | 8000 |
| h5 | Vite + antd-mobile | `src/api/request.ts` | `pnpm dev` | 8081 |
| miniapp | Taro4 | `src/api/request.ts` | `pnpm dev:h5` / `build:h5` | 10086 |
| app | RN CLI | `src/api/request.ts` | `npm run ios` / `android` | — |

---

## 2. 后端接口契约（前端对接唯一准绳）

### 2.1 基础路径与端口
- 后端**必须显式锁定 8080**：`java -jar ruoyi-admin.jar --server.port=8080`。
  > ⚠️ RuoYi-Vue-Plus 6.x 默认会**随机分配端口**（实测曾起在 49863），务必加 `--server.port=8080`，否则前端按 8080 代理会连不上。
- `context-path: /`（无前缀）。统一返回体 `R<T>`。
- 各前端本地开发统一用前缀 **`/dev-api`** 代理到后端：
  - admin：Umi `proxy`（`/dev-api` → `http://localhost:8080`，去前缀）。
  - h5：`vite.config.ts` 的 `server.proxy`（`/dev-api` → `http://localhost:8080`，`rewrite` 去 `/dev-api`）。
  - miniapp(h5)：`config/dev.ts` 的 `devServer.proxy`。
  - app：RN 无代理，调试时把 `baseApi` 指向可达地址（安卓模拟器 `http://10.0.2.2:8080/dev-api`）。
- **前端请求 `baseURL` 一律用 `/dev-api`**，由代理落到真实后端；不要硬编码 `localhost:8080`。

### 2.2 统一返回体 `R<T>`
后端所有接口返回 `org.dromara.common.core.domain.R`：
```jsonc
{ "code": 200, "msg": "操作成功", "data": { /* 业务数据 */ } }
```
- `code === 200` 成功；`401` 未登录/过期；`500` 服务器错误；`601` 警告。
- 前端请求层**统一解包**：成功时 `resolve(response.data.data)`（即业务体），`code !== 200` 时 `reject` 并取 `msg` 提示。
- 枚举：`HttpStatus.SUCCESS=200 / WARN=601 / UNAUTHORIZED=401 / FORBIDDEN=403 / ERROR=500`。

### 2.3 鉴权（Sa-Token）
- 登录后拿 `access_token`（JWT 形态），后续请求头：**`Authorization: Bearer <access_token>`**。
- **必须同时带 `clientid` 头**（默认 web 端 `e5cd7e4891bf95d1d19206ce24a7b32e`，须与后端 `sys_client` 表一致）。
  > ⚠️ Sa-Token 会校验「请求头 clientid」与「Token 内记录的 clientid」是否一致，不一致直接 `401 客户端ID与Token不匹配`。前端请求层默认就带 `clientid`，切勿在受保护接口漏带。
- 未携带/过期 Token 访问受保护接口 → 后端 `401` → 前端清 Token 并提示重新登录。

### 2.4 核心接口清单（已实现对接）
| 用途 | 方法 & 路径 | 请求 | 响应 `data` | 备注 |
|---|---|---|---|---|
| 图片验证码 | `GET /auth/code` | 无（免鉴权） | `CaptchaVo{ captchaEnabled, uuid, img }` | `img` 为 Base64（`data:image/png;base64,`）；关闭验证码时 `captchaEnabled=false` |
| 登录 | `POST /auth/login` | `LoginBody{ username, password, code, uuid, clientId, grantType }` | `LoginVo{ access_token, refresh_token, expire_in, ... }` | **`@ApiEncrypt`**：请求体 AES+RSA 加密（见 2.5）；`grantType=password` |
| 退出 | `POST /auth/logout` | 无 | `R<Void>` | 需鉴权 |
| 用户信息 | `GET /system/user/getInfo` | 无 | `UserInfoVo{ user, roles, permissions }` | 需鉴权 + `clientid` 头 |

> 其余业务接口（用户/角色/菜单/字典…）遵循同一 `R<T>` 契约，路径以 `SysXxxController` 的 `@RequestMapping` 为准。**新增对接前先读对应 Controller 源码**，不要猜。

### 2.5 登录/注册加密（`@ApiEncrypt`）
后端对 `/auth/login`、`/auth/register` 用切面解密。前端必须按如下方式加密：
1. 随机生成 16 字节 AES 密钥（`crypto-js`，AES-**ECB**/Pkcs7）。
2. 用该 AES 密钥加密请求体 JSON。
3. 用 **RSA 公钥**加密「AES 密钥的 Base64」放入请求头 `encrypt-key`。
4. 响应若带 `encrypt-key` 头，则先用 RSA 私钥解出 AES 密钥，再 AES 解密响应体。
- RSA 公钥/私钥在 `.env`（`VITE_APP_RSA_PUBLIC_KEY` / `VITE_APP_RSA_PRIVATE_KEY`）中，与后端 `application.yml` 的 `crypto` 密钥对一致。
- 开关 `VITE_APP_ENCRYPT=true` 时启用；四端 `src/utils/{crypto,jsencrypt}.ts` 已实现同一套算法。

---

## 3. 前端对接规范（四端一致）

- **请求层**：每端 `src/api/request.ts`（admin 为官方实现，其余三端与其同源对齐）。职责：注入 `Authorization`/`clientid`、按 `isEncrypt:'true'` 加密、解包 `R`、401 清 Token、错误取 `msg` Toast。
- **类型**：后端 `R<T>` 对应前端 `R<T>`；业务入参/出参在 `src/api/*.ts` 用 interface 描述（如 `LoginParams`/`LoginResult`/`UserInfo`）。
- **Token 存储**：`localStorage['Admin-Token']`（admin/h5），Taro `Storage`（miniapp），RN 见 `src/utils/auth.ts`（优先 localStorage，退回内存）。
- **新增接口**：在 `src/api/<模块>.ts` 封装函数，统一返回 `R<X>`；页面只消费业务体，不碰 `code/msg`。
- **环境变量**（h5 用 Vite `.env`，app/miniapp 内置常量于 `src/utils/env.ts`）：`VITE_APP_BASE_API`、`VITE_APP_CLIENT_ID`、`VITE_APP_ENCRYPT`、`VITE_APP_RSA_*`。
- **RN 注意事项**：`jsencrypt` 依赖 `window`/Web Crypto，真机需相应 polyfill；`baseApi` 需指向可达后端地址。

---

## 4. 一键跑通（前后端联调）

> 后端为 Maven 多模块、需 JDK 21 与本地 Maven；本仓库 infra 仅提供 MySQL/Redis 容器。
> 后端默认连 `localhost:3306`（MySQL）/ `localhost:6379`（Redis）标准端口；本机已卸载本地 MySQL/Redis，端口空闲，docker-compose 直接映射标准端口即可。

1. **启基础设施**（Docker，不污染本机）：
   ```bash
   docker compose -f infra/docker-compose.yml up -d   # MySQL:3306(root/root, 库 ry-vue)  Redis:6379(ruoyi123)
   ```
2. **启后端**（JDK 21）：
   ```bash
   cd backend
   export JAVA_HOME=$(/usr/libexec/java_home)   # 须为 JDK 21
   # 打包（仅首次）
   ./mvnw -pl ruoyi-admin -am package -DskipTests
   # 直接运行：application-dev.yml 已内置 localhost:3306(useSSL=false) / localhost:6379，无需端口环境变量
   java -jar ruoyi-admin/target/ruoyi-admin.jar --server.port=8080 --captcha.enable=false
   ```
   - `--captcha.enable=false`：联调期关闭验证码（否则需识别图片 math 验证码）。生产保持开启。
   - 启动后访问 `http://localhost:8080/auth/code` 应返回 `R<CaptchaVo>`。
3. **启前端**（任选一端）：
   ```bash
   cd web/admin  && pnpm install && pnpm dev      # 8000，自带完整请求层
   cd web/h5     && pnpm install && pnpm dev      # 8081，已对接登录/用户信息
   cd web/miniapp && pnpm install && pnpm dev:h5  # 10086，已对接
   cd web/app    && npm install && npm run ios     # 需 Xcode/Android Studio
   ```
4. **验证联调**：前端打开页 → 输入 `admin / admin123` + （验证码关闭时留空）→ 登录成功 → 调 `/system/user/getInfo` 取到用户信息（roles 含 `superadmin`），即「前后端数据对接」跑通。

---

## 5. UI 设计规范（生成界面/样式前必读）

本项目前端严格遵循一套**多端 UI/UX 设计系统**，规则见 `docs/`：

- **硬约束与 Token 单源**：`docs/AI-设计系统上下文.md`（MUST/NEVER、精确 Design Token、组件范式、自检清单）—— 所有 UI 生成以它为准。
- **Token 文件**：`docs/design-tokens.json`（DTCG 单源）、`docs/design-tokens.ts`（antd 绑定）。
- **分层原则**：通用层（Token/原则/组件定义/UX/图表/错误文案）全端一致；平台层（导航/手势/安全区/断点/组件落地选型）从 `docs/平台适配/<端>.md` 取。
- **速记**：主色永远 `#1677FF`；颜色/间距/圆角/字号来自 Token，禁止硬编码；移动端禁用 `Table`（用 `List`+触底加载）；每屏主操作至多 1 个 `primary`；暗色用 `theme.darkAlgorithm` 派生。

> 业务需求与上述规范冲突时，**以设计系统文档为准**。完整索引：`docs/README.md`。

---

## 6. 已知事项 / 坑（踩坑记录）

- **本机 MySQL/Redis 端口冲突（已规避）**：macOS 上若本机用 Homebrew 装过 MySQL/Redis，会占用 `localhost:3306/6379`。本机已卸载本地实例，docker-compose 直接用标准端口 `3306/6379`，后端 `application-dev.yml` 也用标准端口，无需环境变量覆盖。若日后本机重装 MySQL/Redis，需改 docker-compose 映射或后端 `spring.datasource` 配置。
- **localhost 走 Unix socket 陷阱（已缓解）**：MySQL JDBC 在 `host=localhost` 时会优先走 Unix socket 而非 TCP。当前本机已卸载 MySQL、无 socket 文件，JDBC 自动回退到 TCP 连 `localhost:3306`（即 Docker 容器），可正常工作。若日后本机重装 MySQL，会重现该陷阱，届时将 `application-dev.yml` 数据源 host 改为 `127.0.0.1`。
- **RuoYi 6.x 随机端口**：必须 `--server.port=8080` 锁定，否则前端代理（按 8080）连不上。
- **MySQL `useSSL`**：连 Docker MySQL 时 `useSSL=true` 会 SSL 握手失败（`Communications link failure`）。已在 `application-dev.yml` 主数据源固定 `useSSL=false`，开箱即用无需额外参数。
- **登录需 `User-Agent` 头**：后端 `LoginHelper.fillRequestContext` 解析 UA，缺失会 NPE（真实浏览器/移动端自带 UA，裸 `curl`/脚本必须补 `User-Agent`）。
- **`clientid` 头必须带**：受保护接口（如 getInfo）若漏带 `clientid`，Sa-Token 报「客户端ID与Token不匹配」`401`。前端请求层默认带，勿删。
- **admin 依赖未在本环境安装**（Umi 重型工程）。本机需 `pnpm install` 后 `pnpm lint`（=tsc）验证；请求层为官方代码，已与后端契约一致。
- **Taro 非 h5 平台**：当前请求层用 axios，仅 h5/rn 平台可直接跑；微信/支付宝等小程序需替换为 `Taro.request` 适配器（脚手架预留，按需接入）。
- **后端默认账号**：`admin / admin123`（非 123456）。
- 加密 RSA 密钥对前后端必须一致；改后端 `application.yml` 的 `crypto` 密钥须同步前端 `.env`/`env.ts`。
