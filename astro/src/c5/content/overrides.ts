// ────────────────────────────────────────────────────────────────────────────
// Product overrides — edit content and replace images of any product here.
//
// Every product of the old site is pulled automatically into a product page in
// the new design (see catalog.ts). To change something for one product, add an
// entry under its slug (the last part of its URL: /products/<slug>) with only
// the fields you want to change. Everything else keeps coming from the old site.
//
//   'lipozamin-fe': {
//     title: 'ברזל ביסגליצינאט ליפוזומלי',      // card + page name
//     series: 'vitamins-minerals',               // vitamins-minerals | plants | probiotics | professional
//     image: '/assets/products/lipozamin-fe.jpg',
//     intro: ['פסקה ראשונה', 'פסקה שנייה'],
//     contains: 'מכיל 60 קפסולות',
//     usage: ['…'], benefits: ['…'], details: ['…'], legal: '…',
//     labelImage: '/assets/products/labels/lipozamin-fe.jpg',
//     hidden: true,                              // remove the product from the site
//   },
//
// Replacing images needs NO entry here: drop a file named after the slug into
//   astro/public/assets/products/<slug>.(jpg|png|webp)          → product image
//   label text (shown instead of any label image): src/c5/content/labels.ts
// and it replaces the old site's image on the next build.
// ────────────────────────────────────────────────────────────────────────────
import type { Product } from './products'

export type ProductOverride = Partial<Omit<Product, 'slug'>> & { hidden?: boolean }

