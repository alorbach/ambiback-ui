/**
 * HTTP subnet scan for AmbiBack devices (Phase 2 fallback).
 * Fetches /getstatusasjson from each IP in the subnet.
 */

const BATCH_SIZE = 20
const FETCH_TIMEOUT_MS = 5000

/**
 * @param {string} subnet - e.g. "192.168.1" or "172.21.0"
 * @param {AbortSignal} [signal]
 * @returns {Promise<Array<{ip: string, devicename?: string, deviceip?: string, deviceversion?: string}>>}
 */
export async function scanSubnet(subnet, signal) {
  const results = []
  const base = subnet.replace(/\.+$/, '')

  for (let from = 1; from <= 254; from += BATCH_SIZE) {
    const promises = []
    for (let i = from; i < Math.min(from + BATCH_SIZE, 255); i++) {
      const ip = `${base}.${i}`
      const url = `http://${ip}/getstatusasjson`
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
      if (signal) {
        signal.addEventListener('abort', () => {
          clearTimeout(timeoutId)
          controller.abort()
        })
      }
      promises.push(
        fetch(url, { signal: controller.signal })
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => (data ? { ip: `http://${ip}`, ...data } : null))
          .catch(() => null)
          .finally(() => clearTimeout(timeoutId))
      )
    }
    const batch = await Promise.allSettled(promises)
    batch.forEach((r) => {
      if (r.status === 'fulfilled' && r.value) results.push(r.value)
    })
  }

  return results
}
