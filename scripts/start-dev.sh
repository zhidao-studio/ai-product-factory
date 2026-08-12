#!/usr/bin/env bash
#
# 一键启动开发环境：Docker 中间件 (MySQL/Redis) + 后端 (Spring Boot, JDK21)
# 后端以后台进程运行，日志见 backend/ruoyi-admin.log，PID 见 backend/ruoyi-admin.pid
#
# 用法: bash scripts/start-dev.sh
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "==> [1/3] 启动基础设施 (Docker: MySQL:3306 / Redis:6379)"
docker compose -f infra/docker-compose.yml up -d

echo "    等待 MySQL 就绪..."
until docker exec ruoyi-mysql mysqladmin ping -h localhost -uroot -proot >/dev/null 2>&1; do
  printf "."
  sleep 2
done
echo " MySQL OK"

echo "==> [2/3] 构建并后台启动后端 (端口 8080)"
cd "$ROOT/backend"
if [ ! -f ruoyi-admin/target/ruoyi-admin.jar ]; then
  echo "    未发现 jar，开始构建 (./mvnw package -DskipTests) ..."
  ./mvnw -pl ruoyi-admin -am package -DskipTests
fi

LOG="$ROOT/backend/ruoyi-admin.log"
PIDFILE="$ROOT/backend/ruoyi-admin.pid"
nohup java -jar ruoyi-admin/target/ruoyi-admin.jar --server.port=8080 --captcha.enable=false >"$LOG" 2>&1 &
echo $! >"$PIDFILE"
echo "    后端进程 PID $(cat "$PIDFILE")，日志: $LOG"

echo "==> [3/3] 等待后端就绪 (GET /auth/code) ..."
READY=0
for i in $(seq 1 40); do
  CODE=$(curl -s -m 3 -o /dev/null -w "%{http_code}" http://localhost:8080/auth/code 2>/dev/null || true)
  if [ "$CODE" = "200" ]; then
    READY=1
    echo
    echo "    后端已就绪 ✅  http://localhost:8080"
    break
  fi
  printf "    等待 %ds (HTTP %s)\r" "$((i * 3))" "$CODE"
  sleep 3
done

if [ "$READY" -ne 1 ]; then
  echo
  echo "    ⚠️  后端未在预期时间内就绪，查看日志: tail -n 50 $LOG"
  exit 1
fi

echo
echo "==> 完成。前端任选一端启动:"
echo "    cd web/admin   && pnpm install && pnpm dev       # 8000"
echo "    cd web/h5      && pnpm install && pnpm dev       # 8081"
echo "    cd web/miniapp && pnpm install && pnpm dev:weapp # 微信小程序"
echo "    cd web/app     && (需 Xcode / Android Studio)    # RN App"
echo "    登录账号: admin / admin123"
