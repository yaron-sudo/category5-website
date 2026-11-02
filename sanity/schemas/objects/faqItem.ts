import { defineType } from 'sanity'

// Question/answer pair — used on the FAQ page and on product pages.
// The frontend also emits FAQPage JSON-LD from these.
export default defineType({
  name: 'faqItem',
  title: 'FAQ item',
  type: 'object',
  fields: [
    { name: 'question', title: 'Question', type: 'string', validation: (R) => R.required() },
    { name: 'answer', title: 'Answer', type: 'text', rows: 4, validation: (R) => R.required() },
  ],
  preview: {
    select: { title: 'question', subtitle: 'answer' },
  },
})
