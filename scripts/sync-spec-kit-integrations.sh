#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
REPO_ROOT=$(cd "$SCRIPT_DIR/.." && pwd)
SPEC_KIT_SOURCE="git+https://github.com/github/spec-kit.git@v0.16.3"

if ! command -v uvx >/dev/null 2>&1; then
  echo "缺少 uvx；请先安装 uv，再同步 Spec Kit 集成。" >&2
  exit 1
fi

cd "$REPO_ROOT"

# Preset 命令只会物化到当前默认集成。依次切换两端，再恢复项目默认的 Codex。
uvx --from "$SPEC_KIT_SOURCE" specify integration use claude
uvx --from "$SPEC_KIT_SOURCE" specify integration use codex

node scripts/verify-spec-kit.mjs
