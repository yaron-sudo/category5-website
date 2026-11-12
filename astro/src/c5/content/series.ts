// Series page content — fill in here (BRIEF §6). Keyed by series slug (../data.ts).
// intro: the "פירוט קצר על הסדרה" paragraph(s). Until it is written, the page shows
//        the brief's placeholder text.
// fillPlaceholders: while the product list is incomplete the grid is padded with
//        grey "אימג׳ / שם מוצר" cards up to 6, as in mockups/Series.dc.html.
//        Set to false once the series' real products are all in products.ts.
export interface SeriesContent { intro?: string[]; fillPlaceholders: boolean }

export const SERIES_CONTENT: Record<string, SeriesContent> = {
  'vitamins-minerals': {
    fillPlaceholders: false,
    intro: ['רכיבים חיוניים לתפקוד מיטבי של הגוף. הסדרה מציעה ויטמינים ומינרלים בצורות נבחרות ובטכנולוגיות חדשניות, ובהן טכנולוגיה ליפוזומלית ייחודית, עם חומרי גלם בלעדיים ומתוך חשיבה על ספיגה, על זמינות ביולוגית ועל שימוש יומיומי נוח.'],
  },
  plants: {
    fillPlaceholders: false,
    intro: ['הידע הצמחי פוגש חדשנות במחקר ובפיתוח. בסדרה פורמולות ייחודיות המבוססות על רכיבים ממקור צמחי ועל חומרי גלם בלעדיים שנבחרו בקפידה, בהרכב מדויק ובאיכות בלתי מתפשרת.'],
  },
  probiotics: {
    fillPlaceholders: false,
    intro: ['סדרת הפרוביוטיקה מבוססת על זנים נחקרים, חלקם בלעדיים, ועל הרכבים ייחודיים שתוכננו בקפידה. כל פורמולה נבנתה מתוך ידע מדעי וגישה חדשנית, עם מחשבה על יציבות הזנים, על הרכבם ועל התאמתם לשימוש יומיומי.'],
  },
  professional: {
    fillPlaceholders: false,
    intro: ['פתרונות ממוקדים. פורמולות מתקדמות. הסדרה משלבת רכיבים פעילים ייחודיים וחומרי גלם בלעדיים בפורמולות חדשניות ומורכבות, שפותחו על בסיס מנגנוני פעולה פיזיולוגיים מוכרים ובשיתוף אנשי מקצוע, כדי לתת מענה ממוקד לצרכים מוגדרים.'],
  },
}

export const SERIES_INTRO_PLACEHOLDER = 'פירוט קצר על הסדרה'
export const PRODUCT_TITLE_PLACEHOLDER = 'שם מוצר'
export const PLACEHOLDER_GRID_SIZE = 6
