import { useEffect, useRef, useState } from 'react'
import ModeControls from '../components/ModeControls.jsx'
import ColorControls from '../components/ColorControls.jsx'
import ParamSetter from '../components/ParamSetter.jsx'
import useDeviceParams from '../hooks/useDeviceParams.js'
import { api } from '../api/client.js'
import { readNumber } from '../utils/paramUtils.js'
import { useUiSettings } from '../contexts/UiSettingsContext.jsx'
import { applyDefaults } from '../utils/applyDefaults.js'
import { COLOR_MOTION_DEFAULTS } from '../utils/paramDefaults.js'

export default function ColorMotionPage() {
  const { params, refresh } = useDeviceParams()
  const [message, setMessage] = useState('')
  const [resetting, setResetting] = useState(false)
  const { advanced } = useUiSettings()
  const timersRef = useRef({})

  const [colorPreset, setColorPreset] = useState(1)
  const [brightnessPreset, setBrightnessPreset] = useState(1)
  const [motionPreset, setMotionPreset] = useState(1)
  const [colorRed, setColorRed] = useState(255)
  const [colorGreen, setColorGreen] = useState(255)
  const [colorBlue, setColorBlue] = useState(255)
  const [colorBoost, setColorBoost] = useState(0)
  const [colorBoostBalance, setColorBoostBalance] = useState(0)
  const [colorBoostMin, setColorBoostMin] = useState(0)
  const [colorBoostRed, setColorBoostRed] = useState(100)
  const [colorBoostGreen, setColorBoostGreen] = useState(100)
  const [colorBoostBlue, setColorBoostBlue] = useState(100)
  const [colorBoostThreshold, setColorBoostThreshold] = useState(0)
  const [colorValueGain, setColorValueGain] = useState(100)
  const [brightness, setBrightness] = useState(255)
  const [minimumLuminosity, setMinimumLuminosity] = useState(0)
  const [frameSmoothing, setFrameSmoothing] = useState(0)
  const [frameLength, setFrameLength] = useState(10)
  const [frameDelay, setFrameDelay] = useState(40)

  useEffect(() => {
    if (!params) return
    setColorPreset(readNumber(params, 'colorpreset', 1))
    setBrightnessPreset(readNumber(params, 'brightnesspreset', 1))
    setMotionPreset(readNumber(params, 'motionpreset', 1))
    setColorRed(readNumber(params, 'colorred', 255))
    setColorGreen(readNumber(params, 'colorgreen', 255))
    setColorBlue(readNumber(params, 'colorblue', 255))
    setColorBoost(readNumber(params, 'colorboost', 0))
    setColorBoostBalance(readNumber(params, 'colorboostbalance', 0))
    setColorBoostMin(readNumber(params, 'colorboostmin', 0))
    setColorBoostRed(readNumber(params, 'colorboostred', 100))
    setColorBoostGreen(readNumber(params, 'colorboostgreen', 100))
    setColorBoostBlue(readNumber(params, 'colorboostblue', 100))
    setColorBoostThreshold(readNumber(params, 'colorboostthreshold', 0))
    setColorValueGain(readNumber(params, 'colorvaluegain', 100))
    setBrightness(readNumber(params, 'brightness', 255))
    setMinimumLuminosity(readNumber(params, 'minimumluminosity', 0))
    setFrameSmoothing(readNumber(params, 'framesmoothing', 0))
    setFrameLength(readNumber(params, 'framelength', 10))
    setFrameDelay(readNumber(params, 'framedelay', 40))
  }, [params])

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
        setMessage(err.message || 'Failed to update settings')
      }
    }, 300)
  }

  const queuePreset = (param, value) => {
    if (timersRef.current[param]) {
      clearTimeout(timersRef.current[param])
    }
    timersRef.current[param] = setTimeout(async () => {
      setMessage('')
      try {
        const result = await api.setPreset(param, value)
        setMessage(result)
      } catch (err) {
        setMessage(err.message || 'Failed to update presets')
      }
    }, 300)
  }

  return (
    <div className="page">
      <h1>Color & Motion</h1>
      <ModeControls />
      <div className="card-grid">
        <ColorControls />
      </div>
      <section className="card">
        <header className="card-header">
          <h2>Presets</h2>
        </header>
        <div className="form-grid">
          <label htmlFor="colorPreset">Color Preset</label>
          <select
            id="colorPreset"
            value={colorPreset}
            onChange={(event) => {
              const next = Number(event.target.value)
              setColorPreset(next)
              queuePreset('setcolorpreset', next)
            }}
          >
            <option value={1}>Normal</option>
            <option value={2}>Colorful</option>
            <option value={3}>Extra Colorful</option>
            <option value={4}>Extreme Colorful</option>
            <option value={999}>Custom</option>
          </select>
          <label htmlFor="brightnessPreset">Brightness Preset</label>
          <select
            id="brightnessPreset"
            value={brightnessPreset}
            onChange={(event) => {
              const next = Number(event.target.value)
              setBrightnessPreset(next)
              queuePreset('setbrightnesspreset', next)
            }}
          >
            <option value={1}>Low</option>
            <option value={2}>Medium</option>
            <option value={3}>Normal</option>
            <option value={4}>High</option>
            <option value={5}>Extra High</option>
            <option value={6}>Extreme High</option>
            <option value={999}>Custom</option>
          </select>
          <label htmlFor="motionPreset">Motion Preset</label>
          <select
            id="motionPreset"
            value={motionPreset}
            onChange={(event) => {
              const next = Number(event.target.value)
              setMotionPreset(next)
              queuePreset('setmotionpreset', next)
            }}
          >
            <option value={1}>Direct</option>
            <option value={2}>Normal</option>
            <option value={3}>Smooth</option>
            <option value={4}>Extra Smooth</option>
            <option value={5}>Extreme Smooth</option>
            <option value={999}>Custom</option>
          </select>
        </div>
      </section>
      <section className="card">
        <header className="card-header">
          <h2>Color Calibration</h2>
        </header>
        <div className="color-grid">
          <div className="form-grid">
          <label htmlFor="colorRed">Red</label>
          <input
            id="colorRed"
            type="range"
            min="1"
            max="255"
            value={colorRed}
            onChange={(event) => {
              const next = Number(event.target.value)
              setColorRed(next)
              queueParam('setcolorred', next)
            }}
            className="range-red"
          />
          <div className="muted">{colorRed}</div>
          </div>
          <div className="form-grid">
          <label htmlFor="colorGreen">Green</label>
          <input
            id="colorGreen"
            type="range"
            min="1"
            max="255"
            value={colorGreen}
            onChange={(event) => {
              const next = Number(event.target.value)
              setColorGreen(next)
              queueParam('setcolorgreen', next)
            }}
            className="range-green"
          />
          <div className="muted">{colorGreen}</div>
          </div>
          <div className="form-grid">
          <label htmlFor="colorBlue">Blue</label>
          <input
            id="colorBlue"
            type="range"
            min="1"
            max="255"
            value={colorBlue}
            onChange={(event) => {
              const next = Number(event.target.value)
              setColorBlue(next)
              queueParam('setcolorblue', next)
            }}
            className="range-blue"
          />
          <div className="muted">{colorBlue}</div>
          </div>
        </div>
      </section>
      <section className="card">
        <header className="card-header">
          <h2>Color Boost</h2>
        </header>
        <div className="color-grid">
          <div className="form-grid">
          <label htmlFor="colorBoost">Color Boost</label>
          <input
            id="colorBoost"
            type="range"
            min="0"
            max="100"
            step="5"
            value={colorBoost}
            onChange={(event) => {
              const next = Number(event.target.value)
              setColorBoost(next)
              queueParam('setcolorboost', next)
            }}
            className="range-yellow"
          />
          <div className="muted">{colorBoost}</div>
          </div>
          <div className="form-grid">
          <label htmlFor="colorBoostBalance">Boost Balance</label>
          <input
            id="colorBoostBalance"
            type="range"
            min="0"
            max="100"
            step="5"
            value={colorBoostBalance}
            onChange={(event) => {
              const next = Number(event.target.value)
              setColorBoostBalance(next)
              queueParam('setcolorboostbalance', next)
            }}
            className="range-cyan"
          />
          <div className="muted">{colorBoostBalance}</div>
          </div>
          <div className="form-grid">
          <label htmlFor="colorBoostMin">Boost Smoothing</label>
          <input
            id="colorBoostMin"
            type="range"
            min="0"
            max="100"
            step="5"
            value={colorBoostMin}
            onChange={(event) => {
              const next = Number(event.target.value)
              setColorBoostMin(next)
              queueParam('setcolorboostmin', next)
            }}
            className="range-gray"
          />
          <div className="muted">{colorBoostMin}</div>
          </div>
          <div className="form-grid">
          <label htmlFor="colorBoostThreshold">Boost Threshold</label>
          <input
            id="colorBoostThreshold"
            type="range"
            min="0"
            max="255"
            step="5"
            value={colorBoostThreshold}
            onChange={(event) => {
              const next = Number(event.target.value)
              setColorBoostThreshold(next)
              queueParam('setcolorboostthreshold', next)
            }}
            className="range-purple"
          />
          <div className="muted">{colorBoostThreshold}</div>
          </div>
          <div className="form-grid">
          <label htmlFor="colorBoostRed">Red Boost</label>
          <input
            id="colorBoostRed"
            type="range"
            min="5"
            max="100"
            step="5"
            value={colorBoostRed}
            onChange={(event) => {
              const next = Number(event.target.value)
              setColorBoostRed(next)
              queueParam('setcolorboostred', next)
            }}
            className="range-red"
          />
          <div className="muted">{colorBoostRed}</div>
          </div>
          <div className="form-grid">
          <label htmlFor="colorBoostGreen">Green Boost</label>
          <input
            id="colorBoostGreen"
            type="range"
            min="5"
            max="100"
            step="5"
            value={colorBoostGreen}
            onChange={(event) => {
              const next = Number(event.target.value)
              setColorBoostGreen(next)
              queueParam('setcolorboostgreen', next)
            }}
            className="range-green"
          />
          <div className="muted">{colorBoostGreen}</div>
          </div>
          <div className="form-grid">
          <label htmlFor="colorBoostBlue">Blue Boost</label>
          <input
            id="colorBoostBlue"
            type="range"
            min="5"
            max="100"
            step="5"
            value={colorBoostBlue}
            onChange={(event) => {
              const next = Number(event.target.value)
              setColorBoostBlue(next)
              queueParam('setcolorboostblue', next)
            }}
            className="range-blue"
          />
          <div className="muted">{colorBoostBlue}</div>
          </div>
        </div>
      </section>
      <section className="card">
        <header className="card-header">
          <h2>Brightness</h2>
        </header>
        <div className="color-grid">
          <div className="form-grid">
          <label htmlFor="brightness">Brightness</label>
          <input
            id="brightness"
            type="range"
            min="5"
            max="255"
            step="5"
            value={brightness}
            onChange={(event) => {
              const next = Number(event.target.value)
              setBrightness(next)
              queueParam('setbrightness', next)
            }}
            className="range-yellow"
          />
          <div className="muted">{brightness}</div>
          </div>
          <div className="form-grid">
          <label htmlFor="colorValueGain">Value Gain</label>
          <input
            id="colorValueGain"
            type="range"
            min="100"
            max="500"
            step="5"
            value={colorValueGain}
            onChange={(event) => {
              const next = Number(event.target.value)
              setColorValueGain(next)
              queueParam('setcolorvaluegain', next)
            }}
            className="range-cyan"
          />
          <div className="muted">{colorValueGain}</div>
          </div>
          <div className="form-grid">
          <label htmlFor="minimumLuminosity">Minimum Luminosity</label>
          <input
            id="minimumLuminosity"
            type="range"
            min="0"
            max="255"
            step="5"
            value={minimumLuminosity}
            onChange={(event) => {
              const next = Number(event.target.value)
              setMinimumLuminosity(next)
              queueParam('setminimumluminosity', next)
            }}
            className="range-gray"
          />
          <div className="muted">{minimumLuminosity}</div>
          </div>
        </div>
      </section>
      <section className="card">
        <header className="card-header">
          <h2>Motion</h2>
        </header>
        <div className="color-grid">
          <div className="form-grid">
          <label htmlFor="frameSmoothing">Frame Smoothing</label>
          <input
            id="frameSmoothing"
            type="range"
            min="0"
            max="30"
            step="1"
            value={frameSmoothing}
            onChange={(event) => {
              const next = Number(event.target.value)
              setFrameSmoothing(next)
              queueParam('setframesmoothing', next)
            }}
            className="range-gray"
          />
          <div className="muted">{frameSmoothing}</div>
          </div>
          <div className="form-grid">
          <label htmlFor="frameLength">Frame Length (ms)</label>
          <input
            id="frameLength"
            type="range"
            min="10"
            max="100"
            step="5"
            value={frameLength}
            onChange={(event) => {
              const next = Number(event.target.value)
              setFrameLength(next)
              queueParam('setframelength', next)
            }}
            className="range-cyan"
          />
          <div className="muted">{frameLength}</div>
          </div>
          <div className="form-grid">
          <label htmlFor="frameDelay">Frame Delay (ms)</label>
          <input
            id="frameDelay"
            type="range"
            min="10"
            max="1000"
            step="5"
            value={frameDelay}
            onChange={(event) => {
              const next = Number(event.target.value)
              setFrameDelay(next)
              queueParam('setframedelay', next)
            }}
            className="range-purple"
          />
          <div className="muted">{frameDelay}</div>
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
                await applyDefaults(COLOR_MOTION_DEFAULTS)
                await refresh()
                setMessage('Color & motion reset to defaults')
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
      </section>
      {message && <div className="muted">{message}</div>}
      {advanced && <ParamSetter />}
    </div>
  )
}
