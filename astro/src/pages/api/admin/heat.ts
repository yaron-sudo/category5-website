// GET /api/admin/heat?path=/series/plants&device=desktop&d=30 — aggregated click and scroll data
// for one page, for the heat-map view (/admin/heatmap). Positions only; nothing personal.
import type { APIRoute } from 'astro'
import { q } from '@/admin/db'
import { parseRange } from '@/admin/stats'

export const prerender = false
const SINCE = `(now() AT TIME ZONE 'Asia/Jerusalem')::date - ($1::int - 1)`
const json = (b: unknown, status = 200) => Response.json(b, { status, headers: { 'Cache-Control': 'no-store' } })

export const GET: APIRoute = async ({ url }) => {
  const path = url.searchParams.get('path') ?? ''
  const device = url.searchParams.get('device') ?? 'desktop'
  if (!path.startsWith('/') || path.length > 200 || !['desktop', 'tablet', 'mobile'].includes(device)) return json({ error: 'bad-request' }, 400)
  const days = parseRange(url.searchParams.get('d'))

  const clicks = await q<{ x: number; y: number; n: string }>(
    `SELECT (round(x / 5.0) * 5)::int AS x, (round(y / 20.0) * 20)::int AS y, count(*) AS n
       FROM clicks WHERE path = $2 AND device = $3 AND day >= ${SINCE} GROUP BY 1, 2 ORDER BY n DESC LIMIT 4000`, [days, path, device])
  const [meta] = await q<{ total: string; h: string | null }>(`SELECT count(*) AS total, round(avg(h)) AS h FROM clicks WHERE path = $2 AND device = $3 AND day >= ${SINCE}`, [days, path, device])
  const views = await q<{ scroll: number | null }>(`SELECT scroll FROM events WHERE type = 'pv' AND path = $2 AND device = $3 AND day >= ${SINCE} LIMIT 20000`, [days, path, device])
  const scroll = Array.from({ length: 21 }, (_, i) => {
    const d = i * 5
    return views.length ? views.filter((v) => (v.scroll ?? 0) >= d).length / views.length : 0
  })
  return json({
    clicks: clicks.map((c) => [c.x, c.y, Number(c.n)]),
    total: Number(meta.total), docH: meta.h ? Number(meta.h) : null, views: views.length, scroll,
  })
}
