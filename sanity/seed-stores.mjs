// Seed the store locator (/stores) from the client's store list.
//
// Source: sanity/assets/stores/stores-geocoded.json — "Stores_Locations.xlsx"
// (Storepoint export, 515 points of sale) → stores-export.csv → geocoded by
// geocode-stores.mjs. Rows whose address could not be geocoded exactly carry
// precision "city" and are marked `approximate` (pinned at the city centre).
//
// Writes one `store` document per row (_id store-<id>) and page-stores.
// Idempotent. Local dataset always; Sanity too when SANITY_WRITE_TOKEN is set.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { publish, block } from './lib/sink.mjs'
try {
  await import('dotenv/config')
} catch {}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rows = JSON.parse(fs.readFileSync(path.join(__dirname, 'assets', 'stores', 'stores-geocoded.json'), 'utf8'))
  .filter((r) => r.name)

const CATEGORY = { 'בתי טבע': 'health', 'סופר-פארם': 'super-pharm', 'ניצת הדובדבן': 'nitzat', 'B&D': 'bd', 'אתר אינטרנט': 'online' }
const REGION_BY_AREA = {
  'מחוז הצפון': 'north', 'North District': 'north',
  'מחוז חיפה': 'haifa', 'Haifa District': 'haifa',
  'מחוז המרכז': 'center', 'Center District': 'center',
  'מחוז תל אביב': 'tel-aviv', 'Tel Aviv District': 'tel-aviv',
  'מחוז ירושלים': 'jerusalem', 'Jerusalem District': 'jerusalem',
  'מחוז הדרום': 'south', 'South District': 'south',
}
// Fallback for rows the geocoder left without a district (settlements etc.).
function regionFromLatLng(lat, lng) {
  if (lat >= 32.62) return lat <= 32.95 && lng <= 35.12 ? 'haifa' : 'north'
  if (lat >= 32.0) return lng >= 34.74 && lng <= 34.9 && lat <= 32.17 ? 'tel-aviv' : 'center'
  if (lat >= 31.6 && lng >= 35.0) return 'jerusalem'
  if (lat >= 31.6) return 'center'
  return 'south'
}

