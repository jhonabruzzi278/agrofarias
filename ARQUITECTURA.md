# Arquitectura del Proyecto — Agro Farías

Documentación de referencia para entender cómo funciona el sistema internamente y cómo replicarlo.

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Astro 6.x (SSR mode, `output: server`) |
| UI Components | Vue 3 (SFC) via `@astrojs/vue` |
| Estilos | Tailwind CSS v4 via `@tailwindcss/vite` |
| Deploy | Vercel (Serverless Functions) |
| Backend CMS | WordPress + WooCommerce REST API v3 |
| CMS contenido | Sanity (banners, CTAs, PromoBanners) |
| Cache L1 | `globalThis.__wcCache` (Map en memoria, por instancia) |
| Cache L2 | Upstash Redis KV (compartido entre instancias) |
| Auth | Cookie HMAC + SESSION_SECRET |
| PDF | jsPDF (client-side, generado en el navegador) |

---

## Estructura de Archivos

```
src/
├── pages/
│   ├── index.astro               # Home page (SSR)
│   ├── tienda/index.astro        # Tienda paginada (SSR)
│   ├── producto/[slug].astro     # Página individual de producto
│   ├── categoria/[slug].astro    # Catálogo por categoría
│   ├── categorias.astro          # Listado de categorías
│   ├── cotizar.astro             # Formulario de cotización pública
│   ├── contacto.astro            # Página de contacto
│   ├── admin/
│   │   └── cotizador.astro       # Panel admin (login + dashboard)
│   └── api/
│       ├── admin/
│       │   ├── login.ts          # POST /api/admin/login → emite cookie HMAC
│       │   ├── logout.ts         # POST /api/admin/logout → borra cookie
│       │   ├── categorias.ts     # GET /api/admin/categorias
│       │   ├── productos/
│       │   │   ├── index.ts      # GET (lista) + POST (crear)
│       │   │   ├── [id].ts       # GET (uno) + PUT (editar) + DELETE (papelera)
│       │   │   └── imagen.ts     # POST multipart → sube al Media Library de WP
│       │   └── clientes/
│       │       ├── index.ts      # GET (lista) + POST (crear)
│       │       └── [id].ts       # GET (detalle + órdenes) + DELETE
│       └── cotizador-interno/
│           ├── index.ts          # POST → crea orden WooCommerce
│           ├── quotes.ts         # GET → lista cotizaciones (órdenes WC)
│           └── update-status.ts  # POST → actualiza estado interno (Upstash)
├── components/
│   ├── CotizadorAdmin.vue        # Panel admin completo (login + 5 tabs)
│   ├── admin/
│   │   ├── AdminProductos.vue    # CRUD de productos con upload de imagen
│   │   ├── AdminClientes.vue     # CRUD de clientes + panel de historial
│   │   └── AdminConfiguracion.vue # Placeholder
│   ├── HeroSection.astro         # Hero estático (imagen agricultor + CTAs)
│   ├── CategoryBentoSection.astro # Bento grid de categorías destacadas
│   ├── WhyUsSection.astro        # 4 propuestas de valor
│   ├── BannerCarousel.vue        # Carrusel de banners desde Sanity
│   ├── CategoryGrid.vue          # Grid de todas las categorías
│   ├── ProductGrid.vue           # Grid de productos
│   ├── PromoBanners.astro        # 3 banners promocionales desde Sanity
│   ├── CTASection.astro          # Sección de cotización final
│   ├── Footer.vue                # Footer con categorías
│   └── ...
├── lib/
│   ├── woocommerce.ts            # Toda la lógica de llamadas a WC API
│   ├── types.ts                  # Interfaces TypeScript
│   ├── kv.ts                     # Cliente Upstash Redis
│   └── sanity.ts                 # Cliente Sanity
├── middleware.ts                 # Auth middleware (verifica cookie en rutas protegidas)
└── styles/
    └── global.css                # Variables CSS (colores, fuentes), base de Tailwind
```

---

## Autenticación del Panel Admin

### Flujo de login
1. Usuario visita `/admin/cotizador` → carga `CotizadorAdmin.vue` (client:only)
2. El componente llama `GET /api/cotizador-interno/quotes` al montar
3. Si devuelve 401 → muestra pantalla de login
4. Usuario envía password → `POST /api/admin/login`
5. El servidor compara con `COTIZADOR_PASSWORD` → si coincide, genera cookie HMAC
6. Cookie: `session=<timestamp>.<HMAC(timestamp, SESSION_SECRET)>` con `HttpOnly`, `SameSite=Lax`
7. Todas las rutas `/api/admin/*` y `/api/cotizador-interno/*` verifican la cookie en el middleware

