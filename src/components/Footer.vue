<template>
  <footer class="main-footer bg-[#1B4332] text-white" role="contentinfo">
    <div class="large-container">
      <div class="widget-section py-16">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          <div class="footer-column">
            <a href="/" class="inline-block mb-5">
              <img src="/logo-agrofarias.png" alt="Agro Farías" class="h-10 brightness-0 invert" />
            </a>
            <p class="text-gray-200 text-sm leading-relaxed mb-5">Insumos, herramientas y soluciones agrícolas con atención personalizada y despacho confiable para productores chilenos.</p>

            <div class="flex items-center gap-3 p-4 bg-white/[0.07] rounded-lg mb-5">
              <div class="w-10 h-10 bg-[#F5B020] rounded-full flex items-center justify-center flex-shrink-0" aria-hidden="true">
                <i class="fas fa-phone text-[#1B4332] text-sm"></i>
              </div>
              <div>
                <a :href="'tel:' + telefono" class="text-white font-bold text-base hover:text-[#F5B020] transition-colors block">{{ telefono }}</a>
                <span class="text-sm text-gray-300">Lunes a Viernes 8-18</span>
              </div>
            </div>

            <ul class="flex gap-3">
              <li><a href="#" class="w-10 h-10 bg-white/[0.07] rounded-full flex items-center justify-center hover:bg-[#F5B020] hover:text-[#1B4332] transition-all duration-300 hover:-translate-y-1" aria-label="Facebook"><i class="fab fa-facebook-f text-sm"></i></a></li>
              <li><a href="#" class="w-10 h-10 bg-white/[0.07] rounded-full flex items-center justify-center hover:bg-[#F5B020] hover:text-[#1B4332] transition-all duration-300 hover:-translate-y-1" aria-label="Instagram"><i class="fab fa-instagram text-sm"></i></a></li>
              <li><a href="#" class="w-10 h-10 bg-white/[0.07] rounded-full flex items-center justify-center hover:bg-[#F5B020] hover:text-[#1B4332] transition-all duration-300 hover:-translate-y-1" aria-label="LinkedIn"><i class="fab fa-linkedin-in text-sm"></i></a></li>
              <li><a href="#" class="w-10 h-10 bg-white/[0.07] rounded-full flex items-center justify-center hover:bg-[#F5B020] hover:text-[#1B4332] transition-all duration-300 hover:-translate-y-1" aria-label="WhatsApp"><i class="fab fa-whatsapp text-sm"></i></a></li>
            </ul>
          </div>

          <div class="footer-column">
            <h4 class="text-base font-bold mb-6 relative">
              Categorías
              <span class="absolute -bottom-2 left-0 w-10 h-0.5 bg-[#F5B020]"></span>
            </h4>
            <ul class="space-y-3">
              <li v-for="cat in categorias" :key="cat.slug">
                <a :href="`/categoria/${cat.slug}`" class="text-gray-200 text-sm hover:text-[#F5B020] hover:pl-1.5 transition-all duration-200 flex items-center gap-2">
                  <i class="fas fa-chevron-right text-[6px] text-[#F5B020]" aria-hidden="true"></i>{{ cat.name }}
                </a>
              </li>
            </ul>
          </div>

          <div class="footer-column">
            <h4 class="text-base font-bold mb-6 relative">
              Enlaces Rápidos
              <span class="absolute -bottom-2 left-0 w-10 h-0.5 bg-[#F5B020]"></span>
            </h4>
            <ul class="space-y-3">
              <li><a href="/tienda" class="text-gray-200 text-sm hover:text-[#F5B020] hover:pl-1.5 transition-all duration-200 flex items-center gap-2"><i class="fas fa-chevron-right text-[6px] text-[#F5B020]" aria-hidden="true"></i>Tienda</a></li>
              <li><a href="/cotizacion" class="text-gray-200 text-sm hover:text-[#F5B020] hover:pl-1.5 transition-all duration-200 flex items-center gap-2"><i class="fas fa-chevron-right text-[6px] text-[#F5B020]" aria-hidden="true"></i>Cotización</a></li>
              <li><a href="/cotizar" class="text-gray-200 text-sm hover:text-[#F5B020] hover:pl-1.5 transition-all duration-200 flex items-center gap-2"><i class="fas fa-chevron-right text-[6px] text-[#F5B020]" aria-hidden="true"></i>Solicitar Presupuesto</a></li>
              <li><a href="/contacto" class="text-gray-200 text-sm hover:text-[#F5B020] hover:pl-1.5 transition-all duration-200 flex items-center gap-2"><i class="fas fa-chevron-right text-[6px] text-[#F5B020]" aria-hidden="true"></i>Contacto</a></li>
            </ul>
          </div>

          <div class="footer-column">
            <h4 class="text-base font-bold mb-6 relative">
              Horario de Atención
              <span class="absolute -bottom-2 left-0 w-10 h-0.5 bg-[#F5B020]"></span>
            </h4>
            <ul class="space-y-2">
              <li class="flex items-center justify-between p-3 bg-white/[0.07] rounded-lg">
                <span class="text-gray-200 text-sm">Lun a Vie</span>
                <span class="text-white font-bold text-sm">8:00 - 18:00</span>
              </li>
              <li class="flex items-center justify-between p-3 bg-white/[0.07] rounded-lg">
                <span class="text-gray-200 text-sm">Sábados</span>
                <span class="text-white font-bold text-sm">9:00 - 13:00</span>
              </li>
              <li class="flex items-center justify-between p-3 bg-white/[0.07] rounded-lg">
                <span class="text-gray-200 text-sm">Domingos</span>
                <span class="text-red-400 font-bold text-sm">Cerrado</span>
              </li>
            </ul>

            <div class="mt-4 p-4 bg-white/[0.07] rounded-lg space-y-2">
              <p class="text-gray-200 text-sm flex items-start gap-2">
                <i class="fas fa-map-marker-alt text-[#F5B020] mt-0.5"></i>{{ direccion }}
              </p>
              <p class="text-gray-200 text-sm flex items-center gap-2">
                <i class="fas fa-envelope text-[#F5B020]"></i>
                <a :href="'mailto:' + email" class="hover:text-[#F5B020] transition-colors">{{ email }}</a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="border-t border-white/[0.12] py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <p class="text-gray-300 text-sm">&copy; 2026 <a href="/" class="text-white hover:text-[#F5B020] transition-colors font-semibold">Agro Farías</a>. Todos los derechos reservados.</p>
        <div class="flex items-center gap-6 text-sm text-gray-200">
          <a href="#" class="hover:text-[#F5B020] transition-colors">Términos</a>
          <a href="#" class="hover:text-[#F5B020] transition-colors">Privacidad</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const categorias = [
  { slug: 'fertilizantes', name: 'Fertilizantes' },
  { slug: 'herbicidas', name: 'Herbicidas' },
  { slug: 'insecticidas', name: 'Insecticidas' },
  { slug: 'semillas', name: 'Semillas' },
  { slug: 'herramientas-y-repuestos', name: 'Herramientas' },
]
const telefono = '+56 9 1234 5678'
const direccion = 'Ruta 66 km 95850, San Pedro, Melipilla, Región Metropolitana'
const email = 'contacto@agrofarias.cl'
</script>