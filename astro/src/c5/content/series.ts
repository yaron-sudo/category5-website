// Series page content — fill in here (BRIEF §6). Keyed by series slug (../data.ts).
// intro: the "פירוט קצר על הסדרה" paragraph(s). Until it is written, the page shows
//        the brief's placeholder text.
// fillPlaceholders: while the product list is incomplete the grid is padded with
//        grey "אימג׳ / שם מוצר" cards up to 6, as in mockups/Series.dc.html.
//        Set to false once the series' real products are all in products.ts.
// order: product slugs in display order, grouped by pack colour (client: products of the same colour
//        together, the largest colour group first). Products not listed follow in catalogue order.
export interface SeriesContent { intro?: string[]; fillPlaceholders: boolean; order?: string[] }

export const SERIES_CONTENT: Record<string, SeriesContent> = {
  'vitamins-minerals': {
    order: [
      // green (white Lipozamin bottles)
      'lipozamin-nac', 'lipozamin-alpha-lipoic-acid', 'lipozamin-glutathione', 'lipozamin-nicotinamide', 'lipozamin-b12-spectrum',
      'lipozamin-calcium', 'lipozamin-fe', 'lipozamin-mg-taurate', 'lipozamin-mg-spectrum', 'lipozamin-mg-complex',
      'lipozamin-q10-spectrum', 'lipozamin-se', 'lipozamin-zn',
      // green (new dark-green packs)
      'liposomal-multivitamin', 'liposomal-vitamin-b-complex', 'quick-fe',
      // orange
      'cellinol-liposomal-vitamin-c', 'cellinol-junior', 'quick-c',
      // blue
      'amorfolic',
    ],
    fillPlaceholders: false,
    intro: ['רכיבים חיוניים לתפקוד מיטבי של הגוף. הסדרה מציעה ויטמינים ומינרלים בצורות נבחרות ובטכנולוגיות חדשניות, ובהן טכנולוגיה ליפוזומלית ייחודית, עם חומרי גלם בלעדיים ומתוך חשיבה על ספיגה, על זמינות ביולוגית ועל שימוש יומיומי נוח.'],
  },
  plants: {
    order: [
      'kalnozim-digestive-enzymes', 'kalnozin', 'curcumin-complex', // orange / yellow
      'natto', // red
      'lactoferr', // blue
    ],
    fillPlaceholders: false,
    intro: ['הידע הצמחי פוגש חדשנות במחקר ובפיתוח. בסדרה פורמולות ייחודיות המבוססות על רכיבים ממקור צמחי ועל חומרי גלם בלעדיים שנבחרו בקפידה, בהרכב מדויק ובאיכות בלתי מתפשרת.'],
  },
  probiotics: {
    order: [
      'bio-vera', 'geniflora-c15', 'umanaflora-53', 'lpldl-probiotic', // red
      'umanaflora-daily', 'quick-daily-biotics', // blue
    ],
    fillPlaceholders: false,
    intro: ['סדרת הפרוביוטיקה מבוססת על זנים נחקרים, חלקם בלעדיים, ועל הרכבים ייחודיים שתוכננו בקפידה. כל פורמולה נבנתה מתוך ידע מדעי וגישה חדשנית, עם מחשבה על יציבות הזנים, על הרכבם ועל התאמתם לשימוש יומיומי.'],
  },
  professional: {
    order: [
      'nootropinol', 'cogni-bright', 'cogni-mg', 'cogni-zzz', 'relacton-alpha', 'winterguard', 'alyvium', // blue
      'fibrogen', 'nemadrin-l6', 'protesterol-40', 'revival', // red
      'calcidex', // purple
    ],
    fillPlaceholders: false,
    intro: ['פתרונות ממוקדים. פורמולות מתקדמות. הסדרה משלבת רכיבים פעילים ייחודיים וחומרי גלם בלעדיים בפורמולות חדשניות ומורכבות, שפותחו על בסיס מנגנוני פעולה פיזיולוגיים מוכרים ובשיתוף אנשי מקצוע, כדי לתת מענה ממוקד לצרכים מוגדרים.'],
  },
}

export const SERIES_INTRO_PLACEHOLDER = 'פירוט קצר על הסדרה'
export const PRODUCT_TITLE_PLACEHOLDER = 'שם מוצר'
export const PLACEHOLDER_GRID_SIZE = 6
