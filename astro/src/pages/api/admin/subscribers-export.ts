// GET /api/admin/subscribers-export — the Brevo newsletter list as an Excel file (owners and admins).
// Read live from Brevo on every download; nothing is stored here. Each download is written to the audit log.
import type { APIRoute } from 'astro'
import { audit, can } from '@/admin/auth'
import { all, configured, joinedSince, parseSubRange, rangeStart } from '@/admin/brevo'
import { buildXlsx } from '@/admin/xlsx'

export const prerender = false
const fmt = (d: string | null) => (d ? new Date(d).toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem', dateStyle: 'short', timeStyle: 'short' }) : '')

export const GET: APIRoute = async ({ locals, url }) => {
  const me = locals.admin!
  if (!can(me.role, 'subscribers.read')) return Response.json({ error: 'forbidden' }, { status: 403 })
  if (!configured()) return Response.json({ error: 'not-configured' }, { status: 503 })
  try {
    const range = parseSubRange(url.searchParams.get('d') ?? 'all')
    const { rows, truncated } = range === 'all' ? await all() : await joinedSince(rangeStart(range))
    const xlsx = buildXlsx('רשימת תפוצה', ['אימייל', 'שם פרטי', 'שם משפחה', 'מקור ההרשמה', 'תאריך הצטרפות', 'עודכן לאחרונה', 'סטטוס'],
      rows.map((r) => [r.email, r.first, r.last, r.source, fmt(r.joined), fmt(r.modified), r.blocked ? 'חסום / הוסר' : 'פעיל']), [34, 16, 16, 28, 20, 20, 14])
    await audit(me.email, 'subscribers.export', null, { rows: rows.length, truncated, range })
    const stamp = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Jerusalem' })
    return new Response(xlsx, { headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="category5-distribution-list-${range === 'all' ? '' : `new-${range}-`}${stamp}.xlsx"`,
      'Cache-Control': 'no-store',
    } })
  } catch (e) {
    console.error('[subscribers-export]', e)
    return Response.json({ error: 'failed' }, { status: 502, headers: { 'Cache-Control': 'no-store' } })
  }
}
