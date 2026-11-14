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
  'chat.toProduct': 'לעמוד המוצר', 'chat.expand': 'הגדלת החלון', 'chat.shrink': 'הקטנת החלון',
  'chat.steps': 'קורא את השאלה|מחפש במידע על המוצרים|בודק את המקורות|מעבד את התשובה|בודק שנית לפני שליחה', 'chat.working': 'הצ׳אט מכין תשובה',
  'chat.error': 'משהו השתבש. נסו שוב בעוד רגע.', 'chat.unavailable': 'הצ׳אט אינו זמין כרגע.', 'chat.rateLimited': 'שלחתם הרבה שאלות בזמן קצר. נסו שוב בעוד כמה דקות.',
  'form.sent': 'נשלח', 'form.error': 'השליחה נכשלה',
} as const
export type UiKey = keyof typeof he
const en: Partial<Record<UiKey, string>> = {
  'chat.open': 'Talk to us', 'chat.title': 'Talk to us', 'chat.lang': 'Language', 'chat.close': 'Close',
  'chat.inputLabel': 'Type a question', 'chat.placeholder': 'Write a question…', 'chat.send': 'Send',
  'chat.toProduct': 'View product', 'chat.expand': 'Enlarge window', 'chat.shrink': 'Reduce window',
  'chat.steps': 'Reading your question|Searching the product information|Checking the sources|Preparing the answer|Double-checking before sending', 'chat.working': 'Preparing an answer',
  'chat.error': 'Something went wrong. Please try again shortly.', 'chat.unavailable': 'Chat is not available right now.', 'chat.rateLimited': 'Too many questions in a short time. Please try again in a few minutes.',
}
const DICT: Record<Lang, Partial<Record<UiKey, string>>> = { he, en }

export function t(key: UiKey, lang: Lang = DEFAULT_LANG): string {
  return DICT[lang][key] ?? he[key]
}
/** All strings of a locale (for client-side scripts). */
export const dict = (lang: Lang) => ({ ...he, ...DICT[lang] })

// ---- Chat languages ("דברו איתנו"): the visitor picks one; the site itself stays he / en. ----
export type ChatLang = Lang | 'ar' | 'ru' | 'fr'
export const CHAT_LANGS: Array<{ code: ChatLang; name: string; dir: 'rtl' | 'ltr' }> = [
  { code: 'he', name: 'עברית', dir: 'rtl' },
  { code: 'en', name: 'English', dir: 'ltr' },
  { code: 'ar', name: 'العربية', dir: 'rtl' },
  { code: 'ru', name: 'Русский', dir: 'ltr' },
  { code: 'fr', name: 'Français', dir: 'ltr' },
]
const CHAT_EXTRA: Record<Exclude<ChatLang, Lang>, Partial<Record<UiKey, string>>> = {
  ar: {
    'chat.open': 'تحدثوا معنا', 'chat.title': 'تحدثوا معنا', 'chat.lang': 'اللغة', 'chat.close': 'إغلاق',
    'chat.inputLabel': 'اكتبوا سؤالاً', 'chat.placeholder': 'اكتبوا سؤالاً…', 'chat.send': 'إرسال',
    'chat.toProduct': 'إلى صفحة المنتج', 'chat.expand': 'تكبير النافذة', 'chat.shrink': 'تصغير النافذة',
    'chat.steps': 'يقرأ سؤالك|يبحث في معلومات المنتجات|يتحقق من المصادر|يُعدّ الإجابة|يتحقق مرة أخرى قبل الإرسال', 'chat.working': 'يتم إعداد الإجابة',
    'chat.error': 'حدث خطأ. حاولوا مرة أخرى بعد قليل.', 'chat.unavailable': 'المحادثة غير متاحة حالياً.', 'chat.rateLimited': 'أرسلتم أسئلة كثيرة في وقت قصير. حاولوا مرة أخرى بعد بضع دقائق.',
  },
  ru: {
    'chat.open': 'Напишите нам', 'chat.title': 'Напишите нам', 'chat.lang': 'Язык', 'chat.close': 'Закрыть',
    'chat.inputLabel': 'Введите вопрос', 'chat.placeholder': 'Напишите вопрос…', 'chat.send': 'Отправить',
    'chat.toProduct': 'Страница продукта', 'chat.expand': 'Увеличить окно', 'chat.shrink': 'Уменьшить окно',
    'chat.steps': 'Читаю вопрос|Ищу в информации о продуктах|Проверяю источники|Готовлю ответ|Проверяю ещё раз перед отправкой', 'chat.working': 'Готовлю ответ',
    'chat.error': 'Что-то пошло не так. Попробуйте ещё раз чуть позже.', 'chat.unavailable': 'Чат сейчас недоступен.', 'chat.rateLimited': 'Слишком много вопросов за короткое время. Попробуйте снова через несколько минут.',
  },
  fr: {
    'chat.open': 'Parlez-nous', 'chat.title': 'Parlez-nous', 'chat.lang': 'Langue', 'chat.close': 'Fermer',
    'chat.inputLabel': 'Saisissez une question', 'chat.placeholder': 'Écrivez une question…', 'chat.send': 'Envoyer',
    'chat.toProduct': 'Voir le produit', 'chat.expand': 'Agrandir la fenêtre', 'chat.shrink': 'Réduire la fenêtre',
    'chat.steps': 'Lecture de votre question|Recherche dans les informations produits|Vérification des sources|Préparation de la réponse|Dernière vérification avant l’envoi', 'chat.working': 'Préparation de la réponse',
    'chat.error': 'Une erreur est survenue. Réessayez dans un instant.', 'chat.unavailable': "Le chat n'est pas disponible pour le moment.", 'chat.rateLimited': 'Trop de questions en peu de temps. Réessayez dans quelques minutes.',
  },
}
/** All strings of a chat language (for the chat's client-side script). */
export const chatDict = (lang: ChatLang) => (lang === 'he' || lang === 'en' ? dict(lang) : { ...he, ...CHAT_EXTRA[lang] })
