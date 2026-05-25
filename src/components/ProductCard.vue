<template>
  <div class="shop-card group">
    <div class="inner-box bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-[var(--theme-color)]/8 hover:border-[var(--theme-color)]/20">
      <div class="image-box relative overflow-hidden">
        <figure class="image relative overflow-hidden">
          <a :href="`/producto/${slug}`" class="block">
            <img
              v-if="image"
              :src="image"
              :alt="name"
              loading="lazy"
              class="w-full h-48 sm:h-56 md:h-52 lg:h-48 object-cover transition-transform duration-700 ease-out group-hover:scale-110 group-hover:brightness-105"
            />
            <div v-else class="w-full h-48 sm:h-56 md:h-52 lg:h-48 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
              <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#9ca3af" stroke-width="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
          </a>
          <!-- Overlay on hover -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        </figure>
        <!-- Badge -->
        <span v-if="badge" class="absolute left-3 top-3 bg-red-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md shadow-red-500/20 animate-in">
          {{ badge }}
        </span>
        <!-- Quick add overlay -->
        <a
          :href="`/producto/${slug}`"
          class="quick-view absolute bottom-3 left-3 right-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 text-center bg-white/95 backdrop-blur-sm text-[var(--theme-color)] font-semibold text-xs py-2 rounded-lg shadow-lg pointer-events-none group-hover:pointer-events-auto"
        >
          <i class="fas fa-eye mr-1.5"></i> Ver producto
        </a>
      </div>

      <div class="lower-content p-3 sm:p-4">
        <!-- Category badge -->
        <div class="flex items-center gap-2 mb-2">
          <span v-if="category" class="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--theme-color)] bg-[var(--theme-color)]/5 px-2.5 py-1 rounded-full">
            <i class="fas fa-tag text-[9px]"></i> {{ category }}
          </span>
        </div>

        <!-- Product name -->
        <h4 class="mb-2.5">
          <a
            :href="`/producto/${slug}`"
            class="text-sm font-bold text-[#111] hover:text-[var(--theme-color)] transition-colors line-clamp-2 leading-snug"
          >{{ name }}</a>
        </h4>

        <!-- Stock status -->
        <div class="flex items-center gap-2 mb-3">
          <div v-if="inStock" class="flex items-center gap-1.5">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span class="text-xs font-semibold text-green-600">Disponible</span>
          </div>
          <div v-else class="flex items-center gap-1.5">
            <span class="w-2 h-2 bg-red-400 rounded-full"></span>
            <span class="text-xs font-semibold text-red-500">Consultar</span>
          </div>
        </div>

        <!-- Add to quote -->
        <div class="mt-auto pt-2 border-t border-gray-50">
          <QuoteButton :product-id="id" :product-name="name" :product-slug="slug" :product-image="image" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import QuoteButton from './QuoteButton.vue'

defineProps<{
  id: number
  name: string
  slug: string
  image: string
  category?: string
  inStock?: boolean
  badge?: string
}>()
</script>

<style scoped>
.shop-card { width: 100%; height: 100%; display: flex; }
.inner-box { display: flex; flex-direction: column; height: 100%; }
.lower-content { display: flex; flex-direction: column; flex: 1; }

.animate-in {
  animation: badgePop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes badgePop {
  from { transform: scale(0); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@media (max-width: 640px) {
  .inner-box { min-height: auto; }
  .quick-view { display: none; }
}
</style>
