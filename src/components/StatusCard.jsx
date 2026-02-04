import { useEffect, useState } from 'react'
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

  return (
    <section className="card">
      <header className="card-header">
        <h2>Status</h2>
        <button type="button" onClick={refresh} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </header>
      {error && <div className="error">{error}</div>}
      <pre className="code-block">{status ? JSON.stringify(status, null, 2) : 'No data yet.'}</pre>
    </section>
  )
}
