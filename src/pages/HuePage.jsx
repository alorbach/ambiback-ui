import { useEffect, useState } from 'react'
import StatusCard from '../components/StatusCard.jsx'
import ParamSetter from '../components/ParamSetter.jsx'
import useDeviceParams from '../hooks/useDeviceParams.js'
import { api } from '../api/client.js'
import { readBool, readNumber, readString } from '../utils/paramUtils.js'

export default function HuePage() {
  const { params } = useDeviceParams()
  const [message, setMessage] = useState('')
  const [supportEnabled, setSupportEnabled] = useState(false)
  const [bridgeIp, setBridgeIp] = useState('')
  const [bridgeUser, setBridgeUser] = useState('')
  const [bridgeClientKey, setBridgeClientKey] = useState('')
  const [frameLength, setFrameLength] = useState(0)
  const [handshakeTimeout, setHandshakeTimeout] = useState(0)
  const [preset, setPreset] = useState(0)

  useEffect(() => {
    if (!params) return
    setSupportEnabled(readBool(params, 'huesupportenabled', false))
    setBridgeIp(readString(params, 'huebridgeip', ''))
    setBridgeUser(readString(params, 'hueubridgeuser', readString(params, 'huebridgeuser', '')))
    setFrameLength(readNumber(params, 'hueframelength', 0))
    setHandshakeTimeout(readNumber(params, 'huehandshaketimeout', 0))
    setPreset(readNumber(params, 'huepreset', 0))
  }, [params])

  const applyHueSettings = async () => {
    setMessage('')
    try {
      await api.setParam('sethuesupport', supportEnabled ? 1 : 0)
      await api.setParam('sethuebridgeip', bridgeIp)
      await api.setParam('sethuebridgeuser', bridgeUser)
      if (bridgeClientKey) {
        await api.setParam('sethuebridgeclientkey', bridgeClientKey)
      }
      await api.setParam('sethueframelength', frameLength)
      await api.setParam('sethuehandshaketimeout', handshakeTimeout)
      await api.setParam('sethuepreset', preset)
      setMessage('Hue settings updated')
    } catch (err) {
      setMessage(err.message || 'Failed to update Hue settings')
    }
  }

  const refreshHue = async () => {
    setMessage('')
    try {
      const result = await api.refreshHueDevices()
      setMessage(result)
    } catch (err) {
      setMessage(err.message || 'Failed to refresh Hue devices')
    }
  }

  return (
    <div className="page">
      <h1>Hue Integration</h1>
      <StatusCard />
      <section className="card">
        <h2>Hue Controls</h2>
        <div className="form-grid">
          <label>
            <input
              type="checkbox"
              checked={supportEnabled}
              onChange={(event) => setSupportEnabled(event.target.checked)}
            />
            Enable Hue Support
          </label>
          <label htmlFor="hueBridgeIp">Bridge IP</label>
          <input
            id="hueBridgeIp"
            type="text"
            value={bridgeIp}
            onChange={(event) => setBridgeIp(event.target.value)}
          />
          <label htmlFor="hueBridgeUser">Bridge User</label>
          <input
            id="hueBridgeUser"
            type="text"
            value={bridgeUser}
            onChange={(event) => setBridgeUser(event.target.value)}
          />
          <label htmlFor="hueBridgeKey">Bridge Client Key</label>
          <input
            id="hueBridgeKey"
            type="text"
            value={bridgeClientKey}
            onChange={(event) => setBridgeClientKey(event.target.value)}
          />
          <label htmlFor="hueFrameLength">Frame Length</label>
          <input
            id="hueFrameLength"
            type="number"
            value={frameLength}
            onChange={(event) => setFrameLength(Number(event.target.value))}
          />
          <label htmlFor="hueHandshake">Handshake Timeout</label>
          <input
            id="hueHandshake"
            type="number"
            value={handshakeTimeout}
            onChange={(event) => setHandshakeTimeout(Number(event.target.value))}
          />
          <label htmlFor="huePreset">Preset</label>
          <select
            id="huePreset"
            value={preset}
            onChange={(event) => setPreset(Number(event.target.value))}
          >
            <option value={1}>Fast</option>
            <option value={2}>Normal</option>
            <option value={3}>Slow</option>
            <option value={999}>Custom</option>
          </select>
        </div>
        <div className="button-grid">
          <button type="button" onClick={applyHueSettings}>
            Apply Hue Settings
          </button>
          <button type="button" onClick={refreshHue}>
            Refresh Hue Devices
          </button>
        </div>
        {message && <div className="muted">{message}</div>}
      </section>
      <ParamSetter />
    </div>
  )
}
