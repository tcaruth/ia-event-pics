import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'event',
  title: 'Event',
  type: 'document',
  groups: [
    {
      name: 'event',
      title: 'Event',
    },
    {
      name: 'design',
      title: 'Design',
    },
    {
      name: 'admin',
      title: 'Admin',
    },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Event Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      group: 'event',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
      group: 'event',
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'string',
      group: 'event',
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      group: 'event',
    }),
    defineField({
      name: 'captures',
      title: 'Captures',
      type: 'array',
      of: [{ type: 'number' }],
      initialValue: [1, 4],
      validation: (Rule) => Rule.unique().required().max(2),
      description: 'The number of captures for this event.',
      group: 'event',
    }),
    defineField({
      name: 'primaryImage',
      title: 'Primary Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      group: 'event',
    }),
    defineField({
      name: 'adminPassword',
      title: 'Admin Access Password',
      type: 'string',
      description: 'Password for event-specific admin access',
      group: 'admin',
    }),
    defineField({
      name: 'fonts',
      title: 'Font Selection',
      type: 'object',
      group: 'design',
      fields: [
        defineField({
          name: 'heading',
          title: 'Heading Font',
          type: 'string',
          options: {
            list: [
              { title: 'Inter (Standard)', value: '"Inter", sans-serif' },
              { title: 'Outfit (Modern Sans)', value: '"Outfit", sans-serif' },
              { title: 'Playfair Display (Elegant Serif)', value: '"Playfair Display", serif' },
              { title: 'Pacifico (Fun Script)', value: '"Pacifico", cursive' },
              { title: 'Arvo (Classic Slab)', value: '"Arvo", serif' },
              { title: 'Plus Jakarta Sans (Professional)', value: '"Plus Jakarta Sans", sans-serif' },
              { title: 'Bungee (Bold Display)', value: '"Bungee", cursive' },
              { title: 'Cormorant Garamond (Fine Serif)', value: '"Cormorant Garamond", serif' },
              { title: 'Romantically (Script)', value: '"Romantically", "Cormorant Garamond", serif' },
            ],
          },
          initialValue: '"Inter", sans-serif',
        }),
        defineField({
          name: 'body',
          title: 'Body Font',
          type: 'string',
          options: {
            list: [
              { title: 'Inter (Clean)', value: '"Inter", sans-serif' },
              { title: 'Plus Jakarta Sans (Modern)', value: '"Plus Jakarta Sans", sans-serif' },
              { title: 'Lora (Classic Serif)', value: '"Lora", serif' },
              { title: 'Work Sans (Reliable)', value: '"Work Sans", sans-serif' },
            ],
          },
          initialValue: '"Inter", sans-serif',
        }),
      ],
    }),
    defineField({
      name: 'colors',
      title: 'Color Scheme',
      type: 'object',
      group: 'design',
      fields: [
        defineField({ name: 'primary', title: 'Primary Color', type: 'string', initialValue: '#0153A4' }),
        defineField({ name: 'primaryText', title: 'Primary Text Color', type: 'string', initialValue: 'white' }),
        defineField({ name: 'secondary', title: 'Secondary Color', type: 'string', initialValue: '#fe6100' }),
        defineField({ name: 'secondaryText', title: 'Secondary Text Color', type: 'string', initialValue: 'black' }),
        defineField({ name: 'surface', title: 'Surface Color', type: 'string', initialValue: 'black' }),
        defineField({ name: 'surfaceText', title: 'Surface Text Color', type: 'string', initialValue: 'white' }),
      ],
    }),
    defineField({
      name: 'theme',
      title: 'Theme Preference',
      type: 'string',
      options: {
        list: [
          { title: 'Light', value: 'light' },
          { title: 'Dark', value: 'dark' },
        ],
        layout: 'radio',
      },
      initialValue: 'dark',
      group: 'design',
    }),
    defineField({
      name: 'overlay',
      title: 'Overlay Image',
      type: 'image',
      description: 'Upload a specific overlay for this event (must be a transparent PNG).',
      group: 'design',
    }),
    defineField({
      name: 'template',
      title: 'Photo Template',
      type: 'file',
      description: 'Upload a XML template for this event. Be sure the XML matches the number of captures above.',
      group: 'event',
      options: {
        accept: '.xml',
      }
    }),
    defineField({
      name: 'gallery',
      title: 'Image Gallery',
      group: 'event',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
          },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative Text',
            },
            {
              name: 'created',
              type: 'datetime',
              title: 'Created At',
            }
          ],
        },
      ],
    }),
  ],
})
