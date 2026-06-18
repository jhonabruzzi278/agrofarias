<template>
  <footer class="main-footer bg-[#2D6A4F] text-white" role="contentinfo">
    <div class="large-container py-12">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Left: Logo & Contact -->
        <div class="flex flex-col justify-center">
          <a href="/" class="inline-block mb-4 w-fit">
            <img src="/logo-agrofarias.png" alt="Agro Farías" class="h-10 w-auto brightness-0 invert" loading="lazy" />
          </a>
          <p class="text-white/90 text-sm mb-6 max-w-md leading-relaxed">
            Insumos agrícolas de calidad con despacho confiable para productores de Chile.
          </p>
          <div class="flex flex-col gap-2 text-sm">
            <a :href="SITE_CONFIG.phoneHref" class="text-white font-semibold hover:text-[var(--accent-color)] transition-colors">
              {{ SITE_CONFIG.phone }}
            </a>
            <a :href="SITE_CONFIG.emailHref" class="text-white/90 hover:text-[var(--accent-color)] transition-colors">
              {{ SITE_CONFIG.email }}
            </a>
          </div>
        </div>

        <!-- Right: Links & Socials -->
        <div class="flex flex-col justify-center">
          <div class="mb-6">
            <h3 class="text-sm font-bold mb-3 uppercase tracking-widest">Enlaces</h3>
            <div class="flex flex-wrap gap-6 text-sm">
              <a href="/tienda" class="text-white/80 hover:text-white transition-colors">Tienda</a>
              <a href="/cotizacion" class="text-white/80 hover:text-white transition-colors">Cotización</a>
              <a href="/contacto" class="text-white/80 hover:text-white transition-colors">Contacto</a>
            </div>
          </div>
          <div>
            <h3 class="text-sm font-bold mb-3 uppercase tracking-widest">Síguenos</h3>
            <ul class="flex gap-3">
              <li><a :href="SITE_CONFIG.social.facebook" target="_blank" rel="noopener noreferrer" class="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-[var(--accent-color)] transition-colors" aria-label="Facebook"><i class="fab fa-facebook-f text-xs"></i></a></li>
              <li><a :href="SITE_CONFIG.social.instagram" target="_blank" rel="noopener noreferrer" class="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-[var(--accent-color)] transition-colors" aria-label="Instagram"><i class="fab fa-instagram text-xs"></i></a></li>
              <li><a :href="SITE_CONFIG.social.whatsapp" target="_blank" rel="noopener noreferrer" class="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-[var(--accent-color)] transition-colors" aria-label="WhatsApp"><i class="fab fa-whatsapp text-xs"></i></a></li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Bottom: Copyright -->
      <div class="border-t border-white/10 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/60">
        <p>&copy; 2026 Agro Farías. Todos los derechos reservados.</p>
        <div class="flex gap-4">
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

withDefaults(defineProps<{
  categorias?: Array<Pick<CategoriaWC, 'id' | 'name' | 'slug' | 'parent'>>
}>(), {
  categorias: () => [],
})
</script>
