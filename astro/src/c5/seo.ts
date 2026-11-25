// Structured data (JSON-LD) helpers for the page types Google renders rich results for.
// Seo.astro always emits Organization + WebSite; pages add these through Site's `jsonLd` prop.
// No AggregateRating and no Offer/price: the site does not sell (SEO migration plan, 22.11.2026).
import { CONTACT, SERIES } from '@/c5/data'
import type { Product } from '@/c5/content/products'

export const SITE_URL = 'https://www.ethical-supplements.com'
export const BRAND_NAME = 'Category 5 Ethical Supplements'
export const BRAND_NAME_HE = 'קטגוריה 5 תוספים אתיים'
export const SOCIAL_PROFILES = [CONTACT.instagram, CONTACT.facebook]

const abs = (href: string, site?: URL | string) => new URL(href, site ?? SITE_URL).href

export type Crumb = { name: string; href: string }

/** BreadcrumbList: the path from the home page to the current page, in order. */
export function breadcrumbLd(items: Crumb[], site?: URL | string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: abs(c.href, site) })),
  }
}

/** Product: name, image, brand, description, series as category. */
export function productLd(p: Product, opts: { url: string; image?: string | string[]; description?: string; site?: URL | string }) {
  const series = SERIES.find((s) => s.slug === p.series)
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.fullTitle || p.title,
    url: abs(opts.url, opts.site),
    ...(opts.image ? { image: (Array.isArray(opts.image) ? opts.image : [opts.image]).filter(Boolean).map((i) => abs(i, opts.site)) } : {}),
    ...(opts.description ? { description: opts.description } : {}),
    brand: { '@type': 'Brand', name: BRAND_NAME },
    ...(series ? { category: series.name } : {}),
  }
}

/** Article (an ingredient review): headline, description, image, publisher. */
export function articleLd(a: { title: string; excerpt?: string; image?: string }, opts: { url: string; site?: URL | string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.title,
    ...(a.excerpt ? { description: a.excerpt } : {}),
    ...(a.image ? { image: abs(a.image, opts.site) } : {}),
    inLanguage: 'he-IL',
    mainEntityOfPage: abs(opts.url, opts.site),
    author: { '@type': 'Organization', name: BRAND_NAME },
    publisher: { '@type': 'Organization', name: BRAND_NAME, logo: { '@type': 'ImageObject', url: `${SITE_URL}/assets/logo/category5-logo.png` } },
  }
}
