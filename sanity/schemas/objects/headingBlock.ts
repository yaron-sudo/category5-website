import { defineType } from 'sanity'

// A heading whose text, semantic HTML tag, and visual size are all editor-controlled.
// Rendered by astro/src/components/Heading.astro.
export default defineType({
  name: 'headingBlock',
  title: 'Heading',
  type: 'object',
  options: { columns: 3 },
  fields: [
    { name: 'text', title: 'Text', type: 'string', validation: (Rule) => Rule.required() },
    {
      name: 'level', title: 'HTML tag', type: 'string',
      description: 'Semantic tag (affects SEO/accessibility, not size).',
      options: {
        list: [
          { title: 'H1', value: 'h1' }, { title: 'H2', value: 'h2' },
          { title: 'H3', value: 'h3' }, { title: 'H4', value: 'h4' },
          { title: 'Paragraph', value: 'p' },
        ],
        layout: 'radio', direction: 'horizontal',
      },
      initialValue: 'h2',
    },
    {
      name: 'size', title: 'Size', type: 'string',
      options: {
        list: [
          { title: 'Small', value: 'sm' }, { title: 'Medium', value: 'md' },
          { title: 'Large', value: 'lg' }, { title: 'XL', value: 'xl' },
          { title: '2XL', value: '2xl' }, { title: '3XL', value: '3xl' },
        ],
      },
      initialValue: 'xl',
    },
  ],
  preview: {
    select: { title: 'text', level: 'level', size: 'size' },
    prepare: ({ title, level, size }) => ({ title, subtitle: `${level || 'h2'} · ${size || 'xl'}` }),
  },
})
