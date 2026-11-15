// Category 5 site search — engine (plain JS: bundled into the search page and run by
// scripts/search-test.mjs under node). Hebrew-aware: niqqud/punctuation ignored, final
// letters folded, one- or two-letter prefixes (ו/ה/ב/ל/מ/ש/כ…) and plural/gender endings
// stripped into light stems; everyday phrases expand through the SYNONYMS groups; typos are
// tolerated by edit distance; "did you mean" and autocomplete come from the index vocabulary.

const FINALS = { 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' }
const PREFIXES = ['וכש', 'וש', 'וה', 'וב', 'ול', 'ומ', 'וכ', 'כש', 'שה', 'שב', 'של', 'שמ', 'מה', 'לכ', 'ו', 'ה', 'ב', 'ל', 'מ', 'ש', 'כ']
const SUFFIXES = ['יות', 'ויות', 'יים', 'ים', 'ות', 'ית', 'ה', 'ת', 'י']

// Function words: never matched on their own, never expanded, never "corrected".
const STOP = new Set(['לי', 'לך', 'לו', 'לה', 'לנו', 'אין', 'יש', 'את', 'של', 'עם', 'על', 'לא', 'אני', 'מה', 'איך', 'כל', 'גם', 'או', 'קשה', 'קצת', 'מאוד', 'מאד', 'הרבה', 'רוצה', 'צריך', 'צריכה', 'מחפש', 'מחפשת', 'משהו', 'בשביל', 'נגד', 'עבור', 'the', 'for', 'and', 'of', 'to', 'a'])
export const isStop = (t) => STOP.has(t)

/** Final letters back for display (the index folds them). */
export function unfold(s) {
  const F = { 'כ': 'ך', 'מ': 'ם', 'נ': 'ן', 'פ': 'ף', 'צ': 'ץ' }
  return String(s).replace(/([כמנפצ])(?=\s|$)/g, (c) => F[c])
}

export function normalize(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[֑-ׇ]/g, '')          // niqqud
    .replace(/[ךםןףץ]/g, (c) => FINALS[c])
    .replace(/["'׳״`]/g, '')                  // quotes inside words (ג'ינג'ר → גינגר)
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Variants of one word: the word, prefix-stripped forms and light stems (≥ 3 letters). */
export function variants(word) {
  const out = new Set([word])
  const heb = /^[א-ת]+$/.test(word)
  const bases = [word]
  if (heb) for (const p of PREFIXES) if (word.startsWith(p) && word.length - p.length >= 3) bases.push(word.slice(p.length))
  for (const b of bases) {
    out.add(b)
    if (heb) for (const sfx of SUFFIXES) if (b.endsWith(sfx) && b.length - sfx.length >= 3) out.add(b.slice(0, -sfx.length))
    if (!heb && b.length > 4 && b.endsWith('s')) out.add(b.slice(0, -1))
  }
  return [...out]
}

export function tokens(s) { return normalize(s).split(' ').filter((t) => t && !STOP.has(t)) }

// Damerau-Levenshtein (optimal string alignment), capped.
export function distance(a, b, max = 2) {
  if (a === b) return 0
  if (Math.abs(a.length - b.length) > max) return max + 1
  const d = []
  for (let i = 0; i <= a.length; i++) { d[i] = [i] }
  for (let j = 0; j <= b.length; j++) d[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    let rowMin = Infinity
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      let v = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost)
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, d[i - 2][j - 2] + 1)
      d[i][j] = v
      rowMin = Math.min(rowMin, v)
    }
    if (rowMin > max) return max + 1
  }
  return d[a.length][b.length]
}

/**
 * Build the runtime index from the serialisable document list:
 *   doc = { id, kind: 'product'|'article', title, href, image?, meta?, fields: { name, keywords, ingredients, text, body } }
 */
export function buildIndex(docs, synonyms) {
  const WEIGHTS = { name: 10, keywords: 8, ingredients: 6, text: 4, body: 1 }
  const vocab = new Map() // token → frequency (for suggestions)
  const indexed = docs.map((doc) => {
    const terms = new Map() // variant → best weight
    const add = (word, w) => { for (const v of variants(word)) if ((terms.get(v) || 0) < w) terms.set(v, w) }
    for (const [field, w] of Object.entries(WEIGHTS)) {
      for (const tk of tokens(doc.fields[field] || '')) { add(tk, w); if (field !== 'body') vocab.set(tk, (vocab.get(tk) || 0) + 1) }
    }
    const phrases = normalize(`${doc.title} ${doc.fields.name || ''} ${doc.fields.keywords || ''}`)
    return { doc, terms, phrases }
  })
  // synonym groups → each word maps to its group's full word list
  const groups = []
  for (const g of synonyms || []) {
    const words = new Set()
    for (const w of [g.name, ...g.words]) for (const tk of tokens(w)) words.add(tk)
    const phraseList = [g.name, ...g.words].map(normalize)
    groups.push({ words: [...words], phrases: phraseList })
    for (const ph of phraseList) for (const tk of ph.split(' ')) vocab.set(tk, (vocab.get(tk) || 0) + 1)
  }
  const suggestionsPool = [...new Set(docs.map((d) => normalize(d.title)).concat(groups.flatMap((g) => g.phrases)))]
  return { indexed, vocab, groups, suggestionsPool }
}

