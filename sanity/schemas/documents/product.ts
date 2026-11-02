import { defineType } from 'sanity'
import { orderRankField } from '@sanity/orderable-document-list'

// Product page at /products/<slug>.
export const PRODUCT_BADGES = [
  { title: 'ללא GMO', value: 'gmo-free' },
  { title: 'טבעוני', value: 'vegan' },
  { title: 'כשר פרווה', value: 'parve' },
  { title: 'כשר בד״ץ', value: 'kosher-badatz' },
  { title: 'כשר', value: 'kosher' },
  { title: 'GMP', value: 'gmp' },
  { title: 'טכנולוגיה ליפוזומלית', value: 'liposomal' },
  { title: 'נבדק במיקרוסקופ אלקטרוני', value: 'microscope' },
  { title: 'ויטמין בנגזרת פעילה', value: 'vitamin' },
  { title: 'עבודת יד', value: 'handmade' },
  { title: 'שמן זית', value: 'olive-oil' },
]

export default defineType({
  name: 'product',
  title: 'מוצר',
  type: 'document',
  groups: [
    { name: 'content', title: 'תוכן', default: true },
    { name: 'details', title: 'שימוש ופרטים' },
    { name: 'media', title: 'מדיה וקבצים' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    orderRankField({ type: 'product' }),
    { name: 'name', title: 'שם המוצר', type: 'string', validation: (R) => R.required(), group: 'content' },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'name', maxLength: 96 }, validation: (R) => R.required(), group: 'content' },
    { name: 'category', title: 'משפחת מוצרים', type: 'reference', to: [{ type: 'category' }], validation: (R) => R.required(), group: 'content' },
    { name: 'isNew', title: 'מוצר חדש', type: 'boolean', initialValue: false, group: 'content' },
    { name: 'tagline', title: 'תת-כותרת', type: 'string', group: 'content' },
    { name: 'intro', title: 'תיאור קצר', type: 'text', rows: 4, group: 'content' },
    { name: 'benefits', title: 'יתרונות המוצר', type: 'array', of: [{ type: 'string' }], group: 'content' },
    { name: 'keyStats', title: 'נתונים בולטים', type: 'array', of: [{ type: 'keyStat' }], group: 'content' },
    { name: 'badges', title: 'תגים', type: 'array', of: [{ type: 'string' }], options: { list: PRODUCT_BADGES }, group: 'content' },
    { name: 'body', title: 'מידע נוסף (תוכן)', type: 'blockContent', group: 'content' },

    { name: 'dosage', title: 'המלצות שימוש', type: 'text', rows: 2, group: 'details' },
    {
      name: 'details', title: 'פרטי המוצר (כשרות, חיי מדף, אחסון...)', type: 'array', group: 'details',
      of: [{ type: 'object', fields: [{ name: 'label', type: 'string', title: 'כותרת' }, { name: 'value', type: 'string', title: 'ערך' }], preview: { select: { title: 'label', subtitle: 'value' } } }],
    },
    { name: 'warnings', title: 'אזהרות', type: 'array', of: [{ type: 'string' }], group: 'details' },
    { name: 'faqs', title: 'שאלות ותשובות למוצר', type: 'array', of: [{ type: 'faqItem' }], group: 'details' },

    {
      name: 'images', title: 'תמונות מוצר', type: 'array', group: 'media',
      of: [{ type: 'image', options: { hotspot: true }, fields: [{ name: 'alt', type: 'string', title: 'Alt' }, { name: 'caption', type: 'string', title: 'כיתוב (תמונה עם כיתוב = סריקת תווית)' }] }],
    },
    { name: 'video', title: 'וידאו (YouTube)', type: 'url', group: 'media' },
    {
      name: 'leaflet', title: 'עלון מוצר (PDF)', type: 'string', group: 'media',
      description: 'נתיב קבוע לקובץ, למשל /wp-content/uploads/2024/04/Lipozamin-Fe.pdf. קודי QR על האריזות מפנים לנתיבים האלה — אין לשנות.',
    },
    {
      name: 'extraDocs', title: 'מסמכים נוספים (PDF)', type: 'array', group: 'media',
      of: [{ type: 'object', fields: [{ name: 'label', type: 'string', title: 'כותרת' }, { name: 'href', type: 'string', title: 'נתיב / קישור' }], preview: { select: { title: 'label', subtitle: 'href' } } }],
    },
    {
      name: 'legacyPath', title: 'כתובת באתר הישן', type: 'string', group: 'seo', readOnly: true,
      description: 'הכתובת בוורדפרס הישן. מפנה (301) אוטומטית לעמוד הזה.',
    },
    { name: 'seo', title: 'SEO & sharing', type: 'seo', group: 'seo' },
  ],
  preview: {
    select: { title: 'name', slug: 'slug.current', media: 'images.0', cat: 'category.title' },
    prepare: ({ title, slug, media, cat }) => ({ title, subtitle: [cat, slug && `/products/${slug}`].filter(Boolean).join(' · '), media }),
  },
})
