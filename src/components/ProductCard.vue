<template>
  <div class="shop-card group">
    <div class="inner-box bg-white rounded-2xl sm:rounded-xl border border-gray-100 overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-lg hover:shadow-[var(--theme-color)]/8 hover:border-[var(--theme-color)]/20 flex flex-col h-full">
      <div class="image-box relative overflow-hidden flex-shrink-0">
        <figure class="image relative overflow-hidden">
          <a :href="`/producto/${slug}`" class="block" :aria-label="`Ver producto ${name}`">
            <img
              v-if="image"
              :src="image"
              :alt="name"
              loading="lazy"
              decoding="async"
              width="400"
              height="400"
              class="w-full aspect-square sm:h-52 lg:h-56 object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
            <div v-else class="w-full aspect-square sm:h-52 lg:h-56 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
              <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#9ca3af" stroke-width="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
          </a>
          <div class="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        </figure>
        <span v-if="badge" class="absolute left-2 top-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md shadow-red-500/20 animate-in">{{ badge }}</span>
        <a
          :href="`/producto/${slug}`"
          class="quick-view absolute bottom-2 left-2 right-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 text-center bg-white/95 backdrop-blur-sm text-[var(--theme-color)] font-semibold text-xs py-1.5 rounded-lg shadow-lg pointer-events-none group-hover:pointer-events-auto"
        >
          <i class="fas fa-eye mr-1.5"></i> Ver producto
        </a>
      </div>

      <div class="lower-content p-2 sm:p-3 flex flex-col flex-1 justify-between min-h-0 gap-1.5 sm:gap-0">
        <div>
          <div class="hidden sm:block min-h-[22px]">
            <span v-if="category" class="inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--theme-color)] bg-[var(--theme-color)]/5 px-2 py-0.5 rounded-full">
              <i class="fas fa-tag text-[9px]"></i> {{ category }}
            </span>
          </div>

          <h3 class="sm:mb-1">
            <a
              :href="`/producto/${slug}`"
              :aria-label="name"
              class="text-[13px] sm:text-sm font-bold text-[#111] hover:text-[var(--theme-color)] transition-colors line-clamp-2 leading-tight"
            >{{ name }}</a>
          </h3>

          <div class="hidden sm:flex items-center gap-2 mb-1 min-h-[20px] mt-1">
            <div v-if="inStock" class="flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              <span class="text-[11px] font-semibold text-green-700">Disponible</span>
            </div>
            <div v-else class="flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
              <span class="text-[11px] font-semibold text-red-500">Consultar</span>
            </div>
          </div>
        </div>

        <div class="sm:pt-2 sm:border-t sm:border-gray-50 [&>button]:w-full [&>button]:justify-center [&>button]:text-xs [&>button]:py-2 sm:[&>button]:w-auto sm:[&>button]:text-sm sm:[&>button]:py-2.5 sm:[&>button]:justify-start">
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
.shop-card {
  width: 100%;
  height: 100%;
  display: flex;
  content-visibility: auto;
  contain-intrinsic-size: auto 320px;
}

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
