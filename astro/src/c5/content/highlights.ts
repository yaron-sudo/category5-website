// Product highlights ("תכונות המוצר" on the product page, after The Ordinary's "Highlights").
// One entry per product slug: `is` lists the attributes that are TRUE for the product and
// stated in its sources (label, brochure, old site — see knowledge/products/<slug>.md);
// `kosher` is the kashrut type as shown on the page.
// Rules (client): show only what the sources state. A product with dairy or egg ingredients
// gets 'dairy' / 'egg' and never 'vegan'. 'sugarFree' is used only for powders and tablets.
// 'glutenFree' only where a source says "גלוטן" ("ללא חיטה" alone is not enough).
// Never add an attribute that is not written in a source.
export type HighlightKey = 'vegan' | 'glutenFree' | 'microscope' | 'dairy' | 'egg' | 'nonGmo' | 'noPreservatives' | 'sugarFree'

/** Display order and Hebrew labels (kashrut is placed after the microscope item). */
export const HIGHLIGHT_LABELS: Array<[HighlightKey, string]> = [
  ['vegan', 'מתאים לטבעונים'],
  ['glutenFree', 'ללא רכיבי גלוטן'],
  ['microscope', 'נבדק במיקרוסקופ אלקטרוני'],
  ['dairy', 'מכיל רכיבי חלב'],
  ['egg', 'מכיל רכיבי ביצה'],
  ['nonGmo', 'אינו מהונדס גנטית'],
  ['noPreservatives', 'ללא חומרים משמרים'],
  ['sugarFree', 'אינו מכיל סוכר'],
]

export interface ProductHighlights { is: HighlightKey[]; kosher?: string }

export const HIGHLIGHTS: Record<string, ProductHighlights> = {
  alyvium: { is: ['vegan', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה, בד״ץ' },
  amorfolic: { is: ['vegan', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה, בד״ץ' },
  'bio-vera': { is: ['vegan', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה, בד״ץ' },
  calcidex: { is: ['vegan', 'glutenFree', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה, בד״ץ חתם סופר בני ברק' },
  'cellinol-junior': { is: ['sugarFree'], kosher: 'כשר פרווה, בד״ץ' },
  'cellinol-liposomal-vitamin-c': { is: ['vegan', 'microscope', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה, בד״ץ' },
  'cogni-bright': { is: ['vegan', 'glutenFree', 'microscope', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה, בד״ץ' },
  'cogni-mg': { is: ['vegan', 'glutenFree', 'microscope', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה, בד״ץ' },
  'cogni-zzz': { is: ['vegan', 'microscope', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה, בד״ץ' },
  'curcumin-complex': { is: ['vegan', 'microscope', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה, בד״ץ' },
  fibrogen: { is: ['vegan', 'microscope', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה, בד״ץ' },
  'geniflora-c15': { is: ['vegan', 'glutenFree', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה, בד״ץ' },
  'kalnozim-digestive-enzymes': { is: ['vegan', 'microscope', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה, בד״ץ' },
  kalnozin: { is: ['vegan', 'microscope', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה, בד״ץ' },
  lactoferr: { is: ['microscope', 'dairy', 'nonGmo', 'noPreservatives'], kosher: 'כשר לאוכלי חלב נוכרי' },
  'liposomal-multivitamin': { is: ['vegan', 'microscope', 'nonGmo', 'noPreservatives'], kosher: 'חתם סופר בני ברק' },
  'liposomal-vitamin-b-complex': { is: ['vegan', 'microscope', 'nonGmo', 'noPreservatives'], kosher: 'כשר, חתם סופר בני ברק' },
  'lipozamin-alpha-lipoic-acid': { is: ['vegan', 'microscope', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה, בד״ץ' },
  'lipozamin-b12-spectrum': { is: ['vegan', 'microscope', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה, בד״ץ' },
  'lipozamin-calcium': { is: ['vegan', 'microscope', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה, בד״ץ' },
  'lipozamin-fe': { is: ['vegan', 'microscope', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה, בד״ץ' },
  'lipozamin-glutathione': { is: ['vegan', 'microscope', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה, בד״ץ' },
  'lipozamin-mg-complex': { is: ['vegan', 'microscope', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה, בד״ץ' },
  'lipozamin-mg-spectrum': { is: ['vegan', 'microscope', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה, בד״ץ' },
  'lipozamin-mg-taurate': { is: ['vegan', 'microscope', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה, בד״ץ' },
  'lipozamin-nac': { is: ['vegan', 'microscope', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה, בד״ץ' },
  'lipozamin-nicotinamide': { is: ['vegan', 'microscope', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה, בד״ץ' },
  'lipozamin-q10-spectrum': { is: ['vegan', 'microscope', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה, בד״ץ' },
  'lipozamin-se': { is: ['vegan', 'microscope', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה, בד״ץ' },
  'lipozamin-zn': { is: ['vegan', 'microscope', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה, בד״ץ' },
  'lpldl-probiotic': { is: ['vegan', 'glutenFree', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה, בד״ץ' },
  natto: { is: ['vegan', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה, בד״ץ' },
  'nemadrin-l6': { is: ['microscope', 'egg', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה, בד״ץ' },
  nootropinol: { is: ['vegan', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה, בד״ץ' },
  'protesterol-40': { is: ['vegan', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה, בד״ץ' },
  'quick-c': { is: ['vegan', 'microscope', 'nonGmo', 'noPreservatives', 'sugarFree'], kosher: 'כשר פרווה, בד״ץ' },
  'quick-daily-biotics': { is: ['vegan', 'nonGmo', 'noPreservatives', 'sugarFree'], kosher: 'כשר פרווה, בד״ץ' },
  'quick-fe': { is: ['vegan', 'microscope', 'nonGmo', 'noPreservatives', 'sugarFree'], kosher: 'כשר פרווה, בד״ץ' },
  'relacton-alpha': { is: ['microscope', 'dairy', 'nonGmo', 'noPreservatives'], kosher: 'כשר חלבי לאוכלי אבקת חלב נוכרי' },
  revival: { is: ['vegan', 'microscope', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה, בד״ץ' },
  'umanaflora-53': { is: ['dairy', 'nonGmo', 'noPreservatives'], kosher: 'כשר חלבי לאוכלי אבקת חלב נוכרי' },
  'umanaflora-daily': { is: ['dairy', 'nonGmo', 'noPreservatives'], kosher: 'כשר לאוכלי חלב נוכרי' },
  winterguard: { is: ['vegan', 'microscope', 'nonGmo', 'noPreservatives'], kosher: 'כשר פרווה, בד״ץ העדה החרדית ירושלים' },
}
