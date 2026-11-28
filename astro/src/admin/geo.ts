import { q } from './db'
import { env } from './env'

// Hebrew names for the places Vercel reports in English: countries through Intl.DisplayNames,
// cities through the dictionary below (Israeli cities and localities, plus the foreign cities most
// likely to appear). A name that is not listed stays as Vercel wrote it.
const COUNTRY_HE: Record<string, string> = Object.fromEntries(`AD אנדורה|AE איחוד האמירויות|AF אפגניסטן|AG אנטיגואה וברבודה|AL אלבניה|AM ארמניה|AO אנגולה|AR ארגנטינה|AT אוסטריה|AU אוסטרליה|AZ אזרבייג'ן|BA בוסניה והרצגובינה|BB ברבדוס|BD בנגלדש|BE בלגיה|BF בורקינה פאסו|BG בולגריה|BH בחריין|BI בורונדי|BJ בנין|BN ברוניי|BO בוליביה|BR ברזיל|BS איי בהאמה|BT בהוטן|BW בוצואנה|BY בלארוס|BZ בליז|CA קנדה|CD הרפובליקה הדמוקרטית של קונגו|CF הרפובליקה המרכז-אפריקאית|CG קונגו|CH שווייץ|CI חוף השנהב|CL צ'ילה|CM קמרון|CN סין|CO קולומביה|CR קוסטה ריקה|CU קובה|CV כף ורדה|CY קפריסין|CZ צ'כיה|DE גרמניה|DJ ג'יבוטי|DK דנמרק|DM דומיניקה|DO הרפובליקה הדומיניקנית|DZ אלג'יריה|EC אקוודור|EE אסטוניה|EG מצרים|ER אריתראה|ES ספרד|ET אתיופיה|FI פינלנד|FJ פיג'י|FR צרפת|GA גבון|GB בריטניה|GD גרנדה|GE גאורגיה|GH גאנה|GM גמביה|GN גינאה|GQ גינאה המשוונית|GR יוון|GT גואטמלה|GW גינאה-ביסאו|GY גיאנה|HK הונג קונג|HN הונדורס|HR קרואטיה|HT האיטי|HU הונגריה|ID אינדונזיה|IE אירלנד|IL ישראל|IN הודו|IQ עיראק|IR איראן|IS איסלנד|IT איטליה|JM ג'מייקה|JO ירדן|JP יפן|KE קניה|KG קירגיזסטן|KH קמבודיה|KM קומורו|KP צפון קוריאה|KR דרום קוריאה|KW כווית|KZ קזחסטן|LA לאוס|LB לבנון|LC סנט לוסיה|LI ליכטנשטיין|LK סרי לנקה|LR ליבריה|LS לסוטו|LT ליטא|LU לוקסמבורג|LV לטביה|LY לוב|MA מרוקו|MC מונקו|MD מולדובה|ME מונטנגרו|MG מדגסקר|MK מקדוניה הצפונית|ML מאלי|MM מיאנמר|MN מונגוליה|MO מקאו|MR מאוריטניה|MT מלטה|MU מאוריציוס|MV המלדיביים|MW מלאווי|MX מקסיקו|MY מלזיה|MZ מוזמביק|NA נמיביה|NE ניז'ר|NG ניגריה|NI ניקרגואה|NL הולנד|NO נורווגיה|NP נפאל|NZ ניו זילנד|OM עומאן|PA פנמה|PE פרו|PG פפואה גינאה החדשה|PH הפיליפינים|PK פקיסטן|PL פולין|PR פוארטו ריקו|PS הרשות הפלסטינית|PT פורטוגל|PY פרגוואי|QA קטאר|RO רומניה|RS סרביה|RU רוסיה|RW רואנדה|SA ערב הסעודית|SC סיישל|SD סודן|SE שוודיה|SG סינגפור|SI סלובניה|SK סלובקיה|SL סיירה לאון|SM סן מרינו|SN סנגל|SO סומליה|SR סורינאם|SS דרום סודן|SV אל סלבדור|SY סוריה|SZ אסוואטיני|TD צ'אד|TG טוגו|TH תאילנד|TJ טג'יקיסטן|TM טורקמניסטן|TN תוניסיה|TR טורקיה|TT טרינידד וטובגו|TW טייוואן|TZ טנזניה|UA אוקראינה|UG אוגנדה|US ארצות הברית|UY אורוגוואי|UZ אוזבקיסטן|VA קריית הוותיקן|VE ונצואלה|VN וייטנאם|XK קוסובו|YE תימן|ZA דרום אפריקה|ZM זמביה|ZW זימבבואה|GI גיברלטר|JE ג'רזי|GG גרנזי|IM האי מאן|FO איי פארו|GL גרינלנד|NC קלדוניה החדשה|PF פולינזיה הצרפתית|RE ראוניון|MQ מרטיניק|GP גוואדלופ|KY איי קיימן|BM ברמודה|AW ארובה|CW קוראסאו|VG איי הבתולה הבריטיים|VI איי הבתולה האמריקאיים|GU גואם|WS סמואה|TO טונגה|VU ונואטו|SB איי שלמה|AX איי אולנד|T1 רשת Tor|XX לא ידוע`.split('|').map((x) => [x.slice(0, 2), x.slice(3)]))
let regions: Intl.DisplayNames | null = null
export function heCountry(code: string | null | undefined): string {
  if (!code) return ''
  const c = code.toUpperCase()
  if (COUNTRY_HE[c]) return COUNTRY_HE[c]
  try { regions ??= new Intl.DisplayNames(['he'], { type: 'region' }); const n = regions.of(c); if (n && /[\u0590-\u05FF]/.test(n)) return n } catch { /* no locale data */ }
  return c
}

