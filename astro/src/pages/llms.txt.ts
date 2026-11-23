// /llms.txt — Markdown map of the site for AI answer engines (llmstxt.org). Prerendered.
import type { APIRoute } from 'astro'
import { buildLlmsTxt } from '@/c5/llms'
export const prerender = true
export const GET: APIRoute = async () =>
  new Response(await buildLlmsTxt(false), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
