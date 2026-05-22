const RATE_LIMIT_WINDOW_MS = 60000
const RATE_LIMIT_MAX = 10

interface RateLimitStore {
  check(ip: string): { allowed: boolean; remaining: number }
  record(ip: string): void
}

class InMemoryStore implements RateLimitStore {
  private log = new Map<string, { count: number; resetAt: number }>()

  check(ip: string): { allowed: boolean; remaining: number } {
    const now = Date.now()
    const record = this.log.get(ip)
    if (!record || now > record.resetAt) {
      return { allowed: true, remaining: RATE_LIMIT_MAX - 1 }
    }
    if (record.count >= RATE_LIMIT_MAX) {
      return { allowed: false, remaining: 0 }
    }
    return { allowed: true, remaining: RATE_LIMIT_MAX - record.count }
  }

  record(ip: string): void {
    const now = Date.now()
    const record = this.log.get(ip)
    if (!record || now > record.resetAt) {
      this.log.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    } else {
      record.count++
    }
  }
}

class VercelKVStore implements RateLimitStore {
  private kv: any

  constructor() {
    try {
      this.kv = (globalThis as any).kv
    } catch {
      this.kv = null
    }
  }

  private isAvailable(): boolean {
    return this.kv !== null && this.kv !== undefined
  }

  async check(ip: string): Promise<{ allowed: boolean; remaining: number }> {
    if (!this.isAvailable()) {
      const fallback = new InMemoryStore()
      return fallback.check(ip)
    }

    try {
      const key = `ratelimit:${ip}`
      const data = await this.kv.get(key)
      const now = Date.now()

      if (!data || now > data.resetAt) {
        return { allowed: true, remaining: RATE_LIMIT_MAX - 1 }
      }

      if (data.count >= RATE_LIMIT_MAX) {
        return { allowed: false, remaining: 0 }
      }

      return { allowed: true, remaining: RATE_LIMIT_MAX - data.count }
    } catch {
      return { allowed: true, remaining: RATE_LIMIT_MAX }
    }
  }

  async record(ip: string): Promise<void> {
    if (!this.isAvailable()) return

    try {
      const key = `ratelimit:${ip}`
      const now = Date.now()
      const data = await this.kv.get(key)

      if (!data || now > data.resetAt) {
        await this.kv.set(key, JSON.stringify({ count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS }), { ex: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000) })
      } else {
        data.count++
        await this.kv.set(key, JSON.stringify(data), { ex: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000) })
      }
    } catch {
      // Fail open - allow request if KV is unavailable
    }
  }
}

const store = new VercelKVStore()

export async function checkRateLimit(ip: string): Promise<{ allowed: boolean; remaining: number }> {
  return store.check(ip)
}

export async function recordRequest(ip: string): Promise<void> {
  return store.record(ip)
}

export function getClientIP(request: Request): string {
  return request.headers.get('x-real-ip')
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || 'unknown'
}

const MAX_STR_LENGTH = 1000

export function sanitize(input: unknown): string {
  if (typeof input !== 'string') return ''
  return input.replace(/[<>]/g, '').trim().slice(0, MAX_STR_LENGTH)
}

export function sanitizePhone(input: unknown): string {
  if (typeof input !== 'string') return ''
  return input.replace(/[^0-9+\-() ]/g, '').trim().slice(0, 20)
}

export function sanitizeProductName(input: unknown): string {
  if (typeof input !== 'string') return ''
  return input.replace(/[<>]/g, '').trim().slice(0, 200)
}

export function isValidEmail(input: unknown): boolean {
  if (typeof input !== 'string') return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.trim())
}

export function isValidPositiveInt(input: unknown): boolean {
  if (typeof input !== 'number') return false
  return Number.isInteger(input) && input > 0
}

export function isValidNonEmptyString(input: unknown, maxLen = 200): boolean {
  if (typeof input !== 'string') return false
  const trimmed = input.trim()
  return trimmed.length > 0 && trimmed.length <= maxLen
}

export function errorResponse(error: string, status: number): Response {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export function successResponse(data: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
