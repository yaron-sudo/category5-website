import { defineType } from 'sanity'
import { orderRankField } from '@sanity/orderable-document-list'

// Product family (משפחת מוצרים). Renders at /category/<slug>; its colour
// tints the family's chips, cards and page accents across the site.
export default defineType({
  name: 'category',
  title: 'משפחת מוצרים',
  type: 'document',
  fields: [
    orderRankField({ type: 'category' }),
    { name: 'title', title: 'שם', type: 'string', validation: (R) => R.required() },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: (R) => R.required() },
    {
      name: 'color', title: 'צבע המשפחה', type: 'string',
      description: 'HEX, למשל #F26927. משמש לאקסנטים של המשפחה באתר.',
      validation: (R) => R.regex(/^#[0-9a-fA-F]{6}$/),
    },
    { name: 'icon', title: 'אייקון', type: 'image' },
    { name: 'image', title: 'תמונה ראשית', type: 'image', options: { hotspot: true } },
    { name: 'tagline', title: 'משפט פתיחה', type: 'text', rows: 2 },
    { name: 'body', title: 'תוכן', type: 'blockContent' },
    { name: 'seo', title: 'SEO & sharing', type: 'seo' },
  ],
  preview: { select: { title: 'title', media: 'icon', slug: 'slug.current' }, prepare: ({ title, media, slug }) => ({ title, media, subtitle: slug ? `/category/${slug}` : undefined }) },
})
