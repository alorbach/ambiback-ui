import { useEffect, useRef, useState } from 'react'
import ColorControls from '../components/ColorControls.jsx'
import useDeviceParams from '../hooks/useDeviceParams.js'
import { api } from '../api/client.js'
import { readNumber } from '../utils/paramUtils.js'
import { applyDefaults } from '../utils/applyDefaults.js'
import { AMBIENT_DEFAULTS } from '../utils/paramDefaults.js'

const SCENE_PRESETS = [
  { value: 0, label: 'Solid', preview: ['#888', '#ccc'] },
  { value: 1, label: 'Fire', preview: ['#330000', '#cc2200', '#ff6600', '#ffaa00'] },
  { value: 2, label: 'Christmas', preview: ['#b30000', '#006622', '#b30000', '#006622'] },
  { value: 3, label: 'Halloween', preview: ['#cc5500', '#662288', '#cc5500', '#8822aa'] },
  { value: 4, label: 'Ocean', preview: ['#004466', '#0088aa', '#00aacc', '#006688'] },
  { value: 5, label: 'Sunset', preview: ['#662233', '#cc5544', '#ff8866', '#ffaa88'] },
  { value: 6, label: 'Aurora', preview: ['#004422', '#008866', '#2266aa', '#4488cc'] },
  { value: 7, label: 'Candle', preview: ['#442200', '#cc7722', '#ffaa44', '#cc8822'] },
  { value: 8, label: 'Rainbow', preview: ['#ff0000', '#ff8800', '#ffff00', '#00ff00', '#0088ff', '#8800ff'] },
  { value: 9, label: 'Thunderstorm', preview: ['#0a0a18', '#1a2540', '#4080cc', '#0a0a18'] },
  { value: 10, label: 'Party 2', preview: ['#ff0088', '#00ff88', '#0088ff', '#ff8800'] },
  { value: 11, label: 'Party', preview: ['#ff0066', '#6600ff', '#00ffcc', '#ffcc00'] },
]

const HEALTH_PRESETS = [
  { value: 12, label: '40 Hz Gamma', preview: ['#000011', '#0000ff'], tooltip: 'MIT GENUS: 40 Hz blue flicker. Research suggests gamma entrainment may support brain health. Intensity: Blue→Black (1=full, 100=off).' },
  { value: 13, label: '10 Hz Alpha', preview: ['#110000', '#880000', '#ff0000', '#880000'], tooltip: '10 Hz red pulse with soft ramping. Alpha wave entrainment may support relaxation & focus. Intensity: Red→Black.' },
  { value: 14, label: '34 Hz Gamma (Red)', preview: ['#110000', '#ff0000'], tooltip: '34 Hz red flicker. Study: red light 34–38 Hz can entrain gamma waves. Intensity: Red→Black (1=full, 100=off).' },
  { value: 15, label: 'Rotlicht Abend', preview: ['#550000', '#aa0000', '#ff0000', '#aa0000'], tooltip: 'Red breathing light. Red is melatonin-friendly for evening; gentle pulse may support sleep. Speed 5=1 Hz. Intensity: Red→Black.' },
]

