// Seed all site content migrated from ethical-supplements.com (WordPress):
//   • 6 product families (category) + 41 products — from
//     migration/out/{categories,products}.local.json (04_extract.py → 05_download_media.py)
//   • homePage (sections), siteSettings (nav, footer, contact, tracking)
//   • pages: contact, faq, community, privacy, terms
//
// Idempotent (stable _ids). Local dataset always; also Sanity when
// SANITY_PROJECT_ID + SANITY_WRITE_TOKEN are set (see lib/sink.mjs).
//   node seed-content.mjs
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { publish, img, block, bullet, key } from './lib/sink.mjs'
try {
  await import('dotenv/config')
} catch {}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const MIG = path.join(__dirname, '..', 'migration', 'out')
const read = (f) => JSON.parse(fs.readFileSync(path.join(MIG, f), 'utf8'))
const cats = read('categories.local.json')
const prods = read('products.local.json')
const brand = read('brand.local.json')
const rawPages = Object.fromEntries(read('raw/pages.json').map((p) => [p.id, p]))
const decode = (s) => s.replace(/&#8211;/g, '–').replace(/&#8217;/g, '’').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'")
const ORANK = (i) => `0|${String(100000 + i * 1000).padStart(6, '0')}:`

// ---------------------------------------------------------------- categories
const CAT_ICON = {
  'liposomal-vitamin-c': '/media/2022/10/Cellinol.webp',
  'immune-system': brand['Immune.svg'],
  'memory-and-cognition': brand['Cogni.svg'],
  'vitamins-and-minerals': brand['Liposomal.svg'],
  'inflammation-and-mobility': brand['Inflammation.svg'],
  'herbs-and-plants': brand['Herbs.svg'],
}
const CAT_TITLE = { 'inflammation-and-mobility': 'דלקת ותנועה' } // nav + home use this name; old page title said "דלקת וכאב"
const catId = (slug) => `category-${slug}`
const catByWp = {}
const categoryDocs = cats
  .sort((a, b) => a.order - b.order)
  .map((c) => {
    catByWp[c.wpId] = c
    const secs = c.sections.filter((s) => s.heading !== 'מוצרים נוספים' && (s.text.length || s.images.length))
    const body = []
    let tagline
    let heroImage
    const seenHeadings = new Set()
    for (const s of secs) {
      if (!s.text.length && s.images.length && !heroImage) { heroImage = s.images[0]; continue }
      if (!tagline && s.text.length && (!s.heading || s.heading === decode(c.title))) { tagline = s.text[0]; s.text.slice(1).forEach((t) => body.push(block(t))); continue }
      if (s.heading && !seenHeadings.has(s.heading) && s.heading !== decode(c.title) && s.text.length) { body.push(block(s.heading, 'h2')); seenHeadings.add(s.heading) }
      s.text.forEach((t) => body.push(t.startsWith('•') ? bullet(t.replace(/^•\s*/, '')) : block(t)))
    }
    return {
      _id: catId(c.slug),
      _type: 'category',
      orderRank: ORANK(c.order),
      title: CAT_TITLE[c.slug] || decode(c.title),
      slug: { _type: 'slug', current: c.slug },
      color: c.color,
      icon: img(CAT_ICON[c.slug]),
      image: img(heroImage),
      tagline,
      body,
    }
  })

// ------------------------------------------------------------------ products
const LEAFLETS = {
  'cellinol-liposomal-vitamin-c': '2024/04/CELLINOL-140-B.pdf', alyvium: '2026/07/Alyivium-B.pdf', winterguard: '2026/07/WinterGaurd.pdf',
  lactoferr: '2024/05/Lactoferr.pdf', 'umanaflora-de111': '2025/12/UmanaFloraDE111.pdf', 'cogni-mg': '2026/07/CogniMg90.pdf',
  amorfolic: '2024/04/Amorfolic.pdf', 'cogni-zzz': '2025/01/Cognizzz.pdf', 'relacton-alpha': '2024/01/Relacton.pdf',
  'lipozamin-fe': '2024/04/Lipozamin-Fe.pdf', 'lipozamin-zn': '2024/04/Lipozamin-Zn.pdf', 'lipozamin-b12-spectrum': '2024/04/Lipozamin-B12.pdf',
  'lipozamin-mg-complex': '2024/04/Lipozamin-Mg.pdf', 'lipozamin-calcium': '2025/02/Lipozamin-Calcium.pdf',
  'lipozamin-mg-spectrum': '2025/06/Lipozamin-Mg-Spectrum-.pdf', 'lipozamin-glutathione': '2025/06/Lipozamin-Glutetion.pdf',
  'lipozamin-q10-spectrum': '2025/06/Lipozamin-Q10.pdf', 'lipozamin-mg-taurate': '2025/06/Lipozamin-Mg-Taurat-.pdf',
  'lipozamin-se': '2026/07/Lipozamin-Se.pdf', 'lipozamin-nicotinamide': '2025/12/Lipozamin-NicotinAmid.pdf',
  'nemadrin-l6': '2024/04/Nemadrin.pdf', 'protesterol-40': '2024/04/Protesterol.pdf', 'revival-20': '2025/03/Revival20.pdf',
  'bio-vera': '2023/11/BioVera.pdf', 'geniflora-c15': '2025/06/GenifloraC15.pdf', 'umanaflora-53': '2025/06/Umanaflora53.pdf',
  'lpldl-probiotic': '2025/06/LPLDL.pdf', 'giallocur-nano-curcumin': '2024/04/Gialocure-Nano-Curcumin.pdf',
  kalnozin: '2026/07/Kalnozin.pdf', 'kalnozim-digestive-enzymes': '2024/07/Kalnozim.pdf',
}
const EXTRA_DOCS = { 'lpldl-probiotic': [{ label: 'מחקר קליני', href: '/wp-content/uploads/2023/05/LPLDL-מחקר-קליני.pdf' }] }
// Newest products (WP page created 2025+) are flagged "חדש" on the home page.
const isNew = (wpId) => (rawPages[wpId]?.date || '') >= '2025-06-01'

function usageFields(lines) {
  let dosage
  const details = []
  const warnings = []
  for (const raw of lines) {
    const l = raw.trim()
    if (!l) continue
    if (/^המלצ(ות|ת) שימוש/.test(l)) { dosage = l.replace(/^המלצ(ות|ת) שימוש[^:]*:\s*/, '').trim() || l; continue }
    const m = l.match(/^([^:]{2,28}):\s*(.+)$/)
    if (m && !/^אזהרה/.test(m[1])) details.push({ _key: key('d'), label: m[1].trim(), value: m[2].trim() })
    else warnings.push(l.replace(/^אזהרה:\s*/, ''))
  }
  return { dosage, details, warnings }
}

const productDocs = prods.map((p, i) => {
  const cat = catByWp[p.categoryWpId]
  const { dosage, details, warnings } = usageFields(p.usage)
  const body = []
  for (const s of p.sections) {
    if (s.heading) body.push(block(s.heading, 'h2'))
    s.text.forEach((t) => body.push(t.startsWith('•') ? bullet(t.replace(/^•\s*/, '')) : block(t)))
    s.images.forEach((src) => body.push(img(src, { alt: s.heading || p.name })))
  }
  if (p.microscope?.image) body.push(img(p.microscope.image, { caption: p.microscope.caption || 'בדיקת מיקרוסקופ אלקטרוני לשלמות ואיכות הליפוזומים במוצר.', alt: 'צילום מיקרוסקופ אלקטרוני' }))
  const images = [
    ...[...new Set(p.images)].map((src) => img(src, { alt: p.name })),
    ...[...new Set(p.labels)].map((src, j) => img(src, { alt: `תווית ${p.name}`, caption: j ? `תווית המוצר (${j + 1})` : 'תווית המוצר' })),
  ]
  const leaflet = LEAFLETS[p.slug] ? `/wp-content/uploads/${LEAFLETS[p.slug]}` : undefined
  return {
    _id: `product-${p.slug}`,
    _type: 'product',
    orderRank: ORANK(i),
    name: decode(p.name),
    slug: { _type: 'slug', current: p.slug },
    category: { _type: 'reference', _ref: catId(cat.slug) },
    isNew: isNew(p.wpId) || undefined,
    tagline: p.tagline || undefined,
    intro: p.intro.join('\n') || undefined,
    benefits: p.benefits,
    keyStats: p.stats.map((s) => ({ _key: key('k'), _type: 'keyStat', value: s.value, label: s.label || '' })),
    badges: p.badges,
    body,
    dosage,
    details,
    warnings,
    images,
    video: p.video ? p.video.replace('/embed/', '/watch?v=') : undefined,
    leaflet,
    extraDocs: EXTRA_DOCS[p.slug],
    legacyPath: decodeURIComponent(rawPages[p.wpId].link.replace('https://www.ethical-supplements.com', '')),
  }
})

// ---------------------------------------------------------------- home page
const homeIntro = 'קטגוריה 5 מציגה את הדור הבא של תוספי התזונה: "תוספים אתיים". החברה יצרה סטנדרט חדש של ייצור ופיתוח תוספי תזונה. שלב תכנון הפורמולה, בחירת החומרים הפעילים והרכבת הנוסחה התומכת נעשים בהתאם לדרישות המטפלים והגופים המקצועיים. המוצרים שלנו מורכבים מחומרים פעילים ייחודיים שנבחרו בקפידה ובשיתוף עם אנשי המקצוע. הבסיס לכל פורמולה הוא חומר גלם שנבדק קלינית, והפורמולה הסופית מציגה מוצר שנותן מענה ממוקד לדרישת הקהל המקצועי.'
const homePage = {
  _id: 'homePage',
  _type: 'homePage',
  title: 'Home page',
  sections: [
    {
      _type: 'heroCarousel', _key: key('h'),
      slides: [{
        _key: key('sl'), image: img(brand['Homepage1.png']), eyebrow: 'Category 5 · Ethical Supplements',
        title: 'פורצים גבולות בעולם תוספי התזונה',
        text: 'הדור הבא של תוספי התזונה: פורמולות שפותחו עם אנשי מקצוע, מחומרי גלם שנבדקו קלינית ובספיגה גבוהה.',
        ctaLabel: 'למשפחות המוצרים', ctaHref: '#families',
      }],
    },
    {
      _type: 'storyDual', _key: key('s'), eyebrow: 'מי אנחנו', title: { _type: 'headingBlock', text: 'קטגוריה 5 תוספים אתיים' },
      text: [block(homeIntro)],
    },
    {
      _type: 'badgeRow', _key: key('b'),
      badges: [
        { _key: key('bd'), text: 'פוליפנולים מזית', icon: img(brand['Olive.svg']) },
        { _key: key('bd'), text: 'לא נוסה על בעלי חיים', icon: img(brand['Asset-14@4x.png']) },
        { _key: key('bd'), text: 'נבדק במיקרוסקופ אלקטרוני', icon: img(brand['Micro.svg']) },
        { _key: key('bd'), text: 'טכנולוגיה ליפוזומלית', icon: img(brand['Lipo.svg']) },
        { _key: key('bd'), text: 'חומרי גלם פטנטיים', icon: img(brand['Logo-Amorfolic_1.svg']) },
        { _key: key('bd'), text: 'ייצור בתקן GMP', icon: img(brand['GMP.svg']) },
      ],
    },
    {
      _type: 'categoryShowcase', _key: key('c'), eyebrow: 'מדדי איכות מובילים',
      title: { _type: 'headingBlock', text: 'משפחות המוצרים' }, showCarousels: true, showNew: true,
    },
    {
      _type: 'ctaBand', _key: key('cta'), title: { _type: 'headingBlock', text: 'יש לכם שאלה על מוצר? שאלו את העוזר החכם שלנו' },
      buttonLabel: 'לתמיכה ומידע', buttonHref: '/faq',
    },
  ],
  seo: {
    _type: 'seo',
    metaTitle: 'קטגוריה 5 תוספים אתיים | Category 5 Ethical Supplements',
    metaDescription: 'קטגוריה 5 – תוספים אתיים: ויטמינים ומינרלים ליפוזומליים, ויטמין C ליפוזומלי, פרוביוטיקה ותוספים לזיכרון, חיסון ותנועה. פורמולות בספיגה גבוהה מחומרי גלם שנבדקו קלינית.',
    ogImage: img(brand['OpenGraph.jpg']),
  },
}

// ------------------------------------------------------------- site settings
const productNav = categoryDocs.map((c) => ({
  _key: key('n'), label: c.title, href: `/category/${c.slug.current}`,
  children: productDocs.filter((p) => p.category._ref === c._id).map((p) => ({ _key: key('nc'), label: p.name, description: p.tagline, href: `/products/${p.slug.current}` })),
}))
const siteSettings = {
  _id: 'siteSettings',
  _type: 'siteSettings',
  brandName: 'קטגוריה 5 תוספים אתיים',
  tagline: 'פורצים גבולות בעולם תוספי התזונה',
  logo: img(brand['ES-LOGO-BLACK-SVG.svg']),
  nav: [
    { _key: key('n'), label: 'מוצרים', href: '/#families', children: productNav.map((c) => ({ _key: key('nc'), label: c.label, href: c.href })) },
    ...productNav,
    { _key: key('n'), label: 'תמיכה ומידע', href: '/faq' },
    { _key: key('n'), label: 'רשימת חנויות', href: '/stores' },
    { _key: key('n'), label: 'קהילה', href: '/community' },
    { _key: key('n'), label: 'צור קשר', href: '/contact' },
  ],
  headerCta: { label: 'היכן לקנות', href: '/stores' },
  contact: { email: 'info@ethical-supplements.com', phone: '053-9325888', whatsapp: '972539325888', hours: 'מענה בווטסאפ (הודעות בלבד) ובמייל' },
  footerColumns: [
    { _key: key('f'), title: 'משפחות מוצרים', links: categoryDocs.map((c) => ({ _key: key('fl'), label: c.title, href: `/category/${c.slug.current}` })) },
    {
      _key: key('f'), title: 'קישורים',
      links: [
        ['דף הבית', '/'], ['תמיכה ומידע', '/faq'], ['רשימת חנויות', '/stores'], ['קהילה', '/community'], ['צור קשר', '/contact'],
        ['חוברת מוצרים', '/catalog'], ['מדיניות פרטיות', '/privacy'], ['תנאי שימוש', '/terms'], ['הצהרת נגישות', '/accessibility'],
      ].map(([label, href]) => ({ _key: key('fl'), label, href })),
    },
  ],
  footerDisclaimer: 'כל המידע באתר זה הוא לצורכי מידע כללי בלבד, ואינו מהווה תחליף לייעוץ, טיפול, אבחון והשגחה של רופא מוסמך. אם יש חשש לבעיה רפואית כלשהי, יש לפנות לרופא המטפל ולפעול לפי הנחיותיו. תוכן הקשור להשלמות תזונתיות לא נבחן ולא אושר על ידי משרד הבריאות. מומלץ להתייעץ עם רופא או מטפל לפני תחילת שימוש בתוספי תזונה. התמונות להמחשה בלבד.',
  tracking: [
    {
      _key: key('t'), label: 'Google Analytics 4', category: 'analytics', enabled: true,
      code: '<script async src="https://www.googletagmanager.com/gtag/js?id=G-KCGS4PLVXG"></script>\n<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag("js",new Date());gtag("config","G-KCGS4PLVXG");</script>',
    },
    {
      _key: key('t'), label: 'Meta Pixel', category: 'marketing', enabled: true,
      code: '<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version="2.0";n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,"script","https://connect.facebook.net/en_US/fbevents.js");fbq("init","1029475088014781");fbq("track","PageView");</script>',
    },
  ],
}

// --------------------------------------------------------------------- pages
// Legal texts from the old site, minus stray citation fragments left in them
// ("Barnea", "Gov.ilassets.kpmg.com", "נבו", "ethical-supplements.com" tails).
const CITES = /\s*(Barnea|Gov\.il|assets\.kpmg\.com|נבו)\b\.?/g
function legalBlocks(wpId) {
  const html = rawPages[wpId].content.rendered
  const text = html
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/g, '')
    .replace(/<br\s*\/?>/g, '\n').replace(/<\/(p|h\d|li|div)>/g, '\n').replace(/<li[^>]*>/g, '• ')
    .replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ')
  const lines = decode(text).split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).filter(Boolean)
  const out = []
  for (const l of lines.slice(2)) { // skip page heading + duplicate title line
    const clean = l.replace(CITES, '').replace(/\s+ethical-supplements\.com\.$/, '.').replace(/\s+\./g, '.').replace(/לידידים/, 'משתמשים').replace(/אם טרדת שברצונך/, 'אם ברצונך')
    if (/^\d+\.\s/.test(clean)) out.push(block(clean.replace(/^\d+\.\s*/, ''), 'h2'))
    else if (/^[•o]\s/.test(clean)) out.push(bullet(clean.replace(/^[•o]\s*/, '')))
    else out.push(block(clean))
  }
  return out
}
const page = (slug, title, body, seo) => ({ _id: `page-${slug}`, _type: 'page', title, slug: { _type: 'slug', current: slug }, body, seo: seo && { _type: 'seo', ...seo } })
const pages = [
  page('privacy', 'מדיניות פרטיות', legalBlocks(9250), { metaTitle: 'מדיניות פרטיות | קטגוריה 5 תוספים אתיים' }),
  page('terms', 'תנאי שימוש', legalBlocks(9259), { metaTitle: 'תנאי שימוש | קטגוריה 5 תוספים אתיים' }),
  page('contact', 'יצירת קשר', [
    block('אנא צרו עימנו קשר בכל שאלה או בעיה. נשמח לענות באמצעות הדואר האלקטרוני במהירות וביעילות.'),
    block('ניתן למלא את הטופס, לשלוח מייל לכתובת info@ethical-supplements.com, או לשלוח הודעת ווטסאפ (הודעות בלבד) למספר 053-9325888.'),
  ], { metaTitle: 'צור קשר | קטגוריה 5 תוספים אתיים', metaDescription: 'יצירת קשר עם קטגוריה 5 תוספים אתיים: טופס פנייה, מייל info@ethical-supplements.com או ווטסאפ 053-9325888.' }),
  page('faq', 'תמיכה ומידע', [
    block('שאלו כל שאלה על המוצרים שלנו: רכיבים, אופן שימוש, כשרות, התאמה ועוד. העוזר החכם עונה קודם כול על בסיס המידע שבאתר, ומשלים ממקורות מהימנים ברשת כשצריך.'),
  ], { metaTitle: 'תמיכה ומידע – שאלות ותשובות על המוצרים | קטגוריה 5', metaDescription: 'עוזר חכם לשאלות ותשובות על מוצרי קטגוריה 5 תוספים אתיים: רכיבים, מינון, כשרות, התאמה ועוד.' }),
  page('community', 'הקהילה שלנו', [
    block('הצטרפו לקהילה של קטגוריה 5 באינסטגרם: טיפים, מידע מקצועי, חדשות על מוצרים והצצה אל מאחורי הקלעים.'),
  ], { metaTitle: 'קהילה | קטגוריה 5 תוספים אתיים' }),
]

await publish('content', [...categoryDocs, ...productDocs, homePage, siteSettings, ...pages], {
  stale: '_type in ["category", "product"]',
})
console.log(`✓ ${categoryDocs.length} categories, ${productDocs.length} products (${productDocs.filter((p) => p.leaflet).length} with leaflet PDF, ${productDocs.filter((p) => p.isNew).length} new), home, settings, ${pages.length} pages`)
