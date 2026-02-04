import { createContext, useContext, useMemo, useState } from 'react'

const STORAGE_KEY = 'ambiback.ui.advanced'

const UiSettingsContext = createContext({
  advanced: false,
  setAdvanced: () => {},
})

function readInitialAdvanced() {
  try {
    const value = sessionStorage.getItem(STORAGE_KEY)
    return value === 'true'
  } catch {
    return false
  }
}

export function UiSettingsProvider({ children }) {
  const [advanced, setAdvancedState] = useState(readInitialAdvanced)

  const setAdvanced = (value) => {
    setAdvancedState(value)
    try {
      sessionStorage.setItem(STORAGE_KEY, String(value))
    } catch {
      // ignore storage errors (private mode, etc.)
    }
  }

  const ctx = useMemo(() => ({ advanced, setAdvanced }), [advanced])

  return <UiSettingsContext.Provider value={ctx}>{children}</UiSettingsContext.Provider>
}

export function useUiSettings() {
  return useContext(UiSettingsContext)
}
