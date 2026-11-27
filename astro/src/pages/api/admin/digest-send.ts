// POST /api/admin/digest-send — e-mails the current digest to the signed-in owner/admin only.
import type { APIRoute } from 'astro'
import { audit, can } from '@/admin/auth'
import { buildDigest, sendMail } from '@/admin/digest'

export const prerender = false
const go = (code: string) => new Response(null, { status: 303, headers: { Location: `/admin/reports?${code}` } })

export const POST: APIRoute = async ({ locals }) => {
  const me = locals.admin!
  if (!can(me.role, 'content.write')) return go('e=failed')
  try {
    const m = await buildDigest()
    if (!(await sendMail(me.email, m.subject, m.html, m.text))) return go('e=mail')
    await audit(me.email, 'digest.send', me.email)
    return go('ok=sent')
  } catch (e) {
    console.error('[digest-send]', e)
    return go('e=failed')
  }
}
