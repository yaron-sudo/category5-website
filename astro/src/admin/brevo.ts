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

/** One address, wherever it is in the list (null when Brevo does not know it or it is not on this list). */
export async function find(email: string): Promise<Subscriber | null> {
  const j = await get(`/contacts/${encodeURIComponent(email)}`)
  if (!j || !(j.listIds ?? []).includes(listId())) return null
  return norm(j)
}
