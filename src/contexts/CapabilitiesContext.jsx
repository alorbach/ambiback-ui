import { createContext, useContext } from 'react'
import useCapabilities from '../hooks/useCapabilities.js'

const CapabilitiesContext = createContext({
  caps: {
    system: true,
    color: true,
    setup: true,
    ambient: true,
    camera: false,
    hue: false,
    dreamscreen: false,
    relay: false,
    wifiAp: false,
  },
  loading: true,
  error: '',
  refresh: () => {},
})

export function CapabilitiesProvider({ children }) {
  const value = useCapabilities()
  return <CapabilitiesContext.Provider value={value}>{children}</CapabilitiesContext.Provider>
}

export function useCapabilitiesContext() {
  return useContext(CapabilitiesContext)
}
