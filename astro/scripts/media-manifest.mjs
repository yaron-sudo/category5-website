// Lists the files under public/media (the old site's uploads, same relative paths as
// /wp-content/uploads/…) into src/c5/content/media-manifest.json, so the server fallback
// (src/pages/[...path].astro) can 301 an old image URL to /media/… only when the file exists
// and answer 410 otherwise. Runs before every build (npm "prebuild"); commit the result too.
import { readdirSync, statSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const dir = join(root, 'public', 'media')
const out = join(root, 'src', 'c5', 'content', 'media-manifest.json')
const files = []
const walk = (d) => { for (const n of readdirSync(d)) { const p = join(d, n); statSync(p).isDirectory() ? walk(p) : files.push('/' + relative(dir, p).split('\\').join('/')) } }
try { walk(dir) } catch { /* no media folder: empty manifest */ }
files.sort()
writeFileSync(out, JSON.stringify(files) + '\n')
console.log(`media-manifest: ${files.length} files`)
