// Guards the admin module. Public pages are prerendered and never reach this; only /admin/* and
// /api/admin/* (on-demand routes) do. Everything except the sign-in routes needs a session whose
// e-mail is still on the allowlist; state-changing requests must be same-origin (CSRF).
import { defineMiddleware } from 'astro:middleware'
import { currentUser } from '@/admin/auth'

export const onRequest = defineMiddleware(async (ctx, next) => {
  const p = ctx.url.pathname.replace(/\/$/, '') || '/'
  const page = p === '/admin' || p.startsWith('/admin/')
  const api = p.startsWith('/api/admin/')
  if (!page && !api) return next()

  const open = p === '/admin/login' || p.startsWith('/api/admin/auth/')
  if (!open) {
    let user = null
    try { user = await currentUser(ctx.cookies) } catch (e) { console.error('[admin] auth check failed', e) }
    if (!user) {
      if (api) return Response.json({ error: 'unauthorized' }, { status: 401, headers: { 'Cache-Control': 'no-store' } })
      return ctx.redirect(`/admin/login?next=${encodeURIComponent(p)}`)
    }
    ctx.locals.admin = user
    if (ctx.request.method !== 'GET' && ctx.request.method !== 'HEAD') {
      const origin = ctx.request.headers.get('origin')
      if (!origin || new URL(origin).host !== ctx.url.host) return Response.json({ error: 'bad-origin' }, { status: 403 })
    }
  }
  const res = await next()
  res.headers.set('Cache-Control', 'no-store')
  res.headers.set('X-Robots-Tag', 'noindex, nofollow')
  return res
})
