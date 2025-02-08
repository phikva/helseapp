import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'tier',
  title: 'Abonnementsnivå',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Navn på nivå',
      type: 'string',
      description: 'Navn på abonnementsnivået (f.eks. Nivå 1, Nivå 2, Nivå 3)',
    }),
    defineField({
      name: 'description',
      title: 'Beskrivelse',
      type: 'text',
      description: 'Kort beskrivelse av abonnementsnivået og dets fordeler',
    }),
    defineField({
      name: 'recipeAccess',
      title: 'Oppskrifts-tilgang',
      type: 'object',
      fields: [
        defineField({
          name: 'accessType',
          title: 'Tilgangstype',
          type: 'string',
          options: {
            list: [
              { title: 'Begrenset', value: 'limited' },
              { title: 'Full', value: 'full' },
            ],
          },
          description: 'Angir om nivået har begrenset eller full tilgang til oppskriftsdatabasen',
        }),
        defineField({
          name: 'maxRecipes',
          title: 'Maks antall tilgjengelige oppskrifter',
          type: 'number',
          description: 'Maksimalt antall tilgjengelige oppskrifter for nivåer med begrenset tilgang',
          hidden: ({ parent }) => parent?.accessType === 'full',
        }),
      ],
    }),
    defineField({
      name: 'mealStorage',
      title: 'Lagring av måltider',
      type: 'object',
      fields: [
        defineField({
          name: 'storageDuration',
          title: 'Lagringsvarighet (dager)',
          type: 'string',
          description: 'Antall dager lagrede måltider kan beholdes (eller "uendelig" for full tilgang)',
          options: {
            list: [
              { title: '7 dager', value: '7' },
              { title: '30 dager', value: '30' },
              { title: 'Uendelig', value: 'uendelig' },
            ],
          },
        }),
      ],
    }),
    defineField({
      name: 'favoriteRecipes',
      title: 'Favorittoppskrifter',
      type: 'object',
      fields: [
        defineField({
          name: 'canFavorite',
          title: 'Kan lagre oppskrifter som favoritter',
          type: 'boolean',
          description: 'Tillater brukere å lagre oppskrifter som favoritter',
        }),
        defineField({
          name: 'maxFavorites',
          title: 'Maks antall favoritter',
          type: 'string',
          description: 'Maksimalt antall oppskrifter som kan lagres som favoritter (eller "uendelig" for full tilgang)',
          options: {
            list: [
              { title: '20 favoritter', value: '20' },
              { title: '50 favoritter', value: '50' },
              { title: 'Uendelig', value: 'uendelig' },
            ],
          },
          hidden: ({ parent }) => !parent?.canFavorite,
        }),
      ],
    }),
    defineField({
      name: 'expertMealPlanning',
      title: 'Ekspert måltidsplanlegging',
      type: 'boolean',
      description: 'Tilgang til ukentlige måltidsplaner fra en ekspert (kun for Nivå 3)',
    }),
  ],
}) 