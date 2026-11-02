// POST /api/contact — the contact form's mailer. Runs as a Vercel serverless
// function (the rest of the site is prerendered). Validates the submission,
// filters obvious bots, and emails it to CONTACT_TO (default: the company
// inbox) through whichever transport is configured:
//
//   Microsoft 365 via Graph (the durable option — Microsoft is retiring
//   password SMTP; needs an Entra app with Mail.Send application permission):
//     MS_TENANT_ID, MS_CLIENT_ID, MS_CLIENT_SECRET, MS_SENDER (the mailbox)
//   SMTP (the company's own mailbox over password auth, e.g. Google Workspace
//   App Password or Microsoft 365 "Authenticated SMTP" while it still exists):
//     SMTP_HOST, SMTP_PORT (465 or 587), SMTP_USER, SMTP_PASS, optional SMTP_FROM
//   Resend (HTTP API, needs the sending domain verified at resend.com):
//     RESEND_API_KEY, CONTACT_FROM (e.g. "NatureSage <site@nature-sage.com>")
//
// Without any of them, the endpoint answers 503 and the form shows its error text.
import type { APIRoute } from 'astro'
import nodemailer from 'nodemailer'

export const prerender = false

const TO = import.meta.env.CONTACT_TO || process.env.CONTACT_TO || 'info-israel@nature-sage.com'
const env = (k: string) => (import.meta.env[k] as string | undefined) || process.env[k] || ''
const MAX = { name: 120, email: 200, phone: 40, message: 5000 }

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } })

// Per-instance rate limit: a burst from one address is almost always a bot.
const hits = new Map<string, number[]>()
const limited = (ip: string) => {
  const now = Date.now()
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000)
  arr.push(now)
  hits.set(ip, arr)
  return arr.length > 4 // 4 messages per 10 minutes per address is plenty for a human
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
const clean = (v: unknown, max: number) => String(v ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max)

type Mail = { to: string; from: string; replyTo: string; subject: string; text: string; html: string }

async function sendSmtp(m: Mail) {
  const port = Number(env('SMTP_PORT') || 587)
  const transport = nodemailer.createTransport({
    host: env('SMTP_HOST'),
    port,
    secure: port === 465,
    auth: { user: env('SMTP_USER'), pass: env('SMTP_PASS') },
  })
  await transport.sendMail(m)
}

