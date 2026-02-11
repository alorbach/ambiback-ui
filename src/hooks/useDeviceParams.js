import { useContext } from 'react'
import { DeviceParamsContext } from '../contexts/DeviceParamsContext.jsx'

export default function useDeviceParams() {
  return useContext(DeviceParamsContext)
}
