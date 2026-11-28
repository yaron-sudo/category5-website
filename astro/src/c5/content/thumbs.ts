// Smaller copies of product / article photos (scripts/make-thumbs.mjs → public/thumbs/…).
// imgSet() builds a srcset from the copies that exist plus the original as the largest
// candidate, and a `sizes` that says how wide the image really is on screen, so the browser
// picks the smallest file that still has at least as many pixels as the screen shows
// (a 3x phone gets the 1200px copy or the original, a 1x desktop the 640px one).
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import sharp from 'sharp'

const PUBLIC = [resolve(process.cwd(), 'public'), resolve(process.cwd(), 'astro/public')].find((d) => existsSync(d)) ?? 'public'
const PRODUCT_WIDTHS = [640, 1200, 1600]
const ARTICLE_WIDTHS = [800]
const BANNER_WIDTHS = [720, 1080, 1300, 1950]
const widthCache = new Map<string, Promise<number>>()
const width = (src: string) => {
  let p = widthCache.get(src)
  if (!p) { p = sharp(resolve(PUBLIC, decodeURIComponent(src.slice(1)))).metadata().then((m) => m.width ?? 0).catch(() => 0); widthCache.set(src, p) }
  return p
}
const thumbPath = (src: string, w: number) => `/thumbs${src.replace(/\.[a-z0-9]+$/i, '')}-${w}.webp`
const has = (src: string, w: number) => existsSync(resolve(PUBLIC, thumbPath(src, w).slice(1)))
const local = (src?: string): src is string => !!src && src.startsWith('/') && !src.startsWith('/thumbs/')

export interface ImgSet { srcset?: string; sizes?: string }

/** srcset + sizes for a photo. `kind` picks the copy widths; the original always joins the list as the
 *  largest candidate (cards need more than 1200px when the framing zooms a product photo, and the
 *  1200px article JPEGs are not worth re-encoding at full size). */
export async function imgSet(src: string | undefined, sizes: string, kind: 'product' | 'article' | 'banner' = 'product'): Promise<ImgSet> {
  if (!local(src)) return {}
  const widths = (kind === 'product' ? PRODUCT_WIDTHS : kind === 'banner' ? BANNER_WIDTHS : ARTICLE_WIDTHS).filter((w) => has(src, w))
  if (!widths.length) return {}
  const parts = widths.map((w) => `${thumbPath(src, w)} ${w}w`)
  const ow = await width(src); if (ow > widths[widths.length - 1]) parts.push(`${src} ${ow}w`)
  return { srcset: parts.join(', '), sizes }
}

/** Gallery thumbnail (76-129 css px): srcset of the 240 / 480px copies, 480 as src; the original when there are none. */
export function thumbSet(src: string | undefined): { src?: string; srcset?: string; sizes?: string } {
  if (!local(src) || !has(src, 240) || !has(src, 480)) return { src }
  return { src: thumbPath(src, 480), srcset: `${thumbPath(src, 240)} 240w, ${thumbPath(src, 480)} 480w`, sizes: '(max-width: 599px) 110px, 130px' }
}

/** One small copy (default 640px) for thumbnails shown at ≤ ~220 CSS px, or the original when there is none. */
export function thumb(src: string | undefined, w = 640): string | undefined {
  return local(src) && has(src, w) ? thumbPath(src, w) : src
}

/** `sizes` for a product card: how wide the photo element is on screen. The framing (imageFit) can
 *  zoom the photo inside its square box, so the box width is multiplied by the photo's width%. */
export function cardSizes(fit: string | undefined, box: { phone?: string; mid?: string; wide?: string } = {}): string {
  const m = fit?.match(/(?:^|[;\s])width:\s*([\d.]+)%/)
  const k = m ? Math.round(Number(m[1]) * 10) / 1000 : 1
  const mul = (len: string) => (k === 1 ? len : `calc(${len} * ${k})`)
  const phone = box.phone ?? 'calc(100vw - 32px)', mid = box.mid ?? '360px', wide = box.wide ?? '300px'
  return `(max-width: 599px) ${mul(phone)}, (max-width: 1000px) ${mul(mid)}, ${mul(wide)}`
}
