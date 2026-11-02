import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import vercel from '@astrojs/vercel/serverless'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

// Load astro/.env into process.env so the Sanity client (which may need a read
// token for a private dataset) works in both `dev` and `build`. Dotenv-free.
const envPath = fileURLToPath(new URL('./.env', import.meta.url))
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}

// Static content site (zero JS by default). Reads the public Sanity dataset at
// build time — no token needed. Vercel reads the adapter's `.vercel/output`.
// Canonical production origin. Override per-environment with SITE_URL so
// canonical tags + sitemap point at the real launch domain.
const SITE = process.env.SITE_URL || 'https://www.naturesage.co.il'

// ---- Visual editing / live preview (Sanity Presentation tool) --------------
// Production stays fully static. A PREVIEW deployment sets
// PUBLIC_SANITY_VISUAL_EDITING_ENABLED=true, which flips the site to SSR
// (every request re-reads Sanity, so editors see drafts instantly) and turns
// on stega + click-to-edit overlays (see src/lib/sanity.ts and Base.astro).
const VISUAL_EDITING = process.env.PUBLIC_SANITY_VISUAL_EDITING_ENABLED === 'true'

// Production is "hybrid": every page is prerendered (static HTML), and only
// routes that opt out (`export const prerender = false`, e.g. /api/contact —
// the contact-form mailer) run as Vercel serverless functions.
export default defineConfig({
  site: SITE,
  output: VISUAL_EDITING ? 'server' : 'hybrid',
  adapter: vercel(),
  // URLs without trailing slash everywhere (vercel.json trailingSlash:false does
  // the redirect; this keeps the sitemap/canonicals identical to the served URLs).
  trailingSlash: 'never',
  build: { format: 'directory' },
  integrations: [sitemap()],
})
