// Data for the live dashboard (/admin). "Visit" = one visitor-day (the visitor id rotates daily, no
// cookies), so a person returning the same day is one visit. Time on site = active time summed over
// the pages of the visit. Comparisons use windows of equal length: today so far against yesterday up
// to the same time, the last 7 days against the 7 before, the last 30 against the 30 before.
import { q } from './db'
import { heCity, heCountry, mergeBy } from './geo'

const n = (v: unknown) => Number(v ?? 0)
const sec = (ms: unknown) => (ms == null ? null : Math.round(n(ms) / 1000))
const IL = `'Asia/Jerusalem'`
const TS0 = `(date_trunc('day', now() AT TIME ZONE ${IL}) AT TIME ZONE ${IL})` // start of today (Israel)
const TODAY = `(now() AT TIME ZONE ${IL})::date`

export interface Period { visits: number; pv: number; visitSec: number | null; pageSec: number | null; scroll: number | null; singleShare: number }

async function period(win: string): Promise<Period> {
  const [r] = await q(`
    WITH e AS (SELECT day, vid, dwell_ms, scroll FROM events WHERE type = 'pv' AND (${win})),
         v AS (SELECT day, vid, count(*) AS pv, sum(COALESCE(dwell_ms, 0)) AS d FROM e GROUP BY day, vid)
    SELECT (SELECT count(*) FROM v) AS visits, (SELECT COALESCE(sum(pv), 0) FROM v) AS pv,
           (SELECT avg(NULLIF(d, 0)) FROM v) AS vdwell, (SELECT count(*) FROM v WHERE pv = 1) AS single,
           (SELECT avg(NULLIF(dwell_ms, 0)) FROM e) AS pdwell, (SELECT avg(NULLIF(scroll, 0)) FROM e) AS scroll`)
  const visits = n(r.visits)
  return { visits, pv: n(r.pv), visitSec: sec(r.vdwell), pageSec: sec(r.pdwell), scroll: r.scroll == null ? null : Math.round(n(r.scroll)), singleShare: visits ? Math.round((n(r.single) / visits) * 100) : 0 }
}

export async function live() {
  const W = `type = 'pv' AND COALESCE(last_seen, at) > now() - interval '5 minutes'`
  const [c] = await q(`SELECT count(DISTINCT vid) AS n FROM events WHERE ${W}`)
  const pages = await q(`SELECT path, count(DISTINCT vid) AS n FROM events WHERE ${W} GROUP BY path ORDER BY n DESC, path LIMIT 6`)
  const [t] = await q(`SELECT count(DISTINCT vid) AS visits, count(*) AS pv FROM events WHERE type = 'pv' AND at >= ${TS0}`)
  // One row per live visitor (anonymous): the page they are on now and how they arrived today
  // (the first visit of the day that did not come from inside the site).
  const who = await q(`
    WITH cur AS (
      SELECT DISTINCT ON (vid) vid, day, path, city, country, device, COALESCE(last_seen, at) AS seen
      FROM events WHERE ${W} ORDER BY vid, COALESCE(last_seen, at) DESC)
    SELECT c.path, c.city, c.country, c.device, c.seen, s.source, s.ref_host, s.utm_source, s.utm_campaign
    FROM cur c LEFT JOIN LATERAL (
      SELECT source, ref_host, utm_source, utm_campaign FROM events
      WHERE type = 'pv' AND vid = c.vid AND day = c.day AND source <> 'internal' ORDER BY at LIMIT 1) s ON true
    ORDER BY c.seen DESC LIMIT 200`)
  const visitors = who.map((r) => ({
    path: r.path as string, city: heCity(r.city as string | null), country: heCountry(r.country as string | null), device: (r.device as string | null) ?? '',
    source: (r.source as string | null) ?? 'direct', ref: (r.ref_host as string | null) ?? '', campaign: ((r.utm_campaign ?? r.utm_source) as string | null) ?? '',
    ago: Math.max(0, Math.round((Date.now() - new Date(r.seen as string).getTime()) / 1000)),
  }))
  const bySource = new Map<string, number>()
  for (const v of visitors) bySource.set(v.source, (bySource.get(v.source) ?? 0) + 1)
  return {
    now: n(c.n), pages: pages.map((r) => ({ path: r.path as string, n: n(r.n) })), todayVisits: n(t.visits), todayPv: n(t.pv),
    visitors: visitors.slice(0, 30), sources: [...bySource].sort((a, b) => b[1] - a[1]).map(([source, count]) => ({ source, n: count })),
  }
}

type Dim = { k: string; n: number; prev?: number }
async function dim(expr: string, days: number, opts: { where?: string; limit?: number; prev?: boolean } = {}): Promise<Dim[]> {
  const where = opts.where ? ` AND ${opts.where}` : ''
  const lim = opts.limit ?? 10
  const cur = await q(`SELECT ${expr} AS k, count(DISTINCT (day, vid)) AS n FROM events WHERE type = 'pv' AND ${expr} IS NOT NULL${where} AND day >= ${TODAY} - ($1::int - 1) GROUP BY 1 ORDER BY n DESC, k LIMIT ${lim}`, [days])
  const out: Dim[] = cur.map((r) => ({ k: String(r.k), n: n(r.n) }))
  if (opts.prev && out.length) {
    const prev = await q(`SELECT ${expr} AS k, count(DISTINCT (day, vid)) AS n FROM events WHERE type = 'pv' AND ${expr} IS NOT NULL${where} AND day >= ${TODAY} - (2 * $1::int - 1) AND day < ${TODAY} - ($1::int - 1) GROUP BY 1`, [days])
    const m = new Map(prev.map((r) => [String(r.k), n(r.n)]))
    for (const d of out) d.prev = m.get(d.k) ?? 0
  }
  return out
}