/** Expand the query: original tokens + tokens of every synonym group it touches. */
export function expand(index, q) {
  const nq = normalize(q)
  const base = nq.split(' ').filter((t) => t && !STOP.has(t))
  const extra = new Set()
  for (const g of index.groups) {
    const hit = g.phrases.some((ph) => ph && (nq.includes(ph) || (ph.includes(nq) && nq.length >= 3))) ||
      base.some((t) => t.length >= 3 && g.words.some((w) => !STOP.has(w) && w.length >= 3 && (variants(t).includes(w) || variants(w).includes(t))))
    if (hit) for (const w of g.words) extra.add(w)
  }
  return { base, extra: [...extra].filter((w) => !base.includes(w)) }
}

function matchTerm(terms, t, allowFuzzy) {
  // exact (any variant), then prefix, then fuzzy
  let best = 0
  for (const v of variants(t)) { const w = terms.get(v); if (w && w > best) best = w }
  if (best) return { score: best, how: 'exact' }
  if (t.length >= 3) {
    for (const [k, w] of terms) if (k.startsWith(t) || (t.length >= 4 && t.startsWith(k) && k.length >= 4)) best = Math.max(best, w * 0.7)
    if (best) return { score: best, how: 'prefix' }
  }
  if (allowFuzzy && t.length >= 4) {
    const max = t.length >= 7 ? 2 : 1
    for (const [k, w] of terms) if (Math.abs(k.length - t.length) <= max && distance(t, k, max) <= max) best = Math.max(best, w * 0.5)
    if (best) return { score: best, how: 'fuzzy' }
  }
  return { score: 0, how: 'none' }
}

/** Rank the index for a query. Returns { results: [{doc, score}], unmatched: [tokens], expanded } */
export function search(index, q, { kind } = {}) {
  const { base, extra } = expand(index, q)
  if (!base.length) return { results: [], unmatched: [], expanded: extra }
  const nq = normalize(q)
  const results = []
  const matchedAnywhere = new Set()
  for (const it of index.indexed) {
    if (kind && it.doc.kind !== kind) continue
    let score = 0, hits = 0
    for (const t of base) {
      const m = matchTerm(it.terms, t, true)
      if (m.score) { score += m.score; hits++; if (m.how !== 'fuzzy') matchedAnywhere.add(t) }
    }
    for (const t of extra) { const m = matchTerm(it.terms, t, false); if (m.score) score += m.score * 0.6 }
    if (nq.length >= 3 && it.phrases.includes(nq)) score += 12          // whole query as a phrase
    if (hits === base.length && base.length > 1) score *= 1.3            // every word matched
    if (score > 0) results.push({ doc: it.doc, score, hits })
  }
  results.sort((a, b) => b.score - a.score || a.doc.title.localeCompare(b.doc.title, 'he'))
  // keep the strong tail only: at least a third of the top score, or every-word matches
  const top = results[0]?.score || 0
  const kept = results.filter((r) => r.hits === base.length || r.score >= top / 3)
  return { results: kept, unmatched: base.filter((t) => !matchedAnywhere.has(t)), expanded: extra }
}

/** "Did you mean": closest vocabulary word for each unmatched token. */
export function didYouMean(index, q, unmatched) {
  if (!unmatched.length) return null
  let out = normalize(q), changed = false
  for (const t of unmatched) {
    if (t.length < 3) continue
    let best = null, bestD = t.length >= 6 ? 2 : 1, bestF = 0
    for (const [w, f] of index.vocab) {
      if (Math.abs(w.length - t.length) > bestD) continue
      const d = distance(t, w, bestD)
      if (d <= bestD && (d < bestD || f > bestF) && w !== t) { best = w; bestD = d; bestF = f }
    }
    if (best) { out = out.replace(new RegExp(`(^| )${t}( |$)`), `$1${best}$2`); changed = true }
  }
  return changed ? out : null
}

/** Autocomplete: titles and known phrases that start with / contain the typed text. */
export function suggest(index, q, limit = 6) {
  const nq = normalize(q)
  if (nq.length < 2) return []
  const last = nq.split(' ').pop()
  const starts = [], contains = []
  for (const ph of index.suggestionsPool) {
    if (ph === nq) continue
    if (ph.startsWith(nq)) starts.push(ph)
    else if (ph.split(' ').some((w) => w.startsWith(last)) || ph.includes(nq)) contains.push(ph)
  }
  return [...starts, ...contains].slice(0, limit)
}
