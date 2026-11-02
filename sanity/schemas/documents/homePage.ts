import { defineType } from 'sanity'
import { SECTION_OF } from '../sections'

// Singleton: the home page, built from an ordered `sections[]` list (the page builder).
export default defineType({
  name: 'homePage',
  title: 'Home page',
  type: 'document',
  groups: [
    { name: 'sections', title: 'סקשנים', default: true },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    { name: 'title', title: 'Internal title', type: 'string', initialValue: 'Home page', hidden: true },

    {
      name: 'sections',
      title: 'סקשנים (סדר הדף)',
      description: 'הדף נבנה מהרשימה הזו — אפשר להוסיף, להסיר ולגרור לשינוי סדר. עריכה נוחה עוד יותר דרך "עריכה חיה".',
      type: 'array',
      group: 'sections',
      of: SECTION_OF,
    },

    { name: 'seo', title: 'SEO & sharing', type: 'seo', group: 'seo' },
  ],
    },
    {
      name: 'badges', title: '[legacy] Badges', type: 'array', hidden: true, group: 'legacy',
      of: [{
        type: 'object',
        fields: [
          { name: 'text', type: 'string' },
          { name: 'icon', type: 'image' },
        ],
      }],
    },
    { name: 'featuresEyebrow', title: '[legacy] Features eyebrow', type: 'string', hidden: true, group: 'legacy' },
    { name: 'featuresTitle', title: '[legacy] Features title', type: 'headingBlock', hidden: true, group: 'legacy' },
    {
      name: 'positioning', title: '[legacy] Positioning', type: 'object', hidden: true, group: 'legacy',
      fields: [
        { name: 'eyebrow', type: 'string' },
        { name: 'title', type: 'headingBlock' },
        { name: 'text', type: 'blockContent' },
        { name: 'image', type: 'image', options: { hotspot: true } },
      ],
    },
    {
      name: 'history', title: '[legacy] History', type: 'object', hidden: true, group: 'legacy',
      fields: [
        { name: 'eyebrow', type: 'string' },
        { name: 'title', type: 'headingBlock' },
        { name: 'text', type: 'blockContent' },
        { name: 'backgroundImage', type: 'image', options: { hotspot: true } },
        {
          name: 'milestones', type: 'array',
          of: [{ type: 'object', fields: [{ name: 'year', type: 'string' }, { name: 'text', type: 'string' }] }],
        },
      ],
    },
    {
      name: 'experts', title: '[legacy] Experts', type: 'object', hidden: true, group: 'legacy',
      fields: [
        { name: 'eyebrow', type: 'string' },
        { name: 'title', type: 'headingBlock' },
        { name: 'bio', type: 'blockContent' },
      ],
    },
    {
      name: 'production', title: '[legacy] Production', type: 'object', hidden: true, group: 'legacy',
      fields: [
        { name: 'eyebrow', type: 'string' },
        { name: 'title', type: 'headingBlock' },
        { name: 'text', type: 'blockContent' },
        { name: 'image', type: 'image', options: { hotspot: true } },
        {
          name: 'steps', type: 'array',
          of: [{ type: 'object', fields: [{ name: 'number', type: 'string' }, { name: 'title', type: 'string' }, { name: 'detail', type: 'string' }] }],
        },
      ],
    },
    { name: 'productsEyebrow', title: '[legacy] Products eyebrow', type: 'string', hidden: true, group: 'legacy' },
    { name: 'productsTitle', title: '[legacy] Products title', type: 'headingBlock', hidden: true, group: 'legacy' },
    {
      name: 'productCards', title: '[legacy] Product cards', type: 'array', hidden: true, group: 'legacy',
      of: [{
        type: 'object',
        fields: [
          { name: 'name', type: 'string' },
          { name: 'tag', type: 'string' },
          { name: 'image', type: 'image', options: { hotspot: true } },
          { name: 'href', type: 'string' },
        ],
      }],
    },
    {
      name: 'productsCta', title: '[legacy] Products CTA', type: 'object', hidden: true, group: 'legacy',
      fields: [
        { name: 'label', type: 'string' },
        { name: 'href', type: 'string' },
      ],
    },
    {
      name: 'cta', title: '[legacy] Closing CTA', type: 'object', hidden: true, group: 'legacy',
      fields: [
        { name: 'title', type: 'headingBlock' },
        { name: 'buttonLabel', type: 'string' },
        { name: 'buttonHref', type: 'string' },
      ],
    },
  ],
  preview: { prepare: () => ({ title: 'Home page' }) },
})
