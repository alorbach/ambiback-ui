import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../api/client.js'

const HANDLE_SIZE = 28
const POINTS = [
  { id: 1, label: 'TL', color: 'camera-point-tl' },
  { id: 2, label: 'TR', color: 'camera-point-tr' },
  { id: 3, label: 'BL', color: 'camera-point-bl' },
  { id: 4, label: 'BR', color: 'camera-point-br' },
]

/** Parse camerapoint from params. Firmware may use 0-based keys ["0"]..["3"] mapping to points 1..4. */
function parseCameraPoints(params) {
  const cp = params?.camerapoint
  if (!cp || typeof cp !== 'object') return null
  const pts = []
  for (let i = 0; i < 4; i++) {
    const key = String(i)
    const entry = cp[key]
    if (entry && typeof entry === 'object' && 'x' in entry && 'y' in entry) {
      let x = Number(entry.x)
      let y = Number(entry.y)
      if (Number.isNaN(x)) x = i === 1 || i === 3 ? 100 : 0
      if (Number.isNaN(y)) y = i === 2 || i === 3 ? 100 : 0
      x = Math.max(0, Math.min(100, x))
      y = Math.max(0, Math.min(100, y))
      pts.push({ x, y })
    } else {
      pts.push({ x: i === 1 || i === 3 ? 100 : 0, y: i === 2 || i === 3 ? 100 : 0 })
    }
  }
  if (pts.length === 4) return pts
  return null
}

const DEFAULT_POINTS = [
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  { x: 0, y: 100 },
  { x: 100, y: 100 },
]

/** Convert image % (0–100) to view % for handle positioning (handles are in view coords) */
function imageToViewPercent(contentRect, imgX, imgY) {
  if (!contentRect) return { x: imgX, y: imgY }
  const { boxW, boxH, contentW, contentH, offsetX, offsetY } = contentRect
  const viewX = offsetX + (imgX / 100) * contentW
  const viewY = offsetY + (imgY / 100) * contentH
  return { x: (viewX / boxW) * 100, y: (viewY / boxH) * 100 }
}

/** Position arrow handles: TL tip at (x,y), TR tip at (x,y), etc. x,y in view % */
function getHandleStyle(index, viewX, viewY) {
  const s = HANDLE_SIZE
  switch (index) {
    case 0:
      return { left: `${viewX}%`, top: `${viewY}%` }
    case 1:
      return { left: `calc(${viewX}% - ${s}px)`, top: `${viewY}%` }
    case 2:
      return { left: `${viewX}%`, top: `calc(${viewY}% - ${s}px)` }
    case 3:
      return { left: `calc(${viewX}% - ${s}px)`, top: `calc(${viewY}% - ${s}px)` }
    default:
      return { left: `${viewX}%`, top: `${viewY}%` }
  }
}

