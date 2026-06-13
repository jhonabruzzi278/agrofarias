<template>
  <!-- Mientras se comprueba la sesión -->
  <div v-if="checking" class="min-h-screen flex items-center justify-center">
    <p class="text-gray-400 text-sm">Cargando...</p>
  </div>

  <!-- LOGIN -->
  <div v-else-if="!authed" class="min-h-screen flex items-center justify-center px-4">
    <div class="w-full max-w-sm">
      <div class="bg-white rounded-xl shadow-lg p-8">
        <div class="text-center mb-6">
          <div class="text-4xl mb-3">🔒</div>
          <h1 class="text-xl font-bold text-gray-800">Cotizador Interno</h1>
          <p class="text-sm text-gray-500 mt-1">Agro Farías</p>
        </div>
        <label class="block text-sm font-medium text-gray-600 mb-1">Contraseña</label>
        <input
          v-model="password"
          type="password"
          autofocus
          @keydown.enter="login"
          class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-sm"
          placeholder="Ingresá la contraseña"
        />
        <button
          @click="login"
          :disabled="loggingIn"
          class="w-full mt-4 bg-green-700 hover:bg-green-800 disabled:bg-gray-400 text-white font-medium py-2.5 rounded-lg transition cursor-pointer border-none"
        >
          {{ loggingIn ? 'Ingresando...' : 'Ingresar' }}
        </button>
        <p v-if="loginError" class="text-red-600 text-sm text-center mt-4">{{ loginError }}</p>
      </div>
    </div>
  </div>

  <!-- PANEL -->
  <div v-else>
    <div class="fixed top-0 left-0 right-0 bg-green-700 text-white text-xs px-4 py-2 flex items-center justify-between z-10">
      <span>Cotizador Interno — Agro Farías</span>
      <button @click="logout" class="text-white/80 hover:text-white underline cursor-pointer bg-transparent border-none text-xs">Salir</button>
    </div>

    <div class="pt-10">
      <div class="min-h-screen p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div class="flex items-center gap-3 mb-6">
          <span class="text-3xl">📝</span>
          <h1 class="text-2xl font-bold text-gray-800">Cotizador Interno</h1>
          <span class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Admin</span>
        </div>
        <div class="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
          <button @click="tab='nueva'" :class="tab==='nueva'?'bg-white shadow-sm text-gray-800':'text-gray-500'" class="px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer border-none">Nueva cotización</button>
          <button @click="tab='recibidas';refreshQ()" :class="tab==='recibidas'?'bg-white shadow-sm text-gray-800':'text-gray-500'" class="px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer border-none">Cotizaciones recibidas <span class="text-xs text-gray-400 ml-1">{{ allQ.length }}</span></button>
        </div>

        <div v-show="tab==='nueva'" class="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <!-- LEFT: Search -->
          <div class="lg:col-span-2 space-y-4">
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Buscar producto</h2>
              <input v-model="search" type="text" placeholder="Escribí el nombre del producto..." class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-sm" />
              <div v-if="search.trim()" class="mt-1 text-xs text-gray-400">{{ searching ? 'Buscando...' : searchResults.length + ' resultado' + (searchResults.length !== 1 ? 's' : '') }}</div>
            </div>
            <div v-if="search.trim() && !searching" class="space-y-2 overflow-y-auto max-h-[calc(100vh-320px)]">
              <div v-if="searchResults.length === 0" class="text-center text-gray-400 py-10 text-sm">No se encontraron productos.</div>
              <div v-for="p in searchResults" :key="p.id" class="flex items-center gap-3 bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow transition cursor-pointer">
                <img :src="p.image" :alt="p.name" class="w-12 h-12 rounded-lg object-cover bg-gray-100 shrink-0" loading="lazy" decoding="async" />
                <div class="flex-1 min-w-0"><p class="text-sm font-medium text-gray-800 truncate">{{ p.name }}</p></div>
                <button v-if="!hp(p.id)" @click="ap(p)" class="shrink-0 bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition cursor-pointer border-none">+ Agregar</button>
                <span v-else class="shrink-0 text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg">Agregado</span>
              </div>
            </div>
          </div>
          <!-- RIGHT: Quote builder -->
          <div class="lg:col-span-3">
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-5">
              <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide">Cotización actual ({{ items.length }} producto{{ items.length !== 1 ? 's' : '' }})</h2>
              <div v-if="items.length === 0" class="text-center text-gray-400 py-10 text-sm">Buscá y agregá productos desde la izquierda.</div>
              <div v-else class="space-y-3">
                <div class="overflow-x-auto">
                  <table class="w-full text-sm">
                    <thead><tr class="border-b border-gray-200 text-left text-gray-500 text-xs uppercase"><th class="pb-2 font-medium">Producto</th><th class="pb-2 font-medium text-center w-20">Cant.</th><th class="pb-2 font-medium text-right w-32">P. Unitario</th><th class="pb-2 font-medium text-right w-32">Subtotal</th><th class="pb-2 w-10"></th></tr></thead>
                    <tbody>
                      <tr v-for="(item,i) in items" :key="item.d.id" class="border-b border-gray-100">
                        <td class="py-2 flex items-center gap-2"><img :src="item.d.image" :alt="item.d.name" class="w-8 h-8 rounded object-cover bg-gray-100" loading="lazy" decoding="async" /><span class="truncate">{{ item.d.name }}</span></td>
                        <td class="py-2 text-center"><input type="number" :value="item.q" @input="cq(i, Number($event.target.value))" class="w-16 text-center px-2 py-1 border border-gray-300 rounded text-sm" min="1" max="999" /></td>
                        <td class="py-2 text-right"><div class="relative inline-block"><span class="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span><input type="number" :value="item.u" @input="cu(i, Number($event.target.value))" class="w-28 text-right px-2 py-1 pl-5 border border-gray-300 rounded text-sm" min="0" /></div></td>
                        <td class="py-2 text-right font-medium text-gray-800">{{ fp(item.q * item.u) }}</td>
                        <td class="py-2 text-center"><button @click="ri(i)" class="text-red-400 hover:text-red-600 transition text-lg leading-none cursor-pointer bg-transparent border-none" title="Eliminar">×</button></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div class="pt-3 border-t border-gray-200 space-y-1">
                  <div class="text-xs text-gray-400">{{ items.length }} prod · {{ tProd }} unid</div>
                  <div class="flex justify-between text-sm text-gray-600"><span>Neto</span><span>{{ fp(total) }}</span></div>
                  <div class="flex justify-between text-sm text-gray-600"><span>IVA (19%)</span><span>{{ fp(iva) }}</span></div>
                  <div class="flex justify-between items-center pt-1 mt-1 border-t border-gray-100"><span class="text-sm font-semibold text-gray-700">Total</span><span class="text-xl font-bold text-green-700">{{ fp(totalConIva) }}</span></div>
                </div>
              </div>
              <!-- Customer form -->
              <div class="border-t border-gray-200 pt-5 space-y-4">
                <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide">Datos del cliente</h2>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div><label class="block text-xs font-medium text-gray-600 mb-1">Nombre *</label><input v-model="cN" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" placeholder="Nombre completo" /></div>
                  <div><label class="block text-xs font-medium text-gray-600 mb-1">Email *</label><input v-model="cE" type="email" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" placeholder="cliente@email.com" /></div>
                  <div><label class="block text-xs font-medium text-gray-600 mb-1">Teléfono *</label><input v-model="cP" type="tel" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" placeholder="+569..." /></div>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><label class="block text-xs font-medium text-gray-600 mb-1">Empresa</label><input v-model="cC" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" placeholder="Nombre de la empresa (opcional)" /></div>
                </div>
                <div><label class="block text-xs font-medium text-gray-600 mb-1">Mensaje</label><textarea v-model="cM" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" rows="3" placeholder="Mensaje adicional (opcional)" maxlength="1000"></textarea></div>
              </div>
              <!-- Send button -->
              <div class="border-t border-gray-200 pt-5 space-y-3">
                <button @click="send" :disabled="sending" class="w-full bg-green-700 hover:bg-green-800 disabled:bg-gray-400 text-white font-medium py-3 rounded-lg transition text-sm cursor-pointer border-none">
                  <span v-if="sending">Enviando cotización...</span>
                  <span v-else>Enviar cotización</span>
                </button>
                <div v-if="msg" :class="msg.ok ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-700 border-red-200'" class="p-4 rounded-lg text-sm border">{{ msg.text }}</div>
                <p class="text-xs text-gray-400 text-center">Se crea una orden en WooCommerce y se envía email al cliente con los precios.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- RECEIVED QUOTES TAB -->
        <div v-show="tab==='recibidas'" class="space-y-5">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-700">Cotizaciones recibidas</h2>
            <button @click="refreshQ" :disabled="lQ" class="text-sm bg-white border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5">
              <span :class="lQ && 'animate-spin'">↻</span> {{ lQ ? 'Actualizando...' : 'Actualizar' }}
            </button>
          </div>

          <div v-if="allQ.length === 0 && !lQ" class="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400 text-sm">No hay cotizaciones todavía.</div>

          <template v-else>
            <!-- MÉTRICAS -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div class="bg-white rounded-xl border border-gray-200 p-4">
                <p class="text-xs text-gray-400 uppercase tracking-wide">Cotizaciones</p>
                <p class="text-2xl font-bold text-gray-800 mt-1">{{ mTotal }}</p>
              </div>
              <div class="bg-white rounded-xl border border-gray-200 p-4">
                <p class="text-xs text-gray-400 uppercase tracking-wide">Valor total</p>
                <p class="text-2xl font-bold text-green-700 mt-1">{{ fp(mValor) }}</p>
              </div>
              <div class="bg-white rounded-xl border border-gray-200 p-4">
                <p class="text-xs text-gray-400 uppercase tracking-wide">Ticket promedio</p>
                <p class="text-2xl font-bold text-gray-800 mt-1">{{ fp(mPromedio) }}</p>
              </div>
              <div class="bg-white rounded-xl border border-gray-200 p-4">
                <p class="text-xs text-gray-400 uppercase tracking-wide">Productos</p>
                <p class="text-2xl font-bold text-gray-800 mt-1">{{ mProductos }}</p>
              </div>
            </div>

            <!-- FILTROS -->
            <div class="flex flex-col sm:flex-row gap-3">
              <div class="relative flex-1">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                <input v-model="qSearch" type="text" placeholder="Buscar por cliente, email, empresa o #..." class="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" />
              </div>
              <select v-model="qStatus" class="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none">
                <option value="">Todos los estados ({{ allQ.length }})</option>
                <option v-for="s in availableStatuses" :key="s" :value="s">{{ sl(s) }} ({{ statusCounts[s] }})</option>
              </select>
            </div>

            <!-- LISTA -->
            <div v-if="filteredQuotes.length === 0" class="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400 text-sm">Ninguna cotización coincide con el filtro.</div>
            <div v-else class="space-y-4">
              <div v-for="q in filteredQuotes" :key="q.id" class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition">
                <div class="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
                  <div class="flex items-center gap-3 flex-wrap">
                    <span class="font-bold text-gray-800 text-sm">#{{ q.number }}</span>
                    <span :class="statusClass(q.internalStatus)" class="px-2 py-0.5 rounded-full text-xs font-medium">{{ sl(q.internalStatus) }}</span>
                    <span class="text-xs text-gray-400">{{ fd(q.date_created) }}</span>
                  </div>
                  <div class="text-right">
                    <span class="text-lg font-bold text-green-700">{{ fp(totalConIvaOf(q.total)) }}</span>
                    <p class="text-[10px] text-gray-400">Neto {{ fp(Number(q.total)) }} + IVA {{ fp(ivaOf(q.total)) }}</p>
                  </div>
                </div>
                <div class="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p class="text-xs text-gray-400 uppercase mb-1">Cliente</p>
                    <p class="text-sm font-medium text-gray-800">{{ q.customer.name || '-' }}</p>
                    <p class="text-xs text-gray-500 break-all">{{ q.customer.email }}</p>
                    <p class="text-xs text-gray-500">{{ q.customer.phone }}</p>
                    <p v-if="q.customer.company" class="text-xs text-gray-400">{{ q.customer.company }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-400 uppercase mb-1">Productos</p>
                    <ul class="space-y-1">
                      <li v-for="(p, pi) in q.products" :key="pi" class="text-sm text-gray-700 flex justify-between gap-2">
                        <span class="truncate">{{ p.quantity }}x {{ p.name }}</span>
                        <span class="text-gray-500 shrink-0">{{ fp(Number(p.total)) }}</span>
                      </li>
                    </ul>
                  </div>
                  <div v-if="q.message">
                    <p class="text-xs text-gray-400 uppercase mb-1">Mensaje</p>
                    <p class="text-xs text-gray-500 leading-relaxed line-clamp-3">{{ q.message }}</p>
                  </div>
                </div>
                <!-- ACCIONES RÁPIDAS -->
                <div class="flex flex-wrap items-center gap-2 px-4 pb-4">
                  <a v-if="waLink(q)" :href="waLink(q)" target="_blank" rel="noopener noreferrer"
                    class="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition no-underline">
                    💬 WhatsApp
                  </a>
                  <button v-if="q.customer.email" @click="copyEmail(q)"
                    class="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition cursor-pointer border-none">
                    {{ copiedId === q.id ? '✓ Copiado' : '✉ Copiar email' }}
                  </button>
                  <a v-if="q.editUrl" :href="q.editUrl" target="_blank" rel="noopener noreferrer"
                    class="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition no-underline">
                    ↗ Ver en WooCommerce
                  </a>
                  <div class="flex items-center gap-1.5 ml-auto">
                    <label class="text-xs text-gray-400">Estado interno:</label>
                    <select :value="q.internalStatus" @change="updateStatus(q, ($event.target as HTMLSelectElement).value)" :disabled="updatingId === q.id"
                      class="text-xs px-2 py-1.5 border border-gray-300 rounded-lg bg-white cursor-pointer focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none disabled:opacity-50">
                      <option v-for="s in STATUSES" :key="s" :value="s">{{ sl(s) }}</option>
                    </select>
                    <span v-if="updatingId === q.id" class="text-xs text-gray-400">Guardando…</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

const H = { 'Content-Type': 'application/json' }

// --- Auth ---
const checking = ref(true)
const authed = ref(false)
const password = ref('')
const loggingIn = ref(false)
const loginError = ref('')

// --- App state ---
const tab = ref<'nueva' | 'recibidas'>('nueva')
const searchResults = ref<any[]>([])
const allQ = ref<any[]>([])
const search = ref('')
const items = ref<{ d: any; q: number; u: number }[]>([])
const cN = ref(''); const cE = ref(''); const cP = ref(''); const cC = ref(''); const cM = ref('')
const sending = ref(false)
const msg = ref<{ ok: boolean; text: string } | null>(null)
const lQ = ref(false)
const searching = ref(false)
let debounceTimer: ReturnType<typeof setTimeout> | null = null

// --- Filtros y métricas del dashboard de cotizaciones recibidas ---
const qSearch = ref('')
const qStatus = ref('')
const copiedId = ref<number | null>(null)

async function loadQuotes(): Promise<boolean> {
  // Devuelve true si la sesión es válida (200), false si 401.
  const r = await fetch('/api/cotizador-interno/quotes', { headers: H })
  if (r.status === 401) return false
  if (r.ok) allQ.value = await r.json()
  return true
}

onMounted(async () => {
  try {
    authed.value = await loadQuotes()
  } catch {
    authed.value = false
  } finally {
    checking.value = false
  }
})

async function login() {
  if (!password.value) return
  loggingIn.value = true
  loginError.value = ''
  try {
    const r = await fetch('/api/admin/login', { method: 'POST', headers: H, body: JSON.stringify({ password: password.value }) })
    if (r.ok) {
      password.value = ''
      authed.value = true
      await loadQuotes().catch(() => {})
    } else {
      loginError.value = 'Contraseña incorrecta'
    }
  } catch {
    loginError.value = 'Error de conexión'
  } finally {
    loggingIn.value = false
  }
}

async function logout() {
  try { await fetch('/api/admin/logout', { method: 'POST', headers: H }) } catch {}
  authed.value = false
}

function doSearch(term: string) {
  if (!term.trim()) { searchResults.value = []; return }
  searching.value = true
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(async () => {
    try {
      const r = await fetch(`/api/cotizador-interno/productos?search=${encodeURIComponent(term.trim())}`, { headers: H })
      if (r.ok) searchResults.value = await r.json()
    } catch {}
    searching.value = false
  }, 300)
}

watch(search, (v) => doSearch(v))

const total = computed(() => items.value.reduce((s, i) => s + i.q * i.u, 0))
const tProd = computed(() => items.value.reduce((s, i) => s + i.q, 0))

// Conteo por estado INTERNO sobre TODAS las cotizaciones (para el selector).
const statusCounts = computed<Record<string, number>>(() => {
  const acc: Record<string, number> = {}
  for (const q of allQ.value) acc[q.internalStatus] = (acc[q.internalStatus] || 0) + 1
  return acc
})
const availableStatuses = computed(() => Object.keys(statusCounts.value).sort())

// Lista filtrada por texto (cliente/email/empresa/#) y estado interno.
const filteredQuotes = computed(() => {
  const term = qSearch.value.trim().toLowerCase()
  return allQ.value.filter((q) => {
    if (qStatus.value && q.internalStatus !== qStatus.value) return false
    if (!term) return true
    const hay = [
      q.customer?.name, q.customer?.email, q.customer?.company,
      String(q.number), String(q.id),
    ].filter(Boolean).join(' ').toLowerCase()
    return hay.includes(term)
  })
})

// Métricas sobre el conjunto filtrado (consistentes con lo que se ve).
const mTotal = computed(() => filteredQuotes.value.length)
// Valor con IVA incluido (consistente con lo que muestran las tarjetas).
const mValor = computed(() => filteredQuotes.value.reduce((s, q) => s + totalConIvaOf(q.total), 0))
const mPromedio = computed(() => (mTotal.value ? Math.round(mValor.value / mTotal.value) : 0))
const mProductos = computed(() =>
  filteredQuotes.value.reduce((s, q) => s + (q.products?.reduce((a: number, p: any) => a + (Number(p.quantity) || 0), 0) || 0), 0),
)

// --- IVA chileno (19%) ---
const IVA_RATE = 0.19
const iva = computed(() => Math.round(total.value * IVA_RATE))
const totalConIva = computed(() => total.value + iva.value)
const ivaOf = (net: unknown) => Math.round((Number(net) || 0) * IVA_RATE)
const totalConIvaOf = (net: unknown) => (Number(net) || 0) + ivaOf(net)

// --- Cambio de estado ---
const STATUSES = ['pending', 'processing', 'on-hold', 'completed', 'cancelled']
const updatingId = ref<number | null>(null)
async function updateStatus(q: any, status: string) {
  if (!status || status === q.internalStatus) return
  updatingId.value = q.id
  try {
    const r = await fetch('/api/cotizador-interno/update-status', {
      method: 'POST', headers: H, body: JSON.stringify({ id: q.id, status }),
    })
    // Estado SOLO interno (Upstash): no se toca WooCommerce.
    if (r.ok) q.internalStatus = status // muta el objeto en allQ (reactivo) → recalcula conteos/filtro
  } catch {} finally {
    updatingId.value = null
  }
}

// --- Acciones rápidas ---
function waText(q: any): string {
  const lines = (q.products || []).map((p: any) => `• ${p.quantity}x ${p.name}`).join('\n')
  const nombre = q.customer?.name ? String(q.customer.name).split(' ')[0] : ''
  const saludo = nombre ? `Hola ${nombre}! ` : 'Hola! '
  return `${saludo}Te escribo de Agro Farías por tu cotización #${q.number}:\n${lines}\nTotal (IVA incl.): ${fp(totalConIvaOf(q.total))}`
}
function waLink(q: any): string {
  const digits = String(q.customer?.phone || '').replace(/\D/g, '')
  return digits.length >= 8 ? `https://wa.me/${digits}?text=${encodeURIComponent(waText(q))}` : ''
}
async function copyEmail(q: any) {
  if (!q.customer?.email) return
  try {
    await navigator.clipboard.writeText(q.customer.email)
    copiedId.value = q.id
    setTimeout(() => { if (copiedId.value === q.id) copiedId.value = null }, 1800)
  } catch {}
}
// Color del badge según estado (clases estáticas para que Tailwind las detecte).
function statusClass(s: string): string {
  return ({
    processing: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    'on-hold': 'bg-orange-100 text-orange-700',
    cancelled: 'bg-red-100 text-red-700',
  } as Record<string, string>)[s] || 'bg-gray-100 text-gray-600'
}

const fp = (n: number) => n === 0 ? '$0' : '$' + n.toLocaleString('es-CL')
const fd = (d: string) => new Date(d).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' })
const sl = (s: string) => (({ processing: 'Procesando', completed: 'Completado', pending: 'Pendiente', 'on-hold': 'En espera', cancelled: 'Cancelado' } as Record<string, string>)[s] || s)

function hp(id: number) { return items.value.some(i => i.d.id === id) }
function ap(d: any) { if (!hp(d.id)) { items.value.push({ d, q: 1, u: 0 }); search.value = '' } }
function ri(i: number) { items.value.splice(i, 1) }
function cq(i: number, v: number) { items.value[i].q = Math.max(1, Math.min(999, Math.round(v || 1))) }
function cu(i: number, v: number) { items.value[i].u = Math.max(0, Math.round(v || 0)) }

async function refreshQ() {
  lQ.value = true
  try {
    const r = await fetch('/api/cotizador-interno/quotes', { headers: H })
    if (r.ok) allQ.value = await r.json()
  } catch {} finally { lQ.value = false }
}

async function send() {
  msg.value = null
  if (items.value.length === 0) { msg.value = { ok: false, text: 'Agregá al menos un producto.' }; return }
  if (!cN.value.trim()) { msg.value = { ok: false, text: 'Ingresá el nombre del cliente.' }; return }
  if (!cE.value.trim()) { msg.value = { ok: false, text: 'Ingresá el email del cliente.' }; return }
  if (!cP.value.trim()) { msg.value = { ok: false, text: 'Ingresá el teléfono del cliente.' }; return }
  sending.value = true
  try {
    const r = await fetch('/api/cotizador-interno', { method: 'POST', headers: H, body: JSON.stringify({
      productos: items.value.map(i => ({ id: i.d.id, name: i.d.name, cantidad: i.q, precioUnitario: i.u })),
      nombre: cN.value.trim(), email: cE.value.trim(), telefono: cP.value.trim(),
      empresa: cC.value.trim() || null, mensaje: cM.value.trim() || null,
    }) })
    const d = await r.json()
    if (r.ok) {
      msg.value = { ok: true, text: 'Cotización enviada correctamente.' }
      items.value = []; cN.value = ''; cE.value = ''; cP.value = ''; cC.value = ''; cM.value = ''
      refreshQ()
    } else {
      msg.value = { ok: false, text: d.error || 'Error al enviar.' }
    }
  } catch {
    msg.value = { ok: false, text: 'Error de conexión.' }
  } finally {
    sending.value = false
  }
}
</script>
