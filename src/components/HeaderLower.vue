<template>
  <div class="header-lower bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
    <div class="large-container">
      <div class="flex items-center justify-between h-14">
        <nav class="main-menu hidden md:flex items-center gap-6" aria-label="Navegación principal">
          <a href="/" :class="['text-sm font-medium transition-colors py-4 border-b-2', isActive('/') ? 'text-[var(--theme-color)] border-[var(--theme-color)]' : 'text-[#111] border-transparent hover:text-[var(--theme-color)] hover:border-[var(--theme-color)]']" :aria-current="isActive('/') ? 'page' : undefined">Inicio</a>
          <a href="/tienda" :class="['text-sm font-medium transition-colors py-4 border-b-2', isActive('/tienda') ? 'text-[var(--theme-color)] border-[var(--theme-color)]' : 'text-[#111] border-transparent hover:text-[var(--theme-color)] hover:border-[var(--theme-color)]']" :aria-current="isActive('/tienda') ? 'page' : undefined">Tienda</a>
          <a href="/cotizar" :class="['text-sm font-medium transition-colors py-4 border-b-2', isActive('/cotizar') ? 'text-[var(--theme-color)] border-[var(--theme-color)]' : 'text-[#111] border-transparent hover:text-[var(--theme-color)] hover:border-[var(--theme-color)]']" :aria-current="isActive('/cotizar') ? 'page' : undefined">Solicitar Presupuesto</a>
          <a href="/contacto" :class="['text-sm font-medium transition-colors py-4 border-b-2', isActive('/contacto') ? 'text-[var(--theme-color)] border-[var(--theme-color)]' : 'text-[#111] border-transparent hover:text-[var(--theme-color)] hover:border-[var(--theme-color)]']" :aria-current="isActive('/contacto') ? 'page' : undefined">Contacto</a>
        </nav>

        <div class="flex items-center gap-3">
          <a href="/cotizacion" class="relative p-2 text-[#111] hover:text-[var(--theme-color)] transition-colors" aria-label="Ver cotización, {{ quote.totalItems }} productos">
            <i class="fas fa-shopping-cart text-lg" aria-hidden="true"></i>
            <span v-if="quote.totalItems > 0" class="absolute -top-1 -right-1 w-5 h-5 bg-[var(--theme-color)] text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse-once" aria-hidden="true">
              {{ quote.totalItems > 99 ? '99+' : quote.totalItems }}
            </span>
          </a>

          <button class="lg:hidden p-2 text-[#111] hover:text-[var(--theme-color)] transition-colors" @click="mobileMenuOpen = !mobileMenuOpen" :aria-label="mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'" :aria-expanded="mobileMenuOpen" aria-controls="mobile-menu">
            <div class="w-6 h-5 relative flex flex-col justify-between" aria-hidden="true">
              <span :class="['block w-6 h-0.5 bg-current transition-all duration-300', mobileMenuOpen ? 'rotate-45 translate-y-2' : '']"></span>
              <span :class="['block w-6 h-0.5 bg-current transition-all duration-300', mobileMenuOpen ? 'opacity-0' : '']"></span>
              <span :class="['block w-6 h-0.5 bg-current transition-all duration-300', mobileMenuOpen ? '-rotate-45 -translate-y-2' : '']"></span>
            </div>
          </button>
        </div>
      </div>
    </div>

    <Transition name="slide">
      <div v-show="mobileMenuOpen" id="mobile-menu" class="lg:hidden border-t border-gray-200 bg-white" role="dialog" aria-label="Menú de navegación">
        <div class="large-container py-4">
          <nav class="space-y-1" aria-label="Navegación móvil">
            <a href="/" :class="['block px-4 py-3 text-sm font-medium rounded-md transition-colors', isActive('/') ? 'bg-[var(--theme-color)] text-white' : 'text-[#111] hover:bg-gray-100']">Inicio</a>
            <a href="/tienda" :class="['block px-4 py-3 text-sm font-medium rounded-md transition-colors', isActive('/tienda') ? 'bg-[var(--theme-color)] text-white' : 'text-[#111] hover:bg-gray-100']">Tienda</a>
            <a href="/cotizar" :class="['block px-4 py-3 text-sm font-medium rounded-md transition-colors', isActive('/cotizar') ? 'bg-[var(--theme-color)] text-white' : 'text-[#111] hover:bg-gray-100']">Solicitar Presupuesto</a>
            <a href="/contacto" :class="['block px-4 py-3 text-sm font-medium rounded-md transition-colors', isActive('/contacto') ? 'bg-[var(--theme-color)] text-white' : 'text-[#111] hover:bg-gray-100']">Contacto</a>
          </nav>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useQuote } from '../stores/useQuote'

const quote = useQuote()
const mobileMenuOpen = ref(false)

function isActive(path: string): boolean {
  if (typeof window === 'undefined') return path === '/'
  return window.location.pathname === path
}

onMounted(() => {
  quote.loadFromStorage()
})
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
  max-height: 500px;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
}

@keyframes pulse-once {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.animate-pulse-once {
  animation: pulse-once 0.3s ease-in-out;
}
</style>
