const ADDRESS = 'Ruta 66 km 95850, San Pedro, Melipilla, Región Metropolitana'
// Incluir el nombre del negocio mejora el match si está listado en Google Maps.
const MAPS_QUERY = encodeURIComponent(`Agro Farías, ${ADDRESS}`)

export const IVA_RATE = 0.19;

export const NAV_ITEMS = [
  { label: 'Inicio', href: '/' },
  { label: 'Tienda', href: '/tienda' },
  { label: 'Cotizar', href: '/cotizar' },
  { label: 'Contacto', href: '/contacto' },
];

export const PRODUCTS_PER_PAGE = 24;

export const ALLOWED_QUOTE_STATUSES = ['pending', 'processing', 'on-hold', 'completed', 'cancelled'] as const;

export const CATEGORY_IMAGES: Record<string, string> = {
  'Fertilizantes': '/imagenes optimizadas/fertilizantes.webp',
  'Agroquímicos': '/imagenes optimizadas/agroquimicos.webp',
  'Semillas': '/imagenes optimizadas/semillas.webp',
  'Herramientas': '/imagenes optimizadas/herramientas.webp',
  'Riego': '/imagenes optimizadas/riego.webp',
  'Sustratos': '/imagenes optimizadas/sustratos.webp',
  'Manejo de plagas': '/imagenes optimizadas/plagas.webp',
  'Protección de cultivos': '/imagenes optimizadas/proteccion.webp',
  'Maquinaria': '/imagenes optimizadas/maquinaria.webp',
};

export const SITE_CONFIG = {
  name: 'Agro Farías',
  url: 'https://agrofarias.cl',
  phone: '+56 9 1234 5678',
  phoneHref: 'tel:+56912345678',
  whatsapp: '56912345678',
  email: 'contacto@agrofarias.cl',
  emailHref: 'mailto:contacto@agrofarias.cl',
  address: ADDRESS,
  // Abre la ubicación en Google Maps (app en móvil, web en escritorio).
  mapsUrl: `https://www.google.com/maps/search/?api=1&query=${MAPS_QUERY}`,
  // "Cómo llegar": abre Google Maps con la ruta hacia el local.
  directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${MAPS_QUERY}`,
  schedule: 'Lunes a Viernes: 8:00 - 18:00 | Sábados: 9:00 - 13:00',
  social: {
    facebook: 'https://facebook.com/agrofarias',
    instagram: 'https://instagram.com/agrofarias',
    whatsapp: 'https://wa.me/56912345678',
  },
} as const
