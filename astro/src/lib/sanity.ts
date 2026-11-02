import { createClient, type SanityClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import type { ImageUrlBuilder } from '@sanity/image-url/lib/types/builder'
import { parse as groqParse, evaluate as groqEvaluate } from 'groq-js'
import localDataset from '../../content/dataset.json'

// Build-time reads. If the dataset is public, no token is needed (preferred).
// If it's private, a read token (SANITY_READ_TOKEN) is required and the CDN
// must be bypassed. Image *files* are served publicly by URL either way.
// Env vars resolve from import.meta.env (Vite) or process.env (Node build).
const env = (k: string): string | undefined =>
  (import.meta.env as Record<string, string | undefined>)?.[k] ?? process.env[k]

// Tokens are only used for draft previews (visual editing). Static builds read
// the public, published dataset through Sanity's API CDN: it is the fast path
// AND it has its own, 10× larger request quota — the free plan's non-CDN "API
// requests" quota was exhausted once (plan_limit_reached) by builds that
// bypassed the CDN because a token happened to be set in the Vercel env.
// SANITY_BUILD_USE_API=true forces a fresh (non-CDN) build if ever needed.
const forceApi = env('SANITY_BUILD_USE_API') === 'true'

// ---- Visual editing / live preview -----------------------------------------
// On a preview deployment (PUBLIC_SANITY_VISUAL_EDITING_ENABLED=true) the site
// renders server-side (astro.config.mjs) and this client switches to:
//  - perspective 'previewDrafts' (needs a viewer/read token) → editors see
//    unpublished changes live in the Presentation tool;
//  - stega source maps → every string carries an invisible link back to its
//    Studio field, powering click-to-edit overlays.
// Without a token it degrades gracefully to published content (overlays still
// link into the Studio). Production builds leave all of this off.
export const visualEditingEnabled = env('PUBLIC_SANITY_VISUAL_EDITING_ENABLED') === 'true'
export const studioUrl = env('PUBLIC_SANITY_STUDIO_URL') || 'http://localhost:3333'
const token = visualEditingEnabled || forceApi ? env('SANITY_READ_TOKEN') ?? env('SANITY_WRITE_TOKEN') : undefined

// ---- Local dataset mode ----------------------------------------------------
// Until the site's Sanity project exists (SANITY_PROJECT_ID unset), every
// query runs locally with groq-js against astro/content/dataset.json — the
// exact documents the seed scripts (sanity/seed-*.mjs) push to Sanity. Same
// GROQ, same shapes: switching to Sanity is just setting the env var.
// Images in that file reference files under public/ ("local:/media/…").
export const localMode = !env('SANITY_PROJECT_ID')

export const client: SanityClient = createClient({
  projectId: env('SANITY_PROJECT_ID') ?? 'local',
  dataset: env('SANITY_DATASET') ?? 'production',
  apiVersion: env('SANITY_API_VERSION') ?? '2024-01-01',
  token,
  // CDN can't serve draft reads; everything else (static builds) goes through it.
  useCdn: !visualEditingEnabled && !forceApi,
  ...(visualEditingEnabled
    ? {
        perspective: visualEditingEnabled && token ? ('previewDrafts' as const) : ('published' as const),
        stega: {
          enabled: true,
          studioUrl,
          // Never stega-encode strings the code treats as data rather than
          // display copy (routes, ids, enum-ish keys) — invisible characters
          // would break lookups like FONTS[displayFont] or href routing.
          filter: (props) => {
            // Use the last *named* segment so arrays of enum strings are caught
            // too (e.g. comparison.rows[n].cells[i] → "cells", not the index).
            const named = [...props.sourcePath].reverse().find((s) => typeof s !== 'number')
            const key = String(named ?? '')
            if (/^(href|url|slug|icon|level|size|displayFont|bodyFont|year|phone|cells)$/.test(key)) return false
            if (/(Href|Url|Id)$/.test(key)) return false
            return props.filterDefault(props)
          },
        },
      }
    : {}),
})

// One request per distinct query per build. Every page renders Header/Footer
// (site settings, product nav) and several pages share queries, so without
// this a build issued hundreds of requests; with it, a few dozen. Disabled for
// the SSR preview, where each request must see the latest drafts.
const memo = new Map<string, Promise<unknown>>()
let requests = 0
async function localFetch<T>(query: string, params: Record<string, unknown>): Promise<T> {
  const tree = groqParse(query, { params })
  const value = await groqEvaluate(tree, { dataset: localDataset as unknown[], params })
  return (await value.get()) as T
}

export function fetchQ<T = unknown>(query: string, params: Record<string, unknown> = {}): Promise<T> {
  if (localMode) {
    const key = query + '\u0000' + JSON.stringify(params)
    let p = memo.get(key) as Promise<T> | undefined
    if (!p) { p = localFetch<T>(query, params); memo.set(key, p) }
    return p
  }
  if (visualEditingEnabled) return client.fetch<T>(query, params)
  const key = query + '\u0000' + JSON.stringify(params)
  let p = memo.get(key) as Promise<T> | undefined
  if (!p) {
    requests++
    if (env('SANITY_DEBUG_REQUESTS')) console.log(`[sanity] request #${requests}: ${query.slice(0, 70).replace(/\s+/g, ' ')}`)
    p = client.fetch<T>(query, params)
    p.catch(() => memo.delete(key)) // don't cache failures
    memo.set(key, p)
  }
  return p
}

const builder: ImageUrlBuilder = imageUrlBuilder(client)

// Local images (asset._ref "local:/media/…"): a chainable stand-in for the
// Sanity URL builder that ignores transforms and returns the public path.
function localRef(source: unknown): string | undefined {
  const ref = (source as { asset?: { _ref?: string } })?.asset?._ref
  return typeof ref === 'string' && ref.startsWith('local:') ? ref.slice(6) : undefined
}
function localBuilder(url: string): ImageUrlBuilder {
  const chain: any = new Proxy({}, { get: (_t, prop) => (prop === 'url' || prop === 'toString' ? () => url : () => chain) })
  return chain as ImageUrlBuilder
}

/** Responsive image URL helper. Pass a Sanity image ref/object. */
export function urlFor(source: unknown): ImageUrlBuilder {
  const local = localRef(source)
  if (local) return localBuilder(local)
  return builder.image(source as never)
}

/** True when an image object points at something renderable (Sanity asset or local file). */
export function hasImage(source: unknown): boolean {
  return Boolean((source as { asset?: unknown })?.asset)
}

// ---- Shared shapes -------------------------------------------------------

export interface SanityImage {
  _type: 'image'
  _key?: string
  alt?: string
  asset?: { _ref: string; _type: 'reference' }
}

export type PortableBlock = Record<string, unknown> & { _type: string; _key?: string }

export interface Feature {
  _id: string
  title: string
  text?: string
  icon: string
  order?: number
}

/** Resolve a YouTube or Vimeo URL into embed + muted-preview iframe URLs. */
export function videoEmbed(url?: string): { embed: string; preview: string; ytId?: string; vmId?: string } | null {
  if (!url) return null
  const yt = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/)
  if (yt) {
    const id = yt[1]
    return {
      ytId: id,
      embed: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1&modestbranding=1`,
      preview: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&playsinline=1&modestbranding=1&rel=0`,
    }
  }
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vm) {
    const id = vm[1]
    return {
      vmId: id,
      embed: `https://player.vimeo.com/video/${id}?autoplay=1&title=0&byline=0&portrait=0`,
      preview: `https://player.vimeo.com/video/${id}?background=1&autoplay=1&muted=1&loop=1`,
    }
  }
  return null
}

