// @ts-check
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import tailwindcss from '@tailwindcss/vite';
import sanity from '@sanity/astro';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://agrofarias.cl',
  trailingSlash: 'never',
  adapter: vercel({
    webAnalytics: { enabled: true },
    isr: { expiration: 300 },
  }),
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    vue(),
    sanity({
      projectId: 'zrpklrq5',
      dataset: 'production',
      useCdn: true,
      apiVersion: '2024-01-01',
    }),
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
