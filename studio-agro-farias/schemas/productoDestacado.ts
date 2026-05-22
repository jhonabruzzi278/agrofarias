import { defineField, defineType } from 'sanity'

export const productoDestacadoType = defineType({
  name: 'productoDestacado',
  title: 'Producto Destacado',
  type: 'document',
  fields: [
    defineField({ name: 'nombre', title: 'Nombre', type: 'string', validation: rule => rule.required() }),
    defineField({ name: 'descripcion', title: 'Descripción', type: 'text' }),
    defineField({ name: 'imagen', title: 'Imagen Principal', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'galeria', title: 'Galería de Imágenes', type: 'array', of: [{ type: 'image' }] }),
    defineField({ name: 'woocommerceId', title: 'ID en WooCommerce', type: 'number' }),
    defineField({ name: 'categoria', title: 'Categoría', type: 'string' }),
    defineField({ name: 'destacado', title: 'Destacado en Home', type: 'boolean', initialValue: true }),
    defineField({ name: 'orden', title: 'Orden', type: 'number', initialValue: 0 }),
  ],
  preview: { select: { title: 'nombre', media: 'imagen' } },
})
