import { useState } from 'react'
import { api } from '../api/client.js'

export default function LedSetupPage() {
  const [vertical, setVertical] = useState(20)
  const [horizontal, setHorizontal] = useState(30)
  const [direction, setDirection] = useState(0)
  const [sides, setSides] = useState({
    top: true,
    left: true,
    right: true,
    bottom: true,
  })
  const [message, setMessage] = useState('')

  const apply = async () => {
    setMessage('')
    try {
      await api.setParam('setvertical', vertical)
      await api.setParam('sethorizontal', horizontal)
      await api.setParam('setdirection', direction)
      await api.setParam('setsidetop', sides.top ? 1 : 0)
      await api.setParam('setsideleft', sides.left ? 1 : 0)
      await api.setParam('setsideright', sides.right ? 1 : 0)
      await api.setParam('setsidebottom', sides.bottom ? 1 : 0)
      setMessage('LED setup updated')
    } catch (err) {
      setMessage(err.message || 'Failed to update LED setup')
    }
  }

  return (
    <div className="page">
      <h1>LED Setup</h1>
      <section className="card">
        <header className="card-header">
          <h2>Layout</h2>
        </header>
        <div className="form-grid">
          <label htmlFor="vertical">Vertical LEDs</label>
          <input
            id="vertical"
            type="number"
            min="8"
            max="60"
            value={vertical}
            onChange={(event) => setVertical(Number(event.target.value))}
          />
          <label htmlFor="horizontal">Horizontal LEDs</label>
          <input
            id="horizontal"
            type="number"
            min="8"
            max="120"
            value={horizontal}
            onChange={(event) => setHorizontal(Number(event.target.value))}
          />
          <label htmlFor="direction">Direction</label>
          <select
            id="direction"
            value={direction}
            onChange={(event) => setDirection(Number(event.target.value))}
          >
            <option value={0}>Clockwise</option>
            <option value={1}>Counter-clockwise</option>
          </select>
        </div>
        <div className="form-grid">
          <label>
            <input
              type="checkbox"
              checked={sides.top}
              onChange={(event) => setSides({ ...sides, top: event.target.checked })}
            />
            Top side
          </label>
          <label>
            <input
              type="checkbox"
              checked={sides.left}
              onChange={(event) => setSides({ ...sides, left: event.target.checked })}
            />
            Left side
          </label>
          <label>
            <input
              type="checkbox"
              checked={sides.right}
              onChange={(event) => setSides({ ...sides, right: event.target.checked })}
            />
            Right side
          </label>
          <label>
            <input
              type="checkbox"
              checked={sides.bottom}
              onChange={(event) => setSides({ ...sides, bottom: event.target.checked })}
            />
            Bottom side
          </label>
        </div>
        <button type="button" onClick={apply}>
          Apply Setup
        </button>
        {message && <div className="muted">{message}</div>}
      </section>
    </div>
  )
}
