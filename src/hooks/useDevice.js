import { useEffect, useState } from 'react'
import { getStoredBaseUrl, normalizeBaseUrl, setStoredBaseUrl } from '../api/client.js'

export default function useDevice() {
  const [baseUrl, setBaseUrl] = useState(getStoredBaseUrl())

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const fromQuery = params.get('device')
    if (fromQuery) {
      const normalized = normalizeBaseUrl(fromQuery)
      setStoredBaseUrl(normalized)
      setBaseUrl(normalized)
    }
  }, [])

  const updateBaseUrl = (value) => {
    const normalized = normalizeBaseUrl(value)
    setStoredBaseUrl(normalized)
    setBaseUrl(normalized)
  }

  return { baseUrl, updateBaseUrl }
}
