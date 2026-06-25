import { ref, watch } from 'vue'
import type { ClientOption } from './types'

const H = { 'Content-Type': 'application/json' }
const DEBOUNCE_MS = 300

/**
 * Búsqueda de clientes registrados para autocompletar los datos del cliente en
 * una nueva cotización. Consume `/api/admin/clientes` con debounce.
 */
export function useClientSearch() {
  const term = ref('')
  const results = ref<ClientOption[]>([])
  const loading = ref(false)
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  function runSearch() {
    const q = term.value.trim()
    if (!q) {
      results.value = []
      loading.value = false
      return
    }
    loading.value = true
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ search: q, per_page: '8' })
        const r = await fetch(`/api/admin/clientes?${params.toString()}`, { headers: H })
        if (r.ok) {
          const json = await r.json()
          results.value = Array.isArray(json.customers) ? json.customers : []
        }
      } catch {
        /* noop: se mantiene el último resultado */
      }
      loading.value = false
    }, DEBOUNCE_MS)
  }

  function clear() {
    term.value = ''
    results.value = []
    loading.value = false
  }

  watch(term, () => runSearch())

  return { term, results, loading, runSearch, clear }
}
