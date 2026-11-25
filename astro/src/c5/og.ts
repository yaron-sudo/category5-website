// Social-share image (og:image / twitter:image) of a page.
//
// Rule (client, 19.11.2026): a product page shares the product's main photo; every other
// page shares the first home-page banner. WhatsApp and Facebook want a JPEG of about
// 1200×630 under ~300 KB, so the local originals (2600px banner, 2000px webp/png packshots)
// are rendered to that shape at build time by the endpoints under src/pages/og/
// (see ogRender.ts). Sanity photos are shaped on the Sanity CDN instead (Seo.astro).
import type { Product } from './content/products'

export const OG_HOME = '/og/home.jpg'

const isRemote = (src: string) => /^https?:\/\//.test(src)

/** True when the product's main photo is a file of this site (rendered by /og/products/[slug].jpg). */
export const hasLocalPhoto = (p: Product) => !!p.image && !isRemote(p.image)

/** The share image of a product page. */
export function productShareImage(p: Product): string {
  if (!p.image) return OG_HOME
  return isRemote(p.image) ? p.image : `/og/products/${p.slug}.jpg`
}

/** Layout guard: only a share-ready image (a /og/ render or a CDN photo) passes through;
 *  anything else (series banner, article cover, nothing) shares the home banner. */
export function shareImage(image?: string): string {
  if (!image) return OG_HOME
  return image.startsWith('/og/') || isRemote(image) ? image : OG_HOME
}
