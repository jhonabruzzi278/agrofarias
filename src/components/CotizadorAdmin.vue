<template>
  <div v-if="checking" class="admin-loading" role="status" aria-live="polite">
    <div class="loading-mark"><span></span><span></span><span></span></div>
    <p>Verificando acceso seguro</p>
  </div>

  <LoginPanel
    v-else-if="!authed"
    v-model:password="password"
    :loggingIn="loggingIn"
    :loginError="loginError"
    @login="login"
  />

  <div v-else class="admin-shell" @keydown.esc="mobileOpen = false">
    <button v-if="mobileOpen" class="nav-backdrop" aria-label="Cerrar navegación" @click="mobileOpen = false"></button>

    <aside class="admin-sidebar" :class="{ 'is-open': mobileOpen }">
      <div class="brand-block">
        <div class="brand-symbol" aria-hidden="true">AF</div>
        <div>
          <strong>Agro Farías</strong>
          <span>Administración</span>
        </div>
      </div>

      <nav class="admin-nav" aria-label="Módulos de administración">
        <p class="nav-label">Operación</p>
        <button
          v-for="(item, index) in navigation"
          :key="item.id"
          :class="{ active: tab === item.id }"
          :aria-current="tab === item.id ? 'page' : undefined"
          @click="selectTab(item.id)"
        >
          <AdminIcon :name="item.icon" />
          <span>{{ item.label }}</span>
          <span v-if="item.id === 'recibidas'" class="nav-count">{{ allQ.length }}</span>
          <kbd>Alt {{ index + 1 }}</kbd>
        </button>
      </nav>

      <div class="sidebar-footer">
        <div class="session-state"><span></span>Sesión protegida</div>
        <button class="logout-button" @click="logout">
          <AdminIcon name="logout" />
          Cerrar sesión
        </button>
      </div>
    </aside>

    <main class="admin-main">
      <header class="workspace-header">
        <button class="mobile-menu" aria-label="Abrir navegación" @click="mobileOpen = true">
          <AdminIcon name="menu" />
        </button>
        <div class="workspace-title">
          <p>{{ activeMeta.eyebrow }}</p>
          <h1>{{ activeMeta.title }}</h1>
          <span>{{ activeMeta.description }}</span>
        </div>
        <button v-if="tab === 'recibidas'" class="header-action" :disabled="lQ" @click="refreshQuotes">
          <AdminIcon name="refresh" :class="{ spinning: lQ }" />
          {{ lQ ? 'Actualizando' : 'Actualizar' }}
        </button>
      </header>

      <div class="workspace-body">
        <section v-show="tab === 'nueva'" class="quote-workspace" aria-label="Nueva cotización">
          <div class="product-column">
            <ProductSearchPanel
              v-model:search="search"
              v-model:selectedCat="selectedCat"
              :categories="categories"
              :searchResults="searchResults"
              :searching="searching"
              :isAdded="hp"
              @add="onAdd"
            />
          </div>
          <div class="builder-column">
            <QuoteBuilder
              :items="items"
              :total="total"
              :tProd="tProd"
              :iva="iva"
              :totalConIva="totalConIva"
              :sending="sending"
              :msg="msg"
              v-model:cN="cN"
              v-model:cE="cE"
              v-model:cP="cP"
              v-model:cC="cC"
              v-model:cM="cM"
              @change-qty="cq"
              @change-price="cu"
              @remove="ri"
              @reset="clearQuote"
              @send="send"
              @create-client="goCreateClient"
            />
          </div>
        </section>

        <section v-if="tab === 'productos'" class="module-surface"><AdminProductos @unauthorized="handleUnauthorized" /></section>
        <section v-if="tab === 'clientes'" class="module-surface"><AdminClientes :autoCreate="autoCreateClient" @unauthorized="handleUnauthorized" @create-consumed="autoCreateClient = false" /></section>
        <section v-if="tab === 'config'" class="module-surface"><AdminConfiguracion /></section>

        <CotizacionesRecibidas
          v-show="tab === 'recibidas'"
          :allQ="allQ"
          :lQ="lQ"
          :filteredQuotes="filteredQuotes"
          :statusCounts="statusCounts"
          :availableStatuses="availableStatuses"
          :mTotal="mTotal"
          :mValor="mValor"
          :mPromedio="mPromedio"
          :mProductos="mProductos"
          :copiedId="copiedId"
          :generatingPDF="generatingPDF"
          :updatingId="updatingId"
          v-model:qSearch="qSearch"
          v-model:qStatus="qStatus"
          @refresh="refreshQuotes"
          @update-status="updateStatus"
          @copy-email="copyEmail"
          @download-pdf="downloadPDF"
        />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AdminProductos from './admin/AdminProductos.vue'
