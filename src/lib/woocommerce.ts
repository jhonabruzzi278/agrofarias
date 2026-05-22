import type { ProductoWC, CategoriaWC, SolicitudCotizacion } from './types'

const WP_URL = import.meta.env.WORDPRESS_URL
const WC_KEY = import.meta.env.WC_CONSUMER_KEY
const WC_SECRET = import.meta.env.WC_CONSUMER_SECRET
const WC_API = `${WP_URL}/wp-json/wc/v3`

function getFetchHeaders(): HeadersInit {
  return {
    'Authorization': 'Basic ' + btoa(`${WC_KEY}:${WC_SECRET}`),
    'Content-Type': 'application/json',
  }
}

export async function fetchProductos(params?: { categoria?: string; perPage?: number; page?: number }): Promise<ProductoWC[]> {
  const page = params?.page || 1
  const perPage = Math.min(params?.perPage || 100, 100)
  let url = `${WC_API}/products?per_page=${perPage}&page=${page}&status=publish`
  if (params?.categoria) {
    url += `&category=${params.categoria}`
  }
  const res = await fetch(url, { headers: getFetchHeaders() })
  if (!res.ok) throw new Error(`WooCommerce API error: ${res.status} ${res.statusText}`)
  return res.json()
}

export async function fetchAllProductos(params?: { categoria?: string }): Promise<ProductoWC[]> {
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
  return allProducts
}

export async function fetchCategorias(): Promise<CategoriaWC[]> {
  const url = `${WC_API}/products/categories?per_page=50`
  const res = await fetch(url, { headers: getFetchHeaders() })
  if (!res.ok) throw new Error(`WooCommerce API error: ${res.status} ${res.statusText}`)
  const data = await res.json()
  return data
}

export async function fetchProductoBySlug(slug: string): Promise<ProductoWC[]> {
  const url = `${WC_API}/products?slug=${slug}&status=publish`
  const res = await fetch(url, { headers: getFetchHeaders() })
  if (!res.ok) throw new Error(`WooCommerce API error: ${res.status} ${res.statusText}`)
  return res.json()
}

export async function fetchProductoById(id: number): Promise<ProductoWC> {
  const url = `${WC_API}/products/${id}`
  const res = await fetch(url, { headers: getFetchHeaders() })
  if (!res.ok) throw new Error(`WooCommerce API error: ${res.status} ${res.statusText}`)
  return res.json()
}

export async function fetchProductosPorCategoria(categoriaId: number, perPage = 50): Promise<ProductoWC[]> {
  const url = `${WC_API}/products?category=${categoriaId}&per_page=${perPage}&status=publish`
  const res = await fetch(url, { headers: getFetchHeaders() })
  if (!res.ok) throw new Error(`WooCommerce API error: ${res.status} ${res.statusText}`)
  return res.json()
}

export async function submitCotizacion(data: SolicitudCotizacion): Promise<{ success?: boolean; id?: number; error?: string }> {
  try {
    const res = await fetch('/api/cotizar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
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
