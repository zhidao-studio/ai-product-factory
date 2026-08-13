# 贡献指南（CONTRIBUTING）

本文件面向**参与本仓库协作的开发者与 AI 助手**，定义环境要求、协作流程与编码约定。
项目总览、技术栈、接口契约与排障详见 [`CLAUDE.md`](./CLAUDE.md)，Agent 入口见 [`AGENTS.md`](./AGENTS.md)。

---

## 1. 项目定位

`ai-product-factory` 是一个**开箱即用的中大型项目工程脚手架**：Admin/Client 两个 Spring Boot 应用 + 五个独立前端（PC 后台 / H5 / 原生 App / 微信小程序 / HarmonyOS），统一采用 React + Ant Design 体系与同一套设计 Token。

**两条不可违背的铁律**（任何改动都不得违反）：

1. **UI 以设计系统为准**：所有界面必须对齐 `docs/` 中的设计 Token 与组件范式，禁止硬编码样式覆盖设计系统。
2. **前端以真实后端接口为准**：前端数据契约（路径、字段、`R<T>` 结构、加密/鉴权）必须以后端实际接口契约为准，禁止凭空臆造接口。

---

## 2. 环境要求

| 依赖 | 版本 | 说明 |
| --- | --- | --- |
| JDK | **21** | 后端基于 Spring Boot 4.1 / RuoYi 6.x，须 JDK 21 |
| Node.js | ≥ 22.12 | 同时满足 React Native App 与 Vite 8 的运行要求 |
| pnpm | ≥ 10 | Admin、H5、小程序、HarmonyOS 包管理；具体版本以各工程 `packageManager` 为准 |
| npm | 随 Node.js | React Native App 包管理 |
| Docker | 最新稳定版 | 提供 MySQL 8 / Redis 7 等中间件 |
| Maven | 3.9+（或仓库内置 `mvnw`） | 后端构建 |

> 端口约定：Admin 后端 `8080`、Client 后端 `8082`、MySQL `3306`、Redis `6379`。

---

## 3. 快速开始

```bash
# 1. 一键启动（Docker 中间件 + Admin/Client 两个后端 + 等待就绪）
bash scripts/start-dev.sh

# 2. 按需启动一个独立前端
cd web/admin   && pnpm install && pnpm dev        # PC 后台 → Admin 8080
cd web/h5      && pnpm install && pnpm dev        # H5 → Client 8082
cd web/app     && npm install && npm start        # React Native → Client 8082
cd web/miniapp && pnpm install && pnpm dev:weapp  # 微信小程序 → Client 8082
cd web/harmony && pnpm install && pnpm dev:harmony # HarmonyOS → Client 8082

# 3. 停止
bash scripts/stop-dev.sh
```

Admin 开发账号：`admin / admin123`；Client 开发账号：`client / admin123`。

---

## 4. 仓库结构

```
ai-product-factory/
├── backend/          # RuoYi-Vue-Plus Boot 6.x（Admin/Client 双入口）
│   ├── pom.xml       # 后端根总工程
│   ├── ruoyi-admin/  # Admin 总工程，含 ruoyi-admin-server
│   ├── ruoyi-client/ # Client 总工程，含 ruoyi-client-server
│   ├── ruoyi-common/ # Common 技术总工程
│   └── ruoyi-modules/# 既有模块物理目录，所有权由 Admin/Client POM 声明
├── web/
│   ├── admin/        # PC 后台 (React + antd, Umi)
│   ├── h5/           # 移动 H5 (React + antd-mobile)
│   ├── app/          # 原生 App (React Native + antd-rn)
│   ├── miniapp/      # 微信小程序 (Taro)
│   └── harmony/      # HarmonyOS (Taro Harmony CPP)
├── infra/            # 本地/生产 Compose、MySQL 8、Redis 7 与双 Gateway
├── docs/             # 设计系统 Token / 组件范式 / 平台适配
├── scripts/          # 一键启动/停止
├── CLAUDE.md         # 项目总览与契约（AI 必读）
├── AGENTS.md         # Agent 入口摘要
└── README.md         # 总体说明
```

---

## 5. 分支策略

- `main`：**稳定可运行**分支，受保护，只接受经过评审的合并。
- 功能开发：`feature/<简短描述>`，如 `feature/login-page`。
- 缺陷修复：`fix/<简短描述>`，如 `fix/redis-timeout`。
- 文档/脚手架：`chore/<简短描述>`。

提交前请保证：本地能编译/构建通过，且不破坏 `main` 既有的前后端贯通验证。

---

## 6. 提交规范（Conventional Commits）

提交信息采用 [Conventional Commits](https://www.conventionalcommits.org/)：

```
<type>(<scope>): <subject>

<body 可选>
```

常用 `type`：

| type | 含义 |
| --- | --- |
| `feat` | 新功能 |
| `fix` | 缺陷修复 |
| `docs` | 文档（含 CLAUDE/AGENTS/README） |
| `refactor` | 重构（不改行为） |
| `chore` | 构建/脚手架/依赖 |
| `test` | 测试 |
| `style` | 格式（不影响逻辑） |

示例：

```
feat(web/h5): 新增登录页并接入 /auth/login 加密契约
fix(backend): 修正 getInfo 缺失 clientid 头导致 401
docs: 补充 CONTRIBUTING 协作规范
```

---

## 7. 编码约定

- **后端**：遵循 RuoYi 的 Entity / BO / VO / Mapper / Service / Controller 分层，统一返回 `R<T>`，新增接口默认需 Sa-Token 鉴权；登录等敏感接口使用 `@ApiEncrypt`。新增模块必须归属 Admin 或 Client 总工程，Common 只承载中立技术能力。
- **前端**：五个工程分别维护自己的 `src/api/request.ts`，不得跨工程引用源码或建立共享运行包；但每一份实现都必须遵守同一个 `R<T>`、`Authorization + clientid`、AES+RSA 与 401 契约。
- **设计系统**：颜色/间距/字体/圆角等一律引用 `docs/` Token，不得硬编码。
- **密钥与配置**：`.env` 含 RuoYi 默认开发密钥，仅用于本地开发；正式环境须替换为独立密钥并通过 CI/密钥管理注入，**不要**把真实生产密钥提交入库。

---

## 8. PR 流程

1. 从 `main` 切出分支 → 开发 → 本地验证（构建 + 可选前后端贯通）。
2. 推送分支并发起 PR 到 `main`，PR 描述说明：改动目的、受影响端点/页面、验证方式。
3. 评审通过且 CI 绿灯后合并；合并后 `main` 须保持可运行。

---

## 9. 常见问题

- **后端起不来 / 连不上库**：确认 `docker compose up -d` 已执行且 MySQL 健康（`mysqladmin ping`），端口应为标准 `3306/6379`。
- **前端登录 401「客户端ID与Token不匹配」**：受保护接口必须带 `clientid` 请求头，确认请求层未被改掉。
- **前端连错服务**：Admin 连接 `8080`；四个客户端连接 `8082`。
- **后端随机端口**：6.x 会随机分配端口，启动时显式锁定 Admin `8080`、Client `8082`。
- **环境代理导致 `git push` 失败**：本仓库历史验证过用「去代理 + 强制 IPv4 直连」推送；如遇网络问题按该方式重试。

更多排障与接口契约细节见 [`CLAUDE.md`](./CLAUDE.md)。
