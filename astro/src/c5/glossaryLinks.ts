// BRIEF §1: wherever a glossary term appears in site text it links to /glossary#<id>.
// linkTerms() escapes the text and links the first occurrence of each term.
import { GLOSSARY } from './data'

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
// Longest terms first, so "חומר גלם שנבדק קלינית" wins over shorter overlaps.
const TERMS = [...GLOSSARY].sort((a, b) => b.term.length - a.term.length)
const HEB = '\\u05D0-\\u05EA'

/** Escaped HTML with glossary terms linked (once per term per call). Pass `used` to share state across calls on one page. */
export function linkTerms(text: string, used: Set<string> = new Set()): string {
  let parts: Array<{ t: string; html?: string }> = [{ t: text }]
  for (const g of TERMS) {
    if (used.has(g.id)) continue
    // Whole-word match; Hebrew prefixes (ה/ב/ל/ו/מ/ש/כ) may precede the term.
    const re = new RegExp(`(^|[^${HEB}A-Za-z])([הבלומשכ]{0,2})(${g.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})(?![${HEB}A-Za-z])`, 'i')
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i]
      if (p.html) continue
      const m = re.exec(p.t)
      if (!m) continue
      const start = m.index + m[1].length
      const end = start + m[2].length + m[3].length
      parts.splice(i, 1,
        { t: p.t.slice(0, start) },
        { t: '', html: `<a class="c5-term" href="/glossary#${g.id}">${esc(p.t.slice(start, end))}</a>` },
        { t: p.t.slice(end) })
      used.add(g.id)
      break
    }
  }
  return parts.map((p) => p.html ?? esc(p.t)).join('')
}
