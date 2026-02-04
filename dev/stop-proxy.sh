#!/usr/bin/env sh
set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PID_FILE="$SCRIPT_DIR/nginx.pid"
CONF_FILE="$SCRIPT_DIR/nginx.conf"

if [ -f "$PID_FILE" ]; then
  echo "Stopping Nginx..."
  sudo nginx -s stop -c "$CONF_FILE" -p "$SCRIPT_DIR"
else
  echo "No nginx.pid found. Is the proxy running?"
fi
