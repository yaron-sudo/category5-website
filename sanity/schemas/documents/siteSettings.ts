import { defineType } from 'sanity'

// Singleton: brand-wide settings used across the site chrome.
export default defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  groups: [
    { name: 'brand', title: 'מותג', default: true },
    { name: 'hero', title: 'Hero ווידאו' },
    { name: 'nav', title: 'תפריט ניווט' },
    { name: 'footer', title: 'פוטר' },
    { name: 'contact', title: 'יצירת קשר וחנויות' },
    { name: 'tracking', title: 'פיקסלים ומעקב' },
  ],
  fields: [
    { name: 'brandName', title: 'Brand name', type: 'string', group: 'brand' },
    { name: 'tagline', title: 'Tagline', type: 'string', group: 'brand' },
    { name: 'logo', title: 'Logo (SVG)', type: 'image', group: 'brand' },
    {
      name: 'announcement',
      title: 'Announcement bar (פס הודעה עליון)',
      type: 'object',
      group: 'brand',
      options: { collapsible: true, collapsed: true },
      fields: [
        { name: 'enabled', title: 'Show the bar', type: 'boolean', initialValue: false },
        { name: 'text', title: 'Text', type: 'string' },
        { name: 'href', title: 'Link (optional)', type: 'string' },
      ],
    },
    {
      name: 'typography',
      title: 'Typography (fonts)',
      type: 'object',
      group: 'brand',
      description: 'Choose the display (headings) and body fonts site-wide.',
      options: { columns: 2 },
      fields: [
        {
          name: 'displayFont', title: 'Display / headings', type: 'string',
          options: { list: [
            { title: 'Alpha (brand)', value: 'alpha' },
            { title: 'Heebo', value: 'heebo' },
            { title: 'Assistant', value: 'assistant' },
            { title: 'Rubik', value: 'rubik' },
          ] },
          initialValue: 'alpha',
        },
        {
          name: 'bodyFont', title: 'Body text', type: 'string',
          options: { list: [
            { title: 'Alpha (brand)', value: 'alpha' },
            { title: 'Heebo', value: 'heebo' },
            { title: 'Assistant', value: 'assistant' },
            { title: 'Rubik', value: 'rubik' },
          ] },
          initialValue: 'alpha',
        },
      ],
    },
    {
      name: 'heroKicker',
      title: 'Hero kicker (שורת פתיחה קטנה מעל הכותרת)',
      type: 'string',
      group: 'hero',
    },
    {
      name: 'heroSlides',
      title: 'Hero carousel slides',
      description: 'Slides for the home hero carousel. Add/remove/reorder freely.',
      group: 'hero',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'image', title: 'Image', type: 'image', options: { hotspot: true } },
            { name: 'eyebrow', title: 'Eyebrow (small label)', type: 'string' },
            { name: 'title', title: 'Title', type: 'string' },
            { name: 'text', title: 'Text', type: 'text', rows: 2 },
            { name: 'ctaLabel', title: 'Button label', type: 'string' },
            { name: 'ctaHref', title: 'Button link', type: 'string' },
          ],
          preview: { select: { title: 'title', subtitle: 'eyebrow', media: 'image' } },
        },
      ],
    },
    {
      name: 'video',
      title: 'Home video',
      type: 'object',
      group: 'hero',
      fields: [
        { name: 'url', title: 'Video URL (YouTube)', type: 'url' },
        { name: 'title', title: 'Title', type: 'string' },
        { name: 'poster', title: 'Poster image', type: 'image', options: { hotspot: true } },
      ],
    },
    {
      name: 'nav',
      title: 'Main navigation (תפריט ראשי)',
      description: 'Header menu. Items with sub-items open as a mega-menu. Empty → the built-in default menu.',
      type: 'array',
      group: 'nav',
      of: [
        {
          type: 'object',
          name: 'navItem',
          fields: [
            { name: 'label', title: 'Label', type: 'string', validation: (R) => R.required() },
            { name: 'href', title: 'Link', type: 'string', description: 'Internal path (/product) or full URL. Optional when there are sub-items.' },
            {
              name: 'children',
              title: 'Sub-items (mega-menu)',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    { name: 'label', title: 'Label', type: 'string', validation: (R) => R.required() },
                    { name: 'description', title: 'Short description', type: 'string' },
                    { name: 'href', title: 'Link', type: 'string', validation: (R) => R.required() },
                  ],
                  preview: { select: { title: 'label', subtitle: 'href' } },
                },
              ],
            },
          ],
          preview: { select: { title: 'label', subtitle: 'href' } },
        },
      ],
    },
    {
      name: 'headerCta',
      title: 'Header button (כפתור בתפריט)',
      type: 'object',
      group: 'nav',
      options: { columns: 2 },
      fields: [
        { name: 'label', title: 'Label', type: 'string' },
        { name: 'href', title: 'Link', type: 'string' },
      ],
    },
    {
      name: 'contact',
      title: 'Contact',
      type: 'object',
      group: 'contact',
      fields: [
        { name: 'email', title: 'Email', type: 'string' },
        { name: 'phone', title: 'Phone', type: 'string' },
        { name: 'whatsapp', title: 'WhatsApp (international digits, e.g. 972539325888)', type: 'string' },
        { name: 'address', title: 'Address', type: 'string' },
        { name: 'hours', title: 'Hours', type: 'string' },
      ],
    },
    {
      name: 'stores',
      title: 'Store list',
      group: 'contact',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'name', title: 'Name', type: 'string' },
            { name: 'city', title: 'City', type: 'string' },
            { name: 'address', title: 'Address', type: 'string' },
            { name: 'url', title: 'URL', type: 'url' },
          ],
          preview: { select: { title: 'name', subtitle: 'city' } },
        },
      ],
    },
    {
      name: 'footerColumns',
      title: 'Footer link columns',
      description: 'Each column has a title and links. Empty → the built-in default columns.',
      type: 'array',
      group: 'footer',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'title', title: 'Column title', type: 'string' },
            {
              name: 'links',
              title: 'Links',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    { name: 'label', title: 'Label', type: 'string', validation: (R) => R.required() },
                    { name: 'href', title: 'Link', type: 'string', validation: (R) => R.required() },
                  ],
                  preview: { select: { title: 'label', subtitle: 'href' } },
                },
              ],
            },
          ],
          preview: { select: { title: 'title' } },
        },
      ],
    },
    {
      name: 'socials',
      title: 'רשתות חברתיות (Social links)',
      description: 'הקישורים לפייסבוק, אינסטגרם ויוטיוב — מזינים את האייקונים גם בהדר וגם בפוטר. השאירו ריק כדי להסתיר אייקון.',
      type: 'object',
      group: 'footer',
      options: { columns: 1 },
      fields: [
        { name: 'facebook', title: 'Facebook URL', type: 'url' },
        { name: 'instagram', title: 'Instagram URL', type: 'url' },
        { name: 'youtube', title: 'YouTube URL', type: 'url' },
      ],
    },
    {
      name: 'footerDisclaimer',
      title: 'Footer legal disclaimer (הבהרה משפטית)',
      type: 'text',
      rows: 3,
      group: 'footer',
    },
    {
      name: 'footerLinks',
      title: 'Footer links (legacy — use Footer link columns)',
      type: 'array',
      group: 'footer',
      hidden: true,
      of: [
        {
          type: 'object',
          fields: [
            { name: 'label', title: 'Label', type: 'string' },
            { name: 'href', title: 'Href', type: 'string' },
          ],
          preview: { select: { title: 'label', subtitle: 'href' } },
        },
      ],
    },
  
    {
      name: 'tracking',
      title: 'פיקסלים וקודי מעקב (Google / Facebook / TikTok...)',
      description:
        'קטעי קוד שמוזרקים לאתר. קטגוריה "שיווק"/"אנליטיקה" נטענת רק אחרי הסכמת עוגיות מתאימה (תיקון 13); "הכרחי" נטען תמיד — להשתמש רק בקוד שאינו אוסף מידע אישי.',
      type: 'array',
      group: 'tracking',
      of: [{
        type: 'object',
        fields: [
          { name: 'label', title: 'שם (למשל: Google Analytics)', type: 'string', validation: (R) => R.required() },
          {
            name: 'category', title: 'קטגוריית הסכמה', type: 'string', initialValue: 'analytics',
            options: { list: [
              { title: 'אנליטיקה (נטען אחרי הסכמה)', value: 'analytics' },
              { title: 'שיווק (נטען אחרי הסכמה)', value: 'marketing' },
              { title: 'הכרחי (נטען תמיד)', value: 'necessary' },
            ], layout: 'radio' },
          },
          { name: 'code', title: 'קוד (HTML/JS מלא כפי שהתקבל מהספק)', type: 'text', rows: 6, validation: (R) => R.required() },
          { name: 'enabled', title: 'פעיל', type: 'boolean', initialValue: true },
        ],
        preview: { select: { title: 'label', subtitle: 'category', on: 'enabled' },
          prepare: (s) => ({ title: (s.on === false ? '⏸ ' : '') + (s.title || 'snippet'), subtitle: s.subtitle }) },
      }],
    },
  ],
  preview: { prepare: () => ({ title: 'Site settings' }) },
})
