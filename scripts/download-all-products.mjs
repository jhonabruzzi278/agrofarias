#!/usr/bin/env node
/**
 * Script para descargar TODOS los productos de WooCommerce (sin filtrar por status)
 * y exportarlos a CSV para contrastar con el Excel de la empresa.
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

const wcAuth = 'Basic ' + Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString('base64');

async function wcFetch(path) {
  const url = `${WP_URL}/wp-json/wc/v3${path}`;
  const res = await fetch(url, { headers: { Authorization: wcAuth, 'Content-Type': 'application/json' } });
  if (!res.ok) throw new Error(`WC GET ${path} -> ${res.status} ${res.statusText}`);
  return res;
}

async function fetchAllProducts() {
  const perPage = 100;
  // Sin filtro de status para traer TODOS
  const first = await wcFetch(`/products?per_page=${perPage}`);
  const totalPages = parseInt(first.headers.get('X-WP-TotalPages') || '1', 10);
  const total = parseInt(first.headers.get('X-WP-Total') || '0', 10);
  let products = await first.json();

  if (totalPages > 1) {
    const rest = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, i) => i + 2).map((p) =>
        wcFetch(`/products?per_page=${perPage}&page=${p}`).then((r) => r.json())
      )
    );
    products = products.concat(...rest);
  }
  return { products, total };
}

function escapeCSV(str) {
  if (!str) return '';
  const s = String(str).replace(/"/g, '""');
  return `"${s}"`;
}

async function main() {
  console.log('⬇️  Descargando TODOS los productos de WooCommerce...');
  const { products, total } = await fetchAllProducts();
  console.log(`📦 Total descargados: ${products.length}`);
  console.log(`📦 Total según header: ${total}`);

  // Generar CSV
  const headers = ['ID', 'Nombre', 'Slug', 'SKU', 'Estado', 'Categorias', 'Precio', 'Stock', 'Imagenes'];
  let csv = headers.join(',') + '\n';
  
  for (const p of products) {
    const row = [
      p.id,
      p.name,
      p.slug,
      p.sku || '',
      p.status,
      p.categories?.map(c => c.name).join(';') || '',
      p.price || '',
      p.stock_quantity || '',
      p.images?.length || 0
    ].map(escapeCSV);
    csv += row.join(',') + '\n';
  }

  writeFileSync(resolve(process.cwd(), 'productos-todos.csv'), csv, 'utf-8');
  writeFileSync(resolve(process.cwd(), 'productos-todos.json'), JSON.stringify(products.map(p => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    status: p.status,
    categories: p.categories?.map(c => c.name),
    price: p.price,
    stock: p.stock_quantity,
    images: p.images?.length
  })), null, 2));

  // Resumen por estado
  const byStatus = {};
  for (const p of products) {
    byStatus[p.status] = (byStatus[p.status] || 0) + 1;
  }

  console.log('\n📊 RESUMEN POR ESTADO');
  console.log('----------------------------------------');
  for (const [status, count] of Object.entries(byStatus)) {
    console.log(`${status.padEnd(15)}: ${count}`);
  }

  console.log('\n✅ Archivos generados:');
  console.log('  - productos-todos.csv (para abrir en Excel)');
  console.log('  - productos-todos.json (datos completos)');
}

main().catch(e => { console.error('Error:', e); process.exit(1); });
