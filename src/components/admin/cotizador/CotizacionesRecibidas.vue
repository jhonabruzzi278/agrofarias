<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-gray-700">Cotizaciones recibidas</h2>
      <button @click="$emit('refresh')" :disabled="lQ" class="text-sm bg-white border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5">
        <span :class="lQ && 'animate-spin'">↻</span> {{ lQ ? 'Actualizando...' : 'Actualizar' }}
      </button>
    </div>

    <div v-if="allQ.length === 0 && !lQ" class="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400 text-sm">No hay cotizaciones todavía.</div>

    <template v-else>
      <!-- MÉTRICAS -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div class="bg-white rounded-xl border border-gray-200 p-4">
          <p class="text-xs text-gray-400 uppercase tracking-wide">Cotizaciones</p>
          <p class="text-2xl font-bold text-gray-800 mt-1">{{ mTotal }}</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-4">
          <p class="text-xs text-gray-400 uppercase tracking-wide">Valor total</p>
          <p class="text-2xl font-bold text-green-700 mt-1">{{ fp(mValor) }}</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-4">
          <p class="text-xs text-gray-400 uppercase tracking-wide">Ticket promedio</p>
          <p class="text-2xl font-bold text-gray-800 mt-1">{{ fp(mPromedio) }}</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-4">
          <p class="text-xs text-gray-400 uppercase tracking-wide">Productos</p>
          <p class="text-2xl font-bold text-gray-800 mt-1">{{ mProductos }}</p>
        </div>
      </div>

      <!-- FILTROS -->
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="relative flex-1">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input v-model="qSearch" type="text" placeholder="Buscar por cliente, email, empresa o #..." class="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" />
        </div>
        <select v-model="qStatus" class="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none">
          <option value="">Todos los estados ({{ allQ.length }})</option>
          <option v-for="s in availableStatuses" :key="s" :value="s">{{ sl(s) }} ({{ statusCounts[s] }})</option>
        </select>
      </div>

      <!-- LISTA -->
      <div v-if="filteredQuotes.length === 0" class="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400 text-sm">Ninguna cotización coincide con el filtro.</div>
      <div v-else class="space-y-4">
        <div v-for="q in filteredQuotes" :key="q.id" class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition">
          <div class="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
            <div class="flex items-center gap-3 flex-wrap">
              <span class="font-bold text-gray-800 text-sm">#{{ q.number }}</span>
              <span :class="statusClass(q.internalStatus)" class="px-2 py-0.5 rounded-full text-xs font-medium">{{ sl(q.internalStatus) }}</span>
              <span class="text-xs text-gray-400">{{ fd(q.date_created) }}</span>
            </div>
            <div class="text-right">
              <span class="text-lg font-bold text-green-700">{{ fp(totalConIvaOf(q.total)) }}</span>
              <p class="text-[10px] text-gray-400">Neto {{ fp(Number(q.total)) }} + IVA {{ fp(ivaOf(q.total)) }}</p>
            </div>
          </div>
          <div class="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p class="text-xs text-gray-400 uppercase mb-1">Cliente</p>
              <p class="text-sm font-medium text-gray-800">{{ q.customer.name || '-' }}</p>
              <p class="text-xs text-gray-500 break-all">{{ q.customer.email }}</p>
              <p class="text-xs text-gray-500">{{ q.customer.phone }}</p>
              <p v-if="q.customer.company" class="text-xs text-gray-400">{{ q.customer.company }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-400 uppercase mb-1">Productos</p>
              <ul class="space-y-1">
                <li v-for="(p, pi) in q.products" :key="pi" class="text-sm text-gray-700 flex justify-between gap-2">
                  <span class="truncate">{{ p.quantity }}x {{ p.name }}</span>
                  <span class="text-gray-500 shrink-0">{{ fp(Number(p.total)) }}</span>
                </li>
              </ul>
            </div>
            <div v-if="q.message">
              <p class="text-xs text-gray-400 uppercase mb-1">Mensaje</p>
              <p class="text-xs text-gray-500 leading-relaxed line-clamp-3">{{ q.message }}</p>
            </div>
          </div>
          <!-- ACCIONES RÁPIDAS -->
          <div class="flex flex-wrap items-center gap-2 px-4 pb-4">
            <a v-if="waLink(q)" :href="waLink(q)" target="_blank" rel="noopener noreferrer"
              class="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition no-underline">
              💬 WhatsApp
            </a>
            <button v-if="q.customer.email" @click="$emit('copy-email', q)"
              class="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition cursor-pointer border-none">
              {{ copiedId === q.id ? '✓ Copiado' : '✉ Copiar email' }}
            </button>
            <a v-if="q.editUrl" :href="q.editUrl" target="_blank" rel="noopener noreferrer"
              class="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition no-underline">
              ↗ Ver en WooCommerce
            </a>
            <button @click="$emit('download-pdf', q)" :disabled="generatingPDF === q.id"
              class="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition cursor-pointer border border-gray-200 disabled:opacity-50">
              {{ generatingPDF === q.id ? '⏳ Generando...' : '⬇ Descargar PDF' }}
            </button>
            <div class="flex items-center gap-1.5 ml-auto">
              <label class="text-xs text-gray-400">Estado interno:</label>
              <select :value="q.internalStatus" @change="$emit('update-status', q, ($event.target as HTMLSelectElement).value)" :disabled="updatingId === q.id"
                class="text-xs px-2 py-1.5 border border-gray-300 rounded-lg bg-white cursor-pointer focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none disabled:opacity-50">
                <option v-for="s in STATUSES" :key="s" :value="s">{{ sl(s) }}</option>
              </select>
              <span v-if="updatingId === q.id" class="text-xs text-gray-400">Guardando…</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { fp, fd, sl, statusClass, ivaOf, totalConIvaOf, waLink, STATUSES } from './formatters'
import type { ReceivedQuote } from './types'

defineProps<{
  allQ: ReceivedQuote[]
  lQ: boolean
  filteredQuotes: ReceivedQuote[]
  statusCounts: Record<string, number>
  availableStatuses: string[]
  mTotal: number
  mValor: number
  mPromedio: number
  mProductos: number
  copiedId: number | null
  generatingPDF: number | null
  updatingId: number | null
}>()

defineEmits<{
  (e: 'refresh'): void
  (e: 'update-status', q: ReceivedQuote, status: string): void
  (e: 'copy-email', q: ReceivedQuote): void
  (e: 'download-pdf', q: ReceivedQuote): void
}>()

const qSearch = defineModel<string>('qSearch', { required: true })
const qStatus = defineModel<string>('qStatus', { required: true })
</script>
