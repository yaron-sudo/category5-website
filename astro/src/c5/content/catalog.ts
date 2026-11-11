// The product catalogue of the new site =
//   1. products entered by hand in products.ts, plus
//   2. every product of the old site (the migrated dataset / Sanity), mapped
//      onto the new product-page fields (BRIEF §8), then
//   3. per-product edits from overrides.ts, and
//   4. replacement images found in public/assets/products/ (by slug).
// Series pages, product pages and (later) search all read from here.
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { fetchQ, urlFor, type SanityImage } from '@/lib/sanity'
import { DISCLAIMER } from '@/lib/brand'
import { PRODUCTS, type Product } from './products'
import { PRODUCT_OVERRIDES } from './overrides'
import { BOM_SERIES } from './bom'

type SeriesSlug = Product['series']

/** Old site family → new series: fallback only for products that are not in the BOM list (bom.ts). */
const FAMILY_TO_SERIES: Record<string, SeriesSlug> = {
  'vitamins-and-minerals': 'vitamins-minerals',
  'liposomal-vitamin-c': 'vitamins-minerals',
  'herbs-and-plants': 'plants',
  'immune-system': 'professional',
  'memory-and-cognition': 'professional',
  'inflammation-and-mobility': 'professional',
}
/** Old-site products that are probiotics, whatever family page they sat under. */
const PROBIOTIC_SLUGS = new Set(['umanaflora-daily', 'umanaflora-de111', 'umanaflora-53', 'geniflora-c15', 'lpldl-probiotic'])

interface OldProduct {
  slug: string; name: string; family?: string; intro?: string; benefits?: string[]
  keyStats?: Array<{ value?: string; label?: string }>
  dosage?: string; details?: Array<{ label: string; value: string }>; warnings?: string[]
  images?: Array<SanityImage & { caption?: string }>
}

const UNIT = /כמוסות|קפסולות|טבליות|סאשטים|גרם|מ"ל|מ״ל/
function contains(stats: OldProduct['keyStats']): string | undefined {
  const s = (stats ?? []).find((k) => UNIT.test(`${k.value ?? ''} ${k.label ?? ''}`) && /\d/.test(k.value ?? ''))
  if (!s) return undefined
  const v = (s.value ?? '').trim(), l = (s.label ?? '').trim()
  return `מכיל ${UNIT.test(v) || !l ? v : `${v} ${l}`}`
}

function fromOld(o: OldProduct): Product {
  const imgs = (o.images ?? []).filter((i) => i?.asset)
  const photo = imgs.find((i) => !i.caption)
  const label = imgs.find((i) => i.caption)
  const details = [...(o.details ?? []).map((d) => `${d.label}: ${d.value}`), ...(o.warnings ?? [])]
  return {
    slug: o.slug,
    title: o.name,
    series: BOM_SERIES[o.slug] ?? (PROBIOTIC_SLUGS.has(o.slug) ? 'probiotics' : FAMILY_TO_SERIES[o.family ?? ''] ?? 'professional'),
    image: photo ? urlFor(photo).width(1200).fit('max').auto('format').url() : undefined,
    intro: o.intro ? o.intro.split('\n').filter(Boolean) : undefined,
    contains: contains(o.keyStats),
    usage: o.dosage ? [o.dosage] : undefined,
    benefits: o.benefits?.length ? o.benefits : undefined,
    labelImage: label ? urlFor(label).width(1600).fit('max').auto('format').url() : undefined,
    details: details.length ? details : undefined,
    legal: DISCLAIMER,
  }
}

// Replacement images: public/assets/products/<slug>.<ext> and …/labels/<slug>.<ext>
const PUBLIC = [resolve(process.cwd(), 'public'), resolve(process.cwd(), 'astro/public')].find((d) => existsSync(d)) ?? 'public'
function assetFor(dir: string, slug: string): string | undefined {
  for (const ext of ['jpg', 'jpeg', 'png', 'webp']) if (existsSync(resolve(PUBLIC, dir, `${slug}.${ext}`))) return `/${dir}/${slug}.${ext}`
  return undefined
}

let cache: Promise<Product[]> | null = null
let hiddenTo: Record<string, string> = {}
export function getCatalog(): Promise<Product[]> {
  cache ??= build()
  return cache
}

async function build(): Promise<Product[]> {
  const old = await fetchQ<OldProduct[]>(
    `*[_type == "product" && defined(slug.current)] | order(orderRank asc){
      "slug": slug.current, name, "family": category->slug.current, intro, benefits, keyStats, dosage, details, warnings, images }`,
  )
  const manual = new Map(PRODUCTS.map((p) => [p.slug, p]))
  // A hand-entered product with `source` takes its content from that old product and replaces it.
  const replaced = new Set(PRODUCTS.map((p) => p.source).filter(Boolean) as string[])
  const oldBySlug = new Map(old.map((o) => [o.slug, o]))

  const merged: Product[] = [
    ...PRODUCTS.map((p) => {
      const src = p.source ? oldBySlug.get(p.source) : undefined
      const q = { ...p, series: BOM_SERIES[p.slug] ?? p.series }
      return src ? { ...fromOld(src), ...q } : q
    }),
    ...old.filter((o) => !manual.has(o.slug) && !replaced.has(o.slug)).map(fromOld),
  ]
  hiddenTo = {}
  return merged
    .map((p) => {
      const { hidden, ...ov } = PRODUCT_OVERRIDES[p.slug] ?? {}
      if (hidden) { hiddenTo[p.slug] = `/series/${ov.series ?? p.series}`; return null }
      const out: Product = { ...p, ...ov }
      out.image = ov.image ?? assetFor('assets/products', p.slug) ?? out.image
      out.labelImage = ov.labelImage ?? assetFor('assets/products/labels', p.slug) ?? out.labelImage
      return out
    })
    .filter((p): p is Product => !!p)
}

export const productsOfSeries = async (series: string) => (await getCatalog()).filter((p) => p.series === series)
/** Old-site slugs replaced by a hand-entered product (`source`) → that product's slug, for redirects. */
export const replacedSlugs = () => Object.fromEntries(PRODUCTS.filter((p) => p.source).map((p) => [p.source!, p.slug]))
/** Hidden products (overrides.ts) → the series page their old URL should redirect to. */
export const hiddenRedirects = async () => { await getCatalog(); return hiddenTo }
