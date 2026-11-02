// 01_fetch_content.mjs — Phase 1 step 1
// Fetches all WordPress pages + posts with full rendered content (+ _embed),
// saves raw JSON to migration/out/raw/. Idempotent: overwrites cleanly each run.
import { writeFile, mkdir } from 'node:fs/promises';

const BASE = process.env.WP_BASE ?? 'https://www.ethical-supplements.com/wp-json/wp/v2';
const TYPES = ['pages', 'posts'];

await mkdir('migration/out/raw', { recursive: true });

for (const type of TYPES) {
  let page = 1;
  const all = [];
  while (true) {
    const url = `${BASE}/${type}?per_page=50&page=${page}&_embed`;
    let res;
    try {
      res = await fetch(url);
    } catch (e) {
      console.error(`NETWORK FAIL ${type} p${page}: ${e.message}`);
      break;
    }
    // WP returns 400 ("rest_post_invalid_page_number") once you page past the end.
    if (res.status === 400) break;
    if (!res.ok) {
      console.error(`FAIL ${type} p${page}: HTTP ${res.status} — ${await res.text()}`);
      break;
    }
    const batch = await res.json();
    if (!Array.isArray(batch) || batch.length === 0) break;
    all.push(...batch);
    console.log(`${type} page ${page}: +${batch.length} (total ${all.length})`);
    page++;
  }
  await writeFile(`migration/out/raw/${type}.json`, JSON.stringify(all, null, 2));
  console.log(`wrote migration/out/raw/${type}.json (${all.length} items)`);
}
console.log('done');
