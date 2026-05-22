<template>
  <div>
    <!-- Empty state -->
    <div v-if="items.length === 0" class="text-center py-20 bg-white rounded-2xl border border-gray-200">
      <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-50 flex items-center justify-center">
        <i class="fas fa-shopping-cart text-4xl text-gray-300"></i>
      </div>
      <h2 class="text-2xl font-bold text-[#111] mb-3 font-title">Tu cotización está vacía</h2>
      <p class="text-gray-500 mb-8 max-w-md mx-auto">Agrega productos desde la tienda para solicitar un presupuesto personalizado.</p>
      <a href="/tienda" class="theme-btn btn-one inline-flex px-8 py-4 text-lg">
        <i class="fas fa-store mr-2" aria-hidden="true"></i> Explorar productos
      </a>
    </div>

    <!-- Product list -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Product list column -->
      <div class="lg:col-span-2 space-y-4">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-[#111] font-title">
            Productos en cotización
            <span class="ml-2 text-sm font-normal text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">{{ items.length }}</span>
          </h2>
          <button
            @click="clearAll"
            class="text-sm text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1.5"
            aria-label="Vaciar cotización"
          >
            <i class="fas fa-trash-alt text-xs"></i> Vaciar todo
          </button>
        </div>

        <div class="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
          <div v-for="item in items" :key="item.id" class="flex items-center gap-4 p-4 hover:bg-gray-50/50 transition-colors group">
            <!-- Product image -->
            <a :href="`/producto/${item.slug}`" class="flex-shrink-0">
              <img v-if="item.image" :src="item.image" :alt="item.name" class="w-20 h-20 object-cover rounded-lg bg-gray-100" loading="lazy" />
              <div v-else class="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-image text-gray-300 text-xl"></i>
              </div>
            </a>

            <!-- Product info -->
            <div class="flex-1 min-w-0">
              <a :href="`/producto/${item.slug}`" class="text-[#111] font-semibold hover:text-[var(--theme-color)] transition-colors line-clamp-1">
                {{ item.name }}
              </a>

              <!-- Quantity controls -->
              <div class="flex items-center gap-2 mt-2">
                <button
                  class="w-8 h-8 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
                  @click="decrementQty(item.id)"
                  :disabled="item.cantidad <= 1"
                  aria-label="Reducir cantidad"
                >
                  <i class="fas fa-minus text-xs"></i>
                </button>
                <span class="w-10 text-center text-sm font-semibold text-[#111] tabular-nums">{{ item.cantidad }}</span>
                <button
                  class="w-8 h-8 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
                  @click="incrementQty(item.id)"
                  :disabled="item.cantidad >= 99"
                  aria-label="Aumentar cantidad"
                >
                  <i class="fas fa-plus text-xs"></i>
                </button>
              </div>
            </div>

            <!-- Remove button -->
            <button
              class="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
              @click="removeItem(item.id)"
              aria-label="Eliminar producto"
            >
              <i class="fas fa-trash-alt text-sm"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Summary sidebar -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
          <h3 class="text-lg font-bold text-[#111] font-title mb-4">Resumen</h3>

          <div class="space-y-3 mb-6">
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">Productos</span>
              <span class="font-semibold text-[#111]">{{ items.length }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">Unidades totales</span>
              <span class="font-semibold text-[#111]">{{ totalUnits }}</span>
            </div>
          </div>

          <div class="border-t border-gray-100 pt-4 mb-6">
            <div class="bg-[var(--theme-color)]/5 rounded-lg p-4 mb-4">
              <div class="flex items-start gap-3">
                <i class="fas fa-info-circle text-[var(--theme-color)] mt-0.5"></i>
                <p class="text-sm text-gray-600 leading-relaxed">Los precios se calculan al momento de la cotización. Nuestro equipo te contactará en máximo 24 horas.</p>
              </div>
            </div>
          </div>

          <a href="/cotizar" class="theme-btn btn-one w-full justify-center py-3.5 mb-3">
            Solicitar presupuesto <i class="fas fa-arrow-right ml-2" aria-hidden="true"></i>
          </a>
          <a href="/tienda" class="theme-btn btn-two w-full justify-center py-3.5">
            <i class="fas fa-arrow-left mr-2" aria-hidden="true"></i> Seguir comprando
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useQuote } from '../stores/useQuote'

const { items, removeItem, updateQuantity, clearQuote } = useQuote()

const totalUnits = computed(() =>
  items.value.reduce((sum, item) => sum + item.cantidad, 0)
)

function incrementQty(id: number) {
  const item = items.value.find(i => i.id === id)
  if (item && item.cantidad < 99) {
    updateQuantity(id, item.cantidad + 1)
  }
}

function decrementQty(id: number) {
  const item = items.value.find(i => i.id === id)
  if (item && item.cantidad > 1) {
    updateQuantity(id, item.cantidad - 1)
  }
}

function clearAll() {
  if (confirm('¿Estás seguro de que quieres vaciar tu cotización?')) {
    clearQuote()
  }
}
</script>

<style scoped>
.tabular-nums {
  font-variant-numeric: tabular-nums;
}

@media (max-width: 1023px) {
  .group button[aria-label="Eliminar producto"] {
    opacity: 1;
  }
}
</style>
