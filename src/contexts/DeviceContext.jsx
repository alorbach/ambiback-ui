import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import {
  getStoredBaseUrl,
  normalizeBaseUrl,
  setStoredBaseUrl,
} from '../api/client.js'

export const DeviceContext = createContext({
  baseUrl: '',
  updateBaseUrl: () => {},
})

export function DeviceProvider({ children }) {
  const [baseUrl, setBaseUrl] = useState(() => getStoredBaseUrl())

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const fromQuery = params.get('device')
    if (fromQuery) {
      const normalized = normalizeBaseUrl(fromQuery)
      setStoredBaseUrl(normalized)
      setBaseUrl(normalized)
    }
  }, [])

  const updateBaseUrl = useCallback((value) => {
    const normalized = normalizeBaseUrl(value)
    setStoredBaseUrl(normalized)
    setBaseUrl(normalized)
    const url = new URL(window.location.href)
    if (normalized) {
      url.searchParams.set('device', normalized.replace(/^https?:\/\//, '').split('/')[0])
    } else {
      url.searchParams.delete('device')
    }
    window.history.replaceState({}, '', url.pathname + url.search + url.hash)
  }, [])

  return (
    <DeviceContext.Provider value={{ baseUrl, updateBaseUrl }}>
      {children}
    </DeviceContext.Provider>
  )
}

export function useDevice() {
  const ctx = useContext(DeviceContext)
  if (!ctx) {
    throw new Error('useDevice must be used within DeviceProvider')
  }
  return ctx
}
