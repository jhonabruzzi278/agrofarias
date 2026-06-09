<template>
  <section
    class="banner-carousel-wrapper relative w-full overflow-hidden bg-gray-100 contain-layout contain-paint"
    aria-label="Carrusel de banners"
    aria-roledescription="carrusel"
    @mouseenter="stopAutoplay"
    @mouseleave="startAutoplay"
  >
    <div
      ref="trackRef"
      class="banner-track relative w-full aspect-3/2 sm:aspect-5/2 lg:aspect-16/5 cursor-grab active:cursor-grabbing"
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
          class="w-full h-full object-cover bg-gray-100"
          :fetchpriority="index === 0 ? 'high' : 'auto'"
          :loading="index === 0 ? 'eager' : 'lazy'"
          draggable="false"
        />
        <!-- Gradient overlay -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        <!-- Text content -->
        <div class="absolute inset-0 flex flex-col items-center justify-end sm:justify-center text-center px-4 pb-8 sm:pb-0 z-10">
          <h2 v-if="banner.titulo" class="text-xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white drop-shadow-lg mb-2 sm:mb-4 leading-tight max-w-3xl">
            {{ banner.titulo }}
          </h2>
          <p v-if="banner.subtitulo" class="text-sm sm:text-base lg:text-lg text-white/90 drop-shadow max-w-xl mb-4 sm:mb-6">
            {{ banner.subtitulo }}
          </p>
          <a
            v-if="banner.urlBoton"
            :href="banner.urlBoton"
            class="inline-flex items-center gap-2 bg-[var(--accent-color,#ea580c)] hover:bg-amber-500 text-white font-semibold px-6 py-3 rounded-xl text-sm sm:text-base transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95"
          >
            {{ banner.textoBoton || 'Ver más' }}
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>
      </div>
    </div>

    <!-- Navigation arrows -->
    <button
      @click="prevSlide"
      class="nav-btn absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center text-gray-700 hover:bg-[var(--theme-color)] hover:text-white transition-all duration-300"
      aria-label="Slide anterior"
    >
      <svg class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
    </button>

    <button
      @click="nextSlide"
      class="nav-btn absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center text-gray-700 hover:bg-[var(--theme-color)] hover:text-white transition-all duration-300"
      aria-label="Siguiente slide"
    >
      <svg class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    </button>

    <!-- Dots -->
    <div v-if="displayBanners.length > 1" class="dots-box absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
      <button
        v-for="(_, index) in displayBanners"
        :key="index"
        @click="goToSlide(index)"
        :class="['h-2 sm:h-2.5 rounded-full transition-all duration-300', currentSlide === index ? 'w-7 sm:w-8 bg-[var(--accent-color,#ea580c)]' : 'w-2 sm:w-2.5 bg-white/60 hover:bg-white']"
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
    urlBoton: '/tienda',
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
