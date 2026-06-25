<template>
  <!-- Mientras se comprueba la sesión -->
  <div v-if="checking" class="min-h-screen flex items-center justify-center">
    <p class="text-gray-400 text-sm">Cargando...</p>
  </div>

  <!-- LOGIN -->
  <LoginPanel
    v-else-if="!authed"
    v-model:password="password"
    :loggingIn="loggingIn"
    :loginError="loginError"
    @login="login"
  />

  <!-- PANEL -->
  <div v-else>
    <div class="fixed top-0 left-0 right-0 bg-green-700 text-white text-xs px-4 py-2 flex items-center justify-between z-10">
      <span>Panel Admin — Agro Farías</span>
      <button @click="logout" class="text-white/80 hover:text-white underline cursor-pointer bg-transparent border-none text-xs">Salir</button>
    </div>

    <div class="pt-10">
      <div class="min-h-screen p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div class="flex items-center gap-3 mb-6">
          <span class="text-3xl">🌿</span>
          <h1 class="text-2xl font-bold text-gray-800">Panel Admin</h1>
          <span class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Agro Farías</span>
        </div>
        <div class="flex flex-wrap gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
          <button @click="tab='nueva'" :class="tab==='nueva'?'bg-white shadow-sm text-gray-800':'text-gray-500'" class="px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer border-none">Nueva cotización</button>
          <button @click="tab='recibidas';refreshQ()" :class="tab==='recibidas'?'bg-white shadow-sm text-gray-800':'text-gray-500'" class="px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer border-none">Cotizaciones <span class="text-xs text-gray-400 ml-1">{{ allQ.length }}</span></button>
          <button @click="tab='productos'" :class="tab==='productos'?'bg-white shadow-sm text-gray-800':'text-gray-500'" class="px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer border-none">Productos</button>
          <button @click="tab='clientes'" :class="tab==='clientes'?'bg-white shadow-sm text-gray-800':'text-gray-500'" class="px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer border-none">Clientes</button>
          <button @click="tab='config'" :class="tab==='config'?'bg-white shadow-sm text-gray-800':'text-gray-500'" class="px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer border-none">Configuración</button>
        </div>

        <!-- NUEVA COTIZACIÓN -->
        <div v-show="tab==='nueva'" class="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div class="lg:col-span-2">
            <ProductSearchPanel
              v-model:search="search"
              v-model:selectedCat="selectedCat"
              :categories="categories"
              :searchResults="searchResults"
              :searching="searching"
              :isAdded="hp"
              @add="onAdd"
            />
          </div>
          <div class="lg:col-span-3">
            <QuoteBuilder
              :items="items"
              :total="total"
              :tProd="tProd"
              :iva="iva"
              :totalConIva="totalConIva"
              :sending="sending"
              :msg="msg"
              v-model:cN="cN"
              v-model:cE="cE"
              v-model:cP="cP"
              v-model:cC="cC"
              v-model:cM="cM"
              @change-qty="cq"
              @change-price="cu"
              @remove="ri"
              @send="send"
            />
          </div>
        </div>

        <!-- OTROS TABS -->
        <div v-if="tab==='productos'"><AdminProductos @unauthorized="authed = false" /></div>
        <div v-if="tab==='clientes'"><AdminClientes @unauthorized="authed = false" /></div>
        <div v-if="tab==='config'"><AdminConfiguracion /></div>

        <!-- COTIZACIONES RECIBIDAS -->
        <CotizacionesRecibidas
          v-show="tab==='recibidas'"
          :allQ="allQ"
          :lQ="lQ"
          :filteredQuotes="filteredQuotes"
          :statusCounts="statusCounts"
          :availableStatuses="availableStatuses"
          :mTotal="mTotal"
          :mValor="mValor"
          :mPromedio="mPromedio"
          :mProductos="mProductos"
          :copiedId="copiedId"
          :generatingPDF="generatingPDF"
          :updatingId="updatingId"
          v-model:qSearch="qSearch"
          v-model:qStatus="qStatus"
          @refresh="refreshQ"
          @update-status="updateStatus"
          @copy-email="copyEmail"
          @download-pdf="downloadPDF"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AdminProductos from './admin/AdminProductos.vue'
import AdminClientes from './admin/AdminClientes.vue'
import AdminConfiguracion from './admin/AdminConfiguracion.vue'
import LoginPanel from './admin/cotizador/LoginPanel.vue'
import ProductSearchPanel from './admin/cotizador/ProductSearchPanel.vue'
import QuoteBuilder from './admin/cotizador/QuoteBuilder.vue'
import CotizacionesRecibidas from './admin/cotizador/CotizacionesRecibidas.vue'
import { useAdminAuth } from './admin/cotizador/useAdminAuth'
import { useProductSearch } from './admin/cotizador/useProductSearch'
import { useQuoteBuilder } from './admin/cotizador/useQuoteBuilder'
import { useReceivedQuotes } from './admin/cotizador/useReceivedQuotes'
import type { SearchProduct } from './admin/cotizador/types'

const tab = ref<'nueva' | 'recibidas' | 'productos' | 'clientes' | 'config'>('nueva')

// --- Cotizaciones recibidas (también provee la carga/probe de sesión) ---
const {
  allQ, lQ, qSearch, qStatus, copiedId, generatingPDF, updatingId,
  loadQuotes, refreshQ, statusCounts, availableStatuses, filteredQuotes,
  mTotal, mValor, mPromedio, mProductos, updateStatus, copyEmail, downloadPDF,
} = useReceivedQuotes()

// --- Búsqueda de productos ---
const { search, selectedCat, categories, searchResults, searching, loadCategories } = useProductSearch()

// --- Construcción de la cotización (refresca recibidas al enviar) ---
const {
  items, cN, cE, cP, cC, cM, sending, msg,
  total, tProd, iva, totalConIva, hp, ap, ri, cq, cu, send,
} = useQuoteBuilder(refreshQ)

// --- Autenticación: probe inicial carga quotes + categorías ---
const { checking, authed, password, loggingIn, loginError, login, logout } = useAdminAuth({
  probe: async () => {
    const ok = await loadQuotes()
    if (ok) loadCategories()
    return ok
  },
  onAuthenticated: () => {
    refreshQ()
    loadCategories()
  },
})

// Al agregar un producto, limpiamos el término de búsqueda (igual que antes).
function onAdd(p: SearchProduct) {
  ap(p)
  search.value = ''
}
</script>
