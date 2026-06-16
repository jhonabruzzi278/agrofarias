<template>
  <div class="space-y-5">
    <!-- Toolbar -->
    <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
      <div class="flex flex-col sm:flex-row gap-2 flex-1">
        <div class="relative flex-1 max-w-sm">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input v-model="search" type="text" placeholder="Buscar producto..." class="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" />
        </div>
        <select v-model="selectedCategory" class="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none">
          <option :value="null">Todas las categorías</option>
          <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }} ({{ c.count }})</option>
        </select>
        <select v-model="selectedStatus" class="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none">
          <option value="any">Todos los estados</option>
          <option value="publish">Publicados</option>
          <option value="draft">Borradores</option>
          <option value="trash">Papelera</option>
        </select>
      </div>
      <button @click="openCreate" class="shrink-0 bg-green-700 hover:bg-green-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition cursor-pointer border-none flex items-center gap-2">
        + Nuevo Producto
      </button>
    </div>

    <!-- Stats -->
    <p class="text-xs text-gray-400">{{ total }} producto{{ total !== 1 ? 's' : '' }} en total</p>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-16 text-gray-400 text-sm">Cargando productos...</div>

    <!-- Empty -->
    <div v-else-if="products.length === 0" class="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400 text-sm">
      No se encontraron productos.
    </div>

    <!-- Table -->
    <div v-else class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200 text-left text-xs text-gray-500 uppercase tracking-wide">
              <th class="px-4 py-3 font-medium w-12"></th>
              <th class="px-4 py-3 font-medium">Nombre</th>
              <th class="px-4 py-3 font-medium hidden sm:table-cell">SKU</th>
              <th class="px-4 py-3 font-medium hidden md:table-cell">Categoría</th>
              <th class="px-4 py-3 font-medium">Stock</th>
              <th class="px-4 py-3 font-medium text-right">Precio</th>
              <th class="px-4 py-3 font-medium text-right">Estado</th>
              <th class="px-4 py-3 font-medium w-24 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="p in products" :key="p.id" class="hover:bg-gray-50 transition">
              <td class="px-4 py-3">
                <img v-if="p.image?.src" :src="p.image.src" :alt="p.image.alt || p.name" class="w-10 h-10 object-cover rounded-lg bg-gray-100" loading="lazy" />
                <div v-else class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300 text-xl">📦</div>
              </td>
              <td class="px-4 py-3">
                <p class="font-medium text-gray-800 truncate max-w-[200px]">{{ p.name }}</p>
                <p class="text-xs text-gray-400">#{{ p.id }}</p>
              </td>
              <td class="px-4 py-3 hidden sm:table-cell text-gray-500">{{ p.sku || '—' }}</td>
              <td class="px-4 py-3 hidden md:table-cell text-gray-500 text-xs">{{ p.categories?.map((c: { name: string }) => c.name).join(', ') || '—' }}</td>
              <td class="px-4 py-3">
                <span :class="stockClass(p.stock_status)" class="px-2 py-0.5 rounded-full text-xs font-medium">{{ stockLabel(p.stock_status) }}</span>
              </td>
              <td class="px-4 py-3 text-right font-medium text-gray-800">{{ fp(p.regular_price) }}</td>
              <td class="px-4 py-3 text-right">
                <span :class="p.status === 'publish' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'" class="px-2 py-0.5 rounded-full text-xs font-medium">
                  {{ p.status === 'publish' ? 'Publicado' : p.status === 'draft' ? 'Borrador' : p.status }}
                </span>
              </td>
              <td class="px-4 py-3 text-center">
                <div class="flex items-center justify-center gap-1">
                  <button @click="openEdit(p)" title="Editar" class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer border-none bg-transparent">✏️</button>
                  <button v-if="deletingId !== p.id" @click="deletingId = p.id" title="Eliminar" class="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition cursor-pointer border-none bg-transparent">🗑️</button>
                  <template v-else>
                    <button @click="confirmDelete(p.id)" class="text-xs px-2 py-1 bg-red-600 text-white rounded-lg cursor-pointer border-none hover:bg-red-700">Sí</button>
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

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 z-40 flex items-start justify-center pt-10 px-4">
      <div class="absolute inset-0 bg-black/40" @click="closeModal"></div>
      <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto z-10">
        <div class="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-800">{{ showModal === 'create' ? 'Nuevo Producto' : 'Editar Producto' }}</h2>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600 text-xl cursor-pointer border-none bg-transparent leading-none">×</button>
        </div>
        <form @submit.prevent="saveProduct" class="p-6 space-y-5">
          <!-- Basic info -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="sm:col-span-2">
              <label class="block text-xs font-medium text-gray-600 mb-1">Nombre *</label>
              <input v-model="form.name" required class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" placeholder="Nombre del producto" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Precio regular ($)</label>
              <input v-model="form.regular_price" type="number" min="0" step="0.01" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" placeholder="0.00" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">SKU</label>
              <input v-model="form.sku" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" placeholder="Código de producto" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Stock</label>
              <input v-model="form.stock_quantity" type="number" min="0" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" placeholder="Cantidad" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Estado de stock</label>
              <select v-model="form.stock_status" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none">
                <option value="instock">En stock</option>
                <option value="outofstock">Sin stock</option>
                <option value="onbackorder">Bajo pedido</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Visibilidad</label>
              <select v-model="form.status" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none">
                <option value="publish">Publicado</option>
                <option value="draft">Borrador</option>
              </select>
            </div>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
            <textarea v-model="form.description" rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-y" placeholder="Descripción completa del producto"></textarea>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Descripción corta</label>
            <textarea v-model="form.short_description" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-y" placeholder="Descripción breve"></textarea>
          </div>

          <!-- Categories -->
          <div v-if="categories.length > 0">
            <label class="block text-xs font-medium text-gray-600 mb-2">Categorías</label>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
              <label v-for="c in categories" :key="c.id" class="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" :value="c.id" v-model="form.categories" class="accent-green-600" />
                <span class="text-gray-700">{{ c.name }}</span>
              </label>
            </div>
          </div>

          <!-- ACF fields -->
          <div class="border border-gray-200 rounded-xl p-4 space-y-3">
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Campos adicionales</p>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Unidad de medida</label>
                <input v-model="form.unidad_medida" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" placeholder="kg, L, unidad..." />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Cultivo aplicable</label>
                <input v-model="form.cultivo_aplicable" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" placeholder="Maíz, Trigo..." />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Dosis recomendada</label>
                <input v-model="form.dosis_recomendada" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" placeholder="2 L/ha..." />
              </div>
            </div>
          </div>

          <!-- Image upload -->
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-2">Imagen del producto</label>
            <div class="flex items-start gap-4">
              <div class="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 shrink-0">
                <img v-if="imagePreview" :src="imagePreview" alt="Preview" class="w-full h-full object-cover" />
                <span v-else class="text-3xl text-gray-300">📷</span>
              </div>
              <div class="flex-1 space-y-2">
                <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileSelect" />
                <button type="button" @click="(fileInput as HTMLInputElement)?.click()" :disabled="uploadingImage"
                  class="px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition cursor-pointer disabled:opacity-50">
                  {{ uploadingImage ? 'Subiendo...' : 'Seleccionar imagen' }}
                </button>
                <p v-if="uploadError" class="text-xs text-red-600">{{ uploadError }}</p>
                <p class="text-xs text-gray-400">JPG, PNG, WEBP — máx. 5MB</p>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" @click="closeModal" class="px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition cursor-pointer">Cancelar</button>
            <button type="submit" :disabled="saving" class="px-6 py-2 text-sm bg-green-700 hover:bg-green-800 disabled:bg-gray-400 text-white font-medium rounded-lg transition cursor-pointer border-none">
              {{ saving ? 'Guardando...' : showModal === 'create' ? 'Crear producto' : 'Guardar cambios' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const emit = defineEmits<{ (e: 'unauthorized'): void }>()

const H = { 'Content-Type': 'application/json' }

interface Product {
  id: number
  name: string
  sku: string
  status: string
  stock_status: string
  stock_quantity: number | null
  regular_price: string
  image: { src: string; alt: string } | null
  categories: Array<{ id: number; name: string; slug: string }>
  acf: Record<string, string>
}

interface Category { id: number; name: string; slug: string; count: number }

const products = ref<Product[]>([])
const categories = ref<Category[]>([])
const loading = ref(false)
const page = ref(1)
const totalPages = ref(1)
const total = ref(0)
const perPage = ref(20)
const search = ref('')
const selectedCategory = ref<number | null>(null)
const selectedStatus = ref('any')
const deletingId = ref<number | null>(null)
const saving = ref(false)
const toast = ref<{ ok: boolean; text: string } | null>(null)

const showModal = ref<'create' | 'edit' | null>(null)
const editingId = ref<number | null>(null)

const form = ref({
  name: '', description: '', short_description: '', regular_price: '',
  sku: '', stock_quantity: '' as string | number, stock_status: 'instock',
  status: 'publish', categories: [] as number[],
  unidad_medida: '', cultivo_aplicable: '', dosis_recomendada: '',
})

const imagePreview = ref<string | null>(null)
const imageId = ref<number | null>(null)
const uploadingImage = ref(false)
const uploadError = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

let debounceTimer: ReturnType<typeof setTimeout> | null = null

function showToast(ok: boolean, text: string) {
  toast.value = { ok, text }
  setTimeout(() => { toast.value = null }, 3500)
}

async function loadProducts() {
  loading.value = true
  try {
    const params = new URLSearchParams({
      page: String(page.value),
      per_page: String(perPage.value),
      status: selectedStatus.value,
    })
    if (search.value.trim()) params.set('search', search.value.trim())
    if (selectedCategory.value) params.set('category', String(selectedCategory.value))

    const r = await fetch(`/api/admin/productos?${params}`, { headers: H })
    if (r.status === 401) { emit('unauthorized'); return }
    if (r.ok) {
      const data = await r.json()
      products.value = data.products
      totalPages.value = data.totalPages
      total.value = data.total
    }
  } catch {} finally { loading.value = false }
}

async function loadCategories() {
  try {
    const r = await fetch('/api/admin/categorias', { headers: H })
    if (r.ok) categories.value = (await r.json()).categories
  } catch {}
}

onMounted(() => { loadProducts(); loadCategories() })

watch([page, perPage, selectedCategory, selectedStatus], () => loadProducts())
watch(search, () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => { page.value = 1; loadProducts() }, 400)
})