export interface HeroSlide {
  image?: SanityImage
  eyebrow?: string
  title?: string
  text?: string
  ctaLabel?: string
  ctaHref?: string
}

export interface NavChild {
  label?: string
  description?: string
  href?: string
}
export interface NavItem {
  label?: string
  href?: string
  children?: NavChild[]
}
export interface FooterColumn {
  title?: string
  links?: Array<{ label?: string; href?: string }>
}

export interface SiteSettings {
  brandName?: string
  tagline?: string
  announcement?: { enabled?: boolean; text?: string; href?: string }
  heroKicker?: string
  heroSlides?: HeroSlide[]
  video?: { url?: string; title?: string; poster?: SanityImage }
  nav?: NavItem[]
  headerCta?: { label?: string; href?: string }
  contact?: { email?: string; phone?: string; whatsapp?: string; address?: string; hours?: string }
  logo?: SanityImage
  stores?: Array<{ name?: string; city?: string; address?: string; url?: string }>
  socials?: { facebook?: string; instagram?: string; youtube?: string }
  footerColumns?: FooterColumn[]
  footerDisclaimer?: string
  footerLinks?: Array<{ label?: string; href?: string }>
}

/** Extract a YouTube video id from a watch/share/embed URL. */
export function youtubeId(url?: string): string | null {
  if (!url) return null
  const m = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/)
  return m ? m[1] : null
}

