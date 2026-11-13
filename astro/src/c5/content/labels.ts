// Product labels as text ("תווית המוצר" on the product page).
// The label is shown as structured, readable text — never as an image — so screen
// readers and people who enlarge text can read it. One entry per product slug
// (the old-site slug also works for products that have a `source`).
//
// Format — every part is optional, fill in only what is printed on the label:
//   title        the label's opening line (product name + short description)
//   ingredients  the "רכיבים" running text, as printed
//   table        the values table: `columns` are the header cells (omit when the
//                label's table has no header row), each row starts with the
//                ingredient name; `caption` is the table's printed heading, if any
//   facts        [label, value] rows printed as "label: value" (אינו מכיל, משקל
//                כמוסה, משקל נקי, אנרגיה, הוראות שימוש …)
//   notes        footnotes and remaining lines (*, **, warnings), as printed
//
// Rules: copy the label exactly (numbers, units, asterisks). Never add data that is
// not printed on the label. Text transcribed from a label scan must be proofread
// against the physical label.

export interface ProductLabel {
  title?: string
  ingredients?: string
  table?: { caption?: string; columns?: string[]; rows: string[][] }
  facts?: Array<[label: string, value: string]>
  notes?: string[]
}

/** Header cells of the "% מהקצובה היומית המומלצת" pair of columns. */
const rda = (ages = '25-50') => [`% מהקצובה היומית המומלצת לגילאי ${ages} – נשים`, `% מהקצובה היומית המומלצת לגילאי ${ages} – גברים`]

const GMO_VEGAN = '* אינו מהונדס גנטית | GMO FREE | מתאים לטבעונים'
const LIPOSOME = '** ליפוזום נבדק במיקרוסקופ אלקטרוני'
const ENERGY: [string, string] = ['אנרגיה', 'פחות מ-10 קק"ל למנה.']

const STRAINS_53 =
  'B.bifidum BB02; B.bifidum SP9; B.adolescentis SP77; L.casei BGP93; L.casei LC10; L.casei LC11; L.reuteri LR92; B.breve Bbr8; B.breve BL10; L.crispatus SP28; L.rhamnosus SP1; L.rhamnosus LB21; L.rhamnosus IMC501; L.rhamnosus LR1; L.rhamnosus LRH01; L.rhamnosus LRH05; L.rhamnosus LRH14; L.rhamnosus LRH58; B.longum ssp.longum SP54; L.fermentum LF2; L.fermentum CS57; L.salivarius SP2; B.animalis lactis ssp lactis BLC1; B.animalis lactis ssp lactis Bi1; L.lactis ssp.lactis SP38; L.lactis ssp.lactis SP47; L.lactis ssp.lactis SD13; L.lactis ssp lactis SL97; L.helveticus SP27; helveticus LH102; St.thermophilus SP4; S.thermophilus Z57; S.thermophilus ST628; L.acidophilus LA3; L.acidophilus LA1; L.buchneri LBC01; L.delbrueckii ssp.bulgaricus LB2; L.delbrueckii ssp.bulgaricus LB284; L.plantarum 14D; L.plantarum LB931; L.plantarum BG112; L.plantarum LP48; Pd.acidilatici PA09; L.paracasei IMC502; L.paracasei 101/37; L.paracasei BGP1; L.paracasei BGP2; L.paracasei LPC43; Pd.pentosaceus PP02; L.brevis SP48; L.sakei LSK04; L.sakei LSK14; L.lactis LL82'

