<template>
  <div class="header-upper bg-gradient-to-r from-[#1E523D] via-[var(--theme-color)] to-[#1E523D]" role="banner">
    <div class="large-container">
      <!-- ============ MOBILE TOP BAR ============ -->
      <div class="flex md:hidden items-center justify-between gap-2 h-16">
        <!-- Hamburguesa (izquierda) -->
        <button
          @click="menuOpen = true"
          class="w-11 h-11 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label="Abrir menú"
        >
          <i class="fas fa-bars text-lg"></i>
        </button>
        <!-- Logo (centro) -->
        <a href="/" class="flex items-center" aria-label="Inicio - Agro Farías">
          <img src="/logo-agrofarias.png" alt="Agro Farías" class="h-10 w-auto" />
        </a>
        <!-- Carrito (derecha) -->
        <CartDrawer />
      </div>

      <!-- ============ MOBILE SEARCH ============ -->
      <div class="md:hidden pb-3">
        <form @submit.prevent="handleSearch" role="search" class="relative">
          <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none"></i>
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Buscar productos..."
            class="w-full h-11 pl-11 pr-4 text-sm bg-white rounded-xl focus:outline-none text-gray-800 placeholder-gray-400 border-2 border-transparent focus:border-[var(--accent-color)] transition-all"
          />
        </form>
      </div>

      <!-- ============ DESKTOP BAR ============ -->
      <div class="hidden md:flex items-center gap-4 lg:gap-6 py-3">
        <!-- Logo -->
        <figure class="logo-box flex-shrink-0 m-0">
          <a href="/" aria-label="Ir al inicio - Agro Farías" class="flex items-center gap-3">
            <img src="/logo-agrofarias.png" alt="Logo Agro Farías" class="h-12 lg:h-14 w-auto" />
            <div class="hidden xl:block">
              <span class="text-white font-title font-bold text-lg leading-tight block">Agro Farías</span>
              <span class="text-white/60 text-[11px] tracking-wider">Insumos Agrícolas</span>
            </div>
          </a>
        </figure>

        <!-- Search Area -->
        <div class="search-area flex-1 flex items-center gap-2 min-w-0">
          <!-- Category Dropdown -->
          <div class="category-dropdown relative flex-shrink-0 hidden lg:block">
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
                <div class="p-2 max-h-[60vh] overflow-y-auto">
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
                <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" :class="{ 'text-[var(--theme-color)]': isSearchFocused }"></i>
                <input
                  id="search-input"
                  ref="searchInputRef"
                  type="search"
                  v-model="searchQuery"
                  placeholder="Buscar fertilizantes, herbicidas, herramientas..."
                  @focus="isSearchFocused = true"
                  @blur="isSearchFocused = false"
                  class="w-full h-12 pl-11 pr-4 text-sm bg-white rounded-l-xl focus:outline-none text-gray-800 placeholder-gray-400 border-2 border-transparent focus:border-[var(--accent-color)] transition-all duration-200"
                />
              </div>
              <button type="submit" class="h-12 px-6 bg-[var(--accent-color)] hover:bg-amber-500 active:scale-95 transition-all rounded-r-xl flex items-center justify-center gap-2 flex-shrink-0 font-semibold text-sm text-white shadow-sm" aria-label="Buscar">
                <i class="fas fa-search text-sm"></i>
                <span class="hidden lg:inline">Buscar</span>
              </button>
            </form>
          </div>
        </div>

        <!-- Right: Cart + Contact -->
        <div class="right-column flex-shrink-0 flex items-center gap-4 lg:gap-5">
          <CartDrawer />
          <div class="hidden lg:flex items-center gap-3">
            <div class="h-10 w-px bg-white/20"></div>
            <div class="w-10 h-10 rounded-full bg-[var(--accent-color)] flex items-center justify-center flex-shrink-0 shadow-sm">
              <i class="fas fa-phone text-white text-sm"></i>
            </div>
            <div>
              <a :href="SITE_CONFIG.phoneHref" class="text-white font-semibold text-sm hover:text-[var(--accent-color)] transition-colors block leading-tight">{{ SITE_CONFIG.phone }}</a>
              <span class="text-white/60 text-xs">Lun-Vie 8-18</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ============ NAV DRAWER (lateral izquierdo, mobile) ============ -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="menuOpen" class="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm md:hidden" @click="menuOpen = false" aria-hidden="true"></div>
    </Transition>
    <Transition name="slide-left">
      <nav v-if="menuOpen" class="fixed top-0 left-0 z-[101] h-full w-[82%] max-w-[330px] bg-white shadow-2xl flex flex-col md:hidden" aria-label="Menú principal">
        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-4 bg-[var(--theme-color)]">
          <span class="text-white font-title font-bold text-lg">Agro Farías</span>
          <button @click="menuOpen = false" class="w-9 h-9 flex items-center justify-center rounded-lg text-white/90 hover:bg-white/15 transition-colors" aria-label="Cerrar menú">
            <i class="fas fa-times text-lg"></i>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto">
          <!-- Nav links -->
          <div class="p-3">
            <a
              v-for="item in navItems"
              :key="item.path"
              :href="item.path"
              @click="menuOpen = false"
              class="flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors mb-0.5"
              :class="isActive(item.path) ? 'bg-[var(--theme-color)]/10 text-[var(--theme-color)]' : 'text-[#111] hover:bg-gray-50'"
            >
              <span class="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" :class="isActive(item.path) ? 'bg-[var(--theme-color)] text-white' : 'bg-gray-100 text-gray-500'">
                <i :class="item.icon" class="text-sm"></i>
              </span>
              <span class="text-sm">{{ item.label }}</span>
            </a>
          </div>

          <!-- Categorías -->
          <div v-if="parentCats.length" class="px-3 pb-3">
            <p class="px-4 pt-3 pb-2 text-[11px] font-bold uppercase tracking-widest text-gray-400">Categorías</p>
            <a
              v-for="cat in parentCats"
              :key="cat.id"
              :href="'/categoria/' + cat.slug"
              @click="menuOpen = false"
              class="flex items-center justify-between px-4 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-[#111] transition-colors"
            >
              <span class="flex items-center gap-2 truncate"><i class="fas fa-tag text-[10px] opacity-40"></i>{{ cat.name }}</span>
              <i class="fas fa-chevron-right text-[10px] opacity-30"></i>
            </a>
          </div>
        </div>

        <!-- Contacto -->
        <div class="border-t border-gray-100 p-4 bg-gray-50">
          <a :href="SITE_CONFIG.phoneHref" class="flex items-center gap-3 text-sm text-gray-700">
            <span class="w-9 h-9 rounded-full bg-[var(--accent-color)] flex items-center justify-center">
              <i class="fas fa-phone text-white text-sm"></i>
            </span>
            <span class="font-semibold">{{ SITE_CONFIG.phone }}</span>
          </a>
        </div>
      </nav>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { SITE_CONFIG } from '../lib/config'
