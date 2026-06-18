<template>
  <!-- ─── TOPBAR (desktop only) ─── -->
  <div class="topbar-strip hidden md:block bg-[var(--theme-color-3)]">
    <div class="large-container flex items-center justify-between h-9">
      <!-- Contacto -->
      <div class="flex items-center gap-5">
        <a :href="SITE_CONFIG.phoneHref" class="flex items-center gap-1.5 text-white/75 hover:text-white text-xs transition-colors">
          <i class="fas fa-phone text-[10px]"></i>
          <span>{{ SITE_CONFIG.phone }}</span>
        </a>
        <a :href="SITE_CONFIG.emailHref" class="flex items-center gap-1.5 text-white/75 hover:text-white text-xs transition-colors">
          <i class="fas fa-envelope text-[10px]"></i>
          <span>{{ SITE_CONFIG.email }}</span>
        </a>
      </div>
      <!-- Horario + redes -->
      <div class="flex items-center gap-4">
        <span class="flex items-center gap-1.5 text-white/60 text-xs">
          <i class="fas fa-clock text-[10px]"></i>
          Lun-Vie 8:00 - 17:30
        </span>
        <div class="flex items-center gap-2 pl-4 border-l border-white/20">
          <a :href="SITE_CONFIG.social.facebook" target="_blank" rel="noopener noreferrer" class="w-5 h-5 flex items-center justify-center text-white/60 hover:text-white transition-colors" aria-label="Facebook">
            <i class="fab fa-facebook-f text-[11px]"></i>
          </a>
          <a :href="SITE_CONFIG.social.instagram" target="_blank" rel="noopener noreferrer" class="w-5 h-5 flex items-center justify-center text-white/60 hover:text-white transition-colors" aria-label="Instagram">
            <i class="fab fa-instagram text-[11px]"></i>
          </a>
          <a :href="SITE_CONFIG.social.whatsapp" target="_blank" rel="noopener noreferrer" class="w-5 h-5 flex items-center justify-center text-white/60 hover:text-white transition-colors" aria-label="WhatsApp">
            <i class="fab fa-whatsapp text-[11px]"></i>
          </a>
        </div>
      </div>
    </div>
  </div>

  <!-- ─── MAIN HEADER (blanco) ─── -->
  <div class="header-main bg-white border-b border-gray-100 shadow-sm" role="banner">
    <div class="large-container">

      <!-- MOBILE: hamburger | logo | cart -->
      <div class="flex md:hidden items-center justify-between gap-2 h-16">
        <button
          @click="menuOpen = true"
          class="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-[#111] transition-colors"
          aria-label="Abrir menú"
        >
          <i class="fas fa-bars text-base"></i>
        </button>
        <a href="/" class="flex items-center" aria-label="Inicio - Agro Farías">
          <img src="/logo-agrofarias.png" alt="Agro Farías" class="h-10 w-auto" />
        </a>
        <CartDrawer />
      </div>

      <!-- MOBILE: barra de búsqueda -->
      <div class="md:hidden pb-3">
        <form @submit.prevent="handleSearch" role="search" class="relative">
          <i class="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none"></i>
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Buscar productos..."
            class="w-full h-11 pl-10 pr-4 text-sm bg-gray-100 rounded-xl focus:outline-none focus:bg-white text-gray-800 placeholder-gray-400 border-2 border-transparent focus:border-[var(--theme-color)] transition-all"
          />
        </form>
      </div>

      <!-- DESKTOP: logo | search | acciones -->
      <div class="hidden md:flex items-center gap-5 lg:gap-6 py-4">
        <!-- Logo -->
        <a href="/" aria-label="Ir al inicio - Agro Farías" class="flex items-center gap-3 flex-shrink-0">
          <img src="/logo-agrofarias.png" alt="Logo Agro Farías" class="h-12 lg:h-14 w-auto" />
          <div class="hidden xl:block">
            <span class="text-[#111] font-title font-bold text-lg leading-tight block">Agro Farías</span>
            <span class="text-gray-400 text-[11px] tracking-widest uppercase">Insumos Agrícolas</span>
          </div>
        </a>

        <!-- Área de búsqueda -->
        <div class="flex-1 flex items-center min-w-0 gap-0">
          <!-- Dropdown categorías (lg+) -->
          <div class="relative flex-shrink-0 hidden lg:block">
            <button
              @click="catOpen = !catOpen"
              @blur="closeCatDropdown"
              class="flex items-center gap-2 h-12 px-4 text-sm bg-gray-50 text-gray-700 border border-gray-200 rounded-l-xl border-r-0 hover:bg-gray-100 min-w-[148px] justify-between focus:outline-none transition-colors"
            >
              <span class="flex items-center gap-1.5 truncate">
                <i class="fas fa-th-large text-[10px] text-[var(--theme-color)]"></i>
                <span class="truncate">{{ selectedCatName || 'Categorías' }}</span>
              </span>
              <i class="fas fa-chevron-down text-[10px] text-gray-400 transition-transform duration-200" :class="{ 'rotate-180': catOpen }"></i>
            </button>
            <Transition name="dropdown">
              <div v-show="catOpen" class="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl border border-gray-200 shadow-2xl z-50 overflow-hidden">
                <div class="p-2 max-h-[58vh] overflow-y-auto">
                  <button
                    @mousedown.prevent="selectCategory('')"
                    class="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
                    :class="{ 'bg-theme/10 text-theme font-semibold': selectedCategory === '' }"
                  >
                    <i class="fas fa-globe text-[11px] opacity-50 w-4"></i>
                    Todas las categorías
                  </button>
                  <div class="h-px bg-gray-100 my-1"></div>
                  <button
                    v-for="cat in parentCats"
                    :key="cat.id"
                    @mousedown.prevent="selectCategory(cat.slug)"
                    class="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
                    :class="{ 'bg-theme/10 text-theme font-semibold': selectedCategory === cat.slug }"
                  >
                    <i class="fas fa-tag text-[11px] opacity-50 w-4"></i>
                    {{ cat.name }}
                  </button>
                </div>
              </div>
            </Transition>
          </div>

          <!-- Búsqueda + botón -->
          <form @submit.prevent="handleSearch" class="flex flex-1 min-w-0" role="search">
            <label for="search-desktop" class="sr-only">Buscar productos</label>
            <div class="relative flex-1">
              <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none"></i>
              <input
                id="search-desktop"
                ref="searchInputRef"
                type="search"
                v-model="searchQuery"
                placeholder="Buscar fertilizantes, herbicidas, herramientas..."
                class="w-full h-12 pl-11 pr-4 text-sm bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-400 border border-gray-200 border-r-0 focus:border-[var(--theme-color)] focus:outline-none focus:ring-0 transition-colors rounded-l-xl lg:rounded-l-none"
              />
            </div>
            <button
              type="submit"
              class="h-12 px-5 bg-[var(--theme-color)] hover:bg-[var(--theme-color-3)] text-white text-sm font-semibold flex items-center justify-center gap-2 rounded-r-xl flex-shrink-0 transition-colors"
              aria-label="Buscar"
            >
              <i class="fas fa-search text-sm"></i>
              <span class="hidden xl:inline">Buscar</span>
            </button>
          </form>
        </div>

        <!-- Acciones derecha: WhatsApp + carrito -->
        <div class="flex items-center gap-2 lg:gap-3 flex-shrink-0">
          <a
            :href="SITE_CONFIG.social.whatsapp"
            target="_blank"
            rel="noopener noreferrer"
            class="hidden lg:flex items-center gap-2 h-11 px-4 rounded-xl bg-green-50 hover:bg-green-100 border border-green-200 text-sm font-semibold text-green-700 transition-all"
            aria-label="Contactar por WhatsApp"
          >
            <i class="fab fa-whatsapp text-green-600 text-base"></i>
            <span>WhatsApp</span>
          </a>
          <CartDrawer />
        </div>
      </div>
    </div>
  </div>

  <!-- ─── NAV DRAWER LATERAL (mobile) ─── -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="menuOpen"
        class="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm md:hidden"
        @click="menuOpen = false"
        aria-hidden="true"
      ></div>
    </Transition>
    <Transition name="slide-left">
      <nav
        v-if="menuOpen"
        class="fixed top-0 left-0 z-[101] h-full w-[82%] max-w-[330px] bg-white shadow-2xl flex flex-col md:hidden"
        aria-label="Menú principal"
      >
        <!-- Header del drawer -->
        <div class="flex items-center justify-between px-5 py-4 bg-[var(--theme-color)]">
          <div class="flex items-center gap-2">
            <img src="/logo-agrofarias.png" alt="" class="h-8 w-auto" aria-hidden="true" />
            <span class="text-white font-title font-bold text-base">Agro Farías</span>
          </div>
          <button
            @click="menuOpen = false"
            class="w-9 h-9 flex items-center justify-center rounded-lg text-white/90 hover:bg-white/15 transition-colors"
            aria-label="Cerrar menú"
          >
            <i class="fas fa-times text-base"></i>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto">
          <!-- Nav links -->
          <div class="p-3 pt-4">
            <a
              v-for="item in navItems"
              :key="item.path"
              :href="item.path"
              @click="menuOpen = false"
              class="flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors mb-0.5"
              :class="isActive(item.path) ? 'bg-theme/10 text-theme' : 'text-[#111] hover:bg-gray-50'"
            >
              <span
                class="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                :class="isActive(item.path) ? 'bg-[var(--theme-color)] text-white' : 'bg-gray-100 text-gray-500'"
              >
                <i :class="item.icon" class="text-sm"></i>
              </span>
              <span class="text-sm">{{ item.label }}</span>
            </a>
          </div>

          <!-- Categorías -->
          <div v-if="parentCats.length" class="px-3 pb-4">
            <p class="px-4 pt-2 pb-2 text-[11px] font-bold uppercase tracking-widest text-gray-400">Categorías</p>
            <a
              v-for="cat in parentCats"
              :key="cat.id"
              :href="'/categoria/' + cat.slug"
              @click="menuOpen = false"
              class="flex items-center justify-between px-4 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-[#111] transition-colors"
            >
              <span class="flex items-center gap-2 truncate">
                <i class="fas fa-tag text-[10px] opacity-40"></i>
                {{ cat.name }}
              </span>
              <i class="fas fa-chevron-right text-[10px] opacity-30 flex-shrink-0"></i>
            </a>
          </div>
        </div>

        <!-- Pie del drawer: contacto -->
        <div class="border-t border-gray-100 p-4 bg-gray-50 space-y-2">
          <a :href="SITE_CONFIG.phoneHref" class="flex items-center gap-3 text-sm text-gray-700 hover:text-[var(--theme-color)] transition-colors">
            <span class="w-9 h-9 rounded-full bg-[var(--theme-color)] flex items-center justify-center flex-shrink-0">
              <i class="fas fa-phone text-white text-sm"></i>
            </span>
            <span class="font-semibold">{{ SITE_CONFIG.phone }}</span>
          </a>
          <a :href="SITE_CONFIG.social.whatsapp" target="_blank" rel="noopener noreferrer" class="flex items-center gap-3 text-sm text-gray-700 hover:text-green-700 transition-colors">
            <span class="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <i class="fab fa-whatsapp text-green-600 text-base"></i>
            </span>
            <span class="font-semibold">WhatsApp</span>
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

const props = defineProps<{
  categorias: Array<{ id: number; name: string; slug: string; parent: number }>
}>()

const parentCats = computed(() => (props.categorias || []).filter(c => c.parent === 0))

const selectedCategory = ref('')
const catOpen = ref(false)
const searchQuery = ref('')
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

const selectedCatName = computed(() =>
  parentCats.value.find(c => c.slug === selectedCategory.value)?.name ?? null
)

function selectCategory(slug: string) {
  selectedCategory.value = slug
  catOpen.value = false
  if (slug) window.location.href = '/categoria/' + slug
}

function closeCatDropdown() {
  setTimeout(() => { catOpen.value = false }, 150)
}

function handleSearch() {
  const q = searchQuery.value.trim()
  if (!q) return
  window.location.href = '/tienda?search=' + encodeURIComponent(q)
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
.dropdown-leave-to   { opacity: 0; transform: translateY(-4px) scale(0.98); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-left-enter-active, .slide-left-leave-active { transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.slide-left-enter-from, .slide-left-leave-to { transform: translateX(-100%); }
</style>
