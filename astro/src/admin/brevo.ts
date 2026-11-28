// Reads the newsletter list from Brevo (read-only). The data stays in Brevo: nothing is copied into
// our database. Env (already used by the contact form): BREVO_API_KEY, BREVO_LIST_ID.
import { env } from './env'

export interface Subscriber { email: string; first: string; last: string; source: string; joined: string | null; modified: string | null; blocked: boolean }

const base = () => env('BREVO_API_BASE') || 'https://api.brevo.com/v3'
export const configured = () => !!env('BREVO_API_KEY') && !!Number(env('BREVO_LIST_ID'))
const listId = () => Number(env('BREVO_LIST_ID'))
const get = async (path: string) => {
  const res = await fetch(`${base()}${path}`, { headers: { 'api-key': env('BREVO_API_KEY'), Accept: 'application/json' } })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`brevo ${res.status}: ${(await res.text()).slice(0, 160)}`)
  return res.json() as Promise<any>
}

const norm = (c: any): Subscriber => {
  const a = c.attributes ?? {}
  return {
    email: String(c.email ?? ''),
    first: String(a.FIRSTNAME ?? a.FIRST_NAME ?? a.NAME ?? ''),
    last: String(a.LASTNAME ?? a.LAST_NAME ?? ''),
    source: String(a.SOURCE ?? ''),
    joined: c.createdAt ?? null,
    modified: c.modifiedAt ?? null,
    blocked: !!c.emailBlacklisted,
  }
}

export async function listTotals(): Promise<{ name: string; subscribers: number; blocked: number } | null> {
  const j = await get(`/contacts/lists/${listId()}`)
  return j ? { name: String(j.name ?? ''), subscribers: Number(j.uniqueSubscribers ?? j.totalSubscribers ?? 0), blocked: Number(j.totalBlacklisted ?? 0) } : null
}

/** One page of the list, newest first. */
export async function page(offset: number, limit: number): Promise<Subscriber[]> {
  const j = await get(`/contacts/lists/${listId()}/contacts?limit=${limit}&offset=${offset}&sort=desc`)
  return (j?.contacts ?? []).map(norm)
}

/** Every subscriber (for the Excel file), up to `cap`. */
export async function all(cap = 20000): Promise<{ rows: Subscriber[]; truncated: boolean }> {
  const rows: Subscriber[] = []
  for (let offset = 0; offset < cap; offset += 500) {
    const chunk = await page(offset, 500)
    rows.push(...chunk)
    if (chunk.length < 500) return { rows, truncated: false }
  }
  return { rows, truncated: true }
}

/** Everyone who joined at or after `sinceMs` (the list is read newest first and the read stops at the first older contact). */
export async function joinedSince(sinceMs: number, cap = 5000): Promise<{ rows: Subscriber[]; truncated: boolean }> {
  const rows: Subscriber[] = []
  for (let offset = 0; offset < cap; offset += 500) {
    const chunk = await page(offset, 500)
    for (const r of chunk) {
      if ((r.joined ? Date.parse(r.joined) : 0) < sinceMs) return { rows, truncated: false }
      rows.push(r)
    }
    if (chunk.length < 500) return { rows, truncated: false }
  }
  return { rows, truncated: true }
}

/** Ranges of the distribution-list filter: today, or the last 7 / 30 / 90 days including today (Israel time). */
export const SUB_RANGES = ['today', '7', '30', '90', 'all'] as const
export type SubRange = (typeof SUB_RANGES)[number]
export const parseSubRange = (v: string | null): SubRange => ((SUB_RANGES as readonly string[]).includes(v ?? '') ? (v as SubRange) : 'all')
export function rangeStart(r: SubRange): number {
  if (r === 'all') return 0
  const now = new Date()
  const il = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' }))
  const offset = il.getTime() - now.getTime()
  il.setHours(0, 0, 0, 0)
  il.setDate(il.getDate() - (r === 'today' ? 0 : Number(r) - 1))
  return il.getTime() - offset
}

export interface SubStats { total: number; blocked: number; today: number; d7: number; d30: number; d90: number; truncated: boolean }
let statsCache: { at: number; v: SubStats } | null = null
/** The list's figures in one go: total, and how many joined today / in the last 7, 30 and 90 days (Israel time).
 *  One pass over the newest contacts; cached for 60 s. null when Brevo is not configured or fails. */
export async function subscriberStats(): Promise<SubStats | null> {
  if (!configured()) return null
  if (statsCache && Date.now() - statsCache.at < 60_000) return statsCache.v
  try {
    const [totals, j] = await Promise.all([listTotals(), joinedSince(rangeStart('90'))])
    const from = { today: rangeStart('today'), d7: rangeStart('7'), d30: rangeStart('30') }
    const t = (r: Subscriber) => (r.joined ? Date.parse(r.joined) : 0)
    const v: SubStats = {
      total: totals?.subscribers ?? 0, blocked: totals?.blocked ?? 0, truncated: j.truncated,
      today: j.rows.filter((r) => t(r) >= from.today).length, d7: j.rows.filter((r) => t(r) >= from.d7).length,
      d30: j.rows.filter((r) => t(r) >= from.d30).length, d90: j.rows.length,
    }
    statsCache = { at: Date.now(), v }
    return v
  } catch (e) {
    console.warn('[brevo] stats failed:', (e as Error).message)
    return null
  }
}

/** One address, wherever it is in the list (null when Brevo does not know it or it is not on this list). */
export async function find(email: string): Promise<Subscriber | null> {
  const j = await get(`/contacts/${encodeURIComponent(email)}`)
  if (!j || !(j.listIds ?? []).includes(listId())) return null
  return norm(j)
}
