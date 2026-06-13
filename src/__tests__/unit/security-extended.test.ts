import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.unstubAllEnvs()

describe('validateOrigin (extended)', () => {
  let validateOrigin: (req: Request) => boolean

  beforeAll(async () => {
    const mod = await import('../../lib/security')
    validateOrigin = mod.validateOrigin
  })

  function req(headers: Record<string, string>) {
    return new Request('https://agrofarias.cl/api/cotizar', { headers })
  }

  it('allows valid origin', () => {
    expect(validateOrigin(req({ origin: 'https://agrofarias.cl' }))).toBe(true)
  })

  it('allows www subdomain', () => {
    expect(validateOrigin(req({ origin: 'https://www.agrofarias.cl' }))).toBe(true)
  })

  it('rejects foreign origin', () => {
    expect(validateOrigin(req({ origin: 'https://evil.com' }))).toBe(false)
  })

  it('allows same-host request via referer', () => {
    expect(validateOrigin(req({ referer: 'https://agrofarias.cl/tienda' }))).toBe(true)
  })

  it('allows server-to-server request via host header', () => {
    expect(validateOrigin(req({ host: 'agrofarias.cl' }))).toBe(true)
  })

  it('allows server-to-server request via x-forwarded-host', () => {
    expect(validateOrigin(req({ 'x-forwarded-host': 'agrofarias.cl' }))).toBe(true)
  })

  it('rejects request with no identifying headers', () => {
    expect(validateOrigin(req({}))).toBe(false)
  })

  it('rejects invalid URL in origin', () => {
    expect(validateOrigin(req({ origin: 'not-a-url' }))).toBe(false)
  })
})

describe('response helpers', () => {
  let errorResponse: (err: string, status: number) => Response
  let successResponse: (data: Record<string, unknown>, status?: number) => Response

  beforeAll(async () => {
    const mod = await import('../../lib/security')
    errorResponse = mod.errorResponse
    successResponse = mod.successResponse
  })

  it('errorResponse returns JSON with correct status', () => {
    const res = errorResponse('Test error', 400)
    expect(res.status).toBe(400)
    expect(res.headers.get('Content-Type')).toBe('application/json')
    expect(res.headers.get('Cache-Control')).toContain('no-store')
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff')
    expect(res.headers.get('X-Frame-Options')).toBe('DENY')
  })

  it('successResponse returns JSON with data', () => {
    const res = successResponse({ ok: true }, 200)
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toBe('application/json')
    expect(res.headers.get('Cache-Control')).toContain('no-store')
  })

  it('successResponse defaults to 200', () => {
    const res = successResponse({ ok: true })
    expect(res.status).toBe(200)
  })
})
