import { defineType } from 'sanity'

// A point of sale (health-food store / pharmacy) shown on /stores.
// Seeded from the old site's store map (sanity/seed-stores.mjs); editable here.
export const STORE_REGIONS = [
  { title: 'צפון', value: 'north' },
  { title: 'חיפה והקריות', value: 'haifa' },
  { title: 'מרכז והשרון', value: 'center' },
  { title: 'תל אביב וגוש דן', value: 'tel-aviv' },
  { title: 'ירושלים והסביבה', value: 'jerusalem' },
  { title: 'דרום', value: 'south' },
]

export const STORE_CATEGORIES = [
  { title: 'בתי טבע', value: 'health' },
  { title: 'סופר-פארם', value: 'super-pharm' },
  { title: 'ניצת הדובדבן', value: 'nitzat' },
  { title: 'B&D', value: 'bd' },
  { title: 'אתר אינטרנט', value: 'online' },
]

export default defineType({
  name: 'store',
  title: 'נקודת מכירה',
  type: 'document',
  fields: [
    { name: 'name', title: 'שם החנות', type: 'string', validation: (R) => R.required() },
    {
      name: 'category',
      title: 'סוג',
      type: 'string',
      options: { list: STORE_CATEGORIES, layout: 'radio', direction: 'horizontal' },
      initialValue: 'health',
    },
    { name: 'city', title: 'עיר / יישוב', type: 'string', validation: (R) => R.required(), description: 'משמש לחיפוש ולסינון. בעברית.' },
    { name: 'address', title: 'כתובת', type: 'string', description: 'רחוב ומספר (ללא העיר) — מוצג מתחת לשם החנות.' },
    { name: 'phone', title: 'טלפון', type: 'string' },
    {
      name: 'region',
      title: 'אזור',
      type: 'string',
      options: { list: STORE_REGIONS, layout: 'radio', direction: 'horizontal' },
      validation: (R) => R.required(),
    },
    { name: 'location', title: 'מיקום על המפה', type: 'geopoint', validation: (R) => R.required() },
    { name: 'website', title: 'אתר (לחנויות אינטרנט)', type: 'url' },
    {
      name: 'approximate', title: 'מיקום משוער (מרכז העיר)', type: 'boolean',
      description: 'סומן אוטומטית כשהכתובת לא אותרה במדויק. גררו את הסמן במפה למיקום הנכון ובטלו את הסימון.',
    },
    { name: 'note', title: 'הערה', type: 'string', description: 'אופציונלי: קומה, חנות בקניון, שעות וכו׳.' },
    { name: 'active', title: 'פעיל', type: 'boolean', initialValue: true, description: 'כבו כדי להסתיר חנות מהרשימה בלי למחוק אותה.' },
    { name: 'sourceId', title: 'מזהה מקור (Storepoint)', type: 'string', readOnly: true, hidden: true },
  ],
  orderings: [
    { title: 'עיר', name: 'cityAsc', by: [{ field: 'city', direction: 'asc' }, { field: 'name', direction: 'asc' }] },
    { title: 'שם', name: 'nameAsc', by: [{ field: 'name', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'name', city: 'city', address: 'address', active: 'active', category: 'category' },
    prepare: ({ title, city, address, active, category }) => ({
      title: active === false ? `(מוסתר) ${title}` : title,
      subtitle: [STORE_CATEGORIES.find((c) => c.value === category)?.title, city, address].filter(Boolean).join(' · '),
    }),
  },
})
