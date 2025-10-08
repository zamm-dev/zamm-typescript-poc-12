#!/usr/bin/env bash
set -euo pipefail
target="$PWD/override-worktree"
mkdir -p "$target"
printf '%s' "$PWD" > "$PWD/.feat-script-cwd"
printf '%s' "$1" > "$PWD/.feat-script-arg"
echo "ZAMM_INIT_DIR_OVERRIDE=$target"
