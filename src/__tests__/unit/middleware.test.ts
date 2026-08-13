import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockVerifySession = vi.fn()
vi.mock('../../lib/session', () => ({
  SESSION_COOKIE: 'af_admin_session',
  verifySession: mockVerifySession,
}))

const { onRequest } = await import('../../middleware')

function createContext(pathname: string, cookieValue?: string, hostname = 'agrofarias.cl') {
  const cookies = new Map<string, { value: string }>()
  if (cookieValue) cookies.set('af_admin_session', { value: cookieValue })
  return {
    url: new URL(`https://${hostname}${pathname}`),
    cookies: {
      get(name: string) {
        return cookies.get(name) ?? null
      },
    },
    request: new Request(`https://${hostname}${pathname}`),
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
    const ctx = createContext('/api/cotizador-interno', undefined, 'admin.agrofarias.cl')
    const next = vi.fn()
    const result = await onRequest(ctx as never, next as never)
    expect(result).toBeInstanceOf(Response)
    expect((result as Response).status).toBe(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('bloquea /api/cotizador-interno/quotes sin cookie', async () => {
    mockVerifySession.mockResolvedValue(false)
    const ctx = createContext('/api/cotizador-interno/quotes', undefined, 'admin.agrofarias.cl')
    const next = vi.fn()
    const result = await onRequest(ctx as never, next as never)
    expect((result as Response).status).toBe(401)
  })

  it('permite /api/cotizador-interno con sesion valida', async () => {
    mockVerifySession.mockResolvedValue(true)
    const ctx = createContext('/api/cotizador-interno', 'token-valido', 'admin.agrofarias.cl')
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

  it('oculta /admin/cotizador en el dominio publico', async () => {
    mockVerifySession.mockResolvedValue(false)
    const ctx = createContext('/admin/cotizador')
    const next = vi.fn()
    const result = await onRequest(ctx as never, next as never)
    expect((result as Response).status).toBe(404)
    expect(next).not.toHaveBeenCalled()
  })

  it('oculta las API admin en el dominio publico', async () => {
    const ctx = createContext('/api/admin/login')
    const next = vi.fn()
    const result = await onRequest(ctx as never, next as never)
    expect((result as Response).status).toBe(404)
    expect(next).not.toHaveBeenCalled()
  })

  it('permite la raiz del subdominio admin', async () => {
    const ctx = createContext('/', undefined, 'admin.agrofarias.cl')
    const next = vi.fn().mockResolvedValue(new Response('ok'))
    const result = await onRequest(ctx as never, next as never)
    expect((result as Response).status).toBe(200)
    expect(next).toHaveBeenCalled()
  })

  it('bloquea rutas de tienda en el subdominio admin', async () => {
    const ctx = createContext('/tienda', undefined, 'admin.agrofarias.cl')
    const next = vi.fn()
    const result = await onRequest(ctx as never, next as never)
    expect((result as Response).status).toBe(404)
    expect(next).not.toHaveBeenCalled()
  })
})
