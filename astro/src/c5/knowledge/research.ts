// Research data for the product page ("מחקרים" accordion): the studies on a product's
// active ingredients, as structured data. Source: research/<id>.md (one file per ingredient)
// + the "מחקרים על הרכיבים" section of products/<slug>.md. Format and rules: docs/KNOWLEDGE.md.
// Rendering: ProductResearch.astro (same folder) or any component of the design session.
import { parseKnowledge, researchRefs, isAmountNote } from './parse'

export interface Study {
  title: string
  /** Study design as written in the file, e.g. "אקראי, כפול-סמיות, מבוקר פלצבו; 60 משתתפים; 12 שבועות." */
  type: string
  population?: string
  /** The ingredient that was studied (form / strain / brand), as written in the file. */
  studied?: string
  examined?: string
  reported?: string
  /** Citation text without the link. */
  source?: string
  url?: string
  /** true = from the "## מחקרים" section (verified randomized double-blind human trials). */
  doubleBlind: boolean
  /** Section heading the study sits under. */
  section: string
}
export interface IngredientResearch {
  id: string
  name: string
  /** עיקרי | משני — for ordering only; never displayed. */
  weight: string
  studies: Study[]
  notes: string[]
}

const PRODUCT_FILES = import.meta.glob<string>('./products/*.md', { query: '?raw', import: 'default', eager: true })
const RESEARCH_FILES = import.meta.glob<string>('./research/*.md', { query: '?raw', import: 'default', eager: true })
const slugOf = (path: string) => path.split('/').pop()!.replace(/\.md$/, '')

const FIELDS: Record<string, keyof Study> = {
  'סוג המחקר': 'type', 'אוכלוסייה': 'population', 'הרכיב והמינון במחקר': 'studied', 'מה נבדק': 'examined', 'מה דווח': 'reported', 'מקור': 'source',
}

function parseFile(src: string): { name: string; studies: Study[]; notes: string[] } {
  const k = parseKnowledge(src)
  const studies: Study[] = []
  let notes: string[] = []
  for (const s of k.sections) {
    if (s.title === 'הערות') { notes = s.body.split('\n').map((l) => l.replace(/^- */, '').trim()).filter((l) => l && !isAmountNote(l)); continue }
    for (const block of s.body.split(/^### +/m).slice(1)) {
      const lines = block.split('\n')
      const st: Study = { title: lines[0].replace(/^\d+\.\s*/, '').trim(), type: '', doubleBlind: s.title === 'מחקרים', section: s.title }
      for (const l of lines.slice(1)) {
        const m = /^- *([^:]+): *(.*)$/.exec(l.trim())
        const key = m && FIELDS[m[1].trim()]
        if (m && key) (st as unknown as Record<string, string>)[key] = m[2].trim()
      }
      const url = /https?:\/\/\S+/.exec(st.source ?? '')
      if (url) { st.url = url[0].replace(/[.,;]+$/, ''); st.source = st.source!.replace(url[0], '').trim() }
      if (st.title && st.type) studies.push(st)
    }
  }
  return { name: k.meta.name ?? '', studies, notes }
}

const RESEARCH = new Map(Object.entries(RESEARCH_FILES).map(([p, src]) => [slugOf(p), parseFile(src)]))
const PRODUCTS = new Map(Object.entries(PRODUCT_FILES).map(([p, src]) => [slugOf(p), parseKnowledge(src)]))
const ORDER: Record<string, number> = { 'עיקרי': 0, 'משני': 1, 'זעום': 2 }

/**
 * Researched ingredients of a product, most important first, each with its studies.
 * Ingredients without any study, and "זעום" ingredients, are left out.
 * Client decision (legal): no amounts of the product and no product-vs-study comparison are exposed here —
 * only the ingredient's name and, per study, the ingredient that was studied.
 */
export function productResearch(slug: string): IngredientResearch[] {
  const k = PRODUCTS.get(slug)
  if (!k) return []
  return researchRefs(k)
    .filter((r) => r.weight !== 'זעום' && (RESEARCH.get(r.id)?.studies.length ?? 0) > 0)
    .sort((a, b) => (ORDER[a.weight] ?? 9) - (ORDER[b.weight] ?? 9))
    .map((r) => ({ id: r.id, weight: r.weight, ...RESEARCH.get(r.id)! }))
}

/** Shown above the studies; wording agreed in docs/KNOWLEDGE.md. */
export const RESEARCH_DISCLAIMER =
  'המחקרים נעשו על החומרים הפעילים ולא על המוצר עצמו. המידע מובא לידיעה בלבד, אינו המלצה רפואית ואינו תחליף להתייעצות עם רופא. תוסף תזונה אינו תרופה.'
