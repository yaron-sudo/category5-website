// GET /api/admin/live — the "online now" numbers, polled every few seconds by the dashboard.
import type { APIRoute } from 'astro'
import { live } from '@/admin/dashboard'

export const prerender = false

export const GET: APIRoute = async () => {
  try {
    return Response.json(await live(), { headers: { 'Cache-Control': 'no-store' } })
  } catch (e) {
    console.error('[live]', e)
    return Response.json({ error: 'failed' }, { status: 500, headers: { 'Cache-Control': 'no-store' } })
  }
}
