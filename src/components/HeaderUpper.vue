<template>
  <div class="header-upper bg-[var(--theme-color)] py-2.5" role="banner">
    <div class="large-container">
      <div class="flex flex-wrap items-center gap-3 lg:gap-5">
        <figure class="logo-box flex-shrink-0">
          <a href="/" aria-label="Ir al inicio - Agro Farías">
            <img src="/logo-agrofarias.png" alt="Logo Agro Farías" class="h-12 lg:h-14" />
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
                class="w-full sm:w-40 h-11 pl-4 pr-10 text-sm bg-white/10 text-white border border-white/20 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <option value="">Todas las categorías</option>
                <option v-for="cat in parentCats" :key="cat.id" :value="cat.slug">
                  {{ cat.name }}
                </option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <i class="fas fa-chevron-down text-white/70 text-xs"></i>
              </div>
            </div>
          </div>

          <div class="search-box flex-1">
            <form @submit.prevent="handleSearch" class="flex" role="search">
              <label for="search-input" class="sr-only">Buscar productos</label>
              <input
                id="search-input"
                type="search"
                v-model="searchQuery"
                placeholder="Buscar productos..."
                required
                class="w-full h-11 pl-4 text-sm bg-white rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]/50 text-gray-800 placeholder-gray-400"
              />
              <button type="submit" class="h-11 px-5 bg-[var(--accent-color)] hover:brightness-110 transition-all rounded-r-lg flex items-center justify-center flex-shrink-0" aria-label="Buscar">
                <i class="fas fa-search text-white text-sm"></i>
              </button>
            </form>
          </div>
        </div>

        <div class="right-column flex-shrink-0 flex items-center gap-4">
          <a href="/cotizacion" class="relative p-2 text-white/90 hover:text-white transition-colors" :aria-label="'Ver cotización, ' + quote.totalItems + ' productos'">
            <i class="fas fa-shopping-cart text-xl"></i>
            <span v-if="quote.totalItems > 0" class="absolute -top-1 -right-1 w-5 h-5 bg-[var(--accent-color)] text-white text-[11px] font-bold rounded-full flex items-center justify-center">
              {{ quote.totalItems > 99 ? '99+' : quote.totalItems }}
            </span>
          </a>
          <div class="hidden sm:flex items-center gap-3">
            <div class="w-10 h-10 bg-white/15 rounded-full flex items-center justify-center flex-shrink-0">
              <i class="fas fa-phone text-white text-base"></i>
            </div>
            <div class="hidden lg:block">
              <a :href="SITE_CONFIG.phoneHref" class="text-white font-semibold text-sm hover:text-[var(--accent-color)] transition-colors block">{{ SITE_CONFIG.phone }}</a>
              <p class="text-white/70 text-xs">Lun-Vie 8-18</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuote } from '../stores/useQuote'
import { SITE_CONFIG } from '../lib/config'

const quote = useQuote()

const props = defineProps<{ categorias: Array<{ id: number; name: string; slug: string; parent: number }> }>()
const parentCats = computed(() => (props.categorias || []).filter(c => c.parent === 0))
const selectedCategory = ref('')
const searchQuery = ref('')

function onCategoryChange(event: Event) {
  const slug = (event.target as HTMLSelectElement).value
  selectedCategory.value = slug
  if (slug) window.location.href = '/categoria/' + slug
}

function handleSearch() {
  if (!searchQuery.value.trim()) return
  window.location.href = '/tienda?search=' + encodeURIComponent(searchQuery.value.trim())
}
</script>
