import { useState } from 'react'
import useDevice from '../hooks/useDevice.js'

export default function CameraPage() {
  const { baseUrl } = useDevice()
  const [stamp, setStamp] = useState(Date.now())
  const camUrl = baseUrl ? `${baseUrl}/cam.jpg?ts=${stamp}` : '/cam.jpg'
  const mjpegUrl = baseUrl ? `${baseUrl}/cam.mjpeg` : '/cam.mjpeg'

  return (
    <div className="page">
      <h1>Camera</h1>
      <section className="card">
        <header className="card-header">
          <h2>Snapshot</h2>
          <button type="button" onClick={() => setStamp(Date.now())}>
            Refresh
          </button>
        </header>
        <div className="camera-frame">
          <img src={camUrl} alt="Camera snapshot" />
        </div>
        <div className="muted">
          <a href={mjpegUrl} target="_blank" rel="noopener">
            Open MJPEG Stream
          </a>
        </div>
      </section>
      <section className="card">
        <h2>Camera Controls</h2>
        <p className="muted">
          Camera tuning controls will be added here (exposure, points, thresholds).
        </p>
      </section>
    </div>
  )
}
