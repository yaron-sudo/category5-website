// Server-side env reader for the admin module (same pattern as api/contact.ts: build-time
// import.meta.env first, then the runtime process.env that Vercel provides).
export const env = (k: string): string => ((import.meta.env as Record<string, string | undefined>)[k] as string | undefined) || process.env[k] || ''
export const PROD: boolean = import.meta.env.PROD
