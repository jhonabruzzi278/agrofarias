<template>
  <!-- Barra de navegación solo en escritorio. En mobile el menú vive en el header superior (drawer lateral). -->
  <div class="header-lower hidden md:block bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40">
    <div class="large-container">
      <div class="flex items-center justify-center h-14">
        <nav class="flex items-center gap-1" aria-label="Navegación principal">
          <a
            v-for="item in navItems"
            :key="item.path"
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
        </nav>
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

.nav-link:hover::after { width: 60%; }
.nav-link.active { color: var(--theme-color); }
.nav-link.active::after { width: 100%; }
</style>
