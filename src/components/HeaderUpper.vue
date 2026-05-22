<template>
  <div class="header-upper bg-[var(--theme-color)] py-3" role="banner">
    <div class="large-container">
      <div class="flex flex-wrap items-center gap-4 lg:gap-6">
        <figure class="logo-box flex-shrink-0">
          <a href="/" aria-label="Ir al inicio - Agro Farías">
            <img src="/logo-agrofarias.png" alt="Logo Agro Farías" class="h-12" />
          </a>
        </figure>

        <div class="search-area flex-1 flex flex-col sm:flex-row gap-2 min-w-0">
          <div class="category-inner flex-shrink-0">
            <div class="relative">
              <label for="category-select" class="sr-only">Filtrar por categoría</label>
              <select
                id="category-select"
                :value="selectedCategory"
                @change="onCategoryChange"
                class="w-full sm:w-44 h-11 pl-4 pr-10 text-sm bg-white/10 text-white border border-white/20 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/30 option:text-gray-800"
                aria-label="Seleccionar categoría"
              >
                <option value="" class="text-gray-800">Todas las categorías</option>
                <option v-for="cat in parentCats" :key="cat.id" :value="cat.slug" class="text-gray-800">
                  {{ cat.name }}
                </option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3" aria-hidden="true">
                <i class="fas fa-chevron-down text-white text-xs"></i>
              </div>
            </div>
          </div>

          <div class="search-box flex-1">
            <form @submit.prevent="handleSearch" class="flex" role="search" aria-label="Búsqueda de productos">
              <label for="search-input" class="sr-only">Buscar productos</label>
              <input
                id="search-input"
                type="search"
                v-model="searchQuery"
                placeholder="Buscar productos..."
                required
                class="w-full h-11 pl-4 text-sm bg-white rounded-l-lg focus:outline-none focus:ring-2 focus:ring-white/30 text-gray-800 placeholder-gray-500"
                aria-label="Buscar productos"
              />
              <button
                type="submit"
                class="h-11 px-5 bg-[var(--accent-color)] hover:bg-[var(--theme-color-3)] transition-colors rounded-r-lg flex items-center justify-center flex-shrink-0"
                aria-label="Buscar"
              >
                <i class="fas fa-search text-white" aria-hidden="true"></i>
              </button>
            </form>
          </div>
        </div>

        <div class="right-column flex-shrink-0 text-center sm:text-right">
          <div class="support-box flex items-center gap-4">
            <a href="/cotizacion" class="relative p-2 text-white hover:text-[var(--accent-color)] transition-colors" :aria-label="'Ver cotización, ' + quote.totalItems + ' productos'">
              <i class="fas fa-shopping-cart text-xl" aria-hidden="true"></i>
              <span v-if="quote.totalItems > 0" class="absolute -top-1 -right-1 w-5 h-5 bg-[var(--accent-color)] text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse-once" aria-hidden="true">
                {{ quote.totalItems > 99 ? '99+' : quote.totalItems }}
              </span>
            </a>
            <div class="icon-box w-14 h-14 bg-white/15 rounded-full flex items-center justify-center flex-shrink-0" aria-hidden="true">
              <i class="fas fa-phone text-white text-xl rotate-0"></i>
            </div>
            <div>
              <a :href="'tel:' + telefono" class="text-white font-semibold text-base hover:text-[var(--accent-color)] transition-colors block" :aria-label="'Llamar al ' + telefono">{{ telefono }}</a>
              <p class="text-white/80 text-sm font-medium">Lunes a Viernes 8-18</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuote } from '../stores/useQuote'

const quote = useQuote()

const props = defineProps<{ categorias: Array<{ id: number; name: string; slug: string; parent: number }> }>()

const parentCats = computed(() => (props.categorias || []).filter(c => c.parent === 0))
const selectedCategory = ref('')
const searchQuery = ref('')
const telefono = '+56 9 1234 5678'

function onCategoryChange(event: Event) {
  const slug = (event.target as HTMLSelectElement).value
  selectedCategory.value = slug
  if (slug) {
    window.location.href = '/categoria/' + slug
  }
}

function handleSearch() {
  if (!searchQuery.value.trim()) return
  const params = new URLSearchParams()
  params.set('search', searchQuery.value.trim())
  window.location.href = '/tienda?' + params.toString()
}

onMounted(() => {
  quote.loadFromStorage()
})
</script>

<style scoped>
@keyframes pulse-once {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.animate-pulse-once {
  animation: pulse-once 0.3s ease-in-out;
}
</style>
