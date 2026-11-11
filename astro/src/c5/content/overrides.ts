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

export const PRODUCT_OVERRIDES: Record<string, ProductOverride> = {}
