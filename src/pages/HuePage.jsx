import StatusCard from '../components/StatusCard.jsx'
import ParamSetter from '../components/ParamSetter.jsx'

export default function HuePage() {
  return (
    <div className="page">
      <h1>Hue Integration</h1>
      <StatusCard />
      <section className="card">
        <h2>Hue Controls</h2>
        <p className="muted">
          Hue discovery and light mapping UI will be added here. Use quick parameters below to
          test endpoints (e.g. sethuesupport, sethuebridgeip, sethuebridgeuser).
        </p>
      </section>
      <ParamSetter />
    </div>
  )
}
