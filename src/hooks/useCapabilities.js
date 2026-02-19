import useDeviceParams from './useDeviceParams.js'
import { hasParam, readString } from '../utils/paramUtils.js'

const defaultCapabilities = {
  system: true,
  color: true,
  setup: true,
  ambient: true,
  camera: false,
  hue: false,
  dreamscreen: false,
  relay: false,
  wifiAp: false,
  firmware: false,
}

export default function useCapabilities() {
  const { params, loading, error, refresh } = useDeviceParams()

  if (!params) {
    return { caps: defaultCapabilities, loading, error, refresh }
  }

  const deviceType = readString(params, 'devicetype', '')
  const isBridge = deviceType.toLowerCase().includes('bridge')
  const camera = hasParam(params, 'camresolution') || hasParam(params, 'cammode')

  const caps = {
    system: true,
    color: true,
    setup: !camera, /* LED Setup hidden on CAM modules (old embedded UI behavior) */
    ambient: !isBridge && !camera, /* Ambient hidden on bridge and CAM modules */
    camera,
    hue: hasParam(params, 'huesupportenabled') || hasParam(params, 'huebridgeip'),
    dreamscreen: hasParam(params, 'dreamscreensupport') || hasParam(params, 'dreamscreengroupid'),
    relay: hasParam(params, 'ambibackrelayto'),
    wifiAp: hasParam(params, 'deviceapenabled'),
    firmware: true, /* Always show; page handles missing firmwarebaseurl */
  }

  return { caps, loading, error, refresh }
}
