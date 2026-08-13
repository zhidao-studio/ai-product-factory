# 后端工程

本目录是基于 RuoYi-Vue-Plus 6.0、Spring Boot 4.1 和 JDK 25 LTS 改造的双后端工程，不是上游单一 Admin 工程的原样镜像。

开发前先阅读根目录 [工程现状](../docs/工程现状.md) 和 [CLAUDE.md](../CLAUDE.md)。本文只说明后端快速入口。

## 工程边界

```text
backend/
├── pom.xml                         # 唯一完整 Reactor 构建入口
├── ruoyi-admin/                    # Admin 总工程
│   ├── ruoyi-admin-api/            # Admin 跨模块 Java 契约
│   ├── ruoyi-system/               # 系统管理
│   ├── ruoyi-gen/                  # Admin 代码生成器
│   ├── ruoyi-job/                  # 任务执行
│   ├── ruoyi-workflow/             # 工作流
│   ├── ruoyi-ai/                   # AI 接入
│   ├── ruoyi-demo/                 # 技术能力示例
│   └── ruoyi-admin-server/         # Admin 运行入口，8080
├── ruoyi-client/                   # Client 总工程
│   ├── ruoyi-client-api/           # Client 会话、认证和私有管理契约
│   ├── ruoyi-client-um/            # 应用用户、接入客户端与第三方身份
│   └── ruoyi-client-server/        # Client 运行入口，8082
├── ruoyi-common/                   # 中立技术能力，无业务 API 工程
├── ruoyi-extend/                   # 独立扩展服务
└── script/sql/                    # 多数据库基线脚本
```

- Admin 只服务 PC 管理端，使用 `sys_*` 身份和表结构。
- Client 服务 H5、App、微信小程序与 HarmonyOS，使用 `app_*` 身份和业务表。
- Admin 运营 Client 数据时，通过 `ruoyi-client-api` 和私有 HTTP 接口调用 Client，不依赖 Client Entity、Mapper 或 Service。
- Common 只承载中立技术能力，不建立 `common-api`，不定义 Admin/Client 业务契约。

## 构建与运行

从 `backend/` 目录执行：

```bash
# 完整后端构建
./mvnw -DskipTests package

# 只构建两个主应用及其依赖
./mvnw -pl :ruoyi-admin-server,:ruoyi-client-server -am package -DskipTests

# 启动 Admin
java -jar ruoyi-admin/ruoyi-admin-server/target/ruoyi-admin.jar \
  --server.port=8080 --captcha.enable=false

# 启动 Client
java -jar ruoyi-client/ruoyi-client-server/target/ruoyi-client.jar \
  --server.port=8082 --captcha.enable=false
```

根目录也可执行 `bash scripts/start-dev.sh`，一次启动 MySQL、Redis 和两个后端。

## 新增后端能力

1. 先确认需求属于 Admin 还是 Client，不根据技术类型随意归类。
2. Admin 模块放入 `ruoyi-admin/`，Client 模块放入 `ruoyi-client/`，并加入各自聚合 POM。
3. 沿用 Entity / BO / VO / Mapper / Service / Controller 以及 MyBatis-Plus 风格，不另造 Repository Port/JdbcTemplate 体系。
4. Admin Entity 按同模块 `BaseEntity` 习惯；Client `app_*` Entity 按 `AppBaseEntity` 与 Client 七要素，不含部门和通用 `version`。
5. `ruoyi-admin/ruoyi-gen` 是 Admin 生成器。Client 可参考其分层，不得原样搬用 Admin 表、权限或 Entity 语义。
6. 没有真实消费者时，不建立 API、微服务或 `package-info` 空壳。

具体编码时先读取 [RuoYi 编码 Skill](./.codex/skills/ruoyi-plus-ai-coding/SKILL.md) 与目标模块最近邻实现。

## 数据与身份

- Admin：`sys_user`、`sys_client`、`sys_social`，拥有角色、菜单、部门和数据权限。
- Client：`app_user`、`app_client`、`app_user_identity`，当前只建立用户身份与接入边界。
- Client 表七要素：`id`、`valid_flag`、`del_flag`、`create_by`、`create_time`、`update_by`、`update_time`。
- 两侧可使用同一 Schema，但不共表；Redis database/keyPrefix 和登录上下文也必须隔离。

## 上游参考

本项目保留 RuoYi-Vue-Plus 的技术底座和模块风格。需要查阅上游文档时访问 [RuoYi-Vue-Plus 官方文档](https://plus-doc.dromara.org)，但上游目录和单应用结构不得覆盖本仓库的 Admin/Client 边界。
