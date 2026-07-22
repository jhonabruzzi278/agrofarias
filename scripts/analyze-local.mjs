import { readdirSync, readFileSync } from 'fs';

const imgDir = 'C:\\Users\\jonat\\Downloads\\Agrofarias-20260716T180111Z-1-001\\Agrofarias\\optimizadas-web\\web';
const csvPath = 'C:\\Users\\jonat\\Downloads\\wc-product-export-16-7-2026-1784246493577.csv';

const images = readdirSync(imgDir).filter(f => f.endsWith('.webp')).map(f => f.replace('.webp',''));

const csvContent = readFileSync(csvPath, 'utf-8');
const lines = csvContent.split('\n').slice(1).filter(l => l.trim());
const names = lines.map(l => l.replace(/^"|"$/g, '')).filter(n => n);

const CATEGORY_PREFIXES = [
  'Foliar','Fertilizante','Fungicida','Insecticida','Herbicida',
  'Acaricida','Molusquicida','Adherente','Rodenticida','Herramienta'
];

function removePrefixes(str) {
  for (const p of CATEGORY_PREFIXES) {
    if (str.startsWith(p + ' ')) str = str.slice(p.length + 1);
  }
  if (str.startsWith('Victorinox ')) str = str.slice('Victorinox '.length);
  return str;
}

function slugify(str) {
  return str
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function deSlugify(str) {
  return str.replace(/-/g, '');
}

const products = names.map(name => {
  const baseName = removePrefixes(name);
  const fullSlug = slugify(name);
  const baseSlug = slugify(baseName);
  return { name, fullSlug, baseSlug, baseSlugFlat: deSlugify(baseSlug), fullSlugFlat: deSlugify(fullSlug) };
});

const imgData = images.map(img => ({
  slug: img,
  flat: deSlugify(img),
}));

let matched = 0;
const unmatchedProducts = [];
const unmatchedImages = [];
const usedImgSlugs = new Set();

for (const p of products) {
  let found = null;
  
  for (const img of imgData) {
    if (img.slug === p.baseSlug) { found = img; break; }
  }
  if (!found) {
    for (const img of imgData) {
      if (p.baseSlugFlat.includes(img.flat) && img.flat.length >= 6) { found = img; break; }
    }
  }
  if (!found) {
    for (const img of imgData) {
      if (p.fullSlugFlat.includes(img.flat) && img.flat.length >= 6) { found = img; break; }
    }
  }
  if (!found) {
    for (const img of imgData) {
      if (img.flat.includes(p.baseSlugFlat) && p.baseSlugFlat.length >= 6) { found = img; break; }
    }
  }
  
  if (found && !usedImgSlugs.has(found.slug)) {
    matched++;
    usedImgSlugs.add(found.slug);
  } else {
    unmatchedProducts.push(p);
  }
}

for (const img of imgData) {
  if (!usedImgSlugs.has(img.slug)) unmatchedImages.push(img.slug);
}

console.log('=== ANALISIS CON MATCHING MEJORADO (incluye Victorinox) ===');
console.log('Productos en CSV:', names.length);
console.log('Imagenes locales:', images.length);
console.log('Matches encontrados:', matched);
console.log('Productos SIN imagen local:', unmatchedProducts.length);
console.log('Imagenes sin producto match:', unmatchedImages.length);

console.log('\n--- Ejemplos de productos SIN imagen (primeros 30) ---');
unmatchedProducts.slice(0,30).forEach(p => console.log(p.baseSlug || p.fullSlug, '->', p.name));

console.log('\n--- Imagenes sin producto match (todas) ---');
unmatchedImages.forEach(i => console.log(i));
