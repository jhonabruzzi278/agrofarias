<template>
  <div class="header-upper bg-gradient-to-r from-[#1E523D] via-[var(--theme-color)] to-[#1E523D] py-3" role="banner">
    <div class="large-container">
      <div class="flex flex-wrap items-center gap-3 lg:gap-6">
        <!-- Logo -->
        <figure class="logo-box flex-shrink-0 group">
          <a href="/" aria-label="Ir al inicio - Agro Farías" class="flex items-center gap-3">
            <img src="/logo-agrofarias.png" alt="Logo Agro Farías" width="58" height="56" class="h-12 lg:h-14 transition-transform duration-300 group-hover:scale-105" />
            <div class="hidden xl:block">
              <span class="text-white font-title font-bold text-lg leading-tight block">Agro Farías</span>
              <span class="text-white/60 text-[11px] tracking-wider">Insumos Agrícolas</span>
            </div>
          </a>
        </figure>

        <!-- Search Area -->
        <div class="search-area flex-1 flex items-center gap-2 min-w-0">
          <!-- Category Dropdown -->
          <div class="category-dropdown relative flex-shrink-0 hidden sm:block">
            <button
              @click="catOpen = !catOpen"
              @blur="closeCatDropdown"
              class="flex items-center gap-2 h-12 px-4 text-sm bg-white/10 text-white border border-white/20 rounded-xl hover:bg-white/15 transition-all duration-200 min-w-[160px] justify-between focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <span class="flex items-center gap-2 truncate">
                <i class="fas fa-th-large text-[11px] text-[var(--accent-color)]"></i>
                <span class="truncate">{{ selectedCatName || 'Categorías' }}</span>
              </span>
              <i class="fas fa-chevron-down text-[10px] text-white/50 transition-transform duration-200" :class="{ 'rotate-180': catOpen }"></i>
            </button>
            <Transition name="dropdown">
              <div v-show="catOpen" class="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl border border-gray-200 shadow-2xl z-50 overflow-hidden">
                <div class="p-2">
                  <button
                    @mousedown.prevent="selectCategory('')"
                    class="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors hover:bg-gray-50 text-gray-700"
                    :class="{ 'bg-[var(--theme-color)]/10 text-[var(--theme-color)] font-semibold': selectedCategory === '' }"
                  >
                    <i class="fas fa-globe text-[11px] opacity-50 w-4"></i>
                    Todas las categorías
                  </button>
                  <div class="h-px bg-gray-100 my-1"></div>
                  <button
                    v-for="cat in parentCats"
                    :key="cat.id"
                    @mousedown.prevent="selectCategory(cat.slug)"
                    class="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors hover:bg-gray-50 text-gray-700"
                    :class="{ 'bg-[var(--theme-color)]/10 text-[var(--theme-color)] font-semibold': selectedCategory === cat.slug }"
                  >
                    <i class="fas fa-tag text-[11px] opacity-50 w-4"></i>
                    {{ cat.name }}
                  </button>
                </div>
              </div>
            </Transition>
          </div>

          <!-- Search Box -->
          <div class="search-box flex-1 relative">
            <form @submit.prevent="handleSearch" class="flex" role="search">
              <label for="search-input" class="sr-only">Buscar productos</label>
              <div class="relative flex-1">
                <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none transition-colors" :class="{ 'text-[var(--theme-color)]': isSearchFocused }"></i>
                <input
                  id="search-input"
                  ref="searchInputRef"
                  type="search"
                  v-model="searchQuery"
                  placeholder="Buscar fertilizantes, herbicidas, herramientas..."
                  required
                  @focus="isSearchFocused = true"
                  @blur="isSearchFocused = false"
                  @keydown.esc="searchQuery = ''; ($refs.searchInputRef as HTMLInputElement)?.blur()"
                  class="w-full h-12 pl-11 pr-4 text-sm bg-white rounded-l-xl focus:outline-none text-gray-800 placeholder-gray-400 border-2 border-transparent focus:border-[var(--accent-color)] transition-all duration-200"
                />
                <button
                  v-if="searchQuery"
                  @click="searchQuery = ''; searchInputRef?.focus()"
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                  aria-label="Limpiar búsqueda"
                >
                  <i class="fas fa-times text-[10px] text-gray-500"></i>
                </button>
              </div>
              <button type="submit" class="h-12 px-6 bg-[var(--accent-color)] hover:bg-amber-500 active:scale-95 transition-all rounded-r-xl flex items-center justify-center gap-2 flex-shrink-0 font-semibold text-sm text-white shadow-sm" aria-label="Buscar">
                <i class="fas fa-search text-sm"></i>
                <span class="hidden sm:inline">Buscar</span>
              </button>
            </form>
          </div>
        </div>

        <!-- Right Column -->
        <div class="right-column flex-shrink-0 flex items-center gap-3 sm:gap-5">
          <!-- Cart -->
          <a
            href="/cotizacion"
            class="cart-btn relative group"
            :aria-label="'Ver cotización, ' + quote.totalItems + ' productos'"
          >
            <div class="w-11 h-11 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/15 transition-all duration-200">
              <i class="fas fa-shopping-cart text-lg text-white group-hover:scale-110 transition-transform"></i>
            </div>
            <Transition name="bounce">
              <span v-if="quote.totalItems > 0" class="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] bg-[var(--accent-color)] text-white text-[11px] font-bold rounded-full flex items-center justify-center px-1 shadow-md">
                {{ quote.totalItems > 99 ? '99+' : quote.totalItems }}
              </span>
            </Transition>
          </a>

          <!-- Contact -->
          <div class="hidden sm:flex items-center gap-3">
            <div class="h-10 w-px bg-white/20"></div>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-[var(--accent-color)] flex items-center justify-center flex-shrink-0 shadow-sm">
                <i class="fas fa-phone text-white text-sm"></i>
              </div>
              <div class="hidden lg:block">
                <a :href="SITE_CONFIG.phoneHref" class="text-white font-semibold text-sm hover:text-[var(--accent-color)] transition-colors block leading-tight">{{ SITE_CONFIG.phone }}</a>
                <span class="text-white/60 text-xs">Lun-Vie 8-18</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useQuote } from '../stores/useQuote'
