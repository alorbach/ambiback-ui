import { useEffect, useState } from 'react'
import ModeControls from '../components/ModeControls.jsx'
import ColorControls from '../components/ColorControls.jsx'
import ParamSetter from '../components/ParamSetter.jsx'
import useDeviceParams from '../hooks/useDeviceParams.js'
import { api } from '../api/client.js'
import { readNumber } from '../utils/paramUtils.js'

export default function ColorMotionPage() {
  const { params } = useDeviceParams()
  const [message, setMessage] = useState('')

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

  const applyParams = async (pairs) => {
    setMessage('')
    try {
      for (const [param, value] of pairs) {
        await api.setParam(param, value)
      }
      setMessage('Settings updated')
    } catch (err) {
      setMessage(err.message || 'Failed to update settings')
    }
  }

  const applyPresets = async () => {
    setMessage('')
    try {
      await api.setPreset('setcolorpreset', colorPreset)
      await api.setPreset('setbrightnesspreset', brightnessPreset)
      await api.setPreset('setmotionpreset', motionPreset)
      setMessage('Presets updated')
    } catch (err) {
      setMessage(err.message || 'Failed to update presets')
    }
  }

  return (
    <div className="page">
      <h1>Color & Motion</h1>
      <div className="card-grid">
        <ModeControls />
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
            onChange={(event) => setColorPreset(Number(event.target.value))}
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
            onChange={(event) => setBrightnessPreset(Number(event.target.value))}
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
            onChange={(event) => setMotionPreset(Number(event.target.value))}
          >
            <option value={1}>Direct</option>
            <option value={2}>Normal</option>
            <option value={3}>Smooth</option>
            <option value={4}>Extra Smooth</option>
            <option value={5}>Extreme Smooth</option>
            <option value={999}>Custom</option>
          </select>
        </div>
        <button type="button" onClick={applyPresets}>
          Apply Presets
        </button>
      </section>
      <section className="card">
        <header className="card-header">
          <h2>Color Calibration</h2>
        </header>
        <div className="form-grid">
          <label htmlFor="colorRed">Red</label>
          <input
            id="colorRed"
            type="range"
            min="1"
            max="255"
            value={colorRed}
            onChange={(event) => setColorRed(Number(event.target.value))}
          />
          <div className="muted">{colorRed}</div>
          <label htmlFor="colorGreen">Green</label>
          <input
            id="colorGreen"
            type="range"
            min="1"
            max="255"
            value={colorGreen}
            onChange={(event) => setColorGreen(Number(event.target.value))}
          />
          <div className="muted">{colorGreen}</div>
          <label htmlFor="colorBlue">Blue</label>
          <input
            id="colorBlue"
            type="range"
            min="1"
            max="255"
            value={colorBlue}
            onChange={(event) => setColorBlue(Number(event.target.value))}
          />
          <div className="muted">{colorBlue}</div>
        </div>
        <button
          type="button"
          onClick={() =>
            applyParams([
              ['setcolorred', colorRed],
              ['setcolorgreen', colorGreen],
              ['setcolorblue', colorBlue],
            ])
          }
        >
          Apply Calibration
        </button>
      </section>
      <section className="card">
        <header className="card-header">
          <h2>Color Boost</h2>
        </header>
        <div className="form-grid">
          <label htmlFor="colorBoost">Color Boost</label>
          <input
            id="colorBoost"
            type="range"
            min="0"
            max="100"
            step="5"
            value={colorBoost}
            onChange={(event) => setColorBoost(Number(event.target.value))}
          />
          <div className="muted">{colorBoost}</div>
          <label htmlFor="colorBoostBalance">Boost Balance</label>
          <input
            id="colorBoostBalance"
            type="range"
            min="0"
            max="100"
            step="5"
            value={colorBoostBalance}
            onChange={(event) => setColorBoostBalance(Number(event.target.value))}
          />
          <div className="muted">{colorBoostBalance}</div>
          <label htmlFor="colorBoostMin">Boost Smoothing</label>
          <input
            id="colorBoostMin"
            type="range"
            min="0"
            max="100"
            step="5"
            value={colorBoostMin}
            onChange={(event) => setColorBoostMin(Number(event.target.value))}
          />
          <div className="muted">{colorBoostMin}</div>
          <label htmlFor="colorBoostThreshold">Boost Threshold</label>
          <input
            id="colorBoostThreshold"
            type="range"
            min="0"
            max="255"
            step="5"
            value={colorBoostThreshold}
            onChange={(event) => setColorBoostThreshold(Number(event.target.value))}
          />
          <div className="muted">{colorBoostThreshold}</div>
          <label htmlFor="colorBoostRed">Red Boost</label>
          <input
            id="colorBoostRed"
            type="range"
            min="5"
            max="100"
            step="5"
            value={colorBoostRed}
            onChange={(event) => setColorBoostRed(Number(event.target.value))}
          />
          <div className="muted">{colorBoostRed}</div>
          <label htmlFor="colorBoostGreen">Green Boost</label>
          <input
            id="colorBoostGreen"
            type="range"
            min="5"
            max="100"
            step="5"
            value={colorBoostGreen}
            onChange={(event) => setColorBoostGreen(Number(event.target.value))}
          />
          <div className="muted">{colorBoostGreen}</div>
          <label htmlFor="colorBoostBlue">Blue Boost</label>
          <input
            id="colorBoostBlue"
            type="range"
            min="5"
            max="100"
            step="5"
            value={colorBoostBlue}
            onChange={(event) => setColorBoostBlue(Number(event.target.value))}
          />
          <div className="muted">{colorBoostBlue}</div>
        </div>
        <button
          type="button"
          onClick={() =>
            applyParams([
              ['setcolorboost', colorBoost],
              ['setcolorboostbalance', colorBoostBalance],
              ['setcolorboostmin', colorBoostMin],
              ['setcolorboostthreshold', colorBoostThreshold],
              ['setcolorboostred', colorBoostRed],
              ['setcolorboostgreen', colorBoostGreen],
              ['setcolorboostblue', colorBoostBlue],
            ])
          }
        >
          Apply Color Boost
        </button>
      </section>
      <section className="card">
        <header className="card-header">
          <h2>Brightness</h2>
        </header>
        <div className="form-grid">
          <label htmlFor="brightness">Brightness</label>
          <input
            id="brightness"
            type="range"
            min="5"
            max="255"
            step="5"
            value={brightness}
            onChange={(event) => setBrightness(Number(event.target.value))}
          />
          <div className="muted">{brightness}</div>
          <label htmlFor="colorValueGain">Value Gain</label>
          <input
            id="colorValueGain"
            type="range"
            min="100"
            max="500"
            step="5"
            value={colorValueGain}
            onChange={(event) => setColorValueGain(Number(event.target.value))}
          />
          <div className="muted">{colorValueGain}</div>
          <label htmlFor="minimumLuminosity">Minimum Luminosity</label>
          <input
            id="minimumLuminosity"
            type="range"
            min="0"
            max="255"
            step="5"
            value={minimumLuminosity}
            onChange={(event) => setMinimumLuminosity(Number(event.target.value))}
          />
          <div className="muted">{minimumLuminosity}</div>
        </div>
        <button
          type="button"
          onClick={() =>
            applyParams([
              ['setbrightness', brightness],
              ['setcolorvaluegain', colorValueGain],
              ['setminimumluminosity', minimumLuminosity],
            ])
          }
        >
          Apply Brightness
        </button>
      </section>
      <section className="card">
        <header className="card-header">
          <h2>Motion</h2>
        </header>
        <div className="form-grid">
          <label htmlFor="frameSmoothing">Frame Smoothing</label>
          <input
            id="frameSmoothing"
            type="range"
            min="0"
            max="30"
            step="1"
            value={frameSmoothing}
            onChange={(event) => setFrameSmoothing(Number(event.target.value))}
          />
          <div className="muted">{frameSmoothing}</div>
          <label htmlFor="frameLength">Frame Length (ms)</label>
          <input
            id="frameLength"
            type="range"
            min="10"
            max="100"
            step="5"
            value={frameLength}
            onChange={(event) => setFrameLength(Number(event.target.value))}
          />
          <div className="muted">{frameLength}</div>
          <label htmlFor="frameDelay">Frame Delay (ms)</label>
          <input
            id="frameDelay"
            type="range"
            min="10"
            max="1000"
            step="5"
            value={frameDelay}
            onChange={(event) => setFrameDelay(Number(event.target.value))}
          />
          <div className="muted">{frameDelay}</div>
        </div>
        <button
          type="button"
          onClick={() =>
            applyParams([
              ['setframesmoothing', frameSmoothing],
              ['setframelength', frameLength],
              ['setframedelay', frameDelay],
            ])
          }
        >
          Apply Motion Settings
        </button>
      </section>
      {message && <div className="muted">{message}</div>}
      <ParamSetter />
    </div>
  )
}
