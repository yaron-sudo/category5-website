// Smaller copies of the product and article photos for cards, grids and thumbnails
// (public/thumbs/…). The originals are never touched: the product page's main photo, the zoom,
// the share images and the image sitemap keep using them. Cards pick a copy through srcset
// (src/c5/content/thumbs.ts), so a phone at 3x still gets enough pixels.
//
//   product photos  → <name>-640 / -1200 / -1600.webp     (WebP q90 / q90 / q85, alpha kept at q100; 1600 is the step for
//                     photos the card framing zooms, so phones do not fall back to the 2000px original)
//   article photos  → <name>-800.webp                      (WebP q85; the 1200px JPEG original stays the large candidate:
//                     re-encoding grainy photos at that size is not smaller)
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
const PRODUCT_W = [{ w: 640, q: 90 }, { w: 1200, q: 90 }, { w: 1600, q: 85 }]
// product photos: top level of assets/products (not labels / microscope shots)
for (const f of readdirSync(join(pub, 'assets/products'))) { const p = join(pub, 'assets/products', f); if (statSync(p).isFile() && IMG.test(f)) jobs.push({ file: p, widths: PRODUCT_W }) }
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
for (const m of media) { const p = join(pub, m); if (existsSync(p)) jobs.push({ file: p, widths: PRODUCT_W }) }
// article photos
for (const p of walk(join(pub, 'assets/articles'))) if (IMG.test(p)) jobs.push({ file: p, widths: [{ w: 800, q: 85 }] })

let made = 0, skipped = 0, bytesIn = 0, bytesOut = 0
for (const { file, widths } of jobs) {
  const rel = relative(pub, file)
  const dir = join(pub, 'thumbs', dirname(rel)); const name = basename(rel, extname(rel))
  const srcTime = statSync(file).mtimeMs
  let meta
  for (const { w, q: quality } of widths) {
    const out = join(dir, `${name}-${w}.webp`)
    if (existsSync(out) && statSync(out).mtimeMs >= srcTime) { skipped++; continue }
    meta ??= await sharp(file).metadata()
    if (!meta.width || meta.width < w || (w >= 1600 && meta.width < w * 1.15)) continue // a 1600 copy of a 1600px source would be the original again
    mkdirSync(dir, { recursive: true })
    const buf = await sharp(file).resize({ width: w, withoutEnlargement: true }).webp({ quality, alphaQuality: 100, effort: 6, smartSubsample: true }).toBuffer()
    // a copy that is not clearly smaller than an already-small original is pointless: the original stays the candidate
    if (buf.length >= statSync(file).size * 0.85) { if (existsSync(out)) rmSync(out); continue }
    writeFileSync(out, buf); made++; bytesOut += buf.length; bytesIn += statSync(file).size
  }
}
console.log(`make-thumbs: ${made} written, ${skipped} up to date${made ? ` (${(bytesOut / 1024) | 0} KB of copies)` : ''}`)
