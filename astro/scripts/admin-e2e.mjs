// End-to-end check of the admin sign-in + allowlist, against a mock Google (OIDC) server and an
// embedded Postgres. Run: node scripts/admin-e2e.mjs   (starts `astro dev` itself)
import http from 'node:http'
import { spawn } from 'node:child_process'
import { generateKeyPair, exportJWK, SignJWT } from 'jose'
import { createRequire } from 'node:module'
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_PATH || 'playwright')

const MOCK = 4599, SITE = 4388, BASE = `http://localhost:${SITE}`
const { publicKey, privateKey } = await generateKeyPair('RS256')
const jwk = { ...(await exportJWK(publicKey)), kid: 'k1', alg: 'RS256', use: 'sig' }
let who = { email: 'owner@example.test', verified: true }
const codes = new Map()
const mock = http.createServer(async (req, res) => {
  const u = new URL(req.url, `http://localhost:${MOCK}`)
  if (u.pathname === '/set') { who = { email: u.searchParams.get('email'), verified: u.searchParams.get('verified') !== 'false' }; return res.end('ok') }
  if (u.pathname === '/auth') {
    const code = Math.random().toString(36).slice(2); codes.set(code, { nonce: u.searchParams.get('nonce'), ...who })
    res.writeHead(302, { Location: `${u.searchParams.get('redirect_uri')}?code=${code}&state=${u.searchParams.get('state')}` }); return res.end()
  }
  if (u.pathname === '/jwks') { res.setHeader('content-type', 'application/json'); return res.end(JSON.stringify({ keys: [jwk] })) }
  if (u.pathname === '/token') {
    let body = ''; for await (const c of req) body += c
    const p = new URLSearchParams(body), c = codes.get(p.get('code'))
    if (!c || !p.get('code_verifier')) { res.statusCode = 400; return res.end('{}') }
    const id = await new SignJWT({ email: c.email, email_verified: c.verified, name: 'Test ' + c.email.split('@')[0], nonce: c.nonce })
      .setProtectedHeader({ alg: 'RS256', kid: 'k1' }).setIssuer(`http://localhost:${MOCK}`).setAudience('test-client').setIssuedAt().setExpirationTime('5m').sign(privateKey)
    res.setHeader('content-type', 'application/json'); return res.end(JSON.stringify({ id_token: id }))
  }
  res.statusCode = 404; res.end()
}).listen(MOCK)

const dev = spawn('npx', ['astro', 'dev', '--port', String(SITE)], { cwd: new URL('..', import.meta.url).pathname, env: { ...process.env,
  ADMIN_DB: 'pglite', GOOGLE_CLIENT_ID: 'test-client', GOOGLE_CLIENT_SECRET: 'x', ADMIN_SESSION_SECRET: 'unit-test-secret-unit-test-secret-1234',
  ADMIN_BOOTSTRAP_EMAILS: 'owner@example.test', ADMIN_OIDC_AUTH_URL: `http://localhost:${MOCK}/auth`, ADMIN_OIDC_TOKEN_URL: `http://localhost:${MOCK}/token`,
  ADMIN_OIDC_JWKS_URL: `http://localhost:${MOCK}/jwks`, ADMIN_OIDC_ISSUER: `http://localhost:${MOCK}` }, stdio: 'pipe' })
let log = ''; dev.stdout.on('data', (d) => (log += d)); dev.stderr.on('data', (d) => (log += d))
for (let i = 0; i < 90 && !/localhost:\d+/.test(log); i++) await new Promise((r) => setTimeout(r, 500))

