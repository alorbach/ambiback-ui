import ModeControls from '../components/ModeControls.jsx'
import ColorControls from '../components/ColorControls.jsx'

export default function AmbientPage() {
  return (
    <div className="page">
      <h1>Ambient Mode</h1>
      <div className="card-grid">
        <ModeControls />
        <ColorControls />
      </div>
    </div>
  )
}
