// Tipos compartidos entre los composables y subcomponentes del cotizador interno.

/** Producto en resultados de búsqueda (shape ligero del endpoint). */
export interface SearchProduct {
  id: number
  name: string
  slug: string
  image: string
  price: number
}

/** Categoría para el selector de búsqueda. */
export interface SearchCategory {
  id: number
  name: string
  count: number
}

/** Línea de la cotización en construcción: producto + cantidad + precio unitario. */
export interface QuoteLineItem {
  d: SearchProduct
  q: number
  u: number
}

export interface QuoteCustomer {
  name?: string
  email?: string
  phone?: string
  company?: string
}

export interface QuoteProduct {
  name: string
  quantity: number | string
  total: number | string
}

/** Cliente registrado (WooCommerce customer) para el selector de cotización. */
export interface ClientOption {
  id: number
  first_name: string
  last_name: string
  email: string
  billing?: { phone?: string }
}

/** Cotización recibida tal como la devuelve `/api/cotizador-interno/quotes`. */
export interface ReceivedQuote {
  id: number
  number: number | string
  internalStatus: string
  date_created: string
  total: number | string
  customer: QuoteCustomer
  products: QuoteProduct[]
  message?: string
  editUrl?: string
}
