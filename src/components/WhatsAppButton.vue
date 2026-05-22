<template>
  <a
    :href="whatsappLink"
    target="_blank"
    rel="noopener noreferrer"
    class="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] rounded-full shadow-lg hover:shadow-xl flex items-center justify-center text-white transition-all duration-300 hover:scale-110 hover:-translate-y-1 animate-float"
    aria-label="Contactar por WhatsApp"
  >
    <i class="fab fa-whatsapp text-2xl"></i>
    <span class="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold animate-pulse-soft" v-if="showBadge">1</span>
  </a>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  phone?: string
  message?: string
}>()

const phone = props.phone || '56912345678'
const message = encodeURIComponent(props.message || 'Hola, quisiera consultar sobre sus productos agrícolas.')

const whatsappLink = computed(() => `https://wa.me/${phone}?text=${message}`)

const showBadge = true
</script>