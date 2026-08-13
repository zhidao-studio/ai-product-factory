# Admin / Client 双网关

两个配置对应两个独立安全入口：

- `admin.nginx.conf` 只连接 `admin-backend:8080`，服务 PC Admin。
- `client.nginx.conf` 只连接 `client-backend:8082`，服务 H5、App、微信小程序和 HarmonyOS。

两个 Gateway 没有共享 upstream，也不能互相转发。Token、`clientid`、应用访问范围、用户权限和数据权限仍由各自后端校验。

## `/prod-api` 规则

浏览器端生产构建统一使用 `/prod-api` 作为前端代理前缀，Gateway 会在转发前去掉此前缀：

```text
Admin:  /prod-api/system/user/getInfo -> /system/user/getInfo
Client: /prod-api/client/user/info    -> /client/user/info
```

请求 `/prod-api` 会以 `308` 跳转到 `/prod-api/`，请求方法不会被降级；响应使用相对 `Location`，不会按 Gateway 容器内的 HTTP 协议生成降级地址。Client 去掉前缀后仍进入同一份显式白名单和限流规则，不会因为使用 `/prod-api` 绕过边界。

App、小程序和 HarmonyOS 也可以在各自独立域名上直接请求以下 Client 根路径：

- `POST /auth/login`
- `GET /auth/code`
- `POST /auth/logout`
- `GET /resource/sms/code`
- `/client/**`

新增面向应用用户的业务接口统一放在 `/client/**`。Admin 管理接口不会通过 Client Gateway。

## TLS 与代理头

这两个 Nginx 配置只监听 HTTP `80`，TLS 边界在外部可信负载均衡器或反向代理，不在本配置中。生产编排默认只绑定宿主机 `127.0.0.1`；不得在没有防火墙或网络 ACL 时改为公网监听。外部入口必须覆盖客户端提交的 `X-Forwarded-For` 与 `X-Forwarded-Proto`；Gateway 会使用可信的首个转发地址进行 Client 限流，并补充 `X-Real-IP`、`X-Forwarded-For` 和 `X-Request-ID`。

`docker-compose.prod.yml` 已把配置和 `proxy_params` 只读挂载到容器，并且只允许 Gateway 与对应后端共享 edge 网络。生产启动和端口边界见 [../README.md](../README.md)。
