export function hasParam(params, key) {
  return params && Object.prototype.hasOwnProperty.call(params, key)
}

export function readNumber(params, key, fallback = 0) {
  if (!params) return fallback
  const raw = params[key]
  const num = Number(raw)
  return Number.isFinite(num) ? num : fallback
}

export function readString(params, key, fallback = '') {
  if (!params) return fallback
  const value = params[key]
  return value == null ? fallback : String(value)
}

export function readBool(params, key, fallback = false) {
  if (!params) return fallback
  const value = params[key]
  if (value == null) return fallback
  const normalized = String(value).toLowerCase()
  return normalized === '1' || normalized === 'true' || normalized === 'yes'
}
