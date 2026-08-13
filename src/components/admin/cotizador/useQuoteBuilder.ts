import { ref, computed, onMounted, watch } from 'vue'
import { IVA_RATE } from './formatters'
import type { SearchProduct, QuoteLineItem } from './types'

const H = { 'Content-Type': 'application/json' }
const DRAFT_KEY = 'agrofarias-admin-quote-draft-v1'

/**
 * Construcción de una nueva cotización: ítems (producto + cantidad + precio),
 * totales con IVA, datos del cliente y envío. `onSent` se dispara tras un
 * envío exitoso (p. ej. para refrescar la lista de recibidas).
 */
export function useQuoteBuilder(onSent?: () => void) {
  const items = ref<QuoteLineItem[]>([])
  const cN = ref('')
  const cE = ref('')
  const cP = ref('')
  const cC = ref('')
  const cM = ref('')
  const sending = ref(false)
  const msg = ref<{ ok: boolean; text: string } | null>(null)

  const total = computed(() => items.value.reduce((s, i) => s + i.q * i.u, 0))
  const tProd = computed(() => items.value.reduce((s, i) => s + i.q, 0))
  const iva = computed(() => Math.round(total.value * IVA_RATE))
  const totalConIva = computed(() => total.value + iva.value)

  function hp(id: number): boolean {
    return items.value.some((i) => i.d.id === id)
  }
  function ap(d: SearchProduct): void {
    if (!hp(d.id)) items.value.push({ d, q: 1, u: Math.max(0, Math.round(d.price || 0)) })
  }
  function ri(i: number): void {
    items.value.splice(i, 1)
  }
  function cq(i: number, v: number): void {
    items.value[i].q = Math.max(1, Math.min(999, Math.round(v || 1)))
  }
  function cu(i: number, v: number): void {
    items.value[i].u = Math.max(0, Math.round(v || 0))
  }

  function reset(): void {
    items.value = []
    cN.value = ''
    cE.value = ''
    cP.value = ''
    cC.value = ''
    cM.value = ''
    if (typeof localStorage !== 'undefined') localStorage.removeItem(DRAFT_KEY)
  }

  onMounted(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY)
      if (!saved) return
      const draft = JSON.parse(saved) as {
        items?: QuoteLineItem[]
        customer?: { name?: string; email?: string; phone?: string; company?: string; message?: string }
      }
      if (Array.isArray(draft.items)) items.value = draft.items.slice(0, 50)
      cN.value = draft.customer?.name || ''
      cE.value = draft.customer?.email || ''
      cP.value = draft.customer?.phone || ''
      cC.value = draft.customer?.company || ''
      cM.value = draft.customer?.message || ''
    } catch {
      localStorage.removeItem(DRAFT_KEY)
    }
  })

  watch([items, cN, cE, cP, cC, cM], () => {
    if (typeof localStorage === 'undefined') return
    const hasDraft = items.value.length > 0 || [cN.value, cE.value, cP.value, cC.value, cM.value].some(Boolean)
    if (!hasDraft) return localStorage.removeItem(DRAFT_KEY)
    localStorage.setItem(DRAFT_KEY, JSON.stringify({
      items: items.value,
      customer: {
        name: cN.value,
        email: cE.value,
        phone: cP.value,
        company: cC.value,
        message: cM.value,
      },
    }))
  }, { deep: true })

  async function send(): Promise<void> {
    msg.value = null
    if (items.value.length === 0) { msg.value = { ok: false, text: 'Agregá al menos un producto.' }; return }
    if (!cN.value.trim()) { msg.value = { ok: false, text: 'Ingresá el nombre del cliente.' }; return }
    if (!cE.value.trim()) { msg.value = { ok: false, text: 'Ingresá el email del cliente.' }; return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cE.value.trim())) { msg.value = { ok: false, text: 'Revisá el formato del email.' }; return }
    if (!cP.value.trim()) { msg.value = { ok: false, text: 'Ingresá el teléfono del cliente.' }; return }
    sending.value = true
    try {
      const r = await fetch('/api/cotizador-interno', {
        method: 'POST',
        headers: H,
        body: JSON.stringify({
          productos: items.value.map((i) => ({ id: i.d.id, name: i.d.name, cantidad: i.q, precioUnitario: i.u })),
          nombre: cN.value.trim(),
          email: cE.value.trim(),
          telefono: cP.value.trim(),
          empresa: cC.value.trim() || null,
          mensaje: cM.value.trim() || null,
        }),
      })
      const d = await r.json()
      if (r.ok) {
        msg.value = { ok: true, text: 'Cotización enviada correctamente.' }
        reset()
        onSent?.()
      } else {
        msg.value = { ok: false, text: d.error || 'Error al enviar.' }
      }
    } catch {
      msg.value = { ok: false, text: 'Error de conexión.' }
    } finally {
      sending.value = false
    }
  }

  return {
    items, cN, cE, cP, cC, cM, sending, msg,
    total, tProd, iva, totalConIva,
    hp, ap, ri, cq, cu, reset, send,
  }
}