export interface PageDoc {
  _id: string
  title: string
  slug: string
  seoDescription?: string
  heroImage?: SanityImage
  body?: PortableBlock[]
  faqs?: FaqItem[]
  seo?: SeoMeta
}

export interface FaqItem {
  question?: string
  answer?: string
}

export interface CategoryRef { title: string; slug: string; color?: string; icon?: SanityImage }
export interface CategoryDoc extends CategoryRef {
  _id: string
  image?: SanityImage
  tagline?: string
  body?: PortableBlock[]
  seo?: SeoMeta
}

export interface ProductDoc {
  _id: string
  name: string
  slug: string
  isNew?: boolean
  tagline?: string
  intro?: string
  benefits?: string[]
  keyStats?: Array<{ value: string; label: string; icon?: string }>
  badges?: string[]
  body?: PortableBlock[]
  dosage?: string
  details?: Array<{ label: string; value: string }>
  warnings?: string[]
  faqs?: FaqItem[]
  images?: Array<SanityImage & { caption?: string }>
  video?: string
  leaflet?: string
  extraDocs?: Array<{ label: string; href: string }>
  legacyPath?: string
  category?: CategoryRef
  seo?: SeoMeta
}

// ---- Queries -------------------------------------------------------------

const FEATURE_FIELDS = `_id, title, text, icon, order`
const PAGE_FIELDS = `_id, title, "slug": slug.current, seoDescription, heroImage, body, faqs, seo`
const CAT_REF = `title, "slug": slug.current, color, icon`
const PRODUCT_FIELDS = `
  _id, name, "slug": slug.current, isNew, tagline, intro, benefits, keyStats, badges, body,
  dosage, details, warnings, faqs, images, video, leaflet, extraDocs, legacyPath, seo,
  "category": category->{ ${CAT_REF} }
`

export function getSiteSettings(): Promise<SiteSettings | null> {
  return fetchQ(`*[_type == "siteSettings"][0]`)
}

// ---- Stores (points of sale) --------------------------------------------

export type StoreRegion = 'north' | 'haifa' | 'center' | 'tel-aviv' | 'jerusalem' | 'south'
export type StoreCategory = 'health' | 'super-pharm' | 'nitzat' | 'bd' | 'online'
export interface StoreDoc {
  _id: string
  name: string
  city: string
  address?: string
  phone?: string
  region: StoreRegion
  category?: StoreCategory
  note?: string
  website?: string
  approximate?: boolean
  lat: number
  lng: number
}

