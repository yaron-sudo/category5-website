// Hebrew names for the places Vercel reports in English: countries through Intl.DisplayNames,
// cities through the dictionary below (Israeli cities and localities, plus the foreign cities most
// likely to appear). A name that is not listed stays as Vercel wrote it.
let regions: Intl.DisplayNames | null = null
export function heCountry(code: string | null | undefined): string {
  if (!code) return ''
  try { regions ??= new Intl.DisplayNames(['he'], { type: 'region' }); return regions.of(code.toUpperCase()) ?? code } catch { return code }
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

export const heCity = (name: string | null | undefined): string => (name ? index.get(norm(name)) ?? name : '')

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
