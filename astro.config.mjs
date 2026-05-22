// @ts-check
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import tailwindcss from '@tailwindcss/vite';
import sanity from '@sanity/astro';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://agrofarias.cl',
  trailingSlash: 'never',
  adapter: vercel(),
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
        item.lastmod = new Date().toISOString().split('T')[0];
        return item;
      },
    }),
  ],
});
