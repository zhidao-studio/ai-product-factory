# 后端架构

后端采用“Admin/Client 双入口 + 共享业务域”的模块化架构。

```text
ruoyi-admin  -> admin interface -> admin application  ┐
                                                       ├-> shared business domain -> persistence
ruoyi-client -> client interface -> client application ┘
```

## 核心规则

1. `ruoyi-admin` 只服务 PC 管理后台；`ruoyi-client` 统一服务 H5、App、微信小程序和 HarmonyOS。
2. Admin 管理员与 Client 产品用户的表、Token、权限和 clientid 完全隔离。
3. Admin 是业务管理视角，不是 Client 的上游运行依赖。
4. Admin/Client 修改订单、内容等业务状态时必须调用同一个领域模块。
5. 不建立按前端技术栈命名的 `ruoyi-channel-*`；平台差异进入认证和集成适配器。
6. `ruoyi-common` 只保存可复用技术机制，身份策略位于 `ruoyi-security`。

## 依赖方向

```text
interfaces -> applications -> domains
security --------------------> domains
infrastructure --------------> domains
integrations ----------------> domains
boot -> interfaces + security + infrastructure + integrations
```

领域层不得依赖接口层、数据库实现、微信/SMS SDK或任何前端工程。

## 数据边界

- Admin 身份：`sys_user`、`sys_role`、`sys_menu`、`sys_dept`、审计记录。
- Client 身份：`client_user`、`client_identity`、`client_application`。
- 产品业务：复制脚手架后新增的订单、内容、商品等统一业务表。

开发环境可以共用 MySQL/Redis 实例，但使用不同表边界、Flyway 历史表、Redis database/key prefix。生产环境可按隔离级别拆分物理资源，不能复制业务事实。

## 新增产品业务

1. 在 `ruoyi-domains` 下按真实业务边界新增领域模块。
2. 在 `ruoyi-client-application` 编排用户用例。
3. 在 `ruoyi-admin-application` 编排运营和管理用例。
4. 分别通过 `ruoyi-client-api` 与 `ruoyi-admin-api` 暴露不同 DTO。
5. 数据库适配放入 `ruoyi-infrastructure`，外部平台适配放入 `ruoyi-integrations`。
