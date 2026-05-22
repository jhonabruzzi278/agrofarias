export interface ProductoWC {
  id: number
  slug: string
  name: string
  permalink: string
  description: string
  short_description: string
  images: Array<{ id: number; src: string; alt: string }>
  categories: Array<{ id: number; name: string; slug: string }>
  tags: Array<{ id: number; name: string; slug: string }>
  attributes: Array<{ id: number; name: string; options: string[] }>
  acf?: {
    sku?: string
    unidad_medida?: string
    cultivo_aplicable?: string
    dosis_recomendada?: string
  }
  stock_status: 'instock' | 'outofstock' | 'onbackorder'
  stock_quantity: number | null
}

export interface CategoriaWC {
  id: number
  name: string
  slug: string
  parent: number
  description: string
  image: { id: number; src: string; alt: string } | null
  count: number
}

export interface QuoteItem {
  id: number
  name: string
  slug: string
  image?: string
  cantidad: number
}

export interface SolicitudCotizacion {
  productos: QuoteItem[]
  nombre: string
  email: string
  telefono: string
  empresa?: string
  mensaje?: string
}

// Sanity types
export interface BannerSanity {
  _id: string
  titulo: string
  subtitulo: string
  imagen: { asset: { url: string } }
  textoBoton: string
  urlBoton: string
  activo: boolean
  orden: number
}

export interface CategoriaDestacadaSanity {
  _id: string
  nombre: string
  slug: string
  icono: { asset: { url: string } }
  descripcion: string
  woocommerceId: number
  activo: boolean
  orden: number
}

export interface PromoBannerSanity {
  _id: string
  titulo: string
  subtitulo: string
  precio: string
  textoBoton: string
  urlBoton: string
  imagen: { asset: { url: string } }
  activo: boolean
  orden: number
}

export interface CTASanity {
  _id: string
  titulo: string
  subtitulo: string
  textoBoton: string
  urlBoton: string
  imagenFondo: { asset: { url: string } }
  activo: boolean
}

export interface ContactoSanity {
  _id: string
  empresa: string
  direccion: string
  telefono: string
  email: string
  horarioAtencion: string
  facebook?: string
  instagram?: string
  linkedin?: string
  whatsapp?: string
}

export interface ProductoDestacadoSanity {
  _id: string
  nombre: string
  descripcion: string
  imagen: { asset: { url: string } }
  galeria: Array<{ asset: { url: string } }>
  woocommerceId: number
  categoria: string
  destacado: boolean
  orden: number
}