export const LABELS: Record<string, ProductLabel> = {
  'lipozamin-fe': {
    title: 'ליפוזומין Fe - פורמולה חדשנית המשלבת ברזל עדין מסוג ביסגליצינאט במעטפת פוספוליפידים במבנה של ליפוזום.',
    ingredients: 'תאית צמחית (חומר מילוי), כמוסה צמחית - תאית, ברזל ביסגליצינאט ליפוזומלי.',
    table: {
      columns: ['רכיבים', 'כמות אלמנטלית בכמוסה', ...rda()],
      rows: [['ברזל ביסגליצינאט ליפוזומלי (Liposomal Iron Bisglycinate) **', '27 מ"ג ברזל', '180%', '270%']],
    },
    facts: [
      ['אינו מכיל', 'חומרים משמרים, חומרים מן החי, ממתיקים, סוכר, חומרי טעם וריח, חיטה, סויה חלב, סיליקון דיאוקסיד.'],
      ['משקל כמוסה', 'כ-500 מ"ג'],
      ['משקל נקי', 'כ-30 גר\''],
      ['לפתיחה', 'יש ללחוץ על הפקק ולסובב.'],
      ENERGY,
      ['הוראות שימוש', '1 כמוסה ליום עם השתייה.'],
    ],
    notes: ['* GMO FREE | אינו מהונדס גנטית | מתאים לטבעונים', LIPOSOME, 'מוצר זה נארז בפקק מוגן לילדים.'],
  },

  'bio-vera': {
    title: 'BioVera™ - הרכב ייחודי של פוסט-ביוטיקה ופרוביוטיקה מזן נחקר עם ג\'ל אלוורה אורגנית בספקטרום רחב ומשקל מולקולרי נמוך של כל חלקי החומר הפעיל אסמנאן - (400-50 KDa Acemannan).',
    ingredients: '* קומפלקס כורכומינואידים וסיבים משורש כורכום טבעי ושרף אסאפוטידה במיקרואנקפסולציה של פוספוליפידים בטכנולוגיית MFM***, כמוסה צמחית, אבקת ג\'ל אלוורה רפואית אורגנית בריכוז פוליסכרידים גבוה - BiAloe®** (Organic Aloe barbadensis Miller - inner leaf juice), כ-18% פוליסכרידים מסוג אסמנאן - (Acemannan Poly Acetyl Mannans), אבקת בננות ירוקות (60% עמילן עמיד) - (NuBana™ RS65 Green Banana*), ל-גלוטמין - (L-glutamine), טורמרונים משמן כורכום - (Curcuma longa Turmerones), פרוביוטיקה - בצילוס קואגולנס - (Bacillus coagulans - SNZ 1969), פרוביוטיקה - בצילוס סובטיליס - (Bacillus subtilis MB BSM12), פוסט-ביוטיקה**** - לקטובצילוס אסידופילוס - (Lactobacillus acidophilus LA1).',
    table: {
      columns: ['הרכב פרוביוטיקה', 'כמות בכמוסה'],
      rows: [
        ['Bacillus Coagulans SNZ 1969 *', '2 מיליארד חיידקים CFU'],
        ['Bacillus subtilis MB BSM12 *', '2 מיליארד חיידקים CFU'],
        ['Lactobacillus acidophilus LA1 ****', '1 מיליארד חיידקים CELLS'],
      ],
    },
    notes: [
      '** ג\'ל אלוורה ללא חלקי הקליפה של העלה | ** ג\'ל אלוורה ללא אלואין ALOINE FREE | ** הג\'ל מיוצר בייבוש בהקפאה FREEZE DRYING',
      '*** Microencapsulated Full Natural Matrix',
      '**** PostBiotics',
    ],
  },

  'lipozamin-mg-spectrum': {
    title: 'ליפוזומין Mg ספקטרום™ - קומפלקס מגנזיום צ\'לט ליפוזומלי בגודל חלקיקי ננו הכולל ספקטרום רחב של שלוש נגזרות מגנזיום שונות.',
    ingredients: 'קומפלקס מגנזיום ליפוזומלי (ליפוזום מגאם ערביק ולציטין חמניות (אינו מהונדס גנטית), מגנזיום צ\'לט ביסגליצינאט ליפוזומלי, מגנזיום צ\'לט מלאט ליפוזומלי, מגנזיום צ\'לט טאורט ליפוזומלי), כמוסה (תאית צמחית - HPMC).',
    table: {
      columns: ['רכיבים בכמוסה', 'כמות אלמנטלית בכמוסה', ...rda()],
      rows: [['קומפלקס מגנזיום ביסגליצינאט, מלאט, טאורט ליפוזומלי 680 מ"ג – Liposomal Nano Magnesium Bis-glycinate, Malate, Taurate (Chelated & Fully Reacted) **', '37.4 מ"ג', '13%', '11%']],
    },
    facts: [['משקל כמוסה', '800 מ"ג'], ['משקל נקי', '48 גר\''], ENERGY, ['הוראות שימוש', '1-2 כמוסה ליום.']],
    notes: [LIPOSOME],
  },

  'geniflora-c15': {
    title: 'ג\'ניפלורה C15 – קומפלקס זני פרוביוטיקה נחקרים בנשים בתוספת די מאנוז.',
    table: {
      columns: ['רכיבים', 'כמות בכמוסה'],
      rows: [
        ['די - מאנוז - (D - mannose) *', '250 מ"ג'],
        ['L. rhamnosus CA15 – זן חיידק פרוביוטי נחקר *', '25 מיליארד חיידקים'],
        ['כמוסה צמחית - DRcaps® בטכנולוגיית שחרור מושהה *', '-'],
        ['Bacillus Coagulans SNZ 1969 – זן חיידק פרוביוטי נחקר *', '2 מיליארד חיידקים'],
      ],
    },
    facts: [
      ['המוצר אינו מכיל', 'חלב, לקטוז, גלוטן, חיטה, ביצים, שמרים, סויה, חומרי טעם וצבע מלאכותיים, חומרים משמרים.'],
      ['משקל כמוסה', 'כ-495 מ"ג'],
      ['משקל נקי', 'כ-14.85 גר\''],
      ENERGY,
      ['הוראות שימוש', '2 כמוסות ליום.'],
    ],
    notes: ['** GMO FREE | אינו מהונדס גנטית | מתאים לטבעונים'],
  },

  'umanaflora-53': {
    table: {
      columns: ['רכיבים', 'כמות בכמוסה'],
      rows: [
        [`הומנפלורה 53 - קומפלקס 53 זני חיידקים פרוביוטים * **: ${STRAINS_53}`, '150 מיליארד חיידקים'],
        ['מצע פרה - ביוטיקה - תערובת סכרידים טבעיים מתירס (מלטודקסטרין שאינו מעובד) *', '-'],
        ['כמוסה צמחית - בטכנולוגיית שחרור מושהה - DRcaps® *', '-'],
      ],
    },
  },

  'protesterol-40': {
    ingredients: '* PROSMAN® - קומפלקס פיטוסטרולים מתמצית שזיף אירופאי (Prunus Domestica D.E). תמצית דקל ננסי (Saw Palmetto D.E), כמוסה - תאית צמחית, Liboost® - תמצית עלי דמיאנה (1.5% פלבנואידים) (Turnera diffusa D.E), תמצית זרעי דלעת (Pumpkin Seed D.E), אפימדיום (Epimedium brevicornum D.E-10% Icariin), נ-אצטיל ל-ציסטאין (NAC), חומצה אלפא ליפואית (Alpha Lipoic Acid), חומצת אמינו ל-ארגינין (L-arginine), חומצת אמינו ל-ציטרולין (L-citrulline), חומצת אמינו אציטיל ל-קרנטין (Acetyl-L-Carnitine), אשווגנדה ליפוזומלי** (Withania somnifera D.E), קוורצטין 98%, רוטין 95%, תמצית קטב מצוי (Tribulus terrestris D.E), תמצית סרפד (Urtica dioica D.E), תמצית זרעי חילבה ליפוזומלי** (20% ספונינים) (Fenugreek D.E), תמצית קליפת עץ אורן (Pine Bark D.E). קומפלקס בטא קריופילן ביסקורן ושורש כורכום ליפוזומלי**, ליקופן מעגבניות.',
    facts: [ENERGY, ['הוראות שימוש', '2-3 כמוסות ליום עם השתייה.'], ['משקל כמוסה', 'כ-500 מ"ג'], ['משקל נקי', 'כ-30 גר\'']],
    notes: ['המוצר מכיל L-CITRULLINE.', '* GMO FREE | אינו מהונדס גנטית | מתאים לטבעונים'],
  },

  'revival-20': {
    title: 'רויוואל 20+™ - פורמולה לנשים - קומפלקס ס-אדנוזיל ל-מתיונין ומגנזיום אצטיל טאורינט',
    ingredients: 'כמוסה צמחית*, ס-אדנוזיל ל-מתיונין - 100 מ"ג, SAMe* (S-adenosylmethionine), LIBOOST® - תמצית עלי דמיאנה - (1.5% פלבנואידים) - (Turnera diffusa D.E), תמצית אפימדיום - (Epimedium grandiflorum D.E), מגנזיום אצטיל טאורינט, MATA™ - קומפלקס ליפוזומלי - בטא קריופילן, ביוסקרן וכורכום ליפוזומלי**, תמצית אשווגנדה ליפוזומלי** - (Withania somnifera D.E), תמצית זרעי חילבה - ליפוזומלי** (20% סאפונינים) - (Liposomal Fenugreek - Trigonella foenum-graecum D.E).',
    table: {
      columns: ['רכיבים', 'כמות אלמנטלית בכמוסה', ...rda()],
      rows: [['MATA™ מגנזיום אצטיל טאורינט 390 מ"ג – Magnesium Acetyl Taurinate *', '25.35 מ"ג', '9%', '7.2%']],
    },
    facts: [
      ['המוצר אינו מכיל', 'פוליאתילן גליקול (PEG), חומרים משמרים, חומרים מן החי, סוכר, ממתיקים, חומרי טעם וצבעי מאכל, סויה, חיטה חלב ומוצריו.'],
      ['משקל כמוסה', 'כ-750 מ"ג'],
      ['משקל נקי', 'כ-45 גר\''],
    ],
    notes: ['* אינו מהונדס גנטית | GMO FREE | מתאים לטבעונים'],
  },

  'lpldl-probiotic': {
    title: 'הומנפלורה LPLDL - הרכב ייחודי של פרוביוטיקה מזנים נחקרים.',
    table: {
      columns: ['רכיבים', 'כמות בכמוסה'],
      rows: [
        ['מצע פרה-ביוטיקה - תערובת סכרידים טבעיים מתירס (מלטודקסטרין שאינו מעובד) *', '-'],
        ['כמוסה צמחית - בשחרור מושהה - DRcaps®', '-'],
        ['LPLDL® - חיידק פרוביוטי נחקר – Lactobacillus plantarum - ECGC 13110402 *', '4 מיליארד חיידקים'],
        ['DE111® - חיידק פרוביוטי נחקר – Lactobacillus plantarum *', '1 מיליארד חיידקים'],
      ],
    },
    facts: [
      ['המוצר אינו מכיל', 'חלב, גלוטן, חיטה, ביצים, שמרים, סויה, בוטנים, חרדל, סלרי, שומשום, סוכר, ממתיקים, חומרי טעם וצבע מלאכותיים, חומרים משמרים, חומרים מייצבים, סיליקון דיאוקסיד.'],
      ['משקל כמוסה', 'כ-480 מ"ג'],
      ['משקל נקי', 'כ-14.4 גר\''],
      ENERGY,
      ['הוראות שימוש', '1-2 כמוסות ליום.'],
    ],
    notes: ['** GMO FREE | אינו מהונדס גנטית | מתאים לטבעונים'],
  },

  'quick-c': {
    ingredients: 'ממתיקים (סורביטול מטפיוקה, סוכרלוז, גליקוזידים של סטיביול מסטיביה), ויטמין C ליפוזומלי (ליפוזום המכיל חומצה אסקורבית (ויטמין C), גאם ערביק, לציטין חמניות), סוכריות קופצות (ממתיק (איזומאלט), פחמן דו חמצני), חומרי טעם וריח בטעם ענבים.',
    table: {
      columns: ['רכיבים', 'כמות אלמנטלית ביחידה', ...rda()],
      rows: [['ויטמין C ליפוזומלי - 500 מ"ג (Liposomal Vitamin C as Ascorbic Acid)', '350 מ"ג', '583%', '583%']],
    },
    notes: [GMO_VEGAN, LIPOSOME, 'מכיל סוכרים רב כהליים, צריכה מופרזת עלולה לגרום לפעילות מעיים מוגברת.'],
  },

  'lipozamin-glutathione': {
    title: 'ליפוזומין Glutathione™ - ל-גלוטתיון צ\'לט ליפוזומלי מחוזר בגודל חלקיקי ננו.',
    ingredients: 'ל-גלוטתיון (מחוזר) ליפוזומלי - (ליפוזום המכיל גאם ערביק, ל-גלוטתיון (L-Glutathione Reduced), לציטין חמניות), כמוסה (תאית צמחית - HPMC).',
    table: {
      columns: ['רכיבים', 'כמות אלמנטלית בכמוסה'],
      rows: [['ל-גלוטתיון ליפוזומלי 500 מ"ג – Liposomal Nano L-Glutathione reduced Chelated & Fully Reacted **', '200 מ"ג']],
    },
    facts: [ENERGY, ['הוראות שימוש', '1 כמוסה ליום.'], ['משקל כמוסה', '595 מ"ג'], ['משקל נקי', '35.7 גר\'']],
    notes: ['* אינו מהונדס גנטית | מתאים לטבעונים'],
  },

  'lipozamin-nicotinamide': {
    title: 'ליפוזומין Nicotinamide™ - ויטמין B3 בנגזרת ניקוטינאמיד ריבוזיד כלוריד ליפוזומלי בגודל חלקיקי ננו.',
    ingredients: 'ניקוטינאמיד ריבוזיד כלוריד B3 ליפוזומלי (Liposomal B3 as Nicotinamide Riboside Chloride) (ליפוזום המכיל גאם ערביק, ניקוטינאמיד ריבוזיד כלוריד ולציטין חמניות (אינו מהונדס גנטית)), כמוסה (תאית צמחית – HPMC).',
    table: {
      columns: ['רכיבים בכמוסה', 'כמות אלמנטלית בכמוסה', ...rda()],
      rows: [['ויטמין B3 כניקוטינאמיד ריבוזיד כלוריד ליפוזומלי – Liposomal Vitamin B3 Nicotinamide Riboside Chloride **', '100 מ"ג', '667%', '526%']],
    },
    facts: [
      ['המוצר אינו מכיל', 'פוליאתילן גליקול (PEG), חומרים משמרים, חומרים מן החי, סוכר, ממתיקים, חומרי טעם וריח, צבעי מאכל, סויה, חיטה חלב ומוצריו.'],
      ['משקל כמוסה', '595 מ"ג'],
      ['משקל נקי', '35.7 גר\''],
      ENERGY,
      ['הוראות שימוש', '1 כמוסה ליום. לשימוש מגיל 18. אינו מיועד לנשים בהריון ונשים מניקות.'],
    ],
    notes: [GMO_VEGAN],
  },

  'lipozamin-b12-spectrum': {
    title: 'ליפוזומין B12 ספקטרום™ - קומפלקס ויטמין B12 בספקטרום רחב הכולל שלוש נגזרות שונות של ויטמין B12 - מתיל, אדנוזיל והידרוקסי בתוספת מתיל פולאט.',
    ingredients: 'אבקת תרד טבעית (Spinach powder) שאינה מהונדסת גנטית, כמוסה צמחית - תאית, קומפלקס B12, הידרוקסיקובלמין, מתיל פולאט - (5-MTHF) - (נגזרת פעילה של חומצה פולית B9).',
    table: {
      columns: ['רכיבים', 'כמות אלמנטלית בכמוסה', ...rda()],
      rows: [
        ['קומפלקס קואנזים B12 ליפוזומלי: מתילקובלמין - ליפוזומלי, אדנוזילקובלמין - ליפוזומלי (As Liposomal B12) **', '800 מיקרוגרם', '40,000%', '40,000%'],
        ['הידרוקסוקובלמין B12 (As B12) *', '200 מיקרוגרם', '10,000%', '10,000%'],
        ['מתיל פולאט (5-MTHF) *', '200 מיקרוגרם', '111%', '110%'],
      ],
    },
    notes: [LIPOSOME],
  },

  'lipozamin-calcium': {
    title: 'ליפוזומין Calcium™ - סידן קרבונט ליפוזומלי בגודל חלקיקי ננו בתוספת דלפינידין וויטמין D3.',
    ingredients: 'סידן קרבונט ליפוזומלי (ליפוזום המכיל סידן קרבונט, גאם ערביק, לציטין חמניות (אינו מהונדס גנטית)), כמוסה (תאית צמחית - HPMC), תמצית מאקי ברי Delphinol® המכילה 25% דלפינידין, 35% אנתוציאנינים (Aristotelia chilensis), ויטמין D3 כולקלציפרול VegD3® (ממקור צמחי אורגני שאינו מהונדס גנטית).',
    table: {
      columns: ['רכיבים בכמוסה', 'כמות אלמנטלית בכמוסה', ...rda('51-70')],
      rows: [
        ['סידן קרבונט ליפוזומלי ** 743 מ"ג – Liposomal (Nano) Calcium Carbonate', '149 מ"ג', '19%', '19%'],
        ['VegD3® - ויטמין D3 כולקלציפרול', '400IU', '67%', '67%'],
      ],
    },
    facts: [ENERGY, ['הוראות שימוש', '1-2 כמוסה ליום. מומלץ אחת בבוקר ואחת בערב.'], ['משקל כמוסה', '880 מ"ג'], ['משקל נקי', '52.8 גר\'']],
    notes: [GMO_VEGAN],
  },

  'lipozamin-mg-complex': {
    title: 'ליפוזומין Mg™ - קומפלקס מגנזיום ציטראט ליפוזומלי ומגנזיום אוקסיד במיקרו-אינקפסולציה של פוספוליפידים.',
    ingredients: 'קומפלקס מגנזיום ציטראט ליפוזומלי, ליפוזום מגאם ערביק ולציטין חמניות (אינו מהונדס גנטית), מגנזיום אוקסיד במיקרו-אינקפסולציה של פוספוליפידים מלציטין חמניות, (אינו מהונדס גנטית) כמוסה (תאית צמחית - HPMC).',
    table: {
      columns: ['רכיב בכמוסה', 'כמות אלמנטלית בכמוסה', ...rda()],
      rows: [['קומפלקס מגנזיום ציטראט ליפוזומלי ומגנזיום אוקסיד במיקרו-אינקפסולציה של פוספוליפידים – (Liposomal Magnesium Citrate) ** (Microencapsulated Magnesium Oxide)', '126 מ"ג מגנזיום', '45%', '36%']],
    },
    notes: ['* אינו מהונדס גנטית | מתאים לטבעונים', LIPOSOME],
  },

  'lipozamin-q10-spectrum': {
    title: 'ליפוזומין Q10 – Spectrum – ספקטרום רחב של נגזרות קו אנזים CoQ10 מסוג יוביקווינול ליפוזומלי (מחוזר) ויוביקווינון ליפוזומלי בגודל חלקיקי ננו ול-גלוטתיון (מחוזר).',
    ingredients: '* חומר מילוי (גאם ערביק), ל-גלוטתיון (מחוזר) - (L-Glutathione Reduced) 100 מ"ג, כמוסה - (תאית צמחית - HPMC), ** קו אנזים CoQ10 (מחוזר) יוביקווינול ליפוזומלי (Liposomal CoQ10 Ubiquinol Acetate Reduced) 50 מ"ג – (ליפוזום המכיל גאם ערביק, יוביקווינול אצטט, לציטין חמניות) (אינו מהונדס גנטית), ** קו אנזים CoQ10 יוביקווינון ליפוזומלי, (Liposomal CoQ10 Ubiquinone) 50 מ"ג - (ליפוזום המכיל גאם ערביק, יוביקווינון, לציטין חמניות) (אינו מהונדס גנטית).',
    facts: [
      ['אינו מכיל', 'פוליאתילן גליקול (PEG), חומרים משמרים, חומרים מן החי, סוכר, ממתיקים, חומרי טעם וריח, צבעי מאכל, סויה, חיטה, חלב ומוצריו.'],
      ENERGY,
      ['הוראות שימוש', '1 כמוסה ליום.'],
      ['משקל כמוסה', '510 מ"ג'],
      ['משקל נקי', '30.6 גרם'],
    ],
    notes: [GMO_VEGAN],
  },

  'lipozamin-se': {
    title: 'ליפוזומין Se™ - סלניום ל-סלנו-מתיונין צ\'לט ליפוזומלי בגודל חלקיקי ננו וגלוטתיון.',
    ingredients: 'חומר מילוי (גאם ערביק), כמוסה (תאית צמחית – HPMC), גלוטתיון (מחוזר) 50 מ"ג, (L-Glutathione reduced) סלניום ל-סלנו-מתיונין צ\'לט ליפוזומלי (ליפוזום המכיל גאם ערביק, סלניום מתיונין, לציטין חמניות) (אינו מהונדס גנטית)).',
    table: {
      columns: ['רכיבים בכמוסה', 'כמות אלמנטלית בכמוסה', ...rda()],
      rows: [['סלניום ל-סלנו-מתיונין צ\'לט ליפוזומלי – Liposomal Nano Selenium L-seleno-methionine Chelated & Fully Reacted **', '100 מק"ג', '182%', '143%']],
    },
    facts: [ENERGY, ['הוראות שימוש', '1 כמוסה ליום.'], ['משקל כמוסה', '510 מ"ג'], ['משקל נקי', '30.6 גרם']],
    notes: [GMO_VEGAN],
  },

  'cogni-mg': {
    ingredients: '* מגנזיום טאורט, COGNITAVEN® - תמצית שיבולת שעול ירוקה מן הבר, כמוסה - תאית צמחית, קומפלקס בטא קריופילן, כורכום וביסקורן ליפוזומלי*** בפוספטידיל כולין מלציטין חמניות שאינו מהונדס גנטית, פיקוציאנין מתמצית אצת ספירולינה.**',
    table: {
      columns: ['רכיבים: כל כמוסה מכילה', 'כמות אלמנטלית בכמוסה', 'אחוז מהקצובה היומית המומלצת לגילאי 25-50 – נשים', 'אחוז מהקצובה היומית המומלצת לגילאי 25-50 – גברים'],
      rows: [
        ['מגנזיום טאורט - 300 מ"ג * **', '24 מ"ג מגנזיום', '8.5%', '6.8%'],
        ['COGNITAVEN® תמצית שיבולת שועל ירוקה. (Avena sativa DE) * **', '144 מ"ג', '-', '-'],
      ],
    },
    facts: [ENERGY, ['משקל כמוסה', 'כ-600 מ"ג'], ['משקל נקי', 'כ-54 גר\'']],
    notes: ['* GMO FREE - אינו מהונדס גנטית | ** מתאים לטבעונים ולצמחוניים', '*** ליפוזום נבדק במיקרוסקופ אלקטרוני'],
  },

  'relacton-alpha': {
    title: 'רילקטון אלפא™ - קומפלקס חלבון חלב פטנטי נחקר עם פפטיד מסוג אלפא-קזוזפין.',
    ingredients: '* LACTIUM® - (300 מ"ג) חלבון חלב שעבר הידרוליזה (5.4 מ"ג אלפא - קזוזפין - (Alpha-Casozepine)), כמוסה צמחית - תאית, ס-אדנוזיל ל-מתיונין - (SAMe - S-adenosylmethionine), MAGSHAPE™ - מגנזיום במיקרו-אינקפסולציה של פוספוליפידים (כמגנזיום אוקסיד), גאבא - חומצה גאמא-אמינובוטירית - (GABA - Gamma-aminobutyric acid), ** קומפלקס ליפוזומלי - בטא קריופילן, ביוסקרן, וכורכום ליפוזומלי, מתיל פולאט אמורפי - נגזרת פעילה של חומצה פולית (B9 (6S)-5-Methyltetrahydrofolate).',
    table: {
      columns: ['רכיב בכמוסה', 'כמות אלמנטלית בכמוסה', ...rda()],
      rows: [
        ['MAGSHAPE™ מגנזיום אוקסיד במיקרו-אינקפסולציה 200 מ"ג (Magnesium Oxide Microcapsules) **', '60 מ"ג מגנזיום', '24%', '17.1%'],
        ['מתיל פולאט אמורפי (6S) 5-MTHF', '200 מיקרוגרם', '111%', '100%'],
      ],
    },
    notes: [LIPOSOME],
  },

  'umanaflora-daily': {
    title: 'הומנפלורה דיילי™ - קומפלקס פוסטביוטיקה ופרוביוטיקה מזנים נחקרים לשימוש יום יומי.',
    table: {
      columns: ['רכיבים', 'כמות בכמוסה'],
      rows: [
        ['* מצע פרה - ביוטיקה - תערובת סכרידים טבעיים מתירס (מלטודקסטרין שאינו מעובד)', '-'],
        ['כמוסה צמחית - תאית', ''],
        [`קומפלקס 53 זני חיידקים פרוביוטים *: ${STRAINS_53}`, '10 מיליארד חיידקים'],
        ['* CRL1505™ L. rhamnosus – פוסטביוטיקה מזן לקטובצילוס רמנוסוס נחקר', '6 מיליארד'],
        ['* DE111 Bacillus subtilis – בצילוס סובטיליס מזן נחקר', '2 מיליארד'],
        ['* SNZ 1969 Bacillus Coagulans – בצילוס קואגולנס מזן נחקר', '2 מיליארד'],
      ],
    },
  },

  winterguard: {
    ingredients: 'קוורצטין ליפוזומלי, תמצית עלי זית - ISENOLIC® (Olea europaea D.E - 4% Elenolic acid), כמוסה צמחית - תאית, תמצית עלי זית - OLIVEACTIVE® (Olea europaea D.E - 20% Oleuropein 2% Flavonoid), תמצית טימין (קורנית) - (Thymus vulgaris D.E), פוליפנולים מקליפת עץ קינמון - (Cinnamomum cassia Presl D.E - 20% Polyphenols), קומפלקס ג\'ינג\'רול, שגאול ושמן ג\'ינג\'ר בטכנולוגיית PNS - (Zingiber officinale D.E), פוליפנולים מסמבוק שחור - (Sambucus nigra D.E - 25% Polyphenols), תמצית דובדבן אסרולה - (Malpighia glabra D.E), רוטין.*',
    facts: [ENERGY, ['הוראות שימוש', '1 כמוסה ליום עם השתיה.']],
    notes: ['קוורצטין ליפוזומלי (98%) - 250 מ"ג **', GMO_VEGAN, LIPOSOME],
  },

  'kalnozim-digestive-enzymes': {
    title: 'קלנוזים - קומפלקס אנזימי עיכול בתוספת אלפא-גלקטוזידאז, צמחי תבלין ופרוביוטיקה. ספקטרום אנזימי עיכול רחב למוצרי חלב, ירקות, פחמימות, שומנים וחלבונים בתוספת אנזים אלפא-גלקטוזידאז לירקות וקטניות כגון חומוס, שעועית ועדשים.',
    ingredients: '* *** אנזים אלפא-גלקטוזידאז, *** קומפלקס אנזימי עיכול - (עמילאז, לקטאז, ברומלין, ליפאז, פרוטאז, אינוורטאז, פקטינאז), כמוסה צמחית – תאית, ** מיצוי שורש ג\'ינג\'ר טבעי בטכנולוגיית MFM (Zingiber officinale D.E), 10% ג\'ינג\'רולים (Gingerols), 5% שוגאול (Shogaol), 3% שמן ג\'ינג\'ר, כוכב אניס - (Star anise Illicium verum), תמצית קינמון (Cinnamon cassia Presl Bark D.E - 20% Polyphenol). פרוביוטיקה - בצילוס קואגולנס (2 מיליארד חיידקים CFU) - (Bacillus coagulans - SMZ 1969).',
    table: {
      caption: '*** קומפלקס אנזימי עיכול המספק:',
      rows: [
        ['אלפא - גלקטוזידאז - (Alpha - Galactosidase)', '300 GALU'],
        ['עמילאז - (Amylase)', '12,500 DU'],
        ['לקטאז - (Lactase)', '1,300 ALU'],
        ['ברומלין - (Bromelain)', '750,000 FCCPU'],
        ['ליפאז - (Lipase)', '1,875 IU'],
        ['פרוטאז - (Protease)', '25,000 IU'],
        ['אינוורטאז - (Invertase)', '400 SU'],
        ['פקטינאז - (Pectinase)', '12.5 endo-PGU'],
      ],
    },
    notes: [GMO_VEGAN],
  },

  'giallocur-nano-curcumin': {
    title: 'ג\'אלוקור - ספקטרום רחב של כורכומין, טורמרונים, כורכומינואידים וקרוטנואידים בטכנולוגית מיקרו-אנקפסולציה טבעית לספיגה גבוהה, בתוספת זעפרן.',
    ingredients: 'תמצית ננו כורכומין טבעי משורש כורכום (Curcuma longa D.E)*-***. כמוסה - תאית צמחית*. תמצית כורכומין 95% משורש כורכום טבעי (Curcuma longa D.E)*-***. טורמרונים משמן כורכום טבעי (Curcuma longa Turmerones D.E). קומפלקס מיקרו - אינקפסולציה של כורכומינואידים, כורכומין ושמן כורכום משורש כורכום טבעי בטכנולוגיית MFM (Curcuma longa D.E)****. AFFRON® - תמצית זעפרן פטנטי - (3.5% LEPTICROSALIDES) - (Crocus Sativus D.E)*, קומפלקס ליפוזומלי - בטא קריופילן, ביסקורן וכורכום טבעי*-**. קומפלקס לוטאין, זיאקסנטין, קריפטוקסנטין ובטא קרוטן מפרח ציפורן החתול (Tagetes Erecta D.E)*, ליקופן מעגבניות (Solanum lycopersicum D.E)*.',
    facts: [ENERGY, ['הוראות שימוש', '1-2 כמוסות ליום עם השתייה.']],
    notes: ['**** ספקטרום כורכומינואידים רחב בטכנולוגיית MFM – Microencapsulated Full Natural Matrix', '*** כורכומין טבעי נבדק לפחמן 14'],
  },

  fibrogen: {
    title: 'פיברוגן™ - קומפלקס ג\'ינסנוזידים "יחודיים" משורש ג\'ינסנג קוריאני אדום בגידול הידרופוני בתוספת PEA ליפוזומלי.',
    ingredients: 'קומפלקס דימגנזיום מלאט ליפוזומלי (ליפוזום המכיל דימגנזיום מלאט, גאם ערביק ולציטין חמניות (אינו מהונדס גנטית)), כמוסה (תאית צמחית – HPMC), שורש ג\'ינג\'ר גלנגל (Alpinia Galanga L) (100 מ"ג), אבקת שורש ג\'ינסנג קוריאני אדום (Panax Ginseng) (מכיל 10% ג\'ינסנוזידים ייחודיים מסוג: Rg2, Rg3, Rg5, Rg6, Rh1, Rh2, Rh3, Rh4, Rk1, Rk2, Rk3, CK, PPD, PPT, F1, F2) (100 מ"ג), קומפלקס פלמיטואיל אתנול אמיד ליפוזומלי (PEA - Palmitoylethanolamide) (ליפוזום המכיל גאם ערביק, PEA ולציטין חמניות (אינו מהונדס גנטית)) (10 מ"ג).',
    table: {
      columns: ['רכיבים', 'כמות אלמנטלית בכמוסה', ...rda()],
      rows: [['מגנזיום מלאט ליפוזומלי 500 מ"ג – Liposomal (Nano) Magnesium Malate, (Chelated & Fully Reacted)', '50 מ"ג', '18%', '14%']],
    },
    facts: [['משקל כמוסה', '835 מ"ג'], ['משקל נקי', '25.1 גר\''], ENERGY, ['הוראות שימוש', 'כמוסה 1 ביום.']],
    notes: [GMO_VEGAN],
  },

  'quick-daily-biotics': {
    title: 'קוויק Daily™ - קומפלקס פרוביוטיקה מזנים נחקרים לשימוש יום יומי.',
    ingredients: '* ממתיקים (סורביטול מטפיוקה, גליקוזידים של סטיביול מסטיביה), מלטודקסטרין (סכרידים מתירס שאינו מהונדס גנטית), אבקת בננות ירוקות (*NuBana™ RS65 Green Banana (Musa x paradisiaca)), פרוביוטיקה מסוג בצילוס קואגולנס - SMZ 1969, פרוביוטיקה מסוג בצילוס סובטיליס - DE111, מווסת חומציות (חומצה ציטרית), חומרי טעם וריח.',
    table: {
      columns: ['רכיבים', 'כמות ביחידה'],
      rows: [
        ['Bacillus subtilis DE111* – בצילוס סובטיליס מזן נחקר', '2 מיליארד'],
        ['Bacillus Coagulans SMZ 1969* – בצילוס קואגולנס מזן נחקר', '2 מיליארד'],
      ],
    },
    notes: [GMO_VEGAN, 'המוצר מכיל סוכרים רב כהליים, צריכה מופרזת עלולה לגרום לפעילות מעיים מוגברת.'],
  },
}
