// Uniform product framing. Product photos come with different amounts of white
// margin, so with plain `object-fit: contain` the bottles end up at different
// sizes. At build time we measure where the product actually is in each image
// (bounding box of the product itself: not white / transparent, cast shadow excluded) and return CSS
// that places the UNCHANGED image so that the product itself fills the same
// frame in every box. Scene photos (no white margin) simply fill the box.
import sharp from 'sharp'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

/** The product occupies at most this share of the (square) box, centred. */
const FRAME = 0.74
const WHITE = 236 // channels above this count as background (also skips faint shadows)

// Hand-tuned placements where the automatic measurement is misled (e.g. a cast
// shadow dark enough to read as product). Keyed by the image path, so the product
// page, the cards and the series page all share the same framing.
const FIT_OVERRIDES: Record<string, string> = {
  // Calcidex: the shadow to the right of the bottle is almost as dark as the glass,
  // so the measured box stretched into it and the bottle sat left of centre.
  '/assets/products/calcidex.png':
    'position: absolute; max-width: none; width: 101.05%; height: 100.80%; left: 0.74%; top: -6.72%',
}

/** Images whose cast shadow shows on the light box — softened with a gentle edge feather. */
const FEATHER = new Set(['/assets/products/calcidex.png'])
export const imageFeather = (src?: string) => !!src && FEATHER.has(src)

const PUBLIC = [resolve(process.cwd(), 'public'), resolve(process.cwd(), 'astro/public')].find((d) => existsSync(d)) ?? 'public'
const cache = new Map<string, Promise<string | undefined>>()

/** Inline style for an <img> inside a square, `position: relative; overflow: hidden` box — or undefined to keep `contain`. */
export function imageFit(src?: string): Promise<string | undefined> {
  if (!src || !src.startsWith('/')) return Promise.resolve(undefined)
  if (FIT_OVERRIDES[src]) return Promise.resolve(FIT_OVERRIDES[src])
  let p = cache.get(src)
  if (!p) { p = measure(src).catch(() => undefined); cache.set(src, p) }
  return p
}

async function measure(src: string): Promise<string | undefined> {
  const file = resolve(PUBLIC, decodeURIComponent(src.slice(1)))
  if (!existsSync(file)) return undefined
  // Analysed as it is seen on a light page: transparent areas become white, so a
  // semi-transparent black shadow reads as light grey (not as a dark product pixel).
  const N = 400 // analysis size (longest side)
  const { data, info } = await sharp(file).resize(N, N, { fit: 'inside' }).flatten({ background: '#ffffff' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width: w, height: h } = info
  const isBg = (x: number, y: number) => { const i = (y * w + x) * 4; return data[i + 3] < 16 || (data[i] > WHITE && data[i + 1] > WHITE && data[i + 2] > WHITE) }
  // Only studio shots are re-framed: at least 70% of the image border must be plain
  // white paper. A scene photo keeps `contain`, so none of its picture is clipped.
  const paper = (x: number, y: number) => { const i = (y * w + x) * 4; return data[i] > 249 && data[i + 1] > 249 && data[i + 2] > 249 }
  let border = 0, white = 0
  for (let x = 0; x < w; x++) for (const y of [1, h - 2]) { border++; if (paper(x, y)) white++ }
  for (let y = 0; y < h; y++) for (const x of [1, w - 2]) { border++; if (paper(x, y)) white++ }
  if (white / border < 0.7) return undefined
  // Vertical extent: every non-background row.
  let y0 = h, y1 = -1
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (!isBg(x, y)) { if (y < y0) y0 = y; if (y > y1) y1 = y; break }
  if (y1 < 0) return undefined
  // Horizontal extent: measured on the PRODUCT only. The cast shadow lies on the
  // ground beside the base, so the columns are taken from the upper 62% of the
  // product's height, where there is no shadow. Centring then follows the product.
  const yCut = y0 + Math.round((y1 - y0) * 0.62)
  let x0 = w, x1 = -1
  // Up there a stricter white test is safe (no shadow to pick up), and it is needed:
  // a white bottle's outline on a white background is only a few shades off white.
  const EDGE = 249
  const isPaper = (x: number, y: number) => { const i = (y * w + x) * 4; return data[i + 3] < 16 || (data[i] > EDGE && data[i + 1] > EDGE && data[i + 2] > EDGE) }
  for (let y = y0; y <= yCut; y++) for (let x = 0; x < w; x++) if (!isPaper(x, y)) { if (x < x0) x0 = x; if (x > x1) x1 = x }
  // Lower part: count only pixels that cannot be shadow — coloured (label band) or
  // dark. A cast shadow is a light neutral grey, so it never widens the product.
  for (let y = yCut + 1; y <= y1; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4
    if (data[i + 3] < 16) continue
    const mx = Math.max(data[i], data[i + 1], data[i + 2]), mn = Math.min(data[i], data[i + 1], data[i + 2])
    if (mx - mn > 40 || mx < 120) { if (x < x0) x0 = x; if (x > x1) x1 = x }
  }
  if (x1 < 0) return undefined
  const bw = (x1 - x0 + 1) / w, bh = (y1 - y0 + 1) / h // content box, as a share of the image
  if (bw > 0.94 && bh > 0.94) return undefined // scene photo: no margin to normalise
  // Image size as a share of the box, so that the content box fits FRAME x FRAME.
  const ar = w / h
  const scale = Math.min(FRAME / (bw * ar), FRAME / bh) // image HEIGHT in box units
  const imgH = scale, imgW = scale * ar
  const cx = (x0 + x1 + 1) / 2 / w, cy = (y0 + y1 + 1) / 2 / h
  const pct = (v: number) => `${(v * 100).toFixed(2)}%`
  return `position: absolute; max-width: none; width: ${pct(imgW)}; height: ${pct(imgH)}; left: ${pct(0.5 - cx * imgW)}; top: ${pct(0.5 - cy * imgH)}`
}
