<template>
  <button
    class="quote-btn inline-flex items-center gap-1.5 px-4 py-2.5 bg-[var(--theme-color)] text-white text-sm font-medium rounded-lg border border-[var(--theme-color)] hover:bg-[var(--theme-color-3)] hover:border-[var(--theme-color-3)] transition-all duration-200 cursor-pointer"
    :class="{ 'bg-[#111] text-white border-[#111] hover:bg-[#333] hover:border-[#333]': isInQuote }"
    @click="handleClick"
    :aria-label="isInQuote ? `Ver cotización de ${productName}` : `Agregar ${productName} a cotización`"
  >
    <svg v-if="!isInQuote" class="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
    <svg v-else class="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
    <span>{{ isInQuote ? 'En cotización' : 'Agregar a cotización' }}</span>
  </button>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useQuote } from '../stores/useQuote'
import { useToast } from '../composables/useToast'

const props = defineProps<{
  productId: number
  productName: string
  productSlug: string
  productImage?: string
}>()

const quote = useQuote()
const toast = useToast()

const isInQuote = computed(() => quote.hasItem(props.productId))

function handleClick() {
  if (isInQuote.value) {
    window.location.href = '/cotizacion'
  } else {
    quote.addItem({
      id: props.productId,
      name: props.productName,
      slug: props.productSlug,
      image: props.productImage,
    })
    toast.show(`"${props.productName}" agregado a tu cotización`, 'success')
  }
}

onMounted(() => {
  quote.loadFromStorage()
})
</script>