import AdminClientes from './admin/AdminClientes.vue'
import AdminConfiguracion from './admin/AdminConfiguracion.vue'
import AdminIcon from './admin/AdminIcon.vue'
import LoginPanel from './admin/cotizador/LoginPanel.vue'
import ProductSearchPanel from './admin/cotizador/ProductSearchPanel.vue'
import QuoteBuilder from './admin/cotizador/QuoteBuilder.vue'
import CotizacionesRecibidas from './admin/cotizador/CotizacionesRecibidas.vue'
import { useAdminAuth } from './admin/cotizador/useAdminAuth'
import { useProductSearch } from './admin/cotizador/useProductSearch'
import { useQuoteBuilder } from './admin/cotizador/useQuoteBuilder'
import { useReceivedQuotes } from './admin/cotizador/useReceivedQuotes'
import type { SearchProduct } from './admin/cotizador/types'

type AdminTab = 'nueva' | 'recibidas' | 'productos' | 'clientes' | 'config'
type IconName = 'quote' | 'inbox' | 'products' | 'clients' | 'system'

const navigation: Array<{ id: AdminTab; label: string; icon: IconName }> = [
  { id: 'nueva', label: 'Nueva cotización', icon: 'quote' },
  { id: 'recibidas', label: 'Cotizaciones', icon: 'inbox' },
  { id: 'productos', label: 'Productos', icon: 'products' },
  { id: 'clientes', label: 'Clientes', icon: 'clients' },
  { id: 'config', label: 'Estado del sistema', icon: 'system' },
]

const meta: Record<AdminTab, { eyebrow: string; title: string; description: string }> = {
  nueva: { eyebrow: 'Ventas', title: 'Nueva cotización', description: 'Busca productos, confirma precios y completa los datos del cliente.' },
  recibidas: { eyebrow: 'Seguimiento', title: 'Cotizaciones', description: 'Revisa solicitudes, estados y documentos desde un solo lugar.' },
  productos: { eyebrow: 'Catálogo', title: 'Productos', description: 'Mantén precios, stock, contenido e imágenes al día.' },
  clientes: { eyebrow: 'Relaciones', title: 'Clientes', description: 'Consulta y administra los datos de tus clientes.' },
  config: { eyebrow: 'Diagnóstico', title: 'Estado del sistema', description: 'Comprueba la sesión y las conexiones operativas.' },
}

const tab = ref<AdminTab>('nueva')
const mobileOpen = ref(false)
const activeMeta = computed(() => meta[tab.value])
const autoCreateClient = ref(false)

const {
  allQ, lQ, qSearch, qStatus, copiedId, generatingPDF, updatingId,
  loadQuotes, refreshQ, statusCounts, availableStatuses, filteredQuotes,
  mTotal, mValor, mPromedio, mProductos, updateStatus, copyEmail, downloadPDF,
} = useReceivedQuotes()
const { search, selectedCat, categories, searchResults, searching, loadCategories } = useProductSearch()
const {
  items, cN, cE, cP, cC, cM, sending, msg,
  total, tProd, iva, totalConIva, hp, ap, ri, cq, cu, reset, send,
} = useQuoteBuilder(refreshQ)
const { checking, authed, password, loggingIn, loginError, login, logout } = useAdminAuth({
  probe: async () => {
    const ok = await loadQuotes()
    if (ok) loadCategories()
    return ok
  },
  onAuthenticated: () => {
    refreshQ()
    loadCategories()
  },
})