import { SITE_CONFIG } from '../lib/config'

const quote = useQuote()

const props = defineProps<{ categorias: Array<{ id: number; name: string; slug: string; parent: number }> }>()
const parentCats = computed(() => (props.categorias || []).filter(c => c.parent === 0))
const selectedCategory = ref('')
const catOpen = ref(false)
const searchQuery = ref('')
const isSearchFocused = ref(false)
const searchInputRef = ref<HTMLInputElement | null>(null)

const selectedCatName = computed(() => {
  if (!selectedCategory.value) return null
  return parentCats.value.find(c => c.slug === selectedCategory.value)?.name || null
})

function selectCategory(slug: string) {
  selectedCategory.value = slug
  catOpen.value = false
  if (slug) window.location.href = '/categoria/' + slug
}

function closeCatDropdown() {
  setTimeout(() => { catOpen.value = false }, 150)
}

function handleSearch() {
  if (!searchQuery.value.trim()) return
  window.location.href = '/tienda?search=' + encodeURIComponent(searchQuery.value.trim())
}
</script>

<style scoped>
.dropdown-enter-active { transition: all 0.2s ease-out; }
.dropdown-leave-active { transition: all 0.15s ease-in; }
.dropdown-enter-from { opacity: 0; transform: translateY(-8px) scale(0.97); }
.dropdown-leave-to { opacity: 0; transform: translateY(-4px) scale(0.98); }

.bounce-enter-active { animation: bounce-in 0.4s ease-out; }
.bounce-leave-active { animation: bounce-in 0.2s ease-in reverse; }
@keyframes bounce-in {
  0% { transform: scale(0); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

@media (max-width: 640px) {
  .cart-btn .min-w-\[22px\] { min-width: 18px; height: 18px; font-size: 10px; }
}
</style>
