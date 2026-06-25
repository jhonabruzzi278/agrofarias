<template>
  <div class="space-y-5">
    <!-- Toolbar -->
    <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
      <div class="relative flex-1 max-w-sm">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
        <input v-model="search" type="text" placeholder="Buscar por nombre, email..." class="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" />
      </div>
      <button @click="openCreate" class="shrink-0 bg-green-700 hover:bg-green-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition cursor-pointer border-none flex items-center gap-2">
        + Nuevo Cliente
      </button>
    </div>

    <!-- Stats -->
    <p class="text-xs text-gray-400">{{ total }} cliente{{ total !== 1 ? 's' : '' }} en total</p>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-16 text-gray-400 text-sm">Cargando clientes...</div>

    <!-- Empty -->
    <div v-else-if="customers.length === 0" class="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400 text-sm">
      No se encontraron clientes.
    </div>

    <!-- Table -->
    <div v-else class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200 text-left text-xs text-gray-500 uppercase tracking-wide">
              <th class="px-4 py-3 font-medium">Nombre</th>
              <th class="px-4 py-3 font-medium">Email</th>
              <th class="px-4 py-3 font-medium hidden md:table-cell">Teléfono</th>
              <th class="px-4 py-3 font-medium text-center hidden sm:table-cell">Pedidos</th>
              <th class="px-4 py-3 font-medium text-right hidden sm:table-cell">Total gastado</th>
              <th class="px-4 py-3 font-medium hidden lg:table-cell">Registrado</th>
              <th class="px-4 py-3 font-medium w-24 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="c in customers" :key="c.id" class="hover:bg-gray-50 transition">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <img v-if="c.avatar_url" :src="c.avatar_url" :alt="c.first_name" class="w-8 h-8 rounded-full object-cover bg-gray-100 shrink-0" />
                  <div v-else class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xs font-bold shrink-0">
                    {{ initials(c) }}
                  </div>
                  <div>
                    <p class="font-medium text-gray-800">{{ c.first_name }} {{ c.last_name }}</p>
                    <p class="text-xs text-gray-400">@{{ c.username }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 text-gray-600 text-xs">{{ c.email }}</td>
              <td class="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">{{ c.billing?.phone || '—' }}</td>
              <td class="px-4 py-3 text-center hidden sm:table-cell">
                <span class="text-gray-800 font-medium">{{ c.orders_count }}</span>
              </td>
              <td class="px-4 py-3 text-right hidden sm:table-cell">
                <span class="font-medium text-green-700">{{ fp(c.total_spent) }}</span>
              </td>
              <td class="px-4 py-3 text-xs text-gray-400 hidden lg:table-cell">{{ fd(c.date_created) }}</td>
              <td class="px-4 py-3 text-center">
                <div class="flex items-center justify-center gap-1">
                  <button @click="openDetail(c)" title="Ver detalle" class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer border-none bg-transparent">👁️</button>
                  <button v-if="deletingId !== c.id" @click="deletingId = c.id" title="Eliminar" class="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition cursor-pointer border-none bg-transparent">🗑️</button>
                  <template v-else>
                    <button @click="confirmDelete(c.id)" class="text-xs px-2 py-1 bg-red-600 text-white rounded-lg cursor-pointer border-none hover:bg-red-700">Sí</button>
                    <button @click="deletingId = null" class="text-xs px-2 py-1 bg-gray-200 text-gray-600 rounded-lg cursor-pointer border-none hover:bg-gray-300">No</button>
                  </template>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
        <div class="flex items-center gap-2">
          <span class="text-xs text-gray-500">Filas:</span>
          <select v-model="perPage" class="text-xs px-2 py-1 border border-gray-300 rounded bg-white outline-none">
            <option :value="20">20</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs text-gray-500">Página {{ page }} de {{ totalPages }}</span>
          <button @click="page--" :disabled="page <= 1" class="px-2 py-1 text-xs border border-gray-300 rounded bg-white hover:bg-gray-100 disabled:opacity-40 cursor-pointer">‹</button>
          <button @click="page++" :disabled="page >= totalPages" class="px-2 py-1 text-xs border border-gray-300 rounded bg-white hover:bg-gray-100 disabled:opacity-40 cursor-pointer">›</button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div v-if="toast" :class="toast.ok ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-700'" class="fixed bottom-6 right-6 border px-4 py-3 rounded-xl text-sm shadow-lg z-50 max-w-sm">
      {{ toast.text }}
    </div>

    <!-- Create Modal -->
    <div v-if="showModal === 'create'" class="fixed inset-0 z-40 flex items-start justify-center pt-10 px-4">
      <div class="absolute inset-0 bg-black/40" @click="closeModal"></div>
      <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto z-10">
        <div class="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-800">Nuevo Cliente</h2>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600 text-xl cursor-pointer border-none bg-transparent leading-none">×</button>
        </div>
        <form @submit.prevent="saveCustomer" class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Nombre *</label>
              <input v-model="form.first_name" required class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Apellido *</label>
              <input v-model="form.last_name" required class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" />
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Email *</label>
            <input v-model="form.email" type="email" required class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Usuario *</label>
            <input v-model="form.username" required class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" placeholder="sin espacios" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Contraseña * (mín. 8 caracteres)</label>
            <input v-model="form.password" type="password" required minlength="8" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" />
          </div>
          <div class="border-t border-gray-100 pt-3">
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Información de contacto</p>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Teléfono</label>
                <input v-model="form.phone" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" placeholder="+569..." />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Ciudad</label>
                <input v-model="form.city" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" />
              </div>
              <div class="col-span-2">
                <label class="block text-xs font-medium text-gray-600 mb-1">Dirección</label>
                <input v-model="form.address_1" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" />
              </div>
            </div>
          </div>
          <div class="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" @click="closeModal" class="px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition cursor-pointer">Cancelar</button>
            <button type="submit" :disabled="saving" class="px-6 py-2 text-sm bg-green-700 hover:bg-green-800 disabled:bg-gray-400 text-white font-medium rounded-lg transition cursor-pointer border-none">
              {{ saving ? 'Creando...' : 'Crear cliente' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Detail Panel -->
    <div v-if="showModal === 'detail' && selectedCustomer" class="fixed inset-0 z-40 flex justify-end">
      <div class="absolute inset-0 bg-black/40" @click="closeModal"></div>
      <div class="relative bg-white w-full max-w-lg h-full overflow-y-auto shadow-2xl z-10 flex flex-col">
        <div class="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-800">Detalle del cliente</h2>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600 text-xl cursor-pointer border-none bg-transparent leading-none">×</button>
        </div>

        <div class="p-6 space-y-6 flex-1">
          <!-- Profile card -->
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-2xl font-bold shrink-0">
              {{ initials(selectedCustomer) }}
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-800">{{ selectedCustomer.first_name }} {{ selectedCustomer.last_name }}</h3>
              <p class="text-sm text-gray-500">{{ selectedCustomer.email }}</p>
              <p v-if="selectedCustomer.billing?.phone" class="text-sm text-gray-500">{{ selectedCustomer.billing.phone }}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="bg-gray-50 rounded-xl p-3">
              <p class="text-xs text-gray-400 uppercase">Pedidos</p>
              <p class="text-xl font-bold text-gray-800 mt-1">{{ selectedCustomer.orders_count }}</p>
            </div>
            <div class="bg-gray-50 rounded-xl p-3">
              <p class="text-xs text-gray-400 uppercase">Total gastado</p>
              <p class="text-xl font-bold text-green-700 mt-1">{{ fp(selectedCustomer.total_spent) }}</p>
            </div>
          </div>

          <div v-if="selectedCustomer.billing?.address_1 || selectedCustomer.billing?.city" class="text-sm text-gray-500 space-y-1">
            <p class="text-xs font-semibold text-gray-400 uppercase">Dirección</p>
            <p v-if="selectedCustomer.billing.address_1">{{ selectedCustomer.billing.address_1 }}</p>
            <p v-if="selectedCustomer.billing.city">{{ selectedCustomer.billing.city }}, Chile</p>
          </div>

          <!-- Order history -->
          <div>
            <p class="text-xs font-semibold text-gray-400 uppercase mb-3">Historial de pedidos</p>
            <div v-if="loadingDetail" class="text-center py-6 text-gray-400 text-sm">Cargando pedidos...</div>
            <div v-else-if="customerOrders.length === 0" class="text-center py-6 text-gray-400 text-sm">Sin pedidos todavía.</div>
            <div v-else class="space-y-2">
              <div v-for="o in customerOrders" :key="o.id" class="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p class="text-sm font-medium text-gray-800">#{{ o.number }}</p>
                  <p class="text-xs text-gray-400">{{ fd(String(o.date_created)) }}</p>
                </div>
                <div class="text-right">
                  <span :class="statusClass(String(o.status))" class="px-2 py-0.5 rounded-full text-xs font-medium">{{ statusLabel(String(o.status)) }}</span>
                  <p class="text-sm font-bold text-gray-800 mt-1">{{ fp(String(o.total)) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const props = defineProps<{ autoCreate?: boolean }>()
const emit = defineEmits<{ (e: 'unauthorized'): void; (e: 'create-consumed'): void }>()

const H = { 'Content-Type': 'application/json' }

interface Customer {
  id: number
  first_name: string
  last_name: string
  email: string
  username: string
  date_created: string
  orders_count: number
  total_spent: string
  avatar_url: string
  billing: { phone: string; address_1: string; city: string; state: string; country: string }
}

interface Order {
  id: number
  number: number
  status: string
  date_created: string
  total: string
}

const customers = ref<Customer[]>([])
const loading = ref(false)
const page = ref(1)
const totalPages = ref(1)
const total = ref(0)
const perPage = ref(20)
const search = ref('')
const deletingId = ref<number | null>(null)
const saving = ref(false)
const toast = ref<{ ok: boolean; text: string } | null>(null)

const showModal = ref<'create' | 'detail' | null>(null)
const selectedCustomer = ref<Customer | null>(null)
const customerOrders = ref<Order[]>([])
const loadingDetail = ref(false)

const form = ref({
  first_name: '', last_name: '', email: '', username: '', password: '',
  phone: '', city: '', address_1: '',
})

let debounceTimer: ReturnType<typeof setTimeout> | null = null

function showToast(ok: boolean, text: string) {
  toast.value = { ok, text }
  setTimeout(() => { toast.value = null }, 3500)
}

async function loadCustomers() {
  loading.value = true
  try {
    const params = new URLSearchParams({ page: String(page.value), per_page: String(perPage.value) })
    if (search.value.trim()) params.set('search', search.value.trim())
    const r = await fetch(`/api/admin/clientes?${params}`, { headers: H })
    if (r.status === 401) { emit('unauthorized'); return }
    if (r.ok) {
      const data = await r.json()
      customers.value = data.customers
      totalPages.value = data.totalPages
      total.value = data.total
    }
  } catch {} finally { loading.value = false }
}

onMounted(() => {
  loadCustomers()
  // Si entramos al tab por el atajo "Nuevo cliente" del cotizador, abrimos el
  // modal de creación una sola vez y avisamos para que el padre resetee el flag.
  if (props.autoCreate) {
    openCreate()
    emit('create-consumed')
  }
})
watch([page, perPage], () => loadCustomers())
watch(search, () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => { page.value = 1; loadCustomers() }, 400)
})

function openCreate() {
  form.value = { first_name: '', last_name: '', email: '', username: '', password: '', phone: '', city: '', address_1: '' }
  showModal.value = 'create'
}

async function openDetail(c: Customer) {
  selectedCustomer.value = c
  showModal.value = 'detail'
  customerOrders.value = []
  loadingDetail.value = true
  try {
    const r = await fetch(`/api/admin/clientes/${c.id}`, { headers: H })
    if (r.status === 401) { emit('unauthorized'); return }
    if (r.ok) {
      const data = await r.json()
      customerOrders.value = data.orders || []
      selectedCustomer.value = data.customer
    }
  } catch {} finally { loadingDetail.value = false }
}

function closeModal() { showModal.value = null; selectedCustomer.value = null }

async function saveCustomer() {
  saving.value = true
  try {
    const payload = {
      first_name: form.value.first_name.trim(),
      last_name: form.value.last_name.trim(),
      email: form.value.email.trim(),
      username: form.value.username.trim(),
      password: form.value.password,
      billing: {
        phone: form.value.phone,
        city: form.value.city,
        address_1: form.value.address_1,
        country: 'CL',
      },
    }
    const r = await fetch('/api/admin/clientes', { method: 'POST', headers: H, body: JSON.stringify(payload) })
    if (r.status === 401) { emit('unauthorized'); return }
    const data = await r.json()
    if (r.ok) {
      showToast(true, 'Cliente creado correctamente')
      closeModal()
      await loadCustomers()
    } else {
      showToast(false, data.error || 'Error al crear cliente')
    }
  } catch {
    showToast(false, 'Error de conexión')
  } finally {
    saving.value = false
  }
}

async function confirmDelete(id: number) {
  try {
    const r = await fetch(`/api/admin/clientes/${id}`, { method: 'DELETE', headers: H })
    if (r.status === 401) { emit('unauthorized'); return }
    if (r.ok) {
      showToast(true, 'Cliente eliminado')
      deletingId.value = null
      await loadCustomers()
    } else {
      const d = await r.json()
      showToast(false, d.error || 'Error al eliminar')
      deletingId.value = null
    }
  } catch {
    showToast(false, 'Error de conexión')
    deletingId.value = null
  }
}

const fp = (v: string | number) => {
  const n = Number(v)
  return isNaN(n) ? '$—' : '$' + n.toLocaleString('es-CL', { minimumFractionDigits: 0 })
}
const fd = (d: string) => new Date(d).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' })
const initials = (c: Customer) => `${c.first_name?.[0] || ''}${c.last_name?.[0] || ''}`.toUpperCase()

function statusClass(s: string) {
  return ({ processing: 'bg-blue-100 text-blue-700', completed: 'bg-green-100 text-green-700', pending: 'bg-yellow-100 text-yellow-700', 'on-hold': 'bg-orange-100 text-orange-700', cancelled: 'bg-red-100 text-red-700' } as Record<string, string>)[s] || 'bg-gray-100 text-gray-600'
}

function statusLabel(s: string) {
  return ({ processing: 'Procesando', completed: 'Completado', pending: 'Pendiente', 'on-hold': 'En espera', cancelled: 'Cancelado' } as Record<string, string>)[s] || s
}
</script>
