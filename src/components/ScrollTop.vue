<template>
  <Transition name="scroll-top">
    <button
      v-show="visible"
      @click="scrollToTop"
      class="fixed bottom-24 right-6 z-50 w-12 h-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-[var(--theme-color)] hover:border-[var(--theme-color)] hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
      aria-label="Volver arriba"
    >
      <i class="fas fa-arrow-up text-sm"></i>
    </button>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const visible = ref(false)

function checkScroll() {
  visible.value = window.scrollY > 400
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', checkScroll, { passive: true })
  checkScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', checkScroll)
})
</script>

<style scoped>
.scroll-top-enter-active,
.scroll-top-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.scroll-top-enter-from,
.scroll-top-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.9);
}
</style>