### Cookie HMAC
```typescript
// Generar
const ts = Date.now()
const sig = createHmac('sha256', SESSION_SECRET).update(String(ts)).digest('hex')
cookie = `${ts}.${sig}` // 8h de validez

// Verificar (en middleware.ts)
const [ts, sig] = cookie.split('.')
const expected = createHmac('sha256', SESSION_SECRET).update(ts).digest('hex')
const valid = timingSafeEqual(sig, expected) && (Date.now() - Number(ts)) < 8h
```

---

## WooCommerce API

### Autenticación
Todas las llamadas usan **Basic Auth** con las claves de la REST API de WooCommerce:
```
Authorization: Basic base64(WC_CONSUMER_KEY:WC_CONSUMER_SECRET)
```
Estas claves se generan en: WP Admin → WooCommerce → Ajustes → Avanzado → REST API.

### Media Library (upload de imágenes)
Para subir imágenes al WordPress Media Library se usan credenciales distintas: **Application Password** de un usuario WordPress con rol de Editor o Administrador.
```
Authorization: Basic base64(WP_USERNAME:WP_APP_PASSWORD)
POST /wp-json/wp/v2/media
Content-Type: multipart/form-data
```
Las Application Passwords se generan en: WP Admin → Usuarios → Editar usuario → Sección "Application Passwords".

### Endpoints principales usados

| Endpoint | Uso |
|---|---|
| `GET /wp-json/wc/v3/products` | Lista productos (paginada, con filtros) |
| `POST /wp-json/wc/v3/products` | Crear producto |
| `PUT /wp-json/wc/v3/products/{id}` | Editar producto |
| `GET /wp-json/wc/v3/product_categories` | Lista categorías |
| `GET /wp-json/wc/v3/orders` | Lista órdenes (cotizaciones) |
| `POST /wp-json/wc/v3/orders` | Crear orden (cotización) |
| `PUT /wp-json/wc/v3/orders/{id}` | Actualizar estado de orden |
| `GET /wp-json/wc/v3/customers` | Lista clientes |
| `POST /wp-json/wc/v3/customers` | Crear cliente |
| `DELETE /wp-json/wc/v3/customers/{id}?force=true` | Eliminar cliente |
| `POST /wp-json/wp/v2/media` | Subir imagen al Media Library |

---

## Sistema de Cache

### Por qué dos niveles
Las Serverless Functions de Vercel son efímeras (cold starts). Sin cache, cada visita a la tienda hace llamadas a la API de WooCommerce que tarda 500ms–2s.

### L1 — Memoria global por instancia
```typescript
// globalThis.__wcCache = Map<key, { data, expiresAt }>
// TTL: 15 minutos
// Se pierde en cold starts
```

### L2 — Upstash Redis (KV)
```typescript
// KV_TTL_SECONDS = 600 (10 minutos)
// Compartido entre todas las instancias de Vercel
// Se usa como fallback cuando L1 no tiene el dato
```

### Flujo
```
Request → L1 hit? → serve  
               ↓ miss  
           L2 hit? → populate L1 → serve  
               ↓ miss  
           WooCommerce API → populate L1 + L2 → serve
```

### Invalidación en mutaciones
Cuando el admin crea/edita/elimina un producto, el endpoint del API limpia el L1 manualmente:
```typescript
const c = (globalThis as any).__wcCache as Map<string, unknown>
if (c) for (const k of [...c.keys()]) if (k.startsWith('all_products')) c.delete(k)
```
El L2 expira naturalmente en 10 min (aceptable para operaciones admin).

---

## Panel Admin — Tabs y Funcionalidades

### `/admin/cotizador`

| Tab | Componente | Función |
|---|---|---|
| Nueva cotización | `CotizadorAdmin.vue` | Busca productos, arma cotización con precio manual, envía email al cliente y crea orden en WC |
| Cotizaciones recibidas | `CotizadorAdmin.vue` | Lista órdenes de WC, métricas, filtros, cambio de estado interno, link a WhatsApp, descargar PDF |
| Productos | `AdminProductos.vue` | CRUD completo de productos WC: buscar, filtrar por categoría/estado, crear, editar, subir imagen, papelera |
| Clientes | `AdminClientes.vue` | Lista clientes WC, buscar, crear, ver historial de pedidos en panel lateral, eliminar |
| Configuración | `AdminConfiguracion.vue` | Placeholder (futuras opciones del sistema) |

