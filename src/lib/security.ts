const RATE_LIMIT_WINDOW_MS = 60000
const RATE_LIMIT_MAX = 10
const requestLog = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const record = requestLog.get(ip)
  if (!record || now > record.resetAt) {
    requestLog.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 }
  }
  record.count++
  if (record.count > RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 }
  }
  return { allowed: true, remaining: RATE_LIMIT_MAX - record.count }
}

export function getClientIP(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
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
