// GET /api/instagram — the community page's feed. Runs as a Vercel function,
// reads the brand's Instagram media (reels + posts) through the official
// Instagram API, optionally the posts the brand was tagged in, normalises them
// and caches the result (in-memory + CDN) so Instagram is hit at most every
// 30 minutes regardless of traffic.
//
//   INSTAGRAM_ACCESS_TOKEN  long-lived token of the brand's Instagram
//                           professional account ("Instagram API with Instagram
//                           Login"); INSTAGRAM_USER_ID optional (defaults to /me)
//   INSTAGRAM_GRAPH_TOKEN + INSTAGRAM_BUSINESS_ID  optional: a Facebook Page
//                           token + IG business id to also fetch posts the brand
//                           is tagged in (Instagram Graph API /tags edge)
//   PUBLIC_INSTAGRAM_DEMO=true  sample items (for design review, no token)
//
// Without a token the response is { configured: false, items: [] } and the
// page shows its "follow us" state instead of a feed.
import type { APIRoute } from 'astro'

export const prerender = false

const env = (k: string) => (import.meta.env[k] as string | undefined) || process.env[k] || ''
const IG_BASE = env('INSTAGRAM_API_BASE') || 'https://graph.instagram.com'
const FB_BASE = env('INSTAGRAM_GRAPH_BASE') || 'https://graph.facebook.com/v21.0'
const TTL_MS = 30 * 60_000

export interface FeedItem {
  id: string
  kind: 'reel' | 'post' | 'carousel'
  /** direct media url (mp4 for reels, jpg for posts) */
  src: string
  /** poster/thumbnail (reels) or the image itself */
  poster: string
  permalink: string
  caption: string
  date: string
  username: string
  tagged: boolean
}

type RawMedia = {
  id: string; caption?: string; media_type?: string; media_product_type?: string
  media_url?: string; thumbnail_url?: string; permalink?: string; timestamp?: string; username?: string
}

const FIELDS = 'id,caption,media_type,media_product_type,media_url,thumbnail_url,permalink,timestamp,username'

const https = (u?: string) => (u && /^https:\/\//i.test(u) ? u : undefined)
const normalise = (raw: RawMedia, tagged = false): FeedItem | null => {
  const m = { ...raw, media_url: https(raw.media_url), thumbnail_url: https(raw.thumbnail_url), permalink: https(raw.permalink) }
  if (!m.permalink || !(m.media_url || m.thumbnail_url)) return null
  const video = m.media_type === 'VIDEO'
  return {
    id: m.id,
    kind: video ? 'reel' : m.media_type === 'CAROUSEL_ALBUM' ? 'carousel' : 'post',
    src: m.media_url ?? m.thumbnail_url ?? '',
    poster: (video ? m.thumbnail_url : m.media_url) ?? m.media_url ?? '',
    permalink: m.permalink,
    caption: (m.caption ?? '').trim(),
    date: m.timestamp ?? '',
    username: m.username ?? '',
    tagged,
  }
}

async function fetchJson(url: string) {
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  const body = (await res.json().catch(() => ({}))) as { data?: RawMedia[]; error?: { message?: string } }
  if (!res.ok) throw new Error(body.error?.message || `HTTP ${res.status}`)
  return body.data ?? []
}

async function loadFeed(): Promise<FeedItem[]> {
  const token = env('INSTAGRAM_ACCESS_TOKEN')
  const user = env('INSTAGRAM_USER_ID') || 'me'
  const own = await fetchJson(`${IG_BASE}/${encodeURIComponent(user)}/media?fields=${FIELDS}&limit=40&access_token=${encodeURIComponent(token)}`)
  let tagged: RawMedia[] = []
  const fbToken = env('INSTAGRAM_GRAPH_TOKEN'), bizId = env('INSTAGRAM_BUSINESS_ID')
  if (fbToken && bizId) {
    try { tagged = await fetchJson(`${FB_BASE}/${encodeURIComponent(bizId)}/tags?fields=${FIELDS}&limit=24&access_token=${encodeURIComponent(fbToken)}`) }
    catch (e) { console.error('instagram: tagged media failed', e) }
  }
  const items = [...own.map((m) => normalise(m)), ...tagged.map((m) => normalise(m, true))].filter((x): x is FeedItem => !!x)
  // newest first; reels before posts of the same day is not needed — plain date order
  return items.sort((a, b) => (b.date || '').localeCompare(a.date || ''))
}

// Design-review sample (only when PUBLIC_INSTAGRAM_DEMO=true): site photos, clearly marked.
const DEMO: FeedItem[] = [
  { kind: 'reel', poster: '/img/menu/products.jpg', caption: 'דוגמה · ריל: שלושת המוצרים על השולחן בשדה' },
  { kind: 'post', poster: '/img/menu/info-feat.jpg', caption: 'דוגמה · פוסט: צנצנת הכמוסות' },
  { kind: 'reel', poster: '/img/menu/omega-feat.jpg', caption: 'דוגמה · ריל של לקוחה: הבוקר שלי עם שמן המרווה' },
  { kind: 'post', poster: '/img/menu/products.jpg', caption: 'דוגמה · תיוג מלקוח' },
  { kind: 'carousel', poster: '/img/menu/info-feat.jpg', caption: 'דוגמה · קרוסלה: איך לוקחים' },
  { kind: 'reel', poster: '/img/menu/omega-feat.jpg', caption: 'דוגמה · ריל' },
].map((d, i) => ({ id: `demo-${i}`, src: d.poster, permalink: 'https://www.instagram.com/naturesageil/', date: new Date(Date.now() - i * 86400e3 * 3).toISOString(), username: i % 2 ? 'naturesageil' : 'customer_story', tagged: i % 2 === 1, ...d }))

let cache: { at: number; items: FeedItem[] } | null = null

export const GET: APIRoute = async () => {
  const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=86400' }
  if (env('PUBLIC_INSTAGRAM_DEMO') === 'true') return new Response(JSON.stringify({ configured: true, demo: true, items: DEMO }), { headers })
  if (!env('INSTAGRAM_ACCESS_TOKEN')) return new Response(JSON.stringify({ configured: false, items: [] }), { headers })
  if (cache && Date.now() - cache.at < TTL_MS) return new Response(JSON.stringify({ configured: true, items: cache.items }), { headers })
  try {
    const items = await loadFeed()
    cache = { at: Date.now(), items }
    return new Response(JSON.stringify({ configured: true, items }), { headers })
  } catch (e) {
    console.error('instagram: feed failed', e)
    // serve the stale copy if we have one rather than an empty page
    if (cache) return new Response(JSON.stringify({ configured: true, stale: true, items: cache.items }), { headers })
    return new Response(JSON.stringify({ configured: true, error: 'feed-failed', items: [] }), { status: 502, headers: { ...headers, 'Cache-Control': 'no-store' } })
  }
}
