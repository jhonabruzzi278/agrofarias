<template>
  <section class="banner-style-eight" aria-label="Carrusel de banners" aria-roledescription="carrusel">
    <div class="banner-carousel relative">
      <div
        v-for="(banner, index) in displayBanners"
        v-show="currentSlide === index"
        :key="banner._id"
        class="slide-item"
        :class="{ active: currentSlide === index }"
      >
        <div class="bg-layer" :style="{ backgroundImage: `url(${banner.imagenUrl})` }"></div>
      </div>
    </div>

    <div class="dots-box">
      <button
        v-for="(_, index) in displayBanners"
        :key="index"
        @click="goToSlide(index)"
        :class="['dot', { active: currentSlide === index }]"
        :aria-label="`Ir al slide ${index + 1}`"
      ></button>
    </div>

    <button @click="prevSlide" class="nav-btn prev" aria-label="Slide anterior">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
    </button>
    <button @click="nextSlide" class="nav-btn next" aria-label="Siguiente slide">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    </button>
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

const fallbackBanners: Banner[] = [
  {
    _id: 'fallback-1',
    titulo: 'Insumos Agrícolas de Calidad',
    subtitulo: 'Atención personalizada y despacho confiable para productores chilenos',
    textoBoton: 'Ver Productos',
    urlBoton: '/tienda',
    orden: 1,
    imagenUrl: '/banner.png',
  },
  {
    _id: 'fallback-2',
    titulo: 'Soluciones para tu Cultivo',
    subtitulo: 'Fertilizantes, fitosanitarios y herramientas para toda la temporada',
    textoBoton: 'Explorar Categorías',
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
  if (displayBanners.value.length <= 1) return
  autoplayInterval = window.setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % displayBanners.value.length
  }, 6000)
}

function stopAutoplay() {
  if (autoplayInterval) {
    clearInterval(autoplayInterval)
    autoplayInterval = null
  }
}

function resetAutoplay() {
  stopAutoplay()
  startAutoplay()
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
.banner-style-eight {
  position: relative;
  overflow: hidden;
  background-color: #f8f9fa;
}

.banner-carousel {
  position: relative;
}

.slide-item {
  position: relative;
  width: 100%;
  height: 500px;
}

.bg-layer {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  transition: transform 8000ms linear;
}

.slide-item.active .bg-layer {
  transform: scale(1.05);
}

.dots-box {
  position: absolute;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.5rem;
  z-index: 5;
}

.dot {
  width: 0.625rem;
  height: 0.625rem;
  border-radius: 50%;
  background: rgba(255,255,255,0.5);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
}

.dot.active {
  width: 1.75rem;
  border-radius: 0.5rem;
  background: var(--theme-color);
}

.dot:hover {
  background: rgba(255,255,255,0.8);
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 5;
  width: 3rem;
  height: 3rem;
  background: rgba(255,255,255,0.9);
  border: 1px solid rgba(0,0,0,0.08);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #333;
  transition: all 0.3s ease;
  backdrop-filter: blur(4px);
}

.nav-btn:hover {
  background: var(--theme-color);
  color: #fff;
  border-color: var(--theme-color);
}

.nav-btn.prev { left: 1.5rem; }
.nav-btn.next { right: 1.5rem; }

@media (max-width: 1024px) {
  .slide-item { height: 400px; }
}

@media (max-width: 767px) {
  .slide-item { height: 280px; }
  .nav-btn { display: none; }
}
</style>
