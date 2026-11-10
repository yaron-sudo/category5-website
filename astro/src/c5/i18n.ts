// i18n layer (BRIEF §1): Hebrew now, English-ready. UI strings live here so an
// English locale only needs a second dictionary + `lang`/`dir` on <html>.
export type Lang = 'he' | 'en'
export const DEFAULT_LANG: Lang = 'he'
export const DIR: Record<Lang, 'rtl' | 'ltr'> = { he: 'rtl', en: 'ltr' }

const he = {
  'nav.about': 'אודות', 'nav.series': 'סדרות', 'nav.needs': 'מה הצורך', 'nav.stores': 'חנויות',
  'nav.glossary': 'עולם המושגים', 'nav.articles': 'מאמרים', 'nav.contact': 'צור קשר',
  'nav.main': 'ניווט ראשי', 'nav.search': 'חיפוש', 'nav.menu': 'תפריט', 'nav.home': 'Category 5 – לדף הבית',
  'nav.allNeeds': 'לכל התחומים', 'img': 'אימג׳', 'banner': 'באנר',
  'footer.keepInTouch': 'בואו נהיה בקשר', 'footer.email': 'כתובת אימייל', 'footer.signup': 'הרשמה',
  'footer.terms': 'תנאי שימוש', 'footer.privacy': 'מדיניות פרטיות', 'footer.legalTitle': 'התוויה משפטית', 'footer.legal': 'משפטי',
  'chat.open': 'דברו איתנו', 'chat.title': 'דברו איתנו', 'chat.lang': 'שפה', 'chat.close': 'סגירה',
  'chat.inputLabel': 'הקלידו שאלה', 'chat.placeholder': 'כתבו שאלה…', 'chat.send': 'שליחה', 'a11y.open': 'נגישות',
  'chat.error': 'משהו השתבש. נסו שוב בעוד רגע.', 'chat.unavailable': 'הצ׳אט אינו זמין כרגע.', 'chat.rateLimited': 'שלחתם הרבה שאלות בזמן קצר. נסו שוב בעוד כמה דקות.',
  'form.sent': 'נשלח', 'form.error': 'השליחה נכשלה',
} as const
export type UiKey = keyof typeof he
const en: Partial<Record<UiKey, string>> = {
  'chat.open': 'Talk to us', 'chat.title': 'Talk to us', 'chat.lang': 'Language', 'chat.close': 'Close',
  'chat.inputLabel': 'Type a question', 'chat.placeholder': 'Write a question…', 'chat.send': 'Send',
  'chat.error': 'Something went wrong. Please try again shortly.', 'chat.unavailable': 'Chat is not available right now.', 'chat.rateLimited': 'Too many questions in a short time. Please try again in a few minutes.',
}
const DICT: Record<Lang, Partial<Record<UiKey, string>>> = { he, en }

export function t(key: UiKey, lang: Lang = DEFAULT_LANG): string {
  return DICT[lang][key] ?? he[key]
}
/** All strings of a locale (for client-side scripts). */
export const dict = (lang: Lang) => ({ ...he, ...DICT[lang] })
