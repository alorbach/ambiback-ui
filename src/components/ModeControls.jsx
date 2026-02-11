import { useMemo, useState } from 'react'
import { api } from '../api/client.js'
import { useCapabilitiesContext } from '../contexts/CapabilitiesContext.jsx'
import useDeviceParams from '../hooks/useDeviceParams.js'
import { readNumber } from '../utils/paramUtils.js'

const modes = [
  { value: 0, label: 'Off', sub: 'Fade out & switch off' },
  { value: 1, label: 'Video', sub: 'Network / sync' },
  { value: 2, label: 'Ambient', sub: 'Static or scenes' },
  { value: 3, label: 'Camera', sub: 'Screen capture' },
  { value: 4, label: 'Relay', sub: 'Forward to device' },
  { value: 5, label: 'Demo', sub: 'Test pattern' },
]

export default function ModeControls() {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const { caps } = useCapabilitiesContext()
  const { params } = useDeviceParams()
  const currentMode = readNumber(params, 'ledmode', null)

  const availableModes = useMemo(() => {
    return modes.filter((mode) => {
      if (mode.value === 1 && caps.camera) return false // Video not on Cam modules
      if (mode.value === 3 && !caps.camera) return false
      if (mode.value === 4) return false // Relay hidden
      return true
    })
  }, [caps.camera])

  const setMode = async (mode) => {
    setLoading(true)
    setMessage('')
    try {
      const result = await api.setColorMode(mode)
      setMessage(result)
    } catch (err) {
      setMessage(err.message || 'Failed to set mode')
    } finally {
      setLoading(false)
    }
  }

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
            onClick={() => setMode(mode.value)}
            disabled={loading}
            className={`mode-tile ${currentMode === mode.value ? 'active' : ''}`}
          >
            {mode.label}
            {mode.sub && <span className="mode-tile-label">{mode.sub}</span>}
          </button>
        ))}
      </div>
      {message && <div className="muted" style={{ marginTop: 8 }}>{message}</div>}
    </section>
  )
}
