import ModeControls from '../components/ModeControls.jsx'
import ColorControls from '../components/ColorControls.jsx'
import ParamSetter from '../components/ParamSetter.jsx'

export default function ColorMotionPage() {
  return (
    <div className="page">
      <h1>Color & Motion</h1>
      <div className="card-grid">
        <ModeControls />
        <ColorControls />
      </div>
      <ParamSetter />
    </div>
  )
}
