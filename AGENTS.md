# AGENTS.md

Agent-facing summary for `ai-product-factory`. **For full detail, read
[CLAUDE.md](./CLAUDE.md)** — this file is the quick orientation.

## What this repo is
A multi-end engineering scaffold: one Spring Boot backend (RuoYi-Vue-Plus 6.x,
JDK 21, port 8080) plus four frontends — PC admin (Umi+antd), H5
(Vite+antd-mobile), native App (React Native), and mini-program/HarmonyOS (Taro)
— all on React + Ant Design, with a shared design system in `docs/`.

## Critical rules (always follow)
1. **UI follows the design system** — read `docs/AI-设计系统上下文.md` before
   generating any UI/style. Tokens are the single source of truth.
2. **Frontend follows the real backend contract** — integrate only against
   `CLAUDE.md` §4. Read backend controllers; never invent paths/fields.

## Where things live
- Backend boot module: `backend/ruoyi-admin/` · business code: `backend/ruoyi-modules/`
- Frontend request layer (all ends): `web/<end>/src/api/request.ts`
- API contracts/types: `web/<end>/src/api/*.ts`
- Infra: `infra/docker-compose.yml` (MySQL 3306 / Redis 6379)
- Design system: `docs/` (tokens, platform adapters, component specs)
- One-click dev: `scripts/start-dev.sh`, `scripts/stop-dev.sh`

## Backend contract at a glance
- `R<T> = { code, msg, data }`; `code 200` = ok, `401` = auth, `500` = error.
- Auth: `Authorization: Bearer <token>` **+ `clientid` header** on every request.
- Login `POST /auth/login` body is AES+RSA encrypted; key in `encrypt-key` header.
- Core: `GET /auth/code` (none), `POST /auth/login`, `GET /system/user/getInfo`
  (auth+clientid). Default creds `admin / admin123`.

## Common tasks
- **Run the stack**: `bash scripts/start-dev.sh` (Docker + backend).
- **Add a backend feature**: new module under `backend/ruoyi-modules/` or use the
  built-in code generator (System Tools → Code Gen).
- **Add a frontend endpoint**: wrap it in `web/<end>/src/api/<module>.ts`,
  returning `R<X>`; pages consume `data` only.
- **Build UI**: start from design tokens; apply platform rules from
  `docs/平台适配/<end>.md`.

## Gotchas (see CLAUDE.md §7)
Pin `--server.port=8080`; datasource `useSSL=false`; login needs a `User-Agent`
header; protected calls need the `clientid` header; RSA keys must match between
frontend `.env`/`env.ts` and backend `application.yml`.
