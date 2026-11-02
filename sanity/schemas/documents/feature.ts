import { defineType } from 'sanity'
import { orderRankField } from '@sanity/orderable-document-list'

// Reusable benefit/feature. `icon` keys map to the bespoke SVGs in
// design-handoff/assets/benefit-icons/. There are exactly 8 brand benefits.
export default defineType({
  name: 'feature',
  title: 'Feature',
  type: 'document',
  fields: [
    // Drag-and-drop position (managed by the orderable list in the Studio desk).
    orderRankField({ type: 'feature' }),
    { name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() },
    { name: 'text', title: 'Text', type: 'text', rows: 2 },
    {
      name: 'icon',
      title: 'Icon',
      type: 'string',
      description: 'References a benefit SVG in design-handoff/assets/benefit-icons/.',
      options: {
        list: [
          { title: 'Stability', value: 'stability' },
          { title: 'Omega-3 50%', value: 'omega3-50' },
          { title: 'Vitamin E', value: 'vitamin-e' },
          { title: 'Vegan leaf', value: 'vegan-leaf' },
          { title: 'Polyphenols', value: 'polyphenols' },
          { title: 'Phytosterols', value: 'phytosterols' },
          { title: 'Balance', value: 'balance' },
          { title: 'Omega-9 25%', value: 'omega9-25' },
        ],
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'order',
      title: 'Order (legacy)',
      type: 'number',
      description: 'Fallback order until items are dragged in the orderable list.',
    },
  ],
  orderings: [
    { title: 'Display order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'title', subtitle: 'icon' },
  },
})
