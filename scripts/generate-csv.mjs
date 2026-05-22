import fs from 'fs'

const data = fs.readFileSync('scripts/raw-products.txt', 'utf8')
const lines = data.trim().split('\n')

const catMap = {
  FOL: 'Nutrición vegetal > Foliares',
  FER: 'Nutrición vegetal > Fertilizantes',
  FUN: 'Protección fitosanitaria > Fungicidas',
  INS: 'Protección fitosanitaria > Insecticidas',
  HER: 'Protección fitosanitaria > Herbicidas',
  ACA: 'Protección fitosanitaria > Acaricidas',
  MOL: 'Protección fitosanitaria > Molusquicidas',
  ADH: 'Coadyuvantes agrícolas > Adherentes',
  ROD: 'Control de plagas > Rodenticidas',
  NAV: 'Herramientas y repuestos > Victorinox',
  WAY: 'Herramientas y repuestos > Wayu',
}

// Suffix patterns to strip - order matters, longer first
const suffixes = [
  /para nutrición y vigor del cultivo/gi,
  /para nutrición vegetal/gi,
  /para manejo sanitario del cultivo/gi,
  /para control de insectos según etiqueta/gi,
  /para manejo de malezas según etiqueta/gi,
  /para control de ácaros según etiqueta/gi,
  /para control de babosas y caracoles según etiqueta/gi,
  /para mejorar la aplicación agrícola/gi,
  /para control de roedores según etiqueta/gi,
  /para uso práctico en terreno/gi,
  /según etiqueta/gi,
  /para uso práctico/gi,
]

const categoryPrefixes = [
  'Foliar ', 'Fertilizante ', 'Fungicida ', 'Insecticida ',
  'Herbicida ', 'Acaricida ', 'Molusquicida ', 'Adherente ',
  'Rodenticida ', 'Herramienta ',
]

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function cleanName(raw, category) {
  let name = raw.trim()

  // Strip category prefix
  for (const prefix of categoryPrefixes) {
    if (name.toLowerCase().startsWith(prefix.toLowerCase())) {
      name = name.slice(prefix.length)
      break
    }
  }

  // Strip suffix text using regex
  for (const re of suffixes) {
    name = name.replace(re, '')
  }

  // Remove "Victoriox " prefix from all Herramientas items
  if (category.includes('Herramientas')) {
    name = name.replace(/^Victorinox\s+/i, '')
  }

  // Clean noise: extra brand descriptions attached to names
  name = name.replace(/\s+Abono A Base Spirulina/i, '')
  name = name.replace(/\s+Bayer/i, '')
  name = name.replace(/\s+BASF/i, '')
  name = name.replace(/\s+Anasac/i, '')
  name = name.replace(/\s+Compo/i, '')
  name = name.replace(/\s+Syngenta/i, '')
  name = name.replace(/\s+Bioamerica/i, '')
  name = name.replace(/\s+Fervalle/gi, '')
  name = name.replace(/\s+Nt/gi, '')
  name = name.replace(/\s+Bidon/gi, '')
  name = name.replace(/\s+Ziser/gi, '')
  name = name.replace(/\s+Durasop/gi, '')
  name = name.replace(/\s+Keep/gi, '')

  // Remove trailing noise words (BEFORE removing Wayu so Wayu ends up at end)
  name = name.replace(/\s+Unidad$/i, '')
  name = name.replace(/\s+Und$/i, '')
  name = name.replace(/\s+Bidón$/i, '')
  name = name.replace(/\s+Bidon$/i, '')
  name = name.replace(/\s+Saco$/i, '')
  name = name.replace(/\s+Litro$/i, '')
  name = name.replace(/\s+Kilo$/i, '')
  name = name.replace(/\s+Tambor$/i, '')
  name = name.replace(/\s+Paquete$/i, '')
  name = name.replace(/\s+Unidad\s*$/i, '')

  // Remove "Wayu" suffix for Wayu category (after trailing words are gone)
  if (category.includes('Wayu')) {
    name = name.replace(/\s*Wayu\s*$/i, '').trim()
  }

  // Clean up dangling dashes/hyphens
  name = name.replace(/\s*-\s*-\s*/g, ' - ').trim()

  // Clean up extra spaces and punctuation
  name = name.replace(/\s+/g, ' ').trim()
  name = name.replace(/[,;.\s]+$/, '')
  name = name.replace(/\s+x\s*$/, '').trim()
  name = name.replace(/\s*-\s*$/, '').trim()

  // Capitalize first letter
  if (name.length > 0) {
    name = name.charAt(0).toUpperCase() + name.slice(1)
  }

  return name || raw.trim()
}