const clean = (s) => (s || '').replace(/\s+/g, ' ').trim()
// Geocoder locality (mostly English) → Hebrew, used only when the address has no usable city segment.
const CITY_HE = {
  Jerusalem: 'ירושלים', 'Tel Aviv-Yafo': 'תל אביב', Haifa: 'חיפה', 'Petah Tikva': 'פתח תקווה', 'Rishon LeTsiyon': 'ראשון לציון',
  Rehovot: 'רחובות', Herzliya: 'הרצליה', 'Kefar Sava': 'כפר סבא', 'Ramat Gan': 'רמת גן', Holon: 'חולון', Ashdod: 'אשדוד',
  "Modi'in-Makkabbim-Re'ut": 'מודיעין', "Giv'atayim": 'גבעתיים', Netanya: 'נתניה', 'Pardes Hanna-Karkur': 'פרדס חנה-כרכור',
  'Bat Yam': 'בת ים', "Be'er Sheva": 'באר שבע', Afula: 'עפולה', "Ra'anana": 'רעננה', 'Hod Hasharon': 'הוד השרון',
  'Bet Shemesh': 'בית שמש', 'Bnei Brak': 'בני ברק', Karmiel: 'כרמיאל', Nahariyya: 'נהריה', Ashkelon: 'אשקלון', Yavne: 'יבנה',
  Hadera: 'חדרה', "Ma'alot-Tarshiha": 'מעלות', Sapir: 'ספיר', 'Kiryat Bialik': 'קריית ביאליק', 'Kiryat Ono': 'קריית אונו',
  "Modi'in Ilit": 'מודיעין עילית', 'Ramat Hasharon': 'רמת השרון', Eilat: 'אילת', Tiberias: 'טבריה', Safed: 'צפת', Dimona: 'דימונה',
  Arad: 'ערד', Lod: 'לוד', Ramla: 'רמלה', 'Kiryat Gat': 'קריית גת', 'Kiryat Motzkin': 'קריית מוצקין', 'Kiryat Ata': 'קריית אתא',
  'Kiryat Yam': 'קריית ים', Nesher: 'נשר', 'Or Yehuda': 'אור יהודה', Yehud: 'יהוד-מונוסון', 'Rosh Haayin': 'ראש העין',
  'Ness Ziona': 'נס ציונה', Gedera: 'גדרה', 'Kfar Yona': 'כפר יונה', 'Even Yehuda': 'אבן יהודה', Sderot: 'שדרות', Ofakim: 'אופקים',
  Netivot: 'נתיבות', 'Beit Shean': 'בית שאן', 'Migdal HaEmek': 'מגדל העמק', Nazareth: 'נצרת', 'Nof HaGalil': 'נוף הגליל',
  Akko: 'עכו', 'Tirat Carmel': 'טירת כרמל', "Zikhron Ya'akov": 'זכרון יעקב', Binyamina: 'בנימינה', Caesarea: 'קיסריה',
  "Giv'at Shmuel": 'גבעת שמואל', 'Kochav Yair': 'כוכב יאיר', Shoham: 'שוהם', 'Mevaseret Zion': 'מבשרת ציון', "Ma'ale Adumim": 'מעלה אדומים',
  'Beitar Illit': 'ביתר עילית', 'Efrat': 'אפרת', Ariel: 'אריאל', "El'ad": 'אלעד', 'Kfar Kanna': 'כפר כנא', 'Umm al-Fahm': 'אום אל-פחם',
  Tayibe: 'טייבה', Tira: 'טירה', 'Kafr Qasim': 'כפר קאסם', Sakhnin: 'סחנין', Shefa: 'שפרעם', "Shefa-'Amr": 'שפרעם',
}
// Normalise common alternative spellings of city names.
const CITY_FIX = { 'ירושליים': 'ירושלים', 'פתח תקוה': 'פתח תקווה', 'פ"ת': 'פתח תקווה', 'ת"א': 'תל אביב', 'תל-אביב': 'תל אביב', 'תל אביב יפו': 'תל אביב',
  'ראשל"צ': 'ראשון לציון', 'מודיעין מכבים רעות': 'מודיעין', 'מודיעין עלית': 'מודיעין עילית', 'ביתר עלית': 'ביתר עילית', 'קרית אונו': 'קריית אונו',
  'קרית ביאליק': 'קריית ביאליק', 'קרית מוצקין': 'קריית מוצקין', 'קרית אתא': 'קריית אתא', 'קרית ים': 'קריית ים', 'קרית גת': 'קריית גת',
  'קרית טבעון': 'קריית טבעון', 'קרית מלאכי': 'קריית מלאכי', 'קרית שמונה': 'קריית שמונה', 'יהוד מונוסון': 'יהוד-מונוסון', 'יהוד': 'יהוד-מונוסון',
  'פרדס חנה': 'פרדס חנה-כרכור', 'כרכור': 'פרדס חנה-כרכור', 'באר-שבע': 'באר שבע', 'נוה מונוסון': 'יהוד-מונוסון' }
