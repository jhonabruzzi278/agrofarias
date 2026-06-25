import { ref, watch } from 'vue'
import type { SearchProduct, SearchCategory } from './types'

const H = { 'Content-Type': 'application/json' }
const DEBOUNCE_MS = 300

/**
 * Búsqueda de productos del cotizador: término libre + categoría, con debounce.
 * Consume `/api/cotizador-interno/productos` (misma fuente cacheada que la
 * tienda pública).
 */
export function useProductSearch() {
  const search = ref('')
  const selectedCat = ref('')
  const categories = ref<SearchCategory[]>([])
  const searchResults = ref<SearchProduct[]>([])
  const searching = ref(false)
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  async function loadCategories() {
    try {
      const r = await fetch('/api/admin/categorias', { headers: H })
      if (r.ok) categories.value = (await r.json()).categories ?? []
    } catch {
      /* noop: el selector queda vacío si falla */
    }
  }

  function runSearch() {
    const term = search.value.trim()
    if (!term && !selectedCat.value) {
      searchResults.value = []
      searching.value = false
      return
    }
    searching.value = true
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(async () => {
      try {
        const params = new URLSearchParams()
        if (term) params.set('search', term)
        if (selectedCat.value) params.set('category', selectedCat.value)
        const r = await fetch(`/api/cotizador-interno/productos?${params.toString()}`, { headers: H })
        if (r.ok) {
          const json = await r.json()
          searchResults.value = Array.isArray(json) ? json : (json.data ?? [])
        }
      } catch {
        /* noop: se mantiene el último resultado */
      }
      searching.value = false
    }, DEBOUNCE_MS)
  }

  watch([search, selectedCat], () => runSearch())

  return { search, selectedCat, categories, searchResults, searching, loadCategories, runSearch }
}
