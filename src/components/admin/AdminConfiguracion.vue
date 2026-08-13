<template>
  <div class="system-view">
    <div class="system-toolbar">
      <div>
        <h2>Servicios operativos</h2>
        <p>Prueba en tiempo real desde esta sesión administrativa.</p>
      </div>
      <button :disabled="checking" @click="runChecks">{{ checking ? 'Comprobando…' : 'Comprobar ahora' }}</button>
    </div>

    <div class="service-list" aria-live="polite">
      <div v-for="service in services" :key="service.id" class="service-row">
        <span class="status-dot" :class="service.status"></span>
        <div class="service-copy">
          <strong>{{ service.name }}</strong>
          <span>{{ service.detail }}</span>
        </div>
        <div class="service-result">
          <strong>{{ statusLabel(service.status) }}</strong>
          <span v-if="service.latency !== null">{{ service.latency }} ms</span>
        </div>
      </div>
    </div>

    <section class="access-section">
      <div>
        <p class="section-kicker">Acceso</p>
        <h2>Panel privado</h2>
        <p>La consola solo responde en el subdominio administrativo y utiliza una cookie segura de 8 horas.</p>
      </div>
      <div class="access-actions">
        <code>admin.agrofarias.cl</code>
        <button @click="copyAddress">{{ copied ? 'Dirección copiada' : 'Copiar dirección' }}</button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

type Status = 'pending' | 'ok' | 'error'
interface Service { id: 'session' | 'catalog' | 'products'; name: string; detail: string; status: Status; latency: number | null }
interface HealthResult { ok: boolean; latency: number; detail: string }

const services = ref<Service[]>([
  { id: 'session', name: 'Sesión administrativa', detail: 'Autenticación y permisos del panel', status: 'pending', latency: null },
  { id: 'catalog', name: 'Catálogo WooCommerce', detail: 'Categorías y disponibilidad del catálogo', status: 'pending', latency: null },
  { id: 'products', name: 'Administración de productos', detail: 'Lectura protegida de productos', status: 'pending', latency: null },
])
const checking = ref(false)
const copied = ref(false)

function statusLabel(status: Status) {
  return status === 'ok' ? 'Operativo' : status === 'error' ? 'Requiere atención' : 'Sin comprobar'
}

async function runChecks() {
  checking.value = true
  services.value.forEach((service) => { service.status = 'pending'; service.latency = null })
  try {
    const response = await fetch('/api/admin/health', {
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    })
    if (response.status === 401) {
      window.location.reload()
      return
    }
    if (!response.ok) throw new Error(`Health check ${response.status}`)
    const payload = await response.json() as { services?: Record<Service['id'], HealthResult> }
    for (const service of services.value) {
      const result = payload.services?.[service.id]
      service.status = result?.ok ? 'ok' : 'error'
      service.latency = Number.isFinite(result?.latency) ? result!.latency : null
      if (result?.detail) service.detail = result.detail
    }
  } catch {
    services.value.forEach((service) => {
      service.status = 'error'
      service.detail = 'No se pudo completar la comprobación'
    })
  } finally {
    checking.value = false
  }
}

async function copyAddress() {
  await navigator.clipboard.writeText('https://admin.agrofarias.cl')
  copied.value = true
  window.setTimeout(() => { copied.value = false }, 1600)
}

onMounted(runChecks)
</script>

<style scoped>
.system-view{max-width:980px}.system-toolbar{display:flex;align-items:end;justify-content:space-between;gap:24px;padding-bottom:20px;border-bottom:1px solid #dfe4de}.system-toolbar h2,.access-section h2{margin:0;color:#1b2a20;font-size:17px;letter-spacing:-.01em}.system-toolbar p,.access-section p{margin:6px 0 0;color:#77827a;font-size:12px}.system-toolbar button,.access-actions button{padding:9px 12px;border:1px solid #cbd5cd;border-radius:8px;background:#fff;color:#315d40;font-size:11px;font-weight:800;cursor:pointer}.system-toolbar button:disabled{opacity:.55}.service-list{margin-top:8px}.service-row{display:grid;grid-template-columns:12px minmax(0,1fr) auto;align-items:center;gap:14px;padding:19px 4px;border-bottom:1px solid #e1e5e0}.status-dot{width:8px;height:8px;border-radius:50%;background:#a8b0aa}.status-dot.ok{background:#3c9a59;box-shadow:0 0 0 4px rgba(60,154,89,.11)}.status-dot.error{background:#c4554d;box-shadow:0 0 0 4px rgba(196,85,77,.1)}.service-copy strong,.service-copy span,.service-result strong,.service-result span{display:block}.service-copy strong{font-size:13px;color:#253229}.service-copy span{margin-top:4px;color:#859087;font-size:11px}.service-result{text-align:right}.service-result strong{font-size:11px;color:#4e5d53}.service-result span{margin-top:4px;color:#97a098;font-size:10px}.access-section{display:grid;grid-template-columns:1fr auto;align-items:end;gap:30px;margin-top:42px;padding-top:26px;border-top:1px solid #dfe4de}.access-section>div:first-child{max-width:530px}.section-kicker{margin:0 0 7px!important;color:#438057!important;font-size:9px!important;font-weight:800;text-transform:uppercase;letter-spacing:.15em}.access-actions{display:flex;align-items:center;gap:8px}.access-actions code{padding:9px 11px;border-radius:7px;background:#e9eee9;color:#385442;font-size:11px}@media(max-width:680px){.system-toolbar,.access-section{display:block}.system-toolbar button{margin-top:17px}.access-actions{margin-top:18px;flex-wrap:wrap}.service-row{grid-template-columns:12px minmax(0,1fr)}.service-result{grid-column:2;text-align:left;display:flex;gap:7px}.service-result strong,.service-result span{display:inline}}
</style>
