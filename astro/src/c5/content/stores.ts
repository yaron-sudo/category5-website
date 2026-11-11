// Stores page (BRIEF §9). Online shops: the four buttons of the mockup.
// BRIEF §17: the ByBy / ניצת הדובדבן / עדן טבע links are still missing — fill `href` in.
export const ONLINE_SHOPS: Array<{ name: string; href?: string }> = [
  { name: 'Super-Pharm', href: 'https://shop.super-pharm.co.il/' },
  { name: 'ByBy' },
  { name: 'ניצת הדובדבן' },
  { name: 'עדן טבע מרקט' },
]
/** The six regions of the mockup, in order. */
export const STORE_REGIONS = ['צפון', 'חיפה והקריות', 'השרון', 'מרכז', 'ירושלים', 'דרום'] as const
