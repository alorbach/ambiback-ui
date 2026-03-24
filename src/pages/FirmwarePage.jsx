import { useEffect, useState } from 'react'
import { api } from '../api/client.js'
import useDeviceParams from '../hooks/useDeviceParams.js'
import { readString } from '../utils/paramUtils.js'

function parseVersion(versionStr) {
  if (!versionStr) return { major: 0, minor: 0, build: 0 }
  const parts = versionStr.split('.')
  return {
    major: parseInt(parts[0] || '0', 10) || 0,
    minor: parseInt(parts[1] || '0', 10) || 0,
    build: parseInt(parts[2] || '0', 10) || 0,
  }
}

function compareVersions(leftVersion, rightVersion) {
  const left = parseVersion(leftVersion)
  const right = parseVersion(rightVersion)

  if (left.major !== right.major) return left.major - right.major
  if (left.minor !== right.minor) return left.minor - right.minor
  return left.build - right.build
}

function isVersionNewerOrEqual(leftVersion, rightVersion) {
  return compareVersions(leftVersion, rightVersion) >= 0
}

export default function FirmwarePage() {
  const { params } = useDeviceParams()
  const [firmwareInfo, setFirmwareInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [checkLoading, setCheckLoading] = useState(false)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [selectedVersion, setSelectedVersion] = useState('')
  const [versions, setVersions] = useState([])
  const [updateProgress, setUpdateProgress] = useState(null)

  const deviceVersion = readString(params, 'deviceversion', '')
  const firmwareBaseUrl = readString(params, 'firmwarebaseurl', '')

  const checkForUpdate = async () => {
    setCheckLoading(true)
    setMessage('')
    try {
      const index = await api.getFirmwareIndex()
      if (index?.error) throw new Error(index.error)
      const major = index.major ?? 0
      const minor = index.minor ?? 0
      const build = index.build ?? 0
      const latest = `${major}.${minor}.${build}`
      const opts = []

      opts.push({ value: latest, label: `Latest Version ${latest}${isVersionNewerOrEqual(deviceVersion, latest) ? ' (installed)' : ''}` })
      setSelectedVersion(latest)

      if (index.allowdowngrade === 1 && Array.isArray(index.downgradebuilds)) {
        for (const b of index.downgradebuilds) {
          if (b && (b.major != null || b.build != null)) {
            const v = `${b.major ?? 0}.${b.minor ?? 0}.${b.build ?? 0}`
            opts.push({ value: v, label: `Old Version ${v} (downgrade)` })
          }
        }
      }
      if (index.allowbeta === 1 && Array.isArray(index.betabuilds)) {
        for (const b of index.betabuilds) {
          if (b && (b.major != null || b.build != null)) {
            const v = `${b.major ?? 0}.${b.minor ?? 0}.${b.build ?? 0}`
            opts.push({ value: v, label: `BETA Version ${v} (UNSTABLE)` })
          }
        }
      }

      setVersions(opts)
      setFirmwareInfo(index)
      const hasUpdate = !isVersionNewerOrEqual(deviceVersion, latest) || index.forceupdate === 1
      setMessage(hasUpdate ? `Latest firmware is ${latest}. Click Update to install.` : `Latest firmware is ${latest}. You are up to date.`)
    } catch (err) {
      const msg = err.message || ''
      const friendly =
        msg.includes('404') ? 'Device firmware too old for automatic check. Use Manual Update below to flash first.' :
        msg.includes('Failed to fetch') || msg.includes('NetworkError') ? 'Cannot reach device. Check connection.' :
        `Failed to check for updates: ${msg}`
      setMessage(friendly)
      setFirmwareInfo(null)
      setVersions([])
    } finally {
      setCheckLoading(false)
    }
  }

  const startUpdate = async () => {
    if (!selectedVersion) {
      setMessage('Select a firmware version first.')
      return
    }
    setUpdateLoading(true)
    setMessage('Starting firmware update…')
    setUpdateProgress({ status: 1 })
    try {
      const result = await api.autoUpdate(selectedVersion)
      if (result?.status === 1) {
        setMessage('Firmware update started. Device is downloading…')
        pollUpdateStatus()
      } else {
        setMessage(result?.error || 'Update request failed.')
        setUpdateLoading(false)
      }
    } catch (err) {
      setMessage(`Update error: ${err.message}`)
      setUpdateLoading(false)
    }
  }

  const pollUpdateStatus = async () => {
    const poll = async () => {
      try {
        const st = await api.updateStatus()
        setUpdateProgress(st)
        if (st?.status === 0) {
          setUpdateLoading(false)
          if (st?.error) {
            setMessage(`Update failed: ${st.error}`)
          } else if (st?.reboot === 1) {
            setMessage('Update successful! Device is rebooting…')
          } else {
            setMessage('Update completed.')
          }
          return
        }
        setTimeout(poll, 500)
      } catch {
        setTimeout(poll, 1000)
      }
    }
    setTimeout(poll, 500)
  }

  useEffect(() => {
    if (!firmwareBaseUrl) return /* only auto-check when device has firmware proxy */
    let cancelled = false
    setCheckLoading(true)
    api
      .getFirmwareIndex()
      .then((index) => {
        if (cancelled) return
        if (index?.error) throw new Error(index.error)
        const major = index.major ?? 0
        const minor = index.minor ?? 0
        const build = index.build ?? 0
        const latest = `${major}.${minor}.${build}`
        const opts = [{ value: latest, label: `Latest Version ${latest}${isVersionNewerOrEqual(deviceVersion, latest) ? ' (installed)' : ''}` }]
        setSelectedVersion(latest)
        if (index.allowdowngrade === 1 && Array.isArray(index.downgradebuilds)) {
          for (const b of index.downgradebuilds) {
            if (b && (b.major != null || b.build != null)) {
              const v = `${b.major ?? 0}.${b.minor ?? 0}.${b.build ?? 0}`
              opts.push({ value: v, label: `Old Version ${v} (downgrade)` })
            }
          }
        }
        if (index.allowbeta === 1 && Array.isArray(index.betabuilds)) {
          for (const b of index.betabuilds) {
            if (b && (b.major != null || b.build != null)) {
              const v = `${b.major ?? 0}.${b.minor ?? 0}.${b.build ?? 0}`
              opts.push({ value: v, label: `BETA Version ${v} (UNSTABLE)` })
            }
          }
        }
        setVersions(opts)
        setFirmwareInfo(index)
        setMessage(!isVersionNewerOrEqual(deviceVersion, latest) || index.forceupdate === 1 ? `Latest firmware is ${latest}. Click Update to install.` : `Latest firmware is ${latest}. You are up to date.`)
      })
      .catch((err) => {
        if (cancelled) return
        const msg = err.message || ''
        const friendly =
          msg.includes('404') ? 'Device firmware too old for automatic check. Use Manual Update below to flash first.' :
          msg.includes('Failed to fetch') || msg.includes('NetworkError') ? 'Cannot reach device. Check connection.' :
          `Failed to check for updates: ${msg}`
        setMessage(friendly)
      })
      .finally(() => {
        if (!cancelled) setCheckLoading(false)
      })
    return () => { cancelled = true }
  }, [firmwareBaseUrl, currentBuild])

  const canUpdate =
    selectedVersion &&
    (firmwareInfo?.forceupdate === 1 ||
      isVersionNewerOrEqual(selectedVersion, deviceVersion) ||
      (!isVersionNewerOrEqual(selectedVersion, deviceVersion) && firmwareInfo?.allowdowngrade === 1))
  const currentIsLatest = selectedVersion ? isVersionNewerOrEqual(deviceVersion, selectedVersion) : false

  return (
    <section className="card card-full">
      <header className="card-header">
        <h1>Firmware Update</h1>
      </header>

      <div className="card-body">
        <p className="muted">Current version: {deviceVersion || '—'}</p>
        {params && !firmwareBaseUrl && (
          <p className="muted" style={{ color: 'var(--pico-del-color)' }}>
            Automatic update requires device firmware 0.5.xxx or newer (with firmwarebaseurl). Use Manual Update below to flash first.
          </p>
        )}

        <div className="form-grid" style={{ maxWidth: 400 }}>
          <div>
            <h3>Automatic Update</h3>
            <p className="muted">Check for new firmware and install via OTA.</p>
          </div>

          <label htmlFor="firmware_version">Firmware Version</label>
          <select
            id="firmware_version"
            value={selectedVersion}
            onChange={(e) => setSelectedVersion(e.target.value)}
            disabled={versions.length === 0}
          >
            <option value="">— Select —</option>
            {versions.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </select>

          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={checkForUpdate}
              disabled={checkLoading || !params}
              className="secondary"
            >
              {checkLoading ? 'Checking…' : 'Check for Update'}
            </button>
            <button
              type="button"
              onClick={startUpdate}
              disabled={updateLoading || !canUpdate}
              className={canUpdate && !currentIsLatest ? '' : 'secondary'}
            >
              {updateLoading ? 'Updating…' : 'Update'}
            </button>
          </div>
        </div>

        {message && (
          <div
            className="muted"
            style={{ marginTop: 16, color: message.includes('Failed') || message.includes('error') ? 'var(--pico-del-color)' : undefined }}
          >
            {message}
          </div>
        )}

        {updateLoading && updateProgress?.status === 1 && (
          <div className="muted" style={{ marginTop: 8 }}>
            Downloading firmware… Please wait. Do not power off the device.
          </div>
        )}
      </div>

      <div className="card-body">
        <h3>Manual Update</h3>
        <p className="muted">
          Upload a firmware file directly to the device.{' '}
          <a href={api.updateUrl()} target="_blank" rel="noopener noreferrer">
            Open OTA Update page
          </a>
        </p>
      </div>
    </section>
  )
}
