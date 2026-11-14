// Parser for the product knowledge files (products/<slug>.md). No imports, so it
// runs both inside the site build (src/lib/knowledge.ts) and in plain Node
// (check.mjs). File format: docs/KNOWLEDGE.md.

/** The `##` sections every product file must have, in this order. */
export const SECTIONS = [
  'מה המוצר', 'רכיבים וכמויות', 'הוראות שימוש', 'אינו מכיל / אלרגנים', 'טבעונות', 'כשרות', 'אזהרות',
  'אריזה ואחסון', 'מאפיינים', 'שאלות נפוצות', 'מילות חיפוש', 'מוצרים קשורים', 'מחקרים על הרכיבים', 'פתוח',
] as const
/** Sections kept out of the chat context ("פתוח" = contradictions and dropped claims, for the client only). */
export const PRIVATE_SECTIONS = new Set<string>(['פתוח'])
export const EMPTY = 'אין מידע במקורות.'
/** Section listing the product's researched ingredients: lines `- <research id> | <weight> | במוצר: … | במחקרים: …`. */
export const RESEARCH_SECTION = 'מחקרים על הרכיבים'
export interface ResearchRef { id: string; weight: string; inProduct: string; inStudies: string }
export function researchRefs(k: KnowledgeFile): ResearchRef[] {
  const body = k.sections.find((s) => s.title === RESEARCH_SECTION)?.body ?? ''
  return body.split('\n').map((l) => /^- *([a-z0-9-]+) *\| *([^|]+)\| *במוצר: *([^|]*)\| *במחקרים: *(.*)$/.exec(l.trim()))
    .filter((m): m is RegExpExecArray => !!m).map((m) => ({ id: m[1], weight: m[2].trim(), inProduct: m[3].trim(), inStudies: m[4].trim() }))
}
export const REQUIRED_META = ['slug', 'name', 'series', 'url', 'status', 'updated'] as const

export interface KnowledgeFile {
  meta: Record<string, string>
  aliases: string[]
  sections: Array<{ title: string; body: string }>
}

export function parseKnowledge(src: string): KnowledgeFile {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(src)
  const meta: Record<string, string> = {}
  for (const line of (m?.[1] ?? '').split(/\r?\n/)) {
    const kv = /^([a-z_]+):\s*(.*)$/.exec(line) // top-level keys only (the nested `sources:` lines are indented)
    if (kv) meta[kv[1]] = kv[2].replace(/\s+#.*$/, '').trim()
  }
  const aliases = (meta.aliases ?? '').replace(/^\[|\]$/g, '').split(',').map((s) => s.trim()).filter(Boolean)
  const sections: KnowledgeFile['sections'] = []
  for (const part of (m?.[2] ?? src).split(/^## +/m).slice(1)) {
    const nl = part.indexOf('\n')
    sections.push({ title: (nl < 0 ? part : part.slice(0, nl)).trim(), body: nl < 0 ? '' : part.slice(nl + 1).trim() })
  }
  return { meta, aliases, sections }
}

// Source tags at line ends: [תווית], [עלון, אתר ישן] … — for maintainers, not for the chat.
const TAG = /[ \t]*\[(?:תווית|עלון|אתר ישן|אתר|BOM|מדריך מגנזיום|חוברת 2025|מסמך לקוח)(?:,\s*(?:תווית|עלון|אתר ישן|אתר|BOM|מדריך מגנזיום|חוברת 2025|מסמך לקוח))*\]/g

/** Removes maintainer-only markup (HTML comments, source tags). */
// "(טרם אומת מול התווית)" marks a dosage/amount taken from a brochure — a note for maintainers; the chat
// states the value plainly (client decision, 13.11.2026).
const UNVERIFIED = /[ \t]*\([^()\n]*טרם אומת[^()\n]*\)/g
export const stripTags = (s: string) => s.replace(/<!--[\s\S]*?-->/g, '').replace(TAG, '').replace(UNVERIFIED, '').replace(/\n{3,}/g, '\n\n').trim()

/** The text of one product as sent to the chat: no private sections, no empty sections, no source tags. */
export function chatText(k: KnowledgeFile, skip: ReadonlySet<string> = new Set()): string {
  return k.sections
    .filter((s) => !PRIVATE_SECTIONS.has(s.title) && !skip.has(s.title))
    .map((s) => ({ title: s.title, body: stripTags(s.body) }))
    .filter((s) => s.body && s.body !== EMPTY)
    .map((s) => `## ${s.title}\n${s.body}`)
    .join('\n')
}

/**
 * Client decision (13.11.2026, legal): the site and the chat never compare the amount in a product with the
 * dose used in a study. They only name the ingredient in the product and the ingredient that was studied.
 * The "במוצר / במחקרים" fields and the weight stay in the files for maintainers (the weight decides which
 * ingredients are shown at all). Notes that speak about amounts in the products are filtered out here.
 */
export const isAmountNote = (note: string) => /מוצר/.test(note) && /כמות|מינון|מנה|מ"ג|מק"ג|מיליארד|CFU|נמוכ|גבוה|זהה|קרוב/.test(note)

/**
 * Client decision (13.11.2026): only studies that reported a significant favourable result for the ingredient
 * are shown (site and chat). A study marked `- הצגה: לא` stays in the file as a record and is never shown.
 */
export const HIDDEN_STUDY = /^- הצגה: *לא/m
/** Drops hidden study blocks (`### …` up to the next heading) from a research file's text. */
export const visibleStudies = (src: string) => src.split(/^(?=###? )/m).filter((b) => !(b.startsWith('### ') && HIDDEN_STUDY.test(b))).join('')

/** A research file (research/<id>.md): the SHOWN studies on one active ingredient. `studies` is 0 when none is shown. */
export function parseResearch(full: string): { id: string; name: string; text: string; studies: number; contexts: string[] } {
  const src = visibleStudies(full)
  const k = parseKnowledge(src)
  const studies = (src.match(/^### /gm) ?? []).length
  // For the chat: no notes (maintainers' remarks), no "מה נבדק" (the findings name the outcomes), sections left without a study are dropped.
  const text = k.sections
    .filter((s) => s.title !== 'הערות' && /^### /m.test(s.body))
    .map((s) => `## ${s.title}\n${stripTags(s.body).replace(/^- מה נבדק:.*\n/gm, '').replace(/^- הרכיב והמינון במחקר:.*\n/gm, '').replace(/^- הצגה:.*\n?/gm, '')}`).join('\n')
    // A study with a plain-language summary ("בקצרה") reaches the chat as title + studied ingredient + summary + source only.
    .split(/^(?=### )/m).map((b) => (/^- בקצרה:/m.test(b) ? b.replace(/^- (סוג המחקר|אוכלוסייה|מה דווח):.*\n/gm, '') : b)).join('')
  const contexts = [...src.matchAll(/^- אוכלוסייה: *(.*)$/gm)].map((m) => m[1].replace(/\.$/, '').trim())
  return { id: k.meta.id ?? '', name: k.meta.name ?? '', text, studies, contexts }
}
