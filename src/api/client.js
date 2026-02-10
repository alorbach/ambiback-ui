const STORAGE_KEY = 'ambiback.deviceBaseUrl'

export function getStoredBaseUrl() {
  return localStorage.getItem(STORAGE_KEY) || ''
}

export function setStoredBaseUrl(value) {
  localStorage.setItem(STORAGE_KEY, value)
}

export function resolveBaseUrl() {
  const params = new URLSearchParams(window.location.search)
  const fromQuery = params.get('device')
  if (fromQuery) {
    return normalizeBaseUrl(fromQuery)
  }
  const stored = getStoredBaseUrl()
  return normalizeBaseUrl(stored)
}

export function normalizeBaseUrl(value) {
  if (!value) return ''
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed.replace(/\/+$/, '')
  }
  return `http://${trimmed}`.replace(/\/+$/, '')
}

async function requestJson(path) {
  const url = buildUrl(path)
  const response = await fetch(url, { mode: 'cors' })
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }
  return response.json()
}

async function requestText(path) {
  const url = buildUrl(path)
  const response = await fetch(url, { mode: 'cors' })
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }
  return response.text()
}

function buildUrl(path) {
  const base = resolveBaseUrl()
  if (!base) return path
  if (path.startsWith('/')) {
    return `${base}${path}`
  }
  return `${base}/${path}`
}

export const api = {
  getStatus: () => requestJson('/getstatusasjson'),
  getParams: () => requestJson('/getparamatersasjson'),
  getLastStatusMessage: () => requestJson('/getlaststatusmessageasjson'),
  scanWifi: () => requestJson('/getscannetworksasjson'),
  setColorMode: (mode) => requestText(`/setcolormode?mode=${encodeURIComponent(mode)}`),
  setColor: (hex) => requestText(`/setcolor?color=${encodeURIComponent(hex)}`),
  setParam: (param, value) =>
    requestText(`/setparam?param=${encodeURIComponent(param)}&value=${encodeURIComponent(value)}`),
  setPreset: (param, value) =>
    requestText(`/setpreset?param=${encodeURIComponent(param)}&value=${encodeURIComponent(value)}`),
  refreshHueDevices: () => requestText('/refresh_hue_devices'),
  getHueLightSettings: (id) =>
    requestText(`/controllersettings_hue.js?id=${encodeURIComponent(id)}`),
  setHueLightParam: ({ param, id, value, zone }) =>
    requestText(
      `/setparam?param=${encodeURIComponent(param)}&id=${encodeURIComponent(id)}&value=${encodeURIComponent(value)}${
        zone !== undefined ? `&zone=${encodeURIComponent(zone)}` : ''
      }`,
    ),
  refreshDreamscreenDevices: () => requestText('/refresh_dreamscreen_devices'),
  addDreamscreenToNetwork: (ssid) =>
    requestText(`/dreamscreenaddtonetwork?value=${encodeURIComponent(ssid)}`),
  setCameraPoint: (point, left, top) =>
    requestText(
      `/setcamerapoint?point=${encodeURIComponent(point)}&left=${encodeURIComponent(left)}&top=${encodeURIComponent(top)}`,
    ),
  reboot: () => requestText('/reboot?forreal=1'),
  startWps: () => requestText('/startwps?forreal=1'),
  updateUrl: () => buildUrl('/update'),
}
