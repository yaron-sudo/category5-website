// POST /api/admin/exclusions — keep a place (city + country) out of the statistics (owners only):
//   action=add     city, country   → future events from there are dropped and what was recorded is deleted
//   action=remove  city, country   → events from there are counted again (deleted data does not come back)
// City and country are written as Vercel reports them (e.g. "Leesburg", "US").
import type { APIRoute } from 'astro'
import { audit, can } from '@/admin/auth'
import { q } from '@/admin/db'
import { clearExclusionCache } from '@/admin/events'

export const prerender = false
const back = (code: string) => new Response(null, { status: 303, headers: { Location: `/admin/exclusions?${code}` } })

export const POST: APIRoute = async ({ request, locals }) => {
  const me = locals.admin!
  if (!can(me.role, 'exclusions.manage')) return back('e=forbidden')
  const f = await request.formData()
  const city = String(f.get('city') ?? '').trim().slice(0, 80)
  const country = String(f.get('country') ?? '').trim().toUpperCase().slice(0, 2)
  if (!city || !/^[A-Z]{2}$/.test(country)) return back('e=invalid')
  const action = String(f.get('action') ?? '')
  if (action === 'add') {
    await q('INSERT INTO geo_excludes (city, country, created_by) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING', [city, country, me.email])
    const gone = await q<{ id: string }>('DELETE FROM events WHERE city = $1 AND country = $2 RETURNING id', [city, country])
    await audit(me.email, 'exclusion.add', `${city}, ${country}`, { deleted: gone.length })
    clearExclusionCache()
    return back('ok=added')
  }
  if (action === 'remove') {
    await q('DELETE FROM geo_excludes WHERE city = $1 AND country = $2', [city, country])
    await audit(me.email, 'exclusion.remove', `${city}, ${country}`)
    clearExclusionCache()
    return back('ok=removed')
  }
  return back('e=invalid')
}
