import { useEffect, useState } from 'react'

function readInitialOpen(storageKey, sectionKey, defaultOpen) {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return defaultOpen
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return defaultOpen
    return typeof parsed[sectionKey] === 'boolean' ? parsed[sectionKey] : defaultOpen
  } catch {
    return defaultOpen
  }
}

export default function PersistedCollapsibleCard({
  storageKey,
  sectionKey,
  title,
  defaultOpen = false,
  children,
  className = 'card card-collapsible',
  summaryClassName = 'card-collapsible-summary',
  bodyClassName = 'card-collapsible-body',
}) {
  const [isOpen, setIsOpen] = useState(() => readInitialOpen(storageKey, sectionKey, defaultOpen))

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      const parsed = raw ? JSON.parse(raw) : {}
      const next = parsed && typeof parsed === 'object' ? parsed : {}
      next[sectionKey] = isOpen
      localStorage.setItem(storageKey, JSON.stringify(next))
    } catch {
      // ignore storage errors
    }
  }, [isOpen, sectionKey, storageKey])

  return (
    <details
      className={className}
      open={isOpen}
      onToggle={(event) => {
        setIsOpen(Boolean(event.target?.open))
      }}
    >
      <summary className={summaryClassName}>
        <span className="card-collapsible-chevron" aria-hidden>
          ▶
        </span>
        {title}
      </summary>
      <div className={bodyClassName}>{children}</div>
    </details>
  )
}