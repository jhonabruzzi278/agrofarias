<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="w-full max-w-sm">
      <div class="bg-white rounded-xl shadow-lg p-8">
        <div class="text-center mb-6">
          <div class="text-4xl mb-3">🔒</div>
          <h1 class="text-xl font-bold text-gray-800">Panel Admin</h1>
          <p class="text-sm text-gray-500 mt-1">Agro Farías</p>
        </div>
        <label class="block text-sm font-medium text-gray-600 mb-1">Contraseña</label>
        <input
          :value="password"
          @input="$emit('update:password', ($event.target as HTMLInputElement).value)"
          type="password"
          autofocus
          @keydown.enter="$emit('login')"
          class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-sm"
          placeholder="Ingresá la contraseña"
        />
        <button
          @click="$emit('login')"
          :disabled="loggingIn"
          class="w-full mt-4 bg-green-700 hover:bg-green-800 disabled:bg-gray-400 text-white font-medium py-2.5 rounded-lg transition cursor-pointer border-none"
        >
          {{ loggingIn ? 'Ingresando...' : 'Ingresar' }}
        </button>
        <p v-if="loginError" class="text-red-600 text-sm text-center mt-4">{{ loginError }}</p>
        <div class="text-center mt-5 pt-4 border-t border-gray-100">
          <a href="/tienda" class="text-sm text-gray-400 hover:text-green-700 transition-colors">
            ← Ir a la tienda
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  password: string
  loggingIn: boolean
  loginError: string
}>()

defineEmits<{
  (e: 'update:password', value: string): void
  (e: 'login'): void
}>()
</script>
