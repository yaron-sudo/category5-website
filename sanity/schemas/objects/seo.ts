import { defineType } from 'sanity'

// Reusable per-document SEO block. Every field is optional — the frontend
// auto-derives sensible values from the page content when these are empty.
export default defineType({
  name: 'seo',
  title: 'SEO & social sharing',
  type: 'object',
  options: { collapsible: true, collapsed: true },
  fields: [
    {
      name: 'metaTitle', title: 'Meta title', type: 'string',
      description: 'Overrides the page title in search results. ~60 characters.',
      validation: (R) => R.max(70).warning('Keep under ~60 characters for Google.'),
    },
    {
      name: 'metaDescription', title: 'Meta description', type: 'text', rows: 2,
      description: 'Search-result snippet. ~155 characters. Left empty → auto-generated from the page.',
      validation: (R) => R.max(170).warning('Keep under ~155 characters.'),
    },
    {
      name: 'ogTitle', title: 'Social share title', type: 'string',
      description: 'Title used when shared on WhatsApp/Facebook. Empty → meta title.',
    },
    {
      name: 'ogDescription', title: 'Social share description', type: 'text', rows: 2,
      description: 'Description used when shared. Empty → meta description.',
    },
    {
      name: 'ogImage', title: 'Social share image', type: 'image',
      description: '1200×630 recommended. Falls back to the brand default if empty.',
      options: { hotspot: true },
    },
    {
      name: 'canonical', title: 'Canonical URL', type: 'url',
      description: 'Only set when this page duplicates content that lives at another URL.',
    },
    {
      name: 'noindex', title: 'Hide from search engines', type: 'boolean',
      description: 'Adds noindex — use for thank-you / utility pages only.',
      initialValue: false,
    },
  ],
})
