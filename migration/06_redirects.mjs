// 06_redirects.mjs — old WordPress URLs → new routes, written into
// astro/vercel.json (`redirects`, percent-encoded sources: raw Hebrew never
// matches on Vercel) and reused by astro/src/pages/[...path].astro as the
// server-side fallback (decoded match, any case / trailing slash).
//
// Sources: migration/out/inventory.json (every WP page) + slugs.json.
// Every row of the inventory must map somewhere, or the script fails.
//   node migration/06_redirects.mjs
import { readFileSync, writeFileSync } from 'node:fs'

const inv = JSON.parse(readFileSync('migration/out/inventory.json', 'utf8'))
const slugs = JSON.parse(readFileSync('migration/slugs.json', 'utf8'))
const vercelPath = 'astro/vercel.json'
const vercel = JSON.parse(readFileSync(vercelPath, 'utf8'))

const FIXED = {
  4920: '/', 2676: '/contact', 4686: '/stores', 8561: '/faq', 9250: '/privacy', 9259: '/terms',
  7371: '/catalog', 3388: '/', 3462: '/', 8064: '/',
}
const map = new Map() // decoded source path (no trailing slash) → destination
const add = (from, to) => {
  const k = from.replace(/\/+$/, '') || '/'
  if (k === '/' || k === to) return
  map.set(k, to)
}

for (const r of inv) {
  let to = FIXED[r.id]
  if (!to && r.kind === 'category') to = `/category/${slugs.categories[r.id].slug}`
  if (!to && r.kind === 'product') to = `/products/${slugs.products[r.id]}`
  if (!to) throw new Error(`no destination for ${r.id} ${r.path}`)
  add(r.path, to)
}
// Short paths the old site's own footer/menus linked to (WP resolved them by slug).
for (const [id, c] of Object.entries(slugs.categories)) {
  const row = inv.find((r) => r.id === Number(id))
  const last = row.path.replace(/\/+$/, '').split('/').pop()
  add(`/${last}`, `/category/${c.slug}`)
}
add('/צור-קשר', '/contact')
add('/רשימת-חנויות', '/stores')
add('/עמוד-הבית', '/')
add('/2022/09/22/hello-world', '/')
add('/sitemap.xml', '/sitemap-index.xml')
add('/sitemap_index.xml', '/sitemap-index.xml')

// Percent-encode each segment the way browsers send it (uppercase hex).
const enc = (p) => p.split('/').map((s) => encodeURIComponent(s)).join('/')
const redirects = [...map.entries()]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([from, to]) => ({ source: /^[\x20-\x7e]*$/.test(from) ? from : enc(from), destination: to, permanent: true }))

// WordPress leftovers: feeds, author/category archives, search, wp-admin.
redirects.push(
  { source: '/feed/:rest*', destination: '/', permanent: true },
  { source: '/category/uncategorized/:rest*', destination: '/', permanent: true },
  { source: '/author/:rest*', destination: '/', permanent: true },
  { source: '/wp-admin/:rest*', destination: '/', permanent: false },
  { source: '/wp-login.php', destination: '/', permanent: false },
  { source: '/', has: [{ type: 'query', key: 's' }], destination: '/faq', permanent: false },
  { source: '/', has: [{ type: 'query', key: 'p' }], destination: '/', permanent: true },
  { source: '/', has: [{ type: 'query', key: 'page_id' }], destination: '/', permanent: true },
)

vercel.redirects = redirects
writeFileSync(vercelPath, JSON.stringify(vercel, null, 2) + '\n')
console.log(`✓ ${redirects.length} redirects (${map.size} exact) → ${vercelPath}`)