function selectTab(next: AdminTab) {
  tab.value = next
  mobileOpen.value = false
  if (next === 'recibidas') refreshQuotes()
  const url = new URL(window.location.href)
  url.searchParams.set('modulo', next)
  history.replaceState({}, '', url)
}

function syncTabFromUrl() {
  const value = new URL(window.location.href).searchParams.get('modulo') as AdminTab | null
  if (value && navigation.some((item) => item.id === value)) tab.value = value
}

function handleShortcut(event: KeyboardEvent) {
  if (!event.altKey || event.ctrlKey || event.metaKey) return
  const index = Number(event.key) - 1
  if (index >= 0 && index < navigation.length) {
    event.preventDefault()
    selectTab(navigation[index].id)
  }
}

function goCreateClient() {
  autoCreateClient.value = true
  selectTab('clientes')
}

function onAdd(product: SearchProduct) {
  ap(product)
  search.value = ''
}

function clearQuote() {
  if (items.value.length === 0 || window.confirm('¿Limpiar esta cotización y sus datos de cliente?')) reset()
}

async function refreshQuotes() {
  await refreshQ()
}

function handleUnauthorized() {
  authed.value = false
}

onMounted(() => {
  syncTabFromUrl()
  window.addEventListener('popstate', syncTabFromUrl)
  window.addEventListener('keydown', handleShortcut)
})

onBeforeUnmount(() => {
  window.removeEventListener('popstate', syncTabFromUrl)
  window.removeEventListener('keydown', handleShortcut)
})
</script>

