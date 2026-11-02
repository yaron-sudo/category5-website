import { defineType, defineArrayMember } from 'sanity'

// Portable Text body. Mirrors what migration/03_html_to_portable.mjs emits:
// `block` items (h2..h4, normal, blockquote, lists) with optional `link` marks,
// plus `image` items (asset reference + alt). RTL Hebrew content.
// Extra editorial blocks (youtube / ctaButton / callout) are rendered by
// astro/src/lib/portableText.ts — add a renderer there for any new type here.
export default defineType({
  name: 'blockContent',
  title: 'Body',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'Lead (large)', value: 'lead' },
        { title: 'Small', value: 'small' },
        { title: 'H2', value: 'h2' },
        { title: 'H3', value: 'h3' },
        { title: 'H4', value: 'h4' },
        { title: 'Quote', value: 'blockquote' },
      ],
      lists: [
        { title: 'Bullet', value: 'bullet' },
        { title: 'Numbered', value: 'number' },
      ],
      marks: {
        decorators: [
          { title: 'Strong', value: 'strong' },
          { title: 'Emphasis', value: 'em' },
          { title: 'Underline', value: 'underline' },
        ],
        annotations: [
          {
            name: 'link',
            type: 'object',
            title: 'Link',
            fields: [
              {
                name: 'href',
                type: 'url',
                title: 'URL',
                validation: (Rule) =>
                  Rule.uri({ allowRelative: true, scheme: ['http', 'https', 'mailto', 'tel'] }),
              },
              {
                name: 'blank',
                type: 'boolean',
                title: 'Open in new tab',
                initialValue: false,
              },
            ],
          },
        ],
      },
    }),
    defineArrayMember({
      type: 'image',
      options: { hotspot: true },
      fields: [
        { name: 'alt', type: 'string', title: 'Alt text' },
        { name: 'caption', type: 'string', title: 'Caption (shown under the image)' },
      ],
    }),
    defineArrayMember({
      type: 'object',
      name: 'youtube',
      title: 'YouTube video',
      fields: [
        {
          name: 'url',
          type: 'url',
          title: 'YouTube URL',
          validation: (Rule) => Rule.required(),
        },
        { name: 'caption', type: 'string', title: 'Caption (optional)' },
      ],
      preview: {
        select: { title: 'url', subtitle: 'caption' },
        prepare: ({ title, subtitle }) => ({ title: subtitle || 'YouTube video', subtitle: title }),
      },
    }),
    defineArrayMember({
      type: 'object',
      name: 'ctaButton',
      title: 'Button (CTA)',
      fields: [
        { name: 'label', type: 'string', title: 'Label', validation: (Rule) => Rule.required() },
        {
          name: 'href',
          type: 'string',
          title: 'Link',
          description: 'Internal path (/product) or full URL.',
          validation: (Rule) => Rule.required(),
        },
        {
          name: 'variant',
          type: 'string',
          title: 'Style',
          options: {
            list: [
              { title: 'מלא (כתום)', value: 'solid' },
              { title: 'מתאר (ירוק)', value: 'outline' },
            ],
            layout: 'radio',
            direction: 'horizontal',
          },
          initialValue: 'solid',
        },
      ],
      preview: {
        select: { title: 'label', subtitle: 'href' },
      },
    }),
    defineArrayMember({
      type: 'object',
      name: 'callout',
      title: 'Callout (highlight box)',
      fields: [
        { name: 'title', type: 'string', title: 'Title (optional)' },
        { name: 'text', type: 'text', rows: 3, title: 'Text', validation: (Rule) => Rule.required() },
        {
          name: 'tone',
          type: 'string',
          title: 'Tone',
          options: {
            list: [
              { title: 'ירוק (מידע)', value: 'info' },
              { title: 'כתום (חשוב)', value: 'warning' },
            ],
            layout: 'radio',
            direction: 'horizontal',
          },
          initialValue: 'info',
        },
      ],
      preview: {
        select: { title: 'title', subtitle: 'text' },
        prepare: ({ title, subtitle }) => ({ title: title || 'Callout', subtitle }),
      },
    }),
  ],
})
