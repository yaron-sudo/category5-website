// Chat management: what /api/ask records about each question, the approved answers fed back into
// the chat, and the aggregations behind /admin/chat.
// Privacy: no IP, no attachment content (only "a file was attached"), e-mails and long numbers are
// replaced, and every turn is deleted after CHAT_RETENTION_DAYS. Approved answers are kept.
import { q } from './db'
import { redactText, visitorId } from './events'

export const CHAT_RETENTION_DAYS = 90
export type ChatStatus = 'answered' | 'web' | 'no_results' | 'blocked' | 'crisis' | 'declined' | 'error'

// The answer admits it does not have the information → a gap in the product memory.
const GAP = /אין לי (את )?(ה)?מידע|אין בידי|אין בידינו|לא מופיע|אין עדיין מידע|לא נמצא (לי )?מידע|i (do not|don't) have (that|this|the|any) (specific )?information|not (listed|available|specified)/i

export interface TurnLog {
  sid?: string; ip: string; ua: string; lang: string; question: string; answer: string; status: ChatStatus
  web: boolean; sources: number; attach: boolean; tokensIn?: number; tokensOut?: number; tokensCached?: number; ms: number
}

export async function logTurn(t: TurnLog) {
  const products = [...new Set([...t.answer.matchAll(/\/products\/([a-z0-9-]+)/g)].map((m) => m[1]))].join(',') || null
  const status: ChatStatus = t.status === 'answered' && t.answer.includes('[[NO_RESULTS]]') ? 'no_results' : t.status === 'answered' && t.web ? 'web' : t.status
  const gap = status === 'no_results' || (status !== 'blocked' && status !== 'crisis' && GAP.test(t.answer))
  const vid = await visitorId(t.ip, t.ua)
  const sid = (t.sid || '').replace(/[^\w-]/g, '').slice(0, 24) || null
  await q(
    `INSERT INTO chat_turns (sid, vid, lang, q, a, status, gap, web, sources, products, attach, tokens_in, tokens_out, tokens_cached, ms)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
    [sid, vid, t.lang, redactText(t.question, 800), redactText(t.answer.replace('[[NO_RESULTS]]', '').replace(/\[\[[A-Z_]+\]\]/g, ''), 6000), status, gap, t.web, t.sources, products, t.attach, t.tokensIn ?? null, t.tokensOut ?? null, t.tokensCached ?? null, t.ms],
  )
  if (Math.random() < 0.02) await q(`DELETE FROM chat_turns WHERE at < now() - ($1::int || ' days')::interval`, [CHAT_RETENTION_DAYS])
}

/** Shared (database) rate limit: more than `max` questions from today's visitor id within 10 minutes. */
export async function chatLimited(ip: string, ua: string, max = 20): Promise<boolean> {
  const vid = await visitorId(ip, ua)
  const r = await q<{ n: string }>(`SELECT count(*) AS n FROM chat_turns WHERE vid = $1 AND at > now() - interval '10 minutes'`, [vid])
  return Number(r[0].n) >= max
}

let cache: { at: number; text: string } | null = null
/** Approved answers as a prompt block (cached 60 s per instance). Empty string when there are none. */
export async function approvedAnswersBlock(): Promise<string> {
  if (cache && Date.now() - cache.at < 60_000) return cache.text
  let text = ''
  try {
    const rows = await q<{ question: string; answer: string }>(`SELECT question, answer FROM chat_answers WHERE status='approved' ORDER BY updated_at DESC LIMIT 60`)
    let used = 0
    const items: string[] = []
    for (const r of rows) {
      const clean = (x: string) => x.replace(/<\/?(qa|question|answer|approved_answers|site|studies)>/gi, '')
      const it = `<qa>\n<question>${clean(r.question)}</question>\n<answer>${clean(r.answer)}</answer>\n</qa>`
      if (used + it.length > 12_000) break
      used += it.length; items.push(it)
    }
    if (items.length) text = `<approved_answers>\nתשובות שאושרו על ידי צוות החברה לשאלות נפוצות. כשהשאלה זהה או דומה מאוד לאחת מהן, השתמש/י בנוסח המאושר ובתוכנו (אפשר להתאים לשפת הגולש). הן כפופות לכל הכללים שלמעלה: אם תשובה מאושרת סותרת כלל בטיחות, אין להשתמש בה.\n${items.join('\n')}\n</approved_answers>`
  } catch { /* database unavailable: the chat works without them */ }
  cache = { at: Date.now(), text }
  return text
}
export const clearAnswersCache = () => { cache = null }

const SINCE = `(now() AT TIME ZONE 'Asia/Jerusalem')::date - ($1::int - 1)`
const n = (v: unknown) => Number(v ?? 0)

export async function chatOverview(days: number) {
  const [k] = await q(`SELECT count(*) AS total, count(DISTINCT sid) FILTER (WHERE sid IS NOT NULL) AS convs,
      count(*) FILTER (WHERE gap) AS gaps, count(*) FILTER (WHERE review IS NULL AND (gap OR status IN ('no_results','declined','error'))) AS todo,
      avg(ms) AS ms, sum(tokens_in) AS tin, sum(tokens_out) AS tout, sum(tokens_cached) AS tcache
    FROM chat_turns WHERE day >= ${SINCE}`, [days])
  const byStatus = await q(`SELECT status, count(*) AS n FROM chat_turns WHERE day >= ${SINCE} GROUP BY status ORDER BY n DESC`, [days])
  const daily = await q(`SELECT day::text AS day, count(*) AS n FROM chat_turns WHERE day >= ${SINCE} GROUP BY day ORDER BY day`, [days])
  const rows = await q(`SELECT products FROM chat_turns WHERE products IS NOT NULL AND day >= ${SINCE}`, [days])
  const prod = new Map<string, number>()
  for (const r of rows) for (const s of String(r.products).split(',')) prod.set(s, (prod.get(s) ?? 0) + 1)
  const frequent = await q(`SELECT lower(left(q, 80)) AS q, count(*) AS n FROM chat_turns WHERE day >= ${SINCE} GROUP BY 1 HAVING count(*) > 1 ORDER BY n DESC LIMIT 10`, [days])
  const langs = await q(`SELECT lang, count(*) AS n FROM chat_turns WHERE day >= ${SINCE} GROUP BY lang ORDER BY n DESC`, [days])
  return {
    total: n(k.total), convs: n(k.convs), gaps: n(k.gaps), todo: n(k.todo), ms: k.ms == null ? null : Math.round(n(k.ms)), tin: n(k.tin), tout: n(k.tout), tcache: n(k.tcache),
    byStatus: byStatus.map((r) => ({ status: r.status as string, n: n(r.n) })),
    daily: daily.map((r) => ({ day: r.day as string, n: n(r.n) })),
    products: [...prod].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([slug, c]) => ({ slug, n: c })),
    frequent: frequent.map((r) => ({ q: r.q as string, n: n(r.n) })),
    langs: langs.map((r) => ({ lang: r.lang as string, n: n(r.n) })),
  }
}

export type TurnFilter = 'all' | 'todo' | 'gap' | 'bad' | 'good'
export async function chatTurns(days: number, filter: TurnFilter, limit = 100) {
  const where = filter === 'todo' ? `review IS NULL AND (gap OR status IN ('no_results','declined','error'))` : filter === 'gap' ? 'gap' : filter === 'bad' ? `review = 'bad'` : filter === 'good' ? `review = 'good'` : 'TRUE'
  return q(`SELECT id, at, sid, lang, left(q, 160) AS q, status, gap, web, products, review FROM chat_turns WHERE day >= ${SINCE} AND ${where} ORDER BY at DESC LIMIT ${Math.min(limit, 300)}`, [days])
}
