<template>
  <div class="header-lower bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
    <div class="large-container">
      <div class="flex items-center justify-center h-14">
        <nav class="main-menu hidden md:flex items-center gap-8" aria-label="Navegación principal">
          <a href="/" :class="['text-sm font-semibold transition-colors py-4 border-b-2', isActive('/') ? 'text-[var(--theme-color)] border-[var(--theme-color)]' : 'text-[#111] border-transparent hover:text-[var(--theme-color)] hover:border-[var(--theme-color)]']" :aria-current="isActive('/') ? 'page' : undefined">Inicio</a>
          <a href="/tienda" :class="['text-sm font-semibold transition-colors py-4 border-b-2', isActive('/tienda') ? 'text-[var(--theme-color)] border-[var(--theme-color)]' : 'text-[#111] border-transparent hover:text-[var(--theme-color)] hover:border-[var(--theme-color)]']" :aria-current="isActive('/tienda') ? 'page' : undefined">Tienda</a>
          <a href="/cotizar" :class="['text-sm font-semibold transition-colors py-4 border-b-2', isActive('/cotizar') ? 'text-[var(--theme-color)] border-[var(--theme-color)]' : 'text-[#111] border-transparent hover:text-[var(--theme-color)] hover:border-[var(--theme-color)]']" :aria-current="isActive('/cotizar') ? 'page' : undefined">Solicitar Presupuesto</a>
          <a href="/contacto" :class="['text-sm font-semibold transition-colors py-4 border-b-2', isActive('/contacto') ? 'text-[var(--theme-color)] border-[var(--theme-color)]' : 'text-[#111] border-transparent hover:text-[var(--theme-color)] hover:border-[var(--theme-color)]']" :aria-current="isActive('/contacto') ? 'page' : undefined">Contacto</a>
        </nav>

        <button class="md:hidden p-2 text-[#111]" @click="mobileMenuOpen = !mobileMenuOpen" :aria-label="mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'" :aria-expanded="mobileMenuOpen">
          <div class="w-6 h-5 relative flex flex-col justify-between">
            <span :class="['block w-6 h-0.5 bg-current transition-all duration-300', mobileMenuOpen ? 'rotate-45 translate-y-2' : '']"></span>
            <span :class="['block w-6 h-0.5 bg-current transition-all duration-300', mobileMenuOpen ? 'opacity-0' : '']"></span>
            <span :class="['block w-6 h-0.5 bg-current transition-all duration-300', mobileMenuOpen ? '-rotate-45 -translate-y-2' : '']"></span>
          </div>
        </button>
      </div>
    </div>

    <Transition name="slide">
      <div v-show="mobileMenuOpen" class="md:hidden border-t border-gray-200 bg-white">
        <nav class="large-container py-3 space-y-1">
          <a href="/" :class="['block px-4 py-3 text-sm font-medium rounded-lg transition-colors', isActive('/') ? 'bg-[var(--theme-color)]/10 text-[var(--theme-color)]' : 'text-[#111] hover:bg-gray-50']">Inicio</a>
          <a href="/tienda" :class="['block px-4 py-3 text-sm font-medium rounded-lg transition-colors', isActive('/tienda') ? 'bg-[var(--theme-color)]/10 text-[var(--theme-color)]' : 'text-[#111] hover:bg-gray-50']">Tienda</a>
          <a href="/cotizar" :class="['block px-4 py-3 text-sm font-medium rounded-lg transition-colors', isActive('/cotizar') ? 'bg-[var(--theme-color)]/10 text-[var(--theme-color)]' : 'text-[#111] hover:bg-gray-50']">Solicitar Presupuesto</a>
          <a href="/contacto" :class="['block px-4 py-3 text-sm font-medium rounded-lg transition-colors', isActive('/contacto') ? 'bg-[var(--theme-color)]/10 text-[var(--theme-color)]' : 'text-[#111] hover:bg-gray-50']">Contacto</a>
        </nav>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const mobileMenuOpen = ref(false)
const currentPath = ref('/')

function isActive(path: string): boolean {
  return currentPath.value === path
}

onMounted(() => {
  currentPath.value = window.location.pathname
})
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.25s ease;
  max-height: 400px;
  overflow: hidden;
}
.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
