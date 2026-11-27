// Postgres access for the admin module.
//  • Production: Neon (serverless HTTP driver) via DATABASE_URL — Vercel Marketplace → Neon.
//  • Local dev / tests: ADMIN_DB=pglite runs an embedded Postgres (devDependency @electric-sql/pglite);
//    it is ignored in production builds.
// The schema is created idempotently on first use (ensureSchema), so there is no separate
// migration step to forget.
import { env, PROD } from './env'

export type Row = Record<string, any>
type Runner = (text: string, params?: unknown[]) => Promise<Row[]>

let runner: Promise<Runner> | null = null

async function open(): Promise<Runner> {
  if (!PROD && env('ADMIN_DB') === 'pglite') {
    const mod = '@electric-sql/pglite'
    const { PGlite } = await import(/* @vite-ignore */ mod)
    const db = new PGlite(env('ADMIN_PGLITE_DIR') || undefined)
    return async (text, params = []) => (await db.query(text, params as any[])).rows as Row[]
  }
  const url = env('DATABASE_URL')
  if (!url) throw new Error('DATABASE_URL is not set (admin module needs a Neon Postgres database)')
  const { neon } = await import('@neondatabase/serverless')
  const sql = neon(url)
  return async (text, params = []) => (await sql.query(text, params as any[])) as Row[]
}

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS admin_users (
     email text PRIMARY KEY,
     role text NOT NULL CHECK (role IN ('owner','admin','viewer')),
     name text,
     added_by text,
     created_at timestamptz NOT NULL DEFAULT now(),
     last_login timestamptz
   )`,
  `ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS digest boolean NOT NULL DEFAULT false`,
  `CREATE TABLE IF NOT EXISTS admin_audit (
     id bigserial PRIMARY KEY,
     at timestamptz NOT NULL DEFAULT now(),
     actor text NOT NULL,
     action text NOT NULL,
     target text,
     meta jsonb
   )`,
  `CREATE INDEX IF NOT EXISTS admin_audit_at ON admin_audit (at DESC)`,
  `CREATE TABLE IF NOT EXISTS events (
     id bigserial PRIMARY KEY,
     at timestamptz NOT NULL DEFAULT now(),
     day date NOT NULL DEFAULT ((now() AT TIME ZONE 'Asia/Jerusalem')::date),
     type text NOT NULL,
     pid text,
     path text NOT NULL,
     vid text,
     source text,
     ref_host text,
     utm_source text,
     utm_medium text,
     utm_campaign text,
     country text,
     device text,
     target text,
     n int,
     dwell_ms int,
     scroll int
   )`,
  `CREATE INDEX IF NOT EXISTS events_day_type ON events (day, type)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS events_pid ON events (pid) WHERE type IN ('pv','nf')`,
  `CREATE TABLE IF NOT EXISTS chat_turns (
     id bigserial PRIMARY KEY,
     at timestamptz NOT NULL DEFAULT now(),
     day date NOT NULL DEFAULT ((now() AT TIME ZONE 'Asia/Jerusalem')::date),
     sid text,
     vid text,
     lang text,
     q text NOT NULL,
     a text,
     status text NOT NULL,
     gap boolean NOT NULL DEFAULT false,
     web boolean NOT NULL DEFAULT false,
     sources int NOT NULL DEFAULT 0,
     products text,
     attach boolean NOT NULL DEFAULT false,
     tokens_in int,
     tokens_out int,
     tokens_cached int,
     ms int,
     review text,
     note text,
     reviewed_by text,
     reviewed_at timestamptz
   )`,
  `CREATE INDEX IF NOT EXISTS chat_turns_at ON chat_turns (at DESC)`,
  `CREATE INDEX IF NOT EXISTS chat_turns_vid ON chat_turns (vid, at)`,
  `CREATE INDEX IF NOT EXISTS chat_turns_sid ON chat_turns (sid)`,
  `CREATE TABLE IF NOT EXISTS chat_answers (
     id bigserial PRIMARY KEY,
     question text NOT NULL,
     answer text NOT NULL,
     status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','approved')),
     source_turn bigint,
     created_by text NOT NULL,
     approved_by text,
     created_at timestamptz NOT NULL DEFAULT now(),
     updated_at timestamptz NOT NULL DEFAULT now()
   )`,
  `CREATE TABLE IF NOT EXISTS clicks (
     id bigserial PRIMARY KEY,
     day date NOT NULL DEFAULT ((now() AT TIME ZONE 'Asia/Jerusalem')::date),
     path text NOT NULL,
     device text NOT NULL,
     x smallint NOT NULL,
     y int NOT NULL,
     h int
   )`,
  `CREATE INDEX IF NOT EXISTS clicks_path ON clicks (path, device, day)`,
]

let ready: Promise<void> | null = null

export async function q<T = Row>(text: string, params: unknown[] = []): Promise<T[]> {
  runner ??= open()
  const run = await runner
  ready ??= (async () => { for (const s of SCHEMA) await run(s) })()
  await ready
  return (await run(text, params)) as T[]
}
