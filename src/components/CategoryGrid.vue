<template>
  <section class="category-section py-20 bg-white">
    <div class="large-container">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-14 gap-4">
        <div class="sec-title mb-0">
          <span class="text-sm font-bold text-[var(--theme-color)] uppercase tracking-widest mb-3 block">Explora nuestro catálogo</span>
          <h2 class="text-3xl md:text-4xl font-bold font-['Rethink_Sans',sans-serif] text-[#111]">Categorías Populares</h2>
        </div>
        <a href="/categorias" class="inline-flex items-center gap-2 text-sm font-bold text-[var(--theme-color)] hover:text-[var(--theme-color-2)] transition-colors group">
          Ver todas las categorías
          <i class="fas fa-arrow-right transition-transform group-hover:translate-x-1"></i>
        </a>
      </div>

      <div
        ref="gridRef"
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 md:gap-5"
      >
        <div
          v-for="(cat, index) in categories"
          :key="cat.id"
          class="category-block group"
          :style="{ animationDelay: `${index * 50}ms` }"
        >
          <a :href="`/categoria/${cat.slug}`" class="block">
            <div class="inner-box bg-gray-50 rounded-2xl p-4 md:p-6 text-center transition-all duration-500 hover:-translate-y-3 hover:shadow-xl hover:shadow-[var(--theme-color)]/15 border border-gray-200 hover:border-[var(--theme-color)]/30 hover:bg-white">
              <div class="image-box mx-auto w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-[var(--theme-color)] to-[var(--theme-color-2)] flex items-center justify-center mb-4 transition-all duration-500 group-hover:shadow-lg group-hover:shadow-[var(--theme-color)]/30 group-hover:scale-110">
                <img
                  v-if="cat.image"
                  :src="cat.image"
                  :alt="cat.name"
                  loading="lazy"
                  class="w-full h-full object-cover rounded-full"
                />
                <i v-else class="fas fa-leaf text-white text-xl md:text-2xl"></i>
              </div>
              <h4 class="text-sm md:text-base font-bold text-[#111] mb-1 group-hover:text-[var(--theme-color)] transition-colors line-clamp-1">{{ cat.name }}</h4>
              <span class="text-xs text-gray-500 font-medium group-hover:text-gray-600 transition-colors">{{ cat.count }} producto{{ cat.count !== 1 ? 's' : '' }}</span>
            </div>
          </a>
        </div>
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
const gridRef = ref<HTMLElement | null>(null)

const fallbackCategories: Category[] = [
  { id: 'fb-1', name: 'Nutrición Vegetal', slug: 'nutricion-vegetal', image: null, count: 0 },
  { id: 'fb-2', name: 'Protección Fitosanitaria', slug: 'proteccion-fitosanitaria', image: null, count: 0 },
  { id: 'fb-3', name: 'Coadyuvantes', slug: 'coadyuvantes', image: null, count: 0 },
  { id: 'fb-4', name: 'Control de Plagas', slug: 'control-de-plagas', image: null, count: 0 },
  { id: 'fb-5', name: 'Riego', slug: 'riego', image: null, count: 0 },
  { id: 'fb-6', name: 'Seguridad Agrícola', slug: 'seguridad-agricola', image: null, count: 0 },
  { id: 'fb-7', name: 'Semillas y Jardín', slug: 'semillas-y-jardin', image: null, count: 0 },
  { id: 'fb-8', name: 'Herramientas', slug: 'herramientas', image: null, count: 0 },
]

onMounted(() => {
  if (props.categorias && props.categorias.length > 0) {
    categories.value = props.categorias
      .filter(c => c.parent === 0)
      .slice(0, 8)
      .map(c => ({
        id: String(c.id),
        name: c.name,
        slug: c.slug,
        image: null,
        count: c.count || 0,
      }))
  } else {
    categories.value = fallbackCategories
  }
})
</script>
