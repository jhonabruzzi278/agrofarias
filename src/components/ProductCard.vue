<template>
  <div class="shop-card group">
    <div class="inner-box bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-[var(--theme-color)]/30">
      <div class="image-box relative">
        <figure class="image relative overflow-hidden">
          <a :href="`/producto/${slug}`">
            <img v-if="image" :src="image" :alt="name" loading="lazy" class="w-full h-48 sm:h-56 md:h-52 lg:h-48 object-cover transition-transform duration-500 group-hover:scale-105" />
            <div v-else class="w-full h-48 sm:h-56 md:h-52 lg:h-48 bg-gray-100 flex items-center justify-center">
              <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#9ca3af" stroke-width="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
          </a>
        </figure>
        <span v-if="badge" class="absolute left-2 top-2 bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">{{ badge }}</span>
      </div>

      <div class="lower-content p-3 sm:p-4">
        <span v-if="category" class="block text-[11px] uppercase tracking-wider text-[var(--theme-color)] mb-1.5 font-semibold">{{ category }}</span>
        <h4 class="mb-2">
          <a :href="`/producto/${slug}`" class="text-sm sm:text-base font-bold text-[#111] hover:text-[var(--theme-color)] transition-colors line-clamp-2 leading-snug">{{ name }}</a>
        </h4>

        <div class="flex items-center justify-between mb-3">
          <span v-if="inStock" class="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-green-600">
            <span class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Disponible
          </span>
          <span v-else class="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-red-500">
            <span class="w-1.5 h-1.5 bg-red-500 rounded-full"></span> Consultar
          </span>
        </div>

        <div class="mt-auto">
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

@media (max-width: 640px) {
  .inner-box { min-height: auto; }
}
</style>
