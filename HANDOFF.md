# Handoff: Category 5 Ethical Supplements website

> Read this first. Migration of **www.ethical-supplements.com** (WordPress + Elementor)
> to **Astro 4 + Sanity v3 + Vercel**, built on the naturesage.co.il template
> (`yaron-sudo/naturesage-website`; read only, never edited).
> The new site **replaces the old one on the same domain**.

## UPDATE (2026-11-13): the site was redesigned; read this section first

The first build (naturesage-style design, described below) was replaced by the **new
Category 5 design** from the client's handoff: `BRIEF.md` + `CLAUDE.md` (hard rules) +
`mockups/` + `assets/`. Sections below about Header/Footer/pages of the old design are history.

**What exists now (all in `astro/src`):**
- `layouts/Site.astro` + `components/c5/*` (Header, Footer, Floating chat + accessibility,
  ProductCard, ProductPage, LegalPage, SeriesTile); `styles/c5-site.css` is `mockups/site.css` verbatim,
  site additions in `styles/c5-base.css`; motion script `public/c5/site.js` (verbatim).
- Pages: `/` · `/series/[slug]` ×4 · `/products/[slug]` (45) · `/needs/[slug]` ×6 · `/stores` ·
  `/glossary` · `/articles` (+ template) · `/search` · `/contact` · `/legal/terms|privacy|accessibility`.
- **Product page layout follows The Ordinary's product page** (client request; supersedes BRIEF §8):
  gallery + info column, magnifier on click, accordions, series carousel.
- **Content lives in `c5/content/`**: `catalog.ts` merges old-site products (dataset) + `products.ts`
  + `overrides.ts` + images by file name; series per product from the BOM (`bom.ts`).
  See `docs/CONTENT-SESSION.md` for how to add content.
- Product images: white background dropped with CSS blend; uniform framing/centring computed at
  build time (`c5/content/imageFit.ts`). Image files are never edited (only downscaled).