import CartDrawer from './CartDrawer.vue'

const props = defineProps<{ categorias: Array<{ id: number; name: string; slug: string; parent: number }> }>()
const parentCats = computed(() => (props.categorias || []).filter(c => c.parent === 0))

const selectedCategory = ref('')
const catOpen = ref(false)
const searchQuery = ref('')
const isSearchFocused = ref(false)
const searchInputRef = ref<HTMLInputElement | null>(null)
const menuOpen = ref(false)
const currentPath = ref('/')

const navItems = [
  { path: '/', label: 'Inicio', icon: 'fas fa-home' },
  { path: '/tienda', label: 'Tienda', icon: 'fas fa-store' },
  { path: '/cotizacion', label: 'Cotización', icon: 'fas fa-file-invoice' },
  { path: '/contacto', label: 'Contacto', icon: 'fas fa-envelope' },
]

function isActive(path: string): boolean {
  if (path === '/') return currentPath.value === '/'
  return currentPath.value.startsWith(path)
}

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

watch(menuOpen, (v) => {
  if (typeof document !== 'undefined') document.body.style.overflow = v ? 'hidden' : ''
})

onMounted(() => {
  currentPath.value = window.location.pathname
  document.addEventListener('astro:after-swap', () => {
    currentPath.value = window.location.pathname
    menuOpen.value = false
  })
})
</script>

<style scoped>
.dropdown-enter-active { transition: all 0.2s ease-out; }
.dropdown-leave-active { transition: all 0.15s ease-in; }
.dropdown-enter-from { opacity: 0; transform: translateY(-8px) scale(0.97); }
.dropdown-leave-to { opacity: 0; transform: translateY(-4px) scale(0.98); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-left-enter-active, .slide-left-leave-active { transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.slide-left-enter-from, .slide-left-leave-to { transform: translateX(-100%); }
</style>
