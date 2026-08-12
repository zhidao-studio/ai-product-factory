#!/usr/bin/env bash
#
# 停止开发环境：终止后端进程 + 停止 Docker 中间件（保留数据卷）
#
# 用法: bash scripts/stop-dev.sh
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

PIDFILE="$ROOT/backend/ruoyi-admin.pid"
if [ -f "$PIDFILE" ]; then
  PID=$(cat "$PIDFILE")
  if kill "$PID" 2>/dev/null; then
    echo "已停止后端进程 $PID"
  else
    echo "后端进程 $PID 已不存在（可能已退出）"
  fi
  rm -f "$PIDFILE"
else
  echo "未发现后端 PID 文件，尝试按 jar 名结束进程..."
  pkill -f "ruoyi-admin.jar" 2>/dev/null && echo "已 pkill ruoyi-admin.jar" || echo "无运行中的 ruoyi-admin.jar"
fi

echo "停止基础设施（保留数据卷）..."
docker compose -f infra/docker-compose.yml down

echo "完成。"
