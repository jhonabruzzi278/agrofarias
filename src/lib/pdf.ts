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

function clp(n: number): string {
  return n === 0 ? '$0' : '$' + n.toLocaleString('es-CL')
}

async function logoDataUrl(): Promise<string | null> {
  try {
    const blob = await (await fetch('/logo-agrofarias.png')).blob()
    return new Promise(res => {
      const fr = new FileReader()
      fr.onload = () => res(fr.result as string)
      fr.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

export async function generateCotizacionPDF(data: CotizacionPDFData): Promise<void> {
  const { default: jsPDF } = await import('jspdf')

  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const PW = 210, PH = 297, ML = 20, MR = 20, CW = PW - ML - MR
  let y = 20

  // ── Logo / nombre empresa ──────────────────────────────────────────
  const logo = await logoDataUrl()
  if (logo) {
    doc.addImage(logo, 'PNG', ML, y - 6, 38, 18)
  } else {
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(45, 106, 79)
    doc.text('AGRO FARÍAS', ML, y)
  }

  // ── Encabezado derecho ─────────────────────────────────────────────
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(45, 106, 79)
  doc.text('COTIZACIÓN', PW - MR, y - 2, { align: 'right' })

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  doc.text(`N° ${data.number}`, PW - MR, y + 6, { align: 'right' })
  doc.text(`Fecha: ${new Date(data.date_created).toLocaleDateString('es-CL')}`, PW - MR, y + 12, { align: 'right' })
  y += 22

  // ── Línea divisora ─────────────────────────────────────────────────
  doc.setDrawColor(45, 106, 79)
  doc.setLineWidth(0.8)
  doc.line(ML, y, PW - MR, y)
  y += 8

  // ── Box de cliente ─────────────────────────────────────────────────
  const c = data.customer
  doc.setFillColor(248, 250, 248)
  doc.roundedRect(ML, y, CW, 28, 2, 2, 'F')

  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(45, 106, 79)
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
  doc.setTextColor(40, 40, 40)
  doc.text('DETALLE DE PRODUCTOS', ML, y)
  y += 4

  const xCant = ML + CW * 0.55
  const xPrecio = ML + CW * 0.70
  const xSub = ML + CW * 0.85

  doc.setFillColor(45, 106, 79)
  doc.rect(ML, y, CW, 7, 'F')
  doc.setFontSize(7.5)
  doc.setTextColor(255, 255, 255)
  doc.text('Producto', ML + 3, y + 5)
  doc.text('Cant.', xCant + 2, y + 5)
  doc.text('Precio Unit.', xPrecio + 2, y + 5)
  doc.text('Subtotal', xSub + 2, y + 5)
  y += 9

  let alt = false
  for (const p of data.products) {
    if (alt) {
      doc.setFillColor(245, 248, 245)
      doc.rect(ML, y - 1, CW, 8, 'F')
    }
    alt = !alt

    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(40, 40, 40)

    const pn = String(p.name).length > 52 ? String(p.name).slice(0, 50) + '…' : String(p.name)
    const qty = Number(p.quantity)
    const subtotal = Number(p.total)
    const unit = qty > 0 ? subtotal / qty : 0

    doc.text(pn, ML + 3, y + 5)
    doc.text(String(qty), xCant + 2, y + 5)
    doc.text(clp(Math.round(unit)), xPrecio + 2, y + 5)
    doc.text(clp(subtotal), xSub + 2, y + 5)
    y += 9
  }
  y += 4

  // ── Totales ────────────────────────────────────────────────────────
  const net = Number(data.total)
  const ivaAmt = Math.round(net * 0.19)
  const grand = net + ivaAmt
  const tx = ML + CW * 0.55
  const tw = CW * 0.45

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(60, 60, 60)
  doc.text('Subtotal neto:', tx, y)
  doc.text(clp(net), PW - MR, y, { align: 'right' })
  y += 7
  doc.text('IVA (19%):', tx, y)
  doc.text(clp(ivaAmt), PW - MR, y, { align: 'right' })
  y += 3
  doc.setDrawColor(45, 106, 79)
  doc.setLineWidth(0.4)
  doc.line(tx, y, PW - MR, y)
  y += 5

  doc.setFillColor(45, 106, 79)
  doc.roundedRect(tx, y, tw, 11, 2, 2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(255, 255, 255)
  doc.text('TOTAL:', tx + 4, y + 7.5)
  doc.text(clp(grand), PW - MR - 4, y + 7.5, { align: 'right' })

  // ── Footer ─────────────────────────────────────────────────────────
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.line(ML, PH - 18, PW - MR, PH - 18)
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(150, 150, 150)
  doc.text('Agro Farías — Insumos y Equipamiento Agrícola | Chile', PW / 2, PH - 12, { align: 'center' })

  doc.save(`cotizacion-${data.number}.pdf`)
}
