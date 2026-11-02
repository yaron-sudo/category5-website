// Section library — the page-builder building blocks. Every visible element on
// a page is a field on one of these; pages compose them in a `sections[]`
// array (add / remove / reorder in the Studio, click-to-edit in עריכה חיה).
import { defineType, defineField } from 'sanity'

const eyebrow = defineField({ name: 'eyebrow', type: 'string', title: 'Eyebrow (כותרת עליונה קטנה)' })
const title = defineField({ name: 'title', type: 'headingBlock', title: 'Title (כותרת)' })
const text = defineField({ name: 'text', type: 'blockContent', title: 'Text (טקסט)' })
const image = (name = 'image', t = 'Image (תמונה)') =>
  defineField({ name, type: 'image', title: t, options: { hotspot: true } })

const preview = (label: string, pick: Record<string, string> = {}) => ({
  select: { t: 'title.text', e: 'eyebrow', ...pick },
  prepare: (s: Record<string, string>) => ({ title: s.t || s.e || label, subtitle: label }),
})

export const heroCarousel = defineType({
  name: 'heroCarousel', type: 'object', title: 'קרוסלת פתיחה (Hero)',
  fields: [
    defineField({
      name: 'slides', type: 'array', title: 'Slides (שקופיות)',
      of: [{
        type: 'object',
        fields: [
          image('image', 'Image (תמונה)'),
          { name: 'eyebrow', type: 'string', title: 'Eyebrow' },
          { name: 'title', type: 'string', title: 'Title (כותרת ראשית)' },
          { name: 'text', type: 'text', rows: 2, title: 'Text (משפט תיאור)' },
          { name: 'ctaLabel', type: 'string', title: 'Button label (כפתור)' },
          { name: 'ctaHref', type: 'string', title: 'Button link' },
        ],
        preview: { select: { title: 'title', subtitle: 'text', media: 'image' } },
      }],
    }),
    defineField({ name: 'kicker', type: 'string', title: 'Kicker (שורה לטינית תחתונה)' }),
  ],
  preview: { select: { s0: 'slides.0.title' }, prepare: (s) => ({ title: s.s0 || 'Hero', subtitle: 'קרוסלת פתיחה' }) },
})

export const statsBand = defineType({
  name: 'statsBand', type: 'object', title: 'רצועת נתונים (Stats)',
  fields: [defineField({ name: 'stats', type: 'array', title: 'Stats', of: [{ type: 'keyStat' }] })],
  preview: { select: { v: 'stats.0.value' }, prepare: (s) => ({ title: s.v ? `${s.v} …` : 'Stats', subtitle: 'רצועת נתונים' }) },
})

export const storyDual = defineType({
  name: 'storyDual', type: 'object', title: 'הסיפור שלנו (שתי שורות)',
  fields: [eyebrow, title, text, image('image', 'Image — first row'), image('imageSecond', 'Image — second row')],
  preview: preview('הסיפור שלנו'),
})

export const badgeRow = defineType({
  name: 'badgeRow', type: 'object', title: 'רצועת תגים (Badges)',
  fields: [
    defineField({
      name: 'badges', type: 'array', title: 'Badges',
      of: [{
        type: 'object',
        fields: [
          { name: 'text', type: 'string', title: 'Text', validation: (R: any) => R.required() },
          image('icon', 'Icon (optional)'),
        ],
        preview: { select: { title: 'text', media: 'icon' } },
      }],
    }),
  ],
  preview: { select: { b: 'badges.0.text' }, prepare: (s) => ({ title: s.b || 'Badges', subtitle: 'רצועת תגים' }) },
})

export const featureGrid = defineType({
  name: 'featureGrid', type: 'object', title: 'רשת תכונות (Features)',
  description: 'הכרטיסים עצמם נערכים תחת "תכונות / יתרונות" בתפריט דף הבית.',
  fields: [eyebrow, title],
  preview: preview('רשת תכונות'),
})

export const splitPanel = defineType({
  name: 'splitPanel', type: 'object', title: 'טקסט + תמונה (Split)',
  fields: [
    eyebrow, title, text, image(),
    defineField({ name: 'reverse', type: 'boolean', title: 'Text first (טקסט בצד ימין)', initialValue: false }),
  ],
  preview: preview('טקסט + תמונה'),
})

