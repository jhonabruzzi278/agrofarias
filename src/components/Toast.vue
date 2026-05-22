<template>
  <Teleport to="body">
    <div class="fixed top-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg border text-sm font-medium min-w-[280px] max-w-md"
          :class="toastClasses[toast.type]"
          role="alert"
        >
          <i :class="iconClasses[toast.type]" class="text-lg flex-shrink-0"></i>
          <span class="flex-1">{{ toast.message }}</span>
          <button
            @click="remove(toast.id)"
            class="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity"
            :class="closeClasses[toast.type]"
            aria-label="Cerrar notificación"
          >
            <i class="fas fa-times text-xs"></i>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToast } from '../composables/useToast'

const { toasts, remove } = useToast()

const toastClasses = {
  success: 'bg-white border-green-200 text-green-800',
  error: 'bg-white border-red-200 text-red-800',
  info: 'bg-white border-blue-200 text-blue-800',
}

const iconClasses = {
  success: 'fas fa-check-circle text-green-500',
  error: 'fas fa-exclamation-circle text-red-500',
  info: 'fas fa-info-circle text-blue-500',
}

const closeClasses = {
  success: 'hover:bg-green-50 text-green-600',
  error: 'hover:bg-red-50 text-red-600',
  info: 'hover:bg-blue-50 text-blue-600',
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(30px) scale(0.95);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(30px) scale(0.95);
}
</style>
