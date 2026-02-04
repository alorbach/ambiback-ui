import { useEffect, useMemo, useState } from 'react'
import { api } from '../api/client.js'

export default function StatusCard() {
  const [status, setStatus] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const refresh = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.getStatus()
      setStatus(data)
    } catch (err) {
      setError(err.message || 'Failed to load status')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const structured = useMemo(() => {
    if (!status) return []
    return [
      { label: 'Mode', value: status.modestatus },
      { label: 'Video', value: status.videostatus },
      { label: 'WiFi', value: status.wifinetwork },
      { label: 'RSSI', value: status.wifirssi },
      { label: 'LED FPS', value: status.ledfps },
      { label: 'Net FPS', value: status.netfps },
      { label: 'Dropped', value: status.netdrpfps },
      { label: 'Free Mem', value: status.freemem },
      { label: 'Free Heap', value: status.freeheap },
      { label: 'Free PSRAM', value: status.freepsram },
      { label: 'Cam FPS', value: status.camfps },
      { label: 'Hue', value: status.huestatus },
      { label: 'Hue FPS', value: status.huefps },
      { label: 'DreamScreen', value: status.dreamscreenstatus },
      { label: 'DreamScreen FPS', value: status.dreamscreenfps },
    ].filter((item) => item.value !== undefined)
  }, [status])

  return (
    <section className="card">
      <header className="card-header">
        <h2>Status</h2>
        <button type="button" onClick={refresh} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </header>
      {error && <div className="error">{error}</div>}
      {status ? (
        <>
          <dl className="status-grid">
            {structured.map((item) => (
              <div key={item.label} className="status-row">
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
          <details className="details">
            <summary>Raw JSON</summary>
            <pre className="code-block">{JSON.stringify(status, null, 2)}</pre>
          </details>
        </>
      ) : (
        <div className="muted">No data yet.</div>
      )}
    </section>
  )
}
