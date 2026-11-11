// "מה הצורך" pages (BRIEF §7) — fill in here. Keyed by need slug (../data.ts).
// intro:    the "פירוט קצר על התחום" paragraph(s); placeholder text until written.
// image:    the banner visual (a clean crop, to be supplied); grey "באנר" until then.
// products: slugs of the products that belong to the need. While empty, the grid
//           shows grey placeholder cards as in the mockup.
export interface NeedContent { intro?: string[]; image?: string; products: string[] }

export const NEED_CONTENT: Record<string, NeedContent> = {
  'healthy-winter': { products: [] },
  women: { products: [] },
  men: { products: [] },
  sport: { products: [] },
  kids: { products: [] },
  seniors: { products: [] },
}
export const NEED_INTRO_PLACEHOLDER = 'פירוט קצר על התחום'
