// Medical terms the site never answers with products — EDITABLE, for legal review.
//
// When a search (or a chat question) contains one of these words or phrases, no product
// and no article is shown; the visitor gets BLOCKED_MESSAGE and the series / need links.
// Matching ignores Hebrew prefixes (ה/ו/ב/ל/מ/ש/כ), final letters and plural endings, so
// "לסוכרת", "סוכרתי", "הדיכאון" all count. English terms match whole words.
//
// Keep this list to diseases, diagnoses and medicines. Everyday well-being and functional
// words the site answers for (שינה, חרדה, לחץ, מתח, ריכוז, זיכרון, מיקוד, לחץ דם, קצב לב,
// כאבי פרקים, דלקות, שחיקת סחוס, עיכול, אנרגיה, חורף…) are NOT blocked — they live in
// searchKeywords.ts (client decision 16.11.2026).

export const BLOCKED_TERMS: string[] = [
  // metabolic / weight
  'סוכרת', 'סוכר בדם', 'אינסולין', 'השמנה', 'השמנת יתר', 'עליה במשקל', 'עלייה במשקל', 'ירידה במשקל', 'הרזיה', 'להרזות', 'לרזות', 'דיאטה', 'אנורקסיה', 'בולימיה', 'הפרעות אכילה',
  'diabetes', 'insulin', 'obesity', 'weight loss', 'weight gain', 'diet', 'anorexia', 'bulimia',
  // cancer
  'סרטן', 'גידול', 'גידולים', 'כימותרפיה', 'הקרנות', 'cancer', 'tumor', 'tumour', 'chemotherapy', 'oncology',
  // heart / blood
  'כולסטרול', 'טריגליצרידים', 'מחלת לב', 'מחלות לב', 'התקף לב', 'אוטם', 'שבץ', 'קריש דם', 'קרישי דם', 'קרישה', 'אנמיה', 'דימום',
  'cholesterol', 'heart disease', 'heart attack', 'stroke', 'blood clot', 'anemia', 'anaemia',
  // mental health / neuro
  'דיכאון', 'הפרעה נפשית', 'הפרעות נפשיות', 'מחלת נפש', 'סכיזופרניה', 'ביפולרי', 'הפרעת קשב', 'הפרעות קשב', 'אוטיזם', 'אלצהיימר', 'דמנציה', 'פרקינסון', 'אפילפסיה', 'טרשת נפוצה', 'מיגרנה', 
  'depression', 'adhd', 'autism', 'alzheimer', 'dementia', 'parkinson', 'epilepsy', 'multiple sclerosis', 'migraine', 'bipolar', 'schizophrenia', 'mental illness',
  // mental disorders / psychiatric (client 19.11.2026). Everyday stress, anxiety (חרדה), worry,
  // tension and distraction stay answered; only diagnoses and psychiatric terms are blocked here.
  'מחלות נפש', 'מחלה נפשית', 'מחלות נפשיות', 'בריאות הנפש', 'פסיכוזה', 'פסיכוזות', 'פסיכוטי', 'פסיכוטית', 'דיכאון קליני', 'דפרסיה', 'דו קוטבי', 'דו קוטבית', 'מאניה', 'מאני דפרסיבי',
  'הפרעת אישיות', 'הפרעות אישיות', 'הפרעה טורדנית כפייתית', 'אובססיבית קומפולסיבית', 'פוסט טראומה', 'פוסט טראומטי', 'פוסט טראומטית', 'הפרעת דחק',
  'הפרעת חרדה', 'הפרעות חרדה', 'הפרעת פאניקה', 'הפרעת אכילה', 'הפרעה דיסוציאטיבית', 'הזיות', 'מחשבות שווא', 'פסיכיאטר', 'פסיכיאטרי', 'פסיכיאטרית', 'נוגדי דיכאון', 'תרופות פסיכיאטריות', 'ליתיום',
  'mental disorder', 'mental disorders', 'mental health condition', 'psychosis', 'psychotic', 'clinical depression', 'major depression', 'depressive', 'bipolar disorder', 'mania', 'manic',
  'personality disorder', 'ocd', 'obsessive compulsive', 'ptsd', 'post traumatic', 'anxiety disorder', 'panic disorder', 'eating disorder', 'hallucinations', 'delusions',
  'psychiatric', 'psychiatrist', 'antidepressant', 'antidepressants', 'antipsychotic', 'antipsychotics', 'lithium',
  // pain / inflammation / joints as disease
  'אוסטאופורוזיס', 'פיברומיאלגיה', 'גאוט', 'צנית',
  'osteoporosis', 'fibromyalgia', 'gout',
  // digestive diseases
  'קרוהן', 'קוליטיס', 'צליאק', 'מעי רגיז', 'כיב', 'אולקוס', 'ריפלוקס', 'צרבת', 'עצירות', 'שלשול', 'שלשולים', 'בחילות', 'הקאות', 'הליקובקטר',
  'crohn', 'colitis', 'celiac', 'coeliac', 'ibs', 'ulcer', 'reflux', 'constipation', 'diarrhea', 'diarrhoea', 'nausea',
  // infections / immune disease
  'זיהום', 'זיהומים', 'וירוס', 'וירוסים', 'חיידק', 'קורונה', 'קוביד', 'שפעת', 'הצטננות', 'התקררות', 'דלקת ריאות', 'אנטיביוטיקה', 'איידס', 'הפטיטיס', 'צהבת', 'אוטואימוני', 'אוטואימונית', 'לופוס', 'פסוריאזיס', 'אסטמה', 'אלרגיה', 'אלרגיות', 'אקזמה',
  'infection', 'virus', 'covid', 'corona', 'flu', 'influenza', 'cold', 'pneumonia', 'antibiotic', 'antibiotics', 'hiv', 'aids', 'hepatitis', 'autoimmune', 'lupus', 'psoriasis', 'asthma', 'allergy', 'allergies', 'eczema',
  // organs / endocrine
  'בלוטת התריס', 'כבד שומני', 'שחמת', 'אי ספיקה', 'אי ספיקת כליות', 'אבנים בכליות', 'מחלת כליות',
  'thyroid', 'hypothyroid', 'hyperthyroid', 'fatty liver', 'cirrhosis', 'kidney disease', 'kidney stones', 'renal failure',
  // sexual as disease (urinary-tract and prostate words are allowed — client 16.11.2026)
  'אין אונות', 'אימפוטנציה', 'erectile dysfunction', 'impotence', 
  // medicines / treatment
  'תרופה', 'תרופות', 'תרופתי', 'מרשם', 'טיפול תרופתי', 'אינטראקציה', 'אינטראקציות', 'תופעות לוואי', 'ניתוח', 'אחרי ניתוח', 'לפני ניתוח',
  'medication', 'medications', 'medicine', 'drug', 'drugs', 'prescription', 'interaction', 'interactions', 'side effects', 'surgery',
  // generic
  'מחלה', 'מחלות', 'חולה', 'תסמין', 'תסמינים', 'סימפטום', 'סימפטומים', 'אבחון', 'אבחנה', 'ריפוי', 'לרפא', 'מרפא', 'תחליף לתרופה',
  'disease', 'illness', 'sick', 'symptom', 'symptoms', 'diagnosis', 'cure', 'cures', 'heal', 'treat', 'treatment',
]

