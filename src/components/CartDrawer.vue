<template>
  <!-- Botón carrito (icono + badge con la cantidad) -->
  <button
    type="button"
    class="cart-trigger relative group"
    :aria-label="'Ver cotización, ' + totalItems + ' productos'"
    @click="open = true"
  >
    <div class="w-11 h-11 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-theme/10 transition-all duration-200">
      <i class="fas fa-shopping-cart text-lg text-[var(--theme-color)] group-hover:scale-110 transition-transform"></i>
    </div>
    <Transition name="bounce">
      <span
        v-if="totalItems > 0"
        class="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] bg-[var(--accent-color)] text-white text-[11px] font-bold rounded-full flex items-center justify-center px-1 shadow-md"
      >
        {{ totalItems > 99 ? '99+' : totalItems }}
      </span>
    </Transition>
  </button>

  <!-- Drawer lateral -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm" @click="open = false" aria-hidden="true"></div>
    </Transition>
    <Transition name="slide-right">
      <aside
        v-if="open"
        class="fixed top-0 right-0 z-[101] h-full w-full max-w-[400px] bg-white shadow-2xl flex flex-col"
        role="dialog"
        aria-label="Tu cotización"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-[var(--theme-color)]">
          <h2 class="text-white font-bold text-base flex items-center gap-2">
            <i class="fas fa-shopping-cart text-sm"></i>
            Tu cotización
            <span v-if="totalItems > 0" class="text-white/80 text-sm font-medium">({{ totalItems }})</span>
          </h2>
          <button @click="open = false" class="w-9 h-9 flex items-center justify-center rounded-lg text-white/90 hover:bg-white/15 transition-colors" aria-label="Cerrar">
            <i class="fas fa-times text-lg"></i>
          </button>
        </div>

        <!-- Empty -->
        <div v-if="items.length === 0" class="flex-1 flex flex-col items-center justify-center text-center px-6 gap-4">
          <div class="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center">
            <i class="fas fa-shopping-basket text-3xl text-gray-300"></i>
          </div>
          <div>
            <p class="text-gray-700 font-semibold">Tu cotización está vacía</p>
            <p class="text-sm text-gray-400 mt-1">Agregá productos desde la tienda para pedir tu presupuesto.</p>
          </div>
          <a href="/tienda" @click="open = false" class="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--theme-color)] text-white text-sm font-semibold rounded-xl hover:bg-[var(--theme-color-3)] transition-colors no-underline">
            <i class="fas fa-store text-xs"></i> Ver productos
          </a>
        </div>

        <!-- Items -->
        <div v-else class="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          <div v-for="item in items" :key="item.id" class="flex gap-3 bg-gray-50 rounded-xl p-3">
            <a :href="`/producto/${item.slug}`" class="w-16 h-16 rounded-lg bg-white border border-gray-100 overflow-hidden shrink-0">
              <img v-if="item.image" :src="item.image" :alt="item.name" class="w-full h-full object-contain p-1" loading="lazy" decoding="async" />
              <div v-else class="w-full h-full flex items-center justify-center text-gray-300"><i class="fas fa-image"></i></div>
            </a>
            <div class="flex-1 min-w-0 flex flex-col justify-between">
              <a :href="`/producto/${item.slug}`" class="text-sm font-semibold text-gray-800 leading-snug line-clamp-2 hover:text-[var(--theme-color)] transition-colors no-underline">{{ item.name }}</a>
              <div class="flex items-center justify-between mt-1">
                <div class="flex items-center gap-1 bg-white border border-gray-200 rounded-lg">
                  <button @click="dec(item)" class="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-[var(--theme-color)] transition-colors" aria-label="Quitar uno"><i class="fas fa-minus text-[10px]"></i></button>
                  <span class="w-7 text-center text-sm font-semibold text-gray-800">{{ item.cantidad }}</span>
                  <button @click="inc(item)" class="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-[var(--theme-color)] transition-colors" aria-label="Agregar uno"><i class="fas fa-plus text-[10px]"></i></button>
                </div>
                <button @click="quote.removeItem(item.id)" class="text-gray-400 hover:text-red-500 transition-colors p-1" aria-label="Eliminar producto"><i class="fas fa-trash-alt text-sm"></i></button>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div v-if="items.length > 0" class="border-t border-gray-100 p-4 space-y-3 bg-white">
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-500">{{ totalItems }} producto{{ totalItems !== 1 ? 's' : '' }} en total</span>
            <button @click="quote.clearQuote()" class="text-red-500 hover:text-red-600 font-medium transition-colors">Vaciar</button>
          </div>
          <a href="/cotizacion" @click="open = false" class="flex items-center justify-center gap-2 w-full py-3.5 bg-[var(--theme-color)] hover:bg-[var(--theme-color-3)] text-white font-semibold rounded-xl transition-colors no-underline">
            <i class="fas fa-file-invoice"></i> Realizar presupuesto
          </a>
          <p class="text-[11px] text-gray-400 text-center">Sin compromiso · Te respondemos en máximo 24 h</p>
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useQuote } from '../stores/useQuote'
import type { QuoteItem } from '../lib/types'

const quote = useQuote()
// Exponer como bindings de nivel superior para que el template desempaquete los refs.
const items = quote.items
const totalItems = quote.totalItems
const open = ref(false)

function inc(item: QuoteItem) { quote.updateQuantity(item.id, item.cantidad + 1) }
function dec(item: QuoteItem) {
  if (item.cantidad <= 1) { quote.removeItem(item.id); return }
  quote.updateQuantity(item.id, item.cantidad - 1)
}

// Bloquear el scroll del fondo mientras el drawer está abierto.
watch(open, (v) => {
  if (typeof document !== 'undefined') document.body.style.overflow = v ? 'hidden' : ''
})

function onKey(e: KeyboardEvent) { if (e.key === 'Escape') open.value = false }
onMounted(() => {
  quote.loadFromStorage()
  document.addEventListener('keydown', onKey)
})
onUnmounted(() => {
  document.removeEventListener('keydown', onKey)
  if (typeof document !== 'undefined') document.body.style.overflow = ''
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-right-enter-active, .slide-right-leave-active { transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.slide-right-enter-from, .slide-right-leave-to { transform: translateX(100%); }

.bounce-enter-active { animation: bounce-in 0.4s ease-out; }
.bounce-leave-active { animation: bounce-in 0.2s ease-in reverse; }
@keyframes bounce-in {
  0% { transform: scale(0); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}
</style>
