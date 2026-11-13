import type { ProductLabel } from './labels'
// Products entered by hand (BRIEF §6, §8). All old-site products are added
// automatically by catalog.ts; edit those in overrides.ts.
// Images: files in /assets/products/ (never cropped or edited; shown with object-fit: contain).
// series: the slug of one of the 4 series in ../data.ts.
export interface Product {
  slug: string
  title: string
  series: 'vitamins-minerals' | 'plants' | 'probiotics' | 'professional'
  image?: string
  /** Slug of an old-site product: its content is pulled in, and the old page redirects here. */
  source?: string
  /** Longer name for the product page h1 (defaults to title). */
  fullTitle?: string
  // ---- product page content (BRIEF §8). Anything left out shows the brief's placeholder. ----
  /** "פסקה קצרה על המוצר" */
  intro?: string[]
  /** First info column, e.g. "מכיל 60 קפסולות" */
  contains?: string
  /** "המלצות שימוש" bullets */
  usage?: string[]
  /** "יתרונות המוצר ושימושים" bullets */
  benefits?: string[]
  /** "תווית המוצר" as text (content/labels.ts) — the accessible form shown on the page. */
  label?: ProductLabel
  /** Electron-microscope photos of the product's liposome (from the product brochure):
   *  files public/assets/products/microscope/<slug>.webp, <slug>-2.webp … picked up automatically. */
  microscope?: string[]
  /** Label scan — only shown while a product has no text label yet. */
  labelImage?: string
  /** "תווית המוצר" as running text (transcribed from the pack label), one paragraph per item.
   *  Not rendered yet: the design session defines how it is shown. */
  labelText?: string[]
  /** "פרטים נוספים" paragraphs */
  details?: string[]
  /** "התוויה משפטית" text */
  legal?: string
  /** Extra search words: everyday names, benefits, uses (BRIEF §12). */
  keywords?: string[]
}

/** Placeholder texts of mockups/Product.dc.html, shown until a field is filled. */
export const PRODUCT_PLACEHOLDERS = {
  intro: 'פסקה קצרה על המוצר',
  contains: 'מכיל X קפסולות',
  bullet: 'טקסט מהאתר הקיים',
  details: 'הטקסט המופיע כיום בתחתית עמוד המוצר',
  legal: 'התוויה משפטית',
}

