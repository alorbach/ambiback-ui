import { useEffect, useState } from 'react'
import useDevice from '../hooks/useDevice.js'
import useDeviceParams from '../hooks/useDeviceParams.js'
import { useUiSettings } from '../contexts/UiSettingsContext.jsx'
import { api } from '../api/client.js'
import { readBool, readNumber } from '../utils/paramUtils.js'
import { applyDefaults } from '../utils/applyDefaults.js'
import { CAMERA_DEFAULTS } from '../utils/paramDefaults.js'
import CameraCalibrationCard from '../components/CameraCalibrationCard.jsx'

const CAM_GAINCEILING_OPTIONS = [
  { value: 0, label: 'Gainceiling x2' },
  { value: 1, label: 'Gainceiling x4' },
  { value: 2, label: 'Gainceiling x8' },
  { value: 3, label: 'Gainceiling x16' },
  { value: 4, label: 'Gainceiling x32' },
  { value: 5, label: 'Gainceiling x64' },
  { value: 6, label: 'Gainceiling x128' },
]

const CAM_RESOLUTION_OPTIONS = [
  { value: 0, label: '160×120' },
  { value: 1, label: '128×160' },
  { value: 2, label: '176×144' },
  { value: 3, label: '240×176' },
  { value: 4, label: '320×240' },
  { value: 5, label: '400×296' },
]

const CAM_FLICKER_OPTIONS = [
  { value: 0, label: 'Auto' },
  { value: 1, label: '50 Hz' },
  { value: 2, label: '60 Hz' },
]

const CAM_PERFORMANCE_OPTIONS = [
  { value: 0, label: '50 fps' },
  { value: 1, label: '45 fps' },
  { value: 2, label: '40 fps' },
  { value: 3, label: '35 fps' },
  { value: 4, label: '30 fps' },
  { value: 5, label: '25 fps' },
  { value: 6, label: '20 fps' },
]

const CAM_FREQ_OPTIONS = [
  { value: 0, label: '10 MHz' },
  { value: 1, label: '12 MHz' },
  { value: 2, label: '14 MHz' },
  { value: 3, label: '16 MHz' },
  { value: 4, label: '18 MHz' },
  { value: 5, label: '20 MHz' },
  { value: 6, label: '22 MHz' },
  { value: 7, label: '24 MHz' },
  { value: 8, label: '25 MHz' },
  { value: 9, label: '26 MHz' },
  { value: 10, label: '27 MHz' },
]

const CAM_FB_COUNT_OPTIONS = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5' },
]

const CAM_SPECIAL_EFFECT_OPTIONS = [
  { value: 0, label: 'No effect' },
  { value: 1, label: 'Negative' },
  { value: 2, label: 'Black and white' },
  { value: 3, label: 'Reddish' },
  { value: 4, label: 'Greenish' },
  { value: 5, label: 'Blue' },
  { value: 6, label: 'Retro' },
]

const CAM_WB_MODE_OPTIONS = [
  { value: 0, label: 'Default' },
  { value: 1, label: 'Sunny' },
  { value: 2, label: 'Cloudy' },
  { value: 3, label: 'Office' },
  { value: 4, label: 'Home' },
]

const CAM_LEVEL_OPTIONS = [
  { value: -2, label: '-2' },
  { value: -1, label: '-1' },
  { value: 0, label: '0' },
  { value: 1, label: '1' },
  { value: 2, label: '2' },
]

const CAM_DETAIL_LEVEL_OPTIONS = [3, 5, 7, 9, 11, 13, 15].map((v) => ({ value: v, label: String(v) }))

const CAM_AUTO_OFF_DELAY_OPTIONS = [
  { value: 5, label: '5 s' },
  { value: 10, label: '10 s' },
  { value: 15, label: '15 s' },
  { value: 20, label: '20 s' },
  { value: 30, label: '30 s' },
  { value: 60, label: '60 s' },
  { value: 120, label: '120 s' },
]

const CAM_SMOOTH_OPTIONS = [
  { value: 0, label: 'Disabled' },
  { value: 1, label: 'Low' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'High' },
  { value: 255, label: 'Custom' },
]

const CAM_WHITEBALANCE_PRESET_OPTIONS = [
  { value: 1, label: 'Default Whitebalance' },
  { value: 2, label: 'Sunny Whitebalance' },
  { value: 3, label: 'Cloudy Whitebalance' },
  { value: 4, label: 'Sunny Colorful Whitebalance' },
  { value: 5, label: 'Office Whitebalance' },
  { value: 6, label: 'Manual Whitebalance' },
  { value: 999, label: 'Custom Settings' },
]

const CAM_EXPOSURE_PRESET_OPTIONS = [
  { value: 7, label: 'Adaptive TV Mode 1 (Raw Gamma)' },
  { value: 1, label: 'Adaptive TV Mode 2 (Lens Correction)' },
  { value: 2, label: 'Adaptive TV Mode 3 (Default)' },
  { value: 8, label: 'Adaptive TV Mode 4 (Raw Gamma & Lens)' },
  { value: 6, label: 'TEST Auto Sensor Control' },
  { value: 3, label: 'TEST Manual Normal' },
  { value: 4, label: 'TEST Manual Bright' },
  { value: 5, label: 'TEST Manual Very bright' },
  { value: 999, label: 'Custom Settings' },
]

const CAM_INNER_PRESET_OPTIONS = [
  { value: 1, label: 'Very minimal' },
  { value: 2, label: 'Minimal' },
  { value: 3, label: 'Normal' },
  { value: 4, label: 'Large' },
  { value: 5, label: 'Very large' },
  { value: 999, label: 'Custom Settings' },
]

const CAM_COLOR_PRESET_OPTIONS = [
  { value: 1, label: 'Normal' },
  { value: 2, label: 'Colorful' },
  { value: 3, label: 'Extra Colorful' },
  { value: 4, label: 'Extreme Colorful' },
  { value: 999, label: 'Custom Settings' },
]

const CAM_BRIGHTNESS_PRESET_OPTIONS = [
  { value: 1, label: 'Low' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'Normal' },
  { value: 4, label: 'High' },
  { value: 5, label: 'Extra High' },
  { value: 6, label: 'Extreme High' },
  { value: 999, label: 'Custom Settings' },
]

