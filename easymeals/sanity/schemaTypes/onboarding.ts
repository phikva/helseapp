import { defineField, defineType } from 'sanity'
import { OnboardingIcon } from './icons'

export const onboardingScreenSchema = defineType({
  name: 'onboardingScreenItem',
  title: 'Onboarding Skjerm',
  type: 'document',
  icon: OnboardingIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'isActive',
      title: 'Is Active',
      type: 'boolean',
      initialValue: true
    })
  ],
  preview: {
    select: {
      title: 'title',
      media: 'image'
    }
  }
})

export const onboardingPageSchema = defineType({
  name: 'onboardingPage',
  title: 'Onboarding Oppsett',
  type: 'document',
  icon: OnboardingIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Page Name',
      type: 'string',
      initialValue: 'Main Onboarding',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'isEnabled',
      title: 'Enable Onboarding',
      type: 'boolean',
      initialValue: true,
      description: 'Toggle to show/hide onboarding for users'
    }),
    defineField({
      name: 'selectedScreens',
      title: 'Select and Order Screens',
      type: 'array',
      of: [{
        type: 'reference',
        to: [{ type: 'onboardingScreenItem' }]
      }],
      validation: Rule => Rule.required().min(1).error('At least one screen must be selected'),
      options: {
        layout: 'grid'
      }
    })
  ],
  preview: {
    select: {
      title: 'name',
      screensCount: 'selectedScreens.length',
      isEnabled: 'isEnabled'
    },
    prepare({ title, screensCount = 0, isEnabled }) {
      return {
        title,
        subtitle: `${isEnabled ? 'Active' : 'Disabled'} • ${screensCount} screen${screensCount === 1 ? '' : 's'}`
      }
    }
  }
})

export default [onboardingScreenSchema, onboardingPageSchema] 