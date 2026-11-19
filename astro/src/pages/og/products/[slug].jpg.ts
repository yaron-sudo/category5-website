// /og/products/[slug].jpg — the share image of a product page: its main photo rendered
// to 1200×630 (see src/c5/og.ts). Only products whose photo is a file of this site get
// one; Sanity photos are shaped on the Sanity CDN instead.
import type { APIRoute } from 'astro'
import { getCatalog } from '@/c5/content/catalog'
import { hasLocalPhoto } from '@/c5/og'
import { publicFile, renderProduct, jpegResponse } from '@/c5/ogRender'

export const prerender = true

export async function getStaticPaths() {
  return (await getCatalog())
    .filter((p) => hasLocalPhoto(p) && publicFile(p.image!))
    .map((p) => ({ params: { slug: p.slug }, props: { image: p.image! } }))
}

export const GET: APIRoute = async ({ props }) => {
  const file = publicFile((props as { image: string }).image)
  if (!file) return new Response(null, { status: 404 })
  return jpegResponse(await renderProduct(file))
}
