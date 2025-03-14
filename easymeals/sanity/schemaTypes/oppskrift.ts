import { defineField, defineType } from 'sanity'
import { RecipeIcon } from './icons'
import { Rule } from 'sanity'

export default defineType({
  name: 'oppskrift',
  title: 'Oppskrift',
  type: 'document',
  icon: RecipeIcon,
  fields: [
    defineField({
      name: 'tittel',
      title: 'Tittel',
      type: 'string',
      description: 'Navn på oppskrift',
    }),
    defineField({
      name: 'image',
      title: 'Oppskrift Bilde',
      type: 'image',
      options: {
        hotspot: true,
        accept: 'image/svg+xml,image/*',
        storeOriginalFilename: true,
        metadata: ['exif', 'location', 'lqip', 'palette', 'blurhash'],
      },
      description: 'Hovedbilde for oppskriften (støtter også SVG-filer)',
    }),
    defineField({
      name: 'porsjoner',
      title: 'Porsjoner',
      type: 'number',
      description: 'Antall porsjoner oppskriften er beregnet for',
      validation: Rule => Rule.required().min(1).integer(),
    }),
    defineField({
      name: 'kategori',
      title: 'Kategori',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'kategori' }] }],
      description: 'Velg en eller flere kategorier for denne oppskriften',
    }),
    defineField({
      name: 'ingrediens',
      title: 'Ingrediens',
      description: 'Legg til flere ingredienser',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'name', title: 'Ingrediens', type: 'string', description: 'Navn på ingrediens' }),
            defineField({
              name: 'measurement',
              title: 'Måling',
              type: 'object',
              fields: [
                defineField({
                  name: 'unit',
                  title: 'Enhet',
                  type: 'string',
                  options: {
                    list: [
                      { title: 'Gram', value: 'gram' },
                      { title: 'Liter', value: 'liter' },
                      { title: 'DL', value: 'dl' },
                      { title: 'KG', value: 'kg' },
                    ],
                  },
                  description: 'Velg enhet (Gram, Liter, DL, KG)',
                }),
                defineField({
                  name: 'unitQuantity',
                  title: 'Hvor mye',
                  type: 'number',
                  description: 'Oppgitt i valgte enhet. F.eks 100',
                }),
              ],
            }),
            defineField({
              name: 'mengde',
              title: 'Mengde',
              type: 'string',
              description: 'Egendefinert mengde, f.eks 2 SS eller 1 kopp',
            }),
            defineField({ name: 'kcal', title: 'Kalorier', type: 'number', description: 'antall kalorier' }),
            defineField({
              name: 'makros',
              title: 'Makros',
              type: 'object',
              fields: [
                defineField({ name: 'protein', title: 'Protein (g)', type: 'number' }),
                defineField({ name: 'karbs', title: 'Karbohydrater (g)', type: 'number' }),
                defineField({ name: 'fett', title: 'Fett (g)', type: 'number' }),
              ],
            }),
            defineField({ name: 'kommentar', title: 'Kommentar', type: 'string' }),
          ],
        },
      ],
    }),
    defineField({
      name: 'instruksjoner',
      title: 'Instruksjoner',
      type: 'array',
      of: [{ type: 'text' }],
      description: 'Steg-for-steg instruksjoner',
    }),
    defineField({
      name: 'notater',
      title: 'Notater',
      type: 'text',
      description: 'Ekstra notater',
    }),
    defineField({
      name: 'totalKcal',
      title: 'Totale Kalorier',
      type: 'number',
      description: 'Sum kalorier basert på ingredienser',
    }),
    defineField({
      name: 'totalMakros',
      title: 'Totale Makros',
      type: 'object',
      fields: [
        defineField({ name: 'protein', title: 'Total Protein (g)', type: 'number' }),
        defineField({ name: 'karbs', title: 'Total Karbohydrater (g)', type: 'number' }),
        defineField({ name: 'fett', title: 'Total Fett (g)', type: 'number' }),
      ],
    }),
  ],
}) 