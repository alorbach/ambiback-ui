#!/usr/bin/env sh
set -eu

PROXY_HOST="${1:-https://ambiback.local}"
UI_HOST="${2:-http://ambiback-ui.local}"
URL="${UI_HOST}/#/system?device=${PROXY_HOST}"
echo "Opening: $URL"

if command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$URL"
elif command -v open >/dev/null 2>&1; then
  open "$URL"
else
  echo "Open this URL in your browser:"
  echo "$URL"
fi
