// Product highlights ("תכונות המוצר" on the product page, after The Ordinary's "Highlights").
// One entry per product slug: `is` lists the attributes that are TRUE for the product and
// stated in its sources (label, brochure, old site — see knowledge/products/<slug>.md);
// `kosher` is the kashrut type as shown on the page.
// Rules (client): show only what the sources state. A product with dairy or egg ingredients
// gets 'dairy' / 'egg' and never 'vegan'. Soy ('soy') is an allergen mark only; soy products stay vegan. 'sugarFree' is used only for powders and tablets.
// 'glutenFree' only where a source says "גלוטן" ("ללא חיטה" alone is not enough).
// Never add an attribute that is not written in a source.
export type HighlightKey = 'vegan' | 'glutenFree' | 'microscope' | 'dairy' | 'egg' | 'soy' | 'nonGmo' | 'noPreservatives' | 'sugarFree'

/** Display order and Hebrew labels (kashrut is placed after the microscope item). */
export const HIGHLIGHT_LABELS: Array<[HighlightKey, string]> = [
  ['vegan', 'מתאים לטבעונים'],
  ['glutenFree', 'ללא רכיבי גלוטן'],
  ['microscope', 'נבדק במיקרוסקופ אלקטרוני'],
  ['dairy', 'מכיל רכיבי חלב'],
  ['egg', 'מכיל רכיבי ביצה'],
  ['soy', 'מכיל רכיבי סויה'],
  ['nonGmo', 'אינו מהונדס גנטית'],
  ['noPreservatives', 'ללא חומרים משמרים'],
  ['sugarFree', 'אינו מכיל סוכר'],
]

export interface ProductHighlights { is: HighlightKey[]; kosher?: string }

