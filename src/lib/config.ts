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
  phone: '+56 9 6512 4122',
  phoneHref: 'tel:+56965124122',
  whatsapp: '56965124122',
  email: 'contacto@agrofarias.cl',
  emailHref: 'mailto:contacto@agrofarias.cl',
  address: ADDRESS,
  mapsUrl: `https://www.google.com/maps/search/?api=1&query=${MAPS_QUERY}`,
  directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${MAPS_QUERY}`,
  schedule: 'Lunes a Viernes: 8:00 - 17:30',
  social: {
    facebook: 'https://facebook.com/agrofarias',
    instagram: 'https://instagram.com/agrofarias',
    whatsapp: 'https://wa.me/56965124122',
  },
} as const
