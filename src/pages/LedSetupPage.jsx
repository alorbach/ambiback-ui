import { useEffect, useState } from 'react'
import { api } from '../api/client.js'
import useDeviceParams from '../hooks/useDeviceParams.js'
import { readBool, readNumber } from '../utils/paramUtils.js'
import { applyDefaults } from '../utils/applyDefaults.js'
import { LED_SETUP_DEFAULTS } from '../utils/paramDefaults.js'

export default function LedSetupPage() {
  const { params, refresh } = useDeviceParams()
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
  const [resetting, setResetting] = useState(false)

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

  const updateParam = async (param, value, successText = 'LED setup updated') => {
    setMessage('')
    try {
      await api.setParam(param, value)
      setMessage(successText)
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
              type="range"
              min="8"
              max="60"
              value={vertical}
              onChange={(event) => {
                const next = Number(event.target.value)
                setVertical(next)
                updateParam('setvertical', next)
              }}
            />
            <div className="muted">{vertical}</div>
          </div>
          <div className="layout-field">
            <label htmlFor="horizontal">Horizontal LEDs</label>
            <input
              id="horizontal"
              type="range"
              min="8"
              max="120"
              value={horizontal}
              onChange={(event) => {
                const next = Number(event.target.value)
                setHorizontal(next)
                updateParam('sethorizontal', next)
              }}
            />
            <div className="muted">{horizontal}</div>
          </div>
          <div className="layout-field">
            <label htmlFor="direction">Direction</label>
            <select
              id="direction"
              value={direction}
              onChange={(event) => {
                const next = Number(event.target.value)
                setDirection(next)
                updateParam('setdirection', next)
              }}
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
        <div className="layout-hint muted">Tap the TV edges to toggle sides.</div>
        <div className="tv-preview">
          <div className="tv-frame">
            <div className="tv-back-label">Backside</div>
            <div className="tv-screen" />
            <svg className="tv-arrow" viewBox="0 0 400 240" aria-hidden="true">
              <path d={hint.flow === 'CW' ? arrowPathCW : arrowPathCCW} />
            </svg>
            <button
              type="button"
              className={`tv-side tv-side-top ${sides.top ? 'tv-side-enabled' : 'tv-side-disabled'}`}
              style={{
                transform: `scaleX(${sideBrightness.top / 100})`,
              }}
              onClick={() => {
                const next = !sides.top
                setSides({ ...sides, top: next })
                updateParam('setsidetop', next ? 1 : 0)
              }}
              aria-pressed={sides.top}
            >
              Top
            </button>
            <button
              type="button"
              className={`tv-side tv-side-right ${sides.right ? 'tv-side-enabled' : 'tv-side-disabled'}`}
              style={{
                transform: `scaleY(${sideBrightness.right / 100})`,
              }}
              onClick={() => {
                const next = !sides.right
                setSides({ ...sides, right: next })
                updateParam('setsideright', next ? 1 : 0)
              }}
              aria-pressed={sides.right}
            >
              Right
            </button>
            <button
              type="button"
              className={`tv-side tv-side-bottom ${sides.bottom ? 'tv-side-enabled' : 'tv-side-disabled'}`}
              style={{
                transform: `scaleX(${sideBrightness.bottom / 100})`,
              }}
              onClick={() => {
                const next = !sides.bottom
                setSides({ ...sides, bottom: next })
                updateParam('setsidebottom', next ? 1 : 0)
              }}
              aria-pressed={sides.bottom}
            >
              Bottom
            </button>
            <button
              type="button"
              className={`tv-side tv-side-left ${sides.left ? 'tv-side-enabled' : 'tv-side-disabled'}`}
              style={{
                transform: `scaleY(${sideBrightness.left / 100})`,
              }}
              onClick={() => {
                const next = !sides.left
                setSides({ ...sides, left: next })
                updateParam('setsideleft', next ? 1 : 0)
              }}
              aria-pressed={sides.left}
            >
              Left
            </button>
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
                onChange={(event) => {
                  const next = Number(event.target.value)
                  setSideBrightness({ ...sideBrightness, top: next })
                  updateParam('settopbrightness', next)
                }}
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
                onChange={(event) => {
                  const next = Number(event.target.value)
                  setSideBrightness({ ...sideBrightness, right: next })
                  updateParam('setrightbrightness', next)
                }}
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
                onChange={(event) => {
                  const next = Number(event.target.value)
                  setSideBrightness({ ...sideBrightness, left: next })
                  updateParam('setleftbrightness', next)
                }}
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
                onChange={(event) => {
                  const next = Number(event.target.value)
                  setSideBrightness({ ...sideBrightness, bottom: next })
                  updateParam('setbottombrightness', next)
                }}
              />
              <span className="muted">{sideBrightness.bottom}</span>
            </div>
          </div>
        </div>
        <div className="button-row">
          <button
            type="button"
            className="button secondary"
            disabled={resetting}
            onClick={async () => {
              setResetting(true)
              setMessage('')
              try {
                await applyDefaults(LED_SETUP_DEFAULTS)
                await refresh()
                setMessage('LED setup reset to defaults')
              } catch (err) {
                setMessage(err.message || 'Failed to reset LED setup')
              } finally {
                setResetting(false)
              }
            }}
          >
            {resetting ? 'Resetting…' : 'Reset to default'}
          </button>
        </div>
        {message && <div className="muted">{message}</div>}
      </section>
    </div>
  )
}
