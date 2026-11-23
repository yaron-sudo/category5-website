// /llms-full.txt — the llms.txt map with the full texts (products, articles, glossary). Prerendered.
import type { APIRoute } from 'astro'
import { buildLlmsTxt } from '@/c5/llms'
export const prerender = true
export const GET: APIRoute = async () =>
  new Response(await buildLlmsTxt(true), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
