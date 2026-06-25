import type { ProductoWC } from './types'

// Filtro/orden de productos compartido entre la tienda pública (`/tienda`) y el
// cotizador interno, para que ambos extraigan los productos de la misma forma
// (misma fuente cacheada `fetchAllProductos` + misma semántica de búsqueda).

export interface ProductFilterOpts {
  /** Texto libre: matchea contra `name` + `short_description` (sin HTML). */
  search?: string
  /** Filtro por slug de categoría (tienda pública). */
  categoriaSlug?: string
  /** Filtro por ID de categoría (cotizador interno). */
  categoriaId?: number
  /** Solo productos `instock`. */
  stock?: 'available' | ''
  /** Orden de salida. */
  sort?: 'default' | 'name-asc' | 'name-desc' | 'stock'
}

/** Shape ligero unificado para la búsqueda del cotizador. */
export interface ProductoLite {
  id: number
  name: string
  slug: string
  image: string
}

export function stripHtml(html?: string): string {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '')
}

/**
 * Filtra y ordena un catálogo de productos según los criterios dados.
 * No muta el arreglo de entrada (el orden se aplica sobre una copia).
 */
export function filterProductos(productos: ProductoWC[], opts: ProductFilterOpts): ProductoWC[] {
  const { search, categoriaSlug, categoriaId, stock, sort } = opts
  const query = search?.trim().toLowerCase()

  let result = productos.filter((p) => {
    if (categoriaSlug && !p.categories?.some((c) => c.slug === categoriaSlug)) return false
    if (categoriaId && !p.categories?.some((c) => c.id === categoriaId)) return false
    if (query) {
      // Match en nombre O descripción corta por separado (no concatenados),
      // para no producir coincidencias que cruzan el límite entre ambos.
      const matches =
        p.name.toLowerCase().includes(query) ||
        stripHtml(p.short_description).toLowerCase().includes(query)
      if (!matches) return false
    }
    return true
  })

  if (stock === 'available') {
    result = result.filter((p) => p.stock_status === 'instock')
  }

  if (sort === 'name-asc') {
    result = [...result].sort((a, b) => a.name.localeCompare(b.name))
  } else if (sort === 'name-desc') {
    result = [...result].sort((a, b) => b.name.localeCompare(a.name))
  } else if (sort === 'stock') {
    result = [...result].sort((a, b) => {
      if (a.stock_status === 'instock' && b.stock_status !== 'instock') return -1
      if (a.stock_status !== 'instock' && b.stock_status === 'instock') return 1
      return 0
    })
  }

  return result
}

/** Reduce un producto completo al shape ligero usado por la búsqueda del cotizador. */
export function toProductoLite(p: ProductoWC): ProductoLite {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    image: p.images?.[0]?.src || '',
  }
}
