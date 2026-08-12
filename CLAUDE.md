# CLAUDE.md

Guide for AI coding agents working in this repository. This file is the single
source of truth for the project's structure, how to run it, and the conventions
to follow when making changes. Keep it accurate as the project evolves.

## 1. Project overview

`ai-product-factory` is a **multi-end engineering scaffold** for medium-to-large
projects: one Spring Boot backend plus four frontends (PC admin, mobile H5,
native App, WeChat/HarmonyOS mini-program), all on the React + Ant Design stack,
with a shared design system wired into every end.

Goal: a developer can clone the repo and run the full stack (infra + backend +
any frontend) by following this guide, with frontend-to-backend data flow
already verified end-to-end.

Two non-negotiable rules (apply to every change):

1. **UI follows the design system.** Before generating any interface or style,
   read `docs/AI-设计系统上下文.md`. The design tokens are the single source of
   truth; never hard-code colors/spacing/radii.
2. **Frontend follows the real backend contract.** All API integration must match
   the contract in section 4. Do not invent paths or fields. When in doubt, read
   the backend controller source.

## 2. Tech stack

| Layer | Technology |
|-------|------------|
| Backend | RuoYi-Vue-Plus (Boot) 6.x · Spring Boot 4.1 · JDK 21 · Sa-Token · MyBatis-Plus · Jetty |
| PC admin | UmiJS 4 + Ant Design · port 8000 |
| H5 | Vite + React 19 + antd-mobile · port 8081 |
| App | React Native CLI + @ant-design/react-native · iOS/Android |
| Mini-program | Taro 4 (React DSL) · WeChat / HarmonyOS |
| Infra | Docker: MySQL 8, Redis 7 |
| Design | Design Tokens (DTCG) in `docs/` |

## 3. Repository structure

```
ai-product-factory/
├── backend/                 # RuoYi-Vue-Plus (Maven multi-module)
│   ├── ruoyi-admin/         # Boot module (Auth/Captcha controllers), port 8080
│   ├── ruoyi-modules/       # Business modules (system, etc.) — add features here
│   ├── ruoyi-common/        # Shared: R wrapper, encryption, Sa-Token utils
│   ├── ruoyi-extend/        # Extensions (monitor / snailjob / snail-ai)
│   └── script/sql/          # Init SQL (ry-vue / ry-job / ry-workflow)
├── web/                     # Four frontends (each its own package)
│   ├── admin/               # PC admin (plus-ui-react 6.x)
│   ├── h5/                  # Mobile H5 (Vite + antd-mobile)
│   ├── app/                 # Native App (RN CLI)
│   └── miniapp/             # Mini-program / HarmonyOS (Taro)
├── infra/                   # Docker infrastructure
│   ├── docker-compose.yml   # MySQL:3306 / Redis:6379 (standard ports)
│   └── init/01-init.sql      # Create db ry-vue + import tables
├── docs/                    # Design system (tokens / platform / components)
├── scripts/                 # start-dev.sh / stop-dev.sh (one-click dev)
├── README.md                # Overview & run steps
├── AGENTS.md                # Agent-facing summary (see this file for detail)
└── CLAUDE.md                # This file
```

## 4. Backend API contract (frontend integration standard)

The frontend must integrate against this contract only.

### 4.1 Base path & port
- Backend listens on `:8080` with `context-path: /`. **Always pin the port:**
  `java -jar ruoyi-admin.jar --server.port=8080` (RuoYi 6.x otherwise assigns a
  random port).
- Frontends use the dev proxy prefix `/dev-api` → `http://localhost:8080`
  (prefix stripped). Set `baseURL` to `/dev-api`; never hard-code `localhost:8080`
  in app code. (RN has no proxy: point `baseApi` at a reachable address, e.g.
  `http://10.0.2.2:8080/dev-api` on the Android emulator.)

### 4.2 Unified response `R<T>`
```jsonc
{ "code": 200, "msg": "操作成功", "data": { } }
```
- `code === 200` success; `401` unauthenticated/expired; `403` forbidden;
  `500` server error; `601` warning.
- The request layer unwraps uniformly: on success resolve `data`; otherwise
  reject and surface `msg`.

