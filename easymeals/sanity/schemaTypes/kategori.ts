import { defineField, defineType } from 'sanity'
import { CategoryIcon } from './icons'

export default defineType({
  name: 'kategori',
  title: 'Kategori',
  type: 'document',
  icon: CategoryIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Kategori Navn',
      type: 'string',
      description: 'Navn på kategorien',
    }),
    defineField({
      name: 'image',
      title: 'Kategori Bilde',
      type: 'image',
      options: {
        hotspot: true,
      },
      description: 'Bilde for kategorien',
    }),
  ],
}) 