import type { ProductoWC, CategoriaWC, SolicitudCotizacion, WCCustomer, WCProductPayload, WCMediaResult } from './types'
import { getRedis } from './kv'

const WP_URL = import.meta.env.WORDPRESS_URL
const WC_KEY = import.meta.env.WC_CONSUMER_KEY
const WC_SECRET = import.meta.env.WC_CONSUMER_SECRET
const WC_API = `${WP_URL}/wp-json/wc/v3`

const CACHE_TTL = 15 * 60 * 1000

interface CacheEntry { data: unknown; expiresAt: number }

function getGlobalCache(): Map<string, CacheEntry> {
  const g = globalThis as Record<string, unknown>
  if (!g.__wcCache) {
    g.__wcCache = new Map<string, CacheEntry>()
  }
  return g.__wcCache as Map<string, CacheEntry>
}

const cache = getGlobalCache()

function getCached<T>(key: string): T | null {
  const entry = cache.get(key)
  if (entry && Date.now() < entry.expiresAt) {
    return entry.data as T
  }
  if (entry) cache.delete(key)
  return null
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL })
}

// --- Caché L2 compartido (Upstash KV) ---
// L1 = memoria por-instancia (rápida pero se pierde en cold starts).
// L2 = Upstash, compartido entre todas las instancias → evita re-pedir todo el
// catálogo a WooCommerce en cada arranque en frío.
const KV_TTL_SECONDS = 600 // 10 min
const KV_MAX_BYTES = 1_000_000 // no cachear payloads enormes en KV

async function kvGet<T>(key: string): Promise<T | null> {
  const r = getRedis()
  if (!r) return null
  try { return (await r.get<T>(key)) ?? null } catch { return null }
}

async function kvSet(key: string, data: unknown): Promise<void> {
  const r = getRedis()
  if (!r) return
  try {
    if (JSON.stringify(data).length > KV_MAX_BYTES) return
    await r.set(key, data, { ex: KV_TTL_SECONDS })
  } catch { /* noop: el caché es best-effort */ }
}

function getFetchHeaders(): HeadersInit {
  return {
    'Authorization': 'Basic ' + Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString('base64'),
    'Content-Type': 'application/json',
  }
}

async function wcFetch(url: string): Promise<Response> {
  const res = await fetch(url, { headers: getFetchHeaders() })
  if (!res.ok) throw new Error(`WooCommerce API error: ${res.status} ${res.statusText}`)
  return res
}

async function wcFetchWithHeaders(url: string): Promise<{ res: Response; totalPages: number; total: number }> {
  const res = await fetch(url, { headers: getFetchHeaders() })
  if (!res.ok) throw new Error(`WooCommerce API error: ${res.status} ${res.statusText}`)
  const totalPages = parseInt(res.headers.get('X-WP-TotalPages') || '1', 10)
  const total = parseInt(res.headers.get('X-WP-Total') || '0', 10)
  return { res, totalPages, total }
}

async function wcPost(path: string, body: unknown): Promise<Response> {
  const res = await fetch(`${WP_URL}${path}`, {
    method: 'POST',
    headers: getFetchHeaders(),
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`WooCommerce POST error: ${res.status} ${text.slice(0, 200)}`)
  }
  return res
}

async function wcPut(path: string, body: unknown): Promise<Response> {
  const res = await fetch(`${WP_URL}${path}`, {
    method: 'PUT',
    headers: getFetchHeaders(),
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`WooCommerce PUT error: ${res.status} ${text.slice(0, 200)}`)
  }
  return res
}

async function wcDelete(path: string): Promise<Response> {
  const res = await fetch(`${WP_URL}${path}`, {
    method: 'DELETE',
    headers: getFetchHeaders(),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`WooCommerce DELETE error: ${res.status} ${text.slice(0, 200)}`)
  }
  return res
}