export const PRODUCT_OVERRIDES: Record<string, ProductOverride> = {
  // Pack sizes updated to the BOM list.
  amorfolic: { contains: 'מכיל 120 כמוסות' },
  'cellinol-junior': { contains: 'מכיל 60 טבליות' },

  // Lipozamin Mg Taurate: shown again at the client's request; text from the client's brochure
  // (Lipozamin Mg Taurat.pdf) and the pack label. No indications / target groups.
  'lipozamin-mg-taurate': {
    series: 'vitamins-minerals',
    contains: 'מכיל 60 כמוסות צמחיות',
    intro: [
      "מגנזיום טאורט צ'לאט ליפוזומלי בגודל חלקיקי ננו. מגנזיום טאורט הוא שילוב ייחודי בין מגנזיום לחומצת האמינו טאורין, אחת מחומצות האמינו החשובות והנפוצות ביותר ברקמות גוף האדם.",
      'המגנזיום בצורת צ׳לאט נקשר לחומצת האמינו טאורין, ולאחר מכן נעטף בליפוזום בגודל של כ-200 ננומטר. הליפוזומים במוצר נבדקו ואושרו במיקרוסקופ אלקטרוני.',
    ],
    benefits: [
      'מגנזיום טאורט ליפוזומלי - לספיגה גבוהה.',
      "מגנזיום טאורט צ'לאט.",
      'מגנזיום טאורט ננומטרי - בגודל חלקיקי ננו, Fully Reacted | Chelated.',
      'ללא תופעות לוואי במערכת העיכול.',
      'מתאים לצמחונים וטבעונים.',
      'הליפוזומים נבדקו במיקרוסקופ אלקטרוני.',
      'כמוסה אחת מכילה: 600 מ"ג מגנזיום צ׳לאט טאורט ליפוזומלי.',
      '60 כמוסות צמחיות נוחות לבליעה.',
      'תווית נקיה - ללא חומרים משמרים, חומרים מן החי, חומרים מהונדסים גנטית, חומרים מייצבים, חומרי טעם, חומרי ריח, ממתיקים, סוכר, חיטה, סויה, חלב ומוצריו, פוליאתילן גליקול.',
    ],
    usage: ['1-2 כמוסות ביום.'],
    details: [
      'סוג כשרות: כשר פרווה, בד״ץ.',
      'נותן הכשרות: בד״ץ בית יוסף.',
      'אורך חיי מדף: 24 חודשים.',
      'המלצת אחסון: יש לאחסן במקום קריר ויבש, הרחק מחום, אור ולחות.',
      'לאחר הפתיחה אין צורך לשמור בקירור.',
      'נשים בהריון, נשים מניקות, אנשים הנוטלים תרופות מרשם וילדים יש להיוועץ ברופא.',
      'יש להרחיק את המוצר מהישג ידם של ילדים.',
    ],
    keywords: ['מגנזיום טאורט', 'מגנזיום טאוראט', 'טאורין', 'Mg Taurate', 'Magnesium Taurate', 'מגנזיום ליפוזומלי'],
  },

  // Cellinol MEGA: text from the client's brochure (CELLINOL-140-B.pdf) and the pack label. No indications / target groups.
  'cellinol-liposomal-vitamin-c': {
    contains: 'מכיל 140 כמוסות צמחיות',
    intro: [
      'סלינאול MEGA - ויטמין C ליפוזומלי בכמוסות. טכנולוגיה בלעדית: ליפוזומים בטכנולוגיית ננו אריגה, בננו - סיבי כורכום.',
      'סלינאול הוא ויטמין C "כלוא" בתוך ליפוזום, בתצורה של אבקה בכמוסות. הליפוזום עובר ציפוי בשיטת מיקרואנקפסולציה, המאפשר להפוך אותו לאבקה ולשמור על חיי מדף ארוכים ללא צורך באחסנה בקירור.',
    ],
    benefits: [
      '500 מ"ג ויטמין C ליפוזומלי, 350 מ"ג ויטמין C אלמנטלי בכמוסה (אלמנטלי = ויטמין C נטו, ללא הפוספוליפידים ושאר מרכיבי הליפוזום).',
      'ליפוזומים בטכנולוגיית ננו אריגה, בננו - סיבי כורכום.',
      'בתוספת אבץ פיקולינאט ליפוזומלי (15 מ"ג) וביופלבנואידים מהדרים (45% הספרידין).',
      'אינו חומצי.',
      'המוצר נבדק במיקרוסקופ אלקטרוני: נוכחות, כמות, איכות ושלמות הליפוזומים.',
      '140 כמוסות באריזה.',
      'חיי מדף של 24 חודשים ללא צורך בקירור, גם לאחר הפתיחה.',
      'מתאים לטבעונים (VEGAN).',
      'תווית נקיה - ללא חומרים משמרים, חומרים מן החי, פוטסיום סורבאט, נתרן אסקורבאט, אשלגן אסקורבאט, חומרים מהונדסים גנטית, חומרים מייצבים, חומרים מתחלבים, כסף קולודיאלי, קסילטול, חומרי טעם, חומרי ריח, ממתיקים, סוכר, חיטה, סויה, חלב ומוצריו, מים מזוקקים, פוליאתילן גליקול (PEG).',
    ],
    usage: ['1-2 כמוסות ביום.'],
    details: [
      'סוג כשרות: כשר פרווה, בד״ץ.',
      'נותן הכשרות: בד״ץ העדה החרדית ירושלים.',
      'אורך חיי מדף: 24 חודשים.',
      'המלצת אחסון: יש לאחסן במקום קריר ויבש, הרחק מחום, אור ולחות.',
      'לאחר הפתיחה אין צורך לשמור בקירור.',
      'נשים בהריון, נשים מיניקות, אנשים הנוטלים תרופות מרשם, ילדים, יש להיוועץ ברופא.',
      'יש להרחיק מהישג ידם של ילדים.',
    ],
    keywords: ['סלינאול', 'סלינאול מגה', 'Cellinol', 'Cellinol MEGA', 'ויטמין C', 'ויטמין סי', 'ויטמין C ליפוזומלי', 'אבץ פיקולינאט', 'הספרידין'],
  },

  // Not ready yet (client): hidden until content and images are supplied.
  'lipozamin-magnesium-malate': { hidden: true },
  'lipozamin-creatine-complex': { hidden: true },
  'magnesium-bisglycinate-liposomal': { hidden: true },

  // Old-site products that are not in the BOM list: hidden (their URLs redirect to the series page).
  'cellinol-soap': { hidden: true },
  'alyvium-soap': { hidden: true },
  'nemadrin-soap': { hidden: true },
  'giallocur-soap': { hidden: true },
  'alyvium-cream': { hidden: true },
  'umanaflora-de111': { hidden: true },
}
