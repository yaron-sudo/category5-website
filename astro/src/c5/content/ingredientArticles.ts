// Ingredient review articles ("מאמרים" — one review per raw material), generated from
// src/c5/content/articles-ingredients/<id>.md. Each file: frontmatter (title, latin,
// excerpt) + markdown body ("## " headings, paragraphs, [text](url) links; the links are
// turned into anchors by the article page, after escaping).
// Written for the general public about the RAW MATERIAL and its studies only — never
// about a specific product (legal). A fixed closing note is appended to every article.
import type { Article, ArticleBlock } from './articles'

const FILES = import.meta.glob<string>('./articles-ingredients/*.md', { query: '?raw', import: 'default', eager: true })

// Topic tags per review (list-page filter). 1–2 per article, from a fixed set.
const TAGS: Record<string, string[]> = {
  'aloe-acemannan': ['צמחים', 'עיכול'],
  'alpha-casozepine': ['שינה ורוגע'],
  'alpha-lipoic-acid': ['נוגדי חמצון'],
  'alpinia-galanga': ['צמחים', 'קוגניציה וזיכרון'],
  ashwagandha: ['צמחים', 'שינה ורוגע'],
  'bacillus-coagulans-snz1969': ['פרוביוטיקה', 'חורף וחסינות'],
  'bacillus-subtilis-de111': ['פרוביוטיקה', 'עיכול'],
  boswellia: ['צמחים', 'מפרקים ותנועה'],
  'calcium-vitamin-d': ['מינרלים', 'ויטמינים'],
  celadrin: ['מפרקים ותנועה'],
  'coenzyme-q10': ['לב וכלי דם', 'נוגדי חמצון'],
  'cognitaven-green-oat': ['צמחים', 'קוגניציה וזיכרון'],
  curcumin: ['צמחים', 'מפרקים ותנועה'],
  'd-mannose': ['בריאות האישה'],
  'damiana-liboost': ['צמחים'],
  'digestive-enzymes': ['עיכול'],
  'eggshell-membrane': ['מפרקים ותנועה'],
  elderberry: ['צמחים', 'חורף וחסינות'],
  'epimedium-icariin': ['צמחים'],
  ginger: ['צמחים', 'עיכול'],
  'ginseng-hrg80': ['צמחים', 'שינה ורוגע'],
  glutathione: ['נוגדי חמצון'],
  'iron-bisglycinate': ['מינרלים'],
  'lactobacillus-plantarum-lpldl': ['פרוביוטיקה', 'לב וכלי דם'],
  'lactobacillus-rhamnosus-ca15': ['פרוביוטיקה', 'בריאות האישה'],
  'lactobacillus-rhamnosus-crl1505': ['פרוביוטיקה', 'חורף וחסינות'],
  lactoferrin: ['חורף וחסינות'],
  'lutein-zeaxanthin': ['עיניים', 'קוגניציה וזיכרון'],
  'magnesium-acetyl-taurinate': ['מינרלים'],
  'magnesium-bisglycinate': ['מינרלים', 'שינה ורוגע'],
  'magnesium-chloride': ['מינרלים'],
  'magnesium-citrate': ['מינרלים', 'לב וכלי דם'],
  'magnesium-malate': ['מינרלים'],
  'magnesium-oxide': ['מינרלים'],
  'magnesium-taurate': ['מינרלים', 'לב וכלי דם'],
  'maqui-delphinol': ['צמחים', 'עיניים'],
  methylfolate: ['ויטמינים'],
  'n-acetylcysteine': ['נוגדי חמצון'],
  'natto-food': ['לב וכלי דם'],
  nattokinase: ['לב וכלי דם'],
  'neumentix-spearmint': ['צמחים', 'קוגניציה וזיכרון'],
  'nicotinamide-riboside': ['ויטמינים', 'אנרגיה וחילוף חומרים'],
  'olive-leaf-extract': ['צמחים', 'חורף וחסינות'],
  'olive-polyphenols': ['צמחים', 'נוגדי חמצון'],
  'pine-bark': ['צמחים', 'קוגניציה וזיכרון'],
  'prunus-domestica': ['צמחים', 'בריאות הגבר'],
  quercetin: ['נוגדי חמצון', 'חורף וחסינות'],
  'relaxplx-lemon-verbena': ['צמחים', 'שינה ורוגע'],
  'saffron-affron': ['צמחים', 'שינה ורוגע'],
  same: ['מפרקים ותנועה'],
  'selenium-selenomethionine': ['מינרלים'],
  'vitamin-b12': ['ויטמינים'],
  'vitamin-c': ['ויטמינים', 'חורף וחסינות'],
  zinc: ['מינרלים', 'חורף וחסינות'],
}

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
    image: meta.image,
    imageCredit: meta.credit,
    tags: TAGS[slug],
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
