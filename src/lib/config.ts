const ADDRESS = 'Ruta 66 km 95850, San Pedro, Melipilla, Región Metropolitana'
// Incluir el nombre del negocio mejora el match si está listado en Google Maps.
const MAPS_QUERY = encodeURIComponent(`Agro Farías, ${ADDRESS}`)

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
