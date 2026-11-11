// Series page content — fill in here (BRIEF §6). Keyed by series slug (../data.ts).
// intro: the "פירוט קצר על הסדרה" paragraph(s). Until it is written, the page shows
//        the brief's placeholder text.
// fillPlaceholders: while the product list is incomplete the grid is padded with
//        grey "אימג׳ / שם מוצר" cards up to 6, as in mockups/Series.dc.html.
//        Set to false once the series' real products are all in products.ts.
export interface SeriesContent { intro?: string[]; fillPlaceholders: boolean }

export const SERIES_CONTENT: Record<string, SeriesContent> = {
  'vitamins-minerals': { fillPlaceholders: true },
  plants: { fillPlaceholders: true },
  probiotics: { fillPlaceholders: true },
  professional: { fillPlaceholders: true },
}

export const SERIES_INTRO_PLACEHOLDER = 'פירוט קצר על הסדרה'
export const PRODUCT_TITLE_PLACEHOLDER = 'שם מוצר'
export const PLACEHOLDER_GRID_SIZE = 6
