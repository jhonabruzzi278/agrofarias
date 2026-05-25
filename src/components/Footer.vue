<template>
  <footer class="main-footer bg-[#2D6A4F] text-white" role="contentinfo">
    <div class="large-container">
      <div class="widget-section py-14">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          <div class="footer-column">
            <a href="/" class="inline-block mb-4">
              <img src="/logo-agrofarias.png" alt="Agro Farías" class="h-10 brightness-0 invert" />
            </a>
            <p class="text-white text-sm leading-relaxed mb-4">Insumos, herramientas y soluciones agrícolas con atención personalizada y despacho confiable para productores chilenos.</p>

            <div class="flex items-center gap-3 p-3 bg-white/10 rounded-lg mb-4">
              <div class="w-10 h-10 bg-[var(--accent-color)] rounded-full flex items-center justify-center flex-shrink-0">
                <i class="fas fa-phone text-[#2D6A4F] text-sm"></i>
              </div>
              <div>
                <a :href="SITE_CONFIG.phoneHref" class="text-white font-bold text-base hover:text-[var(--accent-color)] transition-colors block">{{ SITE_CONFIG.phone }}</a>
                <span class="text-white/70 text-xs">Lunes a Viernes 8-18</span>
              </div>
            </div>

            <ul class="flex gap-2">
              <li><a :href="SITE_CONFIG.social.facebook" target="_blank" rel="noopener noreferrer" class="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-[var(--accent-color)] hover:text-white transition-all duration-300" aria-label="Facebook"><i class="fab fa-facebook-f text-sm"></i></a></li>
              <li><a :href="SITE_CONFIG.social.instagram" target="_blank" rel="noopener noreferrer" class="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-[var(--accent-color)] hover:text-white transition-all duration-300" aria-label="Instagram"><i class="fab fa-instagram text-sm"></i></a></li>
              <li><a :href="SITE_CONFIG.social.whatsapp" target="_blank" rel="noopener noreferrer" class="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-[var(--accent-color)] hover:text-white transition-all duration-300" aria-label="WhatsApp"><i class="fab fa-whatsapp text-sm"></i></a></li>
            </ul>
          </div>

          <div class="footer-column">
            <h2 class="text-base font-bold mb-5 relative font-title">
              Categorías
              <span class="absolute -bottom-2 left-0 w-8 h-0.5 bg-[var(--accent-color)]"></span>
            </h2>
            <ul class="space-y-2.5">
              <li v-for="cat in categorias" :key="cat.slug">
                <a :href="`/categoria/${cat.slug}`" class="text-white/80 text-sm hover:text-white hover:pl-1 transition-all duration-200 flex items-center gap-2">
                  <i class="fas fa-chevron-right text-[6px] text-[var(--accent-color)]"></i>{{ cat.name }}
                </a>
              </li>
            </ul>
          </div>

          <div class="footer-column">
            <h2 class="text-base font-bold mb-5 relative font-title">
              Enlaces Rápidos
              <span class="absolute -bottom-2 left-0 w-8 h-0.5 bg-[var(--accent-color)]"></span>
            </h2>
            <ul class="space-y-2.5">
              <li><a href="/tienda" class="text-white/80 text-sm hover:text-white hover:pl-1 transition-all duration-200 flex items-center gap-2"><i class="fas fa-chevron-right text-[6px] text-[var(--accent-color)]"></i>Tienda</a></li>
              <li><a href="/cotizacion" class="text-white/80 text-sm hover:text-white hover:pl-1 transition-all duration-200 flex items-center gap-2"><i class="fas fa-chevron-right text-[6px] text-[var(--accent-color)]"></i>Cotización</a></li>
              <li><a href="/cotizar" class="text-white/80 text-sm hover:text-white hover:pl-1 transition-all duration-200 flex items-center gap-2"><i class="fas fa-chevron-right text-[6px] text-[var(--accent-color)]"></i>Solicitar Presupuesto</a></li>
              <li><a href="/contacto" class="text-white/80 text-sm hover:text-white hover:pl-1 transition-all duration-200 flex items-center gap-2"><i class="fas fa-chevron-right text-[6px] text-[var(--accent-color)]"></i>Contacto</a></li>
            </ul>
          </div>

          <div class="footer-column">
            <h2 class="text-base font-bold mb-5 relative font-title">
              Horario de Atención
              <span class="absolute -bottom-2 left-0 w-8 h-0.5 bg-[var(--accent-color)]"></span>
            </h2>
            <ul class="space-y-2">
              <li class="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                <span class="text-white/80 text-sm">Lun a Vie</span>
                <span class="text-white font-bold text-sm">8:00 - 18:00</span>
              </li>
              <li class="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                <span class="text-white/80 text-sm">Sábados</span>
                <span class="text-white font-bold text-sm">9:00 - 13:00</span>
              </li>
              <li class="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                <span class="text-white/80 text-sm">Domingos</span>
                <span class="text-white/50 font-bold text-sm">Cerrado</span>
              </li>
            </ul>

            <div class="mt-4 p-3 bg-white/10 rounded-lg space-y-2">
              <p class="text-white/80 text-sm flex items-start gap-2">
                <i class="fas fa-map-marker-alt text-[var(--accent-color)] mt-0.5 text-xs"></i>{{ SITE_CONFIG.address }}
              </p>
              <p class="text-white/80 text-sm flex items-center gap-2">
                <i class="fas fa-envelope text-[var(--accent-color)] text-xs"></i>
                <a :href="SITE_CONFIG.emailHref" class="hover:text-white transition-colors">{{ SITE_CONFIG.email }}</a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="border-t border-white/10 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
        <p class="text-white/60 text-sm">&copy; 2026 Agro Farías. Todos los derechos reservados.</p>
        <div class="flex items-center gap-5 text-sm text-white/60">
          <a href="#" class="hover:text-white transition-colors">Términos</a>
          <a href="#" class="hover:text-white transition-colors">Privacidad</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { SITE_CONFIG } from '../lib/config'
import type { CategoriaWC } from '../lib/types'

const props = withDefaults(defineProps<{
  categorias?: Array<Pick<CategoriaWC, 'id' | 'name' | 'slug' | 'parent'>>
}>(), {
  categorias: () => [
    { id: 0, name: 'Fertilizantes', slug: 'fertilizantes', parent: 0 },
    { id: 0, name: 'Fungicidas', slug: 'fungicidas', parent: 0 },
    { id: 0, name: 'Herbicidas', slug: 'herbicidas', parent: 0 },
    { id: 0, name: 'Insecticidas', slug: 'insecticidas', parent: 0 },
    { id: 0, name: 'Herramientas', slug: 'herramientas-y-repuestos', parent: 0 },
  ],
})

const categorias = props.categorias
  .filter(c => c.parent === 0)
  .slice(0, 8)
</script>
