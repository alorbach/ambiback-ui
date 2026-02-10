import { useCallback, useEffect, useState } from 'react'
import { api } from '../api/client.js'
import useDevice from './useDevice.js'

export default function useDeviceParams() {
  const { baseUrl } = useDevice()
  const [params, setParams] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.getParams()
      setParams(data)
    } catch (err) {
      setError(err.message || 'Failed to load parameters')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh, baseUrl])

  return { params, loading, error, refresh }
}
