import useDevice from '../hooks/useDevice.js'

export default function DeviceSelector() {
  const { baseUrl, updateBaseUrl } = useDevice()

  return (
    <div className="device-selector">
      <label htmlFor="deviceBase">Device URL or IP</label>
      <input
        id="deviceBase"
        type="text"
        placeholder="http://192.168.0.50"
        value={baseUrl}
        onChange={(event) => updateBaseUrl(event.target.value)}
      />
      <div className="device-hint">
        Tip: add <code>?device=192.168.0.50</code> to the URL
      </div>
    </div>
  )
}