export default function AmbientPage() {
  const { params, refresh } = useDeviceParams()
  const [ambientPreset, setAmbientPreset] = useState(0)
  const [ambientSpeed, setAmbientSpeed] = useState(5)
  const [ambientIntensity, setAmbientIntensity] = useState(80)
  const [message, setMessage] = useState('')
  const [resetting, setResetting] = useState(false)
  const [infoOpen, setInfoOpen] = useState(null)
  const [healthExpanded, setHealthExpanded] = useState(true)
  const timersRef = useRef({})

  useEffect(() => {
    if (!params) return
    setAmbientPreset(readNumber(params, 'ambientpreset', 0))
    setAmbientSpeed(readNumber(params, 'ambientspeed', 5))
    setAmbientIntensity(readNumber(params, 'ambientintensity', 80))
  }, [params])

  useEffect(() => {
    if (infoOpen === null) return
    const close = () => setInfoOpen(null)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [infoOpen])

  const queueParam = (param, value) => {
    if (timersRef.current[param]) {
      clearTimeout(timersRef.current[param])
    }
    timersRef.current[param] = setTimeout(async () => {
      setMessage('')
      try {
        const result = await api.setParam(param, value)
        setMessage(result)
      } catch (err) {
        setMessage(err.message || 'Failed to update')
      }
    }, 300)
  }

  return (
    <div className="page">
      <h1>Ambient Mode</h1>
      <div className="card-grid">
        <ColorControls fullWidth />
      </div>
      <section className="card">
        <header className="card-header">
          <h2>Ambient Scenes</h2>
        </header>
        <p className="card-desc">
          Choose a themed preset. <strong>Solid</strong> = static color only. <strong>Speed</strong> and <strong>Intensity</strong> affect animated presets.
        </p>
        <div className="preset-tile-grid">
          {SCENE_PRESETS.map((p) => (
            <button
              key={p.value}
              type="button"
              className={`preset-tile ${ambientPreset === p.value ? 'active' : ''}`}
              onClick={async () => {
                setAmbientPreset(p.value)
                setMessage('')
                try {
                  await api.setColorMode(2)
                  const result = await api.setParam('setambientpreset', p.value)
                  setMessage(result || '')
                } catch (err) {
                  setMessage(err.message || 'Failed to set preset')
                }
              }}
            >
              <span
                className="preset-tile-preview"
                style={{
                  background: Array.isArray(p.preview)
                    ? `linear-gradient(to right, ${p.preview.join(', ')})`
                    : p.preview,
                }}
              />
              {p.label}
            </button>
          ))}
        </div>
        <details className="health-scenes-details" open={healthExpanded} onToggle={(e) => setHealthExpanded(e.target.open)}>
          <summary className="health-scenes-heading">
            Health Scenes
            <span className="health-scenes-chevron" aria-hidden>{healthExpanded ? '−' : '+'}</span>
          </summary>
          <p className="health-scenes-desc">Evidence-based light modes.</p>
        <div className="preset-tile-grid preset-tile-grid-health">
          {HEALTH_PRESETS.map((p) => (
            <div
              key={p.value}
              className={`preset-tile preset-tile-health preset-tile-with-info ${ambientPreset === p.value ? 'active' : ''}`}
            >
              <button
                type="button"
                className="preset-tile-main"
                onClick={async () => {
                  setInfoOpen(null)
                  setAmbientPreset(p.value)
                  setMessage('')
                  try {
                    await api.setColorMode(2)
                    const result = await api.setParam('setambientpreset', p.value)
                    setMessage(result || '')
                  } catch (err) {
                    setMessage(err.message || 'Failed to set preset')
                  }
                }}
              >
                <span
                  className="preset-tile-preview"
                  style={{
                    background: Array.isArray(p.preview)
                      ? `linear-gradient(to right, ${p.preview.join(', ')})`
                      : p.preview,
                  }}
                />
                {p.label}
              </button>
              <div className={`preset-tile-info-wrap ${infoOpen === p.value ? 'tooltip-visible' : ''}`}>
                <button
                  type="button"
                  className="preset-tile-info-btn"
                  aria-label={`Info: ${p.label}`}
                  aria-expanded={infoOpen === p.value}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setInfoOpen((v) => (v === p.value ? null : p.value))
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4M12 8h.01" />
                  </svg>
                </button>
                <div className="preset-tile-tooltip" role="tooltip">
                  {p.tooltip}
                </div>
              </div>
            </div>
          ))}
        </div>
        </details>
        <div className="form-grid form-grid-ambient">
          <label htmlFor="ambientSpeed">Speed (1–10)</label>
          <div className="range-with-input">
            <input
              type="range"
              id="ambientSpeed"
              min={1}
              max={10}
              value={ambientSpeed}
              onChange={(e) => {
                const next = Number(e.target.value)
                setAmbientSpeed(next)
                queueParam('setambientspeed', next)
              }}
              aria-valuemin={1}
              aria-valuemax={10}
              aria-valuenow={ambientSpeed}
            />
            <input
              type="number"
              min={1}
              max={10}
              value={ambientSpeed}
              onChange={(e) => {
                const next = Math.max(1, Math.min(10, Number(e.target.value) || 1))
                setAmbientSpeed(next)
                queueParam('setambientspeed', next)
              }}
              className="range-number-input"
              aria-label="Speed value"
            />
          </div>
          <label htmlFor="ambientIntensity">Intensity (1–100)</label>
          <div className="range-with-input">
            <input
              type="range"
              id="ambientIntensity"
              min={1}
              max={100}
              value={ambientIntensity}
              onChange={(e) => {
                const next = Number(e.target.value)
                setAmbientIntensity(next)
                queueParam('setambientintensity', next)
              }}
              aria-valuemin={1}
              aria-valuemax={100}
              aria-valuenow={ambientIntensity}
            />
            <input
              type="number"
              min={1}
              max={100}
              value={ambientIntensity}
              onChange={(e) => {
                const next = Math.max(1, Math.min(100, Number(e.target.value) || 1))
                setAmbientIntensity(next)
                queueParam('setambientintensity', next)
              }}
              className="range-number-input"
              aria-label="Intensity value"
            />
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
                await applyDefaults(AMBIENT_DEFAULTS)
                await refresh()
                setMessage('Ambient settings reset to defaults')
              } catch (err) {
                setMessage(err.message || 'Failed to reset')
              } finally {
                setResetting(false)
              }
            }}
          >
            {resetting ? 'Resetting…' : 'Reset to default'}
          </button>
        </div>
        {message && <p className="form-message">{message}</p>}
      </section>
    </div>
  )
}
