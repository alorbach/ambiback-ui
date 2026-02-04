import StatusCard from '../components/StatusCard.jsx'
import ParamSetter from '../components/ParamSetter.jsx'

export default function DreamscreenPage() {
  return (
    <div className="page">
      <h1>DreamScreen</h1>
      <StatusCard />
      <section className="card">
        <h2>DreamScreen Controls</h2>
        <p className="muted">
          DreamScreen discovery and grouping UI will be added here. Use quick parameters below to
          test endpoints (e.g. setdreamscreensupport, setdreamscreengroup).
        </p>
      </section>
      <ParamSetter />
    </div>
  )
}
