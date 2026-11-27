// Weekly digest + anomaly alerts, sent with the same Brevo account as the contact form
// (BREVO_API_KEY + CONTACT_FROM). Only aggregate numbers go into an e-mail: no chat text, no search
// text beyond the top phrases already shown in the admin, nothing personal.
import { q } from './db'
import { env } from './env'

const n = (v: unknown) => Number(v ?? 0)
const nf = (x: number) => x.toLocaleString('he-IL')
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)
const SRC: Record<string, string> = { direct: 'ישיר', google: 'גוגל', bing: 'Bing', 'search-other': 'מנועי חיפוש אחרים', facebook: 'פייסבוק', instagram: 'אינסטגרם', x: 'X', tiktok: 'TikTok', youtube: 'YouTube', linkedin: 'LinkedIn', whatsapp: 'וואטסאפ', email: 'דוא״ל', ai: 'כלי AI', campaign: 'קמפיינים', referral: 'אתרים מפנים' }

const TODAY = `(now() AT TIME ZONE 'Asia/Jerusalem')::date`
// "this week" = the last 7 whole days before today; "before" = the 7 days before that.
const THIS = `day >= ${TODAY} - 7 AND day < ${TODAY}`
const PREV = `day >= ${TODAY} - 14 AND day < ${TODAY} - 7`

export const siteUrl = () => (env('ADMIN_BASE_URL') || env('SITE_URL') || 'https://www.ethical-supplements.com').replace(/\/$/, '')

async function period(where: string) {
  const [k] = await q(`SELECT count(*) AS pv, count(DISTINCT (day, vid)) AS visitors, avg(NULLIF(dwell_ms,0)) AS dwell FROM events WHERE type='pv' AND ${where}`)
  const [o] = await q(`SELECT count(*) AS n FROM events WHERE type='out' AND target NOT IN ('tel','mailto','whatsapp') AND ${where}`)
  const [c] = await q(`SELECT count(*) AS n FROM events WHERE type='out' AND target IN ('tel','mailto','whatsapp') AND ${where}`)
  const [f] = await q(`SELECT count(*) AS n FROM events WHERE type='nf' AND ${where}`)
  return { pv: n(k.pv), visitors: n(k.visitors), dwell: k.dwell == null ? null : Math.round(n(k.dwell) / 1000), store: n(o.n), contact: n(c.n), nf: n(f.n) }
}

export async function collect() {
  const [now, before] = await Promise.all([period(THIS), period(PREV)])
  const sources = await q(`SELECT source, count(*) AS n FROM (SELECT DISTINCT day, vid, source FROM events WHERE type='pv' AND source <> 'internal' AND ${THIS}) t GROUP BY source ORDER BY n DESC LIMIT 5`)
  const pages = await q(`SELECT path, count(*) AS n FROM events WHERE type='pv' AND ${THIS} GROUP BY path ORDER BY n DESC LIMIT 5`)
  const zero = await q(`SELECT target AS t, count(*) AS n FROM events WHERE type='srch' AND n = 0 AND ${THIS} GROUP BY target ORDER BY n DESC LIMIT 5`)
  const nf = await q(`SELECT path, count(*) AS n FROM events WHERE type='nf' AND ${THIS} GROUP BY path ORDER BY n DESC LIMIT 5`)
  const [chat] = await q(`SELECT count(*) AS total, count(*) FILTER (WHERE gap) AS gaps, count(*) FILTER (WHERE review IS NULL AND (gap OR status IN ('no_results','declined','error'))) AS todo, count(*) FILTER (WHERE status = 'error') AS errors FROM chat_turns WHERE ${THIS}`)
  return { now, before, sources, pages, zero, nf, chat: { total: n(chat.total), gaps: n(chat.gaps), todo: n(chat.todo), errors: n(chat.errors) } }
}

const delta = (a: number, b: number) => (b === 0 ? (a === 0 ? '—' : 'חדש') : `${a >= b ? '+' : '−'}${Math.abs(Math.round(((a - b) / b) * 100))}%`)

