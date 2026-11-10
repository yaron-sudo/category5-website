// Category 5 — shared site data, exactly as defined in BRIEF.md (do not add entries).

export interface Series { slug: string; name: string; color: string; icon: string; iconWhite: string; banner: string }
/** BRIEF §1 routes + §2 series colours. Order = header, home grid, footer. */
export const SERIES: Series[] = [
  { slug: 'vitamins-minerals', name: 'ויטמינים ומינרלים', color: '#003e21', icon: '/assets/icons/series-vitamins-minerals.svg', iconWhite: '/assets/icons/series-vitamins-minerals-white.svg', banner: '/assets/banners/series-vitamins-minerals.jpg' },
  { slug: 'plants', name: 'צמחים', color: '#d5a425', icon: '/assets/icons/series-plants.svg', iconWhite: '/assets/icons/series-plants-white.svg', banner: '/assets/banners/series-plants.jpg' },
  { slug: 'probiotics', name: 'פרוביוטיקה', color: '#85bbe6', icon: '/assets/icons/series-probiotics.svg', iconWhite: '/assets/icons/series-probiotics-white.svg', banner: '/assets/banners/series-probiotics.jpg' },
  { slug: 'professional', name: 'הסדרה המקצועית', color: '#4d0333', icon: '/assets/icons/series-professional.svg', iconWhite: '/assets/icons/series-professional-white.svg', banner: '/assets/banners/series-professional.jpg' },
]
export const seriesHref = (s: Series) => `/series/${s.slug}`

export interface Need { slug: string; label: string }
/** BRIEF §1 /needs/[slug] + §3 mega menu order. */
export const NEEDS: Need[] = [
  { slug: 'healthy-winter', label: 'חורף בריא' },
  { slug: 'women', label: 'נשים' },
  { slug: 'men', label: 'גברים' },
  { slug: 'sport', label: 'ספורט ותנועה' },
  { slug: 'kids', label: 'ילדים' },
  { slug: 'seniors', label: 'הגיל השלישי' },
]
export const needHref = (n: Need) => `/needs/${n.slug}`
/** The two "מומלץ" tiles of the needs mega menu (mockups/Header.dc.html). */
export const FEATURED_NEEDS = ['healthy-winter', 'sport']

export const CONTACT = {
  whatsapp: '053-932-5888',
  whatsappIntl: '972539325888',
  email: 'info@ethical-supplements.com',
  // BRIEF §17: Instagram / Facebook links still missing — the mockup's generic URLs until supplied.
  instagram: 'https://instagram.com/',
  facebook: 'https://facebook.com/',
}

/** BRIEF §4.3: legal note, taken verbatim from the footer of the current site (ethical-supplements.com). */
export const FOOTER_LEGAL_NOTE =
  '*ט.ל.ח, כל המידע הנמצא באתר ניתן למטרות חינוכיות בלבד, אינו מהווה תחליף לייעוץ, טיפול, אבחון והשגחה של רופא מוסמך, ואינו ערוך או מעוצב כדי לקדם או לפרסם שיטות ריפוי או מוצרים מסוימים. אין להשתמש בתוכן האתר למטרות אבחון או טיפול של בעיות בריאות או מחלות.יש לקרוא בזהירות את המידע המסופק על המוצרים המפורסמים או מקודמים באתר. אם יש חשש לבעיה רפואית כלשהי, עליך לפנות מיד לרופא המטפל ולפעול לפי הנחיותיו ולא להסתמך בצורה כלשהי על תכני האתר או המוצרים המופיעים בו כתחליף לטיפול על ידי רופא מוסמך. מוסכם עליך כי לא תסרב/י, בכל תנאי שהוא, לקבלת ייעוץ רפואי מקצועי, או תדחה/י חיפוש של ייעוץ כזה כתוצאה ממתן אמון בלתי מסויג בתוכן כלשהוא באתר. מתן אמון בלתי מסויג בתוכן כלשהוא באתר הוא סיכון שכולו שלך ובאחריותך. תוכן באתר הקשור להשלמות תזונתיות, לא נבחן או אושר על ידי משרד הבריאות. מוסכם שעליך להתייעץ עם הרופא או המטפל לפני תחילת שימוש בהשלמות תזונתיות. התמונות המוצגות באתר הינן להמחשה בלבד ויתכנו שינויים בין התמונה למוצר בפועל. יתכנו טעויות או אי התאמות במידע או אי התאמות במרכיבי המוצר. הנתונים המדויקים מופיעים על גבי המוצר עצמו ויש לבדוק שוב את הנתונים על גבי אריזת המוצר לפני השימוש.'

