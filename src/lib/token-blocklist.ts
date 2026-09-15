import "server-only"

const revokedTokens = new Map<string, number>()

const CLEANUP_INTERVAL_MS = 60 * 60 * 1000

let lastCleanup = Date.now()

function cleanup() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return
  lastCleanup = now
  const cutoff = now - 7 * 24 * 60 * 60 * 1000
  for (const [jti, revokedAt] of revokedTokens) {
    if (revokedAt < cutoff) {
      revokedTokens.delete(jti)
    }
  }
}

export function revokeToken(jti: string) {
  revokedTokens.set(jti, Date.now())
  cleanup()
}

export function isTokenRevoked(jti: string): boolean {
  cleanup()
  return revokedTokens.has(jti)
}
