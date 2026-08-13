#!/usr/bin/env bash
#
# 一键启动开发环境：Docker 中间件 + Admin/Client 两个 Spring Boot 入口。
# Admin 仅服务 PC 管理后台（8080），Client 服务 H5/App/微信小程序/鸿蒙（8082）。
#
# 用法：bash scripts/start-dev.sh
#
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
cd "$PROJECT_ROOT"

echo "==> [1/4] 启动基础设施（MySQL:3306 / Redis:6379）"
docker compose -f infra/docker-compose.yml up -d

echo "    等待 MySQL 就绪..."
until docker exec ruoyi-mysql mysqladmin ping -h localhost -uroot -proot >/dev/null 2>&1; do
  printf "."
  sleep 2
done
echo " MySQL OK"

echo "==> [2/4] 构建 Admin 与 Client 后端"
cd "$BACKEND_DIR"
./mvnw -pl :ruoyi-admin-server,:ruoyi-client-server -am package -DskipTests

start_backend() {
  local service_name="$1"
  local jar_path="$2"
  local port="$3"
  local pid_file="$BACKEND_DIR/$service_name.pid"
  local log_file="$BACKEND_DIR/$service_name.log"

  if [ -f "$pid_file" ]; then
    local existing_pid
    existing_pid="$(<"$pid_file")"
    if kill -0 "$existing_pid" 2>/dev/null; then
      echo "    重启 $service_name（旧 PID $existing_pid）"
      kill "$existing_pid"
      for _ in $(seq 1 20); do
        if ! kill -0 "$existing_pid" 2>/dev/null; then
          break
        fi
        sleep 1
      done
    fi
    rm -f "$pid_file"
  fi

  nohup java -jar "$jar_path" \
    --server.port="$port" \
    --captcha.enable=false \
    >"$log_file" 2>&1 &
  local service_pid=$!
  printf "%s\n" "$service_pid" >"$pid_file"
  echo "    $service_name 已启动（PID $service_pid，日志 $log_file）"
}

start_backend "ruoyi-admin" "$BACKEND_DIR/ruoyi-admin/ruoyi-admin-server/target/ruoyi-admin.jar" 8080
start_backend "ruoyi-client" "$BACKEND_DIR/ruoyi-client/ruoyi-client-server/target/ruoyi-client.jar" 8082

echo "==> [3/4] 等待两个后端就绪"
wait_backend() {
  local service_name="$1"
  local port="$2"
  local log_file="$BACKEND_DIR/$service_name.log"

  for attempt in $(seq 1 40); do
    local status_code
    status_code="$(curl -s -m 3 -o /dev/null -w "%{http_code}" "http://localhost:$port/auth/code" 2>/dev/null || true)"
    if [ "$status_code" = "200" ]; then
      echo "    $service_name 已就绪：http://localhost:$port"
      return
    fi
    printf "    等待 %s（%ds，HTTP %s）\r" "$service_name" "$((attempt * 3))" "$status_code"
    sleep 3
  done

  echo
  echo "    $service_name 未在预期时间内就绪，请查看：tail -n 50 $log_file"
  return 1
}

wait_backend "ruoyi-admin" 8080
wait_backend "ruoyi-client" 8082

echo "==> [4/4] 开发环境已就绪"
echo "    Admin 后端：http://localhost:8080（admin / admin123）"
echo "    Client 后端：http://localhost:8082（client / admin123）"
echo
echo "前端按需独立启动："
echo "    cd web/admin   && pnpm install && pnpm dev"
echo "    cd web/h5      && pnpm install && pnpm dev"
echo "    cd web/app     && npm install && npm start"
echo "    cd web/miniapp && pnpm install && pnpm dev:weapp"
echo "    cd web/harmony && pnpm install && pnpm dev:harmony"
