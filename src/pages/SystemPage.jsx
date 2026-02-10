import { useEffect, useRef, useState } from 'react'
import { api } from '../api/client.js'
import StatusCard from '../components/StatusCard.jsx'
import ParamsViewer from '../components/ParamsViewer.jsx'
import ParamSetter from '../components/ParamSetter.jsx'
import useDeviceParams from '../hooks/useDeviceParams.js'
import { readBool, readNumber, readString } from '../utils/paramUtils.js'
import { useCapabilitiesContext } from '../contexts/CapabilitiesContext.jsx'
import { useUiSettings } from '../contexts/UiSettingsContext.jsx'
import { applyDefaults } from '../utils/applyDefaults.js'
import { SYSTEM_DEFAULTS } from '../utils/paramDefaults.js'

export default function SystemPage() {
  const [message, setMessage] = useState('')
  const [settingsMessage, setSettingsMessage] = useState('')
  const [resetting, setResetting] = useState(false)
  const { params, refresh } = useDeviceParams()
  const { caps } = useCapabilitiesContext()
  const { advanced } = useUiSettings()
  const timersRef = useRef({})

  const paramOptions = [
    'setbrightness',
    'setcolorred',
    'setcolorgreen',
    'setcolorblue',
    'setcolorboost',
    'setcolorboostbalance',
    'setcolorboostmin',
    'setcolorboostred',
    'setcolorboostgreen',
    'setcolorboostblue',
    'setcolorboostthreshold',
    'setcolorvaluegain',
    'setminimumluminosity',
    'setframesmoothing',
    'setframelength',
    'setframedelay',
    'setvertical',
    'sethorizontal',
    'setdirection',
    'setsidetop',
    'setsideleft',
    'setsideright',
    'setsidebottom',
    'settopbrightness',
    'setleftbrightness',
    'setrightbrightness',
    'setbottombrightness',
    'setdevicename',
    'setbuttonmode',
    'setwififail',
    'setdebugsyslogserver',
    'setdebugsyslogport',
    'setdebugserial',
    'setdebugsyslog',
    'setdebugultra',
    'setwifiapenable',
    'setrelaytarget',
    'setrelaytodirect',
    'setrelaywifidirect',
    'setrelaymode',
    'setcammode',
    'setcamperformance',
    'setcamres',
    'setcamfreq',
    'setcambufcount',
    'setcamflicker',
    'setcamdetaillevel',
    'setcaminnerhori',
    'setcaminnervert',
    'setcSmooth',
    'setcSmoothenable',
    'setcSmoothmaxframes',
    'setcSmoothmaxdiff',
    'setcamautoonoff',
    'setcamautoonoffdelay',
    'setcamcolorred',
    'setcamcolorgreen',
    'setcamcolorblue',
    'setcamactivationthreshold',
    'setcamblackthresholdsmooth',
    'setcamblackremovethreshold',
    'setcamminpixelamount',
    'setcamcontrast',
    'setcambrightness',
    'setcamsaturation',
    'setcamaelevels',
    'setcamquality',
    'setcamaecvalue',
    'setcamaecminvalue',
    'setcamaecmaxvalue',
    'setcamwhiteactthreshold',
    'setcamadaptivechangepercent',
    'setcamwhiteminimumamount',
    'setcambeforewhiteactthreshold',
    'setcamadaptivechangedelay',
    'setcamadaptivegaindown',
    'setcamadaptivegainup',
    'setcamadaptivegainmax',
    'setcamagaincontrol',
    'setcamawhitebalance',
    'setcamcolorbar',
    'setcamaec',
    'setcamaec2',
    'setcamadptexp',
    'setcamadptgain',
    'setcamawbgain',
    'setcamhmirror',
    'setcamvflip',
    'setcamdetailsmooth',
    'setcamhighquality',
    'setcambpc',
    'setcamwpc',
    'setcamlenc',
    'setcamdenoise',
    'setcamrawgma',
    'setcamdcw',
    'setcamoverclock',
    'setcamspecialeffect',
    'setcamwbmode',
    'setcamagainceilingsensor',
    'sethuesupport',
    'sethuebridgeip',
    'sethuebridgeuser',
    'sethuebridgeclientkey',
    'sethueframelength',
    'sethuehandshaketimeout',
    'sethuepreset',
    'sethuelightenable',
    'sethuelightzone',
    'sethuelightcolbrightness',
    'sethuelightcolcorred',
    'sethuelightcolcorgreen',
    'sethuelightcolcorblue',
    'setdreamscreensupport',
    'setdreamscreenemulation',
    'setdreamscreengroup',
    'setdreamscreencolorsmoothing',
  ]

  const [deviceName, setDeviceName] = useState('')
  const [buttonMode, setButtonMode] = useState(0)
  const [wifiFail, setWifiFail] = useState(0)
  const [debugSyslogServer, setDebugSyslogServer] = useState('')
  const [debugSyslogPort, setDebugSyslogPort] = useState(0)
  const [debugSerial, setDebugSerial] = useState(false)
  const [debugSyslog, setDebugSyslog] = useState(false)
  const [debugUltra, setDebugUltra] = useState(false)
  const [wifiApEnabled, setWifiApEnabled] = useState(false)
  const [relayTarget, setRelayTarget] = useState('')
  const [relayDirect, setRelayDirect] = useState(false)
  const [relayWifiDirect, setRelayWifiDirect] = useState(false)
  const [relayMode, setRelayMode] = useState(1)

  const handleAction = async (action) => {
    setMessage('')
    try {
      const result = await action()
      setMessage(result)
    } catch (err) {
      setMessage(err.message || 'Action failed')
    }
  }

  useEffect(() => {
    if (!params) return
    setDeviceName(readString(params, 'devicename', ''))
    setButtonMode(readNumber(params, 'buttonmode', 0))
    setWifiFail(readNumber(params, 'wififailhandling', 0))
    setDebugSyslogServer(readString(params, 'debugsyslogserver', readString(params, 'syslogserver', '')))
    setDebugSyslogPort(readNumber(params, 'debugsyslogport', 0))
    setDebugSerial(readBool(params, 'debugserial', false))
    setDebugSyslog(readBool(params, 'debugsyslog', false))
    setDebugUltra(readBool(params, 'debugultra', false))
    setWifiApEnabled(readBool(params, 'deviceapenabled', false))
    setRelayTarget(readString(params, 'ambibackrelayto', ''))
    setRelayDirect(readBool(params, 'ambibackrelaydirect', false))
    setRelayWifiDirect(readBool(params, 'ambibackrelaywifidirect', false))
    setRelayMode(readNumber(params, 'ambibackrelaymode', 1))
  }, [params])

  const queueParam = (param, value, setStatus = setSettingsMessage) => {
    if (timersRef.current[param]) {
      clearTimeout(timersRef.current[param])
    }
    timersRef.current[param] = setTimeout(async () => {
      setStatus('')
      try {
        const result = await api.setParam(param, value)
        setStatus(result)
      } catch (err) {
        setStatus(err.message || 'Failed to update setting')
      }
    }, 300)
  }

  return (
    <div className="page">
      <h1>System & Status</h1>
      <div className="card-grid">
        <section className="card">
          <header className="card-header">
            <h2>Actions</h2>
          </header>
          <div className="button-grid">
            {advanced && (
              <button type="button" onClick={() => handleAction(api.startWps)}>
                Start WPS
              </button>
            )}
            <button type="button" onClick={() => handleAction(api.reboot)}>
              Reboot
            </button>
            <a className="button-link" href={api.updateUrl()} target="_blank" rel="noopener">
              OTA Update
            </a>
          </div>
          {message && <div className="muted">{message}</div>}
        </section>
        <StatusCard />
      </div>
      <section className="card">
        <header className="card-header">
          <h2>Device Info</h2>
        </header>
        {params ? (
          <dl className="status-grid">
            <div className="status-row">
              <dt>Device Type</dt>
              <dd>{params.devicetype}</dd>
            </div>
            <div className="status-row">
              <dt>Version</dt>
              <dd>{params.deviceversion}</dd>
            </div>
            <div className="status-row">
              <dt>Device ID</dt>
              <dd>{params.deviceid}</dd>
            </div>
            <div className="status-row">
              <dt>MAC</dt>
              <dd>{params.devicemac}</dd>
            </div>
            <div className="status-row">
              <dt>IP</dt>
              <dd>{params.deviceip}</dd>
            </div>
          </dl>
        ) : (
          <div className="muted">No device info yet.</div>
        )}
      </section>
      <section className="card">
        <header className="card-header">
          <h2>Device Settings</h2>
        </header>
        <div className="form-grid">
          <label htmlFor="deviceName">Device Name</label>
          <input
            id="deviceName"
            type="text"
            value={deviceName}
            onChange={(event) => {
              const next = event.target.value
              setDeviceName(next)
              queueParam('setdevicename', next)
            }}
          />
          <label htmlFor="buttonMode">Button Function</label>
          <select
            id="buttonMode"
            value={buttonMode}
            onChange={(event) => {
              const next = Number(event.target.value)
              setButtonMode(next)
              queueParam('setbuttonmode', next)
            }}
          >
            <option value={0}>Disabled</option>
            <option value={1}>Toggle Mode Off</option>
            <option value={2}>Toggle Mode Off/Camera</option>
            <option value={3}>Toggle Camera Color Mode</option>
            <option value={4}>Toggle Camera Color Preset</option>
            <option value={5}>Toggle Hue Support</option>
            <option value={6}>Toggle DreamScreen Support</option>
          </select>
          <label htmlFor="wifiFail">WiFi Fail Handling</label>
          <select
            id="wifiFail"
            value={wifiFail}
            onChange={(event) => {
              const next = Number(event.target.value)
              setWifiFail(next)
              queueParam('setwififail', next)
            }}
          >
            <option value={0}>Reconnect</option>
            <option value={1}>Reconnect/Reboot</option>
            <option value={2}>Reboot</option>
          </select>
        </div>
        <div className="button-row">
          <button
            type="button"
            className="button secondary"
            disabled={resetting}
            onClick={async () => {
              setResetting(true)
              setSettingsMessage('')
              try {
                await applyDefaults(SYSTEM_DEFAULTS)
                await refresh()
                setSettingsMessage('Settings reset to defaults')
              } catch (err) {
                setSettingsMessage(err.message || 'Failed to reset settings')
              } finally {
                setResetting(false)
              }
            }}
          >
            {resetting ? 'Resetting…' : 'Reset to default'}
          </button>
        </div>
        {settingsMessage && <div className="muted">{settingsMessage}</div>}
      </section>
      {advanced && (
        <section className="card">
          <header className="card-header">
            <h2>Debug Settings</h2>
          </header>
          <div className="form-grid">
            <label htmlFor="debugSyslogServer">Syslog Server</label>
            <input
              id="debugSyslogServer"
              type="text"
              value={debugSyslogServer}
              onChange={(event) => {
                const next = event.target.value
                setDebugSyslogServer(next)
                queueParam('setdebugsyslogserver', next)
              }}
            />
            <label htmlFor="debugSyslogPort">Syslog Port</label>
            <input
              id="debugSyslogPort"
              type="number"
              value={debugSyslogPort}
              onChange={(event) => {
                const next = Number(event.target.value)
                setDebugSyslogPort(next)
                queueParam('setdebugsyslogport', next)
              }}
            />
            <label className="checkbox">
              <input
                type="checkbox"
                checked={debugSerial}
                onChange={(event) => {
                  const next = event.target.checked
                  setDebugSerial(next)
                  queueParam('setdebugserial', next ? 1 : 0)
                }}
              />
              Serial Debug
            </label>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={debugSyslog}
                onChange={(event) => {
                  const next = event.target.checked
                  setDebugSyslog(next)
                  queueParam('setdebugsyslog', next ? 1 : 0)
                }}
              />
              Syslog Debug
            </label>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={debugUltra}
                onChange={(event) => {
                  const next = event.target.checked
                  setDebugUltra(next)
                  queueParam('setdebugultra', next ? 1 : 0)
                }}
              />
              Ultra Debug
            </label>
          </div>
          {settingsMessage && <div className="muted">{settingsMessage}</div>}
        </section>
      )}
      {advanced && caps.wifiAp && (
        <section className="card">
          <header className="card-header">
            <h2>WiFi Direct AP</h2>
          </header>
          <div className="form-grid">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={wifiApEnabled}
                onChange={(event) => {
                  const next = event.target.checked
                  setWifiApEnabled(next)
                  queueParam('setwifiapenable', next ? 1 : 0)
                }}
              />
              Enable WiFi Direct AP
            </label>
            <label>SSID</label>
            <input type="text" value={readString(params, 'deviceapssid', '')} disabled />
            <label>Password</label>
            <input type="text" value={readString(params, 'deviceappass', '')} disabled />
          </div>
          {settingsMessage && <div className="muted">{settingsMessage}</div>}
        </section>
      )}
      {caps.relay && (
        <section className="card">
          <header className="card-header">
            <h2>Relay Settings</h2>
          </header>
          <div className="form-grid">
            <label htmlFor="relayTarget">Relay Target</label>
            <input
              id="relayTarget"
              type="text"
              value={relayTarget}
              onChange={(event) => {
                const next = event.target.value
                setRelayTarget(next)
                queueParam('setrelaytarget', next)
              }}
            />
            <label className="checkbox">
              <input
                type="checkbox"
                checked={relayDirect}
                onChange={(event) => {
                  const next = event.target.checked
                  setRelayDirect(next)
                  queueParam('setrelaytodirect', next ? 1 : 0)
                }}
              />
              Fast Relay Mode
            </label>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={relayWifiDirect}
                onChange={(event) => {
                  const next = event.target.checked
                  setRelayWifiDirect(next)
                  queueParam('setrelaywifidirect', next ? 1 : 0)
                }}
              />
              WiFi Direct Mode
            </label>
            <label htmlFor="relayMode">Relay Protocol</label>
            <select
              id="relayMode"
              value={relayMode}
              onChange={(event) => {
                const next = Number(event.target.value)
                setRelayMode(next)
                queueParam('setrelaymode', next)
              }}
            >
              <option value={1}>UDP</option>
              <option value={2}>TCP</option>
            </select>
          </div>
          {settingsMessage && <div className="muted">{settingsMessage}</div>}
        </section>
      )}
      {advanced && <ParamSetter options={paramOptions} />}
      {advanced && <ParamsViewer />}
    </div>
  )
}
