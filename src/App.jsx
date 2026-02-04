import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import SystemPage from './pages/SystemPage.jsx'
import ColorMotionPage from './pages/ColorMotionPage.jsx'
import LedSetupPage from './pages/LedSetupPage.jsx'
import CameraPage from './pages/CameraPage.jsx'
import HuePage from './pages/HuePage.jsx'
import DreamscreenPage from './pages/DreamscreenPage.jsx'
import AmbientPage from './pages/AmbientPage.jsx'
import './App.css'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/system" replace />} />
        <Route path="/system" element={<SystemPage />} />
        <Route path="/color" element={<ColorMotionPage />} />
        <Route path="/setup" element={<LedSetupPage />} />
        <Route path="/camera" element={<CameraPage />} />
        <Route path="/hue" element={<HuePage />} />
        <Route path="/ambient" element={<AmbientPage />} />
        <Route path="/dreamscreen" element={<DreamscreenPage />} />
        <Route path="*" element={<Navigate to="/system" replace />} />
      </Routes>
    </Layout>
  )
}

export default App
