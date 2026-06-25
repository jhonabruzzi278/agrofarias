<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-5">
    <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide">
      Cotización actual ({{ items.length }} producto{{ items.length !== 1 ? 's' : '' }})
    </h2>
    <div v-if="items.length === 0" class="text-center text-gray-400 py-10 text-sm">Buscá y agregá productos desde la izquierda.</div>
    <div v-else class="space-y-3">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-200 text-left text-gray-500 text-xs uppercase">
              <th class="pb-2 font-medium">Producto</th>
              <th class="pb-2 font-medium text-center w-20">Cant.</th>
              <th class="pb-2 font-medium text-right w-32">P. Unitario</th>
              <th class="pb-2 font-medium text-right w-32">Subtotal</th>
              <th class="pb-2 w-10"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in items" :key="item.d.id" class="border-b border-gray-100">
              <td class="py-2 flex items-center gap-2">
                <img :src="item.d.image" :alt="item.d.name" class="w-8 h-8 rounded object-cover bg-gray-100" loading="lazy" decoding="async" />
                <span class="truncate">{{ item.d.name }}</span>
              </td>
              <td class="py-2 text-center">
                <input
                  type="number"
                  :value="item.q"
                  @input="$emit('change-qty', i, Number(($event.target as HTMLInputElement).value))"
                  class="w-16 text-center px-2 py-1 border border-gray-300 rounded text-sm"
                  min="1"
                  max="999"
                />
              </td>
              <td class="py-2 text-right">
                <div class="relative inline-block">
                  <span class="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input
                    type="number"
                    :value="item.u"
                    @input="$emit('change-price', i, Number(($event.target as HTMLInputElement).value))"
                    class="w-28 text-right px-2 py-1 pl-5 border border-gray-300 rounded text-sm"
                    min="0"
                  />
                </div>
              </td>
              <td class="py-2 text-right font-medium text-gray-800">{{ fp(item.q * item.u) }}</td>
              <td class="py-2 text-center">
                <button @click="$emit('remove', i)" class="text-red-400 hover:text-red-600 transition text-lg leading-none cursor-pointer bg-transparent border-none" title="Eliminar">×</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pt-3 border-t border-gray-200 space-y-1">
        <div class="text-xs text-gray-400">{{ items.length }} prod · {{ tProd }} unid</div>
        <div class="flex justify-between text-sm text-gray-600"><span>Neto</span><span>{{ fp(total) }}</span></div>
        <div class="flex justify-between text-sm text-gray-600"><span>IVA (19%)</span><span>{{ fp(iva) }}</span></div>
        <div class="flex justify-between items-center pt-1 mt-1 border-t border-gray-100">
          <span class="text-sm font-semibold text-gray-700">Total</span>
          <span class="text-xl font-bold text-green-700">{{ fp(totalConIva) }}</span>
        </div>
      </div>
    </div>

    <!-- Datos del cliente -->
    <div class="border-t border-gray-200 pt-5 space-y-4">
      <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide">Datos del cliente</h2>
      <ClientPicker @select="onClientSelect" @create="$emit('create-client')" />
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Nombre *</label>
          <input v-model="cN" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" placeholder="Nombre completo" />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Email *</label>
          <input v-model="cE" type="email" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" placeholder="cliente@email.com" />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Teléfono *</label>
          <input v-model="cP" type="tel" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" placeholder="+569..." />
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Empresa</label>
          <input v-model="cC" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" placeholder="Nombre de la empresa (opcional)" />
        </div>
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">Mensaje</label>
        <textarea v-model="cM" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" rows="3" placeholder="Mensaje adicional (opcional)" maxlength="1000"></textarea>
      </div>
    </div>

    <!-- Enviar -->
    <div class="border-t border-gray-200 pt-5 space-y-3">
      <button @click="$emit('send')" :disabled="sending" class="w-full bg-green-700 hover:bg-green-800 disabled:bg-gray-400 text-white font-medium py-3 rounded-lg transition text-sm cursor-pointer border-none">
        <span v-if="sending">Enviando cotización...</span>
        <span v-else>Enviar cotización</span>
      </button>
      <div v-if="msg" :class="msg.ok ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-700 border-red-200'" class="p-4 rounded-lg text-sm border">{{ msg.text }}</div>
      <p class="text-xs text-gray-400 text-center">Se crea una orden en WooCommerce y se envía email al cliente con los precios.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { fp } from './formatters'
import ClientPicker from './ClientPicker.vue'
import type { QuoteLineItem, ClientOption } from './types'

defineProps<{
  items: QuoteLineItem[]
  total: number
  tProd: number
  iva: number
  totalConIva: number
  sending: boolean
  msg: { ok: boolean; text: string } | null
}>()

defineEmits<{
  (e: 'change-qty', index: number, value: number): void
  (e: 'change-price', index: number, value: number): void
  (e: 'remove', index: number): void
  (e: 'send'): void
  (e: 'create-client'): void
}>()

const cN = defineModel<string>('cN', { required: true })
const cE = defineModel<string>('cE', { required: true })
const cP = defineModel<string>('cP', { required: true })
const cC = defineModel<string>('cC', { required: true })
const cM = defineModel<string>('cM', { required: true })

// Al elegir un cliente registrado, autocompletamos nombre/email/teléfono.
// Los campos siguen siendo editables y la empresa queda manual (WC no la guarda).
function onClientSelect(c: ClientOption) {
  cN.value = `${c.first_name || ''} ${c.last_name || ''}`.trim()
  cE.value = c.email || ''
  cP.value = c.billing?.phone || ''
}
</script>