// A segment is a city only if it has no digits and none of the mall / junction / industrial-zone words.
const NOT_CITY = /\d|ביג|מתחם|קניון|צומת|מרכז מסחרי|מרכז קניות|אזור תעשי|א\.ת|א"ת|רחוב|^רח'|^שד|סניף|חנות|קומה|פארק|מול |^ליד|כביש|פינת|סנטר|מפרץ/
// "יד חרוצים 22, ירושלים, ישראל" → { street: "יד חרוצים 22", city: "ירושלים" }
function splitAddress(address, locality, formatted = '') {
  // Drop the country, Storepoint's "(ריק)" (= empty) placeholder, postcodes and repeated segments.
  const parts = [...new Set(clean(address).split(',').map((p) => p.trim()).filter((p) => p && p !== 'ישראל' && p !== '(ריק)' && !/^\d{5,7}$/.test(p)))]
  let idx = -1
  for (let i = parts.length - 1; i >= 0; i--) if (!NOT_CITY.test(parts[i])) { idx = i; break }
  let city = idx >= 0 ? parts[idx] : CITY_HE[locality] || clean(locality)
  if (!city) {
    // last resort: the geocoder's formatted address, e.g. "קרית ספר 7, מודיעין עילית, ישראל"
    const f = clean(formatted).split(',').map((p) => p.trim()).filter((p) => p && p !== 'ישראל' && !NOT_CITY.test(p))
    city = f[f.length - 1] || clean(locality) || parts[parts.length - 1] || ''
  }
  city = CITY_FIX[city] || city
  const street = parts.filter((_, i) => i !== idx).join(', ')
  return { street, city }
}
// Israeli numbers: keep digits, restore a dropped leading 0, hyphenate area code.
function phone(raw) {
  let d = clean(raw).replace(/\D/g, '')
  if (!d) return undefined
  if (d.startsWith('972')) d = '0' + d.slice(3)
  // Spreadsheet exports drop the leading zero: 9 digits (05x/07x mobiles) or
  // 8 digits (0X landlines: 02/03/04/08/09) get it back.
  if ((d.length === 9 || d.length === 8) && !d.startsWith('0')) d = '0' + d
  if (d.length === 7 && /^2/.test(d)) d = '02' + d // single Jerusalem row missing its area code
  if (d.length === 10 && /^0(5|7)/.test(d)) return `${d.slice(0, 3)}-${d.slice(3)}`
  if (d.length === 9 && d.startsWith('0')) return `${d.slice(0, 2)}-${d.slice(2)}`
  return d
}

const skipped = rows.filter((r) => !r.geo?.lat)
const docs = rows
  .filter((r) => !skipped.includes(r))
  .map((r) => {
    const { street, city: parsedCity } = splitAddress(r.address, r.geo.locality, r.geo.formatted)
    const city = CITY_FIX[clean(r.city)] || clean(r.city) || parsedCity
    return {
      _id: `store-${r.id.replace(/[^a-zA-Z0-9_-]/g, '-')}`,
      _type: 'store',
      sourceId: r.id,
      name: clean(r.name),
      category: CATEGORY[r.tags] || 'health',
      city,
      address: street && street !== city ? street : undefined,
      phone: phone(r.phone),
      website: clean(r.website) || undefined,
      region: REGION_BY_AREA[r.geo.area1] || regionFromLatLng(r.geo.lat, r.geo.lng),
      location: { _type: 'geopoint', lat: r.geo.lat, lng: r.geo.lng },
      approximate: r.geo.precision === 'city' || undefined,
      active: true,
    }
  })

if (skipped.length) console.log(`• Skipping ${skipped.length} row(s): ${skipped.map((r) => r.name).join('; ')}`)
const missingCity = docs.filter((d) => !d.city)
if (missingCity.length) throw new Error(`Rows without a city: ${missingCity.map((d) => d.name).join(', ')}`)

// The page shell: title + intro from the old page (רשימת חנויות).
const page = {
  _id: 'page-stores',
  _type: 'page',
  title: 'רשימת חנויות',
  slug: { _type: 'slug', current: 'stores' },
  body: [
    block('המוצרים של קטגוריה 5 תוספים אתיים נמכרים בלמעלה מ-500 נקודות מכירה ברחבי הארץ: בתי טבע, סניפי סופר-פארם, ניצת הדובדבן, B&D וחנויות אינטרנט. הקלידו עיר או השתמשו במיקום הנוכחי שלכם כדי למצוא את נקודת המכירה הקרובה.'),
  ],
  seo: {
    _type: 'seo',
    metaTitle: 'רשימת חנויות ונקודות מכירה | קטגוריה 5 תוספים אתיים',
    metaDescription: 'היכן ניתן לרכוש את מוצרי קטגוריה 5 תוספים אתיים: בתי טבע, סופר-פארם, ניצת הדובדבן, B&D וחנויות אינטרנט ברחבי ישראל. חיפוש לפי עיר או מיקום.',
  },
}
await publish('stores', [...docs, page], { stale: '_type == "store" && defined(sourceId)' })
const tally = (field) => docs.reduce((m, d) => ((m[d[field]] = (m[d[field]] || 0) + 1), m), {})
console.log('By region:', tally('region'), 'By category:', tally('category'), 'approximate:', docs.filter((d) => d.approximate).length)
