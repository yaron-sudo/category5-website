// Products of the new site — fill in here (BRIEF §6, §8).
// Images: files in /assets/products/ (never cropped or edited; shown with object-fit: contain).
// series: the slug of one of the 4 series in ../data.ts.
export interface Product {
  slug: string
  title: string
  series: 'vitamins-minerals' | 'plants' | 'probiotics' | 'professional'
  image?: string
}

/** The example products named in BRIEF §6 (with their images from assets/products/). */
export const PRODUCTS: Product[] = [
  { slug: 'magnesium-bisglycinate-liposomal', title: 'מגנזיום ביסגליצינאט ליפוזומלי', series: 'vitamins-minerals', image: '/assets/products/magnesium-bisglycinate-liposomal.jpg' },
  { slug: 'curcumin-complex', title: 'קומפלקס כורכומין', series: 'plants', image: '/assets/products/curcumin-complex.jpg' },
  { slug: 'postbiotic', title: 'פוסטביוטיקה', series: 'probiotics', image: '/assets/products/postbiotic.jpg' },
  { slug: 'revival', title: 'רויוואל', series: 'professional', image: '/assets/products/revival.jpg' },
  { slug: 'calcidex', title: 'קלצידקס', series: 'professional', image: '/assets/products/calcidex.png' },
]

export const productHref = (p: Product) => `/products/${p.slug}`
export const productsOfSeries = (series: string) => PRODUCTS.filter((p) => p.series === series)