export const stepsPanel = defineType({
  name: 'stepsPanel', type: 'object', title: 'שלבי תהליך (Steps)',
  fields: [
    eyebrow, title, text, image(),
    defineField({
      name: 'steps', type: 'array', title: 'Steps (שלבים)',
      of: [{
        type: 'object',
        fields: [
          { name: 'number', type: 'string', title: 'Number' },
          { name: 'title', type: 'string', title: 'Title' },
          { name: 'detail', type: 'string', title: 'Detail' },
        ],
        preview: { select: { title: 'title', subtitle: 'detail' } },
      }],
    }),
  ],
  preview: preview('שלבי תהליך'),
})

export const historySection = defineType({
  name: 'historySection', type: 'object', title: 'היסטוריה (רקע מלא)',
  fields: [
    eyebrow, title, text, image('backgroundImage', 'Background image (תמונת רקע)'),
    defineField({
      name: 'milestones', type: 'array', title: 'Milestones (ציוני דרך)',
      of: [{
        type: 'object',
        fields: [
          { name: 'year', type: 'string', title: 'Year' },
          { name: 'text', type: 'string', title: 'Text' },
        ],
        preview: { select: { title: 'year', subtitle: 'text' } },
      }],
    }),
  ],
  preview: preview('היסטוריה'),
})

export const videoSection = defineType({
  name: 'videoSection', type: 'object', title: 'וידאו (רוחב מלא)',
  fields: [
    defineField({ name: 'url', type: 'url', title: 'YouTube URL' }),
    defineField({ name: 'videoTitle', type: 'string', title: 'Title (כיתוב על הווידאו)' }),
    image('poster', 'Poster (תמונת פתיחה)'),
  ],
  preview: { select: { t: 'videoTitle' }, prepare: (s) => ({ title: s.t || 'Video', subtitle: 'וידאו' }) },
})

export const testimonialSection = defineType({
  name: 'testimonialSection', type: 'object', title: 'המלצות מומחים',
  description: 'המומחים עצמם נערכים תחת "מומחים" בתפריט דף הבית.',
  fields: [eyebrow, title],
  preview: preview('המלצות מומחים'),
})

export const productGrid = defineType({
  name: 'productGrid', type: 'object', title: 'רשת מוצרים',
  fields: [
    eyebrow, title,
    defineField({ name: 'ctaLabel', type: 'string', title: 'Button label' }),
    defineField({ name: 'ctaHref', type: 'string', title: 'Button link' }),
    defineField({
      name: 'cards', type: 'array', title: 'Product cards (כרטיסים)',
      of: [{
        type: 'object',
        fields: [
          { name: 'name', type: 'string', title: 'Name' },
          { name: 'tag', type: 'string', title: 'Tag (שורת משנה)' },
          image('image', 'Product image'),
          { name: 'href', type: 'string', title: 'Link' },
        ],
        preview: { select: { title: 'name', subtitle: 'tag', media: 'image' } },
      }],
    }),
  ],
  preview: preview('רשת מוצרים'),
})

export const ctaBand = defineType({
  name: 'ctaBand', type: 'object', title: 'רצועת קריאה לפעולה (CTA)',
  fields: [
    title,
    defineField({ name: 'buttonLabel', type: 'string', title: 'Button label' }),
    defineField({ name: 'buttonHref', type: 'string', title: 'Button link' }),
  ],
  preview: preview('CTA'),
})

export const richTextSection = defineType({
  name: 'richTextSection', type: 'object', title: 'טקסט חופשי',
  fields: [defineField({ name: 'content', type: 'blockContent', title: 'Content' })],
  preview: { prepare: () => ({ title: 'טקסט חופשי' }) },
})

export const categoryShowcase = defineType({
  name: 'categoryShowcase', type: 'object', title: 'משפחות מוצרים (אוטומטי)',
  description: 'רשת משפחות המוצרים + קרוסלת מוצרים לכל משפחה. התוכן נמשך אוטומטית ממשפחות המוצרים והמוצרים.',
  fields: [
    eyebrow, title,
    defineField({ name: 'showCarousels', type: 'boolean', title: 'להציג קרוסלת מוצרים לכל משפחה', initialValue: true }),
    defineField({ name: 'showNew', type: 'boolean', title: 'להציג קרוסלת "מוצרים חדשים" בראש', initialValue: true }),
  ],
  preview: preview('משפחות מוצרים'),
})

export const sectionTypes = [
  categoryShowcase,
  heroCarousel, statsBand, storyDual, badgeRow, featureGrid, splitPanel,
  stepsPanel, historySection, videoSection, testimonialSection, productGrid,
  ctaBand, richTextSection,
]

// The `of` list for any page's sections[] array.
export const SECTION_OF = sectionTypes.map((t) => ({ type: t.name }))
