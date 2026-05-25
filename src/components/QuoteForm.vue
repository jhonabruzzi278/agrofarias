<template>
  <div class="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
    <div v-if="quote.items.length === 0" class="text-center py-12 text-gray-500">
      <i class="fas fa-shopping-basket text-5xl text-gray-300 block mb-4"></i>
      <p class="mb-6">No tienes productos en tu cotización.</p>
      <a href="/tienda" class="theme-btn btn-one inline-flex"><i class="fas fa-store" aria-hidden="true"></i> Ver productos</a>
    </div>

    <form v-else @submit.prevent="handleSubmit" novalidate>
      <div class="mb-6">
        <h3 class="text-lg font-bold">Tus productos ({{ quote.totalItems }} items)</h3>
      </div>

      <h3 class="text-lg font-bold mb-5">Tus datos</h3>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="input-label">Nombre completo *</label>
          <input
            v-model="form.nombre"
            type="text"
            required
            placeholder="Ej: Juan Pérez"
            class="input-field"
            :class="{ 'border-red-400 ring-2 ring-red-100': errors.nombre }"
            @input="errors.nombre = ''"
            maxlength="80"
          />
          <p v-if="errors.nombre" class="text-red-500 text-xs mt-1">{{ errors.nombre }}</p>
        </div>
        <div>
          <label class="input-label">Email *</label>
          <input
            v-model="form.email"
            type="email"
            required
            placeholder="Ej: juan@ejemplo.com"
            class="input-field"
            :class="{ 'border-red-400 ring-2 ring-red-100': errors.email }"
            @input="errors.email = ''"
          />
          <p v-if="errors.email" class="text-red-500 text-xs mt-1">{{ errors.email }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="input-label">Teléfono *</label>
          <input
            v-model="form.telefono"
            type="tel"
            required
            placeholder="+56912345678"
            class="input-field"
            :class="{ 'border-red-400 ring-2 ring-red-100': errors.telefono }"
            @input="errors.telefono = ''"
            maxlength="20"
          />
          <p v-if="errors.telefono" class="text-red-500 text-xs mt-1">{{ errors.telefono }}</p>
        </div>
        <div>
          <label class="input-label">Empresa</label>
          <input
            v-model="form.empresa"
            type="text"
            placeholder="Ej: Agrícola El Sol"
            class="input-field"
            :class="{ 'border-red-400 ring-2 ring-red-100': errors.empresa }"
            @input="errors.empresa = ''"
            maxlength="100"
          />
          <p v-if="errors.empresa" class="text-red-500 text-xs mt-1">{{ errors.empresa }}</p>
        </div>
      </div>

      <div class="mb-5">
        <label class="input-label">Mensaje adicional</label>
        <textarea
          v-model="form.mensaje"
          rows="3"
          placeholder="Cuéntanos sobre tu proyecto o necesidades..."
          class="input-field resize-none"
          :class="{ 'border-red-400 ring-2 ring-red-100': errors.mensaje }"
          @input="errors.mensaje = ''"
          maxlength="1000"
        ></textarea>
        <p v-if="errors.mensaje" class="text-red-500 text-xs mt-1">{{ errors.mensaje }}</p>
        <p class="text-xs text-gray-400 mt-1">{{ form.mensaje.length }}/1000</p>
      </div>

      <div v-if="errorMsg" class="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{{ errorMsg }}</div>
      <div v-if="successMsg" class="bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm mb-4">{{ successMsg }}</div>

      <button type="submit" :disabled="submitting" class="theme-btn btn-one w-full py-3.5 text-base justify-center disabled:opacity-60 disabled:cursor-not-allowed">
        <i class="fas fa-paper-plane" aria-hidden="true"></i>
        {{ submitting ? 'Enviando...' : 'Enviar solicitud de presupuesto' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useQuote } from '../stores/useQuote'
import { submitCotizacion } from '../lib/woocommerce'

const quote = useQuote()
const submitting = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const form = reactive({
  nombre: '',
  email: '',
  telefono: '',
  empresa: '',
  mensaje: '',
})

const errors = reactive({
  nombre: '',
  email: '',
  telefono: '',
  empresa: '',
  mensaje: '',
})

const NAME_PATTERN = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,80}$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_PATTERN = /^\+?[\d\s-]{7,15}$/
const EMPRESA_PATTERN = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s.,\-&]{0,100}$/

function validate(): boolean {
  let valid = true

  if (!form.nombre.trim()) {
    errors.nombre = 'El nombre es obligatorio.'
    valid = false
  } else if (!NAME_PATTERN.test(form.nombre.trim())) {
    errors.nombre = 'Solo letras y espacios (2-80 caracteres).'
    valid = false
  }

  if (!form.email.trim()) {
    errors.email = 'El email es obligatorio.'
    valid = false
  } else if (!EMAIL_PATTERN.test(form.email.trim())) {
    errors.email = 'Ingresa un email válido.'
    valid = false
  }

  if (!form.telefono.trim()) {
    errors.telefono = 'El teléfono es obligatorio.'
    valid = false
  } else if (!PHONE_PATTERN.test(form.telefono.trim())) {
    errors.telefono = 'Ingresa un teléfono válido (7-15 dígitos).'
    valid = false
  }

  if (form.empresa.trim() && !EMPRESA_PATTERN.test(form.empresa.trim())) {
    errors.empresa = 'Caracteres no permitidos en el nombre de empresa.'
    valid = false
  }

  if (form.mensaje.length > 1000) {
    errors.mensaje = 'Máximo 1000 caracteres.'
    valid = false
  }

  return valid
}

async function handleSubmit() {
  errorMsg.value = ''
  successMsg.value = ''
  Object.keys(errors).forEach(k => (errors as Record<string, string>)[k] = '')

  if (!validate()) return

  submitting.value = true
  const payload = {
    productos: quote.items.value.map(i => ({
      id: i.id,
      name: i.name,
      slug: i.slug,
      cantidad: i.cantidad,
      image: i.image,
    })),
    nombre: form.nombre.trim(),
    email: form.email.trim(),
    telefono: form.telefono.trim(),
    empresa: form.empresa.trim(),
    mensaje: form.mensaje.trim(),
  }

  try {
    const result = await submitCotizacion(payload)
    if (result.error) {
      errorMsg.value = result.error
    } else {
      successMsg.value = '¡Solicitud enviada con éxito! Te contactaremos pronto.'
      quote.clearQuote()
      form.nombre = ''
      form.email = ''
      form.telefono = ''
      form.empresa = ''
      form.mensaje = ''
    }
  } catch {
    errorMsg.value = 'Error al enviar la solicitud. Intenta nuevamente.'
  } finally {
    submitting.value = false
  }
}
</script>