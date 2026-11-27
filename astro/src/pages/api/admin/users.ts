// POST /api/admin/users — manage the allowlist (owners only). Form posts from /admin/users:
//   action=add    email, role
//   action=role   email, role
//   action=remove email
//   action=digest email, on=1|0 (weekly e-mail digest; only owners/admins receive it)
// The last owner can never be removed or demoted. Every change is written to the audit log.
import type { APIRoute } from 'astro'
import { audit, can, isEmail, normEmail, type Role } from '@/admin/auth'
import { q } from '@/admin/db'

export const prerender = false
const ROLES: Role[] = ['owner', 'admin', 'viewer']
const back = (code: string) => new Response(null, { status: 303, headers: { Location: `/admin/users?${code}` } })

export const POST: APIRoute = async ({ request, locals }) => {
  const me = locals.admin!
  if (!can(me.role, 'users.manage')) return back('e=forbidden')
  const f = await request.formData()
  const action = String(f.get('action') ?? '')
  const email = normEmail(String(f.get('email') ?? ''))
  const role = String(f.get('role') ?? '') as Role
  if (!isEmail(email)) return back('e=email')

  if (action === 'add') {
    if (!ROLES.includes(role)) return back('e=role')
    const r = await q(`INSERT INTO admin_users (email, role, added_by) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING RETURNING email`, [email, role, me.email])
    if (!r.length) return back('e=exists')
    await audit(me.email, 'user.add', email, { role })
    return back('ok=added')
  }

  const target = (await q<{ role: Role }>('SELECT role FROM admin_users WHERE email=$1', [email]))[0]
  if (!target) return back('e=missing')
  const owners = Number((await q<{ n: string }>(`SELECT count(*) AS n FROM admin_users WHERE role='owner'`))[0].n)
  const losesOwner = target.role === 'owner' && (action === 'remove' || (action === 'role' && role !== 'owner'))
  if (losesOwner && owners <= 1) return back('e=lastowner')

  if (action === 'role') {
    if (!ROLES.includes(role)) return back('e=role')
    await q('UPDATE admin_users SET role=$2 WHERE email=$1', [email, role])
    await audit(me.email, 'user.role', email, { from: target.role, to: role })
    return back('ok=role')
  }
  if (action === 'digest') {
    const on = f.get('on') === '1'
    await q('UPDATE admin_users SET digest=$2 WHERE email=$1', [email, on])
    await audit(me.email, 'user.digest', email, { on })
    return back('ok=digest')
  }
  if (action === 'remove') {
    await q('DELETE FROM admin_users WHERE email=$1', [email])
    await audit(me.email, 'user.remove', email)
    return back('ok=removed')
  }
  return back('e=action')
}
