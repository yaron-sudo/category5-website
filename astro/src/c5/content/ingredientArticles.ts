// Ingredient review articles ("מאמרים" — one review per raw material), generated from
// src/c5/content/articles-ingredients/<id>.md. Each file: frontmatter (title, latin,
// excerpt) + markdown body ("## " headings, paragraphs, [text](url) links; the links are
// turned into anchors by the article page, after escaping).
// Written for the general public about the RAW MATERIAL and its studies only — never
// about a specific product (legal). A fixed closing note is appended to every article.
import type { Article, ArticleBlock } from './articles'

const FILES = import.meta.glob<string>('./articles-ingredients/*.md', { query: '?raw', import: 'default', eager: true })

const CLOSING =
  'המאמר עוסק בחומר הגלם ובמחקרים שנערכו עליו, ואינו מתייחס למוצר מסוים. המידע מובא לידיעה בלבד, אינו המלצה רפואית ואינו תחליף להתייעצות עם רופא או רוקח. תוסף תזונה אינו תרופה.'


function parse(path: string, src: string): Article | null {
  const slug = path.split('/').pop()!.replace(/\.md$/, '')
  if (slug.startsWith('_')) return null
  const m = /^---\n([\s\S]*?)\n---\n?/.exec(src)
  const meta: Record<string, string> = {}
  for (const line of (m?.[1] ?? '').split('\n')) {
    const kv = /^(\w+):\s*(.+)$/.exec(line.trim())
    if (kv) meta[kv[1]] = kv[2].trim()
  }
  const body: ArticleBlock[] = []
  let words = 0
  for (const part of src.slice(m?.[0].length ?? 0).split(/\n{2,}/)) {
    let t = part.trim()
    if (!t) continue
    // A "## " heading and its paragraph may share one block (single newline between them).
    if (t.startsWith('## ')) {
      const nl = t.indexOf('\n')
      const h = (nl < 0 ? t : t.slice(0, nl)).slice(3).trim()
      body.push({ h2: h })
      words += h.split(/\s+/).length
      if (nl < 0) continue
      t = t.slice(nl + 1).trim()
      if (!t) continue
    }
    t = t.replace(/\s*\n\s*/g, ' ')
    words += t.split(/\s+/).length
    body.push({ p: t })
  }
  if (!meta.title || body.length === 0) return null
  body.push({ p: CLOSING })
  return {
    slug,
    title: meta.title,
    latin: meta.latin,
    excerpt: meta.excerpt ?? '',
    tag: 'סקירת רכיב',
    minutes: Math.max(1, Math.round(words / 180)),
    noImage: true,
    body,
  }
}

export const INGREDIENT_ARTICLES: Article[] = Object.entries(FILES)
  .map(([p, src]) => parse(p, src))
  .filter((a): a is Article => !!a)
  .sort((a, b) => a.title.localeCompare(b.title, 'he'))
