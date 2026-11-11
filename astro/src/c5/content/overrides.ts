// ────────────────────────────────────────────────────────────────────────────
// Product overrides — edit content and replace images of any product here.
//
// Every product of the old site is pulled automatically into a product page in
// the new design (see catalog.ts). To change something for one product, add an
// entry under its slug (the last part of its URL: /products/<slug>) with only
// the fields you want to change. Everything else keeps coming from the old site.
//
//   'lipozamin-fe': {
//     title: 'ברזל ביסגליצינאט ליפוזומלי',      // card + page name
//     series: 'vitamins-minerals',               // vitamins-minerals | plants | probiotics | professional
//     image: '/assets/products/lipozamin-fe.jpg',
//     intro: ['פסקה ראשונה', 'פסקה שנייה'],
//     contains: 'מכיל 60 קפסולות',
//     usage: ['…'], benefits: ['…'], details: ['…'], legal: '…',
//     labelImage: '/assets/products/labels/lipozamin-fe.jpg',
//     hidden: true,                              // remove the product from the site
//   },
//
// Replacing images needs NO entry here: drop a file named after the slug into
//   astro/public/assets/products/<slug>.(jpg|png|webp)          → product image
//   astro/public/assets/products/labels/<slug>.(jpg|png|webp)   → label image
// and it replaces the old site's image on the next build.
// ────────────────────────────────────────────────────────────────────────────
import type { Product } from './products'

export type ProductOverride = Partial<Omit<Product, 'slug'>> & { hidden?: boolean }

export const PRODUCT_OVERRIDES: Record<string, ProductOverride> = {
  // The brief's "פוסטביוטיקה" image is the new pack of the daily probiotic (56 strains, 20 billion).
  'umanaflora-daily': { image: '/assets/products/postbiotic.jpg' },

  // Pack sizes updated to the BOM list.
  amorfolic: { contains: 'מכיל 120 כמוסות' },
  'cellinol-junior': { contains: 'מכיל 60 טבליות' },

  // Old-site products that are not in the BOM list: hidden (their URLs redirect to the series page).
  'cellinol-soap': { hidden: true },
  'alyvium-soap': { hidden: true },
  'nemadrin-soap': { hidden: true },
  'giallocur-soap': { hidden: true },
  'alyvium-cream': { hidden: true },
  'lipozamin-mg-taurate': { hidden: true },
  'umanaflora-de111': { hidden: true },
}
