// POST /api/c5/e — receives the first-party tracker's beacons (public/c5/track.js). Always answers
// 204 so the page is never affected, whether the event was stored, filtered (bots, flood, foreign
// origin) or failed.
import type { APIRoute } from 'astro'
import { isBot, ingest } from '@/admin/events'

export const prerender = false
let warned = false
const done = () => new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } })

export const POST: APIRoute = async ({ request, clientAddress, url }) => {
  try {
    const ua = request.headers.get('user-agent') || ''
    if (!ua || isBot(ua)) return done()
    const origin = request.headers.get('origin')
    if (origin && new URL(origin).host !== url.host) return done()
    const text = await request.text()
    if (text.length > 2000) return done()
    let ip = ''
    try { ip = clientAddress } catch { ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '' }
    let city = request.headers.get('x-vercel-ip-city') || ''
    try { city = decodeURIComponent(city) } catch { /* keep as is */ }
    await ingest(JSON.parse(text), {
      ip, ua, ownHost: url.hostname, country: (request.headers.get('x-vercel-ip-country') || '').toUpperCase(), city,
      lang: (request.headers.get('accept-language') || '').slice(0, 2).toLowerCase(),
      lat: city ? request.headers.get('x-vercel-ip-latitude') ?? undefined : undefined, lng: city ? request.headers.get('x-vercel-ip-longitude') ?? undefined : undefined,
    })
  } catch (e) {
    if (!warned) { warned = true; console.warn('[c5 analytics] ingest failed (logged once):', (e as Error).message) }
  }
  return done()
}
