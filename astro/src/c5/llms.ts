// llms.txt / llms-full.txt (llmstxt.org): a Markdown map of the site for AI answer engines
// and assistants. Built from the same content as the pages, so it never drifts.
// `full` adds the product texts, the articles, the series / need intros and the glossary.
import { SERIES, NEEDS, GLOSSARY, CONTACT, seriesHref, needHref } from '@/c5/data'
import { getCatalog, productsOfSeries } from '@/c5/content/catalog'
import { productHref } from '@/c5/content/products'
import { PRODUCT_SUMMARIES } from '@/c5/content/summaries'
import { SERIES_CONTENT } from '@/c5/content/series'
import { NEED_CONTENT } from '@/c5/content/needs'
import { ARTICLES } from '@/c5/content/articles'
import { ABOUT } from '@/c5/content/about'
import { DISCLAIMER, BRAND_NAME, BRAND_NAME_EN } from '@/lib/brand'
import { fetchQ } from '@/lib/sanity'
import { SITE_URL } from '@/c5/seo'

const abs = (href: string) => `${SITE_URL}${href}`
const line = (s: string) => s.replace(/\s+/g, ' ').trim()

export async function buildLlmsTxt(full = false): Promise<string> {
  const catalog = await getCatalog()
  const stores = await fetchQ<number>('count(*[_type == "store"])').catch(() => 0)
  const out: string[] = []
  const h = (lvl: number, s: string) => out.push('', `${'#'.repeat(lvl)} ${s}`, '')
  const li = (s: string) => out.push(`- ${s}`)

  out.push(`# ${BRAND_NAME} | ${BRAND_NAME_EN}`, '')
  out.push(`> ${ABOUT[0]}`, '')
  out.push(`${BRAND_NAME_EN} (קטגוריה 5 תוספים אתיים) is an Israeli dietary-supplement company. Site language: Hebrew (RTL). Official site: ${SITE_URL}/ . Products are sold through pharmacies and health stores in Israel (${stores} points of sale), not on the site itself.`, '')
  for (const p of ABOUT.slice(1)) out.push(p, '')
  out.push(`הערה משפטית: ${DISCLAIMER}`)

  h(2, 'סדרות המוצרים')
  for (const s of SERIES) {
    const intro = SERIES_CONTENT[s.slug]?.intro?.[0]
    li(`[${s.name}](${abs(seriesHref(s))})${intro ? `: ${line(intro)}` : ''}`)
  }

  h(2, 'מוצרים')
  for (const s of SERIES) {
    out.push('', `### ${s.name}`, '')
    for (const p of await productsOfSeries(s.slug)) {
      const name = p.fullTitle || p.title
      const summary = PRODUCT_SUMMARIES[p.slug]
      li(`[${name}](${abs(productHref(p))})${summary ? `: ${line(summary)}` : ''}`)
      if (full) {
        for (const t of p.intro ?? []) out.push(`  ${line(t)}`)
        if (p.contains) out.push(`  ${line(p.contains)}`)
        if (p.benefits?.length) out.push(`  יתרונות: ${p.benefits.map(line).join('; ')}`)
        if (p.usage?.length) out.push(`  אופן השימוש: ${p.usage.map(line).join(' ')}`)
      }
    }
  }

  h(2, 'מה הצורך (תחומים)')
  for (const n of NEEDS) {
    const c = NEED_CONTENT[n.slug]
    const prods = (c?.products ?? []).map((slug) => catalog.find((p) => p.slug === slug)).filter(Boolean) as typeof catalog
    li(`[${n.label}](${abs(needHref(n))})${c?.intro?.[0] ? `: ${line(c.intro[0])}` : ''}${prods.length ? ` מוצרים: ${prods.map((p) => p.title).join(', ')}.` : ''}`)
    if (full) for (const t of (c?.intro ?? []).slice(1)) out.push(`  ${line(t)}`)
  }

  h(2, 'מאמרים מקצועיים (סקירות רכיבים)')
  out.push(`[כל המאמרים](${abs('/articles')})`, '')
  for (const a of ARTICLES) {
    li(`[${a.title}${a.latin ? ` (${a.latin})` : ''}](${abs(`/articles/${a.slug}`)}): ${line(a.excerpt)}`)
    if (full) for (const b of a.body) { if ('h2' in b) out.push(`  **${line(b.h2)}**`); else if ('p' in b) out.push(`  ${line(b.p)}`) }
  }

  h(2, 'עולם המושגים')
  for (const g of GLOSSARY) li(`[${g.term}](${abs(`/glossary#${g.id}`)})${full ? `: ${line(g.text)}` : ''}`)

  h(2, 'עמודים נוספים')
  li(`[איפה קונים: מפת חנויות ובתי מרקחת](${abs('/stores')}) (${stores} נקודות מכירה בישראל)`)
  li(`[קהילה: אינסטגרם](${abs('/community')})`)
  li(`[צור קשר](${abs('/contact')}): דוא"ל ${CONTACT.email}, וואטסאפ ${CONTACT.whatsapp}`)
  li(`[אינסטגרם](${CONTACT.instagram}), [פייסבוק](${CONTACT.facebook})`)
  li(`[תנאי שימוש](${abs('/legal/terms')}), [מדיניות פרטיות](${abs('/legal/privacy')}), [הצהרת נגישות](${abs('/legal/accessibility')}), [מדיניות עוגיות](${abs('/legal/cookies')})`)

  h(2, 'Optional')
  li(`[llms-full.txt](${abs('/llms-full.txt')}): the same map with the full product, article and glossary texts`)
  li(`[Sitemap](${abs('/sitemap-index.xml')})`)
  return out.join('\n').replace(/\n{3,}/g, '\n\n') + '\n'
}