async function wcPostMedia(file: File): Promise<WCMediaResult> {
  const WP_USERNAME = import.meta.env.WP_USERNAME
  const WP_APP_PASSWORD = import.meta.env.WP_APP_PASSWORD
  if (!WP_USERNAME || !WP_APP_PASSWORD) {
    throw new Error('WP_USERNAME y WP_APP_PASSWORD son requeridos para subir imágenes')
  }
  const auth = 'Basic ' + Buffer.from(`${WP_USERNAME}:${WP_APP_PASSWORD}`).toString('base64')
  const formData = new FormData()
  formData.append('file', file, file.name)
  const res = await fetch(`${WP_URL}/wp-json/wp/v2/media`, {
    method: 'POST',
    headers: {
      'Authorization': auth,
      'Content-Disposition': `attachment; filename="${file.name}"`,
    },
    body: formData,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`WordPress media upload error: ${res.status} ${text.slice(0, 200)}`)
  }
  const data = await res.json()
  return { id: data.id, source_url: data.source_url }
}

function bustProductCache(): void {
  const g = globalThis as Record<string, unknown>
  const c = g.__wcCache as Map<string, unknown> | undefined
  if (c) for (const k of [...c.keys()]) if (k.startsWith('all_products')) c.delete(k)
}

export async function fetchProductos(params?: { categoria?: string; perPage?: number; page?: number }): Promise<ProductoWC[]> {
  const page = params?.page || 1
  const perPage = Math.min(params?.perPage || 100, 100)
  let url = `${WC_API}/products?per_page=${perPage}&page=${page}&status=publish`
  if (params?.categoria) url += `&category=${params.categoria}`
  return (await wcFetch(url)).json()
}

export async function fetchAllProductos(params?: { categoria?: string }): Promise<ProductoWC[]> {
  const cacheKey = `all_products_${params?.categoria || 'all'}`
  const cached = getCached<ProductoWC[]>(cacheKey)
  if (cached) return cached

  const kvCached = await kvGet<ProductoWC[]>(`wc:${cacheKey}`)
  if (kvCached && kvCached.length) {
    setCache(cacheKey, kvCached)
    return kvCached
  }

  const perPage = 100
  let baseUrl = `${WC_API}/products?per_page=${perPage}&status=publish`
  if (params?.categoria) baseUrl += `&category=${params.categoria}`

  const { res: firstRes, totalPages } = await wcFetchWithHeaders(`${baseUrl}&page=1`)
  const firstPage: ProductoWC[] = await firstRes.json()
  if (firstPage.length === 0) {
    setCache(cacheKey, [])
    return []
  }

  if (totalPages <= 1) {
    setCache(cacheKey, firstPage)
    await kvSet(`wc:${cacheKey}`, firstPage)
    return firstPage
  }

  const remainingPages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, i) => i + 2).map(page =>
      fetchProductos({ ...params, perPage, page }).catch(() => [] as ProductoWC[])
    )
  )

  const allProducts = [firstPage, ...remainingPages].flat()
  setCache(cacheKey, allProducts)
  await kvSet(`wc:${cacheKey}`, allProducts)
  return allProducts
}

export async function fetchCategorias(): Promise<CategoriaWC[]> {
  const cached = getCached<CategoriaWC[]>('categorias')
  if (cached) return cached

  const kvCached = await kvGet<CategoriaWC[]>('wc:categorias')
  if (kvCached && kvCached.length) {
    setCache('categorias', kvCached)
    return kvCached
  }

  const url = `${WC_API}/products/categories?per_page=50`
  const data = await (await wcFetch(url)).json()
  setCache('categorias', data)
  await kvSet('wc:categorias', data)
  return data
}

export async function fetchProductoBySlug(slug: string): Promise<ProductoWC | null> {
  const results = await (await wcFetch(`${WC_API}/products?slug=${slug}&status=publish`)).json()
  return results[0] || null
}

export async function fetchProductoById(id: number): Promise<ProductoWC> {
  return (await wcFetch(`${WC_API}/products/${id}`)).json()
}

