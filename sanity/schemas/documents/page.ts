import { defineType } from 'sanity'
import { SECTION_OF } from '../sections'

// Generic content page: home, compare, faq, contact, stores, terms, privacy,
// cookies, the-herb, production, omega-3-index, experts.
export default defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  groups: [
    { name: 'content', title: 'תוכן', default: true },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    { name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required(), group: 'content' },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'URL path segment, e.g. "compare", "faq", or "home" for /.',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
      group: 'content',
    },
    {
      name: 'heroImage', title: 'Hero image', type: 'image', options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Alt text' }],
      group: 'content',
    },
    {
      name: 'sections',
      title: 'סקשנים (page builder)',
      description: 'אופציונלי: בניית הדף מסקשנים מעוצבים. אם ריק — מוצג ה-Body שלמטה.',
      type: 'array',
      of: SECTION_OF,
      group: 'content',
    },
    { name: 'body', title: 'Body', type: 'blockContent', group: 'content' },
    {
      name: 'faqs',
      title: 'FAQ items',
      type: 'array',
      of: [{ type: 'faqItem' }],
      description: 'For the FAQ page (and any page with a Q&A section). Rendered with FAQPage JSON-LD.',
      group: 'content',
    },

    { name: 'seoDescription', title: 'SEO description (legacy)', type: 'text', rows: 3, group: 'seo', hidden: true },
    { name: 'seo', title: 'SEO & sharing', type: 'seo', group: 'seo' },
  ],
  preview: {
    select: { title: 'title', slug: 'slug.current' },
    prepare: ({ title, slug }) => ({ title, subtitle: slug ? `/${slug}` : undefined }),
  },
})
