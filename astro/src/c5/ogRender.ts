// Renders the 1200×630 JPEG share images (see og.ts) with sharp at build time.
import sharp from 'sharp'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

export const OG_WIDTH = 1200
export const OG_HEIGHT = 630
const JPEG = { quality: 82, progressive: true, mozjpeg: true } as const

// public/ of this project, whether the build runs from astro/ or the repo root.
const PUBLIC = [resolve(process.cwd(), 'public'), resolve(process.cwd(), 'astro/public')].find((d) => existsSync(d)) ?? 'public'
/** Absolute file of a site-root path such as /assets/products/x.webp (undefined when missing). */
export function publicFile(src: string): string | undefined {
  const file = resolve(PUBLIC, '.' + decodeURI(src.split(/[?#]/)[0]))
  return file.startsWith(PUBLIC) && existsSync(file) ? file : undefined
}

/** Home banner: fitted whole (none of the bottles is cropped) and padded with the
 *  banner's own background colour, so the letterbox is invisible. */
export async function renderBanner(file: string): Promise<Buffer> {
  return sharp(file)
    .resize(OG_WIDTH, OG_HEIGHT, { fit: 'contain', background: { r: 243, g: 239, b: 240 } })
    .jpeg(JPEG)
    .toBuffer()
}

/** Product photo: fitted with a margin and centred. Transparent packshots sit on white
 *  (the product page background); opaque studio photos have a gradient background that
 *  no flat colour matches, so the free area is a blurred, enlarged copy of the photo. */
export async function renderProduct(file: string): Promise<Buffer> {
  const meta = await sharp(file).metadata()
  const photo = await sharp(file)
    .flatten({ background: '#ffffff' })
    .resize(OG_WIDTH - 80, OG_HEIGHT - 60, { fit: 'inside' })
    .toBuffer()
  const canvas = meta.hasAlpha
    ? sharp({ create: { width: OG_WIDTH, height: OG_HEIGHT, channels: 3, background: '#ffffff' } })
    : sharp(file).resize(OG_WIDTH, OG_HEIGHT, { fit: 'cover' }).blur(25)
  return canvas.composite([{ input: photo, gravity: 'centre' }]).jpeg(JPEG).toBuffer()
}

export const jpegResponse = (buf: Buffer) =>
  new Response(new Uint8Array(buf), { headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=86400' } })
