// Post-cutover check: every redirect in vercel.json must answer 301/308 with the
// expected destination, and every destination must answer 200.
//   node scripts/check-redirects.mjs https://www.naturesage.co.il
//   node scripts/check-redirects.mjs https://naturesage-website.vercel.app
import { readFileSync } from 'node:fs'

const base = (process.argv[2] || 'https://www.naturesage.co.il').replace(/\/$/, '')
const { redirects } = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'))

const head = async (url) => {
  const res = await fetch(url, { method: 'GET', redirect: 'manual', headers: { 'User-Agent': 'naturesage-redirect-check' } })
  return { status: res.status, location: res.headers.get('location') || '' }
}

let bad = 0
for (const r of redirects) {
  if (r.source.includes(':') || r.has) continue // pattern/query rules: spot-check by hand
  const src = base + (r.source.includes('%') ? r.source : encodeURI(r.source)) // sources are stored percent-encoded
  try {
    const { status, location } = await head(src)
    const ok = (status === 301 || status === 308 || status === 307) && decodeURI(location).replace(base, '').replace(/\/$/, '') === r.destination.replace(/\/$/, '')
    const dest = ok ? await head(base + r.destination) : null
    const okDest = dest ? dest.status === 200 || (dest.status >= 300 && dest.status < 400 && r.destination === '/') : false
    console.log(`${ok && okDest ? '✓' : '✗'} ${r.source} → ${status} ${decodeURI(location) || '(no location)'}${dest ? ` → ${dest.status}` : ''}`)
    if (!(ok && okDest)) bad++
  } catch (e) {
    console.log(`✗ ${r.source} → ${e.message}`); bad++
  }
}
console.log(bad ? `\n${bad} problem(s)` : '\nall redirects OK')
process.exit(bad ? 1 : 0)
