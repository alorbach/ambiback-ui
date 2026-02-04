param(
  [string]$DeviceUrl = "http://172.21.0.215",
  [string]$ProxyHost = "ambiback.local",
  [string]$UiHost = "ambiback-ui.local"
)

$device = $DeviceUrl.TrimEnd('/')
$deviceHost = $device -replace '^https?://', ''
if ($deviceHost -notmatch ':') {
  $deviceHost = "$deviceHost:80"
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$certDir = Join-Path $scriptDir "certs"
$confFile = Join-Path $scriptDir "nginx.conf"
$pidFile = Join-Path $scriptDir "nginx.pid"
$uiDir = Join-Path $scriptDir "..\dist"
$uiMode = "build"

New-Item -ItemType Directory -Force -Path $certDir | Out-Null

if (-not (Test-Path $uiDir)) {
  $node = Get-Command node -ErrorAction SilentlyContinue
  if ($node) {
    $nodeVersion = & node -v
    $nodeMajor = $nodeVersion.TrimStart('v').Split('.')[0]
    if ([int]$nodeMajor -ge 18) {
      Write-Host "UI build not found. Building..."
      Push-Location (Join-Path $scriptDir "..")
      npm install
      npm run build
      Pop-Location
    } else {
      $uiMode = "proxy"
      Write-Host "Node $nodeMajor too old for Vite build. Using GitHub Pages proxy."
    }
  } else {
    $uiMode = "proxy"
    Write-Host "Node not found. Using GitHub Pages proxy."
  }
}

if (-not (Test-Path (Join-Path $certDir "$ProxyHost.crt"))) {
  Write-Host "Generating self-signed certificate..."
  openssl req -x509 -nodes -newkey rsa:2048 `
    -keyout (Join-Path $certDir "$ProxyHost.key") `
    -out (Join-Path $certDir "$ProxyHost.crt") `
    -days 3650 `
    -subj "/CN=$ProxyHost"
}

if (-not (Test-Path (Join-Path $certDir "$UiHost.crt"))) {
  Write-Host "Generating UI self-signed certificate..."
  openssl req -x509 -nodes -newkey rsa:2048 `
    -keyout (Join-Path $certDir "$UiHost.key") `
    -out (Join-Path $certDir "$UiHost.crt") `
    -days 3650 `
    -subj "/CN=$UiHost"
}

$uiHttpBlock = "root $uiDir; index index.html; location / { try_files `$uri /index.html; }"
$uiHttpsBlock = $uiHttpBlock
if ($uiMode -eq "proxy") {
  $uiHttpBlock = "location ^~ /ambiback-ui/ { proxy_ssl_server_name on; proxy_set_header Host alorbach.github.io; proxy_pass https://alorbach.github.io/ambiback-ui/; } location /assets/ { proxy_ssl_server_name on; proxy_set_header Host alorbach.github.io; proxy_pass https://alorbach.github.io/ambiback-ui/assets/; } location = /registerSW.js { proxy_ssl_server_name on; proxy_set_header Host alorbach.github.io; proxy_pass https://alorbach.github.io/ambiback-ui/registerSW.js; } location = /manifest.webmanifest { proxy_ssl_server_name on; proxy_set_header Host alorbach.github.io; proxy_pass https://alorbach.github.io/ambiback-ui/manifest.webmanifest; } location = /favicon.ico { proxy_ssl_server_name on; proxy_set_header Host alorbach.github.io; proxy_pass https://alorbach.github.io/ambiback-ui/favicon.ico; } location / { proxy_ssl_server_name on; proxy_set_header Host alorbach.github.io; proxy_pass https://alorbach.github.io/ambiback-ui/; }"
  $uiHttpsBlock = $uiHttpBlock
}

@"
worker_processes  1;
error_log  $scriptDir/nginx-error.log;
pid        $pidFile;

events { worker_connections  1024; }

http {
  access_log  $scriptDir/nginx-access.log;
  server {
    listen 80;
    server_name $UiHost;
    $uiHttpBlock
  }

  server {
    listen 443 ssl;
    server_name $UiHost;

    ssl_certificate     $certDir/$UiHost.crt;
    ssl_certificate_key $certDir/$UiHost.key;

    $uiHttpsBlock
  }

  server {
    listen 443 ssl;
    server_name $ProxyHost;

    ssl_certificate     $certDir/$ProxyHost.crt;
    ssl_certificate_key $certDir/$ProxyHost.key;

    location / {
      proxy_pass http://$deviceHost;
      proxy_set_header Host `$host;
      proxy_set_header X-Real-IP `$remote_addr;
      proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
    }
  }
}
"@ | Set-Content -Path $confFile

Write-Host "Starting Nginx reverse proxy..."
Write-Host "Device URL: $DeviceUrl"
Write-Host "Proxy URL: https://$ProxyHost"
Write-Host "UI URL (HTTP):  http://$UiHost"
Write-Host "UI URL (HTTPS): https://$UiHost"
Write-Host ""
Write-Host "Stop with: nginx -s stop -p `"$scriptDir`""

nginx -c $confFile -p $scriptDir
