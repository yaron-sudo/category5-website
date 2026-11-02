// Geocode the client's store list (sanity/assets/stores/stores-export.csv,
// made from the Storepoint "Stores_Locations.xlsx" export) and write
// sanity/assets/stores/stores-geocoded.json — the seed source for seed-stores.mjs.
//
// Resolution order per address:
//   1. geocode-cache.json (exact hits, incl. the cache inherited from the
//      sister site — same distributor, many identical branches)
//   2. OpenStreetMap Nominatim (if reachable; 1 request/second, cached)
//   3. city centroid (mean of cached hits in the same city, else
//      city-centroids.json) → precision "city", so the store still shows up
//      in its city and can be refined later by re-running this script.
//
//   node geocode-stores.mjs [assets/stores/stores-export.csv]
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIR = path.join(__dirname, 'assets', 'stores')
const OUT = path.join(DIR, 'stores-geocoded.json')
const CACHE = path.join(DIR, 'geocode-cache.json')
const CENTROIDS = JSON.parse(fs.readFileSync(path.join(DIR, 'city-centroids.json'), 'utf8'))
const csvPath = process.argv[2] || path.join(DIR, 'stores-export.csv')

function parseCsv(t) {
  const rows = []
  let row = [], f = '', q = false
  for (let i = 0; i < t.length; i++) {
    const c = t[i]
    if (q) {
      if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++ } else q = false } else f += c
    } else if (c === '"') q = true
    else if (c === ',') { row.push(f); f = '' }
    else if (c === '\n') { row.push(f); rows.push(row); row = []; f = '' }
    else if (c !== '\r') f += c
  }
  if (f || row.length) { row.push(f); rows.push(row) }
  const head = rows[0]
  return rows.slice(1).filter((r) => r.length > 1).map((r) => Object.fromEntries(head.map((h, i) => [h, (r[i] ?? '').trim()])))
}

const rows = parseCsv(fs.readFileSync(csvPath, 'utf8').replace(/^﻿/, ''))
const cache = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, 'utf8')) : {}

// City centroids from cached exact hits ("street, city, ישראל").
const byCity = {}
for (const [k, v] of Object.entries(cache)) {
  if (!v?.lat) continue
  const parts = k.split(',').map((s) => s.trim())
  const city = parts.length >= 2 ? parts[parts.length - 2] : ''
  ;(byCity[city] ||= []).push([v.lat, v.lng])
}
const mean = (pts) => [pts.reduce((a, p) => a + p[0], 0) / pts.length, pts.reduce((a, p) => a + p[1], 0) / pts.length]

let nominatimOk = true
async function nominatim(address) {
  if (!nominatimOk) return null
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=il&limit=1&accept-language=he&q=${encodeURIComponent(address)}`
    const res = await fetch(url, { headers: { 'user-agent': 'category5-site-migration/1.0 (info@ethical-supplements.com)' } })
    if (!res.ok) throw new Error(String(res.status))
    const j = await res.json()
    await new Promise((r) => setTimeout(r, 1100))
    if (!j[0]) return { status: 'ZERO_RESULTS' }
    return { lat: +j[0].lat, lng: +j[0].lon, precision: j[0].addresstype === 'building' || j[0].addresstype === 'place' ? 'ROOFTOP' : 'APPROXIMATE', formatted: j[0].display_name, source: 'nominatim' }
  } catch (e) {
    console.warn(`Nominatim unreachable (${e.message}) — falling back to city centroids`)
    nominatimOk = false
    return null
  }
}

const out = []
const stats = { cache: 0, nominatim: 0, city: 0, none: 0 }
for (const r of rows) {
  let g = cache[r.address]?.lat ? cache[r.address] : null
  if (g) stats.cache++
  else {
    const n = cache[r.address]?.status ? null : await nominatim(r.address)
    if (n) cache[r.address] = n
    if (n?.lat) { g = n; stats.nominatim++ }
  }
  if (!g) {
    const pts = byCity[r.city]
    const c = pts?.length ? mean(pts) : CENTROIDS[r.city] || CENTROIDS[Object.keys(CENTROIDS).find((k) => r.city.includes(k)) ?? '']
    if (c) { g = { lat: c[0], lng: c[1], precision: 'city' }; stats.city++ } else { stats.none++; console.warn('! no location:', r.name, '|', r.address) }
  }
  out.push({ id: r.id, name: r.name, address: r.address, city: r.city, phone: r.phone, website: r.website, tags: r.tags, geo: g || { status: 'NONE' } })
}
fs.writeFileSync(CACHE, JSON.stringify(cache, null, 1))
fs.writeFileSync(OUT, JSON.stringify(out, null, 1))
console.log(`✓ ${out.length} stores → ${path.relative(process.cwd(), OUT)}`, stats)
