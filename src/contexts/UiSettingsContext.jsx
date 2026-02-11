import { createContext, useContext, useMemo, useState } from 'react'

const STORAGE_KEY_ADVANCED = 'ambiback.ui.advanced'
const STORAGE_KEY_REFRESH = 'ambiback.statusRefreshInterval'

const DEFAULT_REFRESH_INTERVAL = 15
const MIN_REFRESH_INTERVAL = 5
const MAX_REFRESH_INTERVAL = 60
const REFRESH_STEP = 5

const UiSettingsContext = createContext({
  advanced: false,
  setAdvanced: () => {},
  statusRefreshInterval: DEFAULT_REFRESH_INTERVAL,
  setStatusRefreshInterval: () => {},
  refreshIntervalOptions: [],
})

function readInitialAdvanced() {
  try {
    const value = sessionStorage.getItem(STORAGE_KEY_ADVANCED)
    return value === 'true'
  } catch {
    return false
  }
}

function readInitialRefreshInterval() {
  try {
    const value = localStorage.getItem(STORAGE_KEY_REFRESH)
    const n = parseInt(value, 10)
    if (!Number.isNaN(n) && n >= MIN_REFRESH_INTERVAL && n <= MAX_REFRESH_INTERVAL) {
      return Math.round(n / REFRESH_STEP) * REFRESH_STEP
    }
  } catch {
    // ignore
  }
  return DEFAULT_REFRESH_INTERVAL
}

const refreshIntervalOptions = []
for (let v = MIN_REFRESH_INTERVAL; v <= MAX_REFRESH_INTERVAL; v += REFRESH_STEP) {
  refreshIntervalOptions.push(v)
}

export function UiSettingsProvider({ children }) {
  const [advanced, setAdvancedState] = useState(readInitialAdvanced)
  const [statusRefreshInterval, setStatusRefreshIntervalState] = useState(readInitialRefreshInterval)

  const setAdvanced = (value) => {
    setAdvancedState(value)
    try {
      sessionStorage.setItem(STORAGE_KEY_ADVANCED, String(value))
    } catch {
      // ignore storage errors (private mode, etc.)
    }
  }

  const setStatusRefreshInterval = (value) => {
    const n = Math.max(MIN_REFRESH_INTERVAL, Math.min(MAX_REFRESH_INTERVAL, Math.round(Number(value) / REFRESH_STEP) * REFRESH_STEP))
    setStatusRefreshIntervalState(n)
    try {
      localStorage.setItem(STORAGE_KEY_REFRESH, String(n))
    } catch {
      // ignore
    }
  }

  const ctx = useMemo(
    () => ({
      advanced,
      setAdvanced,
      statusRefreshInterval,
      setStatusRefreshInterval,
      refreshIntervalOptions,
    }),
    [advanced, statusRefreshInterval]
  )

  return <UiSettingsContext.Provider value={ctx}>{children}</UiSettingsContext.Provider>
}

export function useUiSettings() {
  return useContext(UiSettingsContext)
}
