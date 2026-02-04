#!/usr/bin/env sh
set -eu

DEVICE_URL="${1:-http://172.21.0.215}"
PROXY_HOST="${2:-ambiback.local}"
UI_HOST="${3:-ambiback-ui.local}"

DEVICE_URL="${DEVICE_URL%/}"
DEVICE_HOST="${DEVICE_URL#*://}"
DEVICE_HOST="${DEVICE_HOST%%/*}"
DEVICE_ADDR="$DEVICE_HOST"

if echo "$DEVICE_HOST" | grep -q ":"; then
  DEVICE_ADDR="$DEVICE_HOST"
else
  DEVICE_ADDR="${DEVICE_HOST}:80"
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CERT_DIR="$SCRIPT_DIR/certs"
CONF_FILE="$SCRIPT_DIR/nginx.conf"
PID_FILE="$SCRIPT_DIR/nginx.pid"
UI_DIR="$SCRIPT_DIR/../dist"
UI_MODE="build"

mkdir -p "$CERT_DIR"

if [ ! -d "$UI_DIR" ]; then
  if command -v node >/dev/null 2>&1; then
    NODE_MAJOR="$(node -v | sed 's/^v//' | cut -d. -f1)"
    if [ "$NODE_MAJOR" -ge 18 ]; then
      echo "UI build not found. Building..."
      (cd "$SCRIPT_DIR/.." && npm install && npm run build)
    else
      UI_MODE="proxy"
      echo "Node $NODE_MAJOR too old for Vite build. Using GitHub Pages proxy."
    fi
  else
    UI_MODE="proxy"
    echo "Node not found. Using GitHub Pages proxy."
  fi
fi

if [ ! -f "$CERT_DIR/${PROXY_HOST}.crt" ] || [ ! -f "$CERT_DIR/${PROXY_HOST}.key" ]; then
  echo "Generating self-signed certificate..."
  openssl req -x509 -nodes -newkey rsa:2048 \
    -keyout "$CERT_DIR/${PROXY_HOST}.key" \
    -out "$CERT_DIR/${PROXY_HOST}.crt" \
    -days 3650 \
    -subj "/CN=${PROXY_HOST}"
fi

if [ ! -f "$CERT_DIR/${UI_HOST}.crt" ] || [ ! -f "$CERT_DIR/${UI_HOST}.key" ]; then
  echo "Generating UI self-signed certificate..."
  openssl req -x509 -nodes -newkey rsa:2048 \
    -keyout "$CERT_DIR/${UI_HOST}.key" \
    -out "$CERT_DIR/${UI_HOST}.crt" \
    -days 3650 \
    -subj "/CN=${UI_HOST}"
fi

if [ "$UI_MODE" = "proxy" ]; then
  UI_HTTP_BLOCK="location ^~ /ambiback-ui/ { proxy_ssl_server_name on; proxy_set_header Host alorbach.github.io; proxy_pass https://alorbach.github.io/ambiback-ui/; } location /assets/ { proxy_ssl_server_name on; proxy_set_header Host alorbach.github.io; proxy_pass https://alorbach.github.io/ambiback-ui/assets/; } location = /registerSW.js { proxy_ssl_server_name on; proxy_set_header Host alorbach.github.io; proxy_pass https://alorbach.github.io/ambiback-ui/registerSW.js; } location = /manifest.webmanifest { proxy_ssl_server_name on; proxy_set_header Host alorbach.github.io; proxy_pass https://alorbach.github.io/ambiback-ui/manifest.webmanifest; } location = /favicon.ico { proxy_ssl_server_name on; proxy_set_header Host alorbach.github.io; proxy_pass https://alorbach.github.io/ambiback-ui/favicon.ico; } location / { proxy_ssl_server_name on; proxy_set_header Host alorbach.github.io; proxy_pass https://alorbach.github.io/ambiback-ui/; }"
  UI_HTTPS_BLOCK="location ^~ /ambiback-ui/ { proxy_ssl_server_name on; proxy_set_header Host alorbach.github.io; proxy_pass https://alorbach.github.io/ambiback-ui/; } location /assets/ { proxy_ssl_server_name on; proxy_set_header Host alorbach.github.io; proxy_pass https://alorbach.github.io/ambiback-ui/assets/; } location = /registerSW.js { proxy_ssl_server_name on; proxy_set_header Host alorbach.github.io; proxy_pass https://alorbach.github.io/ambiback-ui/registerSW.js; } location = /manifest.webmanifest { proxy_ssl_server_name on; proxy_set_header Host alorbach.github.io; proxy_pass https://alorbach.github.io/ambiback-ui/manifest.webmanifest; } location = /favicon.ico { proxy_ssl_server_name on; proxy_set_header Host alorbach.github.io; proxy_pass https://alorbach.github.io/ambiback-ui/favicon.ico; } location / { proxy_ssl_server_name on; proxy_set_header Host alorbach.github.io; proxy_pass https://alorbach.github.io/ambiback-ui/; }"
else
  UI_HTTP_BLOCK="root ${UI_DIR}; index index.html; location / { try_files \$uri /index.html; }"
  UI_HTTPS_BLOCK="root ${UI_DIR}; index index.html; location / { try_files \$uri /index.html; }"
fi

cat > "$CONF_FILE" <<EOF
worker_processes  1;
error_log  $SCRIPT_DIR/nginx-error.log;
pid        $PID_FILE;

events { worker_connections  1024; }

http {
  access_log  $SCRIPT_DIR/nginx-access.log;
  types {
    text/html html;
    text/css css;
    application/javascript js;
    application/javascript mjs;
    application/json json;
    application/manifest+json webmanifest;
    image/svg+xml svg;
    image/png png;
    image/x-icon ico;
    text/plain txt;
  }
  default_type text/html;
  server {
    listen 80;
    server_name ${UI_HOST};
    ${UI_HTTP_BLOCK}
  }

  server {
    listen 443 ssl;
    server_name ${UI_HOST};

    ssl_certificate     $CERT_DIR/${UI_HOST}.crt;
    ssl_certificate_key $CERT_DIR/${UI_HOST}.key;

    ${UI_HTTPS_BLOCK}
  }

  server {
    listen 443 ssl;
    server_name ${PROXY_HOST};

    ssl_certificate     $CERT_DIR/${PROXY_HOST}.crt;
    ssl_certificate_key $CERT_DIR/${PROXY_HOST}.key;

    location / {
      proxy_pass http://$DEVICE_ADDR;
      proxy_set_header Host \$host;
      proxy_set_header X-Real-IP \$remote_addr;
      proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
  }
}
EOF

echo "Starting Nginx reverse proxy..."
echo "Device URL: $DEVICE_URL"
echo "Proxy URL: https://${PROXY_HOST}"
echo "UI URL (HTTP):  http://${UI_HOST}"
echo "UI URL (HTTPS): https://${UI_HOST}"
echo ""
echo "Use ./stop-proxy.sh to stop."

sudo nginx -c "$CONF_FILE" -p "$SCRIPT_DIR"
