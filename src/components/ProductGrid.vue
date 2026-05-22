<template>
  <section class="shop-section py-20 bg-white">
    <div class="large-container">
      <div class="flex items-center justify-between mb-12" v-if="title">
        <div class="sec-title mb-0">
          <h2 class="text-3xl md:text-4xl font-bold font-title text-[#111]">{{ title }}</h2>
        </div>
        <a v-if="showAllLink" href="/tienda" class="hidden sm:inline-flex theme-btn btn-one">
          Ver todos
        </a>
      </div>

      <div v-if="productos.length === 0" class="empty-state flex flex-col items-center justify-center gap-4 py-16 text-gray-600">
        <svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="#6b7280" stroke-width="1.5">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <p class="text-lg font-medium">No se encontraron productos</p>
      </div>

      <div v-else ref="gridRef" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 lg:gap-8">
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

      <div class="mt-10 text-center sm:hidden" v-if="showAllLink">
        <a href="/tienda" class="theme-btn btn-one inline-flex">
          Ver todos
        </a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
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
}>(), {
  title: '',
  showAllLink: true,
})

const gridRef = ref<HTMLElement | null>(null)

onMounted(async () => {
  await nextTick()
})
</script>
