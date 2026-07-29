#!/usr/bin/env node
/**
 * Detecta productos de WooCommerce cuya imagen asignada NO corresponde al
 * producto (comparando el nombre del producto contra el nombre de archivo
 * de la imagen). Para cada caso sospechoso, busca un "hermano" (mismo
 * producto base, distinto formato/tamano) que sí tenga una foto coherente,
 * como candidato de imagen correcta.
 */
import { readFileSync, writeFileSync } from 'fs';

const products = JSON.parse(readFileSync('wc-products-images.json', 'utf-8'));

const CATEGORY_PREFIXES = [
  'Foliar', 'Fertilizante', 'Fungicida', 'Insecticida', 'Herbicida',
  'Acaricida', 'Molusquicida', 'Adherente', 'Rodenticida', 'Herramienta',
  'Semilla', 'Repuesto', 'Articulo',
];
const UNIT_WORDS = new Set(['litro','litros','kilo','kilos','unidad','unidades','saco','bidon','balde','paquete','tambor','sobre','caja','frasco']);

function stripAccents(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '');
}
function removeCategoryPrefix(s) {
  for (const p of CATEGORY_PREFIXES) {
    if (s.startsWith(p + ' ')) s = s.slice(p.length + 1).trim();
  }
  if (s.startsWith('Victorinox ')) s = s.slice('Victorinox '.length);
  return s;
}
// "core" tokens: identity words only - drop pure numbers, unit words, size tokens
const STOPWORDS = new Set(['los','las','del','con','por','que','uni','and','the']);
function coreTokens(s) {
  const clean = stripAccents(s).toLowerCase().replace(/[^a-z0-9]/g, ' ');
  return clean.split(/\s+/).filter(t =>
    t.length >= 3 && !/^\d+$/.test(t) && !UNIT_WORDS.has(t) && !STOPWORDS.has(t)
  );
}
function filenameFromUrl(url) {
  const file = url.split('/').pop() || '';
  return file.replace(/\.(webp|jpg|jpeg|png)$/i, '').replace(/-\d+$/, ''); // strip trailing "-1", "-2" photo index
}
function canon(s) {
  return stripAccents(s).toLowerCase().replace(/[^a-z0-9]/g, '');
}

const suspects = [];

for (const p of products) {
  if (!p.images.length) continue;
  const prodNoPrefix = removeCategoryPrefix(p.name);
  const prodCore = new Set(coreTokens(prodNoPrefix));
  if (prodCore.size === 0) continue;
  const prodCanon = canon(prodNoPrefix);

  for (const img of p.images) {
    const fname = filenameFromUrl(img.src);
    const fnCanon = canon(fname);
    // canonical substring match catches "Maxifrut" vs "maxi-frut" (hyphenation-only difference)
    if (fnCanon.includes(prodCanon) || prodCanon.includes(fnCanon)) continue;

    const fnCore = coreTokens(fname);
    if (fnCore.length === 0) continue; // filename too generic to judge (e.g. all numbers)
    const overlap = fnCore.filter(t => prodCore.has(t)).length;
    // require most of the product's identity words to show up in the filename;
    // a single generic shared word (e.g. "set", "kit") isn't enough to call it a match
    const ratio = overlap / prodCore.size;
    if (ratio < 0.5) {
      suspects.push({ product: p, image: img, filenameTokens: fnCore, productTokens: [...prodCore], overlap, ratio });
    }
  }
}

console.log(`Productos con imagen: ${products.filter(p => p.images.length).length}`);
console.log(`Sospechosos (0 coincidencia nombre-producto vs nombre-archivo): ${suspects.length}`);
console.log('');

// Build sibling index: base product-line key -> candidate images from products
// whose filename DOES match their own name (i.e. "trustworthy" images)
const siblingCandidates = new Map();
for (const p of products) {
  if (!p.images.length) continue;
  const prodCore = new Set(coreTokens(removeCategoryPrefix(p.name)));
  for (const img of p.images) {
    const fnCore = coreTokens(filenameFromUrl(img.src));
    const overlap = fnCore.filter(t => prodCore.has(t)).length;
    if (overlap > 0) {
      // trustworthy image; index it under this product's core-token set
      const key = [...prodCore].sort().join('|');
      if (!siblingCandidates.has(key)) siblingCandidates.set(key, []);
      siblingCandidates.get(key).push({ id: p.id, name: p.name, src: img.src });
    }
  }
}

function findSiblingCandidate(product) {
  const prodCore = coreTokens(removeCategoryPrefix(product.name));
  // try removing trailing size-ish tokens progressively to find a sibling family
  for (let dropFromEnd = 0; dropFromEnd <= 2 && dropFromEnd < prodCore.length; dropFromEnd++) {
    const trimmed = prodCore.slice(0, prodCore.length - dropFromEnd);
    if (trimmed.length === 0) continue;
    for (const [key, candidates] of siblingCandidates.entries()) {
      const keyTokens = key.split('|');
      const overlap = trimmed.filter(t => keyTokens.includes(t)).length;
      if (overlap >= trimmed.length && overlap >= 1) {
        const filtered = candidates.filter(c => c.id !== product.id);
        if (filtered.length) return filtered[0];
      }
    }
  }
  return null;
}

const report = suspects.map(s => {
  const candidate = findSiblingCandidate(s.product);
  return {
    product_id: s.product.id,
    product_name: s.product.name,
    current_image: s.image.src,
    current_image_id: s.image.id,
    proposed_image: candidate ? candidate.src : null,
    proposed_source: candidate ? `${candidate.name} (id ${candidate.id})` : null,
  };
});

for (const r of report) {
  console.log(`[${r.product_id}] ${r.product_name}`);
  console.log(`   actual: ${r.current_image}`);
  console.log(`   propuesta: ${r.proposed_image || '(sin candidato automatico)'}`);
  console.log('');
}

writeFileSync('image-mismatch-report.json', JSON.stringify(report, null, 2), 'utf-8');
console.log(`Con candidato automático: ${report.filter(r => r.proposed_image).length}`);
console.log(`Sin candidato (requieren revisión manual): ${report.filter(r => !r.proposed_image).length}`);
console.log('Guardado: image-mismatch-report.json');
