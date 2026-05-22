<template>
  <section
    class="banner-carousel-wrapper relative w-full overflow-hidden bg-gray-100"
    aria-label="Carrusel de banners"
    aria-roledescription="carrusel"
    @mouseenter="stopAutoplay"
    @mouseleave="startAutoplay"
  >
    <div
      ref="trackRef"
      class="banner-track relative w-full aspect-hero cursor-grab active:cursor-grabbing"
      @touchstart="onTouchStart"
      @touchend="onTouchEnd"
    >
      <div
        v-for="(banner, index) in displayBanners"
        :key="banner._id"
        class="slide-item absolute inset-0 transition-opacity duration-700 ease-in-out"
        :class="{ 'opacity-100 z-10': currentSlide === index, 'opacity-0 z-0': currentSlide !== index }"
      >
        <img
          :src="banner.imagenUrl"
          :alt="banner.titulo || 'Banner promocional'"
          class="w-full h-full object-center object-contain bg-gray-100"
          :loading="index === 0 ? 'eager' : 'lazy'"
          draggable="false"
        />
      </div>
    </div>

    <!-- Navigation arrows -->
    <button
      @click="prevSlide"
      class="nav-btn absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center text-gray-700 hover:bg-theme hover:text-white transition-all duration-300"
      aria-label="Slide anterior"
    >
      <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
    </button>

    <button
      @click="nextSlide"
      class="nav-btn absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center text-gray-700 hover:bg-theme hover:text-white transition-all duration-300"
      aria-label="Siguiente slide"
    >
      <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    </button>

    <!-- Dots -->
    <div class="dots-box absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
      <button
        v-for="(_, index) in displayBanners"
        :key="index"
        @click="goToSlide(index)"
        :class="['h-2.5 rounded-full transition-all duration-300', currentSlide === index ? 'w-8 bg-accent' : 'w-2.5 bg-white/60 hover:bg-white']"
        :aria-label="`Ir al slide ${index + 1}`"
      ></button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Banner {
  _id: string
  titulo: string
  subtitulo: string
  textoBoton: string
  urlBoton: string
  orden: number
  imagenUrl: string
}

const props = withDefaults(defineProps<{ banners?: Banner[] }>(), { banners: () => [] })

const currentSlide = ref(0)
let autoplayInterval: number | null = null
let isPaused = false

const trackRef = ref<HTMLElement | null>(null)
let touchStartX = 0
let touchEndX = 0

const fallbackBanners: Banner[] = [
  {
    _id: 'fallback-1',
    titulo: 'Insumos Agrícolas de Calidad',
    subtitulo: 'Soluciones para tu campo',
    textoBoton: 'Ver Productos',
    urlBoton: '/tienda',
    orden: 1,
    imagenUrl: '/banner.png',
  },
  {
    _id: 'fallback-2',
    titulo: 'Todo para tu Cultivo',
    subtitulo: 'Fertilizantes, fitosanitarios y más',
    textoBoton: 'Explorar',
    urlBoton: '/categorias',
    orden: 2,
    imagenUrl: '/banner2.png',
  },
]

const displayBanners = ref<Banner[]>([])

function goToSlide(index: number) {
  currentSlide.value = index
  resetAutoplay()
}

function nextSlide() {
  currentSlide.value = (currentSlide.value + 1) % displayBanners.value.length
  resetAutoplay()
}

function prevSlide() {
  currentSlide.value = (currentSlide.value - 1 + displayBanners.value.length) % displayBanners.value.length
  resetAutoplay()
}

function startAutoplay() {
  isPaused = false
  if (autoplayInterval || displayBanners.value.length <= 1) return
  autoplayInterval = window.setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % displayBanners.value.length
  }, 6000)
}

function stopAutoplay() {
  isPaused = true
  if (autoplayInterval) {
    clearInterval(autoplayInterval)
    autoplayInterval = null
  }
}

function resetAutoplay() {
  if (isPaused) return
  stopAutoplay()
  startAutoplay()
}

// Swipe handlers
function onTouchStart(e: TouchEvent) {
  touchStartX = e.changedTouches[0].screenX
}

function onTouchEnd(e: TouchEvent) {
  touchEndX = e.changedTouches[0].screenX
  const diff = touchStartX - touchEndX
  if (Math.abs(diff) > 40) {
    if (diff > 0) nextSlide()
    else prevSlide()
  }
}

onMounted(async () => {
  displayBanners.value = (props.banners && props.banners.length > 0) ? props.banners : fallbackBanners
  startAutoplay()
})

onUnmounted(() => {
  stopAutoplay()
})
</script>

<style scoped>
@media (max-width: 640px) {
  .nav-btn {
    display: none;
  }
}
</style>
