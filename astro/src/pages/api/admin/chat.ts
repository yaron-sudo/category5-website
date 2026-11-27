// POST /api/admin/chat — review of chat turns and the approved-answers list.
//   action=review         id, value (good|bad|clear), note?            owner, admin
//   action=answer.save    id?, question, answer, source?, approve?     owner, admin (only an owner approves)
//   action=answer.approve id                                           owner
//   action=answer.draft   id   (take back to draft)                    owner
//   action=answer.delete  id                                           owner (an admin: own drafts only)
//   action=turn.delete    id                                           owner
import type { APIRoute } from 'astro'
import { audit, can } from '@/admin/auth'
import { q } from '@/admin/db'
import { clearAnswersCache } from '@/admin/chat'

export const prerender = false
const safe = (n: unknown, d: string) => (typeof n === 'string' && /^\/admin\/chat(\/[\w-]*)?(\?[\w=&%-]*)?$/.test(n) ? n : d)
const go = (to: string, code: string) => new Response(null, { status: 303, headers: { Location: `${to}${to.includes('?') ? '&' : '?'}${code}` } })

export const POST: APIRoute = async ({ request, locals }) => {
  const me = locals.admin!
  const f = await request.formData()
  const action = String(f.get('action') ?? '')
  const next = safe(f.get('next'), '/admin/chat')
  if (!can(me.role, 'chat.read') || !can(me.role, 'content.write')) return go(next, 'e=forbidden')
  const id = Number(f.get('id'))
  const hasId = Number.isInteger(id) && id > 0
  const text = (k: string, max: number) => String(f.get(k) ?? '').trim().slice(0, max)

  if (action === 'review' && hasId) {
    const v = text('value', 5)
    const value = v === 'good' || v === 'bad' ? v : null
    await q('UPDATE chat_turns SET review=$2, note=$3, reviewed_by=$4, reviewed_at=now() WHERE id=$1', [id, value, text('note', 1000) || null, me.email])
    await audit(me.email, 'chat.review', String(id), { value })
    return go(next, 'ok=review')
  }
  if (action === 'answer.save') {
    const question = text('question', 500), answer = text('answer', 3000)
    if (question.length < 3 || answer.length < 3) return go(next, 'e=empty')
    const approve = f.get('approve') === '1' && can(me.role, 'chat.approve')
    const source = Number(f.get('source')) || null
    if (hasId) {
      const cur = (await q<{ status: string }>('SELECT status FROM chat_answers WHERE id=$1', [id]))[0]
      if (!cur) return go(next, 'e=missing')
      const status = approve ? 'approved' : can(me.role, 'chat.approve') ? cur.status : 'draft'
      await q('UPDATE chat_answers SET question=$2, answer=$3, status=$4, approved_by=CASE WHEN $4=\'approved\' THEN $5 ELSE NULL END, updated_at=now() WHERE id=$1', [id, question, answer, status, me.email])
      await audit(me.email, 'answer.edit', String(id), { status })
    } else {
      const r = await q<{ id: string }>(`INSERT INTO chat_answers (question, answer, status, source_turn, created_by, approved_by) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`, [question, answer, approve ? 'approved' : 'draft', source, me.email, approve ? me.email : null])
      await audit(me.email, 'answer.add', r[0].id, { status: approve ? 'approved' : 'draft' })
    }
    clearAnswersCache()
    return go('/admin/chat/answers', approve ? 'ok=approved' : 'ok=saved')
  }
  if (action === 'answer.approve' && hasId && can(me.role, 'chat.approve')) {
    await q(`UPDATE chat_answers SET status='approved', approved_by=$2, updated_at=now() WHERE id=$1`, [id, me.email]); clearAnswersCache()
    await audit(me.email, 'answer.approve', String(id)); return go(next, 'ok=approved')
  }
  if (action === 'answer.draft' && hasId && can(me.role, 'chat.approve')) {
    await q(`UPDATE chat_answers SET status='draft', approved_by=NULL, updated_at=now() WHERE id=$1`, [id]); clearAnswersCache()
    await audit(me.email, 'answer.draft', String(id)); return go(next, 'ok=draft')
  }
  if (action === 'answer.delete' && hasId) {
    const cur = (await q<{ status: string; created_by: string }>('SELECT status, created_by FROM chat_answers WHERE id=$1', [id]))[0]
    if (!cur) return go(next, 'e=missing')
    if (!can(me.role, 'chat.approve') && (cur.status !== 'draft' || cur.created_by !== me.email)) return go(next, 'e=forbidden')
    await q('DELETE FROM chat_answers WHERE id=$1', [id]); clearAnswersCache()
    await audit(me.email, 'answer.delete', String(id)); return go(next, 'ok=deleted')
  }
  if (action === 'turn.delete' && hasId && can(me.role, 'chat.approve')) {
    await q('DELETE FROM chat_turns WHERE id=$1', [id])
    await audit(me.email, 'chat.delete', String(id)); return go('/admin/chat', 'ok=deleted')
  }
  return go(next, 'e=action')
}
