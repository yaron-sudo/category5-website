// Site knowledge for the AI Q&A assistant (/api/ask): every product family and
// product, rendered as plain text from the same CMS data the pages use (local
// dataset or Sanity). Deterministic order + no timestamps, so the text is a
// stable prompt prefix and caches across requests.
import { fetchQ, type PortableBlock } from './sanity'
import { BADGE_LABELS } from './brand'

interface KProduct {
  name: string; slug: string; tagline?: string; intro?: string; benefits?: string[]
  keyStats?: Array<{ value: string; label: string }>; badges?: string[]; body?: PortableBlock[]
  dosage?: string; details?: Array<{ label: string; value: string }>; warnings?: string[]
  faqs?: Array<{ question?: string; answer?: string }>; leaflet?: string
  category?: { title: string; slug: string }
}
interface KCategory { title: string; slug: string; tagline?: string; body?: PortableBlock[] }

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

let cached: Promise<string> | null = null

/** The full knowledge text (memoised per server instance). */
export function siteKnowledge(): Promise<string> {
  cached ??= build().catch((e) => { cached = null; throw e })
  return cached
}

async function build(): Promise<string> {
  const [cats, prods, settings, storeStats] = await Promise.all([
    fetchQ<KCategory[]>(`*[_type == "category" && defined(slug.current)] | order(orderRank asc){ title, "slug": slug.current, tagline, body }`),
    fetchQ<KProduct[]>(`*[_type == "product" && defined(slug.current)] | order(orderRank asc){
      name, "slug": slug.current, tagline, intro, benefits, keyStats, badges, body, dosage, details, warnings, faqs, leaflet,
      "category": category->{ title, "slug": slug.current } }`),
    fetchQ<{ contact?: { email?: string; phone?: string } } | null>(`*[_type == "siteSettings"][0]{ contact }`),
    fetchQ<Array<{ category?: string }>>(`*[_type == "store" && active != false]{ category }`),
  ])
  const chains: Record<string, string> = { health: 'בתי טבע', 'super-pharm': 'סופר-פארם', nitzat: 'ניצת הדובדבן', bd: 'B&D', online: 'חנויות אינטרנט' }
  const byChain = storeStats.reduce<Record<string, number>>((m, s) => ((m[s.category ?? 'health'] = (m[s.category ?? 'health'] ?? 0) + 1), m), {})

  const out: string[] = []
  out.push('# קטגוריה 5 תוספים אתיים (Category 5 Ethical Supplements) — מידע מהאתר')
  out.push(`יצירת קשר: ${settings?.contact?.email ?? 'info@ethical-supplements.com'}, ווטסאפ (הודעות בלבד) ${settings?.contact?.phone ?? '053-9325888'}, טופס בעמוד /contact.`)
  out.push(`נקודות מכירה (${storeStats.length}): ${Object.entries(byChain).map(([k, n]) => `${chains[k] ?? k} ${n}`).join(', ')}. רשימה מלאה עם מפה וחיפוש לפי עיר: /stores. המוצרים אינם נמכרים ישירות באתר.`)

  out.push('\n# משפחות מוצרים')
  for (const c of cats) {
    out.push(`\n## ${c.title} (/category/${c.slug})`)
    if (c.tagline) out.push(c.tagline)
    const t = text(c.body)
    if (t) out.push(t)
    out.push(`מוצרים: ${prods.filter((p) => p.category?.slug === c.slug).map((p) => p.name).join(', ')}`)
  }

  out.push('\n# מוצרים')
  for (const p of prods) {
    out.push(`\n<product name="${p.name}" url="/products/${p.slug}" family="${p.category?.title ?? ''}">`)
    if (p.tagline) out.push(p.tagline)
    if (p.intro) out.push(p.intro)
    if (p.benefits?.length) out.push('יתרונות:\n' + p.benefits.map((b) => `- ${b}`).join('\n'))
    if (p.keyStats?.length) out.push('נתונים: ' + p.keyStats.map((s) => `${s.value} ${s.label}`.trim()).join(' · '))
    if (p.badges?.length) out.push('תגים: ' + p.badges.map((b) => BADGE_LABELS[b] ?? b).join(', '))
    if (p.dosage) out.push(`המלצות שימוש: ${p.dosage}`)
    if (p.details?.length) out.push(p.details.map((d) => `${d.label}: ${d.value}`).join('\n'))
    if (p.warnings?.length) out.push('אזהרות: ' + p.warnings.join(' '))
    const t = text(p.body)
    if (t) out.push(t)
    for (const f of p.faqs ?? []) if (f.question && f.answer) out.push(`ש: ${f.question}\nת: ${f.answer}`)
    if (p.leaflet) out.push(`עלון מוצר (PDF): ${p.leaflet}`)
    out.push('</product>')
  }
  return out.join('\n')
}
