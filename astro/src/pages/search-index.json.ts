// Prerendered search index (also used by scripts/search-test.mjs after a build).
import type { APIRoute } from 'astro'
import { buildSearchDocs, SEARCH_SYNONYMS } from '@/c5/search/index'
export const prerender = true
export const GET: APIRoute = async () =>
  new Response(JSON.stringify({ docs: await buildSearchDocs(), synonyms: SEARCH_SYNONYMS }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