function resetForm() {
  form.value = {
    name: '', description: '', short_description: '', regular_price: '',
    sku: '', stock_quantity: '', stock_status: 'instock',
    status: 'publish', categories: [],
    unidad_medida: '', cultivo_aplicable: '', dosis_recomendada: '',
  }
  imagePreview.value = null
  imageId.value = null
  uploadError.value = ''
}

function openCreate() { resetForm(); editingId.value = null; showModal.value = 'create' }

function openEdit(p: Product) {
  resetForm()
  editingId.value = p.id
  form.value.name = p.name
  form.value.sku = p.sku || ''
  form.value.regular_price = p.regular_price || ''
  form.value.stock_quantity = p.stock_quantity ?? ''
  form.value.stock_status = p.stock_status || 'instock'
  form.value.status = p.status || 'publish'
  form.value.categories = p.categories?.map((c) => c.id) || []
  form.value.unidad_medida = p.acf?.unidad_medida || ''
  form.value.cultivo_aplicable = p.acf?.cultivo_aplicable || ''
  form.value.dosis_recomendada = p.acf?.dosis_recomendada || ''
  if (p.image?.src) imagePreview.value = p.image.src
  showModal.value = 'edit'
}

function closeModal() { showModal.value = null; editingId.value = null }

async function onFileSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  uploadError.value = ''
  uploadingImage.value = true
  try {
    const fd = new FormData()
    fd.append('file', file)
    const r = await fetch('/api/admin/productos/imagen', { method: 'POST', body: fd })
    if (r.status === 401) { emit('unauthorized'); return }
    const data = await r.json()
    if (r.ok) {
      imageId.value = data.id
      imagePreview.value = data.url
    } else {
      uploadError.value = data.error || 'Error al subir imagen'
    }
  } catch {
    uploadError.value = 'Error de conexión'
  } finally {
    uploadingImage.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

async function saveProduct() {
  saving.value = true
  try {
    const payload = {
      name: form.value.name.trim(),
      description: form.value.description,
      short_description: form.value.short_description,
      regular_price: form.value.regular_price || '0',
      sku: form.value.sku,
      stock_quantity: form.value.stock_quantity !== '' ? Number(form.value.stock_quantity) : undefined,
      stock_status: form.value.stock_status,
      status: form.value.status,
      categories: form.value.categories,
      image_id: imageId.value || undefined,
      unidad_medida: form.value.unidad_medida || undefined,
      cultivo_aplicable: form.value.cultivo_aplicable || undefined,
      dosis_recomendada: form.value.dosis_recomendada || undefined,
    }

    const isCreate = showModal.value === 'create'
    const url = isCreate ? '/api/admin/productos' : `/api/admin/productos/${editingId.value}`
    const r = await fetch(url, { method: isCreate ? 'POST' : 'PUT', headers: H, body: JSON.stringify(payload) })

    if (r.status === 401) { emit('unauthorized'); return }
    const data = await r.json()
    if (r.ok) {
      showToast(true, isCreate ? 'Producto creado correctamente' : 'Producto actualizado correctamente')
      closeModal()
      await loadProducts()
    } else {
      showToast(false, data.error || 'Error al guardar')
    }
  } catch {
    showToast(false, 'Error de conexión')
  } finally {
    saving.value = false
  }
}

async function confirmDelete(id: number) {
  try {
    const r = await fetch(`/api/admin/productos/${id}`, { method: 'DELETE', headers: H })
    if (r.status === 401) { emit('unauthorized'); return }
    if (r.ok) {
      showToast(true, 'Producto enviado a la papelera')
      deletingId.value = null
      await loadProducts()
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

function stockClass(s: string) {
  return s === 'instock' ? 'bg-green-100 text-green-700' : s === 'onbackorder' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
}

function stockLabel(s: string) {
  return s === 'instock' ? 'En stock' : s === 'onbackorder' ? 'Bajo pedido' : 'Sin stock'
}
</script>
