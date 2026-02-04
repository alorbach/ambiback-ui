import { useState } from 'react'
import { api } from '../api/client.js'

const modes = [
  { value: 0, label: 'Off' },
  { value: 1, label: 'Video' },
  { value: 2, label: 'Ambient' },
  { value: 3, label: 'Camera' },
  { value: 4, label: 'Relay' },
  { value: 5, label: 'Demo' },
]

export default function ModeControls() {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

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
    <section className="card">
      <header className="card-header">
        <h2>LED Mode</h2>
      </header>
      <div className="button-grid">
        {modes.map((mode) => (
          <button
            key={mode.value}
            type="button"
            onClick={() => setMode(mode.value)}
            disabled={loading}
          >
            {mode.label}
          </button>
        ))}
      </div>
      {message && <div className="muted">{message}</div>}
    </section>
  )
}
