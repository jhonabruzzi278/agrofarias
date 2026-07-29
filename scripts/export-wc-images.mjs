#!/usr/bin/env node
/**
 * Exporta TODOS los productos de WooCommerce (cualquier status) con sus URLs
 * de imagen reales (media de WordPress) para cruzarlos con el Excel de la empresa.
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), '.env');
    const envContent = readFileSync(envPath, 'utf-8');
    for (const line of envContent.split('\n')) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match && !line.trim().startsWith('#')) {
        const key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        else if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        if (!process.env[key]) process.env[key] = value;
      }
    }
  } catch { /* no .env */ }
}
loadEnv();

const WP_URL = process.env.WORDPRESS_URL?.replace(/\/$/, '');
const WC_KEY = process.env.WC_CONSUMER_KEY;
const WC_SECRET = process.env.WC_CONSUMER_SECRET;

if (!WP_URL || !WC_KEY || !WC_SECRET) {
  console.error('Faltan WORDPRESS_URL, WC_CONSUMER_KEY o WC_CONSUMER_SECRET en .env');
  process.exit(1);
}

const wcAuth = 'Basic ' + Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString('base64');

async function wcFetch(path) {
  const url = `${WP_URL}/wp-json/wc/v3${path}`;
  const res = await fetch(url, { headers: { Authorization: wcAuth, 'Content-Type': 'application/json' } });
  if (!res.ok) throw new Error(`WC GET ${path} -> ${res.status} ${res.statusText}`);
  return res;
}

async function fetchAllProducts() {
  const perPage = 100;
  const first = await wcFetch(`/products?per_page=${perPage}&status=any`);
  const totalPages = parseInt(first.headers.get('X-WP-TotalPages') || '1', 10);
  let products = await first.json();
  if (totalPages > 1) {
    const rest = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, i) => i + 2).map((p) =>
        wcFetch(`/products?per_page=${perPage}&page=${p}&status=any`).then((r) => r.json())
      )
    );
    products = products.concat(...rest);
  }
  return products;
}

async function main() {
  console.log('Descargando productos de WooCommerce (con imágenes)...');
  const products = await fetchAllProducts();
  console.log(`Total productos: ${products.length}`);

  const out = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku || '',
    status: p.status,
    categories: p.categories?.map((c) => c.name) || [],
    images: (p.images || []).map((img) => ({ id: img.id, src: img.src })),
  }));

  const withImages = out.filter((p) => p.images.length > 0).length;
  console.log(`Productos con al menos 1 imagen: ${withImages}`);

  writeFileSync(resolve(process.cwd(), 'wc-products-images.json'), JSON.stringify(out, null, 2), 'utf-8');
  console.log('Guardado: wc-products-images.json');
}

main().catch((e) => { console.error('Error:', e); process.exit(1); });
