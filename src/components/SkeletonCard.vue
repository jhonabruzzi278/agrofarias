<template>
  <div class="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
    <!-- Image skeleton -->
    <div class="aspect-[4/3] bg-gray-200"></div>
    <!-- Content -->
    <div class="p-5 space-y-3">
      <div class="h-4 bg-gray-200 rounded w-1/3"></div>
      <div class="h-5 bg-gray-200 rounded w-3/4"></div>
      <div class="h-4 bg-gray-200 rounded w-1/2"></div>
      <div class="flex gap-2 pt-2">
        <div class="h-8 bg-gray-200 rounded-lg flex-1"></div>
        <div class="h-8 bg-gray-200 rounded-lg w-8"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.animate-pulse {
  animation: pulse 1.5s ease-in-out infinite;
}
</style>
