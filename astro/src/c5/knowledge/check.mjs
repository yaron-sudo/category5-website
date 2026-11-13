#!/usr/bin/env node
// Knowledge-base check: every product shown on the site must have a valid
// knowledge file (products/<slug>.md). Prints what is missing or malformed.
//
//   cd astro && node --experimental-strip-types src/c5/knowledge/check.mjs
//
// Exit code 1 when a shown product has no file or a file is malformed; warnings
// (drafts, orphan files, empty key sections) do not fail. `--strict` also fails on warnings.
// The shown-product list is rebuilt the same way as c5/content/catalog.ts
// (products.ts + old-site dataset − replaced − hidden), without the Astro runtime.
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const astro = resolve(here, '../../..')
const { PRODUCTS } = await import(resolve(astro, 'src/c5/content/products.ts'))
const { PRODUCT_OVERRIDES } = await import(resolve(astro, 'src/c5/content/overrides.ts'))
const { parseKnowledge, SECTIONS, REQUIRED_META, EMPTY } = await import(resolve(here, 'parse.ts'))

const dataset = JSON.parse(readFileSync(resolve(astro, 'content/dataset.json'), 'utf8'))
const old = dataset.filter((d) => d._type === 'product' && d.slug?.current)
const manual = new Set(PRODUCTS.map((p) => p.slug))
const replaced = new Set(PRODUCTS.map((p) => p.source).filter(Boolean))
const all = [
  ...PRODUCTS.map((p) => ({ slug: p.slug, title: p.title })),
  ...old.filter((o) => !manual.has(o.slug.current) && !replaced.has(o.slug.current)).map((o) => ({ slug: o.slug.current, title: o.name })),
]
const shown = all.filter((p) => !PRODUCT_OVERRIDES[p.slug]?.hidden)
const hidden = new Set(all.filter((p) => PRODUCT_OVERRIDES[p.slug]?.hidden).map((p) => p.slug))

const dir = resolve(here, 'products')
const files = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, '')) : []
const errors = [], warnings = []
const KEY_SECTIONS = ['מה המוצר', 'רכיבים וכמויות', 'הוראות שימוש']

for (const p of shown) if (!files.includes(p.slug)) errors.push(`חסר קובץ ידע: products/${p.slug}.md  (${p.title})`)

let drafts = 0
for (const slug of files) {
  const k = parseKnowledge(readFileSync(resolve(dir, `${slug}.md`), 'utf8'))
  const at = `products/${slug}.md`
  for (const key of REQUIRED_META) if (!k.meta[key]) errors.push(`${at}: חסר שדה "${key}" בכותרת`)
  if (k.meta.slug && k.meta.slug !== slug) errors.push(`${at}: slug בכותרת ("${k.meta.slug}") שונה משם הקובץ`)
  if (k.meta.url && k.meta.url !== `/products/${slug}`) errors.push(`${at}: url צריך להיות /products/${slug}`)
  const titles = k.sections.map((s) => s.title)
  for (const s of SECTIONS) if (!titles.includes(s)) errors.push(`${at}: חסר הפרק "## ${s}"`)
  for (const t of titles) if (!SECTIONS.includes(t)) errors.push(`${at}: פרק לא מוכר "## ${t}"`)
  for (const s of k.sections) if (!s.body) errors.push(`${at}: הפרק "## ${s.title}" ריק (כתבו "${EMPTY}")`)
  if (/1-700-700-545/.test(JSON.stringify(k))) errors.push(`${at}: מספר טלפון שאסור להציג`)
  const emptyKeys = KEY_SECTIONS.filter((t) => k.sections.find((s) => s.title === t)?.body === EMPTY)
  if (emptyKeys.length) warnings.push(`${at}: אין מידע בפרקים: ${emptyKeys.join(', ')}`)
  if (k.meta.status !== 'verified') drafts++
  if (!shown.some((p) => p.slug === slug)) warnings.push(`${at}: ${hidden.has(slug) ? 'המוצר מוסתר באתר (overrides.ts), ולכן לא נשלח לצ׳אט' : 'אין מוצר כזה בקטלוג'}`)
}

console.log(`בסיס הידע: ${shown.length} מוצרים מוצגים · ${files.length} קובצי ידע · ${drafts} בסטטוס draft (טרם אומתו מול התווית הפיזית)`)
for (const e of errors) console.log('  ✗ ' + e)
for (const w of warnings) console.log('  ! ' + w)
if (!errors.length) console.log('  ✓ לכל מוצר מוצג יש קובץ ידע תקין')
process.exit(errors.length || (process.argv.includes('--strict') && warnings.length) ? 1 : 0)
