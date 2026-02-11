import { useEffect, useRef, useState } from 'react'
import { api } from '../api/client.js'
import useDeviceParams from '../hooks/useDeviceParams.js'
import { readNumber } from '../utils/paramUtils.js'

function hslToHex(h, s, l) {
  s /= 100
  l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = (n) => {
    const k = (n + h / 30) % 12
    return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
  }
  const r = Math.round(f(0) * 255)
  const g = Math.round(f(8) * 255)
  const b = Math.round(f(4) * 255)
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')
}

function hexToHsl(hex) {
  const n = hex.replace('#', '')
  const r = parseInt(n.slice(0, 2), 16) / 255
  const g = parseInt(n.slice(2, 4), 16) / 255
  const b = parseInt(n.slice(4, 6), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      default:
        h = ((r - g) / d + 4) / 6
    }
  }
  return { h: h * 360, s: s * 100, l: l * 100 }
}

const WHEEL_SIZE = 160

export default function ColorControls({ fullWidth = false }) {
  const [color, setColor] = useState('#ffffff')
  const [hue, setHue] = useState(0)
  const [lightness, setLightness] = useState(50)
  const [brightness, setBrightness] = useState(128)
  const [message, setMessage] = useState('')
  const { params } = useDeviceParams()
  const colorTimer = useRef(null)
  const brightnessTimer = useRef(null)
  const pickerRef = useRef(null)
  const wheelRef = useRef(null)
  const barRef = useRef(null)
  const hasSyncedColorFromParams = useRef(false)

  useEffect(() => {
    if (!params) return
    setBrightness(readNumber(params, 'brightness', 128))
    if (!hasSyncedColorFromParams.current) {
      hasSyncedColorFromParams.current = true
      const r = readNumber(params, 'colorred', 255)
      const g = readNumber(params, 'colorgreen', 255)
      const b = readNumber(params, 'colorblue', 255)
      const hex = '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')
      setColor(hex)
      const { h, l } = hexToHsl(hex)
      setHue(h)
      setLightness(l)
    }
  }, [params])

  const sendColorAndSwitchToSolid = async (hexNoHash) => {
    setMessage('')
    try {
      await api.setColorMode(2)
      await api.setParam('setambientpreset', 0)
      const result = await api.setColor(`FF${hexNoHash}`)
      setMessage(result)
    } catch (err) {
      setMessage(err.message || 'Failed to set color')
    }
  }

  const queueColorUpdate = (nextColor) => {
    if (colorTimer.current) clearTimeout(colorTimer.current)
    setColor(nextColor)
    const { h, l } = hexToHsl(nextColor)
    setHue(h)
    setLightness(l)
    colorTimer.current = setTimeout(() => {
      sendColorAndSwitchToSolid(nextColor.replace('#', ''))
    }, 300)
  }

  const queueBrightnessUpdate = (nextBrightness) => {
    if (brightnessTimer.current) clearTimeout(brightnessTimer.current)
    brightnessTimer.current = setTimeout(async () => {
      setMessage('')
      try {
        const result = await api.setParam('setbrightness', nextBrightness)
        setMessage(result)
      } catch (err) {
        setMessage(err.message || 'Failed to set brightness')
      }
    }, 300)
  }

  const getClientPos = (e) => {
    if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
    return { x: e.clientX, y: e.clientY }
  }

  const onWheelPointer = (e) => {
    const el = wheelRef.current
    if (!el) return
    const { x, y } = getClientPos(e)
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = x - cx
    const dy = y - cy
    const angle = Math.atan2(dy, dx)
    let deg = (angle * 180) / Math.PI + 90
    if (deg < 0) deg += 360
    const effectiveLightness = lightness >= 98 ? 50 : lightness
    const hex = hslToHex(deg, 100, effectiveLightness)
    setHue(deg)
    setLightness(effectiveLightness)
    setColor(hex)
    if (colorTimer.current) clearTimeout(colorTimer.current)
    sendColorAndSwitchToSolid(hex.replace('#', ''))
  }

  const onBarPointer = (e) => {
    const el = barRef.current
    if (!el) return
    const { y } = getClientPos(e)
    const rect = el.getBoundingClientRect()
    const py = y - rect.top
    const pct = Math.max(0, Math.min(100, (py / rect.height) * 100))
    const hex = hslToHex(hue, 100, pct)
    setLightness(pct)
    setColor(hex)
    if (colorTimer.current) clearTimeout(colorTimer.current)
    sendColorAndSwitchToSolid(hex.replace('#', ''))
  }

  const handleTouchStart = (e, handler) => {
    e.preventDefault()
    handler(e)
  }

  const handleTouchMove = (e, handler) => {
    e.preventDefault()
    handler(e)
  }

  return (
    <section className={`card ${fullWidth ? 'card-full' : ''}`}>
      <header className="card-header">
        <h2>Color & Brightness</h2>
      </header>
      <div className="color-brightness-layout">
        <div className="color-wheel-column">
          <div
            ref={wheelRef}
            className="color-wheel"
            style={{
              width: WHEEL_SIZE,
              height: WHEEL_SIZE,
              background: `conic-gradient(from 0deg, red, yellow, lime, cyan, blue, magenta, red)`,
            }}
            onClick={onWheelPointer}
            onTouchStart={(e) => handleTouchStart(e, onWheelPointer)}
            onTouchMove={(e) => handleTouchMove(e, onWheelPointer)}
            role="button"
            tabIndex={0}
            aria-label="Hue wheel - click or drag to select hue"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onWheelPointer(e)
              }
            }}
          />
          <div
            ref={barRef}
            className="color-lightness-bar"
            style={{
              background: `linear-gradient(to bottom, #000, ${hslToHex(hue, 100, 50)}, #fff)`,
            }}
            onClick={onBarPointer}
            onTouchStart={(e) => handleTouchStart(e, onBarPointer)}
            onTouchMove={(e) => handleTouchMove(e, onBarPointer)}
            role="button"
            tabIndex={0}
            aria-label="Lightness - click or drag to select"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onBarPointer(e)
              }
            }}
          />
        </div>
        <div className="color-controls-column">
          <div className="form-grid">
            <label htmlFor="colorPicker">Color</label>
            <button
              type="button"
              className="color-swatch color-swatch-button"
              style={{ backgroundColor: color }}
              onClick={() => pickerRef.current?.click()}
              aria-label={`Select color ${color}`}
            />
            <input
              id="colorPicker"
              type="color"
              value={color}
              onChange={(event) => {
                queueColorUpdate(event.target.value)
              }}
              className="color-picker color-picker-hidden"
              ref={pickerRef}
              tabIndex={-1}
              aria-hidden="true"
            />
            <div className="muted">{color.toUpperCase()}</div>
          </div>
          <div className="form-grid">
            <label htmlFor="brightness">Brightness</label>
            <input
              id="brightness"
              type="range"
              min="0"
              max="255"
              value={brightness}
              onChange={(event) => {
                const next = Number(event.target.value)
                setBrightness(next)
                queueBrightnessUpdate(next)
              }}
            />
            <div className="muted">{brightness}</div>
          </div>
        </div>
      </div>
      {message && <div className="muted">{message}</div>}
    </section>
  )
}
