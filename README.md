# Agro Farías

> Insumos, herramientas y soluciones agrícolas con atención personalizada y despacho confiable para productores chilenos.

Sitio web de comercio agrícola ubicado en Melipilla, Región Metropolitana, Chile. Ofrecemos fertilizantes, herbicidas, insecticidas, fungicidas, herramientas, repuestos, equipos de riego y seguridad agrícola.

## Tecnologías

- **Framework**: [Astro](https://astro.build) 6.x + SSR (Vercel adapter)
- **UI**: [Vue 3](https://vuejs.org) con Composition API + TypeScript
- **Estilos**: [Tailwind CSS v4](https://tailwindcss.com)
- **CMS**: [Sanity](https://sanity.io) (banners, promociones, CTA)
- **E-commerce**: WooCommerce REST API
- **Deploy**: [Vercel](https://vercel.com)

## Estructura

```
src/
├── components/     # Componentes Vue y Astro
│   ├── BannerCarousel.vue
│   ├── CategoryGrid.vue
│   ├── HeaderUpper.vue
│   ├── HeaderLower.vue
│   ├── ProductCard.vue
│   ├── ProductGrid.vue
│   ├── PromoBanners.astro
│   ├── QuoteButton.vue
│   ├── QuoteForm.vue
│   ├── QuotePage.vue
│   ├── Footer.vue
│   └── WhatsAppButton.vue
├── composables/    # Composables Vue
├── layouts/        # Layout base
├── lib/            # Clientes API, tipos, seguridad, configuración
├── pages/          # Rutas de la aplicación
│   ├── index.astro
│   ├── tienda/
│   ├── categoria/[slug].astro
│   ├── producto/[slug].astro
│   ├── categorias.astro
│   ├── contacto.astro
│   ├── cotizacion.astro
│   ├── cotizar.astro
│   └── api/
├── stores/         # Estado global (Pinia)
└── styles/         # CSS global
```

## Variables de entorno

Copia `.env.example` a `.env` y configura:

| Variable | Descripción |
|---|---|
| `WORDPRESS_URL` | URL de WordPress/WooCommerce |
| `WC_CONSUMER_KEY` | WooCommerce API consumer key |
| `WC_CONSUMER_SECRET` | WooCommerce API consumer secret |
| `SANITY_PROJECT_ID` | Sanity project ID |
| `COLTIZACIONES_EMAIL` | Email para cotizaciones |
| `WP_CONTACT_API_KEY` | API key para endpoint de contacto (opcional) |

## Desarrollo

```bash
pnpm install
pnpm dev         # http://localhost:4321
pnpm build       # Build producción
pnpm test        # Vitest
```

## Licencia

Este proyecto es software propietario. **Todos los derechos reservados.** No está permitido copiar, modificar, distribuir, vender ni usar este código sin autorización expresa por escrito de Agro Farías.