### 4.3 Authentication (Sa-Token)
- After login, send `Authorization: Bearer <access_token>` on every request.
- **Also send the `clientid` header** (must match the `sys_client` table). Sa-Token
  rejects with `401 客户端ID与Token不匹配` if the header clientid and the token's
  clientid differ. Known client IDs:
  - Web/PC admin & H5: `e5cd7e4891bf95d1d19206ce24a7b32e`
  - Native App: `428a8310cd442757ae699df5d894f051`
  - The frontend pins its clientid in `src/utils/env.ts` (`VITE_APP_CLIENT_ID`);
    the app end already uses the app clientid so phone-based grants work.
- Missing/expired token on a protected endpoint → `401` → frontend clears token
  and prompts re-login.

### 4.4 Core endpoints (already integrated)
| Purpose | Method & path | Auth | Notes |
|---------|---------------|------|-------|
| Captcha | `GET /auth/code` | none | Returns `CaptchaVo{ captchaEnabled, uuid, img(base64) }` |
| Login | `POST /auth/login` | none | Body AES+RSA encrypted (4.5); `grantType=password` (web/H5) |
| SMS code | `GET /resource/sms/code` | none | Query `phoneNumber`; requires a configured sms4j `config1` |
| Logout | `POST /auth/logout` | yes | |
| User info | `GET /system/user/getInfo` | yes + clientid | Returns `UserInfoVo{ user, roles, permissions }` |

#### 4.4.1 App login (phone-based) — see 4.6 for detail
`/auth/login` routes by `grantType`. Beyond `password` (account + image captcha),
the app client supports two phone-based grants. The app client's
`grant_type` column is `password,sms,social,phonePassword` (no image captcha).

Other business endpoints follow the same `R<T>` contract; read the corresponding
`*Controller` source before integrating — do not guess paths.

### 4.5 Login/register encryption (`@ApiEncrypt`)
For `/auth/login` and `/auth/register` the backend decrypts via an aspect. The
frontend must:
1. Generate a random 16-byte AES key (`crypto-js`, AES-**ECB**/Pkcs7).
2. Encrypt the request body JSON with that AES key.
3. Encrypt the AES key's Base64 with the **RSA public key**; put it in the
   `encrypt-key` header.
4. If a response carries `encrypt-key`, decrypt the body with RSA(priv)->AES.

RSA keys live in `.env` (`VITE_APP_RSA_PUBLIC_KEY` / `VITE_APP_RSA_PRIVATE_KEY`)
and must match the backend `application.yml` `crypto` keypair. Gated by
`VITE_APP_ENCRYPT=true`. Implemented in `src/utils/{crypto,jsencrypt}.ts`.

### 4.6 App login (phone number)

The app end (`web/app`) logs in by phone. It sends `clientid=428a8310…` (app
client) and one of two `grantType` values to `POST /auth/login` (body still
AES+RSA encrypted per 4.5). Implemented in `web/app/src/api/auth.ts`
(`loginByPhone`, `loginBySms`, `getSmsCode`).

| Grant | `grantType` | Body fields | Backend strategy | Captcha |
|-------|-------------|-------------|------------------|---------|
| Phone + password | `phonePassword` | `username`(=phone), `password` | `PhonePasswordAuthStrategy` (new) | none |
| Phone + SMS code | `sms` | `phoneNumber`, `smsCode` | `SmsAuthStrategy` | SMS code |

- **Phone + password**: `username` carries the phone number; the strategy looks
  up `sys_user.phone_number`, BCrypt-checks the password. No image captcha.
- **Phone + SMS code**: first `GET /resource/sms/code?phoneNumber=…` to send (or
  stub) the code; the SMS code is cached in Redis as `global:captcha_codes:<phone>`
  (JSON string, Jackson serialized). `SmsAuthStrategy` reads it via
  `RedisUtils.getCacheObject` and compares. No image captcha.
- **Note on Redis**: RuoYi caches `sys_client` in Redis; after editing the
  `sys_client` table you must `redis-cli -a ruoyi123 FLUSHALL` (and restart is
  harmless) for client/grant changes to take effect. The SMS code must be stored
  as a JSON string (e.g. `SET global:captcha_codes:13800138000 '"1234"' EX 300`),
  not a bare string, or `getCacheObject` deserializes it to the wrong type.

## 5. Frontend conventions (consistent across all four ends)