// [Hebrew, ...English spellings seen in geo-IP data]
const CITIES: string[][] = [
  ['תל אביב-יפו', 'Tel Aviv', 'Tel Aviv-Yafo', 'Tel Aviv-Jaffa', 'Tel Aviv Yaffo'], ['יפו', 'Jaffa', 'Yafo'],
  ['ירושלים', 'Jerusalem', 'Yerushalayim'], ['חיפה', 'Haifa'], ['ראשון לציון', 'Rishon LeZion', 'Rishon LeZiyyon', 'Rishon Leziyon', 'Rishon Letsiyon', 'Rishon Le Zion'],
  ['פתח תקווה', 'Petah Tikva', 'Petah Tiqwa', 'Petach Tikva', 'Petakh Tikva', 'Petah Tikvah'], ['אשדוד', 'Ashdod'], ['נתניה', 'Netanya', 'Natanya'],
  ['באר שבע', 'Beersheba', 'Beer Sheva', 'Beer-Sheva', "Be'er Sheva", 'Beersheva', 'Beer Sheba'], ['חולון', 'Holon'], ['בני ברק', 'Bnei Brak', 'Bene Beraq', "B'nei Brak", 'Bnei Braq'],
  ['רמת גן', 'Ramat Gan'], ['בת ים', 'Bat Yam'], ['רחובות', 'Rehovot', 'Rehovoth'], ['אשקלון', 'Ashkelon', 'Ashqelon'], ['הרצליה', 'Herzliya', 'Herzliyya', 'Herzlia'],
  ['כפר סבא', 'Kfar Saba', 'Kefar Sava', 'Kfar Sabba'], ['חדרה', 'Hadera'], ['מודיעין-מכבים-רעות', 'Modiin', "Modi'in", 'Modiin-Maccabim-Reut', 'Modi\'in-Maccabim-Re\'ut', 'Modi\'in Makkabbim Re\'ut', 'Modiin Maccabim Reut'],
  ['רעננה', 'Raanana', "Ra'anana", 'Ranana'], ['לוד', 'Lod', 'Lydda'], ['רמלה', 'Ramla', 'Ramle'], ['נהריה', 'Nahariya', 'Nahariyya'], ['נצרת', 'Nazareth'], ['נוף הגליל', 'Nof HaGalil', 'Nazareth Illit', 'Natseret Illit'],
  ['טבריה', 'Tiberias', 'Teverya'], ['אילת', 'Eilat', 'Elat'], ['עכו', 'Acre', 'Akko', 'Akka'], ['כרמיאל', 'Karmiel', "Karmi'el"], ['עפולה', 'Afula'], ['צפת', 'Safed', 'Tsfat', 'Zefat', 'Tzfat'],
  ['קרית גת', 'Kiryat Gat', 'Qiryat Gat', 'Kiryat Gat'], ['קרית שמונה', 'Kiryat Shmona', 'Qiryat Shemona', 'Kiryat Shemona'], ['קרית אתא', 'Kiryat Ata', 'Qiryat Ata'], ['קרית ביאליק', 'Kiryat Bialik', 'Qiryat Bialik'],
  ['קרית מוצקין', 'Kiryat Motzkin', 'Qiryat Motzkin', 'Kiryat Motskin'], ['קרית ים', 'Kiryat Yam', 'Qiryat Yam'], ['קרית אונו', 'Kiryat Ono', 'Qiryat Ono'], ['קרית מלאכי', 'Kiryat Malakhi', 'Qiryat Mal\'akhi', 'Kiryat Malachi'],
  ['גבעתיים', 'Givatayim', "Giv'atayim"], ['אור יהודה', 'Or Yehuda'], ['יהוד-מונוסון', 'Yehud', 'Yehud-Monosson'], ['ראש העין', 'Rosh HaAyin', "Rosh Ha'ayin", 'Rosh Haayin'],
  ['הוד השרון', 'Hod HaSharon', 'Hod Hasharon'], ['נס ציונה', 'Nes Ziona', 'Ness Ziona', 'Nes Tsiyona'], ['יבנה', 'Yavne', 'Yavneh'], ['גדרה', 'Gedera'], ['שדרות', 'Sderot'], ['נתיבות', 'Netivot'], ['אופקים', 'Ofakim'],
  ['דימונה', 'Dimona'], ['ערד', 'Arad'], ['יקנעם עילית', 'Yokneam', 'Yoqne\'am Illit', 'Yokneam Illit'], ['טירת כרמל', 'Tirat Carmel', 'Tirat Karmel'], ['נשר', 'Nesher'], ['מגדל העמק', 'Migdal HaEmek', 'Migdal Haemeq'],
  ['בית שמש', 'Beit Shemesh', 'Bet Shemesh'], ['מעלה אדומים', 'Maale Adumim', "Ma'ale Adummim", 'Maale Adummim'], ['אריאל', 'Ariel'], ['מודיעין עילית', 'Modiin Illit', "Modi'in Illit"], ['בית שאן', 'Beit She\'an', 'Bet Shean', 'Beit Shean'],
  ['שוהם', 'Shoham'], ['כפר יונה', 'Kfar Yona', 'Kefar Yona'], ['אבן יהודה', 'Even Yehuda'], ['תל מונד', 'Tel Mond'], ['זכרון יעקב', 'Zichron Yaakov', "Zikhron Ya'aqov", 'Zikhron Yaakov'], ['קיסריה', 'Caesarea', 'Qesarya'],
  ['פרדס חנה-כרכור', 'Pardes Hanna-Karkur', 'Pardes Hanna Karkur', 'Pardes Hanna'], ['בנימינה', 'Binyamina', 'Binyamina-Giv\'at Ada'], ['רמת השרון', 'Ramat HaSharon', 'Ramat Hasharon'], ['קדימה-צורן', 'Kadima Zoran', 'Kadima'],
  ['טייבה', 'Tayibe', 'Taibe', 'Tayyibe'], ['אום אל-פחם', 'Umm al-Fahm', 'Umm el-Fahm'], ['רהט', 'Rahat'], ['סח\'נין', 'Sakhnin'], ['שפרעם', 'Shefa-Amr', 'Shefar\'am', 'Shfaram'], ['באקה אל-גרבייה', 'Baqa al-Gharbiyye', 'Baka al-Gharbiyya'],
  ['טמרה', 'Tamra'], ['כפר קאסם', 'Kafr Qasim', 'Kfar Kasem'], ['טירה', 'Tira'], ['קלנסווה', 'Qalansawe', 'Kalansua'], ['נתב"ג', 'Ben Gurion Airport'], ['מבשרת ציון', 'Mevaseret Zion', 'Mevasseret Zion'], ['גן יבנה', 'Gan Yavne'],
  ['להבים', 'Lehavim'], ['עומר', 'Omer'], ['מצפה רמון', 'Mitzpe Ramon', 'Mizpe Ramon'], ['ים המלח', 'Dead Sea'], ['קרית טבעון', 'Kiryat Tivon', 'Qiryat Tiv\'on'], ['עתלית', 'Atlit', '\'Atlit'], ['חריש', 'Harish'],
  ['אלעד', 'Elad'], ['ביתר עילית', 'Beitar Illit', 'Betar Illit'], ['גבעת שמואל', 'Givat Shmuel', "Giv'at Shemu'el"], ['קרית עקרון', 'Kiryat Ekron', 'Qiryat Eqron'], ['באר יעקב', "Be'er Ya'akov", 'Beer Yaakov'], ['מזכרת בתיה', 'Mazkeret Batya'],
  // abroad
  ['ניו יורק', 'New York', 'New York City'], ['לוס אנג\'לס', 'Los Angeles'], ['שיקגו', 'Chicago'], ['מיאמי', 'Miami'], ['סן פרנסיסקו', 'San Francisco'], ['וושינגטון', 'Washington'], ['בוסטון', 'Boston'], ['יוסטון', 'Houston'],
  ['דאלאס', 'Dallas'], ['סיאטל', 'Seattle'], ['אטלנטה', 'Atlanta'], ['פילדלפיה', 'Philadelphia'], ['לאס וגאס', 'Las Vegas'], ['סן חוזה', 'San Jose'], ['טורונטו', 'Toronto'], ['מונטריאול', 'Montreal'], ['ונקובר', 'Vancouver'],
  ['לונדון', 'London'], ['מנצ\'סטר', 'Manchester'], ['פריז', 'Paris'], ['ברלין', 'Berlin'], ['פרנקפורט', 'Frankfurt', 'Frankfurt am Main'], ['מינכן', 'Munich', 'Muenchen'], ['המבורג', 'Hamburg'], ['אמסטרדם', 'Amsterdam'],
  ['בריסל', 'Brussels'], ['מדריד', 'Madrid'], ['ברצלונה', 'Barcelona'], ['רומא', 'Rome'], ['מילאנו', 'Milan'], ['וינה', 'Vienna'], ['ציריך', 'Zurich'], ['ז\'נבה', 'Geneva'], ['מוסקבה', 'Moscow'], ['סנט פטרבורג', 'Saint Petersburg', 'St Petersburg'],
  ['קייב', 'Kyiv', 'Kiev'], ['חרקוב', 'Kharkiv', 'Kharkov'], ['אודסה', 'Odesa', 'Odessa'], ['דניפרו', 'Dnipro'], ['ורשה', 'Warsaw'], ['פראג', 'Prague'], ['בודפשט', 'Budapest'], ['בוקרשט', 'Bucharest'], ['אתונה', 'Athens'],
  ['איסטנבול', 'Istanbul'], ['דובאי', 'Dubai'], ['אבו דאבי', 'Abu Dhabi'], ['דוחה', 'Doha'], ['קהיר', 'Cairo'], ['עמאן', 'Amman'], ['סידני', 'Sydney'], ['מלבורן', 'Melbourne'], ['מומבאי', 'Mumbai'], ['דלהי', 'Delhi', 'New Delhi'],
  ['טוקיו', 'Tokyo'], ['סינגפור', 'Singapore'], ['הונג קונג', 'Hong Kong'], ['בייג\'ינג', 'Beijing'], ['שנגחאי', 'Shanghai'], ['סאו פאולו', 'Sao Paulo', 'São Paulo'], ['בואנוס איירס', 'Buenos Aires'], ['מקסיקו סיטי', 'Mexico City'],
  ['יוהנסבורג', 'Johannesburg'], ['דבלין', 'Dublin'], ['שטוקהולם', 'Stockholm'], ['קופנהגן', 'Copenhagen'], ['אוסלו', 'Oslo'], ['הלסינקי', 'Helsinki'], ['ליסבון', 'Lisbon'], ['ריגה', 'Riga'], ['טביליסי', 'Tbilisi'], ['ירוואן', 'Yerevan'],
  ['מינסק', 'Minsk'], ['טשקנט', 'Tashkent'], ['אלמטי', 'Almaty'], ['בנגקוק', 'Bangkok'], ['סיאול', 'Seoul'], ['קייפטאון', 'Cape Town'],
]
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]/g, '')
const index = new Map<string, string>()
for (const [he, ...names] of CITIES) for (const n of names) index.set(norm(n), he)