let failed = 0
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) failed++ }
const setWho = (email, verified = true) => fetch(`http://localhost:${MOCK}/set?email=${email}&verified=${verified}`)
const browser = await chromium.launch()
async function login(ctx, email, verified = true) {
  await setWho(email, verified)
  const page = await ctx.newPage()
  await page.goto(`${BASE}/admin/login`)
  await page.click('text=התחברות עם Google')
  await page.waitForLoadState('networkidle')
  return page
}
try {
  const a = await browser.newContext()
  let p = await a.newPage()
  await p.goto(`${BASE}/admin/users`); ok(p.url().includes('/admin/login'), 'anonymous → redirected to login')
  const api = await a.request.get(`${BASE}/api/admin/users`); ok(api.status() === 401 || api.status() === 404 || api.status() === 405, `anonymous API → ${api.status()}`)
  p = await login(a, 'stranger@example.test'); ok(p.url().includes('e=denied'), 'unlisted Google account is denied')
  p = await login(a, 'owner@example.test', false); ok(p.url().includes('e=unverified'), 'unverified e-mail is denied')
  p = await login(a, 'owner@example.test'); ok(p.url().endsWith('/admin'), 'bootstrap owner signs in')
  await p.goto(`${BASE}/admin/users`); ok(await p.locator('text=owner@example.test').count() > 0, 'owner listed on users page')
  await p.fill('form.ad-row input[name=email]', 'Viewer@Example.test'); await p.selectOption('form.ad-row select[name=role]', 'viewer'); await p.click('form.ad-row button')
  await p.waitForLoadState('networkidle'); ok(await p.locator('text=viewer@example.test').count() > 0, 'owner adds viewer (e-mail normalised)')
  await p.fill('form.ad-row input[name=email]', 'viewer@example.test'); await p.click('form.ad-row button')
  ok(p.url().includes('e=exists'), 'duplicate rejected')
  // last owner protection
  const r1 = await a.request.post(`${BASE}/api/admin/users`, { form: { action: 'remove', email: 'owner@example.test' }, headers: { origin: BASE }, maxRedirects: 0 })
  ok((r1.headers().location ?? '').includes('e=lastowner'), 'last owner cannot be removed')
  // CSRF: foreign origin
  const r2 = await a.request.post(`${BASE}/api/admin/users`, { form: { action: 'add', email: 'x@example.test', role: 'owner' }, headers: { origin: 'https://evil.example' }, maxRedirects: 0 })
  ok(r2.status() === 403, 'cross-origin POST blocked')

  const b = await browser.newContext()
  const vp = await login(b, 'viewer@example.test'); ok(vp.url().endsWith('/admin'), 'viewer signs in')
  await vp.goto(`${BASE}/admin/users`); ok(await vp.locator('form[action="/api/admin/users"]').count() === 0, 'viewer sees no management forms')
  const r3 = await b.request.post(`${BASE}/api/admin/users`, { form: { action: 'add', email: 'y@example.test', role: 'owner' }, headers: { origin: BASE }, maxRedirects: 0 })
  ok((r3.headers().location ?? '').includes('e=forbidden'), 'viewer cannot add users')
  // owner removes viewer → viewer's existing session stops working at once
  await p.goto(`${BASE}/admin/users`)
  await p.locator('tr', { hasText: 'viewer@example.test' }).locator('button:has-text("הסרה")').click(); await p.waitForLoadState('networkidle')
  await vp.goto(`${BASE}/admin`); ok(vp.url().includes('/admin/login'), 'removed user is locked out immediately')
  await p.goto(`${BASE}/admin/audit`); const t = await p.locator('table').innerText()
  ok(/ניסיון כניסה נדחה/.test(t) && /הוספת משתמש/.test(t) && /הסרת משתמש/.test(t), 'audit log records denial, add and remove')
  const hdr = (await a.request.get(`${BASE}/admin`)).headers(); ok(/noindex/.test(hdr['x-robots-tag'] ?? '') && /no-store/.test(hdr['cache-control'] ?? ''), 'admin pages: noindex + no-store')
  await p.goto(`${BASE}/admin/users`); await p.click('button:has-text("התנתקות")'); await p.waitForLoadState('networkidle'); ok(p.url().includes('/admin/login'), 'logout works')
} catch (e) { console.error(e); failed++ } finally { await browser.close(); dev.kill(); mock.close() }
console.log(failed ? `\n${failed} FAILED` : '\nall passed'); if (failed) console.log(log.slice(-2500)); process.exit(failed ? 1 : 0)