export default function CameraCalibrationCard({ baseUrl, params, refresh, onMessage }) {
  const containerRef = useRef(null)
  const imgRef = useRef(null)
  const viewRef = useRef(null)
  const [previewMode, setPreviewMode] = useState('image')
  const [stamp, setStamp] = useState(Date.now())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [points, setPoints] = useState(DEFAULT_POINTS)
  const [dragging, setDragging] = useState(null)
  const [contentRect, setContentRect] = useState(null)
  const [refreshCooldownRemaining, setRefreshCooldownRemaining] = useState(0)
  const refreshCooldownRef = useRef(null)
  const refreshBlockedUntilRef = useRef(0)

  const camUrl = baseUrl ? `${baseUrl}/cam.jpg?ts=${stamp}` : '/cam.jpg'
  const mjpegUrl = baseUrl ? `${baseUrl}/cam.mjpeg` : '/cam.mjpeg'

  useEffect(() => {
    if (dragging !== null) return
    const parsed = parseCameraPoints(params)
    if (parsed) setPoints(parsed)
    else setPoints(DEFAULT_POINTS)
  }, [params, dragging])

  const updateContentRect = useCallback(() => {
    const img = imgRef.current
    if (!img || !img.naturalWidth || !img.naturalHeight) return
    const rect = img.getBoundingClientRect()
    const boxW = rect.width
    const boxH = rect.height
    const natW = img.naturalWidth
    const natH = img.naturalHeight
    const scale = Math.min(boxW / natW, boxH / natH)
    const contentW = natW * scale
    const contentH = natH * scale
    setContentRect({
      boxW,
      boxH,
      contentW,
      contentH,
      offsetX: (boxW - contentW) / 2,
      offsetY: (boxH - contentH) / 2,
    })
  }, [])

  const REFRESH_COOLDOWN_MS = 1000

  const handleRefresh = useCallback(() => {
    if (Date.now() < refreshBlockedUntilRef.current) return
    refreshBlockedUntilRef.current = Date.now() + REFRESH_COOLDOWN_MS
    if (refreshCooldownRef.current) clearInterval(refreshCooldownRef.current)
    const seconds = Math.ceil(REFRESH_COOLDOWN_MS / 1000)
    setRefreshCooldownRemaining(seconds)
    refreshCooldownRef.current = setInterval(() => {
      setRefreshCooldownRemaining((s) => {
        if (s <= 1) {
          if (refreshCooldownRef.current) clearInterval(refreshCooldownRef.current)
          refreshCooldownRef.current = null
          return 0
        }
        return s - 1
      })
    }, 1000)
    setLoading(true)
    setStamp(Date.now())
    setError(null)
  }, [])

  const handleImgLoad = useCallback(() => {
    setLoading(false)
    setError(null)
    updateContentRect()
  }, [updateContentRect])

  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    const ro = new ResizeObserver(updateContentRect)
    ro.observe(view)
    return () => ro.disconnect()
  }, [updateContentRect])

  useEffect(
    () => () => {
      if (refreshCooldownRef.current) clearInterval(refreshCooldownRef.current)
    },
    []
  )

  const handleImgError = useCallback(() => {
    setLoading(false)
    setError('Failed to load camera image')
  }, [])

  /** Map viewport coords to 0–100% within the actual image content (handles object-fit: contain letterboxing) */
  const pxToPercent = useCallback((clientX, clientY) => {
    if (!imgRef.current) return null
    const img = imgRef.current
    const rect = img.getBoundingClientRect()
    const boxW = rect.width
    const boxH = rect.height
    if (boxW <= 0 || boxH <= 0) return null
    const natW = img.naturalWidth || boxW
    const natH = img.naturalHeight || boxH
    if (natW <= 0 || natH <= 0) return null
    const scale = Math.min(boxW / natW, boxH / natH)
    const contentW = natW * scale
    const contentH = natH * scale
    const offsetX = (boxW - contentW) / 2
    const offsetY = (boxH - contentH) / 2
    const contentLeft = rect.left + offsetX
    const contentTop = rect.top + offsetY
    const relX = Math.max(0, Math.min(contentW, clientX - contentLeft))
    const relY = Math.max(0, Math.min(contentH, clientY - contentTop))
    let x = Math.round((relX / contentW) * 100)
    let y = Math.round((relY / contentH) * 100)
    x = Math.max(0, Math.min(100, x))
    y = Math.max(0, Math.min(100, y))
    return { x, y }
  }, [])

  const draggingRef = useRef(null)
  const lastPointRef = useRef(null)
  const pointsRef = useRef(points)
  pointsRef.current = points

  const handlePointerDown = useCallback(
    (e, pointIndex) => {
      e.preventDefault()
      e.stopPropagation()
      if (e.target.setPointerCapture) e.target.setPointerCapture(e.pointerId)
      setDragging(pointIndex)
      draggingRef.current = pointIndex
    },
    []
  )

  const handlePointerMove = useCallback(
    (e) => {
      const idx = draggingRef.current
      if (idx === null || idx === undefined) return
      e.preventDefault()
      const pct = pxToPercent(e.clientX, e.clientY)
      if (!pct) return
      lastPointRef.current = { idx, ...pct }
      setPoints((prev) => {
        const next = [...prev]
        next[idx] = pct
        return next
      })
    },
    [pxToPercent]
  )

  const handlePointerUp = useCallback(
    (e) => {
      const idx = draggingRef.current
      if (idx === null || idx === undefined) return
      setDragging(null)
      draggingRef.current = null
      const pt =
        lastPointRef.current?.idx === idx
          ? lastPointRef.current
          : pointsRef.current[idx] ?? DEFAULT_POINTS[idx]
      const pointNum = idx + 1
      api
        .setCameraPoint(pointNum, pt.x, pt.y)
        .then(() => {
          onMessage?.('Camera point updated')
          refresh?.()
        })
        .catch((err) => {
          onMessage?.(err.message || 'Failed to set camera point')
        })
    },
    [refresh, onMessage]
  )

  if (!baseUrl) {
    return (
      <section className="card">
        <h2>Camera Live Preview</h2>
        <p className="muted">Connect to a device to configure camera calibration.</p>
      </section>
    )
  }

  return (
    <section className="card camera-calibration-card">
      <h2>Camera Live Preview</h2>
      <p className="muted" style={{ marginBottom: 12 }}>
        Drag the corner points to select the edges of the TV. Points define the capture area for color extraction.
      </p>
      <div className="camera-calibration-preview" ref={containerRef}>
        <div className="camera-calibration-view" ref={viewRef}>
          {previewMode === 'image' ? (
            <>
              {loading && <div className="camera-calibration-loading" aria-hidden />}
              <img
                ref={imgRef}
                src={camUrl}
                alt="Camera view"
                onLoad={handleImgLoad}
                onError={handleImgError}
                style={{ opacity: loading ? 0.5 : 1 }}
              />
            </>
          ) : (
            <img ref={imgRef} src={mjpegUrl} alt="Camera stream" onLoad={handleImgLoad} onError={handleImgError} />
          )}
          <svg
            className="camera-calibration-overlay"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden
          >
            <polygon
              className="camera-calibration-zone"
              points={[
                imageToViewPercent(contentRect, points[0].x, points[0].y),
                imageToViewPercent(contentRect, points[1].x, points[1].y),
                imageToViewPercent(contentRect, points[3].x, points[3].y),
                imageToViewPercent(contentRect, points[2].x, points[2].y),
              ]
                .map((p) => `${p.x},${p.y}`)
                .join(' ')}
            />
          </svg>
          {points.map((pt, i) => {
            const { x: vx, y: vy } = imageToViewPercent(contentRect, pt.x, pt.y)
            return (
            <div
              key={POINTS[i].id}
              className={`camera-point-handle camera-point-arrow ${POINTS[i].color}`}
              style={getHandleStyle(i, vx, vy)}
              role="slider"
              aria-label={`Point ${POINTS[i].label} (${pt.x}%, ${pt.y}%)`}
              tabIndex={0}
              onPointerDown={(e) => handlePointerDown(e, i)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            />
          )})}
        </div>
        {error && (
          <div className="camera-calibration-error">
            {error}
            <button
              type="button"
              className="button secondary"
              onClick={handleRefresh}
              disabled={refreshCooldownRemaining > 0}
            >
              Retry
            </button>
          </div>
        )}
      </div>
      <div className="camera-calibration-controls">
        <label>
          <input
            type="radio"
            name="camera_preview_mode"
            checked={previewMode === 'image'}
            onChange={() => {
              setLoading(true)
              setPreviewMode('image')
            }}
          />
          Live Image
        </label>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshCooldownRemaining > 0}
          title={refreshCooldownRemaining > 0 ? `Wait ${refreshCooldownRemaining}s` : undefined}
        >
          {refreshCooldownRemaining > 0 ? `Reload (${refreshCooldownRemaining}s)` : 'Reload'}
        </button>
        <label>
          <input
            type="radio"
            name="camera_preview_mode"
            checked={previewMode === 'mjpeg'}
            onChange={() => {
              setLoading(true)
              setPreviewMode('mjpeg')
            }}
          />
          Live Video
        </label>
        <a href={mjpegUrl} target="_blank" rel="noopener noreferrer" className="button secondary">
          Open in new tab
        </a>
      </div>
    </section>
  )
}
