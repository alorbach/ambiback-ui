import { useState } from 'react'
import { api } from '../api/client.js'

export default function ParamSetter() {
  const [param, setParam] = useState('')
  const [value, setValue] = useState('')
  const [message, setMessage] = useState('')

  const submit = async () => {
    if (!param) {
      setMessage('Param is required')
      return
    }
    setMessage('')
    try {
      const result = await api.setParam(param, value)
      setMessage(result)
    } catch (err) {
      setMessage(err.message || 'Failed to set parameter')
    }
  }

  return (
    <section className="card">
      <header className="card-header">
        <h2>Quick Parameter Set</h2>
      </header>
      <div className="form-grid">
        <label htmlFor="paramName">Param</label>
        <input
          id="paramName"
          type="text"
          placeholder="setbrightness"
          value={param}
          onChange={(event) => setParam(event.target.value)}
        />
        <label htmlFor="paramValue">Value</label>
        <input
          id="paramValue"
          type="text"
          placeholder="128"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <button type="button" onClick={submit}>
          Send
        </button>
      </div>
      {message && <div className="muted">{message}</div>}
    </section>
  )
}
