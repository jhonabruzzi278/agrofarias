<template>
  <section class="category-section py-16 bg-white">
    <div class="large-container">
      <div class="flex items-end justify-between mb-10 gap-4">
        <div>
          <span class="text-sm font-bold text-[var(--theme-color)] uppercase tracking-widest mb-2 block">Catálogo</span>
          <h2 class="text-3xl md:text-4xl font-bold font-['Rethink_Sans',sans-serif] text-[#111]">Categorías</h2>
        </div>
        <div class="hidden sm:flex items-center gap-2">
          <button @click="scrollPrev" class="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-[var(--theme-color)] hover:text-white hover:border-[var(--theme-color)] transition-all" aria-label="Anterior">
            <i class="fas fa-chevron-left text-xs"></i>
          </button>
          <button @click="scrollNext" class="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-[var(--theme-color)] hover:text-white hover:border-[var(--theme-color)] transition-all" aria-label="Siguiente">
            <i class="fas fa-chevron-right text-xs"></i>
          </button>
        </div>
      </div>

      <div ref="carouselRef" class="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide" @scroll="onScroll">
        <a
          v-for="cat in categories"
          :key="cat.id"
          :href="`/categoria/${cat.slug}`"
          class="flex-shrink-0 w-[200px] sm:w-[240px] md:w-[280px] snap-start group cursor-pointer"
        >
          <div class="flex flex-col rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1 bg-white border border-gray-100">
            <div class="h-40 sm:h-48 md:h-56 bg-gray-50 flex items-center justify-center p-4">
              <img
                v-if="cat.image"
                :src="cat.image"
                :alt="cat.name"
                loading="lazy"
                class="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
              />
              <div v-else class="w-full h-full bg-gradient-to-br from-[var(--theme-color)] to-[var(--theme-color-2)] rounded-lg"></div>
            </div>
            <div class="p-3 text-center">
              <h3 class="text-[#111] font-bold text-sm sm:text-base leading-tight">{{ cat.name }}</h3>
              <span v-if="cat.count > 0" class="text-gray-400 text-xs">{{ cat.count }} productos</span>
            </div>
          </div>
        </a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Category {
  id: string
  name: string
  slug: string
  image: string | null
  count: number
}

const props = defineProps<{
  categorias?: Array<{ id: number; name: string; slug: string; parent: number; count?: number }>
}>()

const categories = ref<Category[]>([])
const carouselRef = ref<HTMLElement | null>(null)

const catImages: Record<string, string> = {
  'nutricion-vegetal': '/nutricion vegetal.png',
  'proteccion-fitosanitaria': '/proteccion fitosanitaria.png',
  'coadyuvantes-agricolas': '/coadyuvantes agricolas.png',
  'control-de-plagas': '/control de plagas.png',
  'herramientas-y-repuestos': '/herramientasrepuestos.png',
  'riego-y-equipamiento': '/riego y equipamiento.png',
  'seguridad-agricola': '/seguridad agricola.png',
}

function scrollPrev() {
  if (!carouselRef.value) return
  carouselRef.value.scrollBy({ left: -260, behavior: 'smooth' })
}

function scrollNext() {
  if (!carouselRef.value) return
  carouselRef.value.scrollBy({ left: 260, behavior: 'smooth' })
}

function onScroll() {}

onMounted(() => {
  if (props.categorias && props.categorias.length > 0) {
    categories.value = props.categorias
      .filter(c => c.parent === 0)
      .map(c => ({
        id: String(c.id),
        name: c.name,
        slug: c.slug,
        image: catImages[c.slug] || null,
        count: c.count || 0,
      }))
  }
})
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
