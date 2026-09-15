import "server-only"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null

const loginLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "60 s"),
      analytics: true,
    })
  : null

const registerLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, "60 s"),
      analytics: true,
    })
  : null

const resetPasswordLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, "60 s"),
      analytics: true,
    })
  : null

const apiLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, "60 s"),
      analytics: true,
    })
  : null

interface InMemoryEntry {
  timestamps: number[]
}

const inMemoryBuckets = new Map<string, InMemoryEntry>()
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000
let lastCleanup = Date.now()

function cleanupInMemory() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return
  lastCleanup = now
  const cutoff = now - 10 * 60 * 1000
  for (const [key, entry] of inMemoryBuckets) {
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff)
    if (entry.timestamps.length === 0) {
      inMemoryBuckets.delete(key)
    }
  }
}

function checkInMemory(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; retryAfterMs: number } {
  cleanupInMemory()
  const now = Date.now()
  const entry = inMemoryBuckets.get(key) ?? { timestamps: [] }
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs)
  if (entry.timestamps.length >= maxRequests) {
    const oldest = entry.timestamps[0]
    const retryAfterMs = windowMs - (now - oldest)
    inMemoryBuckets.set(key, entry)
    return { allowed: false, retryAfterMs }
  }
  entry.timestamps.push(now)
  inMemoryBuckets.set(key, entry)
  return { allowed: true, retryAfterMs: 0 }
}

type LimiterType = "login" | "register" | "reset-password" | "api"

const LIMITER_CONFIG: Record<
  LimiterType,
  { maxRequests: number; windowMs: number }
> = {
  login: { maxRequests: 5, windowMs: 60_000 },
  register: { maxRequests: 3, windowMs: 60_000 },
  "reset-password": { maxRequests: 3, windowMs: 60_000 },
  api: { maxRequests: 60, windowMs: 60_000 },
}

const limiters: Record<LimiterType, Ratelimit | null> = {
  login: loginLimiter,
  register: registerLimiter,
  "reset-password": resetPasswordLimiter,
  api: apiLimiter,
}

export async function checkRateLimit(
  key: string,
  type: LimiterType = "api"
): Promise<{ allowed: boolean; retryAfterMs: number }> {
  const limiter = limiters[type]

  if (limiter) {
    const result = await limiter.limit(key)
    return {
      allowed: result.success,
      retryAfterMs: result.success
        ? 0
        : Math.max(0, result.reset - Date.now()),
    }
  }

  const config = LIMITER_CONFIG[type]
  return checkInMemory(key, config.maxRequests, config.windowMs)
}

export function getRateLimitKey(request: Request, prefix: string): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const ip = forwarded?.split(",")[0]?.trim() ?? "127.0.0.1"
  return `${prefix}:${ip}`
}
