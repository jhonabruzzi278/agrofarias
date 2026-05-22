import { defineField, defineType } from 'sanity'

export const contactoType = defineType({
  name: 'contacto',
  title: 'Información de Contacto',
  type: 'document',
  fields: [
    defineField({ name: 'empresa', title: 'Nombre de Empresa', type: 'string', validation: rule => rule.required() }),
    defineField({ name: 'direccion', title: 'Dirección', type: 'string' }),
    defineField({ name: 'telefono', title: 'Teléfono', type: 'string' }),
    defineField({ name: 'email', title: 'Email', type: 'string' }),
    defineField({ name: 'horarioAtencion', title: 'Horario de Atención', type: 'string' }),
    defineField({ name: 'facebook', title: 'Facebook URL', type: 'url' }),
    defineField({ name: 'instagram', title: 'Instagram URL', type: 'url' }),
    defineField({ name: 'linkedin', title: 'LinkedIn URL', type: 'url' }),
    defineField({ name: 'whatsapp', title: 'Número WhatsApp', type: 'string' }),
  ],
})
