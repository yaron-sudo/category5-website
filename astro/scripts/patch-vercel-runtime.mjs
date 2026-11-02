// Post-build fix for the preview (visual-editing) deployment.
// @astrojs/vercel@7 only knows Node 18/20; built under newer Node it falls
// back to "nodejs18.x", which Vercel has discontinued and rejects on deploy.
// Rewrite every function manifest to a runtime Vercel actually supports.
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const RUNTIME = 'nodejs22.x'
const root = new URL('../.vercel/output/functions', import.meta.url).pathname

if (!existsSync(root)) {
  console.log('patch-vercel-runtime: no .vercel/output/functions — static build, nothing to do')
  process.exit(0)
}

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : e.name === '.vc-config.json' ? [join(dir, e.name)] : [],
  )

for (const file of walk(root)) {
  const cfg = JSON.parse(readFileSync(file, 'utf8'))
  if (cfg.runtime?.startsWith('nodejs') && cfg.runtime !== RUNTIME) {
    const old = cfg.runtime
    cfg.runtime = RUNTIME
    writeFileSync(file, JSON.stringify(cfg, null, '\t'))
    console.log(`patch-vercel-runtime: ${file}: ${old} -> ${RUNTIME}`)
  }
}
