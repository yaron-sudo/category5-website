# Content session guide — product page content

> For a Claude Code session that ONLY adds / edits product content, running in
> parallel with a separate design session on the same repo and branch.
> Read `CLAUDE.md` and `BRIEF.md` first (hard rules), then this file.

## Division of work (two sessions, one branch)

| Session | May edit | Must not edit |
|---|---|---|
| **Content** (you) | `astro/src/c5/content/overrides.ts`, `products.ts`, `series.ts`, `needs.ts`, `articles.ts`, `stores.ts`, `bom.ts`, `labels.ts`; image files under `astro/public/assets/products/` (and `labels/`) | components, pages, layouts, styles, `catalog.ts`, `imageFit.ts`, `vercel.json`, anything under `mockups/` or `assets/` |
| **Design** (other session) | everything else | the content files above |

Both sessions push to **`claude/admiring-curie-l85nyg`** (the repo's only branch; Vercel
builds its preview). Before every push: `git pull --rebase origin claude/admiring-curie-l85nyg`.
Commit small and often, so the other session's rebase stays trivial. If a design change
is needed (new field, layout), do not make it: write it down for the user to pass on.

## How product content works

Every product page is built by `astro/src/c5/content/catalog.ts` from:
1. the old site's data (`astro/content/dataset.json`: 41 products, pulled automatically),
2. hand-entered products in `products.ts` (BOM products that had no old page),
3. **`overrides.ts`: per-product edits, keyed by slug** (the last part of `/products/<slug>`),
4. replacement images found by file name.

To edit a product, add or extend its entry in `PRODUCT_OVERRIDES` with only the fields that change:

```ts
'lipozamin-fe': {
  title: '…',                       // card + page name
  intro: ['פסקה קצרה'],              // short paragraph(s) under the name
  contains: 'מכיל 60 כמוסות',        // pack size (shown as the black pill)
  usage: ['…'],                     // "המלצות שימוש" bullets
  benefits: ['…'],                  // "יתרונות המוצר ושימושים" bullets
  details: ['סוג כשרות: …', '…'],   // "label: value" lines become spec rows; other lines go under usage
  legal: '…',                       // legal note at the bottom
  keywords: ['ברזל', 'עייפות'],      // extra search words (everyday names, uses)
  series: 'vitamins-minerals',      // vitamins-minerals | plants | probiotics | professional
  hidden: true,                     // remove from the site (URL redirects to the series page)
},
```

Products without an old page (names + pack size only so far) live in `products.ts`:
`lipozamin-nac`, `lipozamin-alpha-lipoic-acid`, `lipozamin-magnesium-malate`,
`lipozamin-creatine-complex`, `liposomal-multivitamin`, `liposomal-vitamin-b-complex`,
`natto`, `fibrogen`, `quick-daily-biotics`, `magnesium-bisglycinate-liposomal`, `calcidex`.
Fill their fields there (same field names).

### Images
- Product photo: `astro/public/assets/products/<slug>.(jpg|png|webp)`
- Label: **text only, never an image** — see "Product label" below.

## Product label (required for every product)

The label is shown on the product page as accessible text in one uniform table
design (screen readers, enlarged text). Add an entry per product slug to
`astro/src/c5/content/labels.ts` (`LABELS`); the page renders it automatically.

```ts
'my-product-slug': {
  title: 'שם המוצר - שורת הפתיחה של התווית.',
  ingredients: 'הרכיבים כפי שמודפסים על התווית.',
  table: {
    columns: ['רכיבים', 'כמות אלמנטלית בכמוסה', ...rda()],   // rda('51-70') for another age range; omit `columns` if the label table has no header row
    rows: [['שם הרכיב (English name) **', '27 מ"ג', '180%', '270%']],   // first cell = ingredient
  },
  facts: [['אינו מכיל', '…'], ['משקל כמוסה', '…'], ['משקל נקי', '…'], ENERGY, ['הוראות שימוש', '…']],
  notes: ['* אינו מהונדס גנטית | GMO FREE | מתאים לטבעונים', LIPOSOME],
},
```

- Every part is optional — fill in only what is printed on the label.
- Copy the label exactly: numbers, units, asterisks. Never add or "fix" data.
- Do not upload a label image for new products; a product without a `LABELS` entry
  shows a grey placeholder.

A file with the product's slug replaces the old image on the next build; no code change.
Only downscale large files (max ~2000px on the long side). **Never crop, recolour,
retouch or regenerate a product image.** Framing and centring are automatic (`imageFit.ts`).

### Other content files
- `series.ts`: intro text per series. `needs.ts`: intro, banner image and product slugs per need.
- `articles.ts`: articles (title, excerpt, body blocks). `stores.ts`: online-shop links.
- `bom.ts`: series of each product (from the company BOM list).

## Rules for the text
- Hebrew, the site's tone: professional, precise. **No medical claims** (does not cure, prevent or
  treat disease); dosage only as on the label; keep warnings as supplied.
- Use only text the client supplies or that exists on the old site (`migration/out/products.json`
  has everything extracted, including the long scientific sections that the new page does not show).
  Never invent product facts.
- Glossary terms are linked automatically; do not add links by hand.

## Check before pushing
```bash
cd astro && npm ci && npm run build
```
Then look at the changed product pages (build output in `astro/.vercel/output/static`, or
`npx astro dev`). Report in Hebrew: which products changed, what is still missing.
