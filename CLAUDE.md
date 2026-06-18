# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev           # Start Astro dev server (http://localhost:4321)
npm run build         # Production build
npm run preview       # Preview production build locally

# Tests
npm run test          # Run all tests once (Vitest)
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report (v8)

# Run a single test file
npx vitest run src/__tests__/unit/security.test.ts

# Sanity Studio (separate app)
cd studio-agro-farias && npm run dev
```

## Architecture Overview

**Agro Farías** is an agricultural supply e-commerce site for a Chilean company. It has no cart/checkout — customers add products to a quote list and submit it. Products and orders live in WooCommerce; editorial content (banners, promos, CTAs, contact info) lives in Sanity CMS.

### Tech Stack

- **Astro 6** — SSR with Vercel adapter; ISR enabled for static-ish pages
- **Vue 3** — all interactive components (`client:only="vue"` throughout)
- **Tailwind CSS v4** — via `@tailwindcss/vite` plugin (not PostCSS)
- **Sanity** — CMS for banners, promo banners, CTAs, contact info (`studio-agro-farias/`)
- **WooCommerce REST API** — product catalog and order creation (quotes become WC orders)
- **Upstash Redis** — two-tier caching (see below) + rate limiting
- **Vercel** — deployment target with ISR, `prefetch: hover` enabled

### ISR Exclusions

`/tienda` and `/api/*` are excluded from ISR caching because `/tienda` uses query-string filtering and `/api/*` routes use session cookies. All other routes use ISR with 1-hour expiration.

### Two-Tier Product Cache (`src/lib/woocommerce.ts`)

- **L1**: `globalThis.__wcCache` — per-instance in-memory map, 15-minute TTL, survives warm requests but lost on cold starts
- **L2**: Upstash Redis (`wc:all_products_*`, `wc:categorias`) — shared across all Vercel instances, 10-minute TTL, fills L1 on cold start

If Upstash env vars are absent, L2 is silently skipped and L1 is used alone.

### Quote System (Cart)

`src/stores/useQuote.ts` is a **module-level singleton** (not a Pinia store) using Vue `ref()`. It persists to `localStorage` under key `agrofarias-quote`. The `CartDrawer.vue` component renders the quote sidebar.

Submitting a quote calls `POST /api/cotizar`, which creates a WooCommerce order with `status: "pending"` and line items matching the selected products.

### Admin Panel (`/admin/cotizador`)

Password-protected panel for managing internal quotes (separate from the WooCommerce quote flow). Auth uses HMAC-SHA256 signed session cookies (`af_admin_session`, 8-hour TTL). All `/api/cotizador-interno/*` routes are gated by `src/middleware.ts`.

- `SESSION_SECRET` env var signs session tokens. Falls back to `COTIZADOR_PASSWORD` if absent.
- Password validation uses timing-safe comparison via Web Crypto API (`crypto.subtle`).

### Security Layer (`src/lib/security.ts`)

All API routes use helpers from this module:
- `validateOrigin()` — checks `Origin`/`Referer` against allowlist (`agrofarias.cl`)
- `checkRateLimit()` — Upstash sliding window (10 req/60s per IP)
- `getClientIP()` — trusts `x-real-ip` (Vercel-set), falls back to rightmost `x-forwarded-for` hop
- `sanitize()`, `sanitizePhone()`, `sanitizeProductName()` — strip `<>` and trim
- `isValidEmail()`, `isValidPositiveInt()`, `isValidNonEmptyString()` — validation helpers
- `errorResponse()` / `successResponse()` — JSON response factory

### Data Flow

```
Sanity CMS → src/lib/sanity.ts → Astro pages (banners, promos, CTAs)
WooCommerce → src/lib/woocommerce.ts → Astro pages / Vue components
                     ↑ L1 cache (memory) + L2 cache (Upstash)
User quote → useQuote store → POST /api/cotizar → WooCommerce order
```

### Pages

| Route | Type | Notes |
|-------|------|-------|
| `/` | SSR | Home with banner carousel, category grid, featured products |
| `/tienda` | SSR, no ISR | Shop with server-side filter/sort/pagination |
| `/categoria/[slug]` | SSR | Category landing page |
| `/producto/[slug]` | SSR | Product detail with tech sheet PDF link |
| `/cotizacion` | SSR | Quote form (public) |
| `/contacto` | SSR | Contact form → `POST /api/contacto` |
| `/admin/cotizador` | SSR | Admin quote panel (login shell, auth via API) |
| `/categorias` | SSR | Full category browser |

### Environment Variables

Required:
```
WORDPRESS_URL        # WooCommerce WordPress base URL
WC_CONSUMER_KEY      # WooCommerce REST API key
WC_CONSUMER_SECRET   # WooCommerce REST API secret
COTIZADOR_PASSWORD   # Admin panel password
SESSION_SECRET       # HMAC signing secret (recommended; falls back to COTIZADOR_PASSWORD)
COTIZACIONES_EMAIL   # Email for contact submissions
```

Optional (disables caching/rate-limiting if absent):
```
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
SANITY_PROJECT_ID    # Hardcoded in astro.config.mjs as zrpklrq5 (public)
```

### Testing

Tests live in `src/__tests__/` split into `unit/` and `components/`. The environment is `happy-dom`. Vue components are tested with `@testing-library/vue`.

Unit tests cover `security.ts`, `session.ts`, `html-sanitizer.ts`, `woocommerce.ts`, and `useQuote.ts`. Component tests cover `ProductCard`, `QuoteButton`, and `QuoteForm`.

### Sanity Studio

The `studio-agro-farias/` directory is a separate Sanity Studio project (project ID `zrpklrq5`, dataset `production`). Schema types: `banner`, `promoBanner`, `cta`, `contacto`, `categoriaDestacada`, `productoDestacado`. Run it independently with `cd studio-agro-farias && npm run dev`.