### Generación de PDF (cotizaciones)
Botón "Descargar PDF" en cada cotización → carga `jsPDF` dinámicamente (no bloquea el bundle inicial) → genera un PDF A4 con:
- Logo de Agro Farías (cargado desde `/logo-agrofarias.png` como data URL)
- Número y fecha de cotización
- Datos del cliente
- Tabla de productos con precios unitarios y subtotales
- Totales: neto, IVA 19%, total con IVA
- Mensaje del cliente (si existe)
- Footer corporativo

---

## Variables de Entorno Necesarias

| Variable | Descripción | Requerida |
|---|---|---|
| `WORDPRESS_URL` | URL base de WordPress (ej: `https://api.agrofarias.cl`) | Sí |
| `WC_CONSUMER_KEY` | Clave pública de WC REST API | Sí |
| `WC_CONSUMER_SECRET` | Clave secreta de WC REST API | Sí |
| `WC_API_VERSION` | Versión de la API (ej: `wc/v3`) | Sí |
| `WP_USERNAME` | Usuario WordPress para Media Library | Sí (para upload de imágenes) |
| `WP_APP_PASSWORD` | Application Password de WP (con espacios) | Sí (para upload de imágenes) |
| `COTIZADOR_PASSWORD` | Contraseña del panel admin | Sí |
| `SESSION_SECRET` | Secreto HMAC para cookies de sesión | Sí |
| `COTIZACIONES_EMAIL` | Email de destino de cotizaciones | Sí |
| `SANITY_PROJECT_ID` | ID del proyecto Sanity | Sí (banners/CTAs) |
| `SANITY_DATASET` | Dataset Sanity (ej: `production`) | Sí |
| `SANITY_API_VERSION` | Versión API Sanity | Sí |
| `KV_REST_API_URL` | URL de Upstash Redis | Opcional (mejora performance) |
| `KV_REST_API_TOKEN` | Token de Upstash Redis | Opcional (mejora performance) |

---

## Sanity CMS

Se usa solo para contenido editable sin re-deploy:
- **Banners del carrusel**: imágenes, título, subtítulo, botón CTA
- **Promociones destacadas** (PromoBanners): 3 tarjetas con imagen, precio, link
- **Sección CTA**: título, subtítulo, texto y URL del botón

Si Sanity no está configurado, todos los componentes tienen fallbacks hardcodeados.

---

## Flujo de Cotización

1. Admin busca producto en tab "Nueva cotización" → llama `GET /api/cotizador-interno/productos?search=...`
2. Agrega productos, define precio unitario y cantidad manualmente
3. Completa datos del cliente (nombre, email, teléfono, empresa, mensaje)
4. Hace click en "Enviar cotización" → `POST /api/cotizador-interno`
5. El backend:
   a. Crea la orden en WooCommerce con los productos y precios
   b. Agrega al cliente como billing info de la orden
   c. Guarda el mensaje en `meta_data` de la orden
   d. WooCommerce envía email automático al cliente con los precios
6. El tab "Cotizaciones recibidas" muestra la orden con las acciones rápidas

---

## Replicar este sistema en otro proyecto

### Checklist mínimo
1. Astro + Vue 3 + Tailwind CSS 4
2. Adaptador Vercel (`@astrojs/vercel`)
3. WordPress con WooCommerce instalado
4. Generar claves REST API de WooCommerce (lectura + escritura)
5. Crear un Application Password en WordPress para upload de imágenes
6. Definir `COTIZADOR_PASSWORD` y `SESSION_SECRET` en las variables de entorno
7. Copiar `src/middleware.ts` para proteger rutas de admin
8. Copiar `src/lib/woocommerce.ts` y ajustar `WP_URL` / `WC_API`
9. (Opcional) Conectar Upstash Redis para cache L2
10. (Opcional) Conectar Sanity para contenido editable del frontend

### Sin Sanity
Todos los componentes (`BannerCarousel`, `PromoBanners`, `CTASection`) tienen datos de fallback y funcionan sin Sanity configurado.

### Sin Upstash
El sistema funciona con solo L1 (memoria). Cada cold start hará llamadas fresh a WooCommerce. Adecuado para tráfico bajo.
