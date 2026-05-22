import { defineField, defineType } from 'sanity'

export const promoBannerType = defineType({
  name: 'promoBanner',
  title: 'Banner Promocional',
  type: 'document',
  fields: [
    defineField({ name: 'titulo', title: 'Título', type: 'string', validation: rule => rule.required() }),
    defineField({ name: 'subtitulo', title: 'Tag/Etiqueta', type: 'string' }),
    defineField({ name: 'precio', title: 'Texto de Precio', type: 'string' }),
    defineField({ name: 'textoBoton', title: 'Texto del Botón', type: 'string' }),
    defineField({ name: 'urlBoton', title: 'URL del Botón', type: 'string' }),
    defineField({ name: 'imagen', title: 'Imagen del Producto', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'activo', title: 'Activo', type: 'boolean', initialValue: true }),
    defineField({ name: 'orden', title: 'Orden', type: 'number', initialValue: 0 }),
  ],
  preview: { select: { title: 'titulo', media: 'imagen' } },
})
