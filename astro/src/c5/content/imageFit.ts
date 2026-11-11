// Uniform product framing. Product photos come with different amounts of white
// margin, so with plain `object-fit: contain` the bottles end up at different
// sizes. At build time we measure where the product actually is in each image
// (bounding box of everything that is not white / transparent) and return CSS
// that places the UNCHANGED image so that the product itself fills the same
// frame in every box. Scene photos (no white margin) simply fill the box.
import sharp from 'sharp'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

/** The product occupies at most this share of the (square) box, centred. */
const FRAME = 0.74
const WHITE = 236 // channels above this count as background (also skips faint shadows)

const PUBLIC = [resolve(process.cwd(), 'public'), resolve(process.cwd(), 'astro/public')].find((d) => existsSync(d)) ?? 'public'
const cache = new Map<string, Promise<string | undefined>>()

/** Inline style for an <img> inside a square, `position: relative; overflow: hidden` box — or undefined to keep `contain`. */
export function imageFit(src?: string): Promise<string | undefined> {
  if (!src || !src.startsWith('/')) return Promise.resolve(undefined)
  let p = cache.get(src)
  if (!p) { p = measure(src).catch(() => undefined); cache.set(src, p) }
  return p
}

async function measure(src: string): Promise<string | undefined> {
  const file = resolve(PUBLIC, decodeURIComponent(src.slice(1)))
  if (!existsSync(file)) return undefined
  const N = 400 // analysis size (longest side)
  const { data, info } = await sharp(file).resize(N, N, { fit: 'inside' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width: w, height: h } = info
  const isBg = (x: number, y: number) => { const i = (y * w + x) * 4; return data[i + 3] < 16 || (data[i] > WHITE && data[i + 1] > WHITE && data[i + 2] > WHITE) }
  // Only studio shots (white / transparent in all four corners) are re-framed; a
  // scene photo keeps `contain`, so none of its picture is ever clipped.
  if (![[2, 2], [w - 3, 2], [2, h - 3], [w - 3, h - 3]].every(([x, y]) => isBg(x, y))) return undefined
  let x0 = w, y0 = h, x1 = -1, y1 = -1
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4
    const bg = data[i + 3] < 16 || (data[i] > WHITE && data[i + 1] > WHITE && data[i + 2] > WHITE)
    if (!bg) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y }
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