export async function fetchProductosPorCategoria(categoriaId: number, perPage = 50): Promise<ProductoWC[]> {
  return (await wcFetch(`${WC_API}/products?category=${categoriaId}&per_page=${perPage}&status=publish`)).json()
}

export async function fetchOrders(params?: { perPage?: number; page?: number }): Promise<Record<string, unknown>[]> {
  const perPage = Math.min(params?.perPage || 50, 100);
  const page = params?.page || 1;
  const url = `${WC_API}/orders?per_page=${perPage}&page=${page}&status=any`;
  return (await wcFetch(url)).json();
}

// --- Admin functions (no cache, live data) ---

export async function fetchProductosAdmin(params?: {
  search?: string; category?: number; page?: number; per_page?: number; status?: string
}): Promise<{ products: ProductoWC[]; totalPages: number; total: number }> {
  const page = params?.page || 1
  const perPage = Math.min(params?.per_page || 20, 100)
  let url = `${WC_API}/products?per_page=${perPage}&page=${page}&status=${params?.status || 'any'}`
  if (params?.search) url += `&search=${encodeURIComponent(params.search)}`
  if (params?.category) url += `&category=${params.category}`
  const { res, totalPages, total } = await wcFetchWithHeaders(url)
  const products: ProductoWC[] = await res.json()
  return { products, totalPages, total }
}

export async function createProducto(payload: WCProductPayload): Promise<ProductoWC> {
  const res = await wcPost('/wp-json/wc/v3/products', payload)
  const product = await res.json()
  bustProductCache()
  return product
}

export async function updateProducto(id: number, payload: WCProductPayload): Promise<ProductoWC> {
  const res = await wcPut(`/wp-json/wc/v3/products/${id}`, payload)
  const product = await res.json()
  bustProductCache()
  return product
}

export async function trashProducto(id: number): Promise<void> {
  await wcPut(`/wp-json/wc/v3/products/${id}`, { status: 'trash' })
  bustProductCache()
}

export async function uploadProductoImage(file: File): Promise<WCMediaResult> {
  return wcPostMedia(file)
}

export async function fetchCustomers(params?: {
  search?: string; page?: number; per_page?: number
}): Promise<{ customers: WCCustomer[]; totalPages: number; total: number }> {
  const page = params?.page || 1
  const perPage = Math.min(params?.per_page || 20, 100)
  let url = `${WC_API}/customers?per_page=${perPage}&page=${page}`
  if (params?.search) url += `&search=${encodeURIComponent(params.search)}`
  const { res, totalPages, total } = await wcFetchWithHeaders(url)
  const customers: WCCustomer[] = await res.json()
  return { customers, totalPages, total }
}

export async function fetchCustomerById(id: number): Promise<WCCustomer> {
  return (await wcFetch(`${WC_API}/customers/${id}`)).json()
}

export async function createCustomer(payload: {
  first_name: string; last_name: string; email: string; username: string; password: string
  billing?: { phone?: string; city?: string; address_1?: string; state?: string; country?: string }
}): Promise<WCCustomer> {
  return (await wcPost('/wp-json/wc/v3/customers', payload)).json()
}

export async function deleteCustomer(id: number): Promise<void> {
  await wcDelete(`/wp-json/wc/v3/customers/${id}?force=true`)
}

export async function fetchOrdersByCustomer(customerId: number): Promise<Record<string, unknown>[]> {
  const url = `${WC_API}/orders?customer=${customerId}&per_page=20&status=any`
  return (await wcFetch(url)).json()
}

export async function submitCotizacion(data: SolicitudCotizacion): Promise<{ success?: boolean; id?: number; error?: string }> {
  try {
    const res = await fetch('/api/cotizar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        productos: data.productos.map(p => ({ id: p.id, name: p.name, cantidad: p.cantidad })),
      }),
    })
    if (res.ok) {
      const json = await res.json()
      return { success: true, id: json.id }
    }
    const errData = await res.json().catch(() => ({}))
    return { error: errData.error || `Error ${res.status}` }
  } catch {
    return { error: 'Error de conexión al enviar la cotización' }
  }
}
