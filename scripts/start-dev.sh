#!/usr/bin/env bash
# 一键启动 MySQL/Redis、Admin 后台服务和 Client 用户业务服务。
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "==> [1/4] 启动 MySQL 与 Redis"
docker compose -f "$PROJECT_ROOT/infra/docker-compose.yml" up -d

echo "    等待 MySQL 就绪..."
until docker exec ruoyi-mysql mysqladmin ping -h localhost -uroot -proot >/dev/null 2>&1; do
  printf "."
  sleep 2
done
echo " MySQL OK"

echo "==> [2/4] 构建 Admin / Client 双入口"
cd "$PROJECT_ROOT/backend"
./mvnw -B -pl ruoyi-admin,ruoyi-client -am package -DskipTests

start_service() {
  local service_name="$1"
  local jar_path="$2"
  local port="$3"
  local extra_args="$4"
  local log_file="$PROJECT_ROOT/backend/${service_name}.log"
  local pid_file="$PROJECT_ROOT/backend/${service_name}.pid"

  if [ -f "$pid_file" ] && kill -0 "$(cat "$pid_file")" 2>/dev/null; then
    echo "    ${service_name} 已在运行，PID $(cat "$pid_file")"
    return
  fi
  nohup java -jar "$jar_path" --server.port="$port" $extra_args >"$log_file" 2>&1 &
  echo $! >"$pid_file"
  echo "    ${service_name} PID $(cat "$pid_file")，日志: $log_file"
}

echo "==> [3/4] 启动双入口"
start_service "ruoyi-admin" "ruoyi-admin/target/ruoyi-admin.jar" "8080" "--captcha.enable=false"
start_service "ruoyi-client" "ruoyi-client/target/ruoyi-client.jar" "8082" ""

wait_service() {
  local name="$1"
  local url="$2"
  local log_file="$3"
  for attempt in $(seq 1 40); do
    local code
    code=$(curl -s -m 3 -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || true)
    if [ "$code" = "200" ]; then
      echo "    ${name} 已就绪：${url}"
      return
    fi
    printf "    等待 %s（HTTP %s）\r" "$name" "$code"
    sleep 3
  done
  echo
  echo "    ${name} 未在预期时间内就绪，请查看 $log_file"
  exit 1
}

echo "==> [4/4] 等待服务就绪"
wait_service "Admin" "http://localhost:8080/auth/code" "$PROJECT_ROOT/backend/ruoyi-admin.log"
wait_service "Client" "http://localhost:8082/client-auth/code" "$PROJECT_ROOT/backend/ruoyi-client.log"

echo
echo "启动完成："
echo "  Admin API  http://localhost:8080  管理员 admin / admin123"
echo "  Client API http://localhost:8082  产品用户 client / admin123（手机号 13800138000）"
echo "  五个前端仍按各自工程独立启动。"
