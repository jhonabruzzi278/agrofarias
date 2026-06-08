<script setup lang="ts">
import { ref, computed, watch } from 'vue';

interface SimpleProducto {
  id: number;
  name: string;
  slug: string;
  image: string;
}

interface QuoteLine {
  producto: SimpleProducto;
  cantidad: number;
  precioUnitario: number;
}

const props = defineProps<{
  productosJson: string;
}>();

function parseProductos(): SimpleProducto[] {
  try {
    return JSON.parse(props.productosJson);
  } catch {
    return [];
  }
}
const allProducts = ref<SimpleProducto[]>(parseProductos());

const searchTerm = ref('');
const quoteItems = ref<QuoteLine[]>([]);
const customerName = ref('');
const customerEmail = ref('');
const customerPhone = ref('');
const customerCompany = ref('');
const customerMessage = ref('');
const sending = ref(false);
const result = ref<{ ok: boolean; message: string } | null>(null);

const filteredProducts = computed(() => {
  if (!searchTerm.value.trim()) return [];
  const term = searchTerm.value.toLowerCase().trim();
  return allProducts.value.filter(p =>
    p.name.toLowerCase().includes(term)
  ).slice(0, 20);
});

const total = computed(() =>
  quoteItems.value.reduce((sum, item) => sum + item.cantidad * item.precioUnitario, 0)
);

const totalProducts = computed(() =>
  quoteItems.value.reduce((sum, item) => sum + item.cantidad, 0)
);

function hasProduct(id: number) {
  return quoteItems.value.some(i => i.producto.id === id);
}

function addProduct(producto: SimpleProducto) {
  if (hasProduct(producto.id)) return;
  quoteItems.value.push({ producto, cantidad: 1, precioUnitario: 0 });
  searchTerm.value = '';
}

function removeItem(index: number) {
  quoteItems.value.splice(index, 1);
}

function cantidadChange(index: number, val: number) {
  quoteItems.value[index].cantidad = Math.max(1, Math.min(999, Math.round(val)));
}

function precioChange(index: number, val: number) {
  quoteItems.value[index].precioUnitario = Math.max(0, Math.round(val));
}

function formatPrice(num: number): string {
  if (num === 0) return '$0';
  return '$' + num.toLocaleString('es-CL');
}

