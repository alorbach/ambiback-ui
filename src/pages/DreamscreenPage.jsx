import { useEffect, useState } from 'react'
import StatusCard from '../components/StatusCard.jsx'
import ParamSetter from '../components/ParamSetter.jsx'
import useDeviceParams from '../hooks/useDeviceParams.js'
import { api } from '../api/client.js'
import { readBool, readNumber } from '../utils/paramUtils.js'
import { applyDefaults } from '../utils/applyDefaults.js'
import { DREAMSCREEN_DEFAULTS } from '../utils/paramDefaults.js'

export default function DreamscreenPage() {
  const { params, refresh } = useDeviceParams()
  const [message, setMessage] = useState('')
  const [resetting, setResetting] = useState(false)
  const [supportEnabled, setSupportEnabled] = useState(false)
  const [emulationEnabled, setEmulationEnabled] = useState(false)
  const [groupId, setGroupId] = useState(0)
  const [colorSmoothing, setColorSmoothing] = useState(0)
  const [networkSsid, setNetworkSsid] = useState('')
  const [networks, setNetworks] = useState([])

  useEffect(() => {
    if (!params) return
    setSupportEnabled(readBool(params, 'dreamscreensupport', false))
    setEmulationEnabled(readBool(params, 'dreamscreenemulation', false))
    setGroupId(readNumber(params, 'dreamscreengroupid', 0))
    setColorSmoothing(readNumber(params, 'dreamscreenlowcolorsmoothing', 0))
  }, [params])

  const applyDreamscreen = async () => {
    setMessage('')
    try {
      await api.setParam('setdreamscreensupport', supportEnabled ? 1 : 0)
      await api.setParam('setdreamscreenemulation', emulationEnabled ? 1 : 0)
      await api.setParam('setdreamscreengroup', groupId)
      await api.setParam('setdreamscreencolorsmoothing', colorSmoothing)
      setMessage('DreamScreen settings updated')
    } catch (err) {
      setMessage(err.message || 'Failed to update DreamScreen settings')
    }
  }

  const refreshDreamscreen = async () => {
    setMessage('')
    try {
      const result = await api.refreshDreamscreenDevices()
      setMessage(result)
    } catch (err) {
      setMessage(err.message || 'Failed to refresh DreamScreen devices')
    }
  }

  const scanNetworks = async () => {
    setMessage('')
    try {
      const result = await api.scanWifi()
      const list = result?.networks ? Object.values(result.networks).map((n) => n.SSID) : []
      setNetworks(list)
      setMessage('Network scan complete')
    } catch (err) {
      setMessage(err.message || 'Failed to scan networks')
    }
  }

  const addToNetwork = async () => {
    if (!networkSsid) {
      setMessage('Select a network SSID')
      return
    }
    setMessage('')
    try {
      const result = await api.addDreamscreenToNetwork(networkSsid)
      setMessage(result)
    } catch (err) {
      setMessage(err.message || 'Failed to add to network')
    }
  }

  return (
    <div className="page">
      <h1>DreamScreen</h1>
      <StatusCard />
      <section className="card">
        <h2>DreamScreen Controls</h2>
        <div className="form-grid">
          <label>
            <input
              type="checkbox"
              checked={supportEnabled}
              onChange={(event) => setSupportEnabled(event.target.checked)}
            />
            Enable DreamScreen Support
          </label>
          <label>
            <input
              type="checkbox"
              checked={emulationEnabled}
              onChange={(event) => setEmulationEnabled(event.target.checked)}
            />
            Enable Emulation
          </label>
          <label htmlFor="dreamscreenGroup">Group ID</label>
          <input
            id="dreamscreenGroup"
            type="number"
            value={groupId}
            onChange={(event) => setGroupId(Number(event.target.value))}
          />
          <label htmlFor="dreamscreenSmoothing">Color Smoothing</label>
          <input
            id="dreamscreenSmoothing"
            type="number"
            value={colorSmoothing}
            onChange={(event) => setColorSmoothing(Number(event.target.value))}
          />
        </div>
        <div className="button-grid">
          <button type="button" onClick={applyDreamscreen}>
            Apply DreamScreen Settings
          </button>
          <button type="button" onClick={refreshDreamscreen}>
            Refresh DreamScreen Devices
          </button>
          <button
            type="button"
            className="button secondary"
            disabled={resetting}
            onClick={async () => {
              setResetting(true)
              setMessage('')
              try {
                await applyDefaults(DREAMSCREEN_DEFAULTS)
                await refresh()
                setMessage('DreamScreen settings reset to defaults')
              } catch (err) {
                setMessage(err.message || 'Failed to reset DreamScreen settings')
              } finally {
                setResetting(false)
              }
            }}
          >
            {resetting ? 'Resetting…' : 'Reset to default'}
          </button>
        </div>
      </section>
      <section className="card">
        <h2>Network Join</h2>
        <div className="form-grid">
          <label htmlFor="dreamscreenSsid">Network SSID</label>
          <input
            id="dreamscreenSsid"
            type="text"
            value={networkSsid}
            onChange={(event) => setNetworkSsid(event.target.value)}
            list="dreamscreen-ssids"
          />
          <datalist id="dreamscreen-ssids">
            {networks.map((ssid) => (
              <option key={ssid} value={ssid} />
            ))}
          </datalist>
        </div>
        <div className="button-grid">
          <button type="button" onClick={scanNetworks}>
            Scan Networks
          </button>
          <button type="button" onClick={addToNetwork}>
            Add to Network
          </button>
        </div>
        {message && <div className="muted">{message}</div>}
      </section>
      <ParamSetter />
    </div>
  )
}
