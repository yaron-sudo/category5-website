// 03_media_index.mjs — full WP media library index → migration/out/raw/media.json
import { writeFile, mkdir } from 'node:fs/promises';
const BASE = process.env.WP_BASE ?? 'https://www.ethical-supplements.com/wp-json/wp/v2';
await mkdir('migration/out/raw', { recursive: true });
const all = [];
for (let page = 1; ; page++) {
  const res = await fetch(`${BASE}/media?per_page=100&page=${page}&_fields=id,date,slug,title,source_url,mime_type,alt_text,post,media_details`);
  if (res.status === 400) break;
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const batch = await res.json();
  if (!batch.length) break;
  all.push(...batch);
}
await writeFile('migration/out/raw/media.json', JSON.stringify(all, null, 2));
const by = all.reduce((m, x) => ((m[x.mime_type] = (m[x.mime_type] || 0) + 1), m), {});
console.log(all.length, by);
