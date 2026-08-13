// @ts-check
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://agrofarias.cl',
  trailingSlash: 'never',
  // Prefetch de links internos al pasar el mouse: arranca la carga del destino
  // antes del click (tienda, paginación, productos) → navegación casi instantánea.
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  adapter: vercel({
    webAnalytics: { enabled: false },
    isr: {
      expiration: 3600,
      // El ISR cachea por path e IGNORA el query string y las cookies. Estas
      // rutas dependen de query params (tienda), de auth/cookies (APIs y panel
      // admin) o son 100% dinámicas, así que NO deben cachearse: hacerlo rompe
      // paginación/búsqueda/filtros, podría servir respuestas de API saltándose
      // el middleware de sesión, y en /admin sirve HTML stale que referencia
      // assets de un deploy anterior (404 en chunks como jspdf tras un deploy).
      // Las páginas SEO por path (/producto, /categoria, /) sí siguen con ISR.
      exclude: [/^\/$/, /^\/tienda/, /^\/api\//, /^\/admin/],
    },
  }),
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    vue(),
    sitemap({
      serialize(item) {
        if (item.url.includes('/producto/')) {
          item.priority = 0.8;
          item.changefreq = 'weekly';
        } else if (item.url.includes('/categoria/')) {
          item.priority = 0.7;
          item.changefreq = 'weekly';
        } else if (item.url === 'https://agrofarias.cl/') {
          item.priority = 1.0;
          item.changefreq = 'daily';
        } else {
          item.priority = 0.5;
          item.changefreq = 'monthly';
        }
        return item;
      },
    }),
  ],
});
