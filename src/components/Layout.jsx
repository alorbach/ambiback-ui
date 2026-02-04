import { NavLink } from 'react-router-dom'
import DeviceSelector from './DeviceSelector.jsx'
import { useCapabilitiesContext } from '../contexts/CapabilitiesContext.jsx'
import { useUiSettings } from '../contexts/UiSettingsContext.jsx'

const navItems = [
  { to: '/system', label: 'System', cap: 'system' },
  { to: '/color', label: 'Color & Motion', cap: 'color' },
  { to: '/setup', label: 'LED Setup', cap: 'setup' },
  { to: '/camera', label: 'Camera', cap: 'camera' },
  { to: '/hue', label: 'Hue', cap: 'hue' },
  { to: '/ambient', label: 'Ambient', cap: 'ambient' },
  { to: '/dreamscreen', label: 'DreamScreen', cap: 'dreamscreen' },
]

export default function Layout({ children }) {
  const { caps, loading, error } = useCapabilitiesContext()
  const { advanced, setAdvanced } = useUiSettings()
  const visibleItems = navItems.filter((item) => (loading ? item.cap !== 'camera' && item.cap !== 'hue' && item.cap !== 'dreamscreen' : caps[item.cap]))

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-title">AmbiBack</div>
          <div className="brand-subtitle">Controller UI</div>
        </div>
        <DeviceSelector />
        {error && <div className="error">Device parameters unavailable: {error}</div>}
        <nav className="nav">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="content">
        <div className="top-bar">
          <div className="top-bar-title">Advanced Mode</div>
          <label className="toggle checkbox">
            <input
              type="checkbox"
              checked={advanced}
              onChange={(event) => setAdvanced(event.target.checked)}
            />
            <span>Enable advanced controls</span>
          </label>
        </div>
        {children}
      </main>
    </div>
  )
}
