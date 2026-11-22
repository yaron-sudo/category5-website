// /og/home.jpg — the share image of every non-product page: the first home-page banner
// rendered to 1200×630 (see src/c5/og.ts).
import type { APIRoute } from 'astro'
import { publicFile, renderBanner, jpegResponse } from '@/c5/ogRender'

export const prerender = true

export const GET: APIRoute = async () => {
  const file = publicFile('/assets/banners/home-banner-1.jpg')
  if (!file) return new Response(null, { status: 404 })
  return jpegResponse(await renderBanner(file))
}
