#!/usr/bin/env bash
#
# 停止 Admin/Client 后端与 Docker 中间件（保留数据卷）。
#
# 用法：bash scripts/stop-dev.sh
#
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
cd "$PROJECT_ROOT"

stop_backend() {
  local service_name="$1"
  local pid_file="$BACKEND_DIR/$service_name.pid"

  if [ -f "$pid_file" ]; then
    local service_pid
    service_pid="$(<"$pid_file")"
    if kill "$service_pid" 2>/dev/null; then
      echo "已停止 $service_name（PID $service_pid）"
    else
      echo "$service_name 的 PID 已失效（$service_pid）"
    fi
    rm -f "$pid_file"
    return
  fi

  if pkill -f "$service_name.jar" 2>/dev/null; then
    echo "已按进程名停止 $service_name"
  else
    echo "$service_name 未运行"
  fi
}

stop_backend "ruoyi-admin"
stop_backend "ruoyi-client"

echo "停止基础设施（保留数据卷）..."
docker compose -f infra/docker-compose.yml down

echo "完成。"