const learned = new Map<string, string>() // names translated by the model, cached in the city_names table
export const heCity = (name: string | null | undefined): string => (name ? index.get(norm(name)) ?? learned.get(name) ?? name : '')

const failed = new Map<string, number>() // names the model could not translate: do not retry for 10 minutes
let lastCall = 0

/** Makes heCity() know Hebrew names for cities that are not in the dictionary: first from the
 *  city_names table, then (once per new name) from Claude, which is asked for the usual Hebrew spelling
 *  and whose answer is stored. Never throws; a name that cannot be translated stays in English. */
export async function prepareCities(items: Array<{ city: string; country?: string | null }>): Promise<void> {
  const need = [...new Map(items.filter((i) => i.city && !index.has(norm(i.city)) && !learned.has(i.city) && !((failed.get(i.city) ?? 0) > Date.now())).map((i) => [i.city, i.country ?? ''])).entries()].slice(0, 60)
  if (!need.length) return
  try {
    const marks = need.map((_, i) => `$${i + 1}`).join(',')
    const rows = await q<{ name: string; he: string }>(`SELECT name, he FROM city_names WHERE name IN (${marks})`, need.map(([c]) => c))
    for (const r of rows) learned.set(r.name, r.he)
    const todo = need.filter(([c]) => !learned.has(c))
    const key = env('ANTHROPIC_API_KEY')
    if (!todo.length || !key || Date.now() - lastCall < 5000) return
    lastCall = Date.now()
    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    const client = new Anthropic({ apiKey: key, timeout: 8000, maxRetries: 0 })
    const msg = await client.messages.create({
      model: 'claude-haiku-5-5', max_tokens: 1500,
      messages: [{ role: 'user', content: `Translate these city names (from IP geolocation, with the country code) into Hebrew, spelled the way Israeli media writes them. If a city has no established Hebrew spelling, transliterate it phonetically. Answer with one JSON object mapping each input name exactly as given to its Hebrew name, and nothing else.\n\n${todo.map(([c, k]) => `${c} (${k || '?'})`).join('\n')}` }],
    })
    const text = msg.content.map((b) => (b.type === 'text' ? b.text : '')).join('')
    const json = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1)) as Record<string, unknown>
    for (const [city] of todo) {
      const he = json[city]
      if (typeof he === 'string' && /[\u0590-\u05FF]/.test(he) && he.length <= 60 && !/[<>]/.test(he)) {
        learned.set(city, he.trim())
        await q('INSERT INTO city_names (name, he) VALUES ($1, $2) ON CONFLICT DO NOTHING', [city, he.trim()])
      } else failed.set(city, Date.now() + 10 * 60_000)
    }
  } catch (e) {
    for (const [c] of need) if (!learned.has(c)) failed.set(c, Date.now() + 10 * 60_000)
    console.warn('[geo] city translation skipped:', (e as Error).message)
  }
}

/** Merges rows whose translated label is the same (two English spellings of one city). */
export function mergeBy<T extends { n: number; prev?: number }>(rows: T[], key: (r: T) => string, set: (r: T, k: string) => T): T[] {
  const out = new Map<string, T>()
  for (const r of rows) {
    const k = key(r), cur = out.get(k)
    if (!cur) out.set(k, set(r, k))
    else { cur.n += r.n; if (cur.prev !== undefined || r.prev !== undefined) cur.prev = (cur.prev ?? 0) + (r.prev ?? 0) }
  }
  return [...out.values()].sort((a, b) => b.n - a.n)
}
