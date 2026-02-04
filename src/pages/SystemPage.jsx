import { useEffect, useState } from 'react'
import { api } from '../api/client.js'
import StatusCard from '../components/StatusCard.jsx'
import ParamsViewer from '../components/ParamsViewer.jsx'
import ParamSetter from '../components/ParamSetter.jsx'
import useDeviceParams from '../hooks/useDeviceParams.js'
import { readBool, readNumber, readString } from '../utils/paramUtils.js'
import { useCapabilitiesContext } from '../contexts/CapabilitiesContext.jsx'
import { useUiSettings } from '../contexts/UiSettingsContext.jsx'

export default function SystemPage() {
  const [message, setMessage] = useState('')
  const [settingsMessage, setSettingsMessage] = useState('')
  const [debugMessage, setDebugMessage] = useState('')
  const { params } = useDeviceParams()
  const { caps } = useCapabilitiesContext()
  const { advanced } = useUiSettings()

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

  const applyDeviceSettings = async () => {
    setSettingsMessage('')
    try {
      await api.setParam('setdevicename', deviceName)
      await api.setParam('setbuttonmode', buttonMode)
      await api.setParam('setwififail', wifiFail)
      setSettingsMessage('Device settings updated')
    } catch (err) {
      setSettingsMessage(err.message || 'Failed to update device settings')
    }
  }

  const applyDebugSettings = async () => {
    setDebugMessage('')
    try {
      await api.setParam('setdebugsyslogserver', debugSyslogServer)
      await api.setParam('setdebugsyslogport', debugSyslogPort)
      await api.setParam('setdebugserial', debugSerial ? 1 : 0)
      await api.setParam('setdebugsyslog', debugSyslog ? 1 : 0)
      await api.setParam('setdebugultra', debugUltra ? 1 : 0)
      setDebugMessage('Debug settings updated')
    } catch (err) {
      setDebugMessage(err.message || 'Failed to update debug settings')
    }
  }

  const applyWifiAp = async () => {
    setSettingsMessage('')
    try {
      await api.setParam('setwifiapenable', wifiApEnabled ? 1 : 0)
      setSettingsMessage('WiFi AP setting updated')
    } catch (err) {
      setSettingsMessage(err.message || 'Failed to update WiFi AP setting')
    }
  }

  const applyRelaySettings = async () => {
    setSettingsMessage('')
    try {
      await api.setParam('setrelaytarget', relayTarget)
      await api.setParam('setrelaytodirect', relayDirect ? 1 : 0)
      await api.setParam('setrelaywifidirect', relayWifiDirect ? 1 : 0)
      await api.setParam('setrelaymode', relayMode)
      setSettingsMessage('Relay settings updated')
    } catch (err) {
      setSettingsMessage(err.message || 'Failed to update relay settings')
    }
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
            onChange={(event) => setDeviceName(event.target.value)}
          />
          <label htmlFor="buttonMode">Button Function</label>
          <select
            id="buttonMode"
            value={buttonMode}
            onChange={(event) => setButtonMode(Number(event.target.value))}
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
            onChange={(event) => setWifiFail(Number(event.target.value))}
          >
            <option value={0}>Reconnect</option>
            <option value={1}>Reconnect/Reboot</option>
            <option value={2}>Reboot</option>
          </select>
        </div>
        <button type="button" onClick={applyDeviceSettings}>
          Apply Device Settings
        </button>
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
              onChange={(event) => setDebugSyslogServer(event.target.value)}
            />
            <label htmlFor="debugSyslogPort">Syslog Port</label>
            <input
              id="debugSyslogPort"
              type="number"
              value={debugSyslogPort}
              onChange={(event) => setDebugSyslogPort(Number(event.target.value))}
            />
            <label className="checkbox">
              <input
                type="checkbox"
                checked={debugSerial}
                onChange={(event) => setDebugSerial(event.target.checked)}
              />
              Serial Debug
            </label>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={debugSyslog}
                onChange={(event) => setDebugSyslog(event.target.checked)}
              />
              Syslog Debug
            </label>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={debugUltra}
                onChange={(event) => setDebugUltra(event.target.checked)}
              />
              Ultra Debug
            </label>
          </div>
          <button type="button" onClick={applyDebugSettings}>
            Apply Debug Settings
          </button>
          {debugMessage && <div className="muted">{debugMessage}</div>}
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
                onChange={(event) => setWifiApEnabled(event.target.checked)}
              />
              Enable WiFi Direct AP
            </label>
            <label>SSID</label>
            <input type="text" value={readString(params, 'deviceapssid', '')} disabled />
            <label>Password</label>
            <input type="text" value={readString(params, 'deviceappass', '')} disabled />
          </div>
          <button type="button" onClick={applyWifiAp}>
            Apply WiFi AP Setting
          </button>
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
              onChange={(event) => setRelayTarget(event.target.value)}
            />
            <label className="checkbox">
              <input
                type="checkbox"
                checked={relayDirect}
                onChange={(event) => setRelayDirect(event.target.checked)}
              />
              Fast Relay Mode
            </label>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={relayWifiDirect}
                onChange={(event) => setRelayWifiDirect(event.target.checked)}
              />
              WiFi Direct Mode
            </label>
            <label htmlFor="relayMode">Relay Protocol</label>
            <select
              id="relayMode"
              value={relayMode}
              onChange={(event) => setRelayMode(Number(event.target.value))}
            >
              <option value={1}>UDP</option>
              <option value={2}>TCP</option>
            </select>
          </div>
          <button type="button" onClick={applyRelaySettings}>
            Apply Relay Settings
          </button>
          {settingsMessage && <div className="muted">{settingsMessage}</div>}
        </section>
      )}
      {advanced && <ParamSetter options={paramOptions} />}
      <ParamsViewer />
    </div>
  )
}