export default function CameraPage() {
  const { baseUrl } = useDevice()
  const { params, refresh } = useDeviceParams()
  const { advanced } = useUiSettings()
  const [message, setMessage] = useState('')
  const [resetting, setResetting] = useState(false)
  const [camMode, setCamMode] = useState(0)
  const [camPerformance, setCamPerformance] = useState(0)
  const [camResolution, setCamResolution] = useState(0)
  const [camFreq, setCamFreq] = useState(5)
  const [camFbCount, setCamFbCount] = useState(2)
  const [camFlicker, setCamFlicker] = useState(0)
  const [camDetailLevel, setCamDetailLevel] = useState(0)
  const [camInnerHori, setCamInnerHori] = useState(0)
  const [camInnerVert, setCamInnerVert] = useState(0)
  const [camSmoothMode, setCamSmoothMode] = useState(0)
  const [camSmoothEnable, setCamSmoothEnable] = useState(false)
  const [camSmoothMaxFrames, setCamSmoothMaxFrames] = useState(0)
  const [camSmoothMaxDiff, setCamSmoothMaxDiff] = useState(0)
  const [camAutoOnOff, setCamAutoOnOff] = useState(false)
  const [camAutoOnOffDelay, setCamAutoOnOffDelay] = useState(15)
  const [camColorRed, setCamColorRed] = useState(255)
  const [camColorGreen, setCamColorGreen] = useState(255)
  const [camColorBlue, setCamColorBlue] = useState(255)
  const [camActivationThreshold, setCamActivationThreshold] = useState(0)
  const [camBlackThresholdSmooth, setCamBlackThresholdSmooth] = useState(0)
  const [camBlackRemoveThreshold, setCamBlackRemoveThreshold] = useState(0)
  const [camMinPixelAmount, setCamMinPixelAmount] = useState(0)
  const [camContrast, setCamContrast] = useState(0)
  const [camBrightness, setCamBrightness] = useState(0)
  const [camSaturation, setCamSaturation] = useState(0)
  const [camQuality, setCamQuality] = useState(0)
  const [camSpecialEffect, setCamSpecialEffect] = useState(0)
  const [camWbMode, setCamWbMode] = useState(0)
  const [camAwbGainControl, setCamAwbGainControl] = useState(false)
  const [camHMirror, setCamHMirror] = useState(false)
  const [camVFlip, setCamVFlip] = useState(false)
  const [camHighQuality, setCamHighQuality] = useState(false)
  const [camBpc, setCamBpc] = useState(false)
  const [camWpc, setCamWpc] = useState(false)
  const [camDenoise, setCamDenoise] = useState(false)
  const [camLenc, setCamLenc] = useState(false)
  const [camRawGma, setCamRawGma] = useState(false)
  const [camDcw, setCamDcw] = useState(false)
  const [camAec, setCamAec] = useState(false)
  const [camAec2, setCamAec2] = useState(false)
  const [camAeLevels, setCamAeLevels] = useState(0)
  const [camAecValue, setCamAecValue] = useState(0)
  const [camAecMinValue, setCamAecMinValue] = useState(0)
  const [camAecMaxValue, setCamAecMaxValue] = useState(0)
  const [camAdptExp, setCamAdptExp] = useState(false)
  const [camAdptGain, setCamAdptGain] = useState(false)
  const [camAdptGainDown, setCamAdptGainDown] = useState(0)
  const [camAdptGainUp, setCamAdptGainUp] = useState(0)
  const [camAdptGainMax, setCamAdptGainMax] = useState(0)
  const [camWhiteActThreshold, setCamWhiteActThreshold] = useState(0)
  const [camWhiteBeforeActThreshold, setCamWhiteBeforeActThreshold] = useState(0)
  const [camWhiteMinAmount, setCamWhiteMinAmount] = useState(0)
  const [camAdaptiveChangePercent, setCamAdaptiveChangePercent] = useState(0)
  const [camAdaptiveChangeDelay, setCamAdaptiveChangeDelay] = useState(0)
  const [camPreset, setCamPreset] = useState(3)
  const [camExposurePreset, setCamExposurePreset] = useState(2)
  const [camInnerPreset, setCamInnerPreset] = useState(3)
  const [colorPreset, setColorPreset] = useState(1)
  const [brightnessPreset, setBrightnessPreset] = useState(3)
  const [colorBoost, setColorBoost] = useState(0)
  const [colorBoostBalance, setColorBoostBalance] = useState(50)
  const [colorBoostMin, setColorBoostMin] = useState(0)
  const [colorBoostThreshold, setColorBoostThreshold] = useState(0)
  const [colorBoostRed, setColorBoostRed] = useState(100)
  const [colorBoostGreen, setColorBoostGreen] = useState(100)
  const [colorBoostBlue, setColorBoostBlue] = useState(100)
  const [colorValueGain, setColorValueGain] = useState(100)
  const [minimumLuminosity, setMinimumLuminosity] = useState(0)
  const [camWhitebalance, setCamWhitebalance] = useState(true)
  const [camOverclock, setCamOverclock] = useState(false)
  const [camColorbar, setCamColorbar] = useState(false)
  const [camGainceilingSensor, setCamGainceilingSensor] = useState(0)

  const hasParam = (key) => params && Object.prototype.hasOwnProperty.call(params, key)

  useEffect(() => {
    if (!params) return
    setCamMode(readNumber(params, 'cammode', 0))
    setCamPerformance(readNumber(params, 'camperformance', 0))
    setCamResolution(readNumber(params, 'camresolution', 0))
    setCamFreq(readNumber(params, 'camfreq', 5))
    setCamFbCount(readNumber(params, 'camfbcount', 2))
    setCamFlicker(readNumber(params, 'camflicker', 0))
    setCamDetailLevel(readNumber(params, 'camdetaillevel', 0))
    setCamInnerHori(readNumber(params, 'caminnerhori', 0))
    setCamInnerVert(readNumber(params, 'caminnervert', 0))
    setCamSmoothMode(readNumber(params, 'camsmoothmode', 0))
    setCamSmoothEnable(readBool(params, 'camsmoothenable', false))
    setCamSmoothMaxFrames(readNumber(params, 'camsmoothmaxframes', 0))
    setCamSmoothMaxDiff(readNumber(params, 'camsmoothmaxdiff', 0))
    setCamAutoOnOff(readBool(params, 'camautoonoff', false))
    setCamAutoOnOffDelay(readNumber(params, 'camautoonoffdelay', 15))
    setCamColorRed(readNumber(params, 'camcolorcorred', 255))
    setCamColorGreen(readNumber(params, 'camcolorcorgreen', 255))
    setCamColorBlue(readNumber(params, 'camcolorcorblue', 255))
    setCamActivationThreshold(readNumber(params, 'camcoloractivationthreshold', 0))
    setCamBlackThresholdSmooth(readNumber(params, 'camcolorblackthresholdsmoothing', 0))
    setCamBlackRemoveThreshold(readNumber(params, 'camcolorblackremovethreshold', 0))
    setCamMinPixelAmount(readNumber(params, 'camminpixelamount', 0))
    setCamContrast(readNumber(params, 'camcontrast', 0))
    setCamBrightness(readNumber(params, 'cambrightness', 0))
    setCamSaturation(readNumber(params, 'camsaturation', 0))
    setCamQuality(readNumber(params, 'camquality', 0))
    setCamSpecialEffect(readNumber(params, 'camspecialeffect', 0))
    setCamWbMode(readNumber(params, 'camwbmode', 0))
    setCamAwbGainControl(readBool(params, 'camawbgaincontrol', false))
    setCamHMirror(readBool(params, 'camhmirror', false))
    setCamVFlip(readBool(params, 'camvflip', false))
    setCamHighQuality(readBool(params, 'camhighquality', false))
    setCamBpc(readBool(params, 'cambpc', false))
    setCamWpc(readBool(params, 'camwpc', false))
    setCamDenoise(readBool(params, 'camdenoise', false))
    setCamLenc(readBool(params, 'camlenc', false))
    setCamRawGma(readBool(params, 'camrawgma', false))
    setCamDcw(readBool(params, 'camdcw', false))
    setCamAec(readBool(params, 'camaec', false))
    setCamAec2(readBool(params, 'camaec2', false))
    setCamAeLevels(readNumber(params, 'camaelevels', 0))
    setCamAecValue(readNumber(params, 'camaecvalue', 0))
    setCamAecMinValue(readNumber(params, 'camaecminvalue', 0))
    setCamAecMaxValue(readNumber(params, 'camaecmaxvalue', 0))
    setCamAdptExp(readBool(params, 'camadptexp', false))
    setCamAdptGain(readBool(params, 'camadptgain', false))
    setCamAdptGainDown(readNumber(params, 'camadptgaindown', 0))
    setCamAdptGainUp(readNumber(params, 'camadptgainup', 0))
    setCamAdptGainMax(readNumber(params, 'camadptgainmax', 0))
    setCamWhiteActThreshold(readNumber(params, 'camwhiteactthreshold', 0))
    setCamWhiteBeforeActThreshold(readNumber(params, 'camwhitebeforeactthreshold', 0))
    setCamWhiteMinAmount(readNumber(params, 'camwhiteminamount', 0))
    setCamAdaptiveChangePercent(readNumber(params, 'camadaptivechangepercent', 0))
    setCamAdaptiveChangeDelay(readNumber(params, 'camadaptivechangedelay', 0))
    setCamPreset(readNumber(params, 'campreset', 3))
    setCamExposurePreset(readNumber(params, 'camexposurepreset', 2))
    setCamInnerPreset(readNumber(params, 'caminnerpreset', 3))
    setColorPreset(readNumber(params, 'colorpreset', 1))
    setBrightnessPreset(readNumber(params, 'brightnesspreset', 3))
    setColorBoost(readNumber(params, 'colorboost', 0))
    setColorBoostBalance(readNumber(params, 'colorboostbalance', 50))
    setColorBoostMin(readNumber(params, 'colorboostmin', 0))
    setColorBoostThreshold(readNumber(params, 'colorboostthreshold', 0))
    setColorBoostRed(readNumber(params, 'colorboostred', 100))
    setColorBoostGreen(readNumber(params, 'colorboostgreen', 100))
    setColorBoostBlue(readNumber(params, 'colorboostblue', 100))
    setColorValueGain(readNumber(params, 'colorvaluegain', 100))
    setMinimumLuminosity(readNumber(params, 'minimumluminosity', 0))
    setCamWhitebalance(readBool(params, 'camawhitebalance', true))
    setCamOverclock(readBool(params, 'camoverclock', false))
    setCamColorbar(readBool(params, 'camcolorbar', false))
    setCamGainceilingSensor(readNumber(params, 'camagainceilingsensor', 0))
  }, [params])

  const applyParams = async (pairs) => {
    setMessage('')
    try {
      for (const [param, value] of pairs) {
        await api.setParam(param, value)
      }
      setMessage('Camera settings updated')
    } catch (err) {
      setMessage(err.message || 'Failed to update camera settings')
    }
  }

  const updateParam = async (param, value, successText = 'Saved') => {
    setMessage('')
    try {
      await api.setParam(param, value)
      setMessage(successText)
    } catch (err) {
      setMessage(err.message || 'Failed to update')
    }
  }

  return (
    <div className="page">
      <h1>Camera</h1>
      <CameraCalibrationCard
        baseUrl={baseUrl}
        params={params}
        refresh={refresh}
        onMessage={setMessage}
      />
      <details className="card card-collapsible" open>
        <summary className="card-collapsible-summary">
          <span className="card-collapsible-chevron" aria-hidden>▶</span>
          Camera Calibration Options
        </summary>
        <div className="card-collapsible-body">
          <div className="form-grid form-grid-pairs">
            <div className="form-field">
              <label htmlFor="camPreset">Whitebalance Mode</label>
              <div className="form-field-row">
                <select
                  id="camPreset"
                  value={camPreset}
                  onChange={async (e) => {
                    const v = Number(e.target.value)
                    setCamPreset(v)
                    try {
                      await api.setPreset('setcampreset', v)
                      setMessage('Whitebalance preset updated')
                      refresh()
                    } catch (err) {
                      setMessage(err.message || 'Failed to update preset')
                    }
                  }}
                >
                  {CAM_WHITEBALANCE_PRESET_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="button secondary"
                  onClick={async () => {
                    setMessage('')
                    try {
                      await applyDefaults([{ preset: true, param: 'setcampreset', value: 3 }])
                      await refresh()
                      setMessage('Whitebalance reset to default')
                    } catch (err) {
                      setMessage(err.message || 'Failed to reset')
                    }
                  }}
                >
                  Reset to default
                </button>
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="camExposurePreset">Lightexposure Calibration</label>
              <div className="form-field-row">
                <select
                  id="camExposurePreset"
                  value={camExposurePreset}
                  onChange={async (e) => {
                    const v = Number(e.target.value)
                    setCamExposurePreset(v)
                    try {
                      await api.setPreset('setcamexposurepreset', v)
                      setMessage('Exposure preset updated')
                      refresh()
                    } catch (err) {
                      setMessage(err.message || 'Failed to update preset')
                    }
                  }}
                >
                  {CAM_EXPOSURE_PRESET_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="button secondary"
                  onClick={async () => {
                    setMessage('')
                    try {
                      await applyDefaults([{ preset: true, param: 'setcamexposurepreset', value: 2 }])
                      await refresh()
                      setMessage('Exposure reset to default')
                    } catch (err) {
                      setMessage(err.message || 'Failed to reset')
                    }
                  }}
                >
                  Reset to default
                </button>
              </div>
            </div>
          </div>
          {camPreset === 999 && (
            <div className="form-grid form-grid-pairs" style={{ marginTop: '1rem' }}>
              <h3 className="form-section-title" style={{ gridColumn: '1 / -1' }}>
                Whitebalance Control Options (Custom)
              </h3>
              <div className="form-field">
                <label>
                  <input
                    type="checkbox"
                    checked={camWhitebalance}
                    onChange={async (e) => {
                      const v = e.target.checked
                      setCamWhitebalance(v)
                      try {
                        await api.setParam('setcamawhitebalance', v ? 1 : 0)
                        setMessage('Saved')
                        refresh()
                      } catch (err) {
                        setMessage(err.message || 'Failed')
                      }
                    }}
                  />
                  Enable/Disable Whitebalance
                </label>
              </div>
              <div className="form-field">
                <label>
                  <input
                    type="checkbox"
                    checked={camAwbGainControl}
                    onChange={async (e) => {
                      const v = e.target.checked
                      setCamAwbGainControl(v)
                      try {
                        await api.setParam('setcamawbgain', v ? 1 : 0)
                        setMessage('Saved')
                        refresh()
                      } catch (err) {
                        setMessage(err.message || 'Failed')
                      }
                    }}
                  />
                  Auto Whitebalance Gain Control
                </label>
              </div>
              <div className="form-field">
                <label htmlFor="camWbModeCustom">Whitebalance Mode</label>
                <select
                  id="camWbModeCustom"
                  value={camWbMode}
                  onChange={async (e) => {
                    const v = Number(e.target.value)
                    setCamWbMode(v)
                    try {
                      await api.setParam('setcamwbmode', v)
                      setMessage('Saved')
                      refresh()
                    } catch (err) {
                      setMessage(err.message || 'Failed')
                    }
                  }}
                >
                  <option value={0}>Default</option>
                  <option value={1}>Sunny</option>
                  <option value={2}>Cloudy</option>
                  <option value={3}>Office</option>
                  <option value={4}>Home</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </details>
      {advanced && (
      <details className="card card-collapsible">
        <summary className="card-collapsible-summary">
          <span className="card-collapsible-chevron" aria-hidden>▶</span>
          Camera Controls
        </summary>
        <div className="card-collapsible-body">
        <header className="card-header">
          <h2>General Camera Options</h2>
          <button
            type="button"
            className="button secondary"
            disabled={resetting}
            onClick={async () => {
              setResetting(true)
              setMessage('')
              try {
                await applyDefaults(CAMERA_DEFAULTS)
                await refresh()
                setMessage('Camera settings reset to defaults')
              } catch (err) {
                setMessage(err.message || 'Failed to reset camera settings')
              } finally {
                setResetting(false)
              }
            }}
          >
            {resetting ? 'Resetting…' : 'Reset to default'}
          </button>
        </header>
        <div className="form-grid form-grid-pairs">
          <div className="form-field">
            <label htmlFor="camMode">Mode</label>
            <select
              id="camMode"
              value={camMode}
              onChange={async (e) => {
                const v = Number(e.target.value)
                setCamMode(v)
                await updateParam('setcammode', v)
              }}
            >
              <option value={0}>Single Color</option>
              <option value={1}>Light Bar</option>
              <option value={2}>Detailed</option>
            </select>
          </div>
          {hasParam('camperformance') && (
            <div className="form-field">
              <label htmlFor="camPerformance">Performance</label>
              <select
                id="camPerformance"
                value={Math.max(0, Math.min(6, camPerformance))}
                onChange={(e) => setCamPerformance(Number(e.target.value))}
              >
                {CAM_PERFORMANCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          {hasParam('camresolution') && (
            <div className="form-field">
              <label htmlFor="camResolution">Resolution</label>
              <select
                id="camResolution"
                value={camResolution}
                onChange={(e) => setCamResolution(Number(e.target.value))}
              >
                {CAM_RESOLUTION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          {hasParam('camfreq') && (
            <div className="form-field">
              <label htmlFor="camFreq">Frequency (MHz)</label>
              <select
                id="camFreq"
                value={Math.max(0, Math.min(10, camFreq))}
                onChange={(e) => setCamFreq(Number(e.target.value))}
              >
                {CAM_FREQ_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          {hasParam('camfbcount') && (
            <div className="form-field">
              <label htmlFor="camFbCount">Frame Buffers</label>
              <select
                id="camFbCount"
                value={Math.max(1, Math.min(5, camFbCount))}
                onChange={(e) => setCamFbCount(Number(e.target.value))}
              >
                {CAM_FB_COUNT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          {hasParam('camflicker') && (
            <div className="form-field">
              <label htmlFor="camFlicker">Flicker Control</label>
              <select
                id="camFlicker"
                value={camFlicker}
                onChange={(e) => setCamFlicker(Number(e.target.value))}
              >
                {CAM_FLICKER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            const pairs = [['setcammode', camMode]]
            if (hasParam('camperformance')) pairs.push(['setcamperformance', camPerformance])
            if (hasParam('camresolution')) pairs.push(['setcamres', camResolution])
            if (hasParam('camfreq')) pairs.push(['setcamfreq', camFreq])
            if (hasParam('camfbcount')) pairs.push(['setcambufcount', camFbCount])
            if (hasParam('camflicker')) pairs.push(['setcamflicker', camFlicker])
            applyParams(pairs)
          }}
        >
          Apply Camera Setup
        </button>
        </div>
      </details>
      )}
      <details className="card card-collapsible">
        <summary className="card-collapsible-summary">
          <span className="card-collapsible-chevron" aria-hidden>▶</span>
          Camera Zones & Smoothing
        </summary>
        <div className="card-collapsible-body">
        <div className="form-grid form-grid-pairs">
          <div className="form-field">
            <label htmlFor="camInnerPreset">Inner Picture Usage (%)</label>
            <select
              id="camInnerPreset"
              value={camInnerPreset}
              onChange={async (e) => {
                const v = Number(e.target.value)
                setCamInnerPreset(v)
                try {
                  await api.setPreset('setcaminnerpreset', v)
                  setMessage('Inner preset updated')
                  refresh()
                } catch (err) {
                  setMessage(err.message || 'Failed to update preset')
                }
              }}
            >
              {CAM_INNER_PRESET_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          {camInnerPreset === 999 && (
            <>
              <div className="form-field">
                <label htmlFor="camInnerHori">Inner Horizontal (custom)</label>
                <input
                  id="camInnerHori"
                  type="number"
                  step="0.01"
                  value={camInnerHori}
                  onChange={(event) => setCamInnerHori(Number(event.target.value))}
                />
              </div>
              <div className="form-field">
                <label htmlFor="camInnerVert">Inner Vertical (custom)</label>
                <input
                  id="camInnerVert"
                  type="number"
                  step="0.01"
                  value={camInnerVert}
                  onChange={(event) => setCamInnerVert(Number(event.target.value))}
                />
              </div>
            </>
          )}
          <div className="form-field">
            <label htmlFor="camDetailLevel">Detail Level (sectors per side)</label>
            <select
              id="camDetailLevel"
              value={[3, 5, 7, 9, 11, 13, 15].includes(camDetailLevel) ? camDetailLevel : 7}
              onChange={(e) => setCamDetailLevel(Number(e.target.value))}
            >
              {CAM_DETAIL_LEVEL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="camSmoothMode">Smooth Mode</label>
            <select
              id="camSmoothMode"
              value={camSmoothMode}
              onChange={(e) => setCamSmoothMode(Number(e.target.value))}
            >
              {CAM_SMOOTH_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label>
              <input
                type="checkbox"
                checked={camSmoothEnable}
                onChange={async (e) => {
                  const v = e.target.checked
                  setCamSmoothEnable(v)
                  await updateParam('setcSmoothenable', v ? 1 : 0)
                }}
              />
              Enable Smoothing
            </label>
          </div>
          <div className="form-field">
            <label htmlFor="camSmoothMaxFrames">Max Frames</label>
            <div className="range-row">
              <input
                id="camSmoothMaxFrames"
                type="range"
                min="1"
                max="8"
                value={camSmoothMaxFrames}
                onChange={(e) => setCamSmoothMaxFrames(Number(e.target.value))}
              />
              <span className="muted">{camSmoothMaxFrames}</span>
            </div>
          </div>
          <div className="form-field">
            <label htmlFor="camSmoothMaxDiff">Max Diff</label>
            <div className="range-row">
              <input
                id="camSmoothMaxDiff"
                type="range"
                min="8"
                max="240"
                step="8"
                value={camSmoothMaxDiff}
                onChange={(e) => setCamSmoothMaxDiff(Number(e.target.value))}
              />
              <span className="muted">{camSmoothMaxDiff}</span>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            const pairs = []
            if (hasParam('camdetaillevel')) pairs.push(['setcamdetaillevel', camDetailLevel])
            if (hasParam('caminnerhori')) pairs.push(['setcaminnerhori', camInnerHori])
            if (hasParam('caminnervert')) pairs.push(['setcaminnervert', camInnerVert])
            if (hasParam('camsmoothmode')) pairs.push(['setcSmooth', camSmoothMode])
            if (hasParam('camsmoothenable')) pairs.push(['setcSmoothenable', camSmoothEnable ? 1 : 0])
            if (hasParam('camsmoothmaxframes')) pairs.push(['setcSmoothmaxframes', camSmoothMaxFrames])
            if (hasParam('camsmoothmaxdiff')) pairs.push(['setcSmoothmaxdiff', camSmoothMaxDiff])
            applyParams(pairs)
          }}
        >
          Apply Zone & Smoothing
        </button>
        </div>
      </details>
      <details className="card card-collapsible">
        <summary className="card-collapsible-summary">
          <span className="card-collapsible-chevron" aria-hidden>▶</span>
          Auto On/Off
        </summary>
        <div className="card-collapsible-body">
        <div className="form-grid form-grid-pairs">
          <div className="form-field">
            <label>
              <input
                type="checkbox"
                checked={camAutoOnOff}
                onChange={(event) => setCamAutoOnOff(event.target.checked)}
              />
              Automatic Camera Stop
            </label>
          </div>
          <div className="form-field">
            <label htmlFor="camAutoOnOffDelay">Off Delay (seconds)</label>
            <select
              id="camAutoOnOffDelay"
              value={CAM_AUTO_OFF_DELAY_OPTIONS.some((o) => o.value === camAutoOnOffDelay) ? camAutoOnOffDelay : 15}
              onChange={(e) => setCamAutoOnOffDelay(Number(e.target.value))}
            >
              {CAM_AUTO_OFF_DELAY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            const pairs = []
            if (hasParam('camautoonoff')) pairs.push(['setcamautoonoff', camAutoOnOff ? 1 : 0])
            if (hasParam('camautoonoffdelay'))
              pairs.push(['setcamautoonoffdelay', camAutoOnOffDelay])
            applyParams(pairs)
          }}
        >
          Apply Auto Settings
        </button>
        </div>
      </details>
      <details className="card card-collapsible">
        <summary className="card-collapsible-summary">
          <span className="card-collapsible-chevron" aria-hidden>▶</span>
          Color Thresholds & Enhancement
        </summary>
        <div className="card-collapsible-body">
        <div className="form-grid form-grid-pairs">
          <div className="form-field">
            <label htmlFor="colorPreset">Color Enhancement</label>
            <select
              id="colorPreset"
              value={colorPreset}
              onChange={async (e) => {
                const v = Number(e.target.value)
                setColorPreset(v)
                try {
                  await api.setPreset('setcolorpreset', v)
                  setMessage('Color preset updated')
                  refresh()
                } catch (err) {
                  setMessage(err.message || 'Failed to update preset')
                }
              }}
            >
              {CAM_COLOR_PRESET_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="brightnessPreset">Brightness Preset</label>
            <select
              id="brightnessPreset"
              value={brightnessPreset}
              onChange={async (e) => {
                const v = Number(e.target.value)
                setBrightnessPreset(v)
                try {
                  await api.setPreset('setbrightnesspreset', v)
                  setMessage('Brightness preset updated')
                  refresh()
                } catch (err) {
                  setMessage(err.message || 'Failed to update preset')
                }
              }}
            >
              {CAM_BRIGHTNESS_PRESET_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          {colorPreset === 999 && (
            <>
              <div className="form-field">
                <label htmlFor="colorBoost">Color Boost</label>
                <div className="range-row">
                  <input
                    id="colorBoost"
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={colorBoost}
                    onChange={(e) => setColorBoost(Number(e.target.value))}
                  />
                  <span className="muted">{colorBoost}</span>
                </div>
              </div>
              <div className="form-field">
                <label htmlFor="colorBoostBalance">Boost Balance</label>
                <div className="range-row">
                  <input
                    id="colorBoostBalance"
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={colorBoostBalance}
                    onChange={(e) => setColorBoostBalance(Number(e.target.value))}
                  />
                  <span className="muted">{colorBoostBalance}</span>
                </div>
              </div>
              <div className="form-field">
                <label htmlFor="colorBoostMin">Boost Smoothing</label>
                <div className="range-row">
                  <input
                    id="colorBoostMin"
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={colorBoostMin}
                    onChange={(e) => setColorBoostMin(Number(e.target.value))}
                  />
                  <span className="muted">{colorBoostMin}</span>
                </div>
              </div>
              <div className="form-field">
                <label htmlFor="colorBoostThreshold">Boost Threshold</label>
                <div className="range-row">
                  <input
                    id="colorBoostThreshold"
                    type="range"
                    min="0"
                    max="255"
                    step="5"
                    value={colorBoostThreshold}
                    onChange={(e) => setColorBoostThreshold(Number(e.target.value))}
                  />
                  <span className="muted">{colorBoostThreshold}</span>
                </div>
              </div>
              <div className="form-field">
                <label htmlFor="colorBoostRed">Red Boost</label>
                <div className="range-row">
                  <input
                    id="colorBoostRed"
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={colorBoostRed}
                    onChange={(e) => setColorBoostRed(Number(e.target.value))}
                  />
                  <span className="muted">{colorBoostRed}</span>
                </div>
              </div>
              <div className="form-field">
                <label htmlFor="colorBoostGreen">Green Boost</label>
                <div className="range-row">
                  <input
                    id="colorBoostGreen"
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={colorBoostGreen}
                    onChange={(e) => setColorBoostGreen(Number(e.target.value))}
                  />
                  <span className="muted">{colorBoostGreen}</span>
                </div>
              </div>
              <div className="form-field">
                <label htmlFor="colorBoostBlue">Blue Boost</label>
                <div className="range-row">
                  <input
                    id="colorBoostBlue"
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={colorBoostBlue}
                    onChange={(e) => setColorBoostBlue(Number(e.target.value))}
                  />
                  <span className="muted">{colorBoostBlue}</span>
                </div>
              </div>
            </>
          )}
          {brightnessPreset === 999 && (
            <div className="form-field">
              <label htmlFor="colorValueGain">Brightness (%)</label>
              <div className="range-row">
                <input
                  id="colorValueGain"
                  type="range"
                  min="5"
                  max="500"
                  step="5"
                  value={colorValueGain}
                  onChange={(e) => setColorValueGain(Number(e.target.value))}
                />
                <span className="muted">{colorValueGain}</span>
              </div>
            </div>
          )}
          <div className="form-field">
            <label htmlFor="minimumLuminosity">Minimum Luminosity</label>
            <div className="range-row">
              <input
                id="minimumLuminosity"
                type="range"
                min="0"
                max="255"
                step="5"
                value={minimumLuminosity}
                onChange={(e) => setMinimumLuminosity(Number(e.target.value))}
              />
              <span className="muted">{minimumLuminosity}</span>
            </div>
          </div>
          <div className="form-field">
            <label htmlFor="camColorRed">Red</label>
            <div className="range-row">
              <input
                id="camColorRed"
                type="range"
                min="0"
                max="255"
                value={camColorRed}
                onChange={(event) => setCamColorRed(Number(event.target.value))}
              />
              <span className="muted">{camColorRed}</span>
            </div>
          </div>
          <div className="form-field">
            <label htmlFor="camColorGreen">Green</label>
            <div className="range-row">
              <input
                id="camColorGreen"
                type="range"
                min="0"
                max="255"
                value={camColorGreen}
                onChange={(event) => setCamColorGreen(Number(event.target.value))}
              />
              <span className="muted">{camColorGreen}</span>
            </div>
          </div>
          <div className="form-field">
            <label htmlFor="camColorBlue">Blue</label>
            <div className="range-row">
              <input
                id="camColorBlue"
                type="range"
                min="0"
                max="255"
                value={camColorBlue}
                onChange={(event) => setCamColorBlue(Number(event.target.value))}
              />
              <span className="muted">{camColorBlue}</span>
            </div>
          </div>
          <div className="form-field">
            <label htmlFor="camActivationThreshold">Activation Threshold</label>
            <input
              id="camActivationThreshold"
              type="number"
              value={camActivationThreshold}
              onChange={(event) => setCamActivationThreshold(Number(event.target.value))}
            />
          </div>
          <div className="form-field">
            <label htmlFor="camBlackThresholdSmooth">Black Threshold Smooth</label>
            <input
              id="camBlackThresholdSmooth"
              type="number"
              value={camBlackThresholdSmooth}
              onChange={(event) => setCamBlackThresholdSmooth(Number(event.target.value))}
            />
          </div>
          <div className="form-field">
            <label htmlFor="camBlackRemoveThreshold">Black Remove Threshold</label>
            <input
              id="camBlackRemoveThreshold"
              type="number"
              value={camBlackRemoveThreshold}
              onChange={(event) => setCamBlackRemoveThreshold(Number(event.target.value))}
            />
          </div>
          <div className="form-field">
            <label htmlFor="camMinPixelAmount">Min Pixel Amount</label>
            <input
              id="camMinPixelAmount"
              type="number"
              value={camMinPixelAmount}
              onChange={(event) => setCamMinPixelAmount(Number(event.target.value))}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            const pairs = []
            if (hasParam('camcolorcorred')) pairs.push(['setcamcolorred', camColorRed])
            if (hasParam('camcolorcorgreen')) pairs.push(['setcamcolorgreen', camColorGreen])
            if (hasParam('camcolorcorblue')) pairs.push(['setcamcolorblue', camColorBlue])
            if (hasParam('camcoloractivationthreshold'))
              pairs.push(['setcamactivationthreshold', camActivationThreshold])
            if (hasParam('camcolorblackthresholdsmoothing'))
              pairs.push(['setcamblackthresholdsmooth', camBlackThresholdSmooth])
            if (hasParam('camcolorblackremovethreshold'))
              pairs.push(['setcamblackremovethreshold', camBlackRemoveThreshold])
            if (hasParam('camminpixelamount')) pairs.push(['setcamminpixelamount', camMinPixelAmount])
            if (hasParam('colorboost')) pairs.push(['setcolorboost', colorBoost])
            if (hasParam('colorboostbalance')) pairs.push(['setcolorboostbalance', colorBoostBalance])
            if (hasParam('colorboostmin')) pairs.push(['setcolorboostmin', colorBoostMin])
            if (hasParam('colorboostthreshold')) pairs.push(['setcolorboostthreshold', colorBoostThreshold])
            if (hasParam('colorboostred')) pairs.push(['setcolorboostred', colorBoostRed])
            if (hasParam('colorboostgreen')) pairs.push(['setcolorboostgreen', colorBoostGreen])
            if (hasParam('colorboostblue')) pairs.push(['setcolorboostblue', colorBoostBlue])
            if (hasParam('colorvaluegain')) pairs.push(['setcolorvaluegain', colorValueGain])
            if (hasParam('minimumluminosity')) pairs.push(['setminimumluminosity', minimumLuminosity])
            applyParams(pairs)
          }}
        >
          Apply Thresholds
        </button>
        </div>
      </details>
      <details className="card card-collapsible">
        <summary className="card-collapsible-summary">
          <span className="card-collapsible-chevron" aria-hidden>▶</span>
          Image Adjustments
        </summary>
        <div className="card-collapsible-body">
        <div className="form-grid form-grid-pairs">
          <div className="form-field">
            <label htmlFor="camContrast">Contrast</label>
            <select
              id="camContrast"
              value={CAM_LEVEL_OPTIONS.some((o) => o.value === camContrast) ? camContrast : 0}
              onChange={(e) => setCamContrast(Number(e.target.value))}
            >
              {CAM_LEVEL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="camBrightness">Brightness</label>
            <select
              id="camBrightness"
              value={CAM_LEVEL_OPTIONS.some((o) => o.value === camBrightness) ? camBrightness : 0}
              onChange={(e) => setCamBrightness(Number(e.target.value))}
            >
              {CAM_LEVEL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="camSaturation">Saturation</label>
            <select
              id="camSaturation"
              value={CAM_LEVEL_OPTIONS.some((o) => o.value === camSaturation) ? camSaturation : 0}
              onChange={(e) => setCamSaturation(Number(e.target.value))}
            >
              {CAM_LEVEL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="camQuality">JPEG Quality</label>
            <div className="range-row">
              <input
                id="camQuality"
                type="range"
                min="0"
                max="63"
                value={Math.max(0, Math.min(63, camQuality))}
                onChange={(e) => setCamQuality(Number(e.target.value))}
              />
              <span className="muted">{camQuality}</span>
            </div>
          </div>
          <div className="form-field">
            <label htmlFor="camSpecialEffect">Special Effect</label>
            <select
              id="camSpecialEffect"
              value={Math.max(0, Math.min(6, camSpecialEffect))}
              onChange={(e) => setCamSpecialEffect(Number(e.target.value))}
            >
              {CAM_SPECIAL_EFFECT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="camWbMode">White Balance</label>
            <select
              id="camWbMode"
              value={CAM_WB_MODE_OPTIONS.some((o) => o.value === camWbMode) ? camWbMode : 0}
              onChange={(e) => setCamWbMode(Number(e.target.value))}
            >
              {CAM_WB_MODE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label>
              <input
                type="checkbox"
                checked={camAwbGainControl}
                onChange={(event) => setCamAwbGainControl(event.target.checked)}
              />
              AWB Gain Control
            </label>
          </div>
          <div className="form-field">
            <label>
              <input
                type="checkbox"
                checked={camHMirror}
                onChange={async (e) => {
                  const v = e.target.checked
                  setCamHMirror(v)
                  await updateParam('setcamhmirror', v ? 1 : 0)
                }}
              />
              Mirror Horizontally
            </label>
          </div>
          <div className="form-field">
            <label>
              <input
                type="checkbox"
                checked={camVFlip}
                onChange={async (e) => {
                  const v = e.target.checked
                  setCamVFlip(v)
                  await updateParam('setcamvflip', v ? 1 : 0)
                }}
              />
              Flip Vertically
            </label>
          </div>
          <div className="form-field">
            <label>
              <input
                type="checkbox"
                checked={camHighQuality}
                onChange={async (e) => {
                  const v = e.target.checked
                  setCamHighQuality(v)
                  await updateParam('setcamhighquality', v ? 1 : 0)
                }}
              />
              High Quality
            </label>
          </div>
          <div className="form-field">
            <label>
              <input type="checkbox" checked={camBpc} onChange={(event) => setCamBpc(event.target.checked)} />
              BPC
            </label>
          </div>
          <div className="form-field">
            <label>
              <input type="checkbox" checked={camWpc} onChange={(event) => setCamWpc(event.target.checked)} />
              WPC
            </label>
          </div>
          <div className="form-field">
            <label>
              <input
                type="checkbox"
                checked={camDenoise}
                onChange={(event) => setCamDenoise(event.target.checked)}
              />
              Denoise
            </label>
          </div>
          <div className="form-field">
            <label>
              <input type="checkbox" checked={camLenc} onChange={(event) => setCamLenc(event.target.checked)} />
              Lenc
            </label>
          </div>
          <div className="form-field">
            <label>
              <input
                type="checkbox"
                checked={camRawGma}
                onChange={(event) => setCamRawGma(event.target.checked)}
              />
              Raw GMA
            </label>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            const pairs = []
            if (hasParam('camcontrast')) pairs.push(['setcamcontrast', camContrast])
            if (hasParam('cambrightness')) pairs.push(['setcambrightness', camBrightness])
            if (hasParam('camsaturation')) pairs.push(['setcamsaturation', camSaturation])
            if (hasParam('camquality')) pairs.push(['setcamquality', camQuality])
            if (hasParam('camspecialeffect')) pairs.push(['setcamspecialeffect', camSpecialEffect])
            if (hasParam('camwbmode')) pairs.push(['setcamwbmode', camWbMode])
            if (hasParam('camawbgaincontrol'))
              pairs.push(['setcamawbgain', camAwbGainControl ? 1 : 0])
            if (hasParam('camhmirror')) pairs.push(['setcamhmirror', camHMirror ? 1 : 0])
            if (hasParam('camvflip')) pairs.push(['setcamvflip', camVFlip ? 1 : 0])
            if (hasParam('camhighquality')) pairs.push(['setcamhighquality', camHighQuality ? 1 : 0])
            if (hasParam('cambpc')) pairs.push(['setcambpc', camBpc ? 1 : 0])
            if (hasParam('camwpc')) pairs.push(['setcamwpc', camWpc ? 1 : 0])
            if (hasParam('camdenoise')) pairs.push(['setcamdenoise', camDenoise ? 1 : 0])
            if (hasParam('camlenc')) pairs.push(['setcamlenc', camLenc ? 1 : 0])
            if (hasParam('camrawgma')) pairs.push(['setcamrawgma', camRawGma ? 1 : 0])
            applyParams(pairs)
          }}
        >
          Apply Image Adjustments
        </button>
        {advanced && (
          <div className="form-grid form-grid-pairs" style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border, #2a3042)' }}>
            <h3 className="form-section-title" style={{ gridColumn: '1 / -1', color: 'var(--muted, #9aa2b3)', fontSize: '0.85rem' }}>
              Developer Options
            </h3>
            <div className="form-field">
              <label>
                <input
                  type="checkbox"
                  checked={camDcw}
                  onChange={async (e) => {
                    const v = e.target.checked
                    setCamDcw(v)
                    try {
                      await api.setParam('setcamdcw', v ? 1 : 0)
                      setMessage('Saved')
                      refresh()
                    } catch (err) {
                      setMessage(err.message || 'Failed')
                    }
                  }}
                />
                Downsize Control (DCW)
              </label>
            </div>
            {hasParam('camoverclock') && (
              <div className="form-field">
                <label>
                  <input
                    type="checkbox"
                    checked={camOverclock}
                    onChange={async (e) => {
                      const v = e.target.checked
                      setCamOverclock(v)
                      try {
                        await api.setParam('setcamoverclock', v ? 1 : 0)
                        setMessage('Saved')
                        refresh()
                      } catch (err) {
                        setMessage(err.message || 'Failed')
                      }
                    }}
                  />
                  Overclock Camera Sensor
                </label>
              </div>
            )}
            <div className="form-field">
              <label>
                <input
                  type="checkbox"
                  checked={camColorbar}
                  onChange={async (e) => {
                    const v = e.target.checked
                    setCamColorbar(v)
                    try {
                      await api.setParam('setcamcolorbar', v ? 1 : 0)
                      setMessage('Saved')
                      refresh()
                    } catch (err) {
                      setMessage(err.message || 'Failed')
                    }
                  }}
                />
                Enable Colorbar
              </label>
            </div>
            {hasParam('camagainceilingsensor') && (
              <div className="form-field">
                <label htmlFor="camGainceilingSensor">Gainceiling Sensor</label>
                <select
                  id="camGainceilingSensor"
                  value={camGainceilingSensor}
                  onChange={async (e) => {
                    const v = Number(e.target.value)
                    setCamGainceilingSensor(v)
                    try {
                      await api.setParam('setcamagainceilingsensor', v)
                      setMessage('Saved')
                      refresh()
                    } catch (err) {
                      setMessage(err.message || 'Failed')
                    }
                  }}
                >
                  {CAM_GAINCEILING_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
        </div>
      </details>
      <details className="card card-collapsible">
        <summary className="card-collapsible-summary">
          <span className="card-collapsible-chevron" aria-hidden>▶</span>
          Exposure
        </summary>
        <div className="card-collapsible-body">
        <div className="form-grid form-grid-pairs">
          <div className="form-field">
            <label>
              <input type="checkbox" checked={camAec} onChange={(event) => setCamAec(event.target.checked)} />
              Auto Exposure
            </label>
          </div>
          <div className="form-field">
            <label>
              <input type="checkbox" checked={camAec2} onChange={(event) => setCamAec2(event.target.checked)} />
              Auto Exposure 2
            </label>
          </div>
          <div className="form-field">
            <label htmlFor="camAeLevels">AE Levels</label>
            <select
              id="camAeLevels"
              value={CAM_LEVEL_OPTIONS.some((o) => o.value === camAeLevels) ? camAeLevels : 0}
              onChange={(e) => setCamAeLevels(Number(e.target.value))}
            >
              {CAM_LEVEL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="camAecValue">AEC Value</label>
            <input
              id="camAecValue"
              type="number"
              value={camAecValue}
              onChange={(event) => setCamAecValue(Number(event.target.value))}
            />
          </div>
          <div className="form-field">
            <label htmlFor="camAecMinValue">AEC Min</label>
            <input
              id="camAecMinValue"
              type="number"
              value={camAecMinValue}
              onChange={(event) => setCamAecMinValue(Number(event.target.value))}
            />
          </div>
          <div className="form-field">
            <label htmlFor="camAecMaxValue">AEC Max</label>
            <input
              id="camAecMaxValue"
              type="number"
              value={camAecMaxValue}
              onChange={(event) => setCamAecMaxValue(Number(event.target.value))}
            />
          </div>
          <div className="form-field">
            <label>
              <input
                type="checkbox"
                checked={camAdptExp}
                onChange={(event) => setCamAdptExp(event.target.checked)}
              />
              Adaptive Exposure
            </label>
          </div>
          <div className="form-field">
            <label>
              <input
                type="checkbox"
                checked={camAdptGain}
                onChange={(event) => setCamAdptGain(event.target.checked)}
              />
              Adaptive Gain
            </label>
          </div>
          <div className="form-field">
            <label htmlFor="camAdptGainDown">Gain Down</label>
            <input
              id="camAdptGainDown"
              type="number"
              value={camAdptGainDown}
              onChange={(event) => setCamAdptGainDown(Number(event.target.value))}
            />
          </div>
          <div className="form-field">
            <label htmlFor="camAdptGainUp">Gain Up</label>
            <input
              id="camAdptGainUp"
              type="number"
              value={camAdptGainUp}
              onChange={(event) => setCamAdptGainUp(Number(event.target.value))}
            />
          </div>
          <div className="form-field">
            <label htmlFor="camAdptGainMax">Gain Max</label>
            <input
              id="camAdptGainMax"
              type="number"
              value={camAdptGainMax}
              onChange={(event) => setCamAdptGainMax(Number(event.target.value))}
            />
          </div>
          <div className="form-field">
            <label htmlFor="camWhiteActThreshold">White Activation</label>
            <input
              id="camWhiteActThreshold"
              type="number"
              value={camWhiteActThreshold}
              onChange={(event) => setCamWhiteActThreshold(Number(event.target.value))}
            />
          </div>
          <div className="form-field">
            <label htmlFor="camWhiteBeforeActThreshold">White Before Activation</label>
            <input
              id="camWhiteBeforeActThreshold"
              type="number"
              value={camWhiteBeforeActThreshold}
              onChange={(event) => setCamWhiteBeforeActThreshold(Number(event.target.value))}
            />
          </div>
          <div className="form-field">
            <label htmlFor="camWhiteMinAmount">White Min Amount</label>
            <input
              id="camWhiteMinAmount"
              type="number"
              value={camWhiteMinAmount}
              onChange={(event) => setCamWhiteMinAmount(Number(event.target.value))}
            />
          </div>
          <div className="form-field">
            <label htmlFor="camAdaptiveChangePercent">Adaptive Change %</label>
            <input
              id="camAdaptiveChangePercent"
              type="number"
              value={camAdaptiveChangePercent}
              onChange={(event) => setCamAdaptiveChangePercent(Number(event.target.value))}
            />
          </div>
          <div className="form-field">
            <label htmlFor="camAdaptiveChangeDelay">Adaptive Change Delay</label>
            <input
              id="camAdaptiveChangeDelay"
              type="number"
              value={camAdaptiveChangeDelay}
              onChange={(event) => setCamAdaptiveChangeDelay(Number(event.target.value))}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            const pairs = []
            if (hasParam('camaec')) pairs.push(['setcamaec', camAec ? 1 : 0])
            if (hasParam('camaec2')) pairs.push(['setcamaec2', camAec2 ? 1 : 0])
            if (hasParam('camaelevels')) pairs.push(['setcamaelevels', camAeLevels])
            if (hasParam('camaecvalue')) pairs.push(['setcamaecvalue', camAecValue])
            if (hasParam('camaecminvalue')) pairs.push(['setcamaecminvalue', camAecMinValue])
            if (hasParam('camaecmaxvalue')) pairs.push(['setcamaecmaxvalue', camAecMaxValue])
            if (hasParam('camadptexp')) pairs.push(['setcamadptexp', camAdptExp ? 1 : 0])
            if (hasParam('camadptgain')) pairs.push(['setcamadptgain', camAdptGain ? 1 : 0])
            if (hasParam('camadptgaindown'))
              pairs.push(['setcamadaptivegaindown', camAdptGainDown])
            if (hasParam('camadptgainup')) pairs.push(['setcamadaptivegainup', camAdptGainUp])
            if (hasParam('camadptgainmax'))
              pairs.push(['setcamadaptivegainmax', camAdptGainMax])
            if (hasParam('camwhiteactthreshold'))
              pairs.push(['setcamwhiteactthreshold', camWhiteActThreshold])
            if (hasParam('camwhitebeforeactthreshold'))
              pairs.push(['setcambeforewhiteactthreshold', camWhiteBeforeActThreshold])
            if (hasParam('camwhiteminamount'))
              pairs.push(['setcamwhiteminimumamount', camWhiteMinAmount])
            if (hasParam('camadaptivechangepercent'))
              pairs.push(['setcamadaptivechangepercent', camAdaptiveChangePercent])
            if (hasParam('camadaptivechangedelay'))
              pairs.push(['setcamadaptivechangedelay', camAdaptiveChangeDelay])
            applyParams(pairs)
          }}
        >
          Apply Exposure
        </button>
        </div>
      </details>
      {message && <div className="muted">{message}</div>}
    </div>
  )
}
