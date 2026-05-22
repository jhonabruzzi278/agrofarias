import { ref, computed } from 'vue'

export interface QuoteItem {
  id: number
  name: string
  slug: string
  image?: string
  cantidad: number
}

const items = ref<QuoteItem[]>([])
const isLoaded = ref(false)

const totalItems = computed(() =>
  items.value.reduce((sum, item) => sum + item.cantidad, 0)
)

function loadFromStorage() {
  if (isLoaded.value) return
  isLoaded.value = true
  try {
    const saved = localStorage.getItem('agrofarias-quote')
    if (saved) {
      items.value = JSON.parse(saved)
    }
  } catch {
    items.value = []
  }
}

function saveToStorage() {
  try {
    localStorage.setItem('agrofarias-quote', JSON.stringify(items.value))
  } catch {}
}

function addItem(producto: { id: number; name: string; slug: string; image?: string }) {
  const existing = items.value.find(i => i.id === producto.id)
  if (existing) {
    existing.cantidad++
  } else {
    items.value.push({
      id: producto.id,
      name: producto.name,
      slug: producto.slug,
      image: producto.image,
      cantidad: 1,
    })
  }
  saveToStorage()
}

function removeItem(id: number) {
  items.value = items.value.filter(i => i.id !== id)
  saveToStorage()
}

function updateQuantity(id: number, cantidad: number) {
  const item = items.value.find(i => i.id === id)
  if (item) {
    item.cantidad = Math.max(1, cantidad)
    saveToStorage()
  }
}

function hasItem(id: number): boolean {
  return items.value.some(i => i.id === id)
}

function clearQuote() {
  items.value = []
  saveToStorage()
}

export function useQuote() {
  if (typeof window !== 'undefined') {
    loadFromStorage()
  }
  return {
    items,
    totalItems,
    isLoaded,
    loadFromStorage,
    addItem,
    removeItem,
    updateQuantity,
    hasItem,
    clearQuote,
  }
}
