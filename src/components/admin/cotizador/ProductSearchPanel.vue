<template>
  <div class="space-y-4">
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-3">
      <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide">Buscar producto</h2>
      <input
        v-model="search"
        type="text"
        placeholder="Escribí el nombre del producto..."
        class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-sm"
      />
      <select
        v-model="selectedCat"
        class="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-sm"
      >
        <option value="">Todas las categorías</option>
        <option v-for="c in categories" :key="c.id" :value="String(c.id)">{{ c.name }} ({{ c.count }})</option>
      </select>
      <div v-if="search.trim() || selectedCat" class="text-xs text-gray-400">
        {{ searching ? 'Buscando...' : searchResults.length + ' resultado' + (searchResults.length !== 1 ? 's' : '') }}
      </div>
      <p v-else class="text-xs text-gray-400">Escribí un nombre o elegí una categoría para listar productos.</p>
    </div>

    <div v-if="(search.trim() || selectedCat) && !searching" class="space-y-2 overflow-y-auto max-h-[calc(100vh-360px)]">
      <div v-if="searchResults.length === 0" class="text-center text-gray-400 py-10 text-sm">No se encontraron productos.</div>
      <div
        v-for="p in searchResults"
        :key="p.id"
        class="flex items-center gap-3 bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow transition cursor-pointer"
      >
        <img :src="p.image" :alt="p.name" class="w-12 h-12 rounded-lg object-cover bg-gray-100 shrink-0" loading="lazy" decoding="async" />
        <div class="flex-1 min-w-0"><p class="text-sm font-medium text-gray-800 truncate">{{ p.name }}</p></div>
        <button
          v-if="!isAdded(p.id)"
          @click="$emit('add', p)"
          class="shrink-0 bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition cursor-pointer border-none"
        >
          + Agregar
        </button>
        <span v-else class="shrink-0 text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg">Agregado</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SearchProduct, SearchCategory } from './types'

defineProps<{
  categories: SearchCategory[]
  searchResults: SearchProduct[]
  searching: boolean
  isAdded: (id: number) => boolean
}>()

defineEmits<{
  (e: 'add', product: SearchProduct): void
}>()

const search = defineModel<string>('search', { required: true })
const selectedCat = defineModel<string>('selectedCat', { required: true })
</script>
