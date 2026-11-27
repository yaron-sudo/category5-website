// GET /api/admin/auth/callback — Google redirects here. Verifies the ID token, checks the
// allowlist, sets the session cookie.
import type { APIRoute } from 'astro'
import { finishLogin } from '@/admin/auth'

export const prerender = false

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
  try {
    const r = await finishLogin(url, cookies)
    return redirect(r.ok ? r.next : `/admin/login?e=${r.error}`)
  } catch (e) {
    console.error('[admin] login failed', e)
    return redirect('/admin/login?e=config')
  }
}
