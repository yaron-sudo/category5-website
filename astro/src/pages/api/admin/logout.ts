// POST /api/admin/logout
import type { APIRoute } from 'astro'
import { audit, endSession } from '@/admin/auth'

export const prerender = false

export const POST: APIRoute = async ({ locals, cookies, redirect }) => {
  if (locals.admin) await audit(locals.admin.email, 'logout')
  endSession(cookies)
  return redirect('/admin/login', 303)
}
