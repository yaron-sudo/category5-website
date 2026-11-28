// Admin authentication: Google sign-in (OpenID Connect, authorization-code flow + PKCE) and a
// signed session cookie. Access is decided ONLY by the admin_users table (the allowlist) — a
// valid Google account that is not on the list gets nothing. The list is re-checked on every
// request, so removing a user locks them out immediately.
import { SignJWT, jwtVerify, createRemoteJWKSet } from 'jose'
import type { AstroCookies } from 'astro'
import { env, PROD } from './env'
import { q } from './db'

export type Role = 'owner' | 'admin' | 'viewer'
export interface AdminUser { email: string; role: Role; name: string | null }

export const ROLE_LABEL: Record<Role, string> = { owner: 'בעלים', admin: 'מנהל', viewer: 'צפייה בלבד' }
const PERMS: Record<string, Role[]> = {
  'users.manage': ['owner'],
  'content.write': ['owner', 'admin'],
  'data.read': ['owner', 'admin', 'viewer'],
  'chat.read': ['owner', 'admin'],
  'chat.approve': ['owner'],
  'subscribers.read': ['owner', 'admin'],
}
export const can = (role: Role | undefined, perm: keyof typeof PERMS | string) => !!role && (PERMS[perm] ?? []).includes(role)

export const normEmail = (s: string) => s.trim().toLowerCase()
export const isEmail = (s: string) => /^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/.test(s) && s.length <= 200

// ---- Google endpoints (overridable only outside production, for the local mock) -----------
const dev = (k: string, d: string) => (!PROD && env(k)) || d
const G = () => ({
  auth: dev('ADMIN_OIDC_AUTH_URL', 'https://accounts.google.com/o/oauth2/v2/auth'),
  token: dev('ADMIN_OIDC_TOKEN_URL', 'https://oauth2.googleapis.com/token'),
  jwks: dev('ADMIN_OIDC_JWKS_URL', 'https://www.googleapis.com/oauth2/v3/certs'),
  issuers: !PROD && env('ADMIN_OIDC_ISSUER') ? [env('ADMIN_OIDC_ISSUER')] : ['https://accounts.google.com', 'accounts.google.com'],
})
let jwksCache: ReturnType<typeof createRemoteJWKSet> | null = null
const jwks = () => (jwksCache ??= createRemoteJWKSet(new URL(G().jwks)))

// ---- secrets & cookies -------------------------------------------------------------------
const key = () => {
  const s = env('ADMIN_SESSION_SECRET')
  if (s.length < 32) throw new Error('ADMIN_SESSION_SECRET must be set (at least 32 characters)')
  return new TextEncoder().encode(s)
}
export const SESSION_COOKIE = PROD ? '__Host-c5admin' : 'c5admin'
const STATE_COOKIE = PROD ? '__Host-c5oauth' : 'c5oauth'
const SESSION_SECONDS = 8 * 3600
const cookieOpts = (maxAge: number) => ({ httpOnly: true, secure: PROD, sameSite: 'lax' as const, path: '/', maxAge })

export const b64url = (buf: ArrayBuffer | Uint8Array) => Buffer.from(buf instanceof Uint8Array ? buf : new Uint8Array(buf)).toString('base64url')
const rand = (n = 32) => b64url(crypto.getRandomValues(new Uint8Array(n)))

export const baseUrl = (reqUrl: URL) => (env('ADMIN_BASE_URL') || reqUrl.origin).replace(/\/$/, '')
export const redirectUri = (reqUrl: URL) => `${baseUrl(reqUrl)}/api/admin/auth/callback`
export const safeNext = (n: string | null | undefined) => (n && /^\/admin(\/[\w\-./]*)?$/.test(n) ? n : '/admin')

export async function startLogin(reqUrl: URL, cookies: AstroCookies, next: string): Promise<string> {
  const clientId = env('GOOGLE_CLIENT_ID')
  if (!clientId) throw new Error('GOOGLE_CLIENT_ID is not set')
  const state = rand(), nonce = rand(), verifier = rand(48)
  const challenge = b64url(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)))
  const jwt = await new SignJWT({ state, nonce, verifier, next: safeNext(next) }).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('10m').sign(key())
  cookies.set(STATE_COOKIE, jwt, cookieOpts(600))
  const u = new URL(G().auth)
  u.search = new URLSearchParams({
    client_id: clientId, redirect_uri: redirectUri(reqUrl), response_type: 'code', scope: 'openid email profile',
    state, nonce, code_challenge: challenge, code_challenge_method: 'S256', prompt: 'select_account',
  }).toString()
  return u.toString()
}

