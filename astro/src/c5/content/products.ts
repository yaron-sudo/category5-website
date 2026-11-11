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
  /** "פרטים נוספים" paragraphs */
  details?: string[]
  /** "התוויה משפטית" text */
  legal?: string
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
  { slug: 'postbiotic', title: 'פוסטביוטיקה', series: 'probiotics', image: '/assets/products/postbiotic.jpg' },
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
  { slug: 'quick-daily-biotics', title: 'קויק דיילי ביוטיקס', series: 'probiotics', contains: 'מכיל 30 כמוסות' },
]

export const productHref = (p: Product) => `/products/${p.slug}`
