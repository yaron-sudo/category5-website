// Aggregations for the admin dashboards. All ranges are whole Israeli calendar days (events.day).
// "Visitors" is the number of distinct (day, visitor) pairs: the visitor id rotates daily by
// design, so the same person on two days counts twice.
import { q } from './db'

export const RANGES = [1, 7, 30, 90] as const // 1 = today
export const parseRange = (v: string | null) => (RANGES as readonly number[]).includes(Number(v)) ? Number(v) : 30
const SINCE = `(now() AT TIME ZONE 'Asia/Jerusalem')::date - ($1::int - 1)`
const num = (v: unknown) => Number(v ?? 0)

export async function overview(days: number) {
  const [k] = await q(`SELECT count(*) AS pv, count(DISTINCT (day, vid)) AS visitors,
      avg(NULLIF(dwell_ms,0)) AS dwell, avg(NULLIF(scroll,0)) AS scroll
    FROM events WHERE type='pv' AND day >= ${SINCE}`, [days])
  const daily = await q(`SELECT day::text AS day, count(*) AS pv, count(DISTINCT vid) AS visitors FROM events WHERE type='pv' AND day >= ${SINCE} GROUP BY day ORDER BY day`, [days])
  const sources = await q(`SELECT source, count(*) AS n FROM (SELECT DISTINCT day, vid, source FROM events WHERE type='pv' AND source <> 'internal' AND day >= ${SINCE}) t GROUP BY source ORDER BY n DESC`, [days])
  const referrers = await q(`SELECT ref_host, count(*) AS n FROM events WHERE type='pv' AND ref_host IS NOT NULL AND day >= ${SINCE} GROUP BY ref_host ORDER BY n DESC LIMIT 10`, [days])
  const campaigns = await q(`SELECT COALESCE(utm_source,'(gclid / ללא)') AS s, COALESCE(utm_medium,'—') AS m, COALESCE(utm_campaign,'—') AS c, count(*) AS n
    FROM events WHERE type='pv' AND source='campaign' AND day >= ${SINCE} GROUP BY 1,2,3 ORDER BY n DESC LIMIT 10`, [days])
  const pages = await q(`SELECT path, count(*) AS pv, count(DISTINCT (day, vid)) AS visitors, avg(NULLIF(dwell_ms,0)) AS dwell, avg(NULLIF(scroll,0)) AS scroll
    FROM events WHERE type='pv' AND day >= ${SINCE} GROUP BY path ORDER BY pv DESC LIMIT 15`, [days])
  const devices = await q(`SELECT device, count(DISTINCT (day, vid)) AS n FROM events WHERE type='pv' AND day >= ${SINCE} GROUP BY device ORDER BY n DESC`, [days])
  const countries = await q(`SELECT COALESCE(country,'?') AS country, count(DISTINCT (day, vid)) AS n FROM events WHERE type='pv' AND day >= ${SINCE} GROUP BY 1 ORDER BY n DESC LIMIT 8`, [days])
  return {
    pv: num(k.pv), visitors: num(k.visitors), dwell: k.dwell == null ? null : Math.round(num(k.dwell) / 1000), scroll: k.scroll == null ? null : Math.round(num(k.scroll)),
    daily: daily.map((r) => ({ day: r.day as string, pv: num(r.pv), visitors: num(r.visitors) })),
    sources: sources.map((r) => ({ source: r.source as string, n: num(r.n) })),
    referrers: referrers.map((r) => ({ host: r.ref_host as string, n: num(r.n) })),
    campaigns: campaigns.map((r) => ({ s: r.s as string, m: r.m as string, c: r.c as string, n: num(r.n) })),
    pages: pages.map((r) => ({ path: r.path as string, pv: num(r.pv), visitors: num(r.visitors), dwell: r.dwell == null ? null : Math.round(num(r.dwell) / 1000), scroll: r.scroll == null ? null : Math.round(num(r.scroll)) })),
    devices: devices.map((r) => ({ device: r.device as string, n: num(r.n) })),
    countries: countries.map((r) => ({ country: r.country as string, n: num(r.n) })),
  }
}

export async function behavior(days: number) {
  const out = await q(`SELECT target, count(*) AS n, count(DISTINCT path) AS pages FROM events WHERE type='out' AND day >= ${SINCE} GROUP BY target ORDER BY n DESC LIMIT 20`, [days])
  const outFrom = await q(`SELECT path, count(*) AS n FROM events WHERE type='out' AND target NOT IN ('tel','mailto','whatsapp') AND day >= ${SINCE} GROUP BY path ORDER BY n DESC LIMIT 10`, [days])
  const search = await q(`SELECT target, count(*) AS n, round(avg(n))::int AS results FROM events WHERE type='srch' AND target IS NOT NULL AND n > 0 AND day >= ${SINCE} GROUP BY target ORDER BY count(*) DESC LIMIT 20`, [days])
  const zero = await q(`SELECT target, count(*) AS n FROM events WHERE type='srch' AND n = 0 AND day >= ${SINCE} GROUP BY target ORDER BY n DESC LIMIT 20`, [days])
  const [blocked] = await q(`SELECT count(*) AS n FROM events WHERE type='srch' AND n = -1 AND day >= ${SINCE}`, [days])
  const nf = await q(`SELECT path, count(*) AS n, mode() WITHIN GROUP (ORDER BY ref_host) AS ref FROM events WHERE type='nf' AND day >= ${SINCE} GROUP BY path ORDER BY n DESC LIMIT 20`, [days])
  const gl = await q(`SELECT target, count(*) AS n FROM events WHERE type='gl' AND day >= ${SINCE} GROUP BY target ORDER BY n DESC LIMIT 14`, [days])
  return {
    out: out.map((r) => ({ target: r.target as string, n: num(r.n), pages: num(r.pages) })),
    outFrom: outFrom.map((r) => ({ path: r.path as string, n: num(r.n) })),
    search: search.map((r) => ({ q: r.target as string, n: num(r.n), results: num(r.results) })),
    zero: zero.map((r) => ({ q: r.target as string, n: num(r.n) })),
    blocked: num(blocked.n),
    nf: nf.map((r) => ({ path: r.path as string, n: num(r.n), ref: (r.ref as string | null) ?? null })),
    gl: gl.map((r) => ({ id: r.target as string, n: num(r.n) })),
  }
}
