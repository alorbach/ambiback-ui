import { NavLink } from 'react-router-dom'
import DeviceSelector from './DeviceSelector.jsx'

const navItems = [
  { to: '/system', label: 'System' },
  { to: '/color', label: 'Color & Motion' },
  { to: '/setup', label: 'LED Setup' },
  { to: '/camera', label: 'Camera' },
  { to: '/hue', label: 'Hue' },
  { to: '/ambient', label: 'Ambient' },
  { to: '/dreamscreen', label: 'DreamScreen' },
]

export default function Layout({ children }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-title">AmbiBack</div>
          <div className="brand-subtitle">Controller UI</div>
        </div>
        <DeviceSelector />
        <nav className="nav">
          {navItems.map((item) => (
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
        {children}
      </main>
    </div>
  )
}