/** BRIEF §10 — the 14 glossary terms (ids + explanations copied from mockups/Glossary.dc.html). */
export const GLOSSARY: Array<{ id: string; term: string; text: string }> = [
  { id: 'liposome', term: 'ליפוזום', text: 'בועית זעירה העשויה משכבה כפולה של פוספוליפידים — אותם חומרים שמהם בנויים קרומי התאים. בתוספי תזונה משתמשים בליפוזומים כדי לעטוף את החומר הפעיל, להגן עליו במערכת העיכול ולסייע בספיגתו.' },
  { id: 'bioavailability', term: 'זמינות ביולוגית', text: 'החלק מתוך החומר הפעיל שנספג ומגיע למחזור הדם, וכך זמין לשימוש הגוף. היא מושפעת מהצורה הכימית של הרכיב, מהפורמולציה ומגורמים אישיים.' },
  { id: 'active-ingredient', term: 'חומר פעיל', text: 'הרכיב במוצר שאחראי להשפעה המיועדת שלו — בניגוד לרכיבי עזר כמו חומרי מילוי או מעטפת הכמוסה.' },
  { id: 'clinically-tested', term: 'חומר גלם שנבדק קלינית', text: 'חומר גלם, לרוב ממותג, שנבחן במחקרים קליניים בבני אדם במינון ובצורה מוגדרים.' },
  { id: 'bisglycinate', term: 'ביסגליצינאט', text: 'צורה של מינרל (למשל מגנזיום או ברזל) הקשור לשתי מולקולות של חומצת האמינו גליצין. צורה זו נחשבת עדינה למערכת העיכול ובעלת ספיגה טובה.' },
  { id: 'citrate', term: 'ציטראט', text: 'מלח של מינרל עם חומצת לימון. צורה מסיסה במים, נפוצה בתוספי מגנזיום, סידן ואשלגן.' },
  { id: 'taurate', term: 'טאורט', text: 'צורה של מינרל הקשור לחומצת האמינו טאורין, למשל מגנזיום טאורט. אצטיל טאורט היא צורה קרובה שבה הטאורין עבר אצטילציה.' },
  { id: 'nanoparticles', term: 'ננו חלקיקים', text: 'חלקיקים בגודל של ננומטרים בודדים עד מאות ננומטרים. הקטנת החלקיק מגדילה את שטח הפנים שלו ועשויה להשפיע על המסיסות והספיגה.' },
  { id: 'electron-microscope', term: 'מיקרוסקופ אלקטרוני', text: 'מיקרוסקופ שמשתמש באלומת אלקטרונים במקום באור ומאפשר הגדלה של עד מיליוני מונים. משמש, בין היתר, לאימות הגודל והמבנה של חלקיקים וליפוזומים.' },
  { id: 'antioxidants', term: 'נוגדי חמצון', text: 'חומרים המסייעים לנטרל רדיקלים חופשיים — מולקולות לא יציבות שנוצרות בתהליכים טבעיים בגוף ובחשיפה לגורמים סביבתיים. דוגמאות: ויטמין C, ויטמין E ופוליפנולים.' },
  { id: 'probiotics', term: 'פרוביוטיקה', text: 'מיקרואורגניזמים חיים — "חיידקים טובים" — שבכמות מספקת עשויים להועיל לבריאות.' },
  { id: 'digestive-enzymes', term: 'אנזימי עיכול', text: 'חלבונים המפרקים את המזון למרכיבים קטנים שהגוף יכול לספוג: עמילאז לפחמימות, פרוטאז לחלבונים וליפאז לשומנים.' },
  { id: 'complex', term: 'קומפלקס', text: 'פורמולה המשלבת כמה רכיבים פעילים, או כמה צורות של אותו רכיב, במוצר אחד.' },
  { id: 'gmo-free', term: 'GMO Free', text: 'מוצר שרכיביו אינם מהונדסים גנטית.' },
]
