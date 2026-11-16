// Medical terms the site never answers with products — EDITABLE, for legal review.
//
// When a search (or a chat question) contains one of these words or phrases, no product
// and no article is shown; the visitor gets BLOCKED_MESSAGE and the series / need links.
// Matching ignores Hebrew prefixes (ה/ו/ב/ל/מ/ש/כ), final letters and plural endings, so
// "לסוכרת", "סוכרתי", "הדיכאון" all count. English terms match whole words.
//
// Keep this list to diseases, conditions, symptoms, diagnoses and medicines. Everyday
// well-being words the site already uses on its needs pages (שינה, עיכול, אנרגיה, חורף…)
// stay in searchKeywords.ts.

export const BLOCKED_TERMS: string[] = [
  // metabolic / weight
  'סוכרת', 'סוכר בדם', 'אינסולין', 'השמנה', 'השמנת יתר', 'עליה במשקל', 'עלייה במשקל', 'ירידה במשקל', 'הרזיה', 'להרזות', 'לרזות', 'דיאטה', 'אנורקסיה', 'בולימיה', 'הפרעות אכילה',
  'diabetes', 'insulin', 'obesity', 'weight loss', 'weight gain', 'diet', 'anorexia', 'bulimia',
  // cancer
  'סרטן', 'גידול', 'גידולים', 'כימותרפיה', 'הקרנות', 'cancer', 'tumor', 'tumour', 'chemotherapy', 'oncology',
  // heart / blood
  'לחץ דם', 'יתר לחץ דם', 'כולסטרול', 'טריגליצרידים', 'מחלת לב', 'מחלות לב', 'התקף לב', 'אוטם', 'שבץ', 'קריש דם', 'קרישי דם', 'קרישה', 'אנמיה', 'דימום',
  'blood pressure', 'hypertension', 'cholesterol', 'heart disease', 'heart attack', 'stroke', 'blood clot', 'anemia', 'anaemia',
  // mental health / neuro
  'דיכאון', 'חרדה', 'התקף חרדה', 'הפרעה נפשית', 'הפרעות נפשיות', 'מחלת נפש', 'סכיזופרניה', 'ביפולרי', 'הפרעת קשב', 'הפרעות קשב', 'אוטיזם', 'אלצהיימר', 'דמנציה', 'פרקינסון', 'אפילפסיה', 'טרשת נפוצה', 'מיגרנה', 'כאב ראש', 'כאבי ראש', 'נדודי שינה', 'אינסומניה',
  'depression', 'anxiety', 'adhd', 'autism', 'alzheimer', 'dementia', 'parkinson', 'epilepsy', 'multiple sclerosis', 'migraine', 'insomnia', 'bipolar', 'schizophrenia', 'mental illness',
  // pain / inflammation / joints as disease
  'כאב', 'כאבים', 'דלקת', 'דלקות', 'דלקת פרקים', 'דלקת מפרקים', 'ארתריטיס', 'אוסטאופורוזיס', 'פיברומיאלגיה', 'גאוט', 'צנית',
  'pain', 'inflammation', 'arthritis', 'osteoporosis', 'fibromyalgia', 'gout',
  // digestive diseases
  'קרוהן', 'קוליטיס', 'צליאק', 'מעי רגיז', 'כיב', 'אולקוס', 'ריפלוקס', 'צרבת', 'עצירות', 'שלשול', 'שלשולים', 'בחילות', 'הקאות', 'הליקובקטר',
  'crohn', 'colitis', 'celiac', 'coeliac', 'ibs', 'ulcer', 'reflux', 'constipation', 'diarrhea', 'diarrhoea', 'nausea',
  // infections / immune disease
  'זיהום', 'זיהומים', 'וירוס', 'וירוסים', 'חיידק', 'קורונה', 'קוביד', 'שפעת', 'הצטננות', 'התקררות', 'דלקת ריאות', 'אנטיביוטיקה', 'איידס', 'הפטיטיס', 'צהבת', 'אוטואימוני', 'אוטואימונית', 'לופוס', 'פסוריאזיס', 'אסטמה', 'אלרגיה', 'אלרגיות', 'אקזמה',
  'infection', 'virus', 'covid', 'corona', 'flu', 'influenza', 'cold', 'pneumonia', 'antibiotic', 'antibiotics', 'hiv', 'aids', 'hepatitis', 'autoimmune', 'lupus', 'psoriasis', 'asthma', 'allergy', 'allergies', 'eczema',
  // organs / endocrine
  'בלוטת התריס', 'תת פעילות', 'יתר פעילות', 'כבד שומני', 'שחמת', 'אי ספיקה', 'אי ספיקת כליות', 'אבנים בכליות', 'מחלת כליות',
  'thyroid', 'hypothyroid', 'hyperthyroid', 'fatty liver', 'cirrhosis', 'kidney disease', 'kidney stones', 'renal failure',
  // sexual / urinary as disease
  'אין אונות', 'אימפוטנציה', 'דלקת בדרכי השתן', 'זיהום בדרכי השתן', 'erectile dysfunction', 'impotence', 'uti',
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

/** The chat's answer when a question is blocked (plain text, no model call). */
export const CHAT_BLOCKED_MESSAGE: Record<string, string> = {
  he: 'אין לי סמכות רפואית, ותוספי תזונה אינם מיועדים לאבחון, לטיפול, לריפוי או למניעה של מחלה או מצב רפואי, ולכן אינני עונה על שאלות שקשורות למצב רפואי, לתסמינים או לתרופות. לשאלות כאלה יש לפנות לרופא/ה המטפל/ת. אשמח לענות על שאלות על המוצרים עצמם: רכיבים, הוראות שימוש, כשרות, אריזה וזמינות בחנויות.',
  en: 'I have no medical authority, and dietary supplements are not intended to diagnose, treat, cure or prevent any disease or medical condition, so I do not answer questions about medical conditions, symptoms or medicines. Please consult your physician. I am happy to answer questions about the products themselves: ingredients, directions, kosher status, packaging and where to buy.',
}
