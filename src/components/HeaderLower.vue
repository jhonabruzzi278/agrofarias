<template>
  <div class="header-lower hidden md:block bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
    <div class="large-container">
      <div class="flex items-center h-11">

        <!-- Botón "Todas las categorías" -->
        <a
          href="/tienda"
          class="flex items-center gap-2 h-full px-5 bg-[var(--theme-color)] hover:bg-[var(--theme-color-3)] text-white text-sm font-semibold transition-colors flex-shrink-0 self-stretch"
        >
          <i class="fas fa-th text-xs"></i>
          <span>Todas las categorías</span>
        </a>

        <!-- Separador -->
        <div class="h-5 w-px bg-gray-200 mx-4 flex-shrink-0"></div>

        <!-- Nav links -->
        <nav class="flex items-center gap-0.5" aria-label="Navegación principal">
          <a
            v-for="item in navItems"
            :key="item.path"
            :href="item.path"
            class="nav-link"
            :class="isActive(item.path) ? 'active' : ''"
            :aria-current="isActive(item.path) ? 'page' : undefined"
          >
            <i :class="item.icon" class="text-[11px] mr-1.5 opacity-60"></i>
            {{ item.label }}
          </a>
        </nav>

        <!-- Spacer -->
        <div class="flex-1"></div>

        <!-- Enlace rápido: cotizar -->
        <a
          href="/cotizacion"
          class="hidden lg:flex items-center gap-2 h-7 px-3 rounded-full bg-accent/10 hover:bg-accent/20 text-accent text-xs font-bold transition-colors border border-accent/30"
        >
          <i class="fas fa-file-invoice text-[10px]"></i>
          Mi cotización
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

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
  document.addEventListener('astro:after-swap', () => {
    currentPath.value = window.location.pathname
  })
})
</script>

<style scoped>
.nav-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #555;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  text-decoration: none;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 50%;
  width: 0;
  height: 2px;
  background: var(--theme-color);
  border-radius: 2px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateX(-50%);
}

.nav-link:hover {
  color: var(--theme-color);
  background: rgba(45, 106, 79, 0.05);
}

.nav-link:hover::after { width: 55%; }

.nav-link.active {
  color: var(--theme-color);
  background: rgba(45, 106, 79, 0.06);
}

.nav-link.active::after { width: 100%; }
</style>
