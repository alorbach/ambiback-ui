import { useDevice as useDeviceContext } from '../contexts/DeviceContext.jsx'

export default function useDevice() {
  return useDeviceContext()
}
