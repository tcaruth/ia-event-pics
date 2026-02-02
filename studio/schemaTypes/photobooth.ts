import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'photobooth',
  title: 'Photobooth',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Booth Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'activeEvent',
      title: 'Active Event',
      type: 'reference',
      to: [{type: 'event'}],
      description: 'The event currently assigned to this photobooth',
    }),
  ],
})
