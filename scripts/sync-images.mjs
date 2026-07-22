#!/usr/bin/env node
/**
 * Script de sincronización masiva de imágenes y nombres de productos WooCommerce.
 * Uso: node scripts/sync-images.mjs <ruta-carpeta-imagenes> [--execute]
 * Sin --execute corre en modo simulación (dry-run).
 */

import { readFileSync, readdirSync, writeFileSync } from 'fs';
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
const WP_USERNAME = process.env.WP_USERNAME;
const WP_APP_PASSWORD = process.env.WP_APP_PASSWORD;
const DRY_RUN = !process.argv.includes('--execute');

if (!WP_URL || !WC_KEY || !WC_SECRET || !WP_USERNAME || !WP_APP_PASSWORD) {
  console.error('❌ Faltan variables de entorno. Requiere: WORDPRESS_URL, WC_CONSUMER_KEY, WC_CONSUMER_SECRET, WP_USERNAME, WP_APP_PASSWORD');
  process.exit(1);
}

const IMAGES_FOLDER_ARG = process.argv.find((_, i, arr) => i > 1 && !arr[i].startsWith('--'));
const IMAGES_FOLDER = IMAGES_FOLDER_ARG ? resolve(IMAGES_FOLDER_ARG) : resolve(process.cwd(), 'imagenes-productos');
const REPORT_PATH = resolve(process.cwd(), 'sync-report.json');

const wcAuth = 'Basic ' + Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString('base64');
const mediaAuth = 'Basic ' + Buffer.from(`${WP_USERNAME}:${WP_APP_PASSWORD}`).toString('base64');

async function wcFetch(path) {
  const url = `${WP_URL}/wp-json/wc/v3${path}`;
  const res = await fetch(url, { headers: { Authorization: wcAuth, 'Content-Type': 'application/json' } });
  if (!res.ok) throw new Error(`WC GET ${path} -> ${res.status} ${res.statusText}`);
  return res;
}

async function wcPut(path, body) {
  const url = `${WP_URL}/wp-json/wc/v3${path}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { Authorization: wcAuth, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`WC PUT ${path} -> ${res.status} ${text.slice(0, 200)}`);
  }
  return res;
}

async function uploadMedia(filePath, fileName) {
  const buffer = readFileSync(filePath);
  const blob = new Blob([buffer], { type: 'image/webp' });
  const form = new FormData();
  form.append('file', blob, fileName);

  const res = await fetch(`${WP_URL}/wp-json/wp/v2/media`, {
    method: 'POST',
    headers: { Authorization: mediaAuth },
    body: form,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Media upload failed: ${res.status} ${text.slice(0, 200)}`);
  }
  return res.json();
}

// Normalización
const CATEGORY_PREFIXES = ['Foliar','Fertilizante','Fungicida','Insecticida','Herbicida','Acaricida','Molusquicida','Adherente','Rodenticida','Herramienta'];

function removeCategoryPrefix(str) {
  for (const p of CATEGORY_PREFIXES) {
    if (str.startsWith(p + ' ')) str = str.slice(p.length + 1).trim();
  }
  if (str.startsWith('Victorinox ')) str = str.slice('Victorinox '.length);
  return str;
}

function applyUnitReplacements(str) {
  return str
    .replace(/\bx\s+(\d)/gi, '$1')
    .replace(/(\d)\s*KL\s*Kilo\b/gi, '$1 kg').replace(/(\d)\s*KL\b/gi, '$1 kg')
    .replace(/\bKilo\b/gi, 'kg').replace(/\bkilo\b/gi, 'kg')
    .replace(/\bLitro\b/gi, 'L').replace(/\blitro\b/gi, 'L')
    .replace(/\bBidon\b/gi, 'Bidón').replace(/\bbidon\b/gi, 'Bidón')
    .replace(/\bSaco\b/gi, 'Saco').replace(/\bUnidad\b/gi, 'Unidad')
    .replace(/\bUnd\b/gi, 'Unidad').replace(/\buni\b/gi, 'Unidad')
    .replace(/\bTambor\b/gi, 'Tambor').replace(/\bPaquete\b/gi, 'Paquete')
    .replace(/\bpack\b/gi, 'Paquete')
    .replace(/\bCm\b/g, 'cm').replace(/\bMM\b/g, 'mm').replace(/\bML\b/g, 'mL');
}

