export interface CotizacionPDFData {
  number: number | string
  date_created: string
  customer: {
    name?: string
    email?: string
    phone?: string
    company?: string
  }
  products: Array<{
    name: string
    quantity: number | string
    total: number | string
  }>
  total: number | string
}

// Paleta corporativa (verde Agro Farías)
const BRAND: [number, number, number] = [45, 106, 79]
const BRAND_LIGHT: [number, number, number] = [245, 248, 245]
const GREY: [number, number, number] = [100, 100, 100]
const DARK: [number, number, number] = [40, 40, 40]

const IVA_RATE = 0.19
const VALIDEZ_DIAS = 15

function clp(n: number): string {
  return n === 0 ? '$0' : '$' + Math.round(n).toLocaleString('es-CL')
}

async function logoDataUrl(): Promise<string | null> {
  try {
    const blob = await (await fetch('/logo-agrofarias.png')).blob()
    return new Promise((res) => {
      const fr = new FileReader()
      fr.onload = () => res(fr.result as string)
      fr.onerror = () => res(null)
      fr.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

export async function generateCotizacionPDF(data: CotizacionPDFData): Promise<void> {
  const { default: jsPDF } = await import('jspdf')

  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const PW = 210
  const PH = 297
  const ML = 20
  const MR = 20
  const CW = PW - ML - MR
  const BOTTOM = PH - 24 // límite inferior antes del footer

  // Posiciones de columnas de la tabla
  const colName = ML + 3
  const nameWidth = CW * 0.5
  const colCant = ML + CW * 0.62 // centrado
  const colPrecio = ML + CW * 0.82 // alineado a la derecha
  const colSub = PW - MR - 3 // alineado a la derecha

  const logo = await logoDataUrl()

  // ── Encabezado (se dibuja en cada página) ──────────────────────────
  function drawHeader(): number {
    let yy = 20
    if (logo) {
      doc.addImage(logo, 'PNG', ML, yy - 6, 38, 18)
    } else {
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...BRAND)
      doc.text('AGRO FARÍAS', ML, yy)
    }

    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...BRAND)
    doc.text('COTIZACIÓN', PW - MR, yy - 2, { align: 'right' })

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...GREY)
    doc.text(`N° ${data.number}`, PW - MR, yy + 6, { align: 'right' })
    doc.text(`Fecha: ${new Date(data.date_created).toLocaleDateString('es-CL')}`, PW - MR, yy + 12, { align: 'right' })
    yy += 22

    doc.setDrawColor(...BRAND)
    doc.setLineWidth(0.8)
    doc.line(ML, yy, PW - MR, yy)
    return yy + 8
  }

  // ── Cabecera de la tabla (repetible en cada página) ────────────────
  function drawTableHead(yy: number): number {
    doc.setFillColor(...BRAND)
    doc.rect(ML, yy, CW, 7, 'F')
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.text('Producto', colName, yy + 5)
    doc.text('Cant.', colCant, yy + 5, { align: 'center' })
    doc.text('Precio Unit.', colPrecio, yy + 5, { align: 'right' })
    doc.text('Subtotal', colSub, yy + 5, { align: 'right' })
    return yy + 9
  }

  // ── Footer con paginación (se rellena al final) ────────────────────
  function drawFooter(pageNum: number, pageCount: number): void {
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.3)
    doc.line(ML, PH - 18, PW - MR, PH - 18)
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(150, 150, 150)
    doc.text('Agro Farías — Insumos y Equipamiento Agrícola | Chile', PW / 2, PH - 12, { align: 'center' })
    doc.text(`Página ${pageNum} de ${pageCount}`, PW - MR, PH - 12, { align: 'right' })
  }

  let y = drawHeader()

  // ── Box de cliente ─────────────────────────────────────────────────
  const c = data.customer
  doc.setFillColor(...BRAND_LIGHT)
  doc.roundedRect(ML, y, CW, 28, 2, 2, 'F')

  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...BRAND)
  doc.text('DATOS DEL CLIENTE', ML + 4, y + 7)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(50, 50, 50)
  doc.text(`Nombre: ${c.name || '—'}`, ML + 4, y + 14)
  doc.text(`Email: ${c.email || '—'}`, ML + 4, y + 20)
  doc.text(`Teléfono: ${c.phone || '—'}`, ML + 4, y + 26)
  if (c.company) {
    doc.text(`Empresa: ${c.company}`, ML + CW / 2, y + 14)
  }
  y += 34

  // ── Tabla de productos ─────────────────────────────────────────────
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...DARK)
  doc.text('DETALLE DE PRODUCTOS', ML, y)
  y += 4

  y = drawTableHead(y)

  let alt = false
  for (const p of data.products) {
    const qty = Number(p.quantity)
    const subtotal = Number(p.total)
    const unit = qty > 0 ? subtotal / qty : 0

    // Nombre con ajuste de línea (sin recortes) → más profesional
    const nameLines: string[] = doc.splitTextToSize(String(p.name), nameWidth)
    const rowH = Math.max(8, nameLines.length * 4 + 4)

    // Salto de página si la fila no cabe
    if (y + rowH > BOTTOM) {
      doc.addPage()
      y = drawHeader()
      y = drawTableHead(y)
      alt = false
    }

    if (alt) {
      doc.setFillColor(...BRAND_LIGHT)
      doc.rect(ML, y - 1, CW, rowH, 'F')
    }
    alt = !alt

    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...DARK)

    doc.text(nameLines, colName, y + 4)
    doc.text(String(qty), colCant, y + 4, { align: 'center' })
    doc.text(clp(unit), colPrecio, y + 4, { align: 'right' })
    doc.text(clp(subtotal), colSub, y + 4, { align: 'right' })
    y += rowH
  }
  y += 4

  // ── Totales (no deben partirse entre páginas) ──────────────────────
  const net = Number(data.total)
  const ivaAmt = Math.round(net * IVA_RATE)
  const grand = net + ivaAmt
  const tx = ML + CW * 0.55

  const totalsHeight = 7 + 7 + 3 + 5 + 11 + 8
  if (y + totalsHeight > BOTTOM) {
    doc.addPage()
    y = drawHeader()
  }

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(60, 60, 60)
  doc.text('Subtotal neto:', tx, y)
  doc.text(clp(net), PW - MR, y, { align: 'right' })
  y += 7
  doc.text('IVA (19%):', tx, y)
  doc.text(clp(ivaAmt), PW - MR, y, { align: 'right' })
  y += 3
  doc.setDrawColor(...BRAND)
  doc.setLineWidth(0.4)
  doc.line(tx, y, PW - MR, y)
  y += 5

  doc.setFillColor(...BRAND)
  doc.roundedRect(tx, y, CW * 0.45, 11, 2, 2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(255, 255, 255)
  doc.text('TOTAL:', tx + 4, y + 7.5)
  doc.text(clp(grand), PW - MR - 4, y + 7.5, { align: 'right' })
  y += 18

  // ── Nota de validez ────────────────────────────────────────────────
  if (y + 6 < BOTTOM) {
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(...GREY)
    doc.text(
      `Cotización válida por ${VALIDEZ_DIAS} días. Precios en pesos chilenos (CLP), IVA incluido.`,
      ML,
      y,
    )
  }

  // ── Footer en todas las páginas (con conteo final correcto) ────────
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    drawFooter(i, pageCount)
  }

  doc.save(`cotizacion-${data.number}.pdf`)
}
