// Site knowledge for the AI chat (/api/ask).
//
// Source of truth: the knowledge base in src/c5/knowledge/ (see docs/KNOWLEDGE.md):
//   general.md            company, technologies, where to buy, general questions
//   products/<slug>.md    one file per product (label facts first)
// The product list, names shown on the site, series and links come from the
// merged catalogue (c5/content/catalog.ts), so the chat only speaks about
// products that are actually shown. A shown product without a knowledge file
// gets a minimal entry (name + link) and the chat is told the details are missing.
//
// Deterministic order and no timestamps: the text is a stable prompt prefix and
// caches across requests (ask.ts sends it with cache_control).
import { getCatalog } from '@/c5/content/catalog'
import { SERIES, CONTACT, GLOSSARY } from '@/c5/data'
import { SERIES_CONTENT } from '@/c5/content/series'
import { ONLINE_SHOPS } from '@/c5/content/stores'
import { fetchQ } from './sanity'
import { parseKnowledge, parseResearch, researchRefs, chatText, stripTags, RESEARCH_SECTION } from '@/c5/knowledge/parse'
import general from '@/c5/knowledge/general.md?raw'

const FILES = import.meta.glob<string>('../c5/knowledge/products/*.md', { query: '?raw', import: 'default', eager: true })
const BY_SLUG = new Map(Object.entries(FILES).map(([path, src]) => [path.split('/').pop()!.replace(/\.md$/, ''), parseKnowledge(src)]))

// research/<id>.md: verified double-blind studies per active ingredient (docs/KNOWLEDGE.md → "מחקרים").
const RESEARCH_FILES = import.meta.glob<string>('../c5/knowledge/research/*.md', { query: '?raw', import: 'default', eager: true })
const RESEARCH = new Map(Object.values(RESEARCH_FILES).map((src) => parseResearch(src)).filter((r) => r.id && r.studies > 0).map((r) => [r.id, r]))
// Kept out of the product text: the research section is rendered separately, and the FAQ only
// restates facts of the other sections (it stays in the files for people and for other sessions).
const SKIP = new Set([RESEARCH_SECTION, 'שאלות נפוצות'])
// ASK_RESEARCH=off leaves the studies out of the chat context (they are about half of its size).
const env = (k: string): string | undefined => (import.meta.env as Record<string, string | undefined>)?.[k] ?? process.env[k]
const WITH_RESEARCH = env('ASK_RESEARCH') !== 'off'

let cached: Promise<string> | null = null

/** The full knowledge text (memoised per server instance). */
export function siteKnowledge(): Promise<string> {
  cached ??= build().catch((e) => { cached = null; throw e })
  return cached
}

const attr = (s: string) => s.replace(/"/g, '״')

async function build(): Promise<string> {
  const [catalog, stores] = await Promise.all([
    getCatalog(),
    fetchQ<Array<{ category?: string }>>(`*[_type == "store" && active != false]{ category }`).catch(() => []),
  ])
  const seriesName = (slug: string) => SERIES.find((s) => s.slug === slug)?.name ?? slug
  const out: string[] = []

  out.push(stripTags(general))

  out.push('\n# יצירת קשר והיכן קונים')
  out.push(`ווטסאפ (הודעות בלבד): ${CONTACT.whatsapp}. אימייל: ${CONTACT.email}. טופס פנייה: /contact.`)
  out.push(`המוצרים אינם נמכרים ישירות באתר. רשימת החנויות לפי אזורים${stores.length ? ` (${stores.length} נקודות מכירה)` : ''} ורכישה אונליין: /stores.`)
  out.push(`רכישה אונליין: ${ONLINE_SHOPS.map((s) => s.name).join(', ')}.`)

  out.push('\n# הסדרות')
  for (const s of SERIES) {
    out.push(`\n## ${s.name} (/series/${s.slug})`)
    for (const p of SERIES_CONTENT[s.slug]?.intro ?? []) out.push(p)
    out.push(`מוצרים: ${catalog.filter((p) => p.series === s.slug).map((p) => BY_SLUG.get(p.slug)?.meta.name || p.title).join(', ')}`)
  }

  out.push('\n# עולם המושגים (/glossary)')
  for (const g of GLOSSARY) out.push(`- ${g.term} (/glossary#${g.id}): ${g.text}`)

  out.push('\n# מוצרים')
  const used = new Set<string>()
  for (const p of catalog) {
    const k = BY_SLUG.get(p.slug)
    const name = k?.meta.name || p.title
    const aliases = [...new Set([p.title, p.fullTitle, ...(k?.aliases ?? []), ...(p.keywords ?? [])].filter((a): a is string => !!a && a !== name))]
    out.push(`\n<product name="${attr(name)}" url="/products/${p.slug}" series="${seriesName(p.series)}"${aliases.length ? ` aliases="${attr(aliases.join(', '))}"` : ''}>`)
    if (k) {
      out.push(chatText(k, SKIP))
      // Researched ingredients of this product, most important first; the studies themselves follow once, below.
      const refs = WITH_RESEARCH ? researchRefs(k).filter((r) => RESEARCH.has(r.id)) : []
      if (refs.length) {
        out.push(`## ${RESEARCH_SECTION}`)
        // A "זעום" ingredient is listed (so the chat can say the amount is far below the studied dose) but does not pull its studies in.
        for (const r of refs) { if (r.weight !== 'זעום') used.add(r.id); out.push(`- ${RESEARCH.get(r.id)!.name} (research id: ${r.id}) | משקל במוצר: ${r.weight} | במוצר: ${r.inProduct} | במחקרים: ${r.inStudies}`) }
      }
    }
    else out.push(`${p.contains ? p.contains + '. ' : ''}אין עדיין מידע מפורט על המוצר בבסיס הידע.`)
    out.push('</product>')
  }
  if (used.size) {
    out.push('\n# מחקרים על חומרים פעילים')
    out.push('מחקרים אקראיים כפולי-סמיות בבני אדם על חומרים פעילים שנמצאים במוצרים. המחקרים נעשו על החומר הפעיל ולא על מוצרי החברה, ולעיתים במינון או בצורה שונים מאלה שבמוצר.')
    for (const id of [...used].sort()) {
      const r = RESEARCH.get(id)!
      out.push(`\n<research id="${id}" name="${attr(r.name)}">\n${r.text}\n</research>`)
    }
  }
  return out.join('\n')
}
