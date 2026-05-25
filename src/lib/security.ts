const RATE_LIMIT_WINDOW_MS = 60000
const RATE_LIMIT_MAX = 10

interface RateLimitStore {
  check(ip: string): { allowed: boolean; remaining: number } | Promise<{ allowed: boolean; remaining: number }>
  record(ip: string): void | Promise<void>
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

const fallbackStore = new InMemoryStore()

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
      return fallbackStore.check(ip) as { allowed: boolean; remaining: number }
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
      return fallbackStore.check(ip) as { allowed: boolean; remaining: number }
    }
  }

  async record(ip: string): Promise<void> {
    if (!this.isAvailable()) {
      fallbackStore.record(ip)
      return
    }

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
      fallbackStore.record(ip)
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
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  if (forwarded) return forwarded;
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;
  const ua = request.headers.get('user-agent') || '';
  return `anon-${simpleHash(ua + Date.now().toString(36))}`;
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36).slice(0, 8);
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

const ALLOWED_HOSTS = new Set(['agrofarias.cl', 'www.agrofarias.cl'])

export function validateOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  const checkUrl = origin || referer;
  if (!checkUrl) return false;

  try {
    const hostname = new URL(checkUrl).hostname;
    return ALLOWED_HOSTS.has(hostname);
  } catch {
    return false;
  }
}
