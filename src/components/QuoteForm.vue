<template>
  <div class="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
    <div v-if="quote.items.length === 0" class="text-center py-12 text-gray-500">
      <i class="fas fa-shopping-basket text-5xl text-gray-300 block mb-4"></i>
      <p class="mb-6">No tienes productos en tu cotización.</p>
      <a href="/tienda" class="theme-btn btn-one inline-flex"><i class="fas fa-store" aria-hidden="true"></i> Ver productos</a>
    </div>

    <form v-else @submit.prevent="handleSubmit">
      <div class="mb-6">
        <h3 class="text-lg font-bold">Tus productos ({{ quote.totalItems }} items)</h3>
      </div>

      <h3 class="text-lg font-bold mb-5">Tus datos</h3>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="input-label">Nombre completo *</label>
          <input v-model="form.nombre" type="text" required placeholder="Ej: Juan Pérez" class="input-field" />
        </div>
        <div>
          <label class="input-label">Email *</label>
          <input v-model="form.email" type="email" required placeholder="Ej: juan@ejemplo.com" class="input-field" />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="input-label">Teléfono *</label>
          <input v-model="form.telefono" type="tel" required placeholder="+56912345678" class="input-field" />
        </div>
        <div>
          <label class="input-label">Empresa</label>
          <input v-model="form.empresa" type="text" placeholder="Ej: Agrícola El Sol" class="input-field" />
        </div>
      </div>

      <div class="mb-5">
        <label class="input-label">Mensaje adicional</label>
        <textarea v-model="form.mensaje" rows="3" placeholder="Cuéntanos sobre tu proyecto o necesidades..." class="input-field resize-none"></textarea>
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

async function handleSubmit() {
  errorMsg.value = ''
  successMsg.value = ''

  if (!form.nombre || !form.email || !form.telefono) {
    errorMsg.value = 'Por favor completa los campos obligatorios.'
    return
  }

  submitting.value = true
  const payload = {
    productos: quote.items.value.map(i => ({
      id: i.id,
      name: i.name,
      slug: i.slug,
      cantidad: i.cantidad,
      image: i.image,
    })),
    nombre: form.nombre,
    email: form.email,
    telefono: form.telefono,
    empresa: form.empresa,
    mensaje: form.mensaje,
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