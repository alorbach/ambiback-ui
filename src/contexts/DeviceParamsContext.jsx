import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { addRecentDevice, api } from '../api/client.js'
import useDevice from '../hooks/useDevice.js'
import { useUiSettings } from './UiSettingsContext.jsx'

export const DeviceParamsContext = createContext({
  params: null,
  loading: true,
  error: '',
  refresh: () => {},
})

export function DeviceParamsProvider({ children }) {
  const { baseUrl } = useDevice()
  const { statusRefreshInterval } = useUiSettings()
  const [params, setParams] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const consecutiveErrors = useRef(0)

  const refresh = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true)
      setError('')
    }
    try {
      const data = await api.getParams()
      setParams(data)
      consecutiveErrors.current = 0
      if (baseUrl) addRecentDevice(baseUrl)
    } catch (err) {
      if (!silent) setError(err.message || 'Failed to load parameters')
      consecutiveErrors.current += 1
    } finally {
      if (!silent) setLoading(false)
    }
  }, [baseUrl])

  // Initial fetch when baseUrl changes (e.g. user selected different device from discovery)
  useEffect(() => {
    if (!baseUrl) {
      setParams(null)
      setLoading(false)
      setError('')
      return
    }
    setParams(null)
    setError('')
    setLoading(true)
    refresh()
  }, [baseUrl, refresh])

  // Polling: pause when tab hidden; only poll when baseUrl set and not too many errors
  useEffect(() => {
    if (!baseUrl) return
    const intervalMs = statusRefreshInterval * 1000
    let id = null

    const startPolling = () => {
      if (id) return
      id = setInterval(() => {
        if (consecutiveErrors.current >= 3) return
        refresh(true)
      }, intervalMs)
    }

    const stopPolling = () => {
      if (id) {
        clearInterval(id)
        id = null
      }
    }

    if (document.visibilityState === 'visible') startPolling()

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') startPolling()
      else stopPolling()
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      stopPolling()
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [baseUrl, statusRefreshInterval, refresh])

  const ctx = { params, loading, error, refresh }
  return <DeviceParamsContext.Provider value={ctx}>{children}</DeviceParamsContext.Provider>
}

export function useDeviceParamsContext() {
  return useContext(DeviceParamsContext)
}
