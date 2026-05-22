import { defineField, defineType } from 'sanity'

export const categoriaDestacadaType = defineType({
  name: 'categoriaDestacada',
  title: 'Categoría Destacada',
  type: 'document',
  fields: [
    defineField({ name: 'nombre', title: 'Nombre', type: 'string', validation: rule => rule.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'nombre' } }),
    defineField({ name: 'icono', title: 'Ícono', type: 'image' }),
    defineField({ name: 'descripcion', title: 'Descripción', type: 'text' }),
    defineField({ name: 'woocommerceId', title: 'ID en WooCommerce', type: 'number' }),
    defineField({ name: 'activo', title: 'Activo en Home', type: 'boolean', initialValue: true }),
    defineField({ name: 'orden', title: 'Orden', type: 'number', initialValue: 0 }),
  ],
  preview: { select: { title: 'nombre', media: 'icono' } },
})