<style scoped>
.admin-loading { min-height:100svh; display:grid; place-content:center; gap:18px; background:#f4f6f1; color:#627063; text-align:center; font-size:13px; letter-spacing:.04em; }
.loading-mark { display:flex; justify-content:center; gap:5px; }
.loading-mark span { width:7px; height:7px; border-radius:50%; background:#21633f; animation:pulse 1.1s ease-in-out infinite; }
.loading-mark span:nth-child(2){animation-delay:.14s}.loading-mark span:nth-child(3){animation-delay:.28s}
.admin-shell { min-height:100svh; background:#f5f6f2; color:#17251c; }
.admin-sidebar { position:fixed; inset:0 auto 0 0; z-index:30; width:268px; display:flex; flex-direction:column; padding:26px 18px 18px; color:#eaf2eb; background:#143323; border-right:1px solid rgba(255,255,255,.08); }
.brand-block { display:flex; align-items:center; gap:12px; padding:0 10px 28px; border-bottom:1px solid rgba(255,255,255,.1); }
.brand-symbol { display:grid; place-items:center; width:38px; height:38px; border:1px solid rgba(255,255,255,.28); border-radius:11px; background:#1d4b33; color:#dcebdc; font:700 12px/1 system-ui; letter-spacing:.08em; }
.brand-block strong,.brand-block span { display:block; }.brand-block strong{font-size:15px;letter-spacing:.01em}.brand-block span{margin-top:3px;color:#91aa98;font-size:11px;text-transform:uppercase;letter-spacing:.12em}
.admin-nav { flex:1; padding-top:25px; }.nav-label{padding:0 12px 9px;color:#789080;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.14em}
.admin-nav button { width:100%; display:grid; grid-template-columns:20px minmax(0,1fr) auto; align-items:center; gap:11px; min-height:44px; margin:3px 0; padding:0 12px; border:0; border-radius:9px; background:transparent; color:#aabaae; text-align:left; font:500 13px/1.2 system-ui; cursor:pointer; transition:background .18s ease,color .18s ease,transform .18s ease; }
.admin-nav button:hover { color:#fff; background:rgba(255,255,255,.07); transform:translateX(2px); }.admin-nav button.active{color:#fff;background:#24593d}.admin-nav svg{width:19px;height:19px}.admin-nav kbd{display:none;color:#829687;font:500 9px/1 system-ui}.nav-count{min-width:22px;padding:3px 6px;border-radius:999px;background:rgba(255,255,255,.12);text-align:center;font-size:10px}
.sidebar-footer { padding-top:14px; border-top:1px solid rgba(255,255,255,.1); }.session-state{display:flex;align-items:center;gap:7px;padding:0 10px 12px;color:#8fa594;font-size:11px}.session-state span{width:7px;height:7px;border-radius:50%;background:#6fbd78;box-shadow:0 0 0 3px rgba(111,189,120,.13)}
.logout-button { width:100%; display:flex; align-items:center; gap:10px; padding:10px; border:0; border-radius:8px; background:transparent; color:#aabaae; font-size:12px; cursor:pointer; }.logout-button:hover{background:rgba(255,255,255,.07);color:#fff}.logout-button svg{width:17px;height:17px}
.admin-main { min-height:100svh; margin-left:268px; }.workspace-header{height:112px;display:flex;align-items:center;gap:18px;padding:20px clamp(24px,4vw,54px);border-bottom:1px solid #dde3dc;background:rgba(250,251,248,.94);backdrop-filter:blur(12px);position:sticky;top:0;z-index:20}.workspace-title{min-width:0;flex:1}.workspace-title p{margin:0 0 5px;color:#50815f;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.16em}.workspace-title h1{margin:0;color:#17251c;font-size:clamp(22px,2.3vw,30px);line-height:1.05;letter-spacing:-.025em}.workspace-title span{display:block;margin-top:7px;color:#718078;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.workspace-body{padding:28px clamp(24px,4vw,54px) 54px}.quote-workspace{display:grid;grid-template-columns:minmax(300px,.78fr) minmax(520px,1.45fr);gap:24px;align-items:start}.product-column{position:sticky;top:140px}.module-surface{animation:enter .24s ease both}.header-action,.mobile-menu{display:inline-flex;align-items:center;justify-content:center;gap:8px;border:1px solid #ccd6ce;border-radius:9px;background:#fff;color:#315a40;font-size:12px;font-weight:700;cursor:pointer}.header-action{padding:10px 13px}.header-action:hover{border-color:#92a99a;background:#f5f8f5}.header-action:disabled{opacity:.55;cursor:wait}.header-action svg{width:16px;height:16px}.mobile-menu{display:none;width:40px;height:40px}.mobile-menu svg{width:20px;height:20px}.nav-backdrop{display:none}
.spinning{animation:spin .8s linear infinite}
:deep(input),:deep(select),:deep(textarea){accent-color:#21633f}:deep(input:focus),:deep(select:focus),:deep(textarea:focus){--tw-ring-color:rgba(33,99,63,.2)!important;border-color:#4d8060!important}:deep(.rounded-xl){border-radius:12px}:deep(.shadow-sm){box-shadow:0 1px 2px rgba(23,37,28,.035)}
@media (min-width:1180px){.admin-nav button:hover kbd{display:block}}
@media (max-width:980px){.admin-sidebar{transform:translateX(-102%);transition:transform .22s ease}.admin-sidebar.is-open{transform:translateX(0)}.admin-main{margin-left:0}.mobile-menu{display:inline-flex}.nav-backdrop{display:block;position:fixed;inset:0;z-index:25;border:0;background:rgba(10,25,17,.42);backdrop-filter:blur(2px)}.quote-workspace{grid-template-columns:1fr}.product-column{position:static}.workspace-header{height:96px}.workspace-title span{display:none}}
@media (max-width:640px){.workspace-header{height:84px;padding:14px 16px}.workspace-body{padding:18px 14px 42px}.workspace-title h1{font-size:20px}.workspace-title p{margin-bottom:3px}.header-action{font-size:0;padding:10px}.header-action svg{width:18px;height:18px}.admin-sidebar{width:min(86vw,290px)}.quote-workspace{gap:16px}}
@keyframes pulse{0%,100%{opacity:.25;transform:translateY(0)}50%{opacity:1;transform:translateY(-4px)}}@keyframes spin{to{transform:rotate(360deg)}}@keyframes enter{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
</style>
