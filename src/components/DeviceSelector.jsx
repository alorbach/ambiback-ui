import { useRef, useState } from 'react'
import useDevice from '../hooks/useDevice.js'
import { useDeviceParamsContext } from '../contexts/DeviceParamsContext.jsx'
import { api, getRecentDevices, normalizeBaseUrl } from '../api/client.js'

export default function DeviceSelector() {
  const { baseUrl, updateBaseUrl } = useDevice()
  const { params, loading, error } = useDeviceParamsContext()
  const [showRecent, setShowRecent] = useState(false)
  const [discovering, setDiscovering] = useState(false)
  const [discoverResults, setDiscoverResults] = useState(null)
  const [discoverError, setDiscoverError] = useState('')
  const [discoverSubnet, setDiscoverSubnet] = useState('')
  const abortRef = useRef(null)
  const recent = getRecentDevices().filter((u) => u !== baseUrl)

  const connected = !loading && !error && params
  const deviceName = params?.devicename || params?.deviceip

  /** Build entry for the current device (never returned by discover API) */
  const currentDeviceEntry = () => {
    if (!baseUrl) return null
    const ip = baseUrl.replace(/^https?:\/\//, '').split('/')[0]
    return {
      ip: baseUrl,
      DeviceIP: ip,
      DeviceName: params?.devicename || params?.deviceip || null,
      devicename: params?.devicename,
      deviceip: params?.deviceip,
      DeviceVersion: params?.deviceversion,
      deviceversion: params?.deviceversion,
    }
  }

  /** Deduplicate discovery results by MAC or IP, prepend current device so it's always first */
  const deduplicateDevices = (list) => {
    const current = currentDeviceEntry()
    const combined = current ? [current, ...(list || [])] : list || []
    if (combined.length === 0) return combined
    const seen = new Set()
    return combined.filter((item) => {
      const ip = item.DeviceIP || item.Deviceip
      const fromUrl = item.ip ? item.ip.replace(/^https?:\/\//, '').split('/')[0] : ''
      const key = (item.DeviceMAC || item.devicemac || ip || fromUrl || '').toString().toLowerCase()
      if (!key || seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  const deriveSubnet = () => {
    if (!baseUrl) return ''
    const m = baseUrl.match(/^https?:\/\/(\d+\.\d+\.\d+)\.?\d*$/)
    return m ? m[1] : ''
  }

  const runDiscover = async () => {
    setDiscovering(true)
    setDiscoverError('')
    setDiscoverResults(null)
    setDiscoverSubnet('')
    abortRef.current = new AbortController()

    try {
      if (baseUrl) {
        try {
          const devices = await api.discoverViaEndpoint()
          const deduped = deduplicateDevices(devices)
          setDiscoverResults(deduped)
          if (deduped.length === 0) setDiscoverError('No devices found')
        } catch (e) {
          const msg = e.message || ''
          const is404 = msg.includes('404') || msg.includes('Not Found')
          setDiscoverError(
            is404
              ? 'Network discovery needs a firmware update. Try scanning your subnet manually below, or enter a device IP above.'
              : `Discovery failed: ${msg}`
          )
          setDiscoverSubnet(deriveSubnet() || '192.168.1')
        }
      } else {
        setDiscoverError(
          'Connect to one device first (enter IP), then use Discover. Or use subnet scan below.'
        )
        setDiscoverSubnet(deriveSubnet() || '192.168.1')
      }
    } catch (e) {
      setDiscoverError(e.message || 'Discovery failed')
    } finally {
      setDiscovering(false)
    }
  }

  const runSubnetScan = async () => {
    if (!discoverSubnet.trim()) return
    setDiscovering(true)
    setDiscoverError('')
    setDiscoverResults(null)
    abortRef.current = new AbortController()

    try {
      const devices = await api.discoverDevices(discoverSubnet.trim(), abortRef.current.signal)
      const deduped = deduplicateDevices(devices)
      setDiscoverResults(deduped)
      if (deduped.length === 0) setDiscoverError('No devices found')
    } catch (e) {
      if (e.name !== 'AbortError') setDiscoverError(e.message || 'Scan failed')
    } finally {
      setDiscovering(false)
    }
  }

  const selectDevice = (item) => {
    const url = item?.ip || (item?.DeviceIP ? `http://${item.DeviceIP}` : null)
    if (url) {
      updateBaseUrl(normalizeBaseUrl(url))
    } else if (typeof item === 'string') {
      updateBaseUrl(normalizeBaseUrl(item))
    }
  }

  return (
    <div className="device-selector">
      <label htmlFor="deviceBase">Device URL or IP</label>
      <div className="device-selector-row">
        <span
          className={`device-status-dot ${loading ? 'loading' : connected ? 'ok' : 'error'}`}
          title={loading ? 'Connecting...' : connected ? 'Connected' : 'Disconnected'}
          aria-hidden
        />
        <input
          id="deviceBase"
          type="text"
          placeholder="http://192.168.0.50"
          value={baseUrl}
          onChange={(event) => updateBaseUrl(event.target.value)}
        />
      </div>
      {deviceName && (
        <div className="device-name-badge" title={baseUrl}>
          {deviceName}
        </div>
      )}
      <div className="device-actions">
        <button
          type="button"
          className="button secondary device-discover-btn"
          disabled={discovering}
          onClick={() => {
            if (discoverResults !== null || discoverSubnet) {
              setDiscoverResults(null)
              setDiscoverSubnet('')
              setDiscoverError('')
            } else {
              runDiscover()
            }
          }}
        >
          {discovering
            ? 'Discovering…'
            : discoverResults !== null
              ? 'Close'
              : discoverSubnet
                ? 'Cancel'
                : 'Discover'}
        </button>
        {discoverResults === null && discoverSubnet && (
          <>
            <p className="device-scan-warning">
              Subnet scan finds devices with CORS support (firmware 0.4.2xx+). For older devices, enter the IP manually above.
            </p>
            <input
              type="text"
              className="device-subnet-input"
              placeholder="192.168.1 or 172.21.0"
              value={discoverSubnet}
              onChange={(e) => setDiscoverSubnet(e.target.value)}
            />
            <button
              type="button"
              className="button secondary"
              disabled={discovering}
              onClick={runSubnetScan}
            >
              Scan subnet
            </button>
          </>
        )}
      </div>
      {discoverError && <div className="device-discover-error">{discoverError}</div>}
      {discoverResults && discoverResults.length > 0 && (
        <ul className="device-discover-list">
          {discoverResults.map((item, i) => {
            const url = item.ip || (item.DeviceIP ? `http://${item.DeviceIP}` : null)
            const ip = url ? url.replace(/^https?:\/\//, '') : ''
            const hasName =
              (item.DeviceName && item.DeviceName.trim()) ||
              (item.devicename && item.devicename.trim())
            const displayName =
              item.DeviceName?.trim() || item.devicename?.trim() || null
            const version = item.DeviceVersion || item.deviceversion
            return (
              <li key={url || i}>
                <button
                  type="button"
                  className="device-discover-item"
                  onClick={() => selectDevice(item)}
                >
                  <span className="device-discover-name">
                    {displayName || (ip ? `Device at ${ip}` : `Device ${i + 1}`)}
                  </span>
                  {ip && (
                    <span className="device-discover-ip">
                      {displayName ? ip : ''}
                    </span>
                  )}
                  {version && (
                    <span className="device-discover-version">{version}</span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
      {recent.length > 0 && (
        <div className="device-recent">
          <button
            type="button"
            className="device-recent-toggle"
            onClick={() => setShowRecent((v) => !v)}
            aria-expanded={showRecent}
          >
            Recent ({recent.length})
          </button>
          {showRecent && (
            <ul className="device-recent-list">
              {recent.map((url) => (
                <li key={url}>
                  <button
                    type="button"
                    className="device-recent-item"
                    onClick={() => {
                      updateBaseUrl(url)
                      setShowRecent(false)
                    }}
                  >
                    {url.replace(/^https?:\/\//, '')}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <div className="device-hint">
        Tip: add <code>?device=192.168.0.50</code> to the URL
      </div>
    </div>
  )
}