export const HIGHLIGHTS: Record<string, ProductHighlights> = {
  alyvium: { is: ['vegan', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה – בד״ץ חתם סופר בני ברק' },
  amorfolic: { is: ['vegan', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה – בד״ץ חתם סופר בני ברק' },
  'bio-vera': { is: ['vegan', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה – בד״ץ חתם סופר בני ברק' },
  calcidex: { is: ['vegan', 'glutenFree', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה – בד״ץ חתם סופר בני ברק' },
  'cellinol-junior': { is: ['vegan', 'microscope', 'nonGmo', 'sugarFree'], kosher: 'כשר פרווה – בד״ץ חתם סופר בני ברק' },
  'cellinol-liposomal-vitamin-c': { is: ['vegan', 'microscope', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה – בד״ץ העדה החרדית ירושלים' },
  'cogni-bright': { is: ['vegan', 'glutenFree', 'microscope', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה – בד״ץ חתם סופר בני ברק' },
  'cogni-mg': { is: ['vegan', 'glutenFree', 'microscope', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה – בד״ץ חתם סופר בני ברק' },
  'cogni-zzz': { is: ['vegan', 'microscope', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה – בד״ץ חתם סופר בני ברק' },
  'curcumin-complex': { is: ['vegan', 'microscope', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה – בד״ץ חתם סופר בני ברק' },
  fibrogen: { is: ['vegan', 'microscope', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה – בד״ץ חתם סופר בני ברק' },
  'geniflora-c15': { is: ['vegan', 'glutenFree', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה – בד״ץ חתם סופר בני ברק' },
  'kalnozim-digestive-enzymes': { is: ['vegan', 'microscope', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה – בד״ץ חתם סופר בני ברק' },
  kalnozin: { is: ['vegan', 'microscope', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה – בד״ץ העדה החרדית ירושלים' },
  lactoferr: { is: ['microscope', 'dairy', 'nonGmo', 'noPreservatives'], kosher: 'כשר חלבי לאוכלי אבקת חלב נוכרי – רבנות מעלה אדומים' },
  'liposomal-multivitamin': { is: ['vegan', 'microscope', 'nonGmo', 'noPreservatives'], kosher: 'בד״ץ חתם סופר בני ברק' },
  'liposomal-vitamin-b-complex': { is: ['vegan', 'microscope', 'nonGmo', 'noPreservatives'], kosher: 'בד״ץ חתם סופר בני ברק' },
  'lipozamin-alpha-lipoic-acid': { is: ['vegan', 'microscope', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה – בד״ץ חתם סופר בני ברק' },
  'lipozamin-b12-spectrum': { is: ['vegan', 'microscope', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה – בד״ץ חתם סופר בני ברק' },
  'lipozamin-calcium': { is: ['vegan', 'microscope', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה – בד״ץ חתם סופר בני ברק' },
  'lipozamin-fe': { is: ['vegan', 'microscope', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה – בד״ץ העדה החרדית ירושלים' },
  'lipozamin-glutathione': { is: ['vegan', 'microscope', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה – בד״ץ חתם סופר בני ברק' },
  'lipozamin-mg-complex': { is: ['vegan', 'microscope', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה – בד״ץ חתם סופר בני ברק' },
  'lipozamin-mg-spectrum': { is: ['vegan', 'microscope', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה – בד״ץ חתם סופר בני ברק' },
  'lipozamin-mg-taurate': { is: ['vegan', 'microscope', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה – בד״ץ חתם סופר בני ברק' },
  'lipozamin-nac': { is: ['vegan', 'microscope', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה – בד״ץ חתם סופר בני ברק' },
  'lipozamin-nicotinamide': { is: ['vegan', 'microscope', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה – בד״ץ חתם סופר בני ברק' },
  'lipozamin-q10-spectrum': { is: ['vegan', 'microscope', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה – בד״ץ חתם סופר בני ברק' },
  'lipozamin-se': { is: ['vegan', 'microscope', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה – בד״ץ חתם סופר בני ברק' },
  'lipozamin-zn': { is: ['vegan', 'microscope', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה – בד״ץ חתם סופר בני ברק' },
  'lpldl-probiotic': { is: ['vegan', 'glutenFree', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה – בד״ץ חתם סופר בני ברק' },
  natto: { is: ['vegan', 'soy', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה – בד״ץ חתם סופר בני ברק' },
  'nemadrin-l6': { is: ['microscope', 'egg', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה – בד״ץ חתם סופר בני ברק' },
  nootropinol: { is: ['vegan', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה – בד״ץ חתם סופר בני ברק' },
  'protesterol-40': { is: ['vegan', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה – בד״ץ חתם סופר בני ברק' },
  'quick-c': { is: ['vegan', 'microscope', 'nonGmo', 'noPreservatives', 'sugarFree'], kosher: 'כשר פרווה – בד״ץ חתם סופר בני ברק' },
  'quick-daily-biotics': { is: ['vegan', 'nonGmo', 'noPreservatives', 'sugarFree'], kosher: 'כשר פרווה – בד״ץ חתם סופר בני ברק' },
  'quick-fe': { is: ['vegan', 'microscope', 'nonGmo', 'noPreservatives', 'sugarFree'], kosher: 'כשר פרווה – בד״ץ חתם סופר בני ברק' },
  'relacton-alpha': { is: ['microscope', 'dairy', 'nonGmo', 'noPreservatives'], kosher: 'כשר חלבי לאוכלי אבקת חלב נוכרי – רבנות מעלה אדומים' },
  revival: { is: ['vegan', 'microscope', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה – בד״ץ חתם סופר בני ברק' },
  'umanaflora-53': { is: ['dairy', 'nonGmo', 'noPreservatives'], kosher: 'כשר חלבי לאוכלי אבקת חלב נוכרי – רבנות מעלה אדומים' },
  'umanaflora-daily': { is: ['dairy', 'nonGmo', 'noPreservatives'], kosher: 'כשר לאוכלי חלב נוכרי – רבנות מעלה אדומים' },
  winterguard: { is: ['vegan', 'microscope', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה – בד״ץ העדה החרדית ירושלים' },
}
