import { defineType } from 'sanity'

// Headline stat pair, e.g. value "50%" / label "אומגה 3 (ALA)".
// Matches the StatBlock component prop shape from the design handoff.
export default defineType({
  name: 'keyStat',
  title: 'Key stat',
  type: 'object',
  fields: [
    { name: 'value', title: 'Value', type: 'string', validation: (Rule) => Rule.required() },
    { name: 'label', title: 'Label', type: 'string', validation: (Rule) => Rule.required() },
    {
      name: 'icon',
      title: 'Icon (optional)',
      type: 'string',
      description: 'Benefit icon key (astro/public/icons/benefit/<key>.svg), e.g. omega3-50, balance.',
    },
  ],
  preview: {
    select: { value: 'value', label: 'label' },
    prepare: ({ value, label }) => ({ title: `${value} — ${label}` }),
  },
})
