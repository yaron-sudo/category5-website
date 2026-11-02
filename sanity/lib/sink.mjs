// Where seed scripts publish documents.
//
// Every seed calls publish(group, docs). Always:
//   • writes sanity/data/<group>.json and rebuilds astro/content/dataset.json
//     (all groups merged). The Astro site reads that file when no Sanity
//     project is configured (SANITY_PROJECT_ID unset), so the whole site
//     builds and runs from the migrated content before Sanity exists.
// Additionally, when SANITY_PROJECT_ID + SANITY_WRITE_TOKEN are set:
//   • uploads local images (asset._ref "local:/media/…" → files under
//     astro/public) once, swapping in real Sanity asset refs, and
//   • createOrReplace()s every doc, deleting docs of the group's `stale`
//     query that are no longer produced.
// Idempotent: stable _ids, re-running replaces in place.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..', '..')
const DATA = path.join(ROOT, 'sanity', 'data')
const PUBLIC = path.join(ROOT, 'astro', 'public')
const DATASET = path.join(ROOT, 'astro', 'content', 'dataset.json')
const UPLOADS = path.join(DATA, '.uploaded-assets.json') // local path → Sanity asset id

export const live = Boolean(process.env.SANITY_PROJECT_ID && process.env.SANITY_WRITE_TOKEN)

let k = 0
export const key = (p = 'k') => `${p}${(k++).toString(36)}`
export const img = (src, extra = {}) => (src ? { _type: 'image', _key: key('i'), asset: { _type: 'reference', _ref: `local:${src}` }, ...extra } : undefined)
export const span = (text, marks = []) => ({ _type: 'span', _key: key('s'), text, marks })
export const block = (text, style = 'normal', extra = {}) => ({ _type: 'block', _key: key('b'), style, markDefs: [], children: [span(text)], ...extra })
export const bullet = (text) => block(text, 'normal', { listItem: 'bullet', level: 1 })

function rebuildDataset() {
  const docs = []
  for (const f of fs.readdirSync(DATA).filter((f) => f.endsWith('.json') && !f.startsWith('.')).sort()) {
    docs.push(...JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8')))
  }
  fs.mkdirSync(path.dirname(DATASET), { recursive: true })
  fs.writeFileSync(DATASET, JSON.stringify(docs))
  return docs.length
}

async function uploadImages(client, docs) {
  const done = fs.existsSync(UPLOADS) ? JSON.parse(fs.readFileSync(UPLOADS, 'utf8')) : {}
  const refs = new Set()
  JSON.stringify(docs, (k2, v) => { if (k2 === '_ref' && typeof v === 'string' && v.startsWith('local:')) refs.add(v.slice(6)); return v })
  for (const src of refs) {
    if (done[src]) continue
    const file = path.join(PUBLIC, decodeURIComponent(src))
    const asset = await client.assets.upload('image', fs.createReadStream(file), { filename: path.basename(file) })
    done[src] = asset._id
    fs.writeFileSync(UPLOADS, JSON.stringify(done, null, 1))
    console.log(`  ↑ ${src}`)
  }
  return JSON.parse(JSON.stringify(docs), (k2, v) => (k2 === '_ref' && typeof v === 'string' && v.startsWith('local:') ? done[v.slice(6)] : v))
}

/** @param {string} group  @param {object[]} docs  @param {{stale?: string}} opts GROQ selecting this group's docs (for deletions) */
export async function publish(group, docs, opts = {}) {
  fs.mkdirSync(DATA, { recursive: true })
  fs.writeFileSync(path.join(DATA, `${group}.json`), JSON.stringify(docs, null, 1))
  const total = rebuildDataset()
  console.log(`• ${group}: ${docs.length} docs → sanity/data/${group}.json (local dataset: ${total} docs)`)
  if (!live) return
  const { getWriteClient } = await import('./client.mjs')
  const client = getWriteClient()
  const ready = await uploadImages(client, docs)
  for (let i = 0; i < ready.length; i += 50) {
    const tx = client.transaction()
    ready.slice(i, i + 50).forEach((d) => tx.createOrReplace(d))
    await tx.commit()
  }
  if (opts.stale) {
    const stale = await client.fetch(`*[${opts.stale} && !(_id in $ids)]._id`, { ids: docs.map((d) => d._id) })
    for (let i = 0; i < stale.length; i += 100) {
      const tx = client.transaction()
      stale.slice(i, i + 100).forEach((id) => tx.delete(id))
      await tx.commit()
    }
    if (stale.length) console.log(`  deleted ${stale.length} stale`)
  }
  console.log(`  ✓ pushed to Sanity (${process.env.SANITY_PROJECT_ID})`)
}
