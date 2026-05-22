import { ref } from 'vue'

interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
  duration: number
}

const toasts = ref<Toast[]>([])
let idCounter = 0

export function useToast() {
  function show(message: string, type: Toast['type'] = 'success', duration = 3000) {
    const id = ++idCounter
    toasts.value.push({ id, message, type, duration })
    setTimeout(() => remove(id), duration)
    return id
  }

  function remove(id: number) {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index !== -1) toasts.value.splice(index, 1)
  }

  return { toasts, show, remove }
}
