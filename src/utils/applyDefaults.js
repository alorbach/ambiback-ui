import { api } from '../api/client.js'

/**
 * Apply a list of default param/preset entries to the device.
 * @param {Array<{ param: string, value: string|number, preset?: boolean }>} entries
 * @returns {Promise<void>} Resolves when all applied, rejects on first failure.
 */
export async function applyDefaults(entries) {
  for (const entry of entries) {
    const value = String(entry.value)
    if (entry.preset) {
      await api.setPreset(entry.param, value)
    } else {
      await api.setParam(entry.param, value)
    }
  }
}
