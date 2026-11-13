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
  /** "תווית המוצר" image (file in /assets/…); grey "אימג׳" until supplied */
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
  { slug: 'lipozamin-nac', title: 'ליפוזמין NAC', series: 'vitamins-minerals', contains: 'מכיל 60 כמוסות' },
  { slug: 'lipozamin-alpha-lipoic-acid', title: 'ליפוזמין אלפא ליפואית אסיד', series: 'vitamins-minerals', contains: 'מכיל 60 כמוסות' },
  { slug: 'lipozamin-magnesium-malate', title: 'ליפוזמין מגנזיום מאלאט', series: 'vitamins-minerals', contains: 'מכיל 60 כמוסות' },
  { slug: 'lipozamin-creatine-complex', title: 'ליפוזמין קריאטין קומפלקס', series: 'vitamins-minerals', contains: 'מכיל 60 כמוסות' },
  { slug: 'liposomal-multivitamin', title: 'מולטיויטמין ליפוזומלי', series: 'vitamins-minerals', contains: 'מכיל 60 כמוסות' },
  { slug: 'liposomal-vitamin-b-complex', title: 'קומפלקס ויטמין B ליפוזומלי', series: 'vitamins-minerals', contains: 'מכיל 60 כמוסות' },
  { slug: 'natto', title: 'נאטו', series: 'plants', contains: 'מכיל 60 כמוסות' },
  { slug: 'fibrogen', title: 'פיברוגין', series: 'professional', contains: 'מכיל 30 כמוסות' },
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
      'נותן הכשרות: חתם סופר בני ברק, בהשגחת הרבנות האזורית כפר פינס - מנשה.',
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
