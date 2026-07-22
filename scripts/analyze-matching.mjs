import { readFileSync, readdirSync } from 'fs';

const products = JSON.parse(readFileSync('products-woo.json', 'utf-8'));
const imgDir = 'C:\\Users\\jonat\\Downloads\\Agrofarias-20260716T180111Z-1-001\\Agrofarias\\optimizadas-web\\web';
const images = readdirSync(imgDir).filter(f => f.endsWith('.webp')).map(f => f.replace('.webp', ''));

const CATEGORY_PREFIXES = [
  'Foliar','Fertilizante','Fungicida','Insecticida','Herbicida',
  'Acaricida','Molusquicida','Adherente','Rodenticida','Herramienta'
];

function removeCategoryPrefix(str) {
  for (const p of CATEGORY_PREFIXES) {
    if (str.startsWith(p + ' ')) str = str.slice(p.length + 1).trim();
  }
  return str;
}

function canonicalize(str) {
  return str
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function tokenize(str) {
  return str
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 3);
}

// Estrategia 1: match por slug exacto
function matchBySlug(imgSlug, products) {
  for (const p of products) {
    if (p.slug === imgSlug) return p;
  }
  return null;
}

// Estrategia 2: match por canonical exacto del nombre base
function matchByCanonical(imgName, products) {
  const imgCanon = canonicalize(removeCategoryPrefix(imgName));
  for (const p of products) {
    const prodBase = removeCategoryPrefix(p.name);
    const prodCanon = canonicalize(prodBase);
    if (imgCanon === prodCanon) return p;
  }
  return null;
}

// Estrategia 3: match por inclusión de tokens (la imagen debe estar contenida en el producto)
function matchByTokenInclusion(imgName, products, usedIds) {
  const imgTokens = tokenize(imgName);
  if (imgTokens.length === 0) return null;

  let bestMatch = null;
  let bestScore = 0;

  for (const p of products) {
    if (usedIds.has(p.id)) continue;
    const prodBase = removeCategoryPrefix(p.name);
    const prodTokens = tokenize(prodBase);
    const prodCanon = canonicalize(prodBase);
    const imgCanon = canonicalize(imgName);

    // Si la imagen canonical está contenida en el producto canonical
    if (prodCanon.includes(imgCanon) && imgCanon.length >= 6) {
      return p; // match fuerte
    }

    // Si el producto canonical está contenido en la imagen canonical
    if (imgCanon.includes(prodCanon) && prodCanon.length >= 6) {
      return p; // match fuerte
    }

    // Contar tokens coincidentes
    let matches = 0;
    for (const t of imgTokens) {
      if (prodTokens.includes(t)) matches++;
    }
    const score = matches / imgTokens.length;
    if (score > bestScore && score >= 0.6) {
      bestScore = score;
      bestMatch = p;
    }
  }

  return bestScore >= 0.6 ? bestMatch : null;
}

// Ejecutar matching
const matched = [];
const unmatchedImages = [];
const usedProductIds = new Set();

for (const img of images) {
  let found = matchBySlug(img, products);
  if (!found) found = matchByCanonical(img, products);
  if (!found && !usedProductIds.has(found?.id)) {
    found = matchByTokenInclusion(img, products, usedProductIds);
  }

  if (found && !usedProductIds.has(found.id)) {
    matched.push({ image: img + '.webp', product: found.name, slug: found.slug, id: found.id });
    usedProductIds.add(found.id);
  } else {
    unmatchedImages.push(img + '.webp');
  }
}

console.log('=== ANÁLISIS DE MATCHING MEJORADO ===');
console.log('Total imágenes:', images.length);
console.log('Matches encontrados:', matched.length);
console.log('Imágenes sin match:', unmatchedImages.length);
console.log('');
console.log('--- Primeros 20 matches ---');
matched.slice(0,20).forEach(m => console.log('✅', m.image, '->', m.product));
console.log('');
console.log('--- Imágenes sin match (primeros 30) ---');
unmatchedImages.slice(0,30).forEach(i => console.log('❌', i));

// Guardar resultados
import { writeFileSync } from 'fs';
writeFileSync('matching-analysis.json', JSON.stringify({ matched, unmatchedImages }, null, 2));
