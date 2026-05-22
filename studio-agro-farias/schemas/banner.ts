import { defineField, defineType } from 'sanity'

export const bannerType = defineType({
  name: 'banner',
  title: 'Banner Hero',
  type: 'document',
  fields: [
    defineField({ name: 'titulo', title: 'Título Principal', type: 'string', validation: rule => rule.required() }),
    defineField({ name: 'subtitulo', title: 'Subtítulo', type: 'text' }),
    defineField({ name: 'imagen', title: 'Imagen de Fondo', type: 'image', options: { hotspot: true }, validation: rule => rule.required() }),
    defineField({ name: 'textoBoton', title: 'Texto del Botón', type: 'string' }),
    defineField({ name: 'urlBoton', title: 'URL del Botón', type: 'string' }),
    defineField({ name: 'activo', title: 'Activo', type: 'boolean', initialValue: true }),
    defineField({ name: 'orden', title: 'Orden', type: 'number', initialValue: 0 }),
  ],
  preview: { select: { title: 'titulo', media: 'imagen' } },
})
