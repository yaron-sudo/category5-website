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
const TAG = /[ \t]*\[(?:תווית|עלון|אתר ישן|אתר|BOM|מדריך מגנזיום|חוברת 2025)(?:,\s*(?:תווית|עלון|אתר ישן|אתר|BOM|מדריך מגנזיום|חוברת 2025))*\]/g

/** Removes maintainer-only markup (HTML comments, source tags). */
export const stripTags = (s: string) => s.replace(/<!--[\s\S]*?-->/g, '').replace(TAG, '').replace(/\n{3,}/g, '\n\n').trim()

/** The text of one product as sent to the chat: no private sections, no empty sections, no source tags. */
export function chatText(k: KnowledgeFile, skip: ReadonlySet<string> = new Set()): string {
  return k.sections
    .filter((s) => !PRIVATE_SECTIONS.has(s.title) && !skip.has(s.title))
    .map((s) => ({ title: s.title, body: stripTags(s.body) }))
    .filter((s) => s.body && s.body !== EMPTY)
    .map((s) => `## ${s.title}\n${s.body}`)
    .join('\n')
}

/** A research file (research/<id>.md): studies on one active ingredient. `studies` is empty when none qualified. */
export function parseResearch(src: string): { id: string; name: string; text: string; studies: number } {
  const k = parseKnowledge(src)
  const studies = (src.match(/^### /gm) ?? []).length
  const text = k.sections.map((s) => `## ${s.title}\n${stripTags(s.body)}`).join('\n')
  return { id: k.meta.id ?? '', name: k.meta.name ?? '', text, studies }
}
