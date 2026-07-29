<template>
  <div>
    <!-- Sin imagenes -->
    <div v-if="images.length === 0" class="w-full h-[400px] bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
      <i class="fas fa-image text-6xl"></i>
    </div>

    <template v-else>
      <!-- Imagen principal -->
      <button
        type="button"
        class="group relative w-full block cursor-zoom-in rounded-xl overflow-hidden"
        aria-label="Ampliar imagen"
        @click="openLightbox(activeIndex, $event)"
      >
        <img
          :src="activeImage.src"
          :alt="activeImage.alt || productName"
          width="800"
          height="600"
          class="w-full rounded-xl object-contain max-h-[500px] transition-transform duration-500 group-hover:scale-[1.02]"
          loading="eager"
          fetchpriority="high"
        />
        <span class="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
          <i class="fas fa-search-plus text-sm"></i>
        </span>
      </button>

      <!-- Miniaturas -->
      <div v-if="images.length > 1" class="flex gap-3 mt-4 overflow-x-auto pb-2">
        <button
          v-for="(img, i) in images"
          :key="img.id ?? i"
          type="button"
          class="flex-shrink-0 w-20 h-20 rounded-lg border-2 transition-colors overflow-hidden bg-white p-1"
          :class="i === activeIndex ? 'border-[var(--theme-color)]' : 'border-gray-100 hover:border-[var(--theme-color)]/50'"
          :aria-current="i === activeIndex ? 'true' : undefined"
          :aria-label="`Ver imagen ${i + 1} de ${images.length}`"
          @click="activeIndex = i"
        >
          <img :src="img.src" :alt="img.alt || productName" class="w-full h-full object-contain rounded" loading="lazy" decoding="async" />
        </button>
      </div>
    </template>

    <!-- Lightbox -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="lightboxOpen"
          class="fixed inset-0 z-[200] bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center px-4 py-6"
          role="dialog"
          aria-modal="true"
          :aria-label="`Imagen ${activeIndex + 1} de ${images.length} de ${productName}`"
          @click.self="closeLightbox"
        >
          <button
            ref="closeBtn"
            type="button"
            class="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            aria-label="Cerrar"
            @click="closeLightbox"
          >
            <i class="fas fa-times text-xl"></i>
          </button>

          <button
            v-if="images.length > 1"
            type="button"
            class="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            aria-label="Imagen anterior"
            @click="prev"
          >
            <i class="fas fa-chevron-left text-lg"></i>
          </button>

          <img
            :src="activeImage.src"
            :alt="activeImage.alt || productName"
            class="max-w-full max-h-[75vh] object-contain rounded-lg select-none"
          />

          <button
            v-if="images.length > 1"
            type="button"
            class="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            aria-label="Imagen siguiente"
            @click="next"
          >
            <i class="fas fa-chevron-right text-lg"></i>
          </button>

          <div v-if="images.length > 1" class="flex gap-2 mt-6">
            <button
              v-for="(img, i) in images"
              :key="img.id ?? i"
              type="button"
              class="w-14 h-14 rounded-lg border-2 overflow-hidden bg-white/10 p-1 transition-colors"
              :class="i === activeIndex ? 'border-white' : 'border-white/20 hover:border-white/50'"
              :aria-current="i === activeIndex ? 'true' : undefined"
              :aria-label="`Ver imagen ${i + 1} de ${images.length}`"
              @click="activeIndex = i"
            >
              <img :src="img.src" :alt="img.alt || productName" class="w-full h-full object-contain rounded" loading="lazy" decoding="async" />
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'

interface GalleryImage {
  id?: number
  src: string
  alt?: string
}

const props = defineProps<{
  images: GalleryImage[]
  productName: string
}>()

const activeIndex = ref(0)
const lightboxOpen = ref(false)
const closeBtn = ref<HTMLButtonElement | null>(null)
let triggerEl: HTMLElement | null = null

const activeImage = computed(() => props.images[activeIndex.value] ?? props.images[0])

function openLightbox(index: number, e?: Event) {
  activeIndex.value = index
  triggerEl = (e?.currentTarget as HTMLElement | null) ?? (document.activeElement as HTMLElement | null)
  lightboxOpen.value = true
  nextTick(() => closeBtn.value?.focus())
}

function closeLightbox() {
  lightboxOpen.value = false
  triggerEl?.focus()
}

function next() {
  activeIndex.value = (activeIndex.value + 1) % props.images.length
}

function prev() {
  activeIndex.value = (activeIndex.value - 1 + props.images.length) % props.images.length
}

function onKey(e: KeyboardEvent) {
  if (!lightboxOpen.value) return
  if (e.key === 'Escape') closeLightbox()
  else if (e.key === 'ArrowRight') next()
  else if (e.key === 'ArrowLeft') prev()
}

watch(lightboxOpen, (open) => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = open ? 'hidden' : ''
})

if (typeof document !== 'undefined') {
  document.addEventListener('keydown', onKey)
}
onUnmounted(() => {
  if (typeof document === 'undefined') return
  document.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
