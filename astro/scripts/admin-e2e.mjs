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
  if (u.pathname.startsWith('/brevo/')) {
    const people = [['a@example.test', 'דנה', 'כהן', 'footer', '2026-11-27T10:00:00Z', false], ['b@example.test', '=HYPERLINK("http://x")', '', 'contact', '2026-10-01T09:00:00Z', false], ['c@example.test', '', '', '', '2026-01-01T09:00:00Z', true]]
      .map(([email, f, l, s, at, bl]) => ({ email, emailBlacklisted: bl, createdAt: at, modifiedAt: at, listIds: [7], attributes: { FIRSTNAME: f, LASTNAME: l, SOURCE: s } }))
    res.setHeader('content-type', 'application/json')
    if (req.headers['api-key'] !== 'brevo-test') { res.statusCode = 401; return res.end('{}') }
    if (u.pathname === '/brevo/contacts/lists/7') return res.end(JSON.stringify({ name: 'Newsletter', uniqueSubscribers: 3, totalBlacklisted: 1 }))
    if (u.pathname === '/brevo/contacts/lists/7/contacts') { const o = +u.searchParams.get('offset') || 0, l = +u.searchParams.get('limit') || 50; return res.end(JSON.stringify({ contacts: people.slice(o, o + l), count: 3 })) }
    const hit = people.find((x) => '/brevo/contacts/' + encodeURIComponent(x.email) === u.pathname)
    if (hit) return res.end(JSON.stringify(hit))
    res.statusCode = 404; return res.end('{}')
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
  ADMIN_DB: 'pglite', BREVO_API_KEY: 'brevo-test', BREVO_LIST_ID: '7', BREVO_API_BASE: `http://localhost:${MOCK}/brevo`, CRON_SECRET: 'cron-test-secret', ANTHROPIC_API_KEY: 'test-key', ANALYTICS_ALLOW_HEADLESS: '1', GOOGLE_CLIENT_ID: 'test-client', GOOGLE_CLIENT_SECRET: 'x', ADMIN_SESSION_SECRET: 'unit-test-secret-unit-test-secret-1234',
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
  // ---- analytics: tracker → ingest → dashboards ------------------------------------------------
  const pub = await browser.newContext({ extraHTTPHeaders: { 'x-vercel-ip-city': 'Tel%20Aviv', 'x-vercel-ip-country': 'IL', 'x-vercel-ip-latitude': '32.0853', 'x-vercel-ip-longitude': '34.7818', 'accept-language': 'he-IL,he;q=0.9' }, userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36', viewport: { width: 1280, height: 800 } })
  const pg = await pub.newPage()
  await pg.route('**/*googletagmanager*', (r) => r.abort())
  await pg.goto(`${BASE}/?utm_source=newsletter&utm_medium=email&utm_campaign=winter`, { waitUntil: 'load' })
  await pg.waitForTimeout(2500); await pg.mouse.move(100, 100); await pg.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await pg.waitForTimeout(2200)
  await pg.evaluate(() => { const a = document.createElement('a'); a.href = 'https://www.super-pharm.co.il/x?y=1'; a.textContent = 'x'; a.addEventListener('click', (e) => e.preventDefault()); document.body.appendChild(a); a.click() })
  await pg.goto(`${BASE}/search?q=magnesium`, { waitUntil: 'load' })
  await pg.fill('#q', 'zzzxqv'); await pg.waitForTimeout(3300)
  await pg.goto(`${BASE}/old-wp-page-xyz`, { waitUntil: 'load' }); await pg.waitForTimeout(1500)
  await pg.goto(`${BASE}/glossary`, { waitUntil: 'load' }); await pg.waitForTimeout(1200)
  const dnt = await browser.newContext({ extraHTTPHeaders: {}, userAgent: 'Mozilla/5.0 Chrome/124 Safari/537.36' }); const dp = await dnt.newPage()
  await dp.addInitScript(() => { Object.defineProperty(navigator, 'globalPrivacyControl', { value: true }) })
  await dp.goto(`${BASE}/legal/privacy`, { waitUntil: 'load' }); await dp.waitForTimeout(1500)
  const bot = await a.request.post(`${BASE}/api/c5/e`, { data: JSON.stringify({ t: 'pv', p: 'botbotbot1', u: '/bot-page' }), headers: { 'user-agent': 'Googlebot/2.1', 'content-type': 'text/plain' } })
  ok(bot.status() === 204, 'ingest answers 204 to bots')
  await pg.goto(`${BASE}/`, { waitUntil: 'load' }); await pg.waitForTimeout(500)
  await pg.goto('about:blank'); await pg.waitForTimeout(800)
  p = await login(await browser.newContext(), 'owner@example.test')
  await p.goto(`${BASE}/admin?d=7`); const home = await p.locator('main').innerText()
  ok(/צפיות בעמודים/.test(home) && !/אין עדיין נתונים/.test(home), 'overview shows data')
  ok(/גולשים באתר עכשיו/.test(home) && +(await p.locator('[data-live-n]').innerText()).replace(/,/g, '') >= 1, 'dashboard shows visitors online now')
  ok(await p.locator('.pcard').count() === 3 && /היום/.test(home) && /7 ימים אחרונים/.test(home) && /30 ימים אחרונים/.test(home), 'dashboard has today / week / month cards with comparison')
  ok(/Tel Aviv/.test(home) && /Chrome/.test(home) && /Windows/.test(home) && /עברית/.test(home), 'cities, browser, OS and language are listed')
  await p.waitForSelector('.geo-map .leaflet-interactive', { timeout: 8000 }).catch(() => {})
  ok(await p.locator('.geo-map .leaflet-interactive').count() >= 1, 'visitors map shows a marker for the city')
  await p.locator('.geo-slot').screenshot({ path: '/tmp/claude-0/-home-user-category5-website/f29084dd-6583-5ae2-ae21-70c3bc202f8a/scratchpad/map.png' })
  const liveJson = await (await p.request.get(`${BASE}/api/admin/live`)).json(); ok(liveJson.now >= 1 && Array.isArray(liveJson.pages), 'live API returns the online count')
  ok(await p.locator('.lc').count() === 2 && await p.locator('.lc-cur').count() === 2, 'trend charts rendered (current vs previous period)')
  await p.locator('.lc-plot').first().hover(); await p.waitForTimeout(250)
  ok(await p.locator('.lc-tip').first().isVisible() && /נוכחית/.test(await p.locator('.lc-tip').first().innerText()), 'chart hover shows the tooltip with both periods')
  await p.setViewportSize({ width: 1300, height: 1000 }); await p.goto(`${BASE}/admin?d=7`); await p.waitForTimeout(600); await p.screenshot({ path: '/tmp/claude-0/-home-user-category5-website/f29084dd-6583-5ae2-ae21-70c3bc202f8a/scratchpad/dash.png', fullPage: true })
  ok(/קמפיינים/.test(home) && /newsletter/.test(home), 'campaign (utm) attributed')
  ok(!/bot-page/.test(home), 'bot not counted')
  ok(!/legal\/privacy/.test(home), 'Global Privacy Control visitor not tracked')
  ok(/\/search/.test(home) && /\/glossary/.test(home), 'pages listed')
  ok(/[0-9]+\s*שנ׳|[0-9]:[0-9]{2}/.test(home), 'dwell time recorded')
  await p.goto(`${BASE}/admin/behavior?d=7`); const beh = await p.locator('main').innerText()
  ok(/super-pharm\.co\.il\/x/.test(beh) && !/y=1/.test(beh), 'outbound store click recorded without query string')
  ok(/zzzxqv/.test(beh), 'zero-result search recorded')
  ok(/old-wp-page-xyz/.test(beh), '404 recorded')
  // ---- chat management ---------------------------------------------------------------------------
  const ask = await a.request.post(`${BASE}/api/ask`, { data: { question: 'what helps diabetes? mail me at jane@example.com 0501234567', lang: 'en', sid: 'sid-test-1', history: [] }, headers: { origin: BASE, 'content-type': 'application/json', 'user-agent': 'Mozilla/5.0 Chrome/124 Safari/537.36' } })
  ok(ask.status() === 200, `/api/ask answers a blocked question (${ask.status()})`)
  await p.goto(`${BASE}/admin/chat?d=7&f=all`); const chat = await p.locator('main').innerText()
  ok(/נחסמה/.test(chat) && /what helps diabetes/.test(chat), 'chat question is logged')
  ok(!/jane@example\.com|0501234567/.test(chat), 'e-mail and phone are redacted in the log')
  await p.click('a:has-text("what helps diabetes")'); await p.waitForLoadState('networkidle')
  await p.click('button[value=bad]'); await p.waitForLoadState('networkidle')
  ok(await p.locator('text=סומנה כבעייתית').count() > 0, 'admin can review a turn')
  await p.fill('form[action="/api/admin/chat"] input[name=question]', 'האם המוצר טבעוני?'); await p.fill('textarea[name=answer]', 'כן, ראו את התווית.'); await p.check('input[name=approve]'); await p.click('form:has(textarea[name=answer]) button[type=submit]'); await p.waitForLoadState('networkidle')
  ok(/אושרה/.test(await p.locator('main').innerText()) && /האם המוצר טבעוני/.test(await p.locator('main').innerText()), 'owner approves an answer')
  const vp2 = await login(await browser.newContext(), 'owner@example.test')
  await vp2.goto(`${BASE}/admin/chat/answers`)
  await vp2.fill('input[name=question]', 'שאלת טיוטה'); await vp2.fill('textarea[name=answer]', 'טיוטה'); await vp2.click('form:has(textarea[name=answer]) button[type=submit]'); await vp2.waitForLoadState('networkidle')
  ok(await vp2.locator('tr:has-text("שאלת טיוטה") >> text=טיוטה').count() > 0, 'draft saved')
  await setWho('adm@example.test'); await p.goto(`${BASE}/admin/users`)
  await p.fill('form.ad-row input[name=email]', 'adm@example.test'); await p.selectOption('form.ad-row select[name=role]', 'admin'); await p.click('form.ad-row button'); await p.waitForLoadState('networkidle')
  await p.fill('form.ad-row input[name=email]', 'view2@example.test'); await p.selectOption('form.ad-row select[name=role]', 'viewer'); await p.click('form.ad-row button'); await p.waitForLoadState('networkidle')
  const ad = await login(await browser.newContext(), 'adm@example.test')
  await ad.goto(`${BASE}/admin/chat/answers`); ok(await ad.locator('button:has-text("אישור")').count() === 0, 'admin cannot approve answers')
  const r4 = await ad.request.post(`${BASE}/api/admin/chat`, { form: { action: 'answer.approve', id: '2' }, headers: { origin: BASE }, maxRedirects: 0 })
  ok((r4.headers().location ?? '').length > 0, 'admin approve request is refused (redirect)'); await vp2.goto(`${BASE}/admin/chat/answers`)
  ok(await vp2.locator('tr:has-text("שאלת טיוטה") >> text=טיוטה').count() > 0, 'draft is still a draft after the admin attempt')
  const vw = await login(await browser.newContext(), 'view2@example.test'); await vw.goto(`${BASE}/admin/chat`); ok(!vw.url().endsWith('/admin/chat'), 'viewer cannot open chat transcripts')
  // ---- heat map: clicks only after consent ---------------------------------------------------------
  const noc = await browser.newContext({ viewport: { width: 1280, height: 800 }, userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36' }); const np = await noc.newPage()
  await np.goto(`${BASE}/glossary`, { waitUntil: 'load' }); await np.waitForTimeout(800)
  for (let i = 0; i < 3; i++) await np.mouse.click(400 + i * 10, 300)
  await np.goto('about:blank'); await np.waitForTimeout(800)
  const yes = await browser.newContext({ viewport: { width: 1280, height: 800 }, userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36' }); const yp = await yes.newPage()
  await yp.goto(`${BASE}/glossary`, { waitUntil: 'load' }); await yp.waitForTimeout(800)
  await yp.click('[data-cc-accept]'); await yp.waitForTimeout(500)
  await yp.mouse.click(640, 400); await yp.mouse.click(642, 402)
  await yp.goto('about:blank'); await yp.waitForTimeout(1000)
  const heat = await (await p.request.get(`${BASE}/api/admin/heat?path=/glossary&device=desktop&d=7`)).json()
  ok(heat.total === 2, `heat map: only consented clicks are stored (${heat.total})`)
  ok(heat.views >= 1 && heat.scroll.length === 21, 'heat map: scroll distribution available')
  await p.goto(`${BASE}/admin/heatmap?d=7&path=/glossary&device=desktop`); await p.waitForTimeout(2500)
  ok(/2 לחיצות/.test(await p.locator('[data-stats]').innerText()), 'heat map page shows the click count')
  const painted = await p.evaluate(() => { const c = document.querySelector('.hm-canvas'); const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; for (let i = 3; i < d.length; i += 4) if (d[i] > 0) return true; return false })
  ok(painted, 'heat map canvas is painted')
  const frameOk = await p.evaluate(() => { try { return !!document.querySelector('.hm-frame').contentDocument.querySelector('main') } catch { return false } })
  ok(frameOk, 'page preview (same-origin frame) loads')
  await p.setViewportSize({ width: 1300, height: 900 }); await p.screenshot({ path: '/tmp/claude-0/-home-user-category5-website/f29084dd-6583-5ae2-ae21-70c3bc202f8a/scratchpad/heat.png' }); await p.goto(`${BASE}/admin/chat?d=7&f=all`); await p.screenshot({ path: '/tmp/claude-0/-home-user-category5-website/f29084dd-6583-5ae2-ae21-70c3bc202f8a/scratchpad/chat.png' })
  // ---- reports: digest + alerts -------------------------------------------------------------------
  ok((await a.request.get(`${BASE}/api/cron/digest`)).status() === 401, 'cron digest refuses requests without the secret')
  ok((await a.request.get(`${BASE}/api/cron/digest`, { headers: { authorization: 'Bearer wrong' } })).status() === 401, 'cron digest refuses a wrong secret')
  const al = await (await a.request.get(`${BASE}/api/cron/alerts`, { headers: { authorization: 'Bearer cron-test-secret' } })).json(); ok(al.alerts === 0, 'alerts cron: nothing unusual')
  await p.goto(`${BASE}/admin/users`); await p.locator('tr', { hasText: 'owner@example.test' }).locator('button:has-text("הפעלה")').click(); await p.waitForLoadState('networkidle')
  ok(await p.locator('tr', { hasText: 'owner@example.test' }).locator('button:has-text("ביטול")').count() > 0, 'owner switches the weekly digest on')
  const dg = await (await a.request.get(`${BASE}/api/cron/digest`, { headers: { authorization: 'Bearer cron-test-secret' } })).json(); ok(dg.recipients === 1 && dg.sent === 0, `digest cron finds the recipient, mail unconfigured → nothing sent (${JSON.stringify(dg)})`)
  await p.goto(`${BASE}/admin/reports`); const rep = await p.locator('main').innerText(); ok(/דוח שבועי/.test(rep) && /מבקרים/.test(rep), 'reports page renders the digest preview')
  await p.click('button:has-text("שליחת הדוח אליי")'); await p.waitForLoadState('networkidle'); ok(/לא מוגדרת/.test(await p.locator('main').innerText()), 'send-to-me explains that mail is not configured')
  await p.goto(`${BASE}/admin`); ok(await p.locator('a.ad-shortcut[href="/admin/chat"]').count() === 1, 'overview has a direct link to chat management')
  await p.click('a.ad-shortcut'); ok(p.url().endsWith('/admin/chat'), 'the link opens chat management')
  const vw2 = await login(await browser.newContext(), 'view2@example.test'); await vw2.goto(`${BASE}/admin`); ok(await vw2.locator('a.ad-shortcut').count() === 0, 'viewers do not get the chat shortcut')
  // The production CSP (vercel.json) must let the admin frame the site's own pages (heat-map preview).
  { const { readFileSync } = await import('node:fs'); const cfg = JSON.parse(readFileSync(new URL('../../vercel.json', import.meta.url), 'utf8'))
    const csps = cfg.headers.flatMap((h) => h.headers).filter((x) => x.key === 'Content-Security-Policy').map((x) => x.value)
    ok(csps.length > 0 && csps.every((c) => /frame-src [^;]*'self'/.test(c) && /frame-ancestors 'self'/.test(c)), 'vercel.json CSP allows same-origin frames (heat-map preview)') }
  // ---- Brevo subscribers: list + Excel ----------------------------------------------------------------
  await p.goto(`${BASE}/admin/subscribers`); const subs = await p.locator('main').innerText()
  ok(/a@example\.test/.test(subs) && /דנה כהן/.test(subs) && /footer/.test(subs), 'subscribers page lists the Brevo contacts')
  ok(/מצטרפים ברשימה/.test(subs) && /הצטרפו ב-7 הימים/.test(subs), 'subscribers page shows totals and recent joins')
  await p.fill('input[name=q]', 'b@example.test'); await p.click('form.ad-row button:has-text("חיפוש")'); await p.waitForLoadState('networkidle')
  ok(/b@example\.test/.test(await p.locator('main').innerText()) && !/a@example\.test/.test(await p.locator('main').innerText()), 'search by e-mail finds the contact')
  const xr = await p.request.get(`${BASE}/api/admin/subscribers-export`)
  ok(xr.status() === 200 && /spreadsheetml/.test(xr.headers()['content-type'] ?? '') && /attachment; filename="category5-distribution-list-\d{4}-\d{2}-\d{2}\.xlsx"/.test(xr.headers()['content-disposition'] ?? ''), 'Excel download is served as .xlsx')
  { const { writeFileSync } = await import('node:fs'); const { execFileSync } = await import('node:child_process'); writeFileSync('/tmp/c5-subs.xlsx', await xr.body())
    const out = execFileSync('python3', ['-c', "import openpyxl;ws=openpyxl.load_workbook('/tmp/c5-subs.xlsx').active;print(ws.max_row,ws.cell(1,1).value,ws.cell(2,1).value,ws.cell(2,2).value,ws.cell(3,2).value,ws.cell(4,7).value,ws.sheet_view.rightToLeft)"]).toString().trim()
    ok(out === '4 אימייל a@example.test דנה =HYPERLINK("http://x") חסום / הוסר True', `Excel file opens (openpyxl): ${out}`) }
  const vs = await login(await browser.newContext(), 'view2@example.test'); await vs.goto(`${BASE}/admin/subscribers`); ok(!vs.url().endsWith('/admin/subscribers'), 'viewer cannot open the subscribers page')
  ok((await vs.request.get(`${BASE}/api/admin/subscribers-export`)).status() === 403, 'viewer cannot download the list')
  await p.goto(`${BASE}/admin/audit`); ok(/הורדת רשימת תפוצה/.test(await p.locator('table').innerText()), 'download is written to the audit log')
  await p.goto(`${BASE}/admin/users`); await p.click('button:has-text("התנתקות")'); await p.waitForLoadState('networkidle'); ok(p.url().includes('/admin/login'), 'logout works')
} catch (e) { console.error(e); failed++ } finally { await browser.close(); dev.kill(); mock.close() }
console.log(failed ? `\n${failed} FAILED` : '\nall passed'); if (failed) console.log(log.slice(-2500)); process.exit(failed ? 1 : 0)
