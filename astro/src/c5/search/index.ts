// Build-time search index: every product and article with the fields the engine ranks.
// Sources: catalog (names, intro, benefits, usage, keywords), the knowledge files (aliases,
// ingredient section), labels, highlights, needs, research ingredient names; articles
// (title, Latin name, excerpt, headings, tags, body). Extra words: content/searchKeywords.ts.
import { getCatalog } from '@/c5/content/catalog'
import { productHref } from '@/c5/content/products'
import { SERIES, NEEDS } from '@/c5/data'
import { NEED_CONTENT } from '@/c5/content/needs'
import { HIGHLIGHTS, HIGHLIGHT_LABELS } from '@/c5/content/highlights'
import { ARTICLES } from '@/c5/content/articles'
import { PRODUCT_KEYWORDS, ARTICLE_KEYWORDS, SYNONYMS } from '@/c5/content/searchKeywords'
import { BLOCKED_TERMS } from '@/c5/content/searchBlocked'
import { productResearch } from '@/c5/knowledge/research'
import { parseKnowledge, stripTags } from '@/c5/knowledge/parse'

const KNOWLEDGE = import.meta.glob<string>('../knowledge/products/*.md', { query: '?raw', import: 'default', eager: true })
const know = new Map(Object.entries(KNOWLEDGE).map(([p, src]) => [p.split('/').pop()!.replace(/\.md$/, ''), parseKnowledge(src)]))

export interface SearchDoc {
  id: string; kind: 'product' | 'article'; title: string; href: string; image?: string; meta?: string
  fields: { name: string; keywords: string; ingredients: string; text: string; body: string }
}

export async function buildSearchDocs(): Promise<SearchDoc[]> {
  const docs: SearchDoc[] = []
  for (const p of await getCatalog()) {
    const k = know.get(p.slug)
    const series = SERIES.find((s) => s.slug === p.series)
    const needs = NEEDS.filter((n) => NEED_CONTENT[n.slug]?.products.includes(p.slug)).map((n) => n.label)
    // Ingredient names only — the first cell of each table row of the knowledge section
    // (never its prose, so no free text reaches the product index).
    const ing = (k?.sections.find((s) => s.title === 'רכיבים וכמויות')?.body ?? '')
      .split('\n').filter((l) => l.trim().startsWith('|'))
      .map((l) => l.split('|')[1]?.trim() ?? '').filter((c) => c && c !== 'רכיב' && !/^-+$/.test(c)).join(' ')
    const research = productResearch(p.slug).map((r) => r.name).join(' ')
    const labelIng = [p.label?.ingredients, p.label?.title, ...(p.label?.table?.rows.map((r) => r[0]) ?? [])].filter(Boolean).join(' ')
    const hl = HIGHLIGHTS[p.slug]
    const traits = hl ? HIGHLIGHT_LABELS.filter(([k2]) => hl.is.includes(k2)).map(([, l]) => l).concat(hl.kosher ? ['כשר', hl.kosher] : []).join(' ') : ''
    docs.push({
      id: p.slug, kind: 'product', title: p.title, href: productHref(p), image: p.image, meta: series?.name,
      fields: {
        name: [p.title, p.fullTitle, ...(k?.aliases ?? []), p.slug.replace(/-/g, ' ')].filter(Boolean).join(' '),
        keywords: [...(p.keywords ?? []), ...(PRODUCT_KEYWORDS[p.slug] ?? []), ...needs, series?.name ?? ''].join(' '),
        ingredients: [stripTags(ing), labelIng, research].join(' '),
        // Products are searchable by curated fields only (legal: no condition words from
        // descriptions can surface a product). Intro / benefits / usage are not indexed.
        text: traits,
        body: '',
      },
    })
  }
  for (const a of ARTICLES) {
    const heads = a.body.filter((b): b is { h2: string } => 'h2' in b).map((b) => b.h2).join(' ')
    const text = a.body.filter((b): b is { p: string } => 'p' in b).map((b) => b.p).join(' ')
    docs.push({
      id: a.slug, kind: 'article', title: a.title, href: `/articles/${a.slug}`, image: a.image, meta: a.latin,
      fields: {
        name: [a.title, a.latin].filter(Boolean).join(' '),
        keywords: [...(a.tags ?? []), ...(ARTICLE_KEYWORDS[a.slug] ?? [])].join(' '),
        ingredients: a.latin ?? '',
        text: [a.excerpt, heads].join(' '),
        body: text.slice(0, 1500),
      },
    })
  }
  return docs
}

export const SEARCH_SYNONYMS = SYNONYMS
export const SEARCH_BLOCKED = BLOCKED_TERMS
