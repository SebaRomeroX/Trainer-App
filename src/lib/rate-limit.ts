import "server-only"

interface RateLimitEntry {
  timestamps: number[]
}

const buckets = new Map<string, RateLimitEntry>()

const CLEANUP_INTERVAL_MS = 5 * 60 * 1000
let lastCleanup = Date.now()

function cleanup() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return
  lastCleanup = now
  const cutoff = now - 10 * 60 * 1000
  for (const [key, entry] of buckets) {
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff)
    if (entry.timestamps.length === 0) {
      buckets.delete(key)
    }
  }
}

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; retryAfterMs: number } {
  cleanup()

  const now = Date.now()
  const entry = buckets.get(key) ?? { timestamps: [] }

  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs)

  if (entry.timestamps.length >= maxRequests) {
    const oldest = entry.timestamps[0]
    const retryAfterMs = windowMs - (now - oldest)
    buckets.set(key, entry)
    return { allowed: false, retryAfterMs }
  }

  entry.timestamps.push(now)
  buckets.set(key, entry)
  return { allowed: true, retryAfterMs: 0 }
}

export function getRateLimitKey(request: Request, prefix: string): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const ip = forwarded?.split(",")[0]?.trim() ?? "127.0.0.1"
  return `${prefix}:${ip}`
}
