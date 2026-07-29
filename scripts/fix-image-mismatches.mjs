#!/usr/bin/env node
/**
 * Corrige asignaciones de imagen incorrectas en WooCommerce, reutilizando
 * un media ID ya existente (foto correcta subida a otro producto/hermano).
 * Uso: node scripts/fix-image-mismatches.mjs
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';

function loadEnv() {
  try {
    const envContent = readFileSync(resolve(process.cwd(), '.env'), 'utf-8');
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

async function wcPut(path, body) {
  const res = await fetch(`${WP_URL}/wp-json/wc/v3${path}`, {
    method: 'PUT',
    headers: { Authorization: wcAuth, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`WC PUT ${path} -> ${res.status} ${text.slice(0, 200)}`);
  }
  return res.json();
}

const FIXES = [
  { id: 274, name: 'Adherente Nitro Fix Ntx 21 x 1 L', imageId: 956, reason: 'tenía la foto de Adherente Giberplus' },
  { id: 250, name: "Natur'l Oleo 200 L", imageId: 407, reason: 'tenía la foto de Topas 200 EW' },
];

async function main() {
  for (const fix of FIXES) {
    console.log(`Corrigiendo [${fix.id}] ${fix.name} (${fix.reason})...`);
    const updated = await wcPut(`/products/${fix.id}`, { images: [{ id: fix.imageId }] });
    console.log(`  OK -> nueva imagen: ${updated.images?.[0]?.src}`);
  }
}

main().catch((e) => { console.error('Error:', e); process.exit(1); });
