import { useState } from 'react'
import { api } from '../api/client.js'

export default function ParamsViewer() {
  const [params, setParams] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.getParams()
      setParams(data)
    } catch (err) {
      setError(err.message || 'Failed to load parameters')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="card">
      <header className="card-header">
        <h2>All Parameters</h2>
        <button type="button" onClick={load} disabled={loading}>
          {loading ? 'Loading...' : 'Load'}
        </button>
      </header>
      {error && <div className="error">{error}</div>}
      <pre className="code-block">{params ? JSON.stringify(params, null, 2) : 'No data yet.'}</pre>
    </section>
  )
}
