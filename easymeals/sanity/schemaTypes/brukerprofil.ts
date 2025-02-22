import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'brukerprofil',
  title: 'Brukerprofil Innstillinger',
  type: 'document',
  fields: [
    defineField({
      name: 'kostholdsbehov',
      title: 'Kostholdsbehov',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'navn',
              title: 'Navn',
              type: 'string',
              validation: Rule => Rule.required()
            }),
            defineField({
              name: 'verdi',
              title: 'Verdi i systemet',
              type: 'string',
              validation: Rule => Rule.required()
            }),
            defineField({
              name: 'beskrivelse',
              title: 'Beskrivelse',
              type: 'text'
            })
          ],
          preview: {
            select: {
              title: 'navn',
              subtitle: 'beskrivelse'
            }
          }
        }
      ]
    }),
    defineField({
      name: 'vanligeAllergier',
      title: 'Vanlige Allergier',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'navn',
              title: 'Navn',
              type: 'string',
              validation: Rule => Rule.required()
            }),
            defineField({
              name: 'beskrivelse',
              title: 'Beskrivelse',
              type: 'text'
            }),
            // defineField({
            //   name: 'alvorlighetsgrad',
            //   title: 'Alvorlighetsgrad',
            //   type: 'string',
            //   options: {
            //     list: [
            //       { title: 'Mild', value: 'mild' },
            //       { title: 'Moderat', value: 'moderate' },
            //       { title: 'Alvorlig', value: 'severe' }
            //     ]
            //   }
            // })
          ],
        //   preview: {
        //     select: {
        //       title: 'navn',
        //       subtitle: 'alvorlighetsgrad'
        //     }
        //   }
        }
      ]
    }),
    defineField({
      name: 'kjokkenTyper',
      title: 'Kjøkkentyper',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'kategori' }]
        }
      ]
    }),

  ]
}) 