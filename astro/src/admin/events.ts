// First-party, cookie-less analytics: what the tracker (public/c5/pulse.js) reports, and how it is
// stored. Privacy by design:
//  • no cookies, no localStorage, no fingerprinting; the IP is never stored;
//  • a visitor is a hash of (secret salt, day, IP, user-agent) — it changes every day, so a person
//    cannot be followed across days, only counted within one;
//  • DNT / Global Privacy Control visitors are not tracked at all (the tracker does not start);
//  • search text is stripped of e-mails and long numbers and cut to 80 characters; searches for
//    medical terms (the site blocks them) are counted without their text;
//  • raw events are deleted after RETENTION_DAYS.
import { q } from './db'
import { env, PROD } from './env'

export const RETENTION_DAYS = 400
const BOT = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|monitor|uptime|curl|wget|python|node-fetch|axios|okhttp|java\/|go-http|facebookexternalhit|embedly|whatsapp|telegram|discord|slack/i

// Tests drive a headless browser; ANALYTICS_ALLOW_HEADLESS lets it through outside production only.
export const isBot = (ua: string) => BOT.test(ua.replace(!PROD && env('ANALYTICS_ALLOW_HEADLESS') ? /headless/gi : /$^/, ''))

const clip = (v: unknown, n: number) => (typeof v === 'string' ? v.slice(0, n) : '')
export const redactText = (s: string, max: number) => s.replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[email]').replace(/\d[\d\s\-().]{4,}\d/g, '[num]').replace(/[ \t]+/g, ' ').trim().slice(0, max)
export const redact = (s: string) => redactText(s, 80).replace(/\s+/g, ' ')

const AI = /(^|\.)(chatgpt\.com|openai\.com|perplexity\.ai|claude\.ai|gemini\.google\.com|copilot\.microsoft\.com|you\.com)$/
const SOURCES: Array<[RegExp, string]> = [
  [/(^|\.)google\.[a-z.]+$/, 'google'], [/(^|\.)bing\.com$/, 'bing'], [/(^|\.)(duckduckgo\.com|yahoo\.com|ecosia\.org|yandex\.[a-z]+)$/, 'search-other'],
  [/(^|\.)(facebook\.com|fb\.com|fb\.me|messenger\.com)$/, 'facebook'], [/(^|\.)instagram\.com$/, 'instagram'], [/(^|\.)(t\.co|twitter\.com|x\.com)$/, 'x'],
  [/(^|\.)tiktok\.com$/, 'tiktok'], [/(^|\.)(youtube\.com|youtu\.be)$/, 'youtube'], [/(^|\.)linkedin\.com$/, 'linkedin'], [/(^|\.)(wa\.me|whatsapp\.com)$/, 'whatsapp'],
  [/(^|\.)(mail\.google\.com|outlook\.(live|office)\.com|mail\.yahoo\.com)$/, 'email'],
]
export function classify(refHost: string, ownHost: string, utmSource: string, utmMedium: string, gclid: boolean): string {
  if (gclid || utmSource || /^(cpc|ppc|paid|email|newsletter|social)/i.test(utmMedium)) return 'campaign'
  if (!refHost) return 'direct'
  if (refHost === ownHost || refHost.replace(/^www\./, '') === ownHost.replace(/^www\./, '')) return 'internal'
  if (AI.test(refHost)) return 'ai'
  for (const [re, name] of SOURCES) if (re.test(refHost)) return name
  return 'referral'
}

export const sha = async (s: string) => Buffer.from(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))).toString('hex').slice(0, 20)

const seen = new Map<string, { t: number; n: number }>()
const flood = (vid: string) => { // per-instance guard: > 120 events a minute from one visitor-day is not a person
  const now = Date.now(), e = seen.get(vid)
  if (!e || now - e.t > 60_000) { seen.set(vid, { t: now, n: 1 }); if (seen.size > 5000) seen.clear(); return false }
  return ++e.n > 120
}

/** Today's anonymous visitor id (changes daily; the IP itself is never stored). */
export async function visitorId(ip: string, ua: string) {
  const day = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Jerusalem' })
  return sha(`${env('ANALYTICS_SALT') || env('ADMIN_SESSION_SECRET') || 'c5'}|${day}|${ip}|${ua}`)
}

// City-level coordinates only: rounded to 2 decimals (about 1 km), and only when the city is known.
const coord = (v: string | undefined, lim: number) => { const x = Number(v); return v && Number.isFinite(x) && Math.abs(x) <= lim ? Math.round(x * 100) / 100 : null }

export function parseUa(ua: string): { browser: string; os: string } {
  const browser = /Edg\//.test(ua) ? 'Edge' : /OPR\/|Opera/.test(ua) ? 'Opera' : /SamsungBrowser/.test(ua) ? 'Samsung' : /Firefox\/|FxiOS/.test(ua) ? 'Firefox' : /Chrome\/|CriOS/.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : 'אחר'
  const os = /Windows/.test(ua) ? 'Windows' : /Android/.test(ua) ? 'Android' : /iPhone|iPad|iPod/.test(ua) ? 'iOS' : /Mac OS X|Macintosh/.test(ua) ? 'macOS' : /CrOS/.test(ua) ? 'ChromeOS' : /Linux/.test(ua) ? 'Linux' : 'אחר'
  return { browser, os }
}

export interface Ctx { ip: string; ua: string; ownHost: string; country: string; city?: string; lang?: string; lat?: string; lng?: string }

let excluded: { at: number; set: Set<string> } | null = null
/** Places the owners excluded (our own test machines, offices): their events are not stored. Cached for a minute. */
async function isExcluded(city: string | undefined, country: string): Promise<boolean> {
  if (!city) return false
  if (!excluded || Date.now() - excluded.at > 60_000) {
    const rows = await q<{ city: string; country: string }>('SELECT city, country FROM geo_excludes')
    excluded = { at: Date.now(), set: new Set(rows.map((r) => `${r.city}|${r.country}`)) }
  }
  return excluded.set.has(`${city}|${country}`)
}
export const clearExclusionCache = () => { excluded = null }

/** Stores one tracker message. Returns silently on anything it does not understand. */
export async function ingest(raw: any, c: Ctx) {
  if (!raw || typeof raw !== 'object') return
  const t = clip(raw.t, 6), pid = clip(raw.p, 24).replace(/[^\w-]/g, '')
  if (!pid) return
  if (await isExcluded(c.city, c.country.toUpperCase())) return
  const day = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Jerusalem' })
  const vid = await sha(`${env('ANALYTICS_SALT') || env('ADMIN_SESSION_SECRET') || 'c5'}|${day}|${c.ip}|${c.ua}`)
  if (flood(vid)) return
  let path = clip(raw.u, 200).split(/[?#]/)[0]
  if (!path.startsWith('/') || path.startsWith('/admin') || path.startsWith('/api')) return
  path = path.length > 1 ? path.replace(/\/+$/, '') : path
  const country = /^[A-Z]{2}$/.test(c.country) ? c.country : null

  if (t === 'pv' || t === 'nf') {
    let refHost = ''
    try { refHost = new URL(clip(raw.r, 300)).hostname.toLowerCase() } catch { /* no referrer */ }
    const us = clip(raw.us, 60), um = clip(raw.um, 60), uc = clip(raw.uc, 80)
    const w = Number(raw.w) || 0
    const device = w && w < 700 ? 'mobile' : w && w < 1100 ? 'tablet' : 'desktop'
    const source = classify(refHost, c.ownHost.toLowerCase(), us, um, raw.g === 1)
    await q(
      `INSERT INTO events (type, pid, path, vid, source, ref_host, utm_source, utm_medium, utm_campaign, country, device, city, browser, os, lang, lat, lng, last_seen)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17, now()) ON CONFLICT DO NOTHING`,
      [t, pid, path, vid, source, refHost && source !== 'internal' ? refHost.slice(0, 120) : null, us || null, um || null, uc || null, country, device,
        clip(c.city, 60) || null, parseUa(c.ua).browser, parseUa(c.ua).os, /^[a-z]{2}$/.test(c.lang ?? '') ? c.lang : null, coord(c.lat, 90), coord(c.lng, 180)],
    )
    if (Math.random() < 0.01) {
      await q(`DELETE FROM events WHERE day < (now() AT TIME ZONE 'Asia/Jerusalem')::date - $1::int`, [RETENTION_DAYS])
      await q(`DELETE FROM clicks WHERE day < (now() AT TIME ZONE 'Asia/Jerusalem')::date - $1::int`, [180])
    }
    return
  }
  if (t === 'hb') {
    // Heartbeat while the page is open and the visitor is active: keeps "online now" accurate and
    // refreshes the active time even if the closing beacon never arrives (mobile browsers).
    const dwell = Math.min(Math.max(0, Math.round(Number(raw.d) || 0)), 30 * 60_000), scroll = Math.min(100, Math.max(0, Math.round(Number(raw.s) || 0)))
    await q(`UPDATE events SET last_seen = now(), dwell_ms = GREATEST(COALESCE(dwell_ms,0), $2), scroll = GREATEST(COALESCE(scroll,0), $3) WHERE pid = $1 AND type = 'pv'`, [pid, dwell, scroll])
    return
  }
  if (t === 'eng') {
    const dwell = Math.min(Math.max(0, Math.round(Number(raw.d) || 0)), 30 * 60_000), scroll = Math.min(100, Math.max(0, Math.round(Number(raw.s) || 0)))
    await q(`UPDATE events SET dwell_ms = GREATEST(COALESCE(dwell_ms,0), $2), scroll = GREATEST(COALESCE(scroll,0), $3) WHERE pid = $1 AND type = 'pv'`, [pid, dwell, scroll])
    return
  }
  if (t === 'clk') {
    // Click positions for the heat map: coordinates only (x in per-mille of the page width, y in px),
    // never an element, text or form content. The tracker sends them only after analytics consent.
    const w = Number(raw.w) || 0
    const device = w && w < 700 ? 'mobile' : w && w < 1100 ? 'tablet' : 'desktop'
    const h = Math.min(Math.max(0, Math.round(Number(raw.h) || 0)), 60000)
    const pts = (Array.isArray(raw.c) ? raw.c : []).slice(0, 20)
      .map((p: unknown) => [Math.round(Number((p as number[])?.[0])), Math.round(Number((p as number[])?.[1]))])
      .filter(([x, y]: number[]) => x >= 0 && x <= 1000 && y >= 0 && y <= 60000)
    if (!pts.length) return
    const rows = pts.map((_: number[], i: number) => `($1,$2,$3,$${i * 2 + 4},$${i * 2 + 5})`).join(',')
    await q(`INSERT INTO clicks (path, device, h, x, y) VALUES ${rows}`, [path, device, h || null, ...pts.flat()])
    return
  }
  if (t === 'out' || t === 'gl') {
    const target = clip(raw.x, 160).replace(/[?#].*$/, '')
    if (!target) return
    await q(`INSERT INTO events (type, pid, path, vid, country, target) VALUES ($1,$2,$3,$4,$5,$6)`, [t, pid, path, vid, country, target])
    return
  }
  if (t === 'srch') {
    const blocked = raw.b === 1
    const text = blocked ? '' : redact(clip(raw.x, 200))
    if (!blocked && text.length < 2) return
    await q(`INSERT INTO events (type, pid, path, vid, country, target, n) VALUES ('srch',$1,$2,$3,$4,$5,$6)`, [pid, path, vid, country, blocked ? null : text, blocked ? -1 : Math.max(0, Math.min(9999, Number(raw.n) || 0))])
  }
}