function applyTypoFixes(str) {
  return str
    .replace(/Rangofull/gi, 'Rango Full')
    .replace(/BRIO440/gi, 'Brio 440')
    .replace(/Ca-b-zn/gi, 'Ca-B-Zn')
    .replace(/GB-30/gi, 'GB 30')
    .replace(/Up-sorber/gi, 'Up-Sorber')
    .replace(/Tecbom/gi, 'Tec Bom')
    .replace(/Harvest More/gi, 'Harv More');
}

function cleanProductName(name) {
  let n = removeCategoryPrefix(name);
  n = applyUnitReplacements(n);
  n = applyTypoFixes(n);
  n = n.replace(/\s*,\s*/g, ', ').replace(/\s+/g, ' ').trim();
  n = toTitleCase(n);
  return n;
}

function toTitleCase(str) {
  const minor = ['de', 'del', 'la', 'el', 'los', 'las', 'y', 'e', 'o', 'u', 'con', 'por', 'en'];
  return str.split(' ').map((w, i) => {
    if (!w) return w;
    const lower = w.toLowerCase();
    if (['kg', 'g', 'cm', 'mm'].includes(lower)) return lower;
    if (lower === 'l') return 'L';
    if (lower === 'ml') return 'mL';
    if (['sl', 'ec', 'wp', 'sc', 'sg', 'wg', 'ws', 'sp'].includes(lower)) return w.toUpperCase();
    if (i > 0 && minor.includes(lower)) return lower;
    if (/[-+/,]/.test(w)) {
      return w.split(/([-+/,])/).map(p => /[-+/,]/.test(p) || !p ? p : p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join('');
    }
    if (/^[A-Z]{2,}$/.test(w) && w.length > 3) return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
  }).join(' ');
}

function canonicalize(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function tokenize(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(w => w.length >= 3);
}

// Matching mejorado
function findBestMatch(imgName, products, usedIds) {
  // 1. Match por slug exacto
  for (const p of products) {
    if (p.slug === imgName) return p;
  }

  // 2. Match por canonical exacto del nombre base
  const imgCanon = canonicalize(removeCategoryPrefix(imgName));
  for (const p of products) {
    if (usedIds.has(p.id)) continue;
    if (imgCanon === canonicalize(removeCategoryPrefix(p.name))) return p;
  }

  // 3. Match por inclusión canonical
  for (const p of products) {
    if (usedIds.has(p.id)) continue;
    const prodCanon = canonicalize(removeCategoryPrefix(p.name));
    if (prodCanon.includes(imgCanon) && imgCanon.length >= 6) return p;
    if (imgCanon.includes(prodCanon) && prodCanon.length >= 6) return p;
  }

  // 4. Match por tokens (al menos 60% de tokens de la imagen deben estar en el producto)
  const imgTokens = tokenize(imgName);
  if (imgTokens.length > 0) {
    let bestMatch = null;
    let bestScore = 0;
    for (const p of products) {
      if (usedIds.has(p.id)) continue;
      const prodTokens = tokenize(removeCategoryPrefix(p.name));
      let matches = 0;
      for (const t of imgTokens) {
        if (prodTokens.includes(t)) matches++;
      }
      const score = matches / imgTokens.length;
      if (score > bestScore && score >= 0.5) {
        bestScore = score;
        bestMatch = p;
      }
    }
    if (bestMatch) return bestMatch;
  }

  return null;
}

async function fetchAllProducts() {
  const perPage = 100;
  const first = await wcFetch(`/products?per_page=${perPage}&status=publish`);
  const totalPages = parseInt(first.headers.get('X-WP-TotalPages') || '1', 10);
  let products = await first.json();
  if (totalPages > 1) {
    const rest = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, i) => i + 2).map((p) =>
        wcFetch(`/products?per_page=${perPage}&page=${p}&status=publish`).then((r) => r.json())
      )
    );
    products = products.concat(...rest);
  }
  return products;
}

