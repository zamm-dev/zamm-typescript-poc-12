#!/usr/bin/env bash
set -euo pipefail
printf '%s' "$PWD" > "$PWD/.feat-script-cwd"
printf '%s' "$1" > "$PWD/.feat-script-arg"