/** Shown in place of results when the query is blocked (one paragraph, for legal review). */
export const BLOCKED_MESSAGE: Record<'he' | 'en', string> = {
  he: 'תוספי תזונה אינם מיועדים לאבחון, לטיפול, לריפוי או למניעה של מחלה או מצב רפואי, ולכן האתר אינו מציג מוצרים או מאמרים לפי מצבים רפואיים. לשאלות על מצב בריאותי יש לפנות לרופא/ה המטפל/ת. אפשר לחפש כאן לפי שם מוצר, רכיב, סדרה או תחום.',
  en: 'Dietary supplements are not intended to diagnose, treat, cure or prevent any disease or medical condition, so this site does not show products or articles by medical condition. For questions about a health condition, please consult your physician. You can search here by product name, ingredient, series or area.',
}

/** Words about suicide or self-harm: the chat answers at once with where to get help now
 *  (CHAT_CRISIS_MESSAGE), before anything else and without calling the model. */
export const CRISIS_TERMS: string[] = [
  'התאבדות', 'להתאבד', 'אובדנות', 'אובדני', 'אובדנית', 'מחשבות אובדניות', 'לפגוע בעצמי', 'פגיעה עצמית', 'לא רוצה לחיות', 'לשים קץ לחיי',
  'suicide', 'suicidal', 'kill myself', 'self harm', 'self-harm', 'end my life',
]
export const CHAT_CRISIS_MESSAGE: Record<string, string> = {
  he: 'אם את/ה במצוקה או חושב/ת לפגוע בעצמך, חשוב לפנות לעזרה עכשיו: ער"ן – עזרה ראשונה נפשית בטלפון 1201 (כל שעות היממה), סה"ר – סיוע והקשבה ברשת באתר sahar.org.il, ובמצב חירום מד"א 101. את/ה לא לבד.',
  en: 'If you are in distress or thinking of harming yourself, please reach out for help now. In Israel: ERAN emotional first aid at 1201 (24/7), SAHAR online support at sahar.org.il, and in an emergency Magen David Adom at 101. You are not alone.',
  ar: 'إذا كنتم في ضائقة أو تفكرون في إيذاء أنفسكم، توجهوا للمساعدة الآن: عيران – إسعاف نفسي أولي على الرقم 1201 (على مدار الساعة)، سهر – دعم عبر الإنترنت sahar.org.il، وفي حالة الطوارئ نجمة داود الحمراء 101. لستم وحدكم.',
  ru: 'Если вам тяжело или вы думаете о том, чтобы причинить себе вред, обратитесь за помощью прямо сейчас: ЭРАН — эмоциональная первая помощь по телефону 1201 (круглосуточно), САХАР — поддержка в интернете sahar.org.il, а в экстренной ситуации — «Маген Давид Адом» 101. Вы не одни.',
  fr: 'Si vous êtes en détresse ou pensez à vous faire du mal, demandez de l’aide maintenant : ERAN, premiers secours psychologiques au 1201 (24h/24), SAHAR, soutien en ligne sur sahar.org.il, et en cas d’urgence Magen David Adom au 101. Vous n’êtes pas seul(e).',
}

/** The chat's answer when a question is blocked (plain text, no model call). */
export const CHAT_BLOCKED_MESSAGE: Record<string, string> = {
  he: 'אין לי סמכות רפואית, ותוספי תזונה אינם מיועדים לאבחון, לטיפול, לריפוי או למניעה של מחלה או מצב רפואי, ולכן אינני עונה על שאלות שקשורות למצב רפואי, לתסמינים או לתרופות. לשאלות כאלה יש לפנות לרופא/ה המטפל/ת. אשמח לענות על שאלות על המוצרים עצמם: רכיבים, הוראות שימוש, כשרות, אריזה וזמינות בחנויות.',
  en: 'I have no medical authority, and dietary supplements are not intended to diagnose, treat, cure or prevent any disease or medical condition, so I do not answer questions about medical conditions, symptoms or medicines. Please consult your physician. I am happy to answer questions about the products themselves: ingredients, directions, kosher status, packaging and where to buy.',
}