export async function audit(actor: string, action: string, target?: string | null, meta?: unknown) {
  await q('INSERT INTO admin_audit (actor, action, target, meta) VALUES ($1,$2,$3,$4)', [actor, action, target ?? null, meta ? JSON.stringify(meta) : null])
}

const bootstrap = () => env('ADMIN_BOOTSTRAP_EMAILS').split(/[,\s;]+/).map(normEmail).filter(isEmail)

/** Finishes the Google redirect. Returns the path to send the user to, or an error code. */
export async function finishLogin(reqUrl: URL, cookies: AstroCookies): Promise<{ ok: true; next: string } | { ok: false; error: string }> {
  const raw = cookies.get(STATE_COOKIE)?.value
  cookies.delete(STATE_COOKIE, { path: '/' })
  const code = reqUrl.searchParams.get('code'), state = reqUrl.searchParams.get('state')
  if (reqUrl.searchParams.get('error')) return { ok: false, error: 'cancelled' }
  if (!raw || !code || !state) return { ok: false, error: 'state' }
  let st: any
  try { st = (await jwtVerify(raw, key())).payload } catch { return { ok: false, error: 'state' } }
  if (st.state !== state) return { ok: false, error: 'state' }

  let idToken: string
  try {
    const res = await fetch(G().token, {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ code, client_id: env('GOOGLE_CLIENT_ID'), client_secret: env('GOOGLE_CLIENT_SECRET'), redirect_uri: redirectUri(reqUrl), grant_type: 'authorization_code', code_verifier: st.verifier }),
    })
    if (!res.ok) return { ok: false, error: 'google' }
    idToken = (await res.json()).id_token
  } catch { return { ok: false, error: 'google' } }

  let claims: any
  try { claims = (await jwtVerify(idToken, jwks(), { issuer: G().issuers, audience: env('GOOGLE_CLIENT_ID') })).payload } catch { return { ok: false, error: 'google' } }
  if (claims.nonce !== st.nonce) return { ok: false, error: 'state' }
  if (claims.email_verified !== true || typeof claims.email !== 'string') return { ok: false, error: 'unverified' }

  const email = normEmail(claims.email)
  const name = typeof claims.name === 'string' ? claims.name.slice(0, 120) : null
  let rows = await q<AdminUser>('SELECT email, role, name FROM admin_users WHERE email = $1', [email])
  if (!rows.length && bootstrap().includes(email)) {
    await q(`INSERT INTO admin_users (email, role, name, added_by) VALUES ($1,'owner',$2,'bootstrap') ON CONFLICT DO NOTHING`, [email, name])
    await audit(email, 'user.bootstrap', email)
    rows = await q<AdminUser>('SELECT email, role, name FROM admin_users WHERE email = $1', [email])
  }
  if (!rows.length) {
    // One denial entry per address per hour, so the log cannot be flooded.
    const seen = await q(`SELECT 1 FROM admin_audit WHERE action='login.denied' AND actor=$1 AND at > now() - interval '1 hour' LIMIT 1`, [email])
    if (!seen.length) await audit(email, 'login.denied')
    return { ok: false, error: 'denied' }
  }
  await q('UPDATE admin_users SET last_login = now(), name = COALESCE(name, $2) WHERE email = $1', [email, name])
  await audit(email, 'login')
  const session = await new SignJWT({}).setProtectedHeader({ alg: 'HS256' }).setSubject(email).setIssuedAt().setExpirationTime(`${SESSION_SECONDS}s`).sign(key())
  cookies.set(SESSION_COOKIE, session, cookieOpts(SESSION_SECONDS))
  return { ok: true, next: safeNext(st.next) }
}

/** The signed-in admin (verified against the allowlist on every call), or null. */
export async function currentUser(cookies: AstroCookies): Promise<AdminUser | null> {
  const raw = cookies.get(SESSION_COOKIE)?.value
  if (!raw) return null
  try {
    const { payload } = await jwtVerify(raw, key())
    if (!payload.sub) return null
    const rows = await q<AdminUser>('SELECT email, role, name FROM admin_users WHERE email = $1', [payload.sub])
    return rows[0] ?? null
  } catch { return null }
}

export const endSession = (cookies: AstroCookies) => cookies.delete(SESSION_COOKIE, { path: '/' })