async function main() {
  console.log(`🚀 Modo: ${DRY_RUN ? 'SIMULACIÓN (dry-run)' : 'REAL - SUBIENDO IMÁGENES'}`);
  console.log(`📁 Carpeta: ${IMAGES_FOLDER}`);

  let files;
  try {
    files = readdirSync(IMAGES_FOLDER).filter((f) => f.toLowerCase().endsWith('.webp'));
  } catch (e) {
    console.error('❌ No se pudo leer la carpeta:', e.message);
    process.exit(1);
  }
  console.log(`🖼️  Imágenes: ${files.length}`);

  console.log('⬇️  Descargando productos...');
  const products = await fetchAllProducts();
  console.log(`📦 Productos: ${products.length}`);

  const matched = [];
  const unmatchedImages = [];
  const usedProductIds = new Set();

  for (const file of files) {
    const imgName = file.replace(/\.webp$/i, '');
    const found = findBestMatch(imgName, products, usedProductIds);

    if (found) {
      if (usedProductIds.has(found.id)) {
        console.warn(`⚠️  "${file}" ya asignado a otro producto`);
      } else {
        matched.push({ file, product: found, newName: cleanProductName(found.name) });
        usedProductIds.add(found.id);
      }
    } else {
      unmatchedImages.push(file);
    }
  }

  console.log(`✅ Matches: ${matched.length}`);
  console.log(`❌ Sin match: ${unmatchedImages.length}`);

  const results = { updated: [], errors: [], skipped: [] };

  for (const m of matched) {
    const { file, product, newName } = m;
    const filePath = resolve(IMAGES_FOLDER, file);
    const nameChanged = newName !== product.name;

    console.log(`\n🔄 [${product.id}] "${product.name}"`);
    if (nameChanged) console.log(`   ➡️  Nombre: "${newName}"`);

    if (DRY_RUN) {
      results.skipped.push({ id: product.id, oldName: product.name, newName, file, slug: product.slug, reason: 'dry-run' });
      continue;
    }

    try {
      console.log(`   ☁️  Subiendo imagen...`);
      const media = await uploadMedia(filePath, file);
      const payload = {};
      if (nameChanged) payload.name = newName;
      payload.images = [{ id: media.id }];

      console.log(`   💾 Guardando...`);
      await wcPut(`/products/${product.id}`, payload);

      results.updated.push({ id: product.id, oldName: product.name, newName, imageId: media.id, imageUrl: media.source_url, file, slug: product.slug });
      console.log(`   ✅ OK`);
    } catch (err) {
      results.errors.push({ id: product.id, name: product.name, file, slug: product.slug, error: err.message });
      console.error(`   ❌ Error: ${err.message}`);
    }
  }

  const productsWithoutImage = products.filter((p) => !usedProductIds.has(p.id) && (!p.images || p.images.length === 0));
  const productsWithImage = products.filter((p) => !usedProductIds.has(p.id) && p.images && p.images.length > 0);

  console.log(`\n📊 RESUMEN`);
  console.log(`----------------------------------------`);
  console.log(`Productos emparejados con imagen : ${matched.length}`);
  if (!DRY_RUN) {
    console.log(`Productos actualizados (subidos) : ${results.updated.length}`);
    console.log(`Errores                          : ${results.errors.length}`);
  }
  console.log(`Productos SIN imagen             : ${productsWithoutImage.length}`);
  console.log(`Productos CON imagen existente   : ${productsWithImage.length}`);
  console.log(`Imágenes sin match               : ${unmatchedImages.length}`);

  const report = {
    timestamp: new Date().toISOString(),
    dryRun: DRY_RUN,
    totalProducts: products.length,
    totalImagesLocal: files.length,
    matched: matched.length,
    updated: results.updated,
    errors: results.errors,
    unmatchedImages,
    productsWithoutImage: productsWithoutImage.map((p) => ({ id: p.id, name: p.name, slug: p.slug })),
    productsWithImage: productsWithImage.map((p) => ({ id: p.id, name: p.name, slug: p.slug })),
  };

  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  console.log(`\n📝 Reporte: ${REPORT_PATH}`);
}

main().catch((e) => { console.error('Fatal:', e); process.exit(1); });