- **Request layer**: `src/api/request.ts` (admin uses the official impl; the
  other three mirror it). Responsibilities: inject `Authorization`/`clientid`,
  encrypt when `isEncrypt:'true'`, unwrap `R`, clear token on 401, toast `msg`.
- **Types**: backend `R<T>` ↔ frontend `R<T>`; describe params/results as
  interfaces in `src/api/*.ts`.
- **Token storage**: `localStorage['Admin-Token']` (admin/h5), Taro `Storage`
  (miniapp), RN `src/utils/auth.ts` (localStorage, fallback memory).
- **Adding an endpoint**: wrap it in `src/api/<module>.ts` returning `R<X>`;
  pages consume `data` only, never `code`/`msg`.
- **Environment**: h5 uses Vite `.env`; app/miniapp keep constants in
  `src/utils/env.ts` (`VITE_APP_BASE_API`, `VITE_APP_CLIENT_ID`,
  `VITE_APP_ENCRYPT`, `VITE_APP_RSA_*`).
- **RN note**: `jsencrypt` expects `window`/Web Crypto; polyfill on device.
  Point `baseApi` at a reachable backend.
- **Mini-program note**: the current request layer uses axios, which works on
  h5/rn. For WeChat/Alipay, swap to a `Taro.request` adapter (scaffold reserves
  the spot).

## 6. Development workflow

### 6.1 Infrastructure (Docker)
```bash
docker compose -f infra/docker-compose.yml up -d      # MySQL:3306 / Redis:6379
# down (keep data) / down -v (wipe data)
```
MySQL `root/root`, db `ry-vue` (auto-created + 58 tables on first start).
Redis `requirepass ruoyi123`.

### 6.2 Backend (JDK 21)
```bash
cd backend
./mvnw -pl ruoyi-admin -am package -DskipTests        # first time only
java -jar ruoyi-admin/target/ruoyi-admin.jar --server.port=8080 --captcha.enable=false
```
`--captcha.enable=false` disables the captcha during local dev (keep it on in
prod). Verify with `GET http://localhost:8080/auth/code` → `R<CaptchaVo>`.
`application-dev.yml` already points at `localhost:3306` (useSSL=false) /
`localhost:6379`, so no env-var overrides are needed.

### 6.3 Frontend (pick one)
```bash
cd web/admin   && pnpm install && pnpm dev     # 8000
cd web/h5      && pnpm install && pnpm dev     # 8081
cd web/miniapp && pnpm install && pnpm dev:h5  # 10086
cd web/app     && npm install && npm run ios   # needs Xcode/Android Studio
```
Login with `admin / admin123` (captcha off → leave blank) → `getInfo` returns
`roles` containing `superadmin` ⇒ end-to-end data flow verified.

### 6.4 One-click scripts
```bash
bash scripts/start-dev.sh   # docker up + build jar if missing + start backend + wait ready
bash scripts/stop-dev.sh    # stop backend + docker down (keep volumes)
```

## 7. Troubleshooting (known issues)

- **Random port**: RuoYi 6.x picks a random port unless you pass
  `--server.port=8080`. The frontend proxies assume 8080.
- **`useSSL`**: `useSSL=true` against Docker MySQL fails the SSL handshake; the
  dev datasource is pinned to `useSSL=false`.
- **`User-Agent` header**: the backend parses UA during login; a bare request
  without UA throws NPE. Real browsers/mobile send it; scripts must add it.
- **`clientid` header**: protected endpoints (e.g. `getInfo`) 401 with
  "客户端ID与Token不匹配" if `clientid` is missing. The request layer sends it
  by default — don't remove it.
- **Default credentials**: `admin / admin123` (not `123456`).
- **RSA keypair**: frontend `.env`/`env.ts` and backend `application.yml` must
  stay in sync; changing one requires changing the other.
- **admin deps not installed in this sandbox** (heavy Umi project). Locally run
  `pnpm install` then `pnpm lint` (= tsc) to verify; its request layer is the
  official code and already matches the contract.
- **Mini-program non-h5 platforms**: need a `Taro.request` adapter (see 5).

## 8. References

- Design system: `docs/AI-设计系统上下文.md`, `docs/design-tokens.json`,
  `docs/design-tokens.ts`; full index `docs/README.md`.
- Run steps: `README.md`. Agent summary: `AGENTS.md`.
