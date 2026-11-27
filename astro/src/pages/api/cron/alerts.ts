// GET /api/cron/alerts — Vercel Cron, daily: e-mails the digest recipients only when something
// is off (traffic drop, 404 spike, chat failures). Same CRON_SECRET protection as /api/cron/digest.
import type { APIRoute } from 'astro'
import { findAlerts, recipients, sendMail, siteUrl } from '@/admin/digest'
import { env } from '@/admin/env'

export const prerender = false
const json = (b: unknown, status = 200) => Response.json(b, { status, headers: { 'Cache-Control': 'no-store' } })

export const GET: APIRoute = async ({ request }) => {
  const secret = env('CRON_SECRET')
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) return json({ error: 'unauthorized' }, 401)
  try {
    const alerts = await findAlerts()
    if (!alerts.length) return json({ alerts: 0 })
    const to = await recipients()
    const html = `<!doctype html><html dir="rtl" lang="he"><body style="font-family:Arial,sans-serif;color:#141414;font-size:16px;line-height:1.6"><h1 style="font-size:20px">התראה מאתר קטגוריה 5</h1><ul>${alerts.map((a) => `<li>${a.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</li>`).join('')}</ul><p><a href="${siteUrl()}/admin" style="color:#141414">לאזור הניהול</a></p></body></html>`
    let sent = 0
    for (const addr of to) if (await sendMail(addr, 'התראה מאתר קטגוריה 5', html, alerts.join('\n'))) sent++
    return json({ alerts: alerts.length, sent })
  } catch (e) {
    console.error('[alerts]', e)
    return json({ error: 'failed' }, 500)
  }
}