/** Active stores, sorted by city then name (Hebrew collation is done client-side). */
export function getStores(): Promise<StoreDoc[]> {
  return fetchQ(
    `*[_type == "store" && active != false && defined(location)] | order(city asc, name asc)
      { _id, name, city, address, phone, website, approximate, region, category, note, "lat": location.lat, "lng": location.lng }`,
  )
}

// Ordering: drag-and-drop rank (orderRank, written by the Studio's orderable
// lists) wins; docs never dragged yet fall back to the legacy numeric order.
// "~" sorts after every real rank string, so ranked docs always come first.
const ORDER = `| order(coalesce(orderRank, "~") asc, order asc)`

export function getFeatures(): Promise<Feature[]> {
  return fetchQ(`*[_type == "feature"] ${ORDER}{${FEATURE_FIELDS}}`)
}

export function getPage(slug: string): Promise<PageDoc | null> {
  return fetchQ(`*[_type == "page" && slug.current == $slug][0]{${PAGE_FIELDS}}`, { slug })
}

export function getProduct(slug: string): Promise<ProductDoc | null> {
  return fetchQ(`*[_type == "product" && slug.current == $slug][0]{${PRODUCT_FIELDS}}`, { slug })
}

/** Card data for every product, in Studio order. */
export interface ProductCardData { name: string; slug: string; tagline?: string; isNew?: boolean; image?: SanityImage; category?: CategoryRef }
export function getAllProductCards(): Promise<ProductCardData[]> {
  return fetchQ(`*[_type == "product" && defined(slug.current)] ${ORDER}{ name, "slug": slug.current, tagline, isNew, "image": images[0], "category": category->{ ${CAT_REF} } }`)
}

export function getCategories(): Promise<CategoryDoc[]> {
  return fetchQ(`*[_type == "category" && defined(slug.current)] ${ORDER}{ _id, ${CAT_REF}, image, tagline, body, seo }`)
}
export function getCategory(slug: string): Promise<CategoryDoc | null> {
  return fetchQ(`*[_type == "category" && slug.current == $slug][0]{ _id, ${CAT_REF}, image, tagline, body, seo }`, { slug })
}

/** Old WordPress paths → new routes (products + categories carry legacyPath). */
export function getLegacyRoutes(): Promise<Array<{ from: string; to: string }>> {
  return fetchQ(`*[_type == "product" && defined(legacyPath)]{ "from": legacyPath, "to": "/products/" + slug.current }`)
}

/** All product slugs (for building the /products/[slug] routes). */
export function getProductSlugs(): Promise<string[]> {
  return fetchQ(`*[_type == "product" && defined(slug.current)].slug.current`)
}

export interface Photo {
  url: string
  ar: number
}

/** Fetch curated brand photos by their original WordPress filename. */
export async function getPhotos(filenames: string[]): Promise<Record<string, Photo>> {
  const rows: Array<{ originalFilename: string; url: string; ar: number }> = await fetchQ(
    `*[_type == "sanity.imageAsset" && originalFilename in $f]{ originalFilename, url, "ar": metadata.dimensions.aspectRatio }`,
    { f: filenames },
  )
  const map: Record<string, Photo> = {}
  for (const r of rows) map[r.originalFilename] = { url: r.url, ar: r.ar }
  return map
}

/** Sanity image transform URL helper for a raw asset URL. */
export function img(url: string, width: number): string {
  return `${url}?w=${width}&fit=max&auto=format&q=82`
}

// ---- Home page (fully CMS-driven singleton) ------------------------------

export interface Heading {
  text?: string
  level?: string
  size?: string
}

