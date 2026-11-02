// 02_inventory.mjs — builds the URL/page inventory of the old WordPress site
// from migration/out/raw/pages.json (run 01_fetch_content.mjs first).
// Output: migration/out/inventory.csv + inventory.json. This is also the
// source list for the future redirect map.
import { readFile, writeFile } from 'node:fs/promises';

const ORIGIN = 'https://www.ethical-supplements.com';
const pages = JSON.parse(await readFile('migration/out/raw/pages.json', 'utf8'));
const byId = new Map(pages.map((p) => [p.id, p]));

const decode = (s) => s.replace(/&#8211;/g, '–').replace(/&#8217;/g, '’').replace(/&amp;/g, '&').replace(/&quot;/g, '"');

// Category landing pages (product families) by WP id.
const CATEGORIES = new Set([2066, 2527, 2845, 3002, 3189, 3256]);
const KIND_BY_ID = {
  4920: 'home', 2676: 'contact', 4686: 'stores', 8561: 'faq-chatbot',
  9250: 'legal', 9259: 'legal', 7371: 'catalog-flipbook',
  3388: 'junk', 3462: 'junk', 8064: 'search',
};

const rows = pages.map((p) => {
  const path = decodeURIComponent(p.link.replace(ORIGIN, ''));
  const html = p.content?.rendered ?? '';
  let kind = KIND_BY_ID[p.id];
  if (!kind) kind = CATEGORIES.has(p.id) ? 'category' : CATEGORIES.has(p.parent) ? 'product' : 'other';
  const parent = byId.get(p.parent);
  return {
    id: p.id,
    kind,
    title: decode(p.title.rendered),
    path,
    encodedPath: p.link.replace(ORIGIN, ''),
    category: kind === 'product' ? decode(parent?.title.rendered ?? '') : '',
    modified: p.modified,
    imgs: (html.match(/<img/g) || []).length,
    pdfs: (html.match(/\.pdf/g) || []).length,
    glb: (html.match(/3d_viewer|\.glb/g) || []).length,
    storepoint: html.includes('storepoint'),
  };
});

const order = ['home', 'category', 'product', 'contact', 'stores', 'faq-chatbot', 'catalog-flipbook', 'legal', 'search', 'junk', 'other'];
rows.sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind) || a.category.localeCompare(b.category, 'he') || a.path.localeCompare(b.path, 'he'));

const cols = Object.keys(rows[0]);
const csv = [cols.join(','), ...rows.map((r) => cols.map((c) => `"${String(r[c]).replace(/"/g, '""')}"`).join(','))].join('\n');
await writeFile('migration/out/inventory.csv', '﻿' + csv + '\n');
await writeFile('migration/out/inventory.json', JSON.stringify(rows, null, 2));
const counts = rows.reduce((m, r) => ((m[r.kind] = (m[r.kind] || 0) + 1), m), {});
console.log(counts);
