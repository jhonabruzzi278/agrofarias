import { defineField, defineType } from 'sanity'

export const ctaType = defineType({
  name: 'cta',
  title: 'Call to Action',
  type: 'document',
  fields: [
    defineField({ name: 'titulo', title: 'Título', type: 'string', validation: rule => rule.required() }),
    defineField({ name: 'subtitulo', title: 'Subtítulo', type: 'text' }),
    defineField({ name: 'textoBoton', title: 'Texto del Botón', type: 'string' }),
    defineField({ name: 'urlBoton', title: 'URL del Botón', type: 'string' }),
    defineField({ name: 'imagenFondo', title: 'Imagen de Fondo', type: 'image' }),
    defineField({ name: 'activo', title: 'Activo', type: 'boolean', initialValue: true }),
  ],
  preview: { select: { title: 'titulo' } },
})