// Microsoft Graph, client-credentials flow: token from Entra, then
// /users/{sender}/sendMail as the mailbox. Reply-To carries the visitor.
async function sendGraph(m: Mail) {
  const login = env('MS_LOGIN_BASE') || 'https://login.microsoftonline.com'
  const graph = env('MS_GRAPH_BASE') || 'https://graph.microsoft.com'
  const tok = await fetch(`${login}/${env('MS_TENANT_ID')}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: env('MS_CLIENT_ID'), client_secret: env('MS_CLIENT_SECRET'), scope: `${graph}/.default`, grant_type: 'client_credentials' }),
  })
  if (!tok.ok) throw new Error(`graph token ${tok.status}: ${(await tok.text()).slice(0, 200)}`)
  const { access_token } = (await tok.json()) as { access_token: string }
  const [, replyName = '', replyAddr = m.replyTo] = m.replyTo.match(/^"?([^"<]*)"?\s*<([^>]+)>$/) ?? []
  const res = await fetch(`${graph}/v1.0/users/${encodeURIComponent(env('MS_SENDER'))}/sendMail`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: {
        subject: m.subject,
        body: { contentType: 'HTML', content: m.html },
        toRecipients: [{ emailAddress: { address: m.to } }],
        replyTo: [{ emailAddress: { address: replyAddr.trim(), name: replyName.trim() } }],
      },
      saveToSentItems: false,
    }),
  })
  if (!res.ok) throw new Error(`graph send ${res.status}: ${(await res.text()).slice(0, 200)}`)
}

async function sendResend(m: Mail) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: m.from, to: [m.to], reply_to: m.replyTo, subject: m.subject, text: m.text, html: m.html }),
  })
  if (!res.ok) throw new Error(`resend ${res.status}: ${(await res.text()).slice(0, 200)}`)
}

const ALLOWED_ORIGIN = /^https:\/\/((www\.)?naturesage\.co\.il|[a-z0-9-]+\.vercel\.app)$|^http:\/\/localhost(:\d+)?$/

export const POST: APIRoute = async ({ request, clientAddress }) => {
  // Only the site's own pages may post here (browsers always send Origin on fetch POSTs).
  const origin = request.headers.get('origin') || ''
  if (!ALLOWED_ORIGIN.test(origin)) return json({ ok: false, error: 'forbidden' }, 403)
  const len = Number(request.headers.get('content-length') || 0)
  if (len > 32_000) return json({ ok: false, error: 'too-large' }, 413)
  let body: Record<string, unknown>
  try {
    const raw = await request.text()
    if (raw.length > 32_000) return json({ ok: false, error: 'too-large' }, 413)
    body = JSON.parse(raw) as Record<string, unknown>
  } catch {
    return json({ ok: false, error: 'bad-json' }, 400)
  }

  // Bot filters: honeypot field, and forms "filled" in under 3 seconds.
  // Honeypot (a name browser autofill never recognises) and submissions faster
  // than a human could type (< 1 s from page load). Both are logged, so a
  // genuine message dropped here is visible in the Vercel function logs.
  if (clean(body.ns_hp_field, 50)) { console.warn('contact: dropped (honeypot filled)'); return json({ ok: true }) }
  const started = Number(body._t)
  if (Number.isFinite(started) && started > 0 && Date.now() - started < 1000) { console.warn('contact: dropped (submitted in under 1 s)'); return json({ ok: true }) }

  let ip = ''
  try { ip = clientAddress } catch { ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '' }
  if (ip && limited(ip)) return json({ ok: false, error: 'rate-limited' }, 429)

  const name = clean(body.name, MAX.name)
  const email = clean(body.email, MAX.email)
  const phone = clean(body.phone, MAX.phone)
  const message = clean(body.message, MAX.message)
  if (!name || !email || !phone || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ ok: false, error: 'invalid' }, 422)
  }

  const source = clean(body._source, 300)
  const when = new Date().toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' })
  const subject = `פנייה מהאתר — ${name}`
  const text = [`שם: ${name}`, `אימייל: ${email}`, `טלפון: ${phone}`, '', message, '', `— נשלח מ-${source || 'האתר'} ב-${when}`].join('\n')
  const html = `<div dir="rtl" style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#113021">
  <h2 style="margin:0 0 12px">פנייה חדשה מהאתר</h2>
  <table cellpadding="0" cellspacing="0" style="border-collapse:collapse">
    <tr><td style="padding:4px 12px 4px 0;color:#666">שם</td><td style="padding:4px 0"><strong>${esc(name)}</strong></td></tr>
    <tr><td style="padding:4px 12px 4px 0;color:#666">אימייל</td><td style="padding:4px 0" dir="ltr"><a href="mailto:${esc(email)}">${esc(email)}</a></td></tr>
    <tr><td style="padding:4px 12px 4px 0;color:#666">טלפון</td><td style="padding:4px 0" dir="ltr"><a href="tel:${esc(phone.replace(/[^\d+]/g, ''))}">${esc(phone)}</a></td></tr>
  </table>
  <p style="white-space:pre-wrap;margin:16px 0;padding:14px 16px;background:#f7f3ec;border-radius:10px">${esc(message)}</p>
  <p style="color:#888;font-size:13px">נשלח מ-${esc(source || 'האתר')} ב-${esc(when)}</p>
</div>`

  const graphOk = env('MS_TENANT_ID') && env('MS_CLIENT_ID') && env('MS_CLIENT_SECRET') && env('MS_SENDER')
  const smtp = env('SMTP_HOST') && env('SMTP_USER') && env('SMTP_PASS')
  const resend = env('RESEND_API_KEY')
  if (!graphOk && !smtp && !resend) {
    console.error('contact: no mail transport configured (MS_* / SMTP_* / RESEND_API_KEY)')
    return json({ ok: false, error: 'not-configured' }, 503)
  }
  const from = graphOk
    ? env('MS_SENDER')
    : smtp ? env('SMTP_FROM') || `"אתר נייטשרסייג" <${env('SMTP_USER')}>` : env('CONTACT_FROM') || 'NatureSage <onboarding@resend.dev>'
  const mail: Mail = { to: TO, from, replyTo: `"${name.replace(/"/g, '')}" <${email}>`, subject, text, html }

  const transport = graphOk ? 'graph' : smtp ? 'smtp' : 'resend'
  try {
    if (graphOk) await sendGraph(mail)
    else if (smtp) await sendSmtp(mail)
    else await sendResend(mail)
    console.log(`contact: sent via ${transport} to ${TO} (from ${email})`)
  } catch (e) {
    console.error('contact: send failed', e)
    return json({ ok: false, error: 'send-failed' }, 502)
  }
  return json({ ok: true })
}

export const GET: APIRoute = () => json({ ok: false, error: 'method' }, 405)
