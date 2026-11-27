// GET /api/admin/auth/google?next=/admin/… — starts the Google sign-in.
import type { APIRoute } from 'astro'
import { startLogin } from '@/admin/auth'

export const prerender = false

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
  try {
    return redirect(await startLogin(url, cookies, url.searchParams.get('next') ?? '/admin'))
  } catch (e) {
    console.error('[admin] login start failed', e)
    return redirect('/admin/login?e=config')
  }
}
