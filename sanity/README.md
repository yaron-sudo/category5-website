# sanity/ — NatureSage Studio + content import (Phase 2)

Sanity Studio schemas and the scripts that import the extracted WordPress
content (`migration/out/`) into Sanity.

## Document model

| Type | Used for | Count |
|---|---|---|
| `page` | home, compare, faq, contact, stores, terms, privacy, cookies, the-herb, production, omega-3-index, experts | 12 |
| `product` | omega-3 (flagship, `/product`), forti-pure, pure-capsules, pure-oil, vitamin-d | 5 |
| `article` | immune-system, focus-concentration, omega-3-heart-rate | 3 |
| `research` | blood-lipids, crohns-colitis | 2 |
| `feature` | the 8 brand benefits (seeded) | 8 |
| `expert` | the 2 endorsements (seeded) | 2 |
| `siteSettings` | singleton (brand, contact, stores, footer) | 1 |

Objects: `blockContent` (Portable Text body), `keyStat`.

The slug → type → route mapping lives in [`lib/routeMap.mjs`](./lib/routeMap.mjs)
(source of truth: `STATUS.md`).

## Setup (needs a Sanity account — secrets stay out of git)

```bash
# 1. Create the project (interactive: login + pick "production" dataset).
npm create sanity@latest -- --project-plan free --template clean --typescript --output-path .
# ...or `npx sanity init` inside this dir. Note the printed project id.

npm install

# 2. Configure env (gitignored).
cp .env.example .env
#   fill SANITY_PROJECT_ID and a write token (Editor role).
```

## Import

Dry runs need **no credentials** — they preview against `migration/out/`:

```bash
npm run seed:dry      # 8 features + 2 experts + siteSettings
npm run import:dry    # 22 docs (page/product/article/research) + image plan
```

Live (after `.env` is set):

```bash
npm run seed          # upsert brand data
npm run import        # upload images + upsert all 22 docs
npm run dev           # open Studio at http://localhost:3333 to verify
```

Both scripts are **idempotent** — deterministic document ids (`type.slug`) +
`createOrReplace`, so re-running updates in place instead of duplicating.

## Prerequisite

Phase 1 output must exist (`migration/out/` is gitignored, regenerate per
`STATUS.md`):

```bash
node ../migration/01_fetch_content.mjs
node ../migration/02_download_media.mjs
node ../migration/03_html_to_portable.mjs
```