- AI chat ("דברו איתנו") → `/api/ask` (needs `ANTHROPIC_API_KEY`); forms → `/api/contact`.
- Old-design leftovers still in the repo (not in the brief, awaiting the client's decision):
  `/community`, `/catalog`, `/cookies`, `/category/[slug]`, `layouts/Base.astro` and the `ns-*` components.

**Working mode:** one branch, `claude/admiring-curie-l85nyg` (also the default branch). Two parallel
sessions may run: design (components/pages/styles) and content (`c5/content/*`, product images);
see the division table in `docs/CONTENT-SESSION.md`. Always `git pull --rebase` before pushing.

**Open items:** Instagram/Facebook links · online-shop links (ByBy, ניצת הדובדבן, עדן טבע) ·
products per need · articles · content + images for the 9 BOM products without an old page ·
"עודכן לאחרונה" dates on legal pages · chat opening message · cookie consent for GA/Meta in the new design.

## Current state (2026-11-02)

| Area | State |
|---|---|
| Content | All 41 products, 6 product families, home page, privacy and terms migrated (`migration/`, `sanity/seed-content.mjs`) |
| Data source | **Local mode**: no Sanity project yet, so the site builds from `astro/content/dataset.json` via groq-js. Once `SANITY_PROJECT_ID` is set, the same queries run against Sanity |
| PDFs (QR codes) | 37 PDFs at their **original paths** `astro/public/wp-content/uploads/...` (including the Hebrew filename). Never rename or move them |
| Stores | 514 points of sale from the client's `Stores_Locations.xlsx`. 235 have precise coordinates; **279 are approximate (city centre)** because no geocoding service is reachable from the development environment |
| AI assistant | `/faq` + `POST /api/ask`. Answers from site content first, then the web. **Needs `ANTHROPIC_API_KEY` in Vercel**; until then it shows a "not active yet" message |
| Community | `/community` is ready; waiting for Instagram details (`socials.instagram` + `INSTAGRAM_ACCESS_TOKEN`, guide: `docs/instagram-feed-setup.md`) |
| Redirects | Every old URL (57 pages + short paths + WP archives) → 301. Map in `astro/vercel.json`, fallback in `src/pages/[...path].astro`. Regenerate: `node migration/06_redirects.mjs` |
| 3D | Dropped at the client's request |

## Repo layout

```
migration/          WP fetch, inventory, Elementor extraction, media download, redirects (01–06)
  out/              raw JSON, inventory.csv, products/categories (.local.json = local media paths), screenshots
sanity/
  schemas/          product (with category, leaflet, legacyPath), category, store, page, homePage (+categoryShowcase), siteSettings
  lib/sink.mjs      publish(group, docs): writes sanity/data/*.json + astro/content/dataset.json; also pushes to Sanity when a token is set
  seed-content.mjs  families, products, home, settings, pages
  seed-stores.mjs   stores (from assets/stores/stores-geocoded.json)
  geocode-stores.mjs cache → Nominatim (if reachable) → city centre
astro/
  content/dataset.json  local dataset (generated; do not edit by hand)
  public/media/         images from the old site (webp, max 1600px)
  public/wp-content/    the PDFs (fixed paths)
  src/lib/sanity.ts     queries; local mode (groq-js) + urlFor for "local:" images
  src/lib/knowledge.ts  knowledge text for the AI assistant
  src/pages/api/ask.ts  the AI assistant (streamed NDJSON)
```

## Seeding (after every content change in migration/)

```bash
node sanity/seed-content.mjs && node sanity/seed-stores.mjs
```
Writes the local dataset. With `SANITY_PROJECT_ID` + `SANITY_WRITE_TOKEN` (Editor) it also pushes to Sanity and uploads every image once (`sanity/data/.uploaded-assets.json`).

## Next steps (in order)

1. **Vercel**: new project connected to the repo. Works with Root Directory = repo root (the root
   `vercel.json` + `package.json` install and build `astro/` and copy `.vercel/output` up) or
   Root Directory = `astro` (`astro/vercel.json` sets `buildCommand: npm run build`, which includes the
   mandatory `patch-vercel-runtime`). Env:
   `SITE_URL=https://www.ethical-supplements.com`, `ANTHROPIC_API_KEY`, a mail option for the contact form (`PUBLIC_WEB3FORMS_KEY` is the simplest; see `astro/.env.example`).
2. **Sanity**: create a project at sanity.io/manage → set `SANITY_PROJECT_ID` in `sanity/.env` + an Editor token → run both seeds → set
   `SANITY_STUDIO_PROJECT_ID` and run `npx sanity deploy` (category5.sanity.studio) → set `SANITY_PROJECT_ID` in Vercel (production **without** a token; see the CDN lesson in the brief).
3. **Precise geocoding** for the 279 stores: allow `nominatim.openstreetmap.org` in the environment, then
   `node sanity/geocode-stores.mjs && node sanity/seed-stores.mjs` (or fix them by hand in the Studio).
4. **Instagram**: profile URL into siteSettings → socials.instagram + token.
5. **Domain switch**: point `www.ethical-supplements.com` at Vercel. Then run
   `node astro/scripts/check-redirects.mjs https://www.ethical-supplements.com` and spot-check 3 PDFs from QR codes.
6. Security: `docs/security-plan.md` (2FA, Deployment Protection, secrets only in Vercel).

## Lessons from this session

- The old site's content sits in Elementor widgets. `migration/lib_widgets.py` flattens them, `04_extract.py` maps them to fields. Check new products in a browser after extraction.
- The old site's menus link to wrong products. The new menu is generated from the CMS (Header.astro, `productsMega`).
- `TrackingPixels.astro`: a script inside a conditional expression is emitted inline (no TypeScript compile), so it must be plain JS (fixed; this bug also exists in the template).
- The AI assistant: knowledge text ~65K characters, cached (`cache_control`); `effort: low`; `fallbacks: "default"` (beta `server-side-fallback-2026-07-01`) re-runs a declined request on another model; web search capped at 3 queries; per-instance rate limit of 20/10 min/IP.
- Development environment: `cdn.sanity.io`, `i.ytimg.com` and the geocoding services are blocked, so video posters and map tiles are missing from local screenshots.
