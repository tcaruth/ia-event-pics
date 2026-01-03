import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'event',
    title: 'Event',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Event Title',
            type: 'string',
            validation: (Rule) => Rule.required(),
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
        }),
        defineField({
            name: 'date',
            title: 'Date',
            type: 'string',
        }),
        defineField({
            name: 'location',
            title: 'Location',
            type: 'string',
        }),
        defineField({
            name: 'primaryImage',
            title: 'Primary Image',
            type: 'image',
            options: {
                hotspot: true,
            },
        }),
        defineField({
            name: 'adminPassword',
            title: 'Admin Access Password',
            type: 'string',
            description: 'Password for event-specific admin access',
        }),
        defineField({
            name: 'fonts',
            title: 'Font Selection',
            type: 'object',
            fields: [
                defineField({
                    name: 'heading',
                    title: 'Heading Font',
                    type: 'string',
                    initialValue: 'sans-serif',
                }),
                defineField({
                    name: 'body',
                    title: 'Body Font',
                    type: 'string',
                    initialValue: 'sans-serif',
                }),
            ],
        }),
        defineField({
            name: 'colors',
            title: 'Color Scheme',
            type: 'object',
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
            name: 'gallery',
            title: 'Image Gallery',
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
