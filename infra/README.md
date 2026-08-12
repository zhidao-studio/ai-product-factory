# 基础设施与部署

`infra/docker-compose.yml` 只用于本地开发，会把 MySQL 与 Redis 端口发布到宿主机。生产环境使用 `infra/docker-compose.prod.yml`，其边界固定为：

```text
TLS / 负载均衡
├── Admin 域名  ──> admin-gateway:80  ──> admin-backend:8080
└── Client 域名 ──> client-gateway:80 ──> client-backend:8082

admin-backend  ─┐
                ├──> MySQL / Redis（仅内部网络）
client-backend ─┘
```

- 只有 `admin-gateway` 和 `client-gateway` 发布宿主机端口。
- 两个后端只有容器网络内的 `expose`，没有宿主机 `ports`。
- MySQL、Redis 没有宿主机端口，并分别接入 Admin/Client 内部数据网络。
- Admin 与 Client 共用 `ry-vue` 产品业务库，但使用不同 Redis database/keyPrefix 和不同 JWT 密钥。
- Gateway 只负责入口路由、请求标识和粗粒度限流；身份、应用范围与数据权限仍由后端校验。
- 五个前端仍按独立工程分别构建和部署，不放进这份后端基础设施编排；两个 Gateway 的根路径不会托管静态页面。

## 生产启动

先构建 Dockerfile 所需的两个 JAR：

```bash
cd backend
./mvnw -pl ruoyi-admin,ruoyi-client -am clean package -DskipTests
cd ../infra
```

复制环境变量模板并替换全部 `change_me` 值：

```bash
cp .env.prod.example .env.prod
chmod 600 .env.prod
```

Admin 与 Client 的 JWT 密钥必须不同；两侧各自的一对 RSA 配置必须与对应前端密钥成对。不要把 `.env.prod` 或真实密钥提交到仓库。

Client 短信服务默认关闭，不影响后端启动。只有设置 `CLIENT_SMS_ENABLED=true` 时，才需要同时填写 `CLIENT_SMS_SUPPLIER`、`CLIENT_SMS_ACCESS_KEY_ID`、`CLIENT_SMS_ACCESS_KEY_SECRET`、`CLIENT_SMS_SIGNATURE` 以及供应商要求的 `CLIENT_SMS_SDK_APP_ID`；未启用时短信验证码和短信登录都会明确返回“短信服务未启用”。

检查并启动：

```bash
docker compose --env-file .env.prod -f docker-compose.prod.yml config --quiet
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build
docker compose --env-file .env.prod -f docker-compose.prod.yml ps
```

停止容器但保留数据库和日志卷：

```bash
docker compose --env-file .env.prod -f docker-compose.prod.yml down
```

`down -v` 会删除生产数据卷，不应作为普通停止命令。`infra/init/01-init.sql` 只会在 MySQL 空数据卷首次创建时执行，已有数据库的结构升级需要单独评审和执行 SQL。

## TLS 边界

仓库中的两个 Nginx Gateway 只监听容器内 HTTP `80`，不持有证书。证书续期、TLS 策略和 HSTS 均由外部 TLS 入口负责。默认将宿主机监听地址设为 `127.0.0.1`，推荐由同机的可信负载均衡器或反向代理完成 TLS：

```text
https://admin-api.example.com  -> http://127.0.0.1:8080
https://client-api.example.com -> http://127.0.0.1:8082
```

浏览器前端若与 API 同域，TLS 入口只需把该站点的 `/prod-api/**` 转给对应 Gateway，其余路径继续由各前端静态服务处理。前端静态容器不能直接连接 `admin-backend` 或 `client-backend`，否则会绕过双 Gateway 边界。

两个 Gateway 对精确路径 `/prod-api` 的 `308` 响应使用相对 `Location: /prod-api/`，由浏览器保留外部 HTTPS 协议，不会暴露容器内 HTTP 边界。

若 TLS 入口位于其他主机，应把 `*_GATEWAY_BIND` 改为部署机私网 IP，并用防火墙只允许可信入口访问；不得在没有网络访问控制时改为 `0.0.0.0`。上游必须覆盖客户端传入的 `X-Forwarded-For` 与 `X-Forwarded-Proto`；Gateway 会从可信的 `X-Forwarded-For` 读取首个客户端地址，并重新生成传给后端的单值来源地址，避免未经信任的请求头污染后端 IP 白名单。不要将这两个明文 HTTP 端口直接开放到公网。

接口前缀和白名单见 [gateway/README.md](./gateway/README.md)。
