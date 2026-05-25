<template>
  <div class="header-lower bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40" ref="headerRef">
    <div class="large-container">
      <div class="flex items-center justify-between h-14">
        <!-- Desktop Nav -->
        <nav class="hidden md:flex items-center gap-1" aria-label="Navegación principal">
          <template v-for="item in navItems" :key="item.path">
            <a
              :href="item.path"
              class="nav-link group"
              :class="isActive(item.path) ? 'active' : ''"
              :aria-current="isActive(item.path) ? 'page' : undefined"
            >
              <span class="relative z-10 flex items-center gap-2">
                <i :class="item.icon" class="text-sm opacity-70 group-hover:opacity-100 transition-opacity"></i>
                <span>{{ item.label }}</span>
              </span>
            </a>
          </template>
        </nav>

        <!-- Mobile Toggle -->
        <div class="flex md:hidden items-center gap-3">
          <a href="/" class="text-[var(--theme-color)] font-title font-bold text-lg">Agro Farías</a>
        </div>
        <button
          class="md:hidden relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
          @click="mobileMenuOpen = !mobileMenuOpen"
          :aria-label="mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'"
          :aria-expanded="mobileMenuOpen"
        >
          <div class="w-5 h-4 relative flex flex-col justify-between">
            <span :class="['block w-full h-0.5 bg-[#111] rounded-full transition-all duration-300 origin-center', mobileMenuOpen ? 'rotate-45 translate-y-[7px]' : '']"></span>
            <span :class="['block w-full h-0.5 bg-[#111] rounded-full transition-all duration-300', mobileMenuOpen ? 'opacity-0 scale-x-0' : '']"></span>
            <span :class="['block w-full h-0.5 bg-[#111] rounded-full transition-all duration-300 origin-center', mobileMenuOpen ? '-rotate-45 -translate-y-[7px]' : '']"></span>
          </div>
        </button>
      </div>
    </div>

    <!-- Mobile Overlay -->
    <Transition name="overlay">
      <div v-if="mobileMenuOpen" class="fixed inset-0 top-14 z-30 md:hidden" @click="mobileMenuOpen = false">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
        <nav class="absolute top-0 left-0 right-0 bg-white shadow-2xl rounded-b-2xl overflow-hidden" @click.stop>
          <div class="p-3">
            <template v-for="item in navItems" :key="item.path">
              <a
                :href="item.path"
                @click="mobileMenuOpen = false"
                class="flex items-center gap-3 px-4 py-3.5 rounded-xl text-[#111] font-medium transition-all duration-200 mb-0.5"
                :class="isActive(item.path) ? 'bg-[var(--theme-color)]/10 text-[var(--theme-color)]' : 'hover:bg-gray-50'"
              >
                <span class="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" :class="isActive(item.path) ? 'bg-[var(--theme-color)] text-white' : 'bg-gray-100 text-gray-500'">
                  <i :class="item.icon" class="text-sm"></i>
                </span>
                <span class="text-sm">{{ item.label }}</span>
                <i v-if="isActive(item.path)" class="fas fa-check text-[var(--theme-color)] text-xs ml-auto"></i>
              </a>
            </template>
          </div>
          <div class="p-4 border-t border-gray-100 bg-gray-50">
            <a :href="SITE_CONFIG.phoneHref" class="flex items-center gap-3 text-sm text-gray-600">
              <span class="w-9 h-9 rounded-full bg-[var(--accent-color)] flex items-center justify-center">
                <i class="fas fa-phone text-white text-sm"></i>
              </span>
              <span>{{ SITE_CONFIG.phone }}</span>
            </a>
          </div>
        </nav>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { SITE_CONFIG } from '../lib/config'

const mobileMenuOpen = ref(false)
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

onMounted(() => {
  currentPath.value = window.location.pathname
})
</script>

<style scoped>
.nav-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 0.875rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #555;
  border-radius: 0.75rem;
  transition: all 0.25s ease;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 50%;
  width: 0;
  height: 2.5px;
  background: var(--theme-color);
  border-radius: 2px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateX(-50%);
}

.nav-link:hover {
  color: var(--theme-color);
  background: rgba(45, 106, 79, 0.04);
}

.nav-link:hover::after {
  width: 60%;
}

.nav-link.active {
  color: var(--theme-color);
}

.nav-link.active::after {
  width: 100%;
}

.overlay-enter-active { transition: all 0.3s ease-out; }
.overlay-leave-active { transition: all 0.2s ease-in; }
.overlay-enter-from,
.overlay-leave-to { opacity: 0; }
.overlay-enter-from nav { transform: translateY(-10px); }
.overlay-enter-to nav { transform: translateY(0); }
</style>
