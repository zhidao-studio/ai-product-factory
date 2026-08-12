#!/usr/bin/env bash
# 停止 Admin / Client 双入口与本地基础设施，保留数据卷。
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

stop_service() {
  local service_name="$1"
  local pid_file="$PROJECT_ROOT/backend/${service_name}.pid"
  if [ -f "$pid_file" ]; then
    local pid
    pid=$(cat "$pid_file")
    if kill "$pid" 2>/dev/null; then
      echo "已停止 ${service_name}，PID ${pid}"
    else
      echo "${service_name} 进程已不存在"
    fi
    rm -f "$pid_file"
  else
    pkill -f "${service_name}.jar" 2>/dev/null || true
  fi
}

stop_service "ruoyi-admin"
stop_service "ruoyi-client"
docker compose -f "$PROJECT_ROOT/infra/docker-compose.yml" down
echo "已停止开发环境，数据卷保留。"