/** The example products named in BRIEF §6 (with their images from assets/products/). */
export const PRODUCTS: Product[] = [
  { slug: 'magnesium-bisglycinate-liposomal', title: 'מגנזיום ביסגליצינאט ליפוזומלי', series: 'vitamins-minerals', image: '/assets/products/magnesium-bisglycinate-liposomal.jpg' },
  { slug: 'curcumin-complex', title: 'קומפלקס כורכומין', source: 'giallocur-nano-curcumin', series: 'plants', image: '/assets/products/curcumin-complex.jpg' },
  { slug: 'revival', title: 'רויוואל', source: 'revival-20', series: 'professional', image: '/assets/products/revival.jpg' },
  { slug: 'calcidex', title: 'קלצידקס', fullTitle: 'קלצידקס – סידן גליצרופוספט ואלוורה אורגנית', series: 'professional', image: '/assets/products/calcidex.png' },
  // Products of the BOM list that had no page on the old site (names and pack sizes from the BOM).
  {
    slug: 'lipozamin-nac', title: 'ליפוזמין NAC', series: 'vitamins-minerals', contains: 'מכיל 60 כמוסות צמחיות',
    // Text from the client's brochure (Lipozamin-NAC.pdf) and the pack label. No indications / target groups; dosage as on the label.
    intro: [
      'N-אצטיל-ציסטאין (NAC) ליפוזומלי. NAC הוא נגזרת פעילה של חומצת האמינו ציסטאין, המשמשת כחומר המוצא המרכזי לייצור גלוטתיון.',
      'ה-NAC שבמוצר עטוף בליפוזום שהוקטן לגודל חלקיקים ננומטרי. הליפוזומים במוצר נבדקו במיקרוסקופ אלקטרוני.',
    ],
    benefits: [
      'כמוסה אחת מכילה: 500 מ"ג N-אצטיל-L-ציסטאין (NAC) ליפוזומלי (200 מ"ג אלמנטלי).',
      'N-אצטיל-L-ציסטאין (NAC) ליפוזומלי - לספיגה גבוהה.',
      'N-אצטיל-L-ציסטאין (NAC) בגודל ננומטרי - (קטן יותר מכדורית דם).',
      'הליפוזומים במוצר נבדקו במיקרוסקופ אלקטרוני.',
      'מתאים לצמחונים וטבעונים.',
      '60 כמוסות צמחיות נוחות לבליעה.',
      'תווית נקיה - ללא סיליקון דאוקסיד, חומרים משמרים, חומרים מן החי, חומרים מהונדסים גנטית, חומרים מייצבים, חומרי טעם, חומרי ריח, ממתיקים, סוכר, חיטה, סויה, חלב ומוצריו.',
    ],
    usage: ['1 כמוסה ליום. יש ליטול לפי המינון המומלץ.'],
    details: [
      'סוג כשרות: כשר פרווה, בד״ץ.',
      'נותן הכשרות: בד״ץ חתם סופר בני ברק.',
      'אורך חיי מדף: 24 חודשים.',
      'המלצת אחסון: יש לאחסן במקום קריר ויבש, הרחק מחום, אור ולחות.',
      'לאחר הפתיחה אין צורך לשמור בקירור.',
      'נשים בהריון, נשים מניקות, אנשים הנוטלים תרופות מרשם וילדים יש להיוועץ ברופא.',
      'יש להרחיק את המוצר מהישג ידם של ילדים.',
    ],
    keywords: ['NAC', 'N-אצטיל-ציסטאין', 'אצטיל ציסטאין', 'ציסטאין', 'N-Acetyl Cysteine', 'נאק'],
  },
  { slug: 'lipozamin-alpha-lipoic-acid', title: 'ליפוזמין אלפא ליפואית אסיד', series: 'vitamins-minerals', contains: 'מכיל 60 כמוסות' },
  { slug: 'lipozamin-magnesium-malate', title: 'ליפוזמין מגנזיום מאלאט', series: 'vitamins-minerals', contains: 'מכיל 60 כמוסות' },
  { slug: 'lipozamin-creatine-complex', title: 'ליפוזמין קריאטין קומפלקס', series: 'vitamins-minerals', contains: 'מכיל 60 כמוסות' },
  { slug: 'liposomal-multivitamin', title: 'מולטיויטמין ליפוזומלי', series: 'vitamins-minerals', contains: 'מכיל 60 כמוסות' },
  { slug: 'liposomal-vitamin-b-complex', title: 'קומפלקס ויטמין B ליפוזומלי', series: 'vitamins-minerals', contains: 'מכיל 60 כמוסות' },
  { slug: 'natto', title: 'נאטו', series: 'plants', contains: 'מכיל 60 כמוסות' },
  {
    slug: 'fibrogen', title: 'פיברוגן', series: 'professional', contains: 'מכיל 30 כמוסות צמחיות',
    // Text from the client's brochure (Fibrogen.pdf) and the pack label. No indications / target groups; dosage as on the label.
    intro: [
      "קומפלקס ג'ינסנוזידים נדירים משורש ג'ינסנג קוריאני אדום בגידול הידרופוני, בתוספת PEA ליפוזומלי.",
      "HRG80 הוא פריצת דרך בעולם הג'ינסנג, המשלבת גידול הידרופוני ייחודי באירופה עם תנאים מבוקרים המבטיחים שורש ג'ינסנג אדום טבעי, נקי לחלוטין ממזהמים וללא שימוש בחומרי הדברה.",
    ],
    benefits: [
      "שורש ג'ינסנג קוריאני אדום טבעי - מגידול הידרופוני ייחודי.",
      '"ספקטרום מלא" של "ג\'ינסנוזידים נדירים" - 10% ג\'ינסנוזידים מסוג: Rg2, Rg3, Rg5, Rg6, Rh1, Rh2, Rh3, Rh4, Rk1, Rk2, Rk3, CK, PPD, PPT, F1, F2.',
      'מגנזיום מלאט ליפוזומלי בגודל חלקיקים ננומטרי - לספיגה גבוהה.',
      "מגנזיום מלאט מסוג מיוחד של מינרל-אמינו צ'לאט - מינרל הקשור לחומצה אמינית (Chelated / Fully Reacted) - 100% מגנזיום נקי.",
      "בתוספת - שורש ג'ינג'ר גלנגל.",
      'ליפוזומלי - PEA.',
      'מתאים לצמחונים וטבעונים. אינו מכיל קפאין.',
      'כמוסה אחת מכילה: 500 מ"ג מגנזיום מלאט ליפוזומלי, 100 מ"ג HRG80 - שורש ג\'ינסנג פטנטי, 100 מ"ג שורש ג\'ינג\'ר גלנגל, 10 מ"ג פלמיטואיל-אתנול-אמיד ליפוזומלי - PEA.',
      '30 כמוסות צמחיות קטנות ונוחות לבליעה לצריכה חודשית.',
      'תווית נקיה - ללא חומרים משמרים, חומרים מן החי, חומרים מהונדסים גנטית, חומרי טעם, חומרי ריח, ממתיקים, סוכר, חיטה, סויה, חלב ומוצריו, פוליאתילן גליקול (PEG).',
    ],
    usage: ['כמוסה 1 ביום.'],
    details: [
      'סוג כשרות: כשר פרווה, בד״ץ.',
      'נותן הכשרות: בד״ץ חתם סופר בני ברק.',
      'אורך חיי מדף: 24 חודשים.',
      'המלצת אחסון: יש לאחסן במקום קריר ויבש, הרחק מחום, אור ולחות.',
      'נשים בהריון, נשים מיניקות, אנשים הנוטלים תרופות מרשם, ילדים, יש להיוועץ ברופא.',
      'יש להרחיק מהישג ידם של ילדים.',
    ],
    labelText: [
      'פיברוגן™ - קומפלקס ג\'ינסנוזידים "יחודיים" משורש ג\'ינסנג קוריאני אדום בגידול הידרופוני בתוספת PEA ליפוזומלי.',
      'רכיבים: קומפלקס דימגנזיום מלאט ליפוזומלי (ליפוזום המכיל דימגנזיום מלאט, גאם ערביק ולציטין חמניות (אינו מהונדס גנטית)), כמוסה (תאית צמחית – HPMC), שורש ג\'ינג\'ר גלנגל (Alpinia Galanga L) (100 מ"ג), אבקת שורש ג\'ינסנג קוריאני אדום (Panax Ginseng) (מכיל 10% ג\'ינסנוזידים ייחודיים מסוג: Rg2, Rg3, Rg5, Rg6, Rh1, Rh2, Rh3, Rh4, Rk1, Rk2, Rk3, CK, PPD, PPT, F1, F2) (100 מ"ג), קומפלקס פלמיטואיל אתנול אמיד ליפוזומלי (PEA - Palmitoylethanolamide) (ליפוזום המכיל גאם ערביק, PEA ולציטין חמניות (אינו מהונדס גנטית)) (10 מ"ג).',
      'כמות אלמנטלית בכמוסה: מגנזיום מלאט ליפוזומלי 500 מ"ג (Liposomal (Nano) Magnesium Malate, (Chelated & Fully Reacted)) - 50 מ"ג. % מהקצובה היומית המומלצת לגילאי 25-50: נשים 18%, גברים 14%.',
      'משקל כמוסה: 835 מ"ג | משקל נקי: 25.1 גר\'.',
      'אנרגיה: פחות מ-10 קק"ל למנה. הוראות שימוש: כמוסה 1 ביום.',
      '* אינו מהונדס גנטית | GMO FREE | מתאים לטבעונים.',
    ],
    keywords: ['פיברוגין', 'Fibrogen', "ג'ינסנג", 'HRG80', 'PEA', 'מגנזיום מלאט', 'גלנגל'],
  },
  {
    slug: 'quick-daily-biotics', title: 'קויק דיילי ביוטיקס', series: 'probiotics', contains: 'מכיל 30 אריזות אישיות',
    // Text from the client's brochure (QuickDailyBiotics.pdf) and the pack label. No indications / target groups, at the client's request.
    intro: [
      'קומפלקס פרוביוטיקה יומיומי, מבוסס זנים שנחקרו מדעית. המוצר מגיע בסשט אישי של אבקה מסיסה בטעם תות שמנת, המיועדת לצריכה ישירה על הלשון ללא צורך במים. השיטה החדשנית מאפשרת נוחות שימוש גם למי שמתקשה לבלוע תוספים, ומספקת חוויית נטילה נעימה וידידותית.',
    ],
    benefits: [
      'פרוביוטיקה לשימוש יום יומי.',
      'פרוביוטיקה מזן נחקר מדעית - בצילוס סובטיליס - DE111.',
      'פרוביוטיקה מזן נחקר מדעית - בצילוס קואגולנס - SMZ 1969.',
      '4 מיליארד חיידקים מזנים נחקרים במנה של סטיק אחד.',
      'מתמוסס בקלות ישירות בפה - ללא צורך במים.',
      'פרוביוטיקה ללא רכיבי חלב - מתאים לטבעונים.',
      'חיי מדף ארוכים - אין צורך לשמור בקירור.',
      'פרוביוטיקה עמידה לחום ולחומציות pH.',
      'אריזת סטיק אישית - לצריכה נוחה בכל מקום.',
      'טעים במיוחד - פרוביוטיקה בטעם תות שמנת.',
      'תווית נקיה - ללא חומרים משמרים, ללא חומרים מן החי, ללא חומרים מהונדסים גנטית, ללא סוכר, ללא חומרים מתחלבים, ללא חיטה, ללא סויה, חלב ומוצריו, ללא סיליקון דיאוקסיד.',
    ],
    usage: [
      'סטיק אחד ליום עם או בלי האוכל.',
      'יש לפתוח את השקית, לרוקן את תוכנה ישירות לתוך הפה, על הלשון ולבלוע. אין צורך במים.',
      'ניתן לערבב את מנת השימוש במים או משקה קר.',
    ],
    details: [
      'סוג כשרות: בד"ץ פרווה.',
      'נותן הכשרות: חתם סופר בני ברק.',
      'אורך חיי מדף: 24 חודשים ללא קירור.',
      'המלצת אחסון: יש לאחסן במקום קריר ויבש, הרחק מחום, אור ולחות.',
      'לאחר הפתיחה אין צורך לשמור בקירור.',
      'המוצר מכיל סוכרים רב כהליים (ממתיק), צריכה מופרזת עלולה לגרום לפעילות מעיים מוגברת.',
      'נשים בהריון, נשים מיניקות, אנשים הנוטלים תרופות מרשם, ילדים, יש להיוועץ ברופא.',
      'יש להרחיק מהישג ידם של ילדים.',
    ],
    labelText: [
      'קוויק Daily™ - קומפלקס פרוביוטיקה מזנים נחקרים לשימוש יום יומי.',
      '*רכיבים: ממתיקים (סורביטול מטפיוקה, גליקוזידים של סטיביול מסטיביה), מלטודקסטרין (סכרידים מתירס שאינו מהונדס גנטית), אבקת בננות ירוקות (*NuBana™ RS65 Green Banana (Musa x paradisiaca)), פרוביוטיקה מסוג בצילוס קואגולנס - SMZ 1969, פרוביוטיקה מסוג בצילוס סובטיליס - DE111, מווסת חומציות (חומצה ציטרית), חומרי טעם וריח.',
      'כמות ביחידה: Bacillus subtilis DE111* בצילוס סובטיליס מזן נחקר - 2 מיליארד. Bacillus Coagulans SMZ 1969* בצילוס קואגולנס מזן נחקר - 2 מיליארד.',
      '* אינו מהונדס גנטית | GMO FREE | מתאים לטבעונים.',
      'המוצר מכיל סוכרים רב כהליים, צריכה מופרזת עלולה לגרום לפעילות מעיים מוגברת.',
    ],
    keywords: ['קוויק דיילי', 'Quick Daily', 'אבקת פרוביוטיקה', 'סטיק', 'תות שמנת'],
  },
]

export const productHref = (p: Product) => `/products/${p.slug}`
