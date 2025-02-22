import { defineField, defineType } from 'sanity'
import { PageIcon } from './icons'

type PageType = 'home' | 'recipeList' | 'categoryList' | 'profile' | 'settings'

const pageTypes: Record<PageType, string> = {
  home: 'Hjem',
  recipeList: 'Oppskriftsliste',
  categoryList: 'Kategoriliste',
  profile: 'Profil',
  settings: 'Innstillinger'
}

export const pageSchema = defineType({
  name: 'page',
  title: 'Sider',
  type: 'document',
  icon: PageIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Sidetittel',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'slug',
      title: 'URL Lenke',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'pageType',
      title: 'Sidetype',
      type: 'string',
      options: {
        list: [
          { title: 'Hjem', value: 'home' },
          { title: 'Oppskriftsliste', value: 'recipeList' },
          { title: 'Kategoriliste', value: 'categoryList' },
          { title: 'Profil', value: 'profile' },
          { title: 'Innstillinger', value: 'settings' }
        ]
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'isActive',
      title: 'Side Aktiv',
      type: 'boolean',
      initialValue: true
    }),
    defineField({
      name: 'content',
      title: 'Sideinnhold',
      type: 'array',
      of: [
        { type: 'reference', to: [{ type: 'section' }] }
      ]
    })
  ],
  preview: {
    select: {
      title: 'title',
      pageType: 'pageType'
    },
    prepare({ title, pageType }) {
      return {
        title,
        subtitle: `${pageTypes[pageType as PageType] || pageType} side`
      }
    }
  }
}) 