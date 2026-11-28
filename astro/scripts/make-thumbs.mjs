// Smaller copies of the product and article photos for cards, grids and thumbnails
// (public/thumbs/…). The originals are never touched: the product page's main photo, the zoom,
// the share images and the image sitemap keep using them. Cards pick a copy through srcset
// (src/c5/content/thumbs.ts), so a phone at 3x still gets enough pixels.
//
//   product photos  → <name>-640 / -1200 / -1600.webp     (WebP q90 / q90 / q85, alpha kept at q100; 1600 is the step for
//                     photos the card framing zooms, so phones do not fall back to the 2000px original)
//   article photos  → <name>-800.webp                      (WebP q85; the 1200px JPEG original stays the large candidate:
//                     re-encoding grainy photos at that size is not smaller)
//   banners         → <name>-720 / -1080 / -1300 / -1950.webp (WebP q90; same aspect, no crop, no colour change; the JPEG original
//                     stays the largest candidate and the fallback src)
//
// Output sharpening (products): a copy is shown smaller than it is, and the browser's own downscale of a
// copy is softer than its downscale of the big original (measured on the Calcidex photos: 70-82% of the
// original's edge contrast at cards and thumbnails, with every kernel and even lossless). A light unsharp mask
// on the copy (sigma 0.6) brings it back to 97-105%. The originals are never touched.
//
// A width is only written when the source is at least that wide (no upscaling). Idempotent:
// a copy newer than its source is skipped. The outputs are committed; `npm run build` runs
// this first (prebuild), so a newly added photo is covered automatically.
import sharp from 'sharp'
import { readdirSync, statSync, existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { join, relative, basename, dirname, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const pub = join(root, 'public')
const IMG = /\.(webp|jpe?g|png)$/i
const walk = (d, out = []) => { if (!existsSync(d)) return out; for (const n of readdirSync(d)) { const p = join(d, n); statSync(p).isDirectory() ? walk(p, out) : out.push(p) } return out }

const jobs = []
// 240 / 480: the gallery thumbnails (76-129 css px). Measured on Calcidex: 240 and 480 keep the original's edge contrast at 1x / 1.5x / 2x, 320 and 640 do not.
const PRODUCT_W = [{ w: 240, q: 90 }, { w: 480, q: 90 }, { w: 640, q: 90 }, { w: 1200, q: 90 }, { w: 1600, q: 85 }]
// product photos: top level of assets/products (not labels / microscope shots)
for (const f of readdirSync(join(pub, 'assets/products'))) { const p = join(pub, 'assets/products', f); if (statSync(p).isFile() && IMG.test(f)) jobs.push({ file: p, widths: PRODUCT_W, sharpen: true }) }
// product photos kept in the old media library: the photo of every product in the content dataset
// (its first image without a caption, as catalog.ts picks it) and any /media path set in overrides.ts
const media = new Set()
try {
  const d = JSON.parse(readFileSync(join(root, 'content/dataset.json'), 'utf8'))
  for (const x of Array.isArray(d) ? d : d.documents ?? []) if (x._type === 'product') {
    const photo = (x.images ?? []).find((i) => i?.asset && !i.caption)
    const ref = photo?.asset?._ref ?? ''
    if (ref.startsWith('local:/media/')) media.add(ref.slice(6))
  }
} catch { /* no local dataset */ }
for (const f of ['overrides.ts', 'products.ts']) { try { for (const m of readFileSync(join(root, 'src/c5/content', f), 'utf8').match(/\/media\/[A-Za-z0-9_\-./]+\.(?:webp|jpe?g|png)/g) ?? []) media.add(m) } catch {} }
for (const m of media) { const p = join(pub, m); if (existsSync(p)) jobs.push({ file: p, widths: PRODUCT_W, sharpen: true }) }
// banners (full-width, shown at 100vw): the same picture, delivered at the width the screen needs
const BANNER_W = [{ w: 720, q: 90 }, { w: 1080, q: 90 }, { w: 1300, q: 90 }, { w: 1950, q: 88 }]
for (const p of walk(join(pub, 'assets/banners'))) if (IMG.test(p)) jobs.push({ file: p, widths: BANNER_W })
// article photos
for (const p of walk(join(pub, 'assets/articles'))) if (IMG.test(p)) jobs.push({ file: p, widths: [{ w: 800, q: 85 }] })

// Bump PARAMS whenever the way copies are made changes: every copy is then rebuilt on the next run.
const PARAMS = 'v2 products-sharpen-0.6'
const paramsFile = join(pub, 'thumbs', '.params')
const stale = !existsSync(paramsFile) || readFileSync(paramsFile, 'utf8') !== PARAMS
let made = 0, skipped = 0, bytesIn = 0, bytesOut = 0
for (const { file, widths, sharpen } of jobs) {
  const rel = relative(pub, file)
  const dir = join(pub, 'thumbs', dirname(rel)); const name = basename(rel, extname(rel))
  const srcTime = statSync(file).mtimeMs
  let meta
  for (const { w, q: quality } of widths) {
    const out = join(dir, `${name}-${w}.webp`)
    if (!stale && existsSync(out) && statSync(out).mtimeMs >= srcTime) { skipped++; continue }
    meta ??= await sharp(file).metadata()
    if (!meta.width || meta.width < w || (w >= 1300 && meta.width < w * 1.15)) continue // a 1600 copy of a 1600px source would be the original again
    mkdirSync(dir, { recursive: true })
    let pipe = sharp(file).resize({ width: w, withoutEnlargement: true })
    if (sharpen) pipe = pipe.sharpen({ sigma: 0.6, m1: 0.8, m2: 1.6 })
    const buf = await pipe.webp({ quality, alphaQuality: 100, effort: 6, smartSubsample: true }).toBuffer()
    // a copy that is not clearly smaller than an already-small original is pointless: the original stays the candidate
    if (buf.length >= statSync(file).size * 0.85) { if (existsSync(out)) rmSync(out); continue }
    writeFileSync(out, buf); made++; bytesOut += buf.length; bytesIn += statSync(file).size
  }
}
mkdirSync(join(pub, 'thumbs'), { recursive: true }); writeFileSync(paramsFile, PARAMS)
console.log(`make-thumbs: ${made} written, ${skipped} up to date${made ? ` (${(bytesOut / 1024) | 0} KB of copies)` : ''}`)
