import { defineField, defineType } from 'sanity'
import { SectionIcon } from './icons'

type SectionType = 'hero' | 'recipeGrid' | 'categoryList' | 'featuredRecipes' | 'textContent' | 'userStats'
type LayoutType = 'grid' | 'list' | 'carousel'

const sectionTypes: Record<SectionType, string> = {
  hero: 'Hovedbanner',
  recipeGrid: 'Oppskriftsgrid',
  categoryList: 'Kategoriliste',
  featuredRecipes: 'Utvalgte Oppskrifter',
  textContent: 'Tekstinnhold',
  userStats: 'Brukerstatistikk'
}

const layoutTypes: Record<LayoutType, string> = {
  grid: 'Rutenett',
  list: 'Liste',
  carousel: 'Karusell'
}

export const sectionSchema = defineType({
  name: 'section',
  title: 'Seksjon',
  type: 'document',
  icon: SectionIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Seksjontittel',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'sectionType',
      title: 'Seksjontype',
      type: 'string',
      options: {
        list: [
          { title: 'Hovedbanner', value: 'hero' },
          { title: 'Oppskriftsgrid', value: 'recipeGrid' },
          { title: 'Kategoriliste', value: 'categoryList' },
          { title: 'Utvalgte Oppskrifter', value: 'featuredRecipes' },
          { title: 'Tekstinnhold', value: 'textContent' },
          { title: 'Brukerstatistikk', value: 'userStats' }
        ]
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'content',
      title: 'Innhold',
      type: 'object',
      fields: [
        defineField({
          name: 'heading',
          title: 'Overskrift',
          type: 'string'
        }),
        defineField({
          name: 'description',
          title: 'Beskrivelse',
          type: 'text'
        }),
        defineField({
          name: 'image',
          title: 'Bilde',
          type: 'image',
          options: { hotspot: true }
        }),
        defineField({
          name: 'items',
          title: 'Innholdselementer',
          type: 'array',
          of: [
            { type: 'reference', to: [
              { type: 'oppskrift' },
              { type: 'kategori' }
            ]}
          ]
        })
      ]
    }),
    defineField({
      name: 'settings',
      title: 'Innstillinger',
      type: 'object',
      fields: [
        defineField({
          name: 'backgroundColor',
          title: 'Bakgrunnsfarge',
          type: 'string'
        }),
        defineField({
          name: 'layout',
          title: 'Layoutstil',
          type: 'string',
          options: {
            list: [
              { title: 'Rutenett', value: 'grid' },
              { title: 'Liste', value: 'list' },
              { title: 'Karusell', value: 'carousel' }
            ]
          }
        }),
        defineField({
          name: 'maxItems',
          title: 'Maksimalt Antall',
          type: 'number'
        })
      ]
    })
  ],
  preview: {
    select: {
      title: 'title',
      type: 'sectionType'
    },
    prepare({ title, type }) {
      return {
        title,
        subtitle: `${sectionTypes[type as SectionType] || type} seksjon`
      }
    }
  }
}) 