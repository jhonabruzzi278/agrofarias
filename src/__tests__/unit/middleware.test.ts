import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockVerifySession = vi.fn()
vi.mock('../../lib/session', () => ({
  SESSION_COOKIE: 'af_admin_session',
  verifySession: mockVerifySession,
}))

const { onRequest } = await import('../../middleware')

function createContext(pathname: string, cookieValue?: string) {
  const cookies = new Map<string, { value: string }>()
  if (cookieValue) cookies.set('af_admin_session', { value: cookieValue })
  return {
    url: new URL(`https://agrofarias.cl${pathname}`),
    cookies: {
      get(name: string) {
        return cookies.get(name) ?? null
      },
    },
    request: new Request(`https://agrofarias.cl${pathname}`),
    locals: {},
  }
}

describe('middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('permite rutas públicas sin cookie', async () => {
    mockVerifySession.mockResolvedValue(false)
    const ctx = createContext('/tienda')
    const next = vi.fn().mockResolvedValue(new Response('ok'))
    const result = await onRequest(ctx as never, next as never)
    expect(next).toHaveBeenCalled()
  })

  it('bloquea /api/cotizador-interno sin cookie', async () => {
    mockVerifySession.mockResolvedValue(false)
    const ctx = createContext('/api/cotizador-interno')
    const next = vi.fn()
    const result = await onRequest(ctx as never, next as never)
    expect(result).toBeInstanceOf(Response)
    expect((result as Response).status).toBe(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('bloquea /api/cotizador-interno/quotes sin cookie', async () => {
    mockVerifySession.mockResolvedValue(false)
    const ctx = createContext('/api/cotizador-interno/quotes')
    const next = vi.fn()
    const result = await onRequest(ctx as never, next as never)
    expect((result as Response).status).toBe(401)
  })

  it('permite /api/cotizador-interno con sesion valida', async () => {
    mockVerifySession.mockResolvedValue(true)
    const ctx = createContext('/api/cotizador-interno', 'token-valido')
    const next = vi.fn().mockResolvedValue(new Response('ok'))
    const result = await onRequest(ctx as never, next as never)
    expect(next).toHaveBeenCalled()
  })

  it('no bloquea /api/cotizar (endpoint publico)', async () => {
    mockVerifySession.mockResolvedValue(false)
    const ctx = createContext('/api/cotizar')
    const next = vi.fn().mockResolvedValue(new Response('ok'))
    const result = await onRequest(ctx as never, next as never)
    expect(next).toHaveBeenCalled()
  })

  it('no bloquea /admin/cotizador (pagina publica)', async () => {
    mockVerifySession.mockResolvedValue(false)
    const ctx = createContext('/admin/cotizador')
    const next = vi.fn().mockResolvedValue(new Response('ok'))
    const result = await onRequest(ctx as never, next as never)
    expect(next).toHaveBeenCalled()
  })
})
