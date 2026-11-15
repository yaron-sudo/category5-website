// Search checks (client brief §7): run after `npm run build`.
//   node scripts/search-test.mjs
// Each case: query → a product/article id that must appear in the top results of its column.
import { readFileSync } from 'node:fs'
import { buildIndex, search, didYouMean, unfold } from '../src/c5/search/engine.js'

const data = JSON.parse(readFileSync(new URL('../.vercel/output/static/search-index.json', import.meta.url), 'utf8'))
const index = buildIndex(data.docs, data.synonyms)
const CASES = [
  // exact product names
  ['ליפוזמין Fe', 'product', 'lipozamin-fe'], ['קוגני zzz', 'product', 'cogni-zzz'], ['Fibrogen', 'product', 'fibrogen'], ['ביו ורה', 'product', 'bio-vera'],
  // ingredient names
  ['מגנזיום', 'product', 'lipozamin-mg-spectrum'], ['ויטמין C', 'product', 'cellinol-liposomal-vitamin-c'], ['קוורצטין', 'article', 'quercetin'], ['אשווגנדה', 'article', 'ashwagandha'],
  // health needs / everyday language
  ['קשה לי להירדם', 'product', 'cogni-zzz'], ['אין לי אנרגיה', 'product', 'lipozamin-b12-spectrum'], ['שרירים תפוסים', 'product', 'lipozamin-mg-spectrum'],
  ['גיל המעבר', 'product', 'revival'], ['בטן נפוחה', 'product', 'kalnozim-digestive-enzymes'], ['קשה לי להתרכז', 'product', 'cogni-mg'],
  ['הצטננות בחורף', 'product', 'winterguard'], ['ברזל לנשים', 'product', 'lipozamin-fe'], ['שינה', 'article', 'magnesium-bisglycinate'],
  // typos
  ['מגנזיון', 'product', 'lipozamin-mg-spectrum'], ['פרוביוטיקא', 'product', 'umanaflora-53'], ['ליפוזומין', 'product', 'lipozamin-fe'],
  // words not in the product name
  ['אנזימי עיכול', 'product', 'kalnozim-digestive-enzymes'], ['זעפרן', 'article', 'saffron-affron'], ['חומצה פולית', 'product', 'amorfolic'],
]
let fail = 0
for (const [q, kind, want] of CASES) {
  const r = search(index, q)
  const ids = r.results.filter((x) => x.doc.kind === kind).slice(0, 5).map((x) => x.doc.id)
  const ok = ids.includes(want)
  if (!ok) fail++
  console.log(`${ok ? 'OK ' : 'FAIL'} ${q.padEnd(22)} → ${ids.slice(0, 4).join(', ')}${r.unmatched.length ? `  | unmatched: ${r.unmatched.join(' ')} → ${r.results.length < 3 ? unfold(didYouMean(index, q, r.unmatched) ?? '-') : '(results exist, no correction)'}` : ''}`)
}
console.log(fail ? `${fail} failing` : 'all passed')
process.exit(fail ? 1 : 0)
