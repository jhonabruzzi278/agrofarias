// Helpers de formato y de IVA compartidos por los composables/subcomponentes
// del cotizador interno. Centralizados aquí para no duplicarlos.

import type { ReceivedQuote, QuoteProduct } from './types'

/** IVA chileno (19%). */
export const IVA_RATE = 0.19

/** Estados internos de una cotización (orden de selector). */
export const STATUSES = ['pending', 'processing', 'on-hold', 'completed', 'cancelled'] as const

/** Precio en pesos chilenos: `$1.234` o `$0`. */
export const fp = (n: number): string => (n === 0 ? '$0' : '$' + n.toLocaleString('es-CL'))

/** Fecha corta dd/mm/aaaa. */
export const fd = (d: string): string =>
  new Date(d).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' })

/** Etiqueta legible de un estado interno. */
export const sl = (s: string): string =>
  (({
    processing: 'Procesando',
    completed: 'Completado',
    pending: 'Pendiente',
    'on-hold': 'En espera',
    cancelled: 'Cancelado',
  } as Record<string, string>)[s] || s)

/** IVA sobre un neto. */
export const ivaOf = (net: unknown): number => Math.round((Number(net) || 0) * IVA_RATE)

/** Total con IVA incluido sobre un neto. */
export const totalConIvaOf = (net: unknown): number => (Number(net) || 0) + ivaOf(net)

/** Clases del badge de estado (estáticas para que Tailwind las detecte). */
export function statusClass(s: string): string {
  return (
    ({
      processing: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      'on-hold': 'bg-orange-100 text-orange-700',
      cancelled: 'bg-red-100 text-red-700',
    } as Record<string, string>)[s] || 'bg-gray-100 text-gray-600'
  )
}

/** Texto de WhatsApp prearmado para una cotización. */
export function waText(q: ReceivedQuote): string {
  const lines = (q.products || []).map((p: QuoteProduct) => `• ${p.quantity}x ${p.name}`).join('\n')
  const nombre = q.customer?.name ? String(q.customer.name).split(' ')[0] : ''
  const saludo = nombre ? `Hola ${nombre}! ` : 'Hola! '
  return `${saludo}Te escribo de Agro Farías por tu cotización #${q.number}:\n${lines}\nTotal (IVA incl.): ${fp(totalConIvaOf(q.total))}`
}

/** Link `wa.me` con el texto prearmado, o `''` si el teléfono es inválido. */
export function waLink(q: ReceivedQuote): string {
  const digits = String(q.customer?.phone || '').replace(/\D/g, '')
  return digits.length >= 8 ? `https://wa.me/${digits}?text=${encodeURIComponent(waText(q))}` : ''
}
