import { useEffect, useState } from 'react'
import { api } from '../api/client.js'
import useDeviceParams from '../hooks/useDeviceParams.js'
import { readNumber } from '../utils/paramUtils.js'

export default function ColorControls() {
  const [color, setColor] = useState('#ffffff')
  const [brightness, setBrightness] = useState(128)
  const [message, setMessage] = useState('')
  const { params } = useDeviceParams()

  useEffect(() => {
    if (!params) return
    setBrightness(readNumber(params, 'brightness', 128))
  }, [params])

  const applyColor = async () => {
    setMessage('')
    try {
      const hex = color.replace('#', '')
      const result = await api.setColor(`FF${hex}`)
      setMessage(result)
    } catch (err) {
      setMessage(err.message || 'Failed to set color')
    }
  }

  const applyBrightness = async () => {
    setMessage('')
    try {
      const result = await api.setParam('setbrightness', brightness)
      setMessage(result)
    } catch (err) {
      setMessage(err.message || 'Failed to set brightness')
    }
  }

  return (
    <section className="card">
      <header className="card-header">
        <h2>Color & Brightness</h2>
      </header>
      <div className="form-grid">
        <label htmlFor="colorPicker">Color</label>
        <input
          id="colorPicker"
          type="color"
          value={color}
          onChange={(event) => setColor(event.target.value)}
        />
        <button type="button" onClick={applyColor}>
          Apply Color
        </button>
      </div>
      <div className="form-grid">
        <label htmlFor="brightness">Brightness</label>
        <input
          id="brightness"
          type="range"
          min="0"
          max="255"
          value={brightness}
          onChange={(event) => setBrightness(Number(event.target.value))}
        />
        <div className="muted">{brightness}</div>
        <button type="button" onClick={applyBrightness}>
          Apply Brightness
        </button>
      </div>
      {message && <div className="muted">{message}</div>}
    </section>
  )
}
