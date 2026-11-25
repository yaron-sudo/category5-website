// /legal/cookies — the cookie policy of the Category 5 site (Legal layout, BRIEF §14).
// Describes what the site really stores: the consent choice, accessibility preferences and
// the "דברו איתנו" conversations (browser storage), Google Analytics 4 (analytics) and the
// Meta Pixel (marketing) — the last two run only after consent (components/c5/CookieConsent.astro
// + components/TrackingPixels.astro). Update this text when a tracker is added to siteSettings.tracking.
import type { LegalSection } from '@/components/c5/LegalPage.astro'
import { CONTACT } from '@/c5/data'

export const COOKIE_POLICY_TITLE = 'מדיניות עוגיות'
export const COOKIE_POLICY_UPDATED = '22.11.2026'

const a = (href: string, label: string, ltr = false) =>
  `<a href="${href}"${ltr ? ' dir="ltr"' : ''}${href.startsWith('http') ? ' target="_blank" rel="noopener"' : ''} style="color: #141414">${label}</a>`

export const COOKIE_POLICY: LegalSection[] = [
  { title: 'כללי', paragraphs: [
    'מדיניות זו מסבירה כיצד קטגוריה 5 תוספים אתיים (Category 5 | Ethical Supplements) משתמשת בעוגיות (Cookies) ובטכנולוגיות דומות באתר www.ethical-supplements.com, לאילו מטרות, וכיצד ניתן לבחור ולשנות את ההעדפות בכל עת.',
  ], html: `מדיניות זו היא חלק מ${a('/legal/privacy', 'מדיניות הפרטיות')} של האתר ונערכה בהתאם לחוק הגנת הפרטיות, התשמ״א–1981, ולתיקון 13 לחוק.` },

  { title: 'מהן עוגיות', paragraphs: [
    'עוגיות הן קבצי טקסט קטנים שהדפדפן שומר במכשיר שלכם בעת הביקור באתר. בנוסף לעוגיות, האתר משתמש באחסון המקומי של הדפדפן (Local Storage) כדי לזכור הגדרות שבחרתם. מידע שנשמר באחסון המקומי נשאר במכשיר שלכם ואינו נשלח אלינו.',
  ] },

  { title: 'עוגיות הכרחיות', paragraphs: [
    'עוגיות ונתונים אלה נדרשים לתפקוד האתר ולשמירת הבחירות שלכם, ולכן הם פעילים תמיד ואינם דורשים הסכמה:',
  ], items: [
    'בחירת העוגיות שלכם (c5-cookie-consent, c5_consent) — כדי שלא נשאל אתכם שוב בכל עמוד. נשמרת ל־12 חודשים.',
    'העדפות הנגישות שבחרתם בתפריט הנגישות (c5-a11y-v2) — גודל טקסט, ניגודיות, עצירת אנימציות ועוד. נשמרות עד שתאפסו אותן.',
    'השיחות בצ׳אט "דברו איתנו" (c5-chat-convs-v1, c5-chat-current) — כדי שתוכלו לחזור לשיחות קודמות. נשמרות בדפדפן שלכם בלבד, עד שתמחקו אותן.',
  ] },

  { title: 'ביצועים וסטטיסטיקה', paragraphs: [
    'בכפוף להסכמתכם, אנו משתמשים ב־Google Analytics 4 של Google כדי להבין כיצד משתמשים באתר: אילו עמודים נצפים, מאיפה הגיעו המבקרים, באיזה סוג מכשיר ודפדפן, וכמה זמן נמשך הביקור. המידע נאסף באופן סטטיסטי ומשמש לשיפור האתר והתכנים.',
  ], items: [
    'עוגיות: ‎_ga, ‎_ga_‎* — נשמרות עד 24 חודשים.',
  ], html: `מידע נוסף: ${a('https://policies.google.com/privacy', 'מדיניות הפרטיות של Google')}.` },

  { title: 'שיווק והתאמה אישית', paragraphs: [
    'בכפוף להסכמתכם, אנו משתמשים ב־Meta Pixel של Meta כדי למדוד את האפקטיביות של הפרסום שלנו ב־Facebook וב־Instagram, ולהציג תוכן ופרסומות של Category 5 המותאמים לגולשים שביקרו באתר.',
  ], items: [
    'עוגיות: ‎_fbp — נשמרת עד 3 חודשים.',
  ], html: `מידע נוסף: ${a('https://www.facebook.com/privacy/policy', 'מדיניות הפרטיות של Meta')}.` },

  { title: 'כיצד מתקבלת ההסכמה', paragraphs: [
    'בכניסה הראשונה לאתר מוצגת הודעה בתחתית המסך. עד שתבחרו, לא מופעלות באתר עוגיות שאינן הכרחיות, וקוד המדידה של Google ו־Meta אינו נטען כלל.',
    'אפשר לאשר הכל, לדחות הכל או לבחור בהגדרות אילו סוגי עוגיות לאשר. לדחייה ולאישור משקל שווה, וסגירת ההודעה במקלדת (Esc) נחשבת לדחייה. הבחירה נשמרת ל־12 חודשים, ולאחר מכן נשאל אתכם שוב.',
  ] },

  { title: 'שינוי או ביטול ההסכמה', paragraphs: [
    'ניתן לשנות את הבחירה או לבטל את ההסכמה בכל עת דרך הקישור "הגדרות עוגיות" בתחתית כל עמוד באתר. ביטול ההסכמה עוצר את הפעלת העוגיות מאותו רגע ואילך.',
    'בנוסף, ניתן למחוק עוגיות ונתונים שנשמרו או לחסום אותם דרך הגדרות הדפדפן. חסימת עוגיות הכרחיות עלולה לגרום לכך שהאתר לא יזכור את ההעדפות שלכם.',
  ] },

  { title: 'צדדים שלישיים והעברת מידע', paragraphs: [
    'Google ו־Meta הן חברות צד שלישי, והמידע שהן אוספות באמצעות העוגיות עשוי להיות מעובד ומאוחסן בשרתים מחוץ לישראל, בהתאם למדיניות הפרטיות שלהן. איננו מוכרים מידע אישי לצדדים שלישיים.',
  ] },

  { title: 'זכויותיכם ויצירת קשר', paragraphs: [
    'בהתאם לחוק הגנת הפרטיות, עומדת לכם הזכות לעיין במידע שנשמר עליכם, ולבקש לתקן או למחוק אותו.',
  ], html: `לשאלות ולבקשות בנושא עוגיות ופרטיות: ${a(`mailto:${CONTACT.email}`, CONTACT.email, true)}.` },

  { title: 'עדכונים למדיניות', paragraphs: [
    'מדיניות זו עשויה להתעדכן מעת לעת, למשל כאשר נוסף לאתר שירות חדש. הנוסח המעודכן יפורסם בעמוד זה, ותאריך העדכון האחרון יופיע בראשו. כאשר נוסף סוג חדש של עוגיות, נבקש את הסכמתכם מחדש.',
  ] },
]
