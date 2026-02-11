import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import SystemPage from './pages/SystemPage.jsx'
import ColorMotionPage from './pages/ColorMotionPage.jsx'
import LedSetupPage from './pages/LedSetupPage.jsx'
import CameraPage from './pages/CameraPage.jsx'
import HuePage from './pages/HuePage.jsx'
import DreamscreenPage from './pages/DreamscreenPage.jsx'
import AmbientPage from './pages/AmbientPage.jsx'
import { CapabilitiesProvider, useCapabilitiesContext } from './contexts/CapabilitiesContext.jsx'
import { DeviceParamsProvider } from './contexts/DeviceParamsContext.jsx'
import { UiSettingsProvider } from './contexts/UiSettingsContext.jsx'
import './App.css'

function GuardedRoute({ enabled, element }) {
  if (!enabled) {
    return <Navigate to="/system" replace />
  }
  return element
}

function App() {
  const { caps } = useCapabilitiesContext()

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/system" replace />} />
        <Route path="/system" element={<SystemPage />} />
        <Route path="/color" element={<ColorMotionPage />} />
        <Route path="/setup" element={<LedSetupPage />} />
        <Route path="/camera" element={<GuardedRoute enabled={caps.camera} element={<CameraPage />} />} />
        <Route path="/hue" element={<GuardedRoute enabled={caps.hue} element={<HuePage />} />} />
        <Route path="/ambient" element={<GuardedRoute enabled={caps.ambient} element={<AmbientPage />} />} />
        <Route
          path="/dreamscreen"
          element={<GuardedRoute enabled={caps.dreamscreen} element={<DreamscreenPage />} />}
        />
        <Route path="*" element={<Navigate to="/system" replace />} />
      </Routes>
    </Layout>
  )
}

export default function AppWithProviders() {
  return (
    <UiSettingsProvider>
      <DeviceParamsProvider>
        <CapabilitiesProvider>
          <App />
        </CapabilitiesProvider>
      </DeviceParamsProvider>
    </UiSettingsProvider>
  )
}
