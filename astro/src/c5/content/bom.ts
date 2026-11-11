// Series of each product, from the company's product list (BOM file
// "כל מוצרי החברה לפי ה-BOM", Category 5 brand, column "סדרה").
// Keyed by product slug. catalog.ts uses this before any default mapping;
// overrides.ts can still change a single product.
import type { Product } from './products'
type S = Product['series']
const V: S = 'vitamins-minerals', P: S = 'plants', B: S = 'probiotics', PRO: S = 'professional'

export const BOM_SERIES: Record<string, S> = {
  'lpldl-probiotic': B, 'bio-vera': B, 'geniflora-c15': B, 'umanaflora-daily': B, 'umanaflora-53': B, 'quick-daily-biotics': B,
  'giallocur-nano-curcumin': P, lactoferr: P, natto: P, 'kalnozim-digestive-enzymes': P, kalnozin: P,
  alyvium: PRO, winterguard: PRO, nootropinol: PRO, 'nemadrin-l6': PRO, fibrogen: PRO, 'protesterol-40': PRO,
  'cogni-bright': PRO, 'cogni-mg': PRO, 'cogni-zzz': PRO, calcidex: PRO, revival: PRO, 'revival-20': PRO, 'relacton-alpha': PRO,
  amorfolic: V, 'lipozamin-b12-spectrum': V, 'lipozamin-calcium': V, 'lipozamin-fe': V, 'lipozamin-mg-spectrum': V,
  'lipozamin-mg-complex': V, 'lipozamin-nac': V, 'lipozamin-q10-spectrum': V, 'lipozamin-se': V, 'lipozamin-zn': V,
  'lipozamin-alpha-lipoic-acid': V, 'lipozamin-glutathione': V, 'magnesium-bisglycinate-liposomal': V, 'lipozamin-magnesium-malate': V,
  'lipozamin-nicotinamide': V, 'lipozamin-creatine-complex': V, 'liposomal-multivitamin': V, 'cellinol-junior': V,
  'cellinol-liposomal-vitamin-c': V, 'quick-fe': V, 'quick-c': V, 'liposomal-vitamin-b-complex': V,
}
