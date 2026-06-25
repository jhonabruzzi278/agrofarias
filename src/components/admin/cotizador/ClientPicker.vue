<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <label class="block text-xs font-medium text-gray-600">Cliente registrado (opcional)</label>
      <button
        type="button"
        @click="$emit('create')"
        class="text-xs font-medium text-green-700 hover:text-green-800 hover:underline cursor-pointer bg-transparent border-none p-0"
      >
        + Nuevo cliente
      </button>
    </div>

    <!-- Cliente seleccionado -->
    <div v-if="picked" class="flex items-center justify-between gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
      <div class="min-w-0">
        <p class="text-sm font-medium text-green-800 truncate">{{ fullName(picked) }}</p>
        <p class="text-xs text-green-700/70 truncate">{{ picked.email }}</p>
      </div>
      <button
        type="button"
        @click="clearPicked"
        title="Quitar cliente"
        class="shrink-0 text-green-700/60 hover:text-green-800 text-lg leading-none cursor-pointer bg-transparent border-none"
      >
        ×
      </button>
    </div>

    <!-- Buscador -->
    <div v-else class="relative">
      <input
        v-model="term"
        type="text"
        placeholder="Buscar por nombre o email..."
        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
      />
      <div v-if="term.trim()" class="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
        <p v-if="loading" class="px-3 py-2.5 text-xs text-gray-400">Buscando...</p>
        <p v-else-if="results.length === 0" class="px-3 py-2.5 text-xs text-gray-400">Sin coincidencias.</p>
        <button
          v-for="c in results"
          :key="c.id"
          type="button"
          @click="pick(c)"
          class="w-full text-left px-3 py-2 hover:bg-green-50 transition cursor-pointer border-none bg-transparent border-b border-gray-50 last:border-b-0"
        >
          <p class="text-sm font-medium text-gray-800 truncate">{{ fullName(c) }}</p>
          <p class="text-xs text-gray-400 truncate">{{ c.email }}<span v-if="c.billing?.phone"> · {{ c.billing.phone }}</span></p>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useClientSearch } from './useClientSearch'
import type { ClientOption } from './types'

const emit = defineEmits<{
  (e: 'select', client: ClientOption): void
  (e: 'create'): void
}>()

const { term, results, loading, clear } = useClientSearch()
const picked = ref<ClientOption | null>(null)

function fullName(c: ClientOption): string {
  return `${c.first_name || ''} ${c.last_name || ''}`.trim() || c.email
}

function pick(c: ClientOption) {
  picked.value = c
  clear()
  emit('select', c)
}

function clearPicked() {
  picked.value = null
}
</script>
