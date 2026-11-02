import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { presentationTool, defineLocations } from 'sanity/presentation'
import { visionTool } from '@sanity/vision'
import { media } from 'sanity-plugin-media'
import { dashboardTool, projectInfoWidget, projectUsersWidget } from '@sanity/dashboard'
import { documentListWidget } from 'sanity-plugin-dashboard-widget-document-list'
import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list'
import { schemaTypes } from './schemas'
import { RtlFieldsLayout } from './components/RtlFieldsLayout'
import { deployTool } from './components/DeployTool'
import { previewDevicesTool } from './components/PreviewDevicesTool'

// The Astro site the Presentation tool embeds for live click-to-edit preview.
// Locally: `npm run dev` in astro/ with PUBLIC_SANITY_VISUAL_EDITING_ENABLED=true.
// Deployed: set SANITY_STUDIO_PREVIEW_ORIGIN to the Vercel preview URL.
const PREVIEW_ORIGIN = process.env.SANITY_STUDIO_PREVIEW_ORIGIN || 'http://localhost:4321'
const HOME = { title: 'דף הבית', href: '/' }

// Singleton documents (one instance only) — surfaced as fixed list items.
const SINGLETONS = new Set(['siteSettings', 'homePage'])

export default defineConfig({
  name: 'category5',
  title: 'קטגוריה 5 — תוספים אתיים',

  // projectId + dataset are public (they appear in the deployed browser bundle
  // and the Studio URL), so they must be literals — process.env is NOT injected
  // into the client build, which previously baked in 'missing-project-id' and
  // produced "not a member of this project or the project does not exist".
  // Env-first for multi-site templating: SANITY_STUDIO_* vars ARE injected
  // into the Studio build (unlike bare process.env.*). The literals remain the
  // fallback for this site.
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'REPLACE_WITH_PROJECT_ID',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',

  // Hebrew-aware text direction in edit fields (the Studio chrome has no RTL
  // mode; this fixes the part editors feel — the content inputs).
  studio: { components: { layout: RtlFieldsLayout } },

  tools: (prev) => [...prev, previewDevicesTool, deployTool],

  plugins: [
    dashboardTool({
      widgets: [
        documentListWidget({
          title: 'נערכו לאחרונה',
          order: '_updatedAt desc',
          limit: 10,
          showCreateButton: false,
          layout: { width: 'medium' },
        }),
        projectInfoWidget(),
        projectUsersWidget(),
      ],
    }),
    structureTool({
      // Hierarchical desk: each top-level page is a parent, and the items that
      // belong to it are nested underneath (e.g. Experts + Features live UNDER
      // "דף הבית", not as standalone top-level lists).
      structure: (S, context) =>
        S.list()
          .id('root')
          .title('תוכן האתר')
          .items([
            // ── דף הבית (Home page) — parent, with its sub-items nested ──
            S.listItem()
              .title('דף הבית')
              .id('home')
              .child(
                S.list()
                  .id('home')
                  .title('דף הבית')
                  .items([
                    S.listItem()
                      .title('תוכן דף הבית')
                      .id('homePage')
                      .child(S.document().schemaType('homePage').documentId('homePage')),
                    S.listItem()
                      .title('הגדרות אתר')
                      .id('siteSettings')
                      .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
                    // Drag-and-drop ordering (writes orderRank).
                    orderableDocumentListDeskItem({
                      type: 'feature',
                      title: 'תכונות / יתרונות',
                      id: 'orderable-feature',
                      S,
                      context,
                    }),
                  ]),
              ),
            S.divider(),
            // ── Collections of standalone pages ──
            orderableDocumentListDeskItem({
              type: 'category',
              title: 'משפחות מוצרים',
              id: 'orderable-category',
              S,
              context,
            }),
            orderableDocumentListDeskItem({
              type: 'product',
              title: 'מוצרים',
              id: 'orderable-product',
              S,
              context,
            }),
            S.documentTypeListItem('store').title('רשימת חנויות'),
            S.documentTypeListItem('page').title('עמודים נוספים'),
          ]),
    }),
    // Live visual editing: renders the site in an iframe; editors click any
    // text to jump to (and edit) the exact field that produced it.
    presentationTool({
      title: 'עריכה חיה',
      previewUrl: { origin: PREVIEW_ORIGIN },
      resolve: {
        // Where each document type is used, so the Studio can offer
        // "open preview" from any document. Everything below renders on the
        // home page; products and categories have their own routes.
        locations: {
          homePage: defineLocations({ select: {}, resolve: () => ({ locations: [HOME] }) }),
          siteSettings: defineLocations({ select: {}, resolve: () => ({ locations: [HOME] }) }),
          feature: defineLocations({ select: {}, resolve: () => ({ locations: [HOME] }) }),
          category: defineLocations({
            select: { title: 'title', slug: 'slug.current' },
            resolve: (doc) => ({ locations: doc?.slug ? [{ title: doc.title ?? 'משפחה', href: `/category/${doc.slug}` }, HOME] : [HOME] }),
          }),
          product: defineLocations({
            select: { name: 'name', slug: 'slug.current' },
            resolve: (doc) => ({
              locations: doc?.slug
                ? [{ title: doc.name ?? 'מוצר', href: `/products/${doc.slug}` }]
                : [],
            }),
          }),
        },
      },
    }),
    // Media library: browse/tag/reuse every uploaded asset.
    media(),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
    // Hide singletons from the global "create" menu.
    templates: (templates) => templates.filter((t) => !SINGLETONS.has(t.schemaType)),
  },
})
