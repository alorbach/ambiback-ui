# AmbiBack UI - Local HTTPS Proxy (Nginx)

This folder provides simple scripts to run a local HTTPS reverse proxy so the
GitHub Pages UI can talk to an HTTP-only ESP32 device without mixed-content
blocking.

## Prerequisites

- Install Nginx (Ubuntu/WSL):
  ```
  sudo apt update
  sudo apt install -y nginx openssl
  ```
- Add hosts entries so `ambiback.local` and `ambiback-ui.local` resolve to your proxy machine:
  - Windows: `C:\Windows\System32\drivers\etc\hosts`
  - Linux/WSL: `/etc/hosts`
  - Example line:
    ```
    192.168.0.50 ambiback.local ambiback-ui.local
    ```

## Start the proxy (Windows PowerShell)

```
.\start-proxy.ps1 -DeviceUrl "http://172.21.0.215"
```

## Start the proxy (Linux/WSL)

```
./start-proxy.sh "http://172.21.0.215"
```

This will create self-signed certificates in `dev/certs/` if missing and
start Nginx on:
- `https://ambiback.local` (device proxy)
- `http://ambiback-ui.local` and `https://ambiback-ui.local` (UI mirror)

## Stop the proxy (Linux/WSL)

```
./stop-proxy.sh
```

## Open the UI

```
http://ambiback-ui.local/#/system?device=https://ambiback.local

## Node too old?

If your Node version is too old for Vite (e.g., Node 12), the script will
automatically proxy the GitHub Pages build instead of running `npm run build`.
```

If you use a different host name, update the URL accordingly.
