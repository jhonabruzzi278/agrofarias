import { ref, computed } from 'vue'
import { generateCotizacionPDF } from '../../../lib/pdf'
import { totalConIvaOf } from './formatters'
import type { ReceivedQuote } from './types'

const H = { 'Content-Type': 'application/json' }

/**
 * Dashboard de cotizaciones recibidas: carga, filtros, métricas, cambio de
 * estado interno y acciones rápidas (WhatsApp, copiar email, PDF).
 */
export function useReceivedQuotes() {
  const allQ = ref<ReceivedQuote[]>([])
  const lQ = ref(false)
  const qSearch = ref('')
  const qStatus = ref('')
  const copiedId = ref<number | null>(null)
  const generatingPDF = ref<number | null>(null)
  const updatingId = ref<number | null>(null)

  async function fetchQuotes(): Promise<number> {
    const r = await fetch('/api/cotizador-interno/quotes', { headers: H })
    if (r.ok) {
      const json = await r.json()
      allQ.value = Array.isArray(json) ? json : (json.data ?? [])
    }
    return r.status
  }

  /** Carga inicial: devuelve `true` si la sesión es válida (no 401). */
  async function loadQuotes(): Promise<boolean> {
    const status = await fetchQuotes()
    return status !== 401
  }

  async function refreshQ(): Promise<void> {
    lQ.value = true
    try {
      await fetchQuotes()
    } catch {
      /* noop */
    } finally {
      lQ.value = false
    }
  }

  // Conteo por estado interno sobre TODAS las cotizaciones (para el selector).
  const statusCounts = computed<Record<string, number>>(() => {
    const acc: Record<string, number> = {}
    for (const q of allQ.value) acc[q.internalStatus] = (acc[q.internalStatus] || 0) + 1
    return acc
  })
  const availableStatuses = computed(() => Object.keys(statusCounts.value).sort())

  // Lista filtrada por texto (cliente/email/empresa/#) y estado interno.
  const filteredQuotes = computed(() => {
    const term = qSearch.value.trim().toLowerCase()
    return allQ.value.filter((q) => {
      if (qStatus.value && q.internalStatus !== qStatus.value) return false
      if (!term) return true
      const hay = [q.customer?.name, q.customer?.email, q.customer?.company, String(q.number), String(q.id)]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(term)
    })
  })

  // Métricas sobre el conjunto filtrado (consistentes con lo que se ve).
  const mTotal = computed(() => filteredQuotes.value.length)
  const mValor = computed(() => filteredQuotes.value.reduce((s, q) => s + totalConIvaOf(q.total), 0))
  const mPromedio = computed(() => (mTotal.value ? Math.round(mValor.value / mTotal.value) : 0))
  const mProductos = computed(() =>
    filteredQuotes.value.reduce(
      (s, q) => s + (q.products?.reduce((a, p) => a + (Number(p.quantity) || 0), 0) || 0),
      0,
    ),
  )

  async function updateStatus(q: ReceivedQuote, status: string): Promise<void> {
    if (!status || status === q.internalStatus) return
    updatingId.value = q.id
    try {
      const r = await fetch('/api/cotizador-interno/update-status', {
        method: 'POST',
        headers: H,
        body: JSON.stringify({ id: q.id, status }),
      })
      // Estado SOLO interno (Upstash): no se toca WooCommerce.
      if (r.ok) q.internalStatus = status // muta el objeto reactivo → recalcula conteos/filtro
    } catch {
      /* noop */
    } finally {
      updatingId.value = null
    }
  }

  async function copyEmail(q: ReceivedQuote): Promise<void> {
    if (!q.customer?.email) return
    try {
      await navigator.clipboard.writeText(q.customer.email)
      copiedId.value = q.id
      setTimeout(() => {
        if (copiedId.value === q.id) copiedId.value = null
      }, 1800)
    } catch {
      /* noop */
    }
  }

  async function downloadPDF(q: ReceivedQuote): Promise<void> {
    if (generatingPDF.value) return
    generatingPDF.value = q.id
    try {
      await generateCotizacionPDF({
        number: q.number,
        date_created: q.date_created,
        customer: {
          name: q.customer?.name,
          email: q.customer?.email,
          phone: q.customer?.phone,
          company: q.customer?.company,
        },
        products: (q.products || []).map((p) => ({ name: p.name, quantity: p.quantity, total: p.total })),
        total: q.total,
      })
    } catch (e) {
      console.error('PDF error:', e)
    } finally {
      generatingPDF.value = null
    }
  }

  return {
    allQ, lQ, qSearch, qStatus, copiedId, generatingPDF, updatingId,
    loadQuotes, refreshQ,
    statusCounts, availableStatuses, filteredQuotes,
    mTotal, mValor, mPromedio, mProductos,
    updateStatus, copyEmail, downloadPDF,
  }
}
