<template>
  <section class="banner-style-eight" aria-label="Carrusel de banners" aria-roledescription="carrusel">
    <div class="parallax-scene" aria-hidden="true">
      <span class="pattern-layer" style="background-image: url(/assets/images/shape/shape-21.png);"></span>
    </div>

    <div class="banner-carousel relative">
      <div
        v-for="(banner, index) in displayBanners"
        v-show="currentSlide === index"
        :key="banner._id"
        class="slide-item"
        :class="{ active: currentSlide === index }"
      >
        <div class="bg-layer" :style="{ backgroundImage: `url(${banner.imagenUrl})` }"></div>
        <div class="overlay"></div>
        <div class="large-container">
          <div class="content-box">
            <span class="upper-text">{{ banner.titulo }}</span>
            <h2>{{ banner.subtitulo }}</h2>
            <p class="description">Insumos, herramientas y soluciones agrícolas con atención personalizada y despacho confiable.</p>
            <div class="btn-box">
              <a :href="banner.urlBoton" class="theme-btn btn-one">
                {{ banner.textoBoton }}
                <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </a>
            </div>
          </div>
        </div>
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
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
    </button>
    <button @click="nextSlide" class="nav-btn next" aria-label="Siguiente slide">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
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
    imagenUrl: '/assets/images/banner/banner-img-1.png',
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

.parallax-scene {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}

.pattern-layer {
  position: absolute;
  right: -50px;
  top: -50px;
  width: 300px;
  height: 300px;
  background-size: contain;
  background-repeat: no-repeat;
  opacity: 0.06;
}

.banner-carousel {
  position: relative;
}

.slide-item {
  position: relative;
  padding: 100px 0;
  min-height: 600px;
  display: flex;
  align-items: center;
}

.bg-layer {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  transform: scale(1);
  transition: transform 8000ms linear;
}

.slide-item.active .bg-layer {
  transform: scale(1.08);
}

.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0.3) 100%);
  z-index: 1;
}

.large-container {
  position: relative;
  z-index: 2;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.content-box {
  max-width: 640px;
}

.upper-text {
  display: inline-block;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #fff;
  background: #C02332;
  border-radius: 50px;
  padding: 0.35rem 1.25rem;
  margin-bottom: 1.5rem;
  opacity: 0;
  transform: translateY(-20px);
  transition: all 800ms ease;
}

.slide-item.active .upper-text {
  opacity: 1;
  transform: translateY(0);
  transition-delay: 600ms;
}

.content-box h2 {
  font-size: 3.25rem;
  line-height: 1.2;
  font-weight: 800;
  color: #00286F;
  margin-bottom: 1rem;
  opacity: 0;
  transform: translateY(30px);
  transition: all 800ms ease;
  font-family: 'Rethink Sans', sans-serif;
}

.slide-item.active .content-box h2 {
  opacity: 1;
  transform: translateY(0);
  transition-delay: 900ms;
}

.description {
  font-size: 1.125rem;
  line-height: 1.7;
  color: #444;
  margin-bottom: 2rem;
  max-width: 520px;
  opacity: 0;
  transform: translateY(30px);
  transition: all 800ms ease;
}

.slide-item.active .description {
  opacity: 1;
  transform: translateY(0);
  transition-delay: 1100ms;
}

.btn-box {
  opacity: 0;
  transform: translateY(30px);
  transition: all 800ms ease;
}

.slide-item.active .btn-box {
  opacity: 1;
  transform: translateY(0);
  transition-delay: 1300ms;
}

.btn-box :deep(.theme-btn) {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2.25rem;
  background: var(--theme-color);
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.3s ease;
  border: 2px solid var(--theme-color);
}

.btn-box :deep(.theme-btn:hover) {
  background: transparent;
  color: var(--theme-color);
}

.arrow-icon {
  width: 1.25rem;
  height: 1.25rem;
  transition: transform 0.3s ease;
}

.btn-box :deep(.theme-btn:hover .arrow-icon) {
  transform: translateX(4px);
}

.dots-box {
  position: absolute;
  bottom: 2rem;
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
  background: rgba(0, 40, 111, 0.25);
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
  background: var(--theme-color);
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

.nav-btn.prev {
  left: 1.5rem;
}

.nav-btn.next {
  right: 1.5rem;
}

@media (max-width: 1024px) {
  .slide-item {
    min-height: 500px;
    padding: 80px 0;
  }

  .content-box h2 {
    font-size: 2.5rem;
  }

  .overlay {
    background: rgba(255,255,255,0.85);
  }
}

@media (max-width: 767px) {
  .slide-item {
    min-height: 400px;
    padding: 60px 0;
  }

  .content-box h2 {
    font-size: 1.75rem;
  }

  .description {
    font-size: 1rem;
  }

  .nav-btn {
    display: none;
  }

  .upper-text {
    font-size: 0.75rem;
    padding: 0.25rem 1rem;
  }

  .btn-box :deep(.theme-btn) {
    padding: 0.75rem 1.5rem;
    font-size: 0.875rem;
  }
}
</style>
