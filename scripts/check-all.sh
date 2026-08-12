#!/usr/bin/env bash
# 本地执行与 CI 一致的全工程门禁。五个前端始终在各自目录中独立执行。
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

(cd "$PROJECT_ROOT/backend" && ./mvnw -B -pl ruoyi-admin,ruoyi-client -am -DskipTests compile)
(cd "$PROJECT_ROOT/web/admin" && pnpm lint && pnpm build:prod)
(cd "$PROJECT_ROOT/web/h5" && pnpm lint && pnpm build)
(cd "$PROJECT_ROOT/web/app" && npm run type-check && npm run lint)
(cd "$PROJECT_ROOT/web/miniapp" && pnpm type-check && pnpm build:weapp)
(cd "$PROJECT_ROOT/web/harmony" && pnpm type-check && pnpm build:harmony)

echo "All backend and independent frontend checks passed."