function extractParts(line) {
  const tabIdx = line.indexOf('\t')
  let sku, productPart

  if (tabIdx >= 0) {
    sku = line.substring(0, tabIdx).trim().replace(/\s+/g, '')
    productPart = line.substring(tabIdx + 1).trim()
  } else {
    // Try to parse: PREFIX NUMBER Rest...
    const m = line.match(/^(FOL|FER|FUN|INS|HER|ACA|MOL|ADH|ROD|NAV|WAY)\s+(\d+)\s+(.*)/)
    if (m) {
      sku = m[1] + m[2]
      productPart = m[3]
    } else {
      return null
    }
  }

  return { sku, productPart }
}

const seen = new Set()
const products = []
let skipped = 0

for (const line of lines) {
  if (!line.trim()) continue

  const parts = extractParts(line)
  if (!parts) { skipped++; continue }

  const { sku, productPart } = parts

  let cat = ''
  for (const [prefix, category] of Object.entries(catMap)) {
    if (sku.startsWith(prefix)) {
      cat = category
      break
    }
  }

  if (!cat) { skipped++; continue }

  const name = cleanName(productPart, cat)
  if (!name) { skipped++; continue }

  let slug = slugify(name)
  if (seen.has(slug)) {
    slug = `${slug}-${sku.toLowerCase()}`
  }
  seen.add(slug)

  products.push({ sku, name, slug, category: cat })
}

// Check duplicate SKUs
const skuCounts = {}
for (const p of products) {
  skuCounts[p.sku] = (skuCounts[p.sku] || 0) + 1
}
const dupes = Object.entries(skuCounts).filter(([, c]) => c > 1)
if (dupes.length > 0) {
  console.log('DUPLICATE SKUs:')
  dupes.forEach(([sku, c]) => console.log(`  ${sku} appears ${c} times`))
} else {
  console.log('No duplicate SKUs found.')
}

console.log(`Total products: ${products.length}, Skipped: ${skipped}`)

// Category stats
const catStats = {}
for (const p of products) {
  catStats[p.category] = (catStats[p.category] || 0) + 1
}
console.log('\nCategories:')
for (const [cat, count] of Object.entries(catStats)) {
  console.log(`  ${cat}: ${count}`)
}

// Write CSV
const csvRows = [
  'ID,Type,SKU,Name,Published,Is featured?,Visibility in catalog,Short description,Description,Tax status,In stock?,Stock,Categories,Images,Position,Regular price',
]

products.forEach((p, i) => {
  const row = [
    '',           // ID
    'simple',     // Type
    p.sku,
    `"${p.name.replace(/"/g, '""')}"`,
    '1',          // Published
    '0',          // Featured
    'visible',    // Visibility
    '',           // Short desc
    '',           // Desc
    'taxable',    // Tax
    '1',          // In stock
    '',           // Stock
    `"${p.category}"`,
    '',           // Images
    String(i + 1),
    '',           // Price (no price)
  ]
  csvRows.push(row.join(','))
})

fs.writeFileSync('scripts/productos-woocommerce.csv', '\uFEFF' + csvRows.join('\n'), 'utf8')
console.log('\nCSV written to scripts/productos-woocommerce.csv')

// Sample
console.log('\nSample names:')
for (const p of products.slice(0, 8)) {
  console.log(`  [${p.category}] ${p.sku} → ${p.name}`)
}
console.log('  ...')
for (const p of products.slice(116, 124)) {
  console.log(`  [${p.category}] ${p.sku} → ${p.name}`)
}
console.log('  ...')
for (const p of products.slice(-8)) {
  console.log(`  [${p.category}] ${p.sku} → ${p.name}`)
}