export interface HomePage {
  stats?: Array<{ value: string; label: string }>
  badges?: Array<{ text?: string; icon?: SanityImage }>
  productsCta?: { label?: string; href?: string }
  intro?: { eyebrow?: string; title?: Heading; text?: PortableBlock[]; image?: SanityImage; imageSecond?: SanityImage }
  featuresEyebrow?: string
  featuresTitle?: Heading
  positioning?: { eyebrow?: string; title?: Heading; text?: PortableBlock[]; image?: SanityImage }
  history?: {
    eyebrow?: string; title?: Heading; text?: PortableBlock[]; backgroundImage?: SanityImage
    milestones?: Array<{ year?: string; text?: string }>
  }
  experts?: { eyebrow?: string; title?: Heading; bio?: PortableBlock[] }
  production?: {
    eyebrow?: string; title?: Heading; text?: PortableBlock[]; image?: SanityImage
    steps?: Array<{ number?: string; title?: string; detail?: string }>
  }
  productsEyebrow?: string
  productsTitle?: Heading
  productCards?: Array<{ name?: string; tag?: string; image?: SanityImage; href?: string }>
  cta?: { title?: Heading; buttonLabel?: string; buttonHref?: string }
  seo?: SeoMeta
}

export function getHomePage(): Promise<HomePage | null> {
  return fetchQ(`*[_type == "homePage"][0]`)
}

// ---- SEO -----------------------------------------------------------------

export interface SeoMeta {
  metaTitle?: string
  metaDescription?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: SanityImage
  canonical?: string
  noindex?: boolean
}

/** Extract plain text from Portable Text for auto meta-descriptions. */
export function plainText(blocks?: PortableBlock[], max = 155): string {
  if (!blocks?.length) return ''
  const t = blocks
    .filter((b) => b._type === 'block')
    .map((b) => ((b as { children?: Array<{ text?: string }> }).children ?? []).map((c) => c.text ?? '').join(''))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
  return t.length > max ? t.slice(0, max - 1).replace(/\s\S*$/, '') + '…' : t
}

/** Resolve final SEO values: explicit CMS overrides win, else derived fallbacks. */
export function resolveSeo(
  seo: SeoMeta | undefined,
  fallback: { title: string; description?: string; image?: string },
): {
  title: string
  description?: string
  image?: string
  ogTitle?: string
  ogDescription?: string
  canonical?: string
  noindex: boolean
} {
  const image = hasImage(seo?.ogImage)
    ? urlFor(seo.ogImage).width(1200).height(630).fit('crop').auto('format').url()
    : fallback.image
  return {
    title: seo?.metaTitle || fallback.title,
    description: seo?.metaDescription || fallback.description,
    image,
    ogTitle: seo?.ogTitle,
    ogDescription: seo?.ogDescription,
    canonical: seo?.canonical,
    noindex: !!seo?.noindex,
  }
}

// ---- Typography (CMS-selectable fonts) -----------------------------------

interface FontDef {
  family: string
  google?: string // Google Fonts family+weights query, if not a brand/local font
}
// "alpha" is the brand font (self-hosted, Hebrew + Latin). The others are
// CMS-selectable alternatives from Google Fonts.
const FONTS: Record<string, FontDef> = {
  alpha: { family: '"Abel", "Alpha"' }, // Abel for Latin glyphs (no Hebrew in it), Alpha for Hebrew
  heebo: { family: '"Heebo"', google: 'Heebo:wght@400;500;700;900' },
  assistant: { family: '"Assistant"', google: 'Assistant:wght@400;500;700;800' },
  rubik: { family: '"Rubik"', google: 'Rubik:wght@400;500;700;900' },
}
const SYS = '"Helvetica Neue", Arial, sans-serif'

export function resolveFonts(typography?: { displayFont?: string; bodyFont?: string }) {
  const d = FONTS[typography?.displayFont ?? 'alpha'] ?? FONTS.alpha
  const b = FONTS[typography?.bodyFont ?? 'alpha'] ?? FONTS.alpha
  const googles = [...new Set([d.google, b.google].filter(Boolean))]
  const href = googles.length
    ? `https://fonts.googleapis.com/css2?${googles.map((g) => `family=${g}`).join('&')}&display=swap`
    : null
  return {
    display: `${d.family}, ${SYS}`,
    body: `${b.family}, ${d.family}, ${SYS}`,
    googleHref: href,
  }
}
