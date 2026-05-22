<template>
  <div class="shop-card group">
    <div class="inner-box bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-[var(--theme-color)]/10 hover:-translate-y-2 hover:border-[var(--theme-color)]/30">
      <div class="image-box relative bg-gradient-to-b from-gray-50 to-white p-6">
        <span v-if="badge" class="absolute left-3 top-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">{{ badge }}</span>
        
        <div class="absolute right-3 top-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
          <a :href="`/producto/${slug}`" class="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-gray-600 hover:bg-[var(--theme-color)] hover:text-white transition-colors" :aria-label="`Ver detalles de ${name}`">
            <i class="fas fa-eye text-sm" aria-hidden="true"></i>
          </a>
        </div>

        <figure class="image relative overflow-hidden rounded-lg">
          <a :href="`/producto/${slug}`">
            <img v-if="image" :src="image" :alt="name" loading="lazy" class="w-full h-56 object-cover transition-transform duration-700 group-hover:scale-110" />
            <div v-else class="w-full h-56 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#6b7280" stroke-width="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
          </a>
        </figure>
      </div>

      <div class="lower-content relative p-5 pt-4">
        <span v-if="category" class="block text-xs uppercase tracking-wider text-[var(--theme-color)]/80 mb-2 font-semibold">{{ category }}</span>
        <h4 class="mb-2 leading-snug min-h-[2.5rem]">
          <a :href="`/producto/${slug}`" class="text-base font-bold text-[#111] hover:text-[var(--theme-color)] transition-colors line-clamp-2" :aria-label="`Ver producto ${name}`">
            {{ name }}
          </a>
        </h4>
        <ul class="rating flex items-center gap-0.5 mb-3 list-none p-0" role="img" aria-label="Sin calificaciones">
          <li v-for="i in 5" :key="i" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="#f8cd2e" stroke="#f8cd2e" stroke-width="1">
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
            </svg>
          </li>
          <span class="text-xs text-gray-500 ml-1 font-medium">(0)</span>
        </ul>

        <div class="flex items-center justify-between mb-4">
          <span v-if="inStock" class="inline-flex items-center gap-1.5 text-sm font-bold text-green-600" role="status">
            <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse" aria-hidden="true"></span> En Stock
          </span>
          <span v-else class="inline-flex items-center gap-1.5 text-sm font-bold text-red-500" role="status">
            <span class="w-2 h-2 bg-red-500 rounded-full" aria-hidden="true"></span> Consultar
          </span>
        </div>

        <div class="cart-btn mt-auto">
          <QuoteButton
            :product-id="id"
            :product-name="name"
            :product-slug="slug"
            :product-image="image"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import QuoteButton from './QuoteButton.vue'

const props = defineProps<{
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
}

.inner-box {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 420px;
}

.lower-content {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.cart-btn {
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  margin-top: auto;
}

.group:hover .cart-btn {
  opacity: 1;
  transform: translateY(0);
}

@media (max-width: 767px) {
  .cart-btn {
    opacity: 1 !important;
    transform: translateY(0) !important;
  }
}

.cart-btn :deep(.quote-btn) {
  width: 100%;
  justify-content: center;
  font-size: 0.8125rem;
  padding: 0.65rem 0.75rem;
  background: var(--theme-color);
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.2s;
  font-weight: 500;
}

.cart-btn :deep(.quote-btn--added) {
  background: #fff;
  color: var(--theme-color);
  border: 2px solid var(--theme-color);
}

.cart-btn :deep(.quote-btn:hover) {
  background: var(--theme-color-3);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(45, 106, 79, 0.3);
}

.cart-btn :deep(.quote-btn--added:hover) {
  background: #f0faf4;
}
</style>
