import { NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import DeviceSelector from './DeviceSelector.jsx'
import ModeControls from './ModeControls.jsx'
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
  { to: '/firmware', label: 'Firmware', cap: 'firmware' },
]

export default function Layout({ children }) {
  const { caps, loading, error } = useCapabilitiesContext()
  const { advanced, setAdvanced, statusRefreshInterval, setStatusRefreshInterval, refreshIntervalOptions } =
    useUiSettings()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [modePanelCompact, setModePanelCompact] = useState(false)
  const visibleItems = navItems.filter((item) =>
    loading ? item.cap !== 'camera' && item.cap !== 'hue' && item.cap !== 'dreamscreen' : caps[item.cap]
  )

  useEffect(() => {
    // Hysteresis prevents flickering near the threshold:
    // enter compact at >40px scroll, exit compact only below 10px.
    const updateModePanelState = () => {
      setModePanelCompact((prev) => {
        if (!prev && window.scrollY > 40) return true
        if (prev && window.scrollY < 10) return false
        return prev
      })
    }

    updateModePanelState()
    window.addEventListener('scroll', updateModePanelState, { passive: true })
    return () => window.removeEventListener('scroll', updateModePanelState)
  }, [])

  return (
    <div className="app-shell">
      <div
        className={`sidebar-backdrop ${mobileNavOpen ? 'visible' : ''}`}
        onClick={() => setMobileNavOpen(false)}
        onKeyDown={(e) => e.key === 'Escape' && setMobileNavOpen(false)}
        role="button"
        tabIndex={-1}
        aria-label="Close menu"
      />
      <header className="mobile-header">
        <div className="brand">
          <div className="brand-title">AmbiBack</div>
          <div className="brand-subtitle">Controller UI</div>
        </div>
        <button
          type="button"
          className="mobile-menu-button"
          aria-expanded={mobileNavOpen}
          onClick={() => setMobileNavOpen((prev) => !prev)}
        >
          ☰
        </button>
      </header>
      <aside className={`sidebar ${mobileNavOpen ? 'sidebar-open' : ''}`}>
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
              onClick={() => setMobileNavOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        {loading && (
          <div className="params-loading-hint muted">Connecting to device…</div>
        )}
        <div className="nav-footer">
          <div className="nav-footer-title">Advanced Mode</div>
          <label className="toggle checkbox">
            <input
              type="checkbox"
              checked={advanced}
              onChange={(event) => setAdvanced(event.target.checked)}
            />
            <span>Enable advanced controls</span>
          </label>
          {advanced && (
            <label className="nav-footer-refresh">
              <span className="nav-footer-refresh-label">Status refresh (s)</span>
              <select
                value={statusRefreshInterval}
                onChange={(e) => setStatusRefreshInterval(Number(e.target.value))}
                className="nav-footer-refresh-select"
                aria-label="Status refresh interval in seconds"
              >
                {refreshIntervalOptions.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      </aside>
      <main className="content">
        {loading && (
          <div className="params-loader-overlay" aria-busy="true" aria-live="polite">
            <div className="params-loader-spinner" />
            <p className="params-loader-text">Connecting to device…</p>
          </div>
        )}
        <div className={`mode-panel-sticky ${modePanelCompact ? 'mode-panel-sticky-compact' : ''}`}>
          <ModeControls />
        </div>
        {children}
      </main>
    </div>
  )
}
