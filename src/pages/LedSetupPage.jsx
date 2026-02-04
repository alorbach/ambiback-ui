import { useEffect, useState } from 'react'
import { api } from '../api/client.js'
import useDeviceParams from '../hooks/useDeviceParams.js'
import { readBool, readNumber } from '../utils/paramUtils.js'

export default function LedSetupPage() {
  const { params } = useDeviceParams()
  const [vertical, setVertical] = useState(20)
  const [horizontal, setHorizontal] = useState(30)
  const [direction, setDirection] = useState(1)
  const [sides, setSides] = useState({
    top: true,
    left: true,
    right: true,
    bottom: true,
  })
  const [sideBrightness, setSideBrightness] = useState({
    top: 100,
    left: 100,
    right: 100,
    bottom: 100,
  })
  const [message, setMessage] = useState('')

  const directionLabel = (value) => {
    switch (value) {
      case 1:
        return 'Bottom Right (CCW)'
      case 2:
        return 'Top Right (CCW)'
      case 3:
        return 'Top Left (CCW)'
      case 4:
        return 'Bottom Left (CCW)'
      case 5:
        return 'Top Right (CW)'
      case 6:
        return 'Top Left (CW)'
      case 7:
        return 'Bottom Left (CW)'
      case 8:
        return 'Bottom Right (CW)'
      default:
        return 'Unknown'
    }
  }

  const directionHint = (value) => {
    switch (value) {
      case 1:
        return { start: 'Bottom Right', flow: 'CCW' }
      case 2:
        return { start: 'Top Right', flow: 'CCW' }
      case 3:
        return { start: 'Top Left', flow: 'CCW' }
      case 4:
        return { start: 'Bottom Left', flow: 'CCW' }
      case 5:
        return { start: 'Top Right', flow: 'CW' }
      case 6:
        return { start: 'Top Left', flow: 'CW' }
      case 7:
        return { start: 'Bottom Left', flow: 'CW' }
      case 8:
        return { start: 'Bottom Right', flow: 'CW' }
      default:
        return { start: '-', flow: '-' }
    }
  }

  const hint = directionHint(direction)
  const arrowPathCW = 'M 60 35 H 340 V 205 H 60 Z'
  const arrowPathCCW = 'M 60 35 V 205 H 340 V 35 H 60 Z'

  useEffect(() => {
    if (!params) return
    setVertical(readNumber(params, 'vertical', 20))
    setHorizontal(readNumber(params, 'horizontal', 30))
    setDirection(readNumber(params, 'direction', 1))
    setSides({
      top: readBool(params, 'sidetop', true),
      left: readBool(params, 'sideleft', true),
      right: readBool(params, 'sideright', true),
      bottom: readBool(params, 'sidebottom', true),
    })
    setSideBrightness({
      top: readNumber(params, 'sidetopbrightness', 100),
      left: readNumber(params, 'sideleftbrightness', 100),
      right: readNumber(params, 'siderightbrightness', 100),
      bottom: readNumber(params, 'sidebottombrightness', 100),
    })
  }, [params])

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
      await api.setParam('settopbrightness', sideBrightness.top)
      await api.setParam('setleftbrightness', sideBrightness.left)
      await api.setParam('setrightbrightness', sideBrightness.right)
      await api.setParam('setbottombrightness', sideBrightness.bottom)
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
        <div className="layout-grid">
          <div className="layout-field">
            <label htmlFor="vertical">Vertical LEDs</label>
            <input
              id="vertical"
              type="number"
              min="8"
              max="60"
              value={vertical}
              onChange={(event) => setVertical(Number(event.target.value))}
            />
          </div>
          <div className="layout-field">
            <label htmlFor="horizontal">Horizontal LEDs</label>
            <input
              id="horizontal"
              type="number"
              min="8"
              max="120"
              value={horizontal}
              onChange={(event) => setHorizontal(Number(event.target.value))}
            />
          </div>
          <div className="layout-field">
            <label htmlFor="direction">Direction</label>
            <select
              id="direction"
              value={direction}
              onChange={(event) => setDirection(Number(event.target.value))}
            >
              <option value={1}>Bottom Right (CCW)</option>
              <option value={2}>Top Right (CCW)</option>
              <option value={3}>Top Left (CCW)</option>
              <option value={4}>Bottom Left (CCW)</option>
              <option value={5}>Top Right (CW)</option>
              <option value={6}>Top Left (CW)</option>
              <option value={7}>Bottom Left (CW)</option>
              <option value={8}>Bottom Right (CW)</option>
            </select>
          </div>
        </div>
        <div className="layout-sides">
          <label className="checkbox">
            <input
              type="checkbox"
              checked={sides.top}
              onChange={(event) => setSides({ ...sides, top: event.target.checked })}
            />
            Top side
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={sides.left}
              onChange={(event) => setSides({ ...sides, left: event.target.checked })}
            />
            Left side
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={sides.right}
              onChange={(event) => setSides({ ...sides, right: event.target.checked })}
            />
            Right side
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={sides.bottom}
              onChange={(event) => setSides({ ...sides, bottom: event.target.checked })}
            />
            Bottom side
          </label>
        </div>
        <div className="tv-preview">
          <div className="tv-frame">
            <div className="tv-back-label">Backside</div>
            <div className="tv-screen" />
            <svg className="tv-arrow" viewBox="0 0 400 240" aria-hidden="true">
              <path d={hint.flow === 'CW' ? arrowPathCW : arrowPathCCW} />
            </svg>
            <div
              className="tv-side tv-side-top"
              style={{
                opacity: sides.top ? 1 : 0.2,
                transform: `scaleX(${sideBrightness.top / 100})`,
              }}
            >
              Top
            </div>
            <div
              className="tv-side tv-side-right"
              style={{
                opacity: sides.right ? 1 : 0.2,
                transform: `scaleY(${sideBrightness.right / 100})`,
              }}
            >
              Right
            </div>
            <div
              className="tv-side tv-side-bottom"
              style={{
                opacity: sides.bottom ? 1 : 0.2,
                transform: `scaleX(${sideBrightness.bottom / 100})`,
              }}
            >
              Bottom
            </div>
            <div
              className="tv-side tv-side-left"
              style={{
                opacity: sides.left ? 1 : 0.2,
                transform: `scaleY(${sideBrightness.left / 100})`,
              }}
            >
              Left
            </div>
            <div
              className={`tv-arrowhead tv-arrowhead-${hint.start.replace(' ', '-').toLowerCase()} tv-arrowhead-${hint.flow.toLowerCase()}`}
            />
            <div className={`tv-flow tv-flow-${hint.flow.toLowerCase()}`}>{hint.flow}</div>
          </div>
          <div className="muted">Direction: {directionLabel(direction)}</div>
        </div>
        <div className="brightness-grid">
          <div className="brightness-item">
            <label htmlFor="brightnessTop">Top Brightness</label>
            <div className="brightness-control">
              <input
                id="brightnessTop"
                type="range"
                min="1"
                max="100"
                value={sideBrightness.top}
                onChange={(event) =>
                  setSideBrightness({ ...sideBrightness, top: Number(event.target.value) })
                }
              />
              <span className="muted">{sideBrightness.top}</span>
            </div>
          </div>
          <div className="brightness-item">
            <label htmlFor="brightnessRight">Right Brightness</label>
            <div className="brightness-control">
              <input
                id="brightnessRight"
                type="range"
                min="1"
                max="100"
                value={sideBrightness.right}
                onChange={(event) =>
                  setSideBrightness({ ...sideBrightness, right: Number(event.target.value) })
                }
              />
              <span className="muted">{sideBrightness.right}</span>
            </div>
          </div>
          <div className="brightness-item">
            <label htmlFor="brightnessLeft">Left Brightness</label>
            <div className="brightness-control">
              <input
                id="brightnessLeft"
                type="range"
                min="1"
                max="100"
                value={sideBrightness.left}
                onChange={(event) =>
                  setSideBrightness({ ...sideBrightness, left: Number(event.target.value) })
                }
              />
              <span className="muted">{sideBrightness.left}</span>
            </div>
          </div>
          <div className="brightness-item">
            <label htmlFor="brightnessBottom">Bottom Brightness</label>
            <div className="brightness-control">
              <input
                id="brightnessBottom"
                type="range"
                min="1"
                max="100"
                value={sideBrightness.bottom}
                onChange={(event) =>
                  setSideBrightness({ ...sideBrightness, bottom: Number(event.target.value) })
                }
              />
              <span className="muted">{sideBrightness.bottom}</span>
            </div>
          </div>
        </div>
        <button type="button" onClick={apply}>
          Apply Setup
        </button>
        {message && <div className="muted">{message}</div>}
      </section>
    </div>
  )
}
