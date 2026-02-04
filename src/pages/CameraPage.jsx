import { useEffect, useState } from 'react'
import useDevice from '../hooks/useDevice.js'
import useDeviceParams from '../hooks/useDeviceParams.js'
import { api } from '../api/client.js'
import { readBool, readNumber } from '../utils/paramUtils.js'

export default function CameraPage() {
  const { baseUrl } = useDevice()
  const { params } = useDeviceParams()
  const [stamp, setStamp] = useState(Date.now())
  const [message, setMessage] = useState('')
  const [camMode, setCamMode] = useState(0)
  const [camPerformance, setCamPerformance] = useState(0)
  const [camResolution, setCamResolution] = useState(0)
  const [camFreq, setCamFreq] = useState(20)
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

  const hasParam = (key) => params && Object.prototype.hasOwnProperty.call(params, key)
  const camUrl = baseUrl ? `${baseUrl}/cam.jpg?ts=${stamp}` : '/cam.jpg'
  const mjpegUrl = baseUrl ? `${baseUrl}/cam.mjpeg` : '/cam.mjpeg'

  useEffect(() => {
    if (!params) return
    setCamMode(readNumber(params, 'cammode', 0))
    setCamPerformance(readNumber(params, 'camperformance', 0))
    setCamResolution(readNumber(params, 'camresolution', 0))
    setCamFreq(readNumber(params, 'camfreq', 20))
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

  return (
    <div className="page">
      <h1>Camera</h1>
      <section className="card">
        <header className="card-header">
          <h2>Snapshot</h2>
          <button type="button" onClick={() => setStamp(Date.now())}>
            Refresh
          </button>
        </header>
        <div className="camera-frame">
          <img src={camUrl} alt="Camera snapshot" />
        </div>
        <div className="muted">
          <a href={mjpegUrl} target="_blank" rel="noopener">
            Open MJPEG Stream
          </a>
        </div>
      </section>
      <section className="card">
        <h2>Camera Controls</h2>
        <div className="form-grid">
          <label htmlFor="camMode">Mode</label>
          <select
            id="camMode"
            value={camMode}
            onChange={(event) => setCamMode(Number(event.target.value))}
          >
            <option value={0}>Single Color</option>
            <option value={1}>Light Bar</option>
            <option value={2}>Detailed</option>
          </select>
          {hasParam('camperformance') && (
            <>
              <label htmlFor="camPerformance">Performance</label>
              <input
                id="camPerformance"
                type="number"
                value={camPerformance}
                onChange={(event) => setCamPerformance(Number(event.target.value))}
              />
            </>
          )}
          {hasParam('camresolution') && (
            <>
              <label htmlFor="camResolution">Resolution</label>
              <input
                id="camResolution"
                type="number"
                value={camResolution}
                onChange={(event) => setCamResolution(Number(event.target.value))}
              />
            </>
          )}
          {hasParam('camfreq') && (
            <>
              <label htmlFor="camFreq">Frequency (MHz)</label>
              <input
                id="camFreq"
                type="number"
                value={camFreq}
                onChange={(event) => setCamFreq(Number(event.target.value))}
              />
            </>
          )}
          {hasParam('camfbcount') && (
            <>
              <label htmlFor="camFbCount">Frame Buffers</label>
              <input
                id="camFbCount"
                type="number"
                value={camFbCount}
                onChange={(event) => setCamFbCount(Number(event.target.value))}
              />
            </>
          )}
          {hasParam('camflicker') && (
            <>
              <label htmlFor="camFlicker">Flicker Control</label>
              <input
                id="camFlicker"
                type="number"
                value={camFlicker}
                onChange={(event) => setCamFlicker(Number(event.target.value))}
              />
            </>
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
      </section>
      <section className="card">
        <header className="card-header">
          <h2>Camera Zones & Smoothing</h2>
        </header>
        <div className="form-grid">
          <label htmlFor="camDetailLevel">Detail Level</label>
          <input
            id="camDetailLevel"
            type="number"
            value={camDetailLevel}
            onChange={(event) => setCamDetailLevel(Number(event.target.value))}
          />
          <label htmlFor="camInnerHori">Inner Horizontal</label>
          <input
            id="camInnerHori"
            type="number"
            step="0.01"
            value={camInnerHori}
            onChange={(event) => setCamInnerHori(Number(event.target.value))}
          />
          <label htmlFor="camInnerVert">Inner Vertical</label>
          <input
            id="camInnerVert"
            type="number"
            step="0.01"
            value={camInnerVert}
            onChange={(event) => setCamInnerVert(Number(event.target.value))}
          />
          <label htmlFor="camSmoothMode">Smooth Mode</label>
          <input
            id="camSmoothMode"
            type="number"
            value={camSmoothMode}
            onChange={(event) => setCamSmoothMode(Number(event.target.value))}
          />
          <label>
            <input
              type="checkbox"
              checked={camSmoothEnable}
              onChange={(event) => setCamSmoothEnable(event.target.checked)}
            />
            Enable Smoothing
          </label>
          <label htmlFor="camSmoothMaxFrames">Max Frames</label>
          <input
            id="camSmoothMaxFrames"
            type="number"
            value={camSmoothMaxFrames}
            onChange={(event) => setCamSmoothMaxFrames(Number(event.target.value))}
          />
          <label htmlFor="camSmoothMaxDiff">Max Diff</label>
          <input
            id="camSmoothMaxDiff"
            type="number"
            value={camSmoothMaxDiff}
            onChange={(event) => setCamSmoothMaxDiff(Number(event.target.value))}
          />
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
      </section>
      <section className="card">
        <header className="card-header">
          <h2>Auto On/Off</h2>
        </header>
        <div className="form-grid">
          <label>
            <input
              type="checkbox"
              checked={camAutoOnOff}
              onChange={(event) => setCamAutoOnOff(event.target.checked)}
            />
            Automatic Camera Stop
          </label>
          <label htmlFor="camAutoOnOffDelay">Off Delay (seconds)</label>
          <input
            id="camAutoOnOffDelay"
            type="number"
            value={camAutoOnOffDelay}
            onChange={(event) => setCamAutoOnOffDelay(Number(event.target.value))}
          />
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
      </section>
      <section className="card">
        <header className="card-header">
          <h2>Color Thresholds</h2>
        </header>
        <div className="form-grid">
          <label htmlFor="camColorRed">Red</label>
          <input
            id="camColorRed"
            type="range"
            min="0"
            max="255"
            value={camColorRed}
            onChange={(event) => setCamColorRed(Number(event.target.value))}
          />
          <div className="muted">{camColorRed}</div>
          <label htmlFor="camColorGreen">Green</label>
          <input
            id="camColorGreen"
            type="range"
            min="0"
            max="255"
            value={camColorGreen}
            onChange={(event) => setCamColorGreen(Number(event.target.value))}
          />
          <div className="muted">{camColorGreen}</div>
          <label htmlFor="camColorBlue">Blue</label>
          <input
            id="camColorBlue"
            type="range"
            min="0"
            max="255"
            value={camColorBlue}
            onChange={(event) => setCamColorBlue(Number(event.target.value))}
          />
          <div className="muted">{camColorBlue}</div>
          <label htmlFor="camActivationThreshold">Activation Threshold</label>
          <input
            id="camActivationThreshold"
            type="number"
            value={camActivationThreshold}
            onChange={(event) => setCamActivationThreshold(Number(event.target.value))}
          />
          <label htmlFor="camBlackThresholdSmooth">Black Threshold Smooth</label>
          <input
            id="camBlackThresholdSmooth"
            type="number"
            value={camBlackThresholdSmooth}
            onChange={(event) => setCamBlackThresholdSmooth(Number(event.target.value))}
          />
          <label htmlFor="camBlackRemoveThreshold">Black Remove Threshold</label>
          <input
            id="camBlackRemoveThreshold"
            type="number"
            value={camBlackRemoveThreshold}
            onChange={(event) => setCamBlackRemoveThreshold(Number(event.target.value))}
          />
          <label htmlFor="camMinPixelAmount">Min Pixel Amount</label>
          <input
            id="camMinPixelAmount"
            type="number"
            value={camMinPixelAmount}
            onChange={(event) => setCamMinPixelAmount(Number(event.target.value))}
          />
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
            applyParams(pairs)
          }}
        >
          Apply Thresholds
        </button>
      </section>
      <section className="card">
        <header className="card-header">
          <h2>Image Adjustments</h2>
        </header>
        <div className="form-grid">
          <label htmlFor="camContrast">Contrast</label>
          <input
            id="camContrast"
            type="number"
            value={camContrast}
            onChange={(event) => setCamContrast(Number(event.target.value))}
          />
          <label htmlFor="camBrightness">Brightness</label>
          <input
            id="camBrightness"
            type="number"
            value={camBrightness}
            onChange={(event) => setCamBrightness(Number(event.target.value))}
          />
          <label htmlFor="camSaturation">Saturation</label>
          <input
            id="camSaturation"
            type="number"
            value={camSaturation}
            onChange={(event) => setCamSaturation(Number(event.target.value))}
          />
          <label htmlFor="camQuality">JPEG Quality</label>
          <input
            id="camQuality"
            type="number"
            value={camQuality}
            onChange={(event) => setCamQuality(Number(event.target.value))}
          />
          <label htmlFor="camSpecialEffect">Special Effect</label>
          <input
            id="camSpecialEffect"
            type="number"
            value={camSpecialEffect}
            onChange={(event) => setCamSpecialEffect(Number(event.target.value))}
          />
          <label htmlFor="camWbMode">White Balance</label>
          <input
            id="camWbMode"
            type="number"
            value={camWbMode}
            onChange={(event) => setCamWbMode(Number(event.target.value))}
          />
          <label>
            <input
              type="checkbox"
              checked={camAwbGainControl}
              onChange={(event) => setCamAwbGainControl(event.target.checked)}
            />
            AWB Gain Control
          </label>
          <label>
            <input
              type="checkbox"
              checked={camHMirror}
              onChange={(event) => setCamHMirror(event.target.checked)}
            />
            Mirror Horizontally
          </label>
          <label>
            <input
              type="checkbox"
              checked={camVFlip}
              onChange={(event) => setCamVFlip(event.target.checked)}
            />
            Flip Vertically
          </label>
          <label>
            <input
              type="checkbox"
              checked={camHighQuality}
              onChange={(event) => setCamHighQuality(event.target.checked)}
            />
            High Quality
          </label>
          <label>
            <input type="checkbox" checked={camBpc} onChange={(event) => setCamBpc(event.target.checked)} />
            BPC
          </label>
          <label>
            <input type="checkbox" checked={camWpc} onChange={(event) => setCamWpc(event.target.checked)} />
            WPC
          </label>
          <label>
            <input
              type="checkbox"
              checked={camDenoise}
              onChange={(event) => setCamDenoise(event.target.checked)}
            />
            Denoise
          </label>
          <label>
            <input type="checkbox" checked={camLenc} onChange={(event) => setCamLenc(event.target.checked)} />
            Lenc
          </label>
          <label>
            <input
              type="checkbox"
              checked={camRawGma}
              onChange={(event) => setCamRawGma(event.target.checked)}
            />
            Raw GMA
          </label>
          <label>
            <input type="checkbox" checked={camDcw} onChange={(event) => setCamDcw(event.target.checked)} />
            DCW
          </label>
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
            if (hasParam('camdcw')) pairs.push(['setcamdcw', camDcw ? 1 : 0])
            applyParams(pairs)
          }}
        >
          Apply Image Adjustments
        </button>
      </section>
      <section className="card">
        <header className="card-header">
          <h2>Exposure</h2>
        </header>
        <div className="form-grid">
          <label>
            <input type="checkbox" checked={camAec} onChange={(event) => setCamAec(event.target.checked)} />
            Auto Exposure
          </label>
          <label>
            <input type="checkbox" checked={camAec2} onChange={(event) => setCamAec2(event.target.checked)} />
            Auto Exposure 2
          </label>
          <label htmlFor="camAeLevels">AE Levels</label>
          <input
            id="camAeLevels"
            type="number"
            value={camAeLevels}
            onChange={(event) => setCamAeLevels(Number(event.target.value))}
          />
          <label htmlFor="camAecValue">AEC Value</label>
          <input
            id="camAecValue"
            type="number"
            value={camAecValue}
            onChange={(event) => setCamAecValue(Number(event.target.value))}
          />
          <label htmlFor="camAecMinValue">AEC Min</label>
          <input
            id="camAecMinValue"
            type="number"
            value={camAecMinValue}
            onChange={(event) => setCamAecMinValue(Number(event.target.value))}
          />
          <label htmlFor="camAecMaxValue">AEC Max</label>
          <input
            id="camAecMaxValue"
            type="number"
            value={camAecMaxValue}
            onChange={(event) => setCamAecMaxValue(Number(event.target.value))}
          />
          <label>
            <input
              type="checkbox"
              checked={camAdptExp}
              onChange={(event) => setCamAdptExp(event.target.checked)}
            />
            Adaptive Exposure
          </label>
          <label>
            <input
              type="checkbox"
              checked={camAdptGain}
              onChange={(event) => setCamAdptGain(event.target.checked)}
            />
            Adaptive Gain
          </label>
          <label htmlFor="camAdptGainDown">Gain Down</label>
          <input
            id="camAdptGainDown"
            type="number"
            value={camAdptGainDown}
            onChange={(event) => setCamAdptGainDown(Number(event.target.value))}
          />
          <label htmlFor="camAdptGainUp">Gain Up</label>
          <input
            id="camAdptGainUp"
            type="number"
            value={camAdptGainUp}
            onChange={(event) => setCamAdptGainUp(Number(event.target.value))}
          />
          <label htmlFor="camAdptGainMax">Gain Max</label>
          <input
            id="camAdptGainMax"
            type="number"
            value={camAdptGainMax}
            onChange={(event) => setCamAdptGainMax(Number(event.target.value))}
          />
          <label htmlFor="camWhiteActThreshold">White Activation</label>
          <input
            id="camWhiteActThreshold"
            type="number"
            value={camWhiteActThreshold}
            onChange={(event) => setCamWhiteActThreshold(Number(event.target.value))}
          />
          <label htmlFor="camWhiteBeforeActThreshold">White Before Activation</label>
          <input
            id="camWhiteBeforeActThreshold"
            type="number"
            value={camWhiteBeforeActThreshold}
            onChange={(event) => setCamWhiteBeforeActThreshold(Number(event.target.value))}
          />
          <label htmlFor="camWhiteMinAmount">White Min Amount</label>
          <input
            id="camWhiteMinAmount"
            type="number"
            value={camWhiteMinAmount}
            onChange={(event) => setCamWhiteMinAmount(Number(event.target.value))}
          />
          <label htmlFor="camAdaptiveChangePercent">Adaptive Change %</label>
          <input
            id="camAdaptiveChangePercent"
            type="number"
            value={camAdaptiveChangePercent}
            onChange={(event) => setCamAdaptiveChangePercent(Number(event.target.value))}
          />
          <label htmlFor="camAdaptiveChangeDelay">Adaptive Change Delay</label>
          <input
            id="camAdaptiveChangeDelay"
            type="number"
            value={camAdaptiveChangeDelay}
            onChange={(event) => setCamAdaptiveChangeDelay(Number(event.target.value))}
          />
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
      </section>
      {message && <div className="muted">{message}</div>}
    </div>
  )
}
