import { useEffect, useRef, useState } from 'react'
import ParamSetter from '../components/ParamSetter.jsx'
import useDeviceParams from '../hooks/useDeviceParams.js'
import { api } from '../api/client.js'
import { readBool, readNumber, readString } from '../utils/paramUtils.js'
import { useUiSettings } from '../contexts/UiSettingsContext.jsx'
import jsHue from '../vendor/jshue.js'
import { applyDefaults } from '../utils/applyDefaults.js'
import { HUE_DEFAULTS } from '../utils/paramDefaults.js'

export default function HuePage() {
  const { params, refresh } = useDeviceParams()
  const [message, setMessage] = useState('')
  const [resetting, setResetting] = useState(false)
  const { advanced } = useUiSettings()
  const timersRef = useRef({})
  const hueApiRef = useRef(null)
  const bridgeRef = useRef(null)
  const userRef = useRef(null)
  const [supportEnabled, setSupportEnabled] = useState(false)
  const [bridgeIp, setBridgeIp] = useState('')
  const [bridgeUser, setBridgeUser] = useState('')
  const [bridgeClientKey, setBridgeClientKey] = useState('')
  const [frameLength, setFrameLength] = useState(0)
  const [handshakeTimeout, setHandshakeTimeout] = useState(0)
  const [preset, setPreset] = useState(0)
  const [deviceId, setDeviceId] = useState('')
  const [connecting, setConnecting] = useState(false)
  const [bridgeConnected, setBridgeConnected] = useState(false)
  const [discoverMessage, setDiscoverMessage] = useState('')
  const [lightsMessage, setLightsMessage] = useState('')
  const [lightsLoading, setLightsLoading] = useState(false)
  const [lights, setLights] = useState([])
  const [lightSettings, setLightSettings] = useState({})

  const isCustomPreset = preset === 999
  const controlsDisabled = !supportEnabled
  const lightControlsDisabled = !bridgeConnected
  const topZones = [0, 1, 2, 3, 4]
  const bottomZones = [7, 8, 9, 10, 11]

  useEffect(() => {
    hueApiRef.current = jsHue()
  }, [])

  useEffect(() => {
    if (!bridgeIp) {
      discoverBridges()
    }
  }, [bridgeIp])

  useEffect(() => {
    if (!params) return
    setSupportEnabled(readBool(params, 'huesupportenabled', false))
    setBridgeIp(readString(params, 'huebridgeip', ''))
    setBridgeUser(readString(params, 'hueubridgeuser', readString(params, 'huebridgeuser', '')))
    setFrameLength(readNumber(params, 'hueframelength', 0))
    setHandshakeTimeout(readNumber(params, 'huehandshaketimeout', 0))
    setPreset(readNumber(params, 'huepreset', 0))
    setDeviceId(readString(params, 'deviceid', ''))
  }, [params])

  useEffect(() => {
    if (!hueApiRef.current || !bridgeIp) {
      bridgeRef.current = null
      userRef.current = null
      setBridgeConnected(false)
      return
    }
    bridgeRef.current = hueApiRef.current.bridge(bridgeIp)
    if (bridgeUser) {
      userRef.current = bridgeRef.current.user(bridgeUser)
      setBridgeConnected(true)
    } else {
      userRef.current = null
      setBridgeConnected(false)
    }
  }, [bridgeIp, bridgeUser])

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
        setMessage(err.message || 'Failed to update Hue settings')
      }
    }, 300)
  }

  const queuePreset = (param, value) => {
    const key = `preset-${param}`
    if (timersRef.current[key]) {
      clearTimeout(timersRef.current[key])
    }
    timersRef.current[key] = setTimeout(async () => {
      setMessage('')
      try {
        const result = await api.setPreset(param, value)
        setMessage(result)
      } catch (err) {
        setMessage(err.message || 'Failed to update Hue preset')
      }
    }, 300)
  }

  const queueLightParam = (key, param, id, value, zone) => {
    if (timersRef.current[key]) {
      clearTimeout(timersRef.current[key])
    }
    timersRef.current[key] = setTimeout(async () => {
      setLightsMessage('')
      try {
        const result = await api.setHueLightParam({ param, id, value, zone })
        setLightsMessage(result)
      } catch (err) {
        setLightsMessage(err.message || 'Failed to update Hue light')
      }
    }, 300)
  }

  const discoverBridges = async () => {
    if (!hueApiRef.current) return
    setDiscoverMessage('')
    try {
      const bridges = await hueApiRef.current.discover()
      if (!bridges?.length) {
        setDiscoverMessage('No Hue bridges found.')
        return
      }
      if (!bridgeIp) {
        setBridgeIp(bridges[0].internalipaddress || '')
      }
      setDiscoverMessage(`Found ${bridges.length} bridge(s).`)
    } catch (err) {
      setDiscoverMessage(err.message || 'Failed to discover Hue bridges')
    }
  }

  const handleConnect = async () => {
    if (!bridgeRef.current) {
      setMessage('Enter a bridge IP first.')
      return
    }
    setConnecting(true)
    setMessage('')
    try {
      const appId = deviceId ? `${deviceId}#AmbiBack` : 'AmbiBack#AmbiBack'
      const data = await bridgeRef.current.createUser(appId)
      const success = data?.[0]?.success
      if (!success?.username) {
        throw new Error('Bridge did not return a username. Press the link button and try again.')
      }
      const nextUser = success.username
      const nextKey = success.clientkey || ''
      setBridgeUser(nextUser)
      setBridgeClientKey(nextKey)
      userRef.current = bridgeRef.current.user(nextUser)
      setBridgeConnected(true)
      await api.setParam('sethuebridgeip', bridgeIp)
      await api.setParam('sethuebridgeuser', nextUser)
      if (nextKey) {
        await api.setParam('sethuebridgeclientkey', nextKey)
      }
      setMessage('Bridge connected. Loading devices...')
      await refreshLights()
    } catch (err) {
      setMessage(err.message || 'Failed to connect to Hue bridge')
    } finally {
      setConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    bridgeRef.current = null
    userRef.current = null
    setBridgeConnected(false)
    setBridgeUser('')
    setBridgeClientKey('')
    setLights([])
    setLightSettings({})
    setMessage('')
    try {
      await api.setParam('sethuebridgeuser', '')
      await api.setParam('sethuebridgeclientkey', '')
    } catch (err) {
      setMessage(err.message || 'Failed to clear Hue bridge user')
    }
  }

  const parseHueSettings = (text, id) => {
    const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const safeId = escapeRegExp(id)
    const settings = {
      enabled: false,
      zones: Array.from({ length: 12 }, () => false),
      colbrightness: 255,
      colcorred: 100,
      colcorgreen: 100,
      colcorblue: 100,
    }
    const enabledMatch = text.match(
      new RegExp(`hueVars\\['${safeId}'\\]\\.enabled = (true|false)`),
    )
    if (enabledMatch) {
      settings.enabled = enabledMatch[1] === 'true'
    }
    const zoneRegex = new RegExp(
      `hueVars\\['${safeId}'\\]\\.zones\\[(\\d+)\\] = (true|false)`,
      'g',
    )
    for (const match of text.matchAll(zoneRegex)) {
      const idx = Number(match[1])
      if (Number.isInteger(idx) && idx >= 0 && idx < settings.zones.length) {
        settings.zones[idx] = match[2] === 'true'
      }
    }
    const numericField = (field, fallback) => {
      const match = text.match(
        new RegExp(`hueVars\\['${safeId}'\\]\\.${field} = ['"]?(\\d+)['"]?`),
      )
      return match ? Number(match[1]) : fallback
    }
    settings.colbrightness = numericField('colbrightness', settings.colbrightness)
    settings.colcorred = numericField('colcorred', settings.colcorred)
    settings.colcorgreen = numericField('colcorgreen', settings.colcorgreen)
    settings.colcorblue = numericField('colcorblue', settings.colcorblue)
    return settings
  }

  const loadLightSettings = async (lightId) => {
    try {
      const script = await api.getHueLightSettings(lightId)
      const settings = parseHueSettings(script, lightId)
      setLightSettings((prev) => ({ ...prev, [lightId]: settings }))
    } catch (err) {
      setLightSettings((prev) => ({ ...prev, [lightId]: prev[lightId] || null }))
    }
  }

  const isColorLight = (light) => {
    const type = (light?.type || '').toLowerCase()
    const product = (light?.productname || '').toLowerCase()
    return (
      type.includes('color light') ||
      type.includes('extended color light') ||
      product.includes('color lamp') ||
      product.includes('color light')
    )
  }

  const refreshLights = async () => {
    if (!userRef.current) {
      setLightsMessage('Connect to a Hue bridge first.')
      return
    }
    setLightsLoading(true)
    setLightsMessage('')
    try {
      const data = await userRef.current.getLights()
      const list = Object.values(data || {})
        .filter((light) => light?.uniqueid)
        .filter((light) => isColorLight(light))
      setLights(list)
      await api.refreshHueDevices()
      for (const light of list) {
        await loadLightSettings(light.uniqueid)
      }
    } catch (err) {
      setLightsMessage(err.message || 'Failed to refresh Hue lights')
    } finally {
      setLightsLoading(false)
    }
  }

  useEffect(() => {
    if (bridgeConnected && lights.length === 0) {
      refreshLights()
    }
  }, [bridgeConnected])

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
      <section className="card">
        <header className="card-header">
          <h2>Hue Bridge</h2>
          <div className="card-actions">
            <button type="button" onClick={discoverBridges}>
              Discover
            </button>
            <button type="button" onClick={handleConnect} disabled={connecting || !bridgeIp}>
              Connect
            </button>
            <button type="button" onClick={handleDisconnect} disabled={!bridgeConnected}>
              Disconnect
            </button>
          </div>
        </header>
        <div className="layout-grid">
          <div className="layout-field">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={supportEnabled}
                onChange={(event) => {
                  const next = event.target.checked
                  setSupportEnabled(next)
                  queueParam('sethuesupport', next ? 1 : 0)
                }}
              />
              Enable Hue Support
            </label>
          </div>
          <div className="layout-field">
            <label htmlFor="hueBridgeIp">Bridge IP</label>
            <input
              id="hueBridgeIp"
              type="text"
              value={bridgeIp}
              onChange={(event) => {
                const next = event.target.value
                setBridgeIp(next)
                queueParam('sethuebridgeip', next)
              }}
            />
          </div>
          <div className="layout-field">
            <label htmlFor="hueBridgeUser">Bridge User</label>
            <input
              id="hueBridgeUser"
              type="password"
              value={bridgeUser}
              onChange={(event) => {
                const next = event.target.value
                setBridgeUser(next)
                queueParam('sethuebridgeuser', next)
              }}
              disabled={controlsDisabled}
            />
          </div>
          <div className="layout-field">
            <label htmlFor="huePreset">Preset</label>
            <select
              id="huePreset"
              value={preset}
              onChange={(event) => {
                const next = Number(event.target.value)
                setPreset(next)
                if (next !== 0) {
                  queuePreset('sethuepreset', next)
                }
              }}
              disabled={controlsDisabled}
            >
              <option value={0}>Select</option>
              <option value={1}>Ultra</option>
              <option value={2}>Fast</option>
              <option value={3}>Normal</option>
              <option value={999}>Custom</option>
            </select>
          </div>
        </div>
        {isCustomPreset && (
          <div className="layout-grid">
            <div className="layout-field">
              <label htmlFor="hueFrameLength">Frame Length</label>
              <div className="range-row">
                <input
                  id="hueFrameLength"
                  type="range"
                  min="20"
                  max="100"
                  step="5"
                  value={frameLength}
                  onChange={(event) => {
                    const next = Number(event.target.value)
                    setFrameLength(next)
                    queueParam('sethueframelength', next)
                  }}
                  disabled={controlsDisabled}
                />
                <div className="muted">{frameLength}</div>
              </div>
            </div>
            <div className="layout-field">
              <label htmlFor="hueHandshake">Handshake Timeout</label>
              <div className="range-row">
                <input
                  id="hueHandshake"
                  type="range"
                  min="5"
                  max="60"
                  step="1"
                  value={handshakeTimeout}
                  onChange={(event) => {
                    const next = Number(event.target.value)
                    setHandshakeTimeout(next)
                    queueParam('sethuehandshaketimeout', next)
                  }}
                  disabled={controlsDisabled}
                />
                <div className="muted">{handshakeTimeout}</div>
              </div>
            </div>
          </div>
        )}
        <div className="button-row">
          <button
            type="button"
            className="button secondary"
            disabled={resetting || controlsDisabled}
            onClick={async () => {
              setResetting(true)
              setMessage('')
              try {
                await applyDefaults(HUE_DEFAULTS)
                await refresh()
                setMessage('Hue settings reset to defaults')
              } catch (err) {
                setMessage(err.message || 'Failed to reset Hue settings')
              } finally {
                setResetting(false)
              }
            }}
          >
            {resetting ? 'Resetting…' : 'Reset to default'}
          </button>
        </div>
        <div className="muted">
          Press the Hue bridge link button before connecting.
        </div>
        {advanced && (
          <div className="layout-grid">
            <div className="layout-field">
              <label htmlFor="hueBridgeKey">Bridge Client Key</label>
              <input
                id="hueBridgeKey"
                type="password"
                value={bridgeClientKey}
                onChange={(event) => {
                  const next = event.target.value
                  setBridgeClientKey(next)
                  queueParam('sethuebridgeclientkey', next)
                }}
                disabled={controlsDisabled}
              />
            </div>
          </div>
        )}
        {discoverMessage && <div className="muted">{discoverMessage}</div>}
        {message && <div className="muted">{message}</div>}
      </section>
      <section className="card">
        <header className="card-header">
          <h2>Hue Devices</h2>
          <div className="card-actions">
            <button type="button" onClick={refreshLights} disabled={!bridgeConnected || lightsLoading}>
              {lightsLoading ? 'Scanning...' : 'Scan Devices'}
            </button>
            <button type="button" onClick={refreshHue} disabled={!bridgeConnected}>
              Refresh Controller
            </button>
          </div>
        </header>
        {!bridgeConnected && <div className="muted">Connect to a Hue bridge to load lights.</div>}
        {bridgeConnected && lights.length === 0 && (
          <div className="muted">No Hue lights loaded yet.</div>
        )}
        {lights.length > 0 && (
          <div className="hue-light-list">
            {lights.map((light) => {
              const settings = lightSettings[light.uniqueid]
              const zones = settings?.zones || Array.from({ length: 12 }, () => false)
              return (
                <details
                  key={light.uniqueid}
                  className={`hue-light ${settings?.enabled ? 'enabled' : ''}`}
                >
                  <summary className="hue-light-summary">
                    <div className="hue-light-title">
                      <span>{light.productname || 'Hue Light'}</span>
                      <span className="muted">{light.name}</span>
                    </div>
                    <label
                      className="checkbox hue-light-toggle"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={settings?.enabled || false}
                        onChange={(event) => {
                          const next = event.target.checked
                          setLightSettings((prev) => ({
                            ...prev,
                            [light.uniqueid]: { ...prev[light.uniqueid], enabled: next },
                          }))
                          queueLightParam(
                            `hue-light-enable-${light.uniqueid}`,
                            'sethuelightenable',
                            light.uniqueid,
                            next ? 1 : 0,
                          )
                        }}
                        disabled={lightControlsDisabled}
                      />
                      Include
                    </label>
                  </summary>
                  <div className="hue-light-body">
                    <div className="hue-section-title">Sector settings</div>
                    <div className="layout-field">
                      <label>Zone Mapping (Backside)</label>
                    <div className="hue-tv">
                      <div className="hue-tv-frame">
                        <div className="hue-tv-screen" />
                        <div className="hue-tv-zone-row hue-tv-zone-row-top">
                          {topZones.map((zone) => {
                            const active = zones[zone]
                            return (
                              <button
                                key={`hue-zone-top-${zone}`}
                                type="button"
                                className={`hue-tv-zone ${active ? 'active' : ''}`}
                                onClick={() => {
                                  const next = !active
                                  setLightSettings((prev) => ({
                                    ...prev,
                                    [light.uniqueid]: {
                                      ...prev[light.uniqueid],
                                      zones: zones.map((value, zoneIndex) =>
                                        zoneIndex === zone ? next : value,
                                      ),
                                    },
                                  }))
                                  queueLightParam(
                                    `hue-light-zone-${light.uniqueid}-${zone}`,
                                    'sethuelightzone',
                                    light.uniqueid,
                                    next ? 1 : 0,
                                    zone,
                                  )
                                }}
                                aria-pressed={active}
                              disabled={lightControlsDisabled}
                              >
                                {zone + 1}
                              </button>
                            )
                          })}
                        </div>
                        <button
                          type="button"
                          className={`hue-tv-zone hue-tv-zone-left ${zones[5] ? 'active' : ''}`}
                          onClick={() => {
                            const next = !zones[5]
                            setLightSettings((prev) => ({
                              ...prev,
                              [light.uniqueid]: {
                                ...prev[light.uniqueid],
                                zones: zones.map((value, zoneIndex) =>
                                  zoneIndex === 5 ? next : value,
                                ),
                              },
                            }))
                            queueLightParam(
                              `hue-light-zone-${light.uniqueid}-5`,
                              'sethuelightzone',
                              light.uniqueid,
                              next ? 1 : 0,
                              5,
                            )
                          }}
                          aria-pressed={zones[5]}
                          disabled={lightControlsDisabled}
                        >
                          6
                        </button>
                        <button
                          type="button"
                          className={`hue-tv-zone hue-tv-zone-right ${zones[6] ? 'active' : ''}`}
                          onClick={() => {
                            const next = !zones[6]
                            setLightSettings((prev) => ({
                              ...prev,
                              [light.uniqueid]: {
                                ...prev[light.uniqueid],
                                zones: zones.map((value, zoneIndex) =>
                                  zoneIndex === 6 ? next : value,
                                ),
                              },
                            }))
                            queueLightParam(
                              `hue-light-zone-${light.uniqueid}-6`,
                              'sethuelightzone',
                              light.uniqueid,
                              next ? 1 : 0,
                              6,
                            )
                          }}
                          aria-pressed={zones[6]}
                          disabled={lightControlsDisabled}
                        >
                          7
                        </button>
                        <div className="hue-tv-zone-row hue-tv-zone-row-bottom">
                          {bottomZones.map((zone) => {
                            const active = zones[zone]
                            return (
                              <button
                                key={`hue-zone-bottom-${zone}`}
                                type="button"
                                className={`hue-tv-zone ${active ? 'active' : ''}`}
                                onClick={() => {
                                  const next = !active
                                  setLightSettings((prev) => ({
                                    ...prev,
                                    [light.uniqueid]: {
                                      ...prev[light.uniqueid],
                                      zones: zones.map((value, zoneIndex) =>
                                        zoneIndex === zone ? next : value,
                                      ),
                                    },
                                  }))
                                  queueLightParam(
                                    `hue-light-zone-${light.uniqueid}-${zone}`,
                                    'sethuelightzone',
                                    light.uniqueid,
                                    next ? 1 : 0,
                                    zone,
                                  )
                                }}
                                aria-pressed={active}
                              disabled={lightControlsDisabled}
                              >
                                {zone + 1}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                    <div className="hue-section-title">Color correction</div>
                    <div className="layout-grid hue-color-grid">
                      <div className="layout-field">
                        <label htmlFor={`hueBrightness-${light.uniqueid}`}>Max Brightness</label>
                        <div className="range-row">
                          <input
                            id={`hueBrightness-${light.uniqueid}`}
                            type="range"
                            min="0"
                            max="255"
                            value={settings?.colbrightness ?? 255}
                            onChange={(event) => {
                              const next = Number(event.target.value)
                              setLightSettings((prev) => ({
                                ...prev,
                                [light.uniqueid]: { ...prev[light.uniqueid], colbrightness: next },
                              }))
                              queueLightParam(
                                `hue-light-brightness-${light.uniqueid}`,
                                'sethuelightcolbrightness',
                                light.uniqueid,
                                next,
                              )
                            }}
                            disabled={lightControlsDisabled}
                          />
                          <div className="value-badge">{settings?.colbrightness ?? 255}</div>
                        </div>
                      </div>
                      <div className="layout-field">
                        <label htmlFor={`hueRed-${light.uniqueid}`}>Red</label>
                        <div className="range-row">
                          <input
                            id={`hueRed-${light.uniqueid}`}
                            type="range"
                            min="1"
                            max="200"
                            value={settings?.colcorred ?? 100}
                            onChange={(event) => {
                              const next = Number(event.target.value)
                              setLightSettings((prev) => ({
                                ...prev,
                                [light.uniqueid]: { ...prev[light.uniqueid], colcorred: next },
                              }))
                              queueLightParam(
                                `hue-light-red-${light.uniqueid}`,
                                'sethuelightcolcorred',
                                light.uniqueid,
                                next,
                              )
                            }}
                            className="range-red"
                            disabled={lightControlsDisabled}
                          />
                          <div className="value-badge">{settings?.colcorred ?? 100}</div>
                        </div>
                      </div>
                      <div className="layout-field">
                        <label htmlFor={`hueGreen-${light.uniqueid}`}>Green</label>
                        <div className="range-row">
                          <input
                            id={`hueGreen-${light.uniqueid}`}
                            type="range"
                            min="1"
                            max="200"
                            value={settings?.colcorgreen ?? 100}
                            onChange={(event) => {
                              const next = Number(event.target.value)
                              setLightSettings((prev) => ({
                                ...prev,
                                [light.uniqueid]: { ...prev[light.uniqueid], colcorgreen: next },
                              }))
                              queueLightParam(
                                `hue-light-green-${light.uniqueid}`,
                                'sethuelightcolcorgreen',
                                light.uniqueid,
                                next,
                              )
                            }}
                            className="range-green"
                            disabled={lightControlsDisabled}
                          />
                          <div className="value-badge">{settings?.colcorgreen ?? 100}</div>
                        </div>
                      </div>
                      <div className="layout-field">
                        <label htmlFor={`hueBlue-${light.uniqueid}`}>Blue</label>
                        <div className="range-row">
                          <input
                            id={`hueBlue-${light.uniqueid}`}
                            type="range"
                            min="1"
                            max="200"
                            value={settings?.colcorblue ?? 100}
                            onChange={(event) => {
                              const next = Number(event.target.value)
                              setLightSettings((prev) => ({
                                ...prev,
                                [light.uniqueid]: { ...prev[light.uniqueid], colcorblue: next },
                              }))
                              queueLightParam(
                                `hue-light-blue-${light.uniqueid}`,
                                'sethuelightcolcorblue',
                                light.uniqueid,
                                next,
                              )
                            }}
                            className="range-blue"
                            disabled={lightControlsDisabled}
                          />
                          <div className="value-badge">{settings?.colcorblue ?? 100}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </details>
              )
            })}
          </div>
        )}
        {lightsMessage && <div className="muted">{lightsMessage}</div>}
      </section>
      {advanced && <ParamSetter />}
    </div>
  )
}
