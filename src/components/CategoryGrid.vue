<template>
  <section class="category-section py-16 bg-gradient-to-b from-white to-gray-50/50">
    <div class="large-container">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
        <div>
          <span class="text-sm font-bold text-[var(--theme-color)] uppercase tracking-widest mb-2 block">Catálogo</span>
          <h2 class="text-3xl md:text-4xl font-bold font-title text-[#111]">Explorá por categoría</h2>
          <p class="text-gray-500 mt-2 max-w-xl">Encontrá rápido lo que necesitás entre nuestras líneas de productos.</p>
        </div>
        <a href="/tienda" class="inline-flex items-center gap-2 self-start sm:self-auto px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-[#111] hover:bg-[var(--theme-color)] hover:text-white hover:border-[var(--theme-color)] transition-all shadow-sm no-underline">
          Ver toda la tienda <i class="fas fa-arrow-right text-xs"></i>
        </a>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        <a
          v-for="cat in categories"
          :key="cat.id"
          :href="`/categoria/${cat.slug}`"
          class="group relative bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-lg hover:border-[var(--theme-color)]/40 hover:-translate-y-1 transition-all duration-300 no-underline"
        >
          <div class="aspect-square flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-green-50/60">
            <img
              v-if="cat.image"
              :src="getOptimizedSrc(cat.slug, cat.image)"
              :alt="cat.name"
              width="220"
              height="220"
              loading="lazy"
              class="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-110"
            />
            <div v-else class="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--theme-color)] to-[var(--theme-color-2)] flex items-center justify-center">
              <i class="fas fa-leaf text-white text-xl"></i>
            </div>
          </div>
          <div class="p-3 border-t border-gray-100">
            <h3 class="text-[#111] font-bold text-sm leading-snug line-clamp-2 group-hover:text-[var(--theme-color)] transition-colors">{{ cat.name }}</h3>
            <div class="flex items-center justify-between mt-1.5">
              <span v-if="cat.count > 0" class="text-gray-400 text-xs">{{ cat.count }} producto{{ cat.count !== 1 ? 's' : '' }}</span>
              <span v-else class="text-gray-300 text-xs">Ver</span>
              <span class="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-[var(--theme-color)] group-hover:text-white transition-all duration-300">
                <i class="fas fa-arrow-right text-[10px]"></i>
              </span>
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