export async function dashboard(days: number) {
  const [today, yesterday, w7, p7, w30, p30, range, liveNow] = await Promise.all([
    period(`at >= ${TS0} AND at < now()`),
    period(`at >= ${TS0} - interval '1 day' AND at < now() - interval '1 day'`),
    period(`at >= now() - interval '7 days'`),
    period(`at >= now() - interval '14 days' AND at < now() - interval '7 days'`),
    period(`at >= now() - interval '30 days'`),
    period(`at >= now() - interval '60 days' AND at < now() - interval '30 days'`),
    period(`day >= ${TODAY} - ${days - 1}`),
    live(),
  ])

  // Daily series for the chart: the selected range and the equally long range before it.
  const daily = await q(`SELECT day::text AS day, count(DISTINCT vid) AS visits, count(*) AS pv FROM events WHERE type = 'pv' AND day >= ${TODAY} - ${2 * days - 1} GROUP BY day`)
  const byDay = new Map(daily.map((r) => [r.day as string, { visits: n(r.visits), pv: n(r.pv) }]))
  const todayStr = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Jerusalem' })
  const dayStr = (back: number) => { const d = new Date(`${todayStr}T12:00:00Z`); d.setUTCDate(d.getUTCDate() - back); return d.toISOString().slice(0, 10) }
  const trend = Array.from({ length: days }, (_, i) => {
    const cur = dayStr(days - 1 - i), prev = dayStr(2 * days - 1 - i)
    return { day: cur, visits: byDay.get(cur)?.visits ?? 0, pv: byDay.get(cur)?.pv ?? 0, prevDay: prev, prevVisits: byDay.get(prev)?.visits ?? 0, prevPv: byDay.get(prev)?.pv ?? 0 }
  })

  const [sources, referrers, countries, cities, devices, browsers, systems, langs, landing] = await Promise.all([
    dim('source', days, { where: `source <> 'internal'`, limit: 12, prev: true }),
    dim('ref_host', days, { limit: 12, prev: true }),
    dim('country', days, { limit: 10 }),
    dim('city', days, { limit: 12 }),
    dim('device', days, { limit: 4 }),
    dim('browser', days, { limit: 6 }),
    dim('os', days, { limit: 6 }),
    dim('lang', days, { limit: 6 }),
    dim('path', days, { where: `source <> 'internal'`, limit: 10 }),
  ])
  const geo = await q(`SELECT city, country, round(avg(lat)::numeric, 3)::float AS lat, round(avg(lng)::numeric, 3)::float AS lng, count(DISTINCT (day, vid)) AS n
    FROM events WHERE type = 'pv' AND city IS NOT NULL AND lat IS NOT NULL AND lng IS NOT NULL AND day >= ${TODAY} - ($1::int - 1)
    GROUP BY city, country ORDER BY n DESC LIMIT 300`, [days])
  const campaigns = await q(`SELECT COALESCE(utm_source,'(gclid / ללא)') AS s, COALESCE(utm_medium,'—') AS m, COALESCE(utm_campaign,'—') AS c, count(*) AS n
    FROM events WHERE type = 'pv' AND source = 'campaign' AND day >= ${TODAY} - ($1::int - 1) GROUP BY 1, 2, 3 ORDER BY n DESC LIMIT 10`, [days])
  const pages = await q(`SELECT path, count(*) AS pv, count(DISTINCT (day, vid)) AS visits, avg(NULLIF(dwell_ms, 0)) AS dwell, avg(NULLIF(scroll, 0)) AS scroll
    FROM events WHERE type = 'pv' AND day >= ${TODAY} - ($1::int - 1) GROUP BY path ORDER BY pv DESC LIMIT 15`, [days])
  const hours = await q(`SELECT extract(hour FROM at AT TIME ZONE ${IL})::int AS h, count(DISTINCT (day, vid)) AS n FROM events WHERE type = 'pv' AND day >= ${TODAY} - ($1::int - 1) GROUP BY 1`, [days])
  const dows = await q(`SELECT extract(dow FROM day)::int AS d, count(DISTINCT (day, vid)) AS n FROM events WHERE type = 'pv' AND day >= ${TODAY} - ($1::int - 1) GROUP BY 1`, [days])
  const hourMap = new Map(hours.map((r) => [n(r.h), n(r.n)])), dowMap = new Map(dows.map((r) => [n(r.d), n(r.n)]))

  return {
    live: liveNow, today, yesterday, w7, p7, w30, p30, range, trend,
    sources, referrers, devices, browsers, systems, langs, landing,
    countries: mergeBy(countries, (r) => heCountry(r.k), (r, k) => ({ ...r, k })),
    cities: mergeBy(cities, (r) => heCity(r.k), (r, k) => ({ ...r, k })),
    geo: geo.map((r) => ({ city: heCity(r.city as string), country: heCountry(r.country as string | null), lat: n(r.lat), lng: n(r.lng), n: n(r.n) })),
    campaigns: campaigns.map((r) => ({ s: r.s as string, m: r.m as string, c: r.c as string, n: n(r.n) })),
    pages: pages.map((r) => ({ path: r.path as string, pv: n(r.pv), visits: n(r.visits), dwell: sec(r.dwell), scroll: r.scroll == null ? null : Math.round(n(r.scroll)) })),
    hours: Array.from({ length: 24 }, (_, h) => hourMap.get(h) ?? 0),
    dows: Array.from({ length: 7 }, (_, d) => dowMap.get(d) ?? 0),
  }
}
