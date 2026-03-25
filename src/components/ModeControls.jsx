import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client.js'
import { useCapabilitiesContext } from '../contexts/CapabilitiesContext.jsx'
import useDeviceParams from '../hooks/useDeviceParams.js'
import { readNumber, readString } from '../utils/paramUtils.js'

const modes = [
  { value: 0, label: 'Off', sub: 'Fade out & switch off' },
  { value: 1, label: 'Video', sub: 'Network / sync' },
  { value: 2, label: 'Ambient', sub: 'Static or scenes', navigateTo: '/ambient' },
  { value: 3, label: 'Camera', sub: 'Screen capture', navigateTo: '/camera' },
  { value: 4, label: 'Relay', sub: 'Forward to device' },
  { value: 5, label: 'Demo', sub: 'Test pattern' },
]

export default function ModeControls() {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const { caps } = useCapabilitiesContext()
  const { params, refresh } = useDeviceParams()
  const navigate = useNavigate()
  const refreshTimerRef = useRef(null)
  const deviceType = readString(params, 'devicetype', '')
  const currentMode = readNumber(params, 'ledmode', null)
  const videoReadOnly = deviceType.toLowerCase().includes('controller')

  const availableModes = useMemo(() => {
    return modes.filter((mode) => {
      if (mode.value === 1 && caps.camera) return false // Video not on Cam modules
      if (mode.value === 2 && caps.camera) return false // Ambient not on CAM modules
      if (mode.value === 3 && !caps.camera) return false
      if (mode.value === 4) return false // Relay hidden
      return true
    })
  }, [caps.camera])

  const setMode = async (mode) => {
    setLoading(true)
    setMessage('')
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)
    try {
      const result = await api.setColorMode(mode)
      setMessage(result)
      const modeObj = modes.find((m) => m.value === mode)
      if (modeObj?.navigateTo) navigate(modeObj.navigateTo)
    } catch (err) {
      setMessage(err.message || 'Failed to set mode')
    } finally {
      setLoading(false)
    }
    refreshTimerRef.current = setTimeout(() => refresh(), 1000)
  }

  useEffect(() => {
    return () => { if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current) }
  }, [])

  useEffect(() => {
    if (!message) return
    const t = setTimeout(() => setMessage(''), 4000)
    return () => clearTimeout(t)
  }, [message])

  return (
    <section className="card card-full">
      <header className="card-header">
        <h2>LED Mode</h2>
      </header>
      <div className="mode-tile-grid">
        {availableModes.map((mode) => (
          <button
            key={mode.value}
            type="button"
            onClick={() => {
              if (mode.value === 1 && videoReadOnly) return
              setMode(mode.value)
            }}
            disabled={loading || (mode.value === 1 && videoReadOnly)}
            className={`mode-tile ${currentMode === mode.value ? 'active' : ''}`}
            title={mode.value === 1 && videoReadOnly ? 'Video mode is controlled by the device and is read-only here.' : undefined}
          >
            {mode.label}
            {mode.sub && (
              <span className="mode-tile-label">
                {mode.sub}{mode.value === 1 && videoReadOnly ? ' (read-only)' : ''}
              </span>
            )}
          </button>
        ))}
      </div>
      {message && <div className="muted" style={{ marginTop: 8 }}>{message}</div>}
    </section>
  )
}
