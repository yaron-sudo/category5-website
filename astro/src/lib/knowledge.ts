// Site knowledge ("product memory") for the AI chat (/api/ask), as plain text.
// Per product, in this order of preference:
//   1. its knowledge file  src/c5/knowledge/products/<slug>.md  (front matter + body;
//      the "## פתוח" section — open contradictions — is never sent to the chat), or
//   2. what the new site shows for it: the catalogue (c5/content/catalog.ts: old site +
//      products.ts + overrides.ts) including the label as text.
// Plus the old site's long scientific sections (ingredient background and studies),
// which the new product page does not show. Hidden products are left out.
// Deterministic order + no timestamps, so the text is a stable prompt prefix and caches.
import { fetchQ, type PortableBlock } from './sanity'
import { getCatalog } from '@/c5/content/catalog'
import { PRODUCTS, type Product } from '@/c5/content/products'
import { SERIES, CONTACT } from '@/c5/data'

const FILES = import.meta.glob('../c5/knowledge/products/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>

interface OldExtra { slug: string; body?: PortableBlock[]; leaflet?: string }

const text = (blocks?: PortableBlock[]) =>
  (blocks ?? [])
    .filter((b) => b._type === 'block')
    .map((b) => {
      const t = ((b.children as Array<{ text?: string }>) ?? []).map((c) => c.text ?? '').join('')
      if (b.style === 'h2' || b.style === 'h3') return `\n## ${t}`
      return (b as { listItem?: string }).listItem ? `- ${t}` : t
    })
    .join('\n')
    .trim()

/** Knowledge file → text for the chat: keeps name/aliases from the front matter, drops the "פתוח" section and HTML comments. */
function fromFile(raw: string): { slug?: string; body: string } {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  const front = m?.[1] ?? '', rest = m ? m[2] : raw
  const field = (k: string) => front.match(new RegExp(`^${k}:\\s*(.+)$`, 'm'))?.[1]?.replace(/\s+#.*$/, '').trim()
  const body = rest.replace(/\n## פתוח[\s\S]*?(?=\n## |$)/, '\n').replace(/<!--[\s\S]*?-->/g, '').trim()
  const aliases = field('aliases')
  return { slug: field('slug'), body: (aliases ? `שמות נוספים: ${aliases.replace(/^\[|\]$/g, '')}\n` : '') + body }
}

function fromCatalog(p: Product): string {
  const out: string[] = []
  if (p.intro?.length) out.push(p.intro.join('\n'))
  if (p.contains) out.push(`אריזה: ${p.contains}`)
  if (p.benefits?.length) out.push('מאפייני המוצר (כלשון האתר):\n' + p.benefits.map((b) => `- ${b}`).join('\n'))
  if (p.usage?.length) out.push('הוראות שימוש:\n' + p.usage.map((b) => `- ${b}`).join('\n'))
  if (p.details?.length) out.push('פרטים ואזהרות:\n' + p.details.map((b) => `- ${b}`).join('\n'))
  const l = p.label
  if (l) {
    out.push('תווית המוצר:')
    if (l.title) out.push(l.title)
    if (l.ingredients) out.push(`רכיבים: ${l.ingredients}`)
    if (l.table) {
      if (l.table.caption) out.push(l.table.caption)
      if (l.table.columns?.length) out.push(l.table.columns.join(' | '))
      for (const r of l.table.rows) out.push(r.join(' | '))
    }
    for (const [k, v] of l.facts ?? []) out.push(`${k}: ${v}`)
    for (const n of l.notes ?? []) out.push(n)
  }
  if (p.keywords?.length) out.push(`מילות חיפוש: ${p.keywords.join(', ')}`)
  return out.join('\n')
}

let cached: Promise<string> | null = null

/** The full knowledge text (memoised per server instance). */
export function siteKnowledge(): Promise<string> {
  cached ??= build().catch((e) => { cached = null; throw e })
  return cached
}

async function build(): Promise<string> {
  const [catalog, extras, storeStats] = await Promise.all([
    getCatalog(),
    fetchQ<OldExtra[]>(`*[_type == "product" && defined(slug.current)]{ "slug": slug.current, body, leaflet }`),
    fetchQ<Array<{ category?: string }>>(`*[_type == "store" && active != false]{ category }`),
  ])
  const chains: Record<string, string> = { health: 'בתי טבע', 'super-pharm': 'סופר-פארם', nitzat: 'ניצת הדובדבן', bd: 'B&D', online: 'חנויות אינטרנט' }
  const byChain = storeStats.reduce<Record<string, number>>((m, s) => ((m[s.category ?? 'health'] = (m[s.category ?? 'health'] ?? 0) + 1), m), {})
  const extraBySlug = new Map(extras.map((e) => [e.slug, e]))
  const sourceOf = new Map(PRODUCTS.filter((p) => p.source).map((p) => [p.slug, p.source!]))
  const files = new Map(Object.keys(FILES).sort().map((k) => fromFile(FILES[k])).filter((f) => f.slug).map((f) => [f.slug!, f.body]))
  const seriesName = (slug: string) => SERIES.find((s) => s.slug === slug)?.name ?? slug

  const out: string[] = []
  out.push('# קטגוריה 5 תוספים אתיים (Category 5 Ethical Supplements) — מידע מהאתר')
  out.push(`יצירת קשר: ${CONTACT.email}, ווטסאפ (הודעות בלבד) ${CONTACT.whatsapp}, טופס בעמוד /contact.`)
  out.push(`נקודות מכירה (${storeStats.length}): ${Object.entries(byChain).map(([k, n]) => `${chains[k] ?? k} ${n}`).join(', ')}. רשימה מלאה וחיפוש לפי עיר: /stores. המוצרים אינם נמכרים ישירות באתר.`)

  out.push('\n# סדרות')
  for (const s of SERIES) out.push(`- ${s.name} (/series/${s.slug}): ${catalog.filter((p) => p.series === s.slug).map((p) => p.title).join(', ')}`)

  out.push('\n# מוצרים')
  for (const p of [...catalog].sort((a, b) => a.slug.localeCompare(b.slug))) {
    const extra = extraBySlug.get(p.slug) ?? extraBySlug.get(sourceOf.get(p.slug) ?? '')
    out.push(`\n<product name="${p.fullTitle || p.title}" url="/products/${p.slug}" series="${seriesName(p.series)}">`)
    out.push(files.get(p.slug) ?? fromCatalog(p))
    const background = text(extra?.body)
    if (background) out.push(`<background note="רקע על הרכיבים ומחקרים, כלשון החברה. לא המלצה ולא התוויה.">\n${background}\n</background>`)
    if (extra?.leaflet) out.push(`עלון מוצר (PDF): ${extra.leaflet}`)
    out.push('</product>')
  }
  return out.join('\n')
}
