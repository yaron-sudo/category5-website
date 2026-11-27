// GET /api/cron/digest — Vercel Cron (vercel.json): the weekly digest to every owner/admin who has
// it switched on in /admin/users. Vercel sends `Authorization: Bearer $CRON_SECRET`; without the
// secret set, or with a wrong one, the endpoint does nothing.
import type { APIRoute } from 'astro'
import { buildDigest, recipients, sendMail } from '@/admin/digest'
import { env } from '@/admin/env'

export const prerender = false
const json = (b: unknown, status = 200) => Response.json(b, { status, headers: { 'Cache-Control': 'no-store' } })

export const GET: APIRoute = async ({ request }) => {
  const secret = env('CRON_SECRET')
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) return json({ error: 'unauthorized' }, 401)
  try {
    const to = await recipients()
    if (!to.length) return json({ sent: 0, note: 'no recipients' })
    const m = await buildDigest()
    let sent = 0
    for (const addr of to) if (await sendMail(addr, m.subject, m.html, m.text)) sent++
    return json({ sent, recipients: to.length })
  } catch (e) {
    console.error('[digest]', e)
    return json({ error: 'failed' }, 500)
  }
}