export async function buildDigest() {
  const d = await collect()
  const base = siteUrl()
  const row = (label: string, a: number, b: number) => `<tr><td style="padding:6px 12px;border-bottom:1px solid #dcdcd9">${label}</td><td style="padding:6px 12px;border-bottom:1px solid #dcdcd9;text-align:end">${nf(a)}</td><td style="padding:6px 12px;border-bottom:1px solid #dcdcd9;text-align:end">${delta(a, b)}</td></tr>`
  const list = (items: string[]) => (items.length ? `<ul style="margin:6px 0 0;padding-inline-start:20px">${items.map((i) => `<li>${i}</li>`).join('')}</ul>` : '<p style="margin:6px 0 0">אין נתונים.</p>')
  const html = `<!doctype html><html dir="rtl" lang="he"><body style="margin:0;background:#f7f7f5;font-family:Arial,sans-serif;color:#141414;font-size:16px;line-height:1.6"><div style="max-width:620px;margin:0 auto;padding:24px">
<h1 style="font-size:22px;margin:0 0 4px">דוח שבועי · קטגוריה 5</h1><p style="margin:0 0 16px">7 הימים האחרונים, מול 7 הימים שלפניהם</p>
<table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #dcdcd9"><thead><tr><th style="padding:8px 12px;text-align:start">מדד</th><th style="padding:8px 12px;text-align:end">השבוע</th><th style="padding:8px 12px;text-align:end">שינוי</th></tr></thead><tbody>
${row('מבקרים', d.now.visitors, d.before.visitors)}${row('צפיות בעמודים', d.now.pv, d.before.pv)}${row('לחיצות לחנויות', d.now.store, d.before.store)}${row('פניות (טלפון, אימייל, וואטסאפ)', d.now.contact, d.before.contact)}${row('עמודי 404', d.now.nf, d.before.nf)}
</tbody></table>
${d.now.dwell != null ? `<p style="margin:10px 0 0">זמן גלישה ממוצע בעמוד: ${d.now.dwell} שניות</p>` : ''}
<h2 style="font-size:18px;margin:22px 0 0">מקורות הגעה</h2>${list(d.sources.map((r) => `${esc(SRC[r.source as string] ?? String(r.source))}: ${nf(n(r.n))}`))}
<h2 style="font-size:18px;margin:22px 0 0">עמודים מובילים</h2>${list(d.pages.map((r) => `<span dir="ltr">${esc(String(r.path))}</span>: ${nf(n(r.n))}`))}
<h2 style="font-size:18px;margin:22px 0 0">חיפושים בלי תוצאות</h2>${list(d.zero.map((r) => `${esc(String(r.t))}: ${nf(n(r.n))}`))}
${d.nf.length ? `<h2 style="font-size:18px;margin:22px 0 0">כתובות שלא נמצאו (404)</h2>${list(d.nf.map((r) => `<span dir="ltr">${esc(String(r.path))}</span>: ${nf(n(r.n))}`))}` : ''}
<h2 style="font-size:18px;margin:22px 0 0">הצ'אט</h2><p style="margin:6px 0 0">${nf(d.chat.total)} שאלות · ${nf(d.chat.gaps)} חוסרי מידע · ${nf(d.chat.todo)} ממתינות לבדיקה${d.chat.errors ? ` · ${nf(d.chat.errors)} שגיאות` : ''}</p>
<p style="margin:24px 0 0"><a href="${base}/admin" style="color:#141414">לאזור הניהול</a></p></div></body></html>`
  const text = [`דוח שבועי · קטגוריה 5`, `מבקרים: ${d.now.visitors} (${delta(d.now.visitors, d.before.visitors)})`, `צפיות: ${d.now.pv} (${delta(d.now.pv, d.before.pv)})`, `לחיצות לחנויות: ${d.now.store} (${delta(d.now.store, d.before.store)})`, `פניות: ${d.now.contact}`, `404: ${d.now.nf}`, `צ'אט: ${d.chat.total} שאלות, ${d.chat.gaps} חוסרי מידע, ${d.chat.todo} ממתינות לבדיקה`, `${base}/admin`].join('\n')
  return { subject: `דוח שבועי · קטגוריה 5 · ${nf(d.now.visitors)} מבקרים (${delta(d.now.visitors, d.before.visitors)})`, html, text }
}

/** Conditions worth an e-mail between digests. Compares yesterday with the average of the 7 days before it. */
export async function findAlerts(): Promise<string[]> {
  const out: string[] = []
  const Y = `day = ${TODAY} - 1`, BASE = `day >= ${TODAY} - 8 AND day < ${TODAY} - 1`
  const [y] = await q(`SELECT count(*) AS pv FROM events WHERE type='pv' AND ${Y}`)
  const [b] = await q(`SELECT count(*) / 7.0 AS pv FROM events WHERE type='pv' AND ${BASE}`)
  const yv = n(y.pv), bv = n(b.pv)
  if (bv >= 30 && yv < bv * 0.5) out.push(`צפיות אתמול: ${nf(yv)}, לעומת ממוצע של ${nf(Math.round(bv))} ביום בשבוע שלפני. ירידה של מעל 50%.`)
  const [f] = await q(`SELECT count(*) AS n FROM events WHERE type='nf' AND ${Y}`)
  const [fb] = await q(`SELECT count(*) / 7.0 AS n FROM events WHERE type='nf' AND ${BASE}`)
  if (n(f.n) >= 20 && n(f.n) > n(fb.n) * 3) out.push(`עמודי 404 אתמול: ${nf(n(f.n))} (ממוצע רגיל ${nf(Math.round(n(fb.n)))}). ייתכן קישור שבור או כתובות ישנות שחסרה להן הפניה.`)
  const [c] = await q(`SELECT count(*) AS total, count(*) FILTER (WHERE status = 'error') AS err FROM chat_turns WHERE ${Y}`)
  if (n(c.total) >= 10 && n(c.err) / n(c.total) > 0.2) out.push(`בצ'אט נכשלו ${nf(n(c.err))} מתוך ${nf(n(c.total))} שאלות אתמול. כדאי לבדוק את מפתח ה-API ואת הזמינות.`)
  return out
}

export async function recipients(): Promise<string[]> {
  const rows = await q<{ email: string }>(`SELECT email FROM admin_users WHERE digest = true AND role IN ('owner','admin')`)
  return rows.map((r) => r.email)
}

/** Sends through Brevo (same account and sender as the contact form). Returns false when mail is not configured. */
export async function sendMail(to: string, subject: string, html: string, text: string): Promise<boolean> {
  const key = env('BREVO_API_KEY'), from = env('CONTACT_FROM')
  if (!key || !from) return false
  const [, name = '', addr = from] = from.match(/^"?([^"<]*)"?\s*<([^>]+)>$/) ?? []
  const res = await fetch(`${env('BREVO_API_BASE') || 'https://api.brevo.com/v3'}/smtp/email`, {
    method: 'POST', headers: { 'api-key': key, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ sender: { email: addr.trim(), ...(name.trim() ? { name: name.trim() } : {}) }, to: [{ email: to }], subject, htmlContent: html, textContent: text }),
  })
  if (!res.ok) throw new Error(`brevo send ${res.status}: ${(await res.text()).slice(0, 200)}`)
  return true
}
