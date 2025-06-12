// src/utils/auth/rateLimiter.ts
interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private attempts: Map<string, RateLimitEntry> = new Map()
  private readonly maxAttempts = 5
  private readonly windowMs = 15 * 60 * 1000 // 15 minutes

  isLimited(key: string): boolean {
    const now = Date.now()
    const entry = this.attempts.get(key)

    if (!entry) return false

    if (now > entry.resetTime) {
      this.attempts.delete(key)
      return false
    }

    return entry.count >= this.maxAttempts
  }

  recordAttempt(key: string): void {
    const now = Date.now()
    const entry = this.attempts.get(key)

    if (!entry || now > entry.resetTime) {
      this.attempts.set(key, {
        count: 1,
        resetTime: now + this.windowMs
      })
    } else {
      entry.count++
    }
  }

  getRemainingTime(key: string): number {
    const entry = this.attempts.get(key)
    if (!entry) return 0
    
    const remaining = entry.resetTime - Date.now()
    return remaining > 0 ? Math.ceil(remaining / 1000) : 0
  }
}

export const authRateLimiter = new RateLimiter()