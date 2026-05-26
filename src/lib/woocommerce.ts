import type { ProductoWC, CategoriaWC, SolicitudCotizacion } from './types'

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

function getFetchHeaders(): HeadersInit {
  return {
    'Authorization': 'Basic ' + btoa(`${WC_KEY}:${WC_SECRET}`),
    'Content-Type': 'application/json',
  }
}

async function wcFetch(url: string): Promise<Response> {
  const res = await fetch(url, { headers: getFetchHeaders() })
  if (!res.ok) throw new Error(`WooCommerce API error: ${res.status} ${res.statusText}`)
  return res
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

  const allProducts: ProductoWC[] = []
  let page = 1
  const perPage = 100
  while (true) {
    const batch = await fetchProductos({ ...params, perPage, page })
    if (batch.length === 0) break
    allProducts.push(...batch)
    if (batch.length < perPage) break
    page++
  }
  setCache(cacheKey, allProducts)
  return allProducts
}

export async function fetchCategorias(): Promise<CategoriaWC[]> {
  const cached = getCached<CategoriaWC[]>('categorias')
  if (cached) return cached

  const url = `${WC_API}/products/categories?per_page=50`
  const data = await (await wcFetch(url)).json()
  setCache('categorias', data)
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
