# AmbiBack UI - Agent Guide

## Overview

`ambiback-ui` is the modern web UI for AmbiBack devices. It is a Vite + React app
that talks to the device REST endpoints (e.g. `/getstatusasjson`, `/setparam`).

Key concepts:
- **Capabilities gating**: UI features are shown only if the device exposes
  corresponding fields in `/getparamatersasjson`.
- **Advanced Mode**: Debug/WPS and other sensitive options are hidden unless
  Advanced Mode is enabled in the session.

## Project Structure

```
ambiback-ui/
├── src/
│   ├── api/            # API client helpers
│   ├── components/     # Reusable UI components
│   ├── contexts/       # Capabilities + UI settings contexts
│   ├── hooks/          # Device state, params, capabilities
│   ├── pages/          # Route pages (System, Color, Setup, Camera, etc.)
│   └── utils/          # Param parsing helpers
├── dev/                # Local proxy scripts and nginx config
├── dist/               # Build output (created by `npm run build`)
└── vite.config.js
```

## Local Testing (Proxy)

The local proxy serves the UI and proxies device API requests.

### Build UI

```
cd ambiback-ui
npm install
npm run build
```

This creates `dist/` which the proxy uses.

### Start Proxy (WSL)

```
cd "/mnt/d/!cvsroot/_Misc/AmbiBack.Controller/ambiback-ui/dev"
sudo nginx -s stop -c nginx.conf -p . || true
sudo bash start-proxy.sh
```

Then open:
- `http://ambiback-ui.local/`

### Start Proxy (PowerShell)

```
cd D:\!cvsroot\_Misc\AmbiBack.Controller\ambiback-ui\dev
./start-proxy.ps1
```

## Notes for Agents

- Always use `npm run build` before proxy testing if UI changes were made.
- Capabilities are derived from `/getparamatersasjson` fields. If a UI control
  is added, ensure the corresponding param exists or gate it accordingly.
- Advanced Mode should hide risky actions (e.g., WPS, debug toggles) by default.
- The local proxy defaults to GitHub Pages if no `dist/` exists or Node is too old.