async function handleSubmit() {
  result.value = null;

  if (quoteItems.value.length === 0) {
    result.value = { ok: false, message: 'Agregá al menos un producto a la cotización.' };
    return;
  }
  if (!customerName.value.trim()) {
    result.value = { ok: false, message: 'Ingresá el nombre del cliente.' };
    return;
  }
  if (!customerEmail.value.trim()) {
    result.value = { ok: false, message: 'Ingresá el email del cliente.' };
    return;
  }
  if (!customerPhone.value.trim()) {
    result.value = { ok: false, message: 'Ingresá el teléfono del cliente.' };
    return;
  }

  sending.value = true;
  try {
    const res = await fetch('/api/cotizador-interno', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productos: quoteItems.value.map(item => ({
          id: item.producto.id,
          name: item.producto.name,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario,
        })),
        nombre: customerName.value.trim(),
        email: customerEmail.value.trim(),
        telefono: customerPhone.value.trim(),
        empresa: customerCompany.value.trim() || null,
        mensaje: customerMessage.value.trim() || null,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      result.value = { ok: true, message: 'Cotización enviada correctamente.' };
      quoteItems.value = [];
      customerName.value = '';
      customerEmail.value = '';
      customerPhone.value = '';
      customerCompany.value = '';
      customerMessage.value = '';
    } else {
      result.value = { ok: false, message: data.error || 'Error al enviar la cotización.' };
    }
  } catch {
    result.value = { ok: false, message: 'Error de conexión al enviar la cotización.' };
  } finally {
    sending.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen p-4 sm:p-6 lg:p-8">
    <div class="max-w-7xl mx-auto">
      <div class="flex items-center gap-3 mb-6">
        <span class="text-3xl">&#128221;</span>
        <h1 class="text-2xl font-bold text-gray-800">Cotizador Interno</h1>
        <span class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Admin</span>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <!-- LEFT: Product search -->
        <div class="lg:col-span-2 space-y-4">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Buscar producto</h2>
            <input
              v-model="searchTerm"
              type="text"
              placeholder="Escribí el nombre del producto..."
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-sm"
            />
            <div v-if="searchTerm.trim()" class="mt-1 text-xs text-gray-400">
              {{ filteredProducts.length }} resultado{{ filteredProducts.length !== 1 ? 's' : '' }}
            </div>
          </div>

          <div v-if="searchTerm.trim()" class="space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto">
            <div v-if="filteredProducts.length === 0" class="text-center text-gray-400 py-8 text-sm">
              No se encontraron productos.
            </div>
            <div
              v-for="p in filteredProducts"
              :key="p.id"
              class="flex items-center gap-3 bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow transition"
            >
              <img
                :src="p.image"
                :alt="p.name"
                class="w-12 h-12 rounded-lg object-cover bg-gray-100 shrink-0"
              />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-800 truncate">{{ p.name }}</p>
              </div>
              <button
                v-if="!hasProduct(p.id)"
                @click="addProduct(p)"
                class="shrink-0 bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition"
              >
                + Agregar
              </button>
              <span v-else class="shrink-0 text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg">
                Agregado
              </span>
            </div>
          </div>
        </div>

        <!-- RIGHT: Quote builder -->
        <div class="lg:col-span-3">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-5">
            <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Cotización actual ({{ quoteItems.length }} producto{{ quoteItems.length !== 1 ? 's' : '' }})
            </h2>

            <div v-if="quoteItems.length === 0" class="text-center text-gray-400 py-10 text-sm">
              Buscá y agregá productos desde la izquierda.
            </div>

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
                    <tr
                      v-for="(item, i) in quoteItems"
                      :key="item.producto.id"
                      class="border-b border-gray-100"
                    >
                      <td class="py-2 flex items-center gap-2">
                        <img
                          :src="item.producto.image"
                          :alt="item.producto.name"
                          class="w-8 h-8 rounded object-cover bg-gray-100"
                        />
                        <span class="truncate">{{ item.producto.name }}</span>
                      </td>
                      <td class="py-2 text-center">
                        <input
                          type="number"
                          :value="item.cantidad"
                          @input="cantidadChange(i, Number(($event.target as HTMLInputElement).value))"
                          class="w-16 text-center px-2 py-1 border border-gray-300 rounded text-sm"
                          min="1"
                          max="999"
                        />
                      </td>
                      <td class="py-2 text-right">
                        <div class="relative">
                          <span class="absolute inset-y-0 left-2 flex items-center text-gray-400 text-sm">$</span>
                          <input
                            type="number"
                            :value="item.precioUnitario"
                            @input="precioChange(i, Number(($event.target as HTMLInputElement).value))"
                            class="w-28 text-right px-2 py-1 pl-5 border border-gray-300 rounded text-sm"
                            min="0"
                          />
                        </div>
                      </td>
                      <td class="py-2 text-right font-medium text-gray-800">
                        {{ formatPrice(item.cantidad * item.precioUnitario) }}
                      </td>
                      <td class="py-2 text-center">
                        <button
                          @click="removeItem(i)"
                          class="text-red-400 hover:text-red-600 transition text-lg leading-none"
                          title="Eliminar"
                        >
                          &times;
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="flex justify-between items-center pt-3 border-t border-gray-200">
                <div class="text-sm text-gray-500">
                  {{ quoteItems.length }} producto{{ quoteItems.length !== 1 ? 's' : '' }} &middot;
                  {{ totalProducts }} unidad{{ totalProducts !== 1 ? 'es' : '' }}
                </div>
                <div class="text-xl font-bold text-green-700">
                  {{ formatPrice(total) }}
                </div>
              </div>
            </div>

            <!-- Customer form -->
            <div class="border-t border-gray-200 pt-5 space-y-4">
              <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide">Datos del cliente</h2>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">Nombre *</label>
                  <input
                    v-model="customerName"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    placeholder="Nombre completo"
                  />
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">Email *</label>
                  <input
                    v-model="customerEmail"
                    type="email"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    placeholder="cliente@email.com"
                  />
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">Teléfono *</label>
                  <input
                    v-model="customerPhone"
                    type="tel"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    placeholder="+569..."
                  />
                </div>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">Empresa</label>
                  <input
                    v-model="customerCompany"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    placeholder="Nombre de la empresa (opcional)"
                  />
                </div>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Mensaje</label>
                <textarea
                  v-model="customerMessage"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  rows="3"
                  placeholder="Mensaje adicional (opcional)"
                  maxlength="1000"
                ></textarea>
              </div>
            </div>

            <!-- Actions -->
            <div class="border-t border-gray-200 pt-5 space-y-3">
              <button
                @click="handleSubmit"
                :disabled="sending"
                class="w-full bg-green-700 hover:bg-green-800 disabled:bg-gray-400 text-white font-medium py-3 rounded-lg transition text-sm"
              >
                <span v-if="sending">Enviando cotización...</span>
                <span v-else>Enviar cotización</span>
              </button>

              <div
                v-if="result"
                :class="['p-4 rounded-lg text-sm', result.ok ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200']"
              >
                {{ result.message }}
              </div>

              <p class="text-xs text-gray-400 text-center">
                Se enviará un email al cliente y se creará una orden en WooCommerce con los precios asignados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
