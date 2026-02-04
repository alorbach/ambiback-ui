import { useState } from 'react'
import { api } from '../api/client.js'
import StatusCard from '../components/StatusCard.jsx'
import ParamsViewer from '../components/ParamsViewer.jsx'
import ParamSetter from '../components/ParamSetter.jsx'

export default function SystemPage() {
  const [message, setMessage] = useState('')

  const handleAction = async (action) => {
    setMessage('')
    try {
      const result = await action()
      setMessage(result)
    } catch (err) {
      setMessage(err.message || 'Action failed')
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
            <button type="button" onClick={() => handleAction(api.startWps)}>
              Start WPS
            </button>
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
      <ParamSetter />
      <ParamsViewer />
    </div>
  )
}
