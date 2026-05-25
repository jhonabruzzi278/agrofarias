<template>
  <section class="category-section py-16 bg-white">
    <div class="large-container">
      <div class="flex items-end justify-between mb-10 gap-4">
        <div>
          <span class="text-sm font-bold text-[var(--theme-color)] uppercase tracking-widest mb-2 block">Catálogo</span>
          <h2 class="text-3xl md:text-4xl font-bold font-title text-[#111]">Categorías</h2>
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

      <div ref="carouselRef" class="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
        <a
          v-for="cat in categories"
          :key="cat.id"
          :href="`/categoria/${cat.slug}`"
          class="flex-shrink-0 w-[180px] sm:w-[220px] md:w-[260px] snap-start group cursor-pointer"
        >
          <div class="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 group-hover:-translate-y-1">
            <div class="h-40 sm:h-48 flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-green-50">
              <img
                v-if="cat.image"
                :src="getOptimizedSrc(cat.slug, cat.image.src || cat.image)"
                :alt="cat.name"
                width="260"
                height="192"
                loading="lazy"
                class="max-w-full max-h-full object-contain"
              />
              <div v-else class="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--theme-color)] to-[var(--theme-color-2)] flex items-center justify-center">
                <i class="fas fa-leaf text-white text-xl"></i>
              </div>
            </div>
            <div class="p-3 text-center border-t border-gray-100">
              <h3 class="text-black font-bold text-sm leading-tight">{{ cat.name }}</h3>
              <span v-if="cat.count > 0" class="text-gray-500 text-xs">{{ cat.count }} productos</span>
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
  'acaricidas': '/imagenes optimizadas/acaricidas.webp',
  'adherentes': '/imagenes optimizadas/adherentes.webp',
  'coadyuvantes-agricolas': '/imagenes optimizadas/coadyuvantes agricolas.webp',
  'control-de-plagas': '/imagenes optimizadas/control de plagas.webp',
  'fertilizantes': '/imagenes optimizadas/fertilizantes.webp',
  'foliares': '/imagenes optimizadas/foliares.webp',
  'fungicidas': '/imagenes optimizadas/fungicidas.webp',
  'herbicidas': '/imagenes optimizadas/herbicidas.webp',
  'herramientas-y-repuestos': '/imagenes optimizadas/herramientasrepuestos.webp',
  'insecticidas': '/imagenes optimizadas/insecticidas.webp',
  'molusquicidas': '/imagenes optimizadas/molusquicidas.webp',
  'nutricion-vegetal': '/imagenes optimizadas/nutricion vegetal.webp',
  'proteccion-fitosanitaria': '/imagenes optimizadas/proteccion fitosanitaria.webp',
  'riego-y-equipamiento': '/imagenes optimizadas/riego y equipamiento.webp',
  'rodenticidas': '/imagenes optimizadas/rodenticidaS.webp',
  'seguridad-agricola': '/imagenes optimizadas/seguridad agricola.webp',
  'semillas-y-jardin': '/imagenes optimizadas/semillas y jardin.webp',
  'victorinox': '/imagenes optimizadas/Victorinox-Logo.webp',
  'wayu': '/imagenes optimizadas/logo-wayu1.webp',
}

function getOptimizedSrc(slug: string, fallback: string): string {
  return catImages[slug] || fallback
}

function scrollPrev() {
  if (!carouselRef.value) return
  carouselRef.value.scrollBy({ left: -240, behavior: 'smooth' })
}

function scrollNext() {
  if (!carouselRef.value) return
  carouselRef.value.scrollBy({ left: 240, behavior: 'smooth' })
}

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
</style>
