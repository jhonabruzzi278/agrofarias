<template>
  <section :class="['shop-section py-10', bgClass]">
    <div class="large-container">
      <div class="flex items-center justify-between mb-7" v-if="title">
        <h2 class="text-2xl md:text-3xl font-bold text-gray-800 font-title tracking-tight">{{ title }}</h2>
        <a v-if="showAllLink" :href="categoryLink" class="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--theme-color)] hover:text-[var(--theme-color-3)] transition-colors group">
          Ver todos
          <svg class="w-4 h-4 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
      </div>

      <div v-if="productos.length === 0" class="empty-state flex flex-col items-center justify-center gap-4 py-16 text-gray-400">
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <p class="text-base font-medium">Sin productos disponibles</p>
      </div>

      <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-5">
        <ProductCard
          v-for="producto in productos"
          :key="producto.id"
          :id="producto.id"
          :name="producto.name"
          :slug="producto.slug"
          :image="producto.images?.[0]?.src ?? ''"
          :category="producto.categories?.[0]?.name"
          :in-stock="producto.stock_status === 'instock'"
        />
      </div>

      <div class="mt-8 text-center sm:hidden" v-if="showAllLink">
        <a :href="categoryLink" class="theme-btn btn-one inline-flex">Ver todos</a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import ProductCard from './ProductCard.vue'

interface Producto {
  id: number
  name: string
  slug: string
  images: Array<{ id: number; src: string; alt: string }>
  categories: Array<{ id: number; name: string; slug: string }>
  short_description: string
  stock_status: string
}

const props = withDefaults(defineProps<{
  productos: Producto[]
  title?: string
  showAllLink?: boolean
  categoryLink?: string
  bgClass?: string
}>(), {
  title: '',
  showAllLink: true,
  categoryLink: '/tienda',
  bgClass: 'bg-white',
})
</script>
