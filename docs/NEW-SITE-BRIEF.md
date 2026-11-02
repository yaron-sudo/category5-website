# בריף לסשן חדש: אתר חדש על בסיס הארכיטקטורה של naturesage.co.il

> **עדכון:** אתר המקור בפועל הוא https://www.ethical-supplements.com/ (לא category-5.xyz). ראו `docs/SOURCE-SURVEY.md`.

> פתחו סשן חדש של Claude Code, הדביקו את המסמך הזה (או הפנו אליו), והשלימו את
> סעיף 0. כל השאר הוא הוראות עבודה למודל: מה לקחת מהפרויקט המקורי, מה לא,
> ובאיזה סדר לבנות.

---

## 0. פרטי האתר החדש (למלא לפני ההתחלה)

| שדה | ערך |
|---|---|
| שם המותג / האתר | Category 5 |
| **אתר המקור (תוכן, מבנה, מיתוג)** | **https://www.category-5.xyz** |
| דומיין לאתר החדש | category-5.xyz (אותו דומיין, אחרי מעבר) / לאשר עם הלקוח |
| שפה וכיוון | לקבוע לפי אתר המקור (ברירת מחדל: עברית RTL כמו בנייטשרסייג) |
| ריפו GitHub חדש (ריק) | הלקוח יוצר. שם: `yaron-sudo/<name>` (למלא) |
| פרויקט Sanity חדש (projectId + dataset) | ייווצר ב-sanity.io/manage |
| פרויקט Vercel חדש | ייווצר ויחובר לריפו |
| אתר קיים להעביר? | כן: www.category-5.xyz (נדרשת מפת הפניות בסוף) |
| עמודים נחוצים | ☐ בית ☐ צור קשר ☐ רשימת חנויות ☐ שאלות ותשובות ☐ מוצרים ☐ מאמרים/תוכן ☐ קהילה/אינסטגרם ☐ עמודים משפטיים (לסמן לפי מה שקיים באתר המקור) |
| מקור התוכן | אתר המקור (ראו סעיף 0.1) + חומרים שהלקוח יעלה |
| חומרי מיתוג | לחלץ מאתר המקור: לוגו, צבעים, פונטים, תמונות; הלקוח ישלים SVG/מקוריים |

### 0.1 איך לשאוב את אתר המקור (www.category-5.xyz)

הסשן הראשון של הפרויקט המקורי עשה בדיוק את זה לאתר וורדפרס, והסקריפטים קיימים
ב-`migration/` של הריפו המקורי (`01_fetch_content.mjs` דפים/פוסטים דרך WP REST,
`02_download_media.mjs` תמונות, `03_html_to_portable.mjs` HTML → Portable Text).
צעדים לסשן החדש:

1. **לוודא גישת רשת.** בסביבת Claude Code בענן הדומיין חייב להיות ברשימת
   הדומיינים המותרים של ה-Environment (Settings → Environments → Network).
   בסשן הזה `www.category-5.xyz` לא היה נגיש (DNS נכשל), לכן לא נסקר כאן.
2. **לזהות את הפלטפורמה:** `curl -sI https://www.category-5.xyz` + `/sitemap.xml` +
   `/wp-json/wp/v2/pages?per_page=100` (וורדפרס) או `/robots.txt`. אם Wix/Squarespace:
   לסרוק דרך ה-sitemap ולחלץ HTML בלבד.
3. **לבנות רשימת כתובות** (sitemap + ניווט) → זו גם מפת ההפניות העתידית.
4. **לחלץ:** טקסטים לכל עמוד, תמונות (מקוריות, לא thumbnails), פרטי קשר, רשימת
   חנויות/נקודות מכירה (אם קיימת: טבלה → CSV → `geocode-stores.mjs`), שאלות ותשובות,
   מוצרים. לשמור ב-`migration/out/` בריפו החדש.
5. **מיתוג:** לחלץ מה-CSS את הצבעים והפונטים ולהעתיק ל-`tokens.css`; לצלם את
   האתר (Playwright) כדי שיהיה מולנו "לוק אנד פיל" להשוואה. לא להעתיק עיצוב
   אחד לאחד: המטרה היא אותו מותג, בתשתית ובאיכות של האתר החדש.
6. **לאשר עם הלקוח** לפני בניית סידים: רשימת העמודים שזוהו, מה נשאר ומה נזרק.

**כלל ברזל:** לא לגעת בריפו המקורי `yaron-sudo/naturesage-website`. קוראים ממנו
בלבד. כל העבודה בריפו החדש.

**הודעת פתיחה מוצעת לסשן החדש:**

> קרא את `docs/NEW-SITE-BRIEF.md` בריפו `yaron-sudo/naturesage-website` (ענף
> `claude/compassionate-feynman-n0s6nx`) ופעל לפיו. הריפו החדש הוא `yaron-sudo/<name>`
> (ריק). אתר המקור הוא https://www.category-5.xyz. התחל בסעיף 0.1 (סקירת אתר
> המקור) והצג לי את רשימת העמודים והמיתוג שזיהית לפני שאתה בונה.

---

## 1. מה הפרויקט המקורי (ממנו משכפלים)

- **ריפו:** `yaron-sudo/naturesage-website`, ענף `claude/compassionate-feynman-n0s6nx`
  (הענף שחי בייצור; הוסיפו אותו לסשן עם `add_repo` וקראו ממנו).
- **ארכיטקטורה:** Astro 4.16 (output: `hybrid`, כל העמודים סטטיים, 3 נתיבי שרת)
  + Sanity v3 (תוכן, Studio ב-`sanity/`) + Vercel (אחסון, פונקציות, הפניות,
  כותרות אבטחה). RTL מלא. עיצוב מבוסס טוקנים.
- **מסמכים שכדאי לקרוא קודם (בריפו המקורי):** `HANDOFF.md` (מצב ולקחים),
  `ARCHITECTURE.md`, `docs/security-plan.md`, `docs/cutover-plan.md`,
  `docs/contact-form-microsoft-graph-setup.md`, `docs/instagram-feed-setup.md`.

### מבנה התיקיות

```
astro/
  astro.config.mjs          hybrid + vercel adapter + trailingSlash 'never' + sitemap
  vercel.json               headers (CSP ועוד), rewrites, redirects (מקורות בעברית מקודדים!)
  scripts/                  patch-vercel-runtime.mjs (חובה אחרי build), check-redirects.mjs
  public/                   brand/, fonts/, icons/, img/, robots.txt, og-default.jpg
  src/
    layouts/Base.astro      head/SEO, header+footer, reveal (inline), lightbox גלובלי, fold "קרא עוד", cookie consent
    layouts/LegalLayout.astro
    components/             Header (מגה-מניו + סרגל צף + מגירת מובייל), MegaPanel, DropPanel,
                            Footer, PageHero, SectionBar, ContentSections, ArticleShell,
                            PortableText, Seo, ProductView, FeatureCard, ExpertCard, Carousel,
                            StatBlock, VideoSection, TestimonialVideo, CookieConsent,
                            Accessibility, TrackingPixels, VisualEditing, Heading
    lib/sanity.ts           לקוח Sanity (CDN בלבד בבנייה, memo לכל שאילתה), שאילתות, urlFor, resolveSeo
    lib/portableText.ts     סריאלייזר Portable Text → HTML (escape, סינון סכימת קישורים), splitAtH2, balancePairs
    lib/sections.ts         הרכבת סקשנים לדף הבית + BOOTSTRAP (ברירות מחדל)
    lib/references.ts       רשימות הפניות למחקרים לפי slug (ספציפי לתוכן, לא להעתיק)
    lib/contentPatches.ts   תיקוני תוכן בזמן בנייה (ספציפי, לא להעתיק)
    pages/                  index, contact, stores, faq, product, products/[slug], articles/[slug],
                            research/[slug], experts, compare, production, omega-3-*, community,
                            privacy/terms/cookies/accessibility, 404, [...path] (הפניות+404 בשרת)
    pages/api/contact.ts    טופס → מייל (Graph / SMTP / Resend / Web3Forms בצד לקוח)
    pages/api/instagram.ts  פיד אינסטגרם עם cache
    styles/tokens.css       כל העיצוב: צבעים, פונטים, רדיוסים, צללים, מרווחים, טיפוגרפיה
    styles/components.css   ns-* (כפתורים, מיכלים, textbox, fold, lightbox, פוטר)
sanity/
  sanity.config.ts, schemas/ (documents: page, product, article, research, expert, feature,
  store, homePage, siteSettings; objects: blockContent, seo, faqItem, keyStat...),
  seed-*.mjs (סידים אידמפוטנטיים), lib/client.mjs, lib/routeMap.mjs, geocode-stores.mjs
docs/                       מדריכים ללקוח (מייל, אינסטגרם, מעבר, אבטחה)
```

---

## 2. מה גנרי (להעתיק) ומה ספציפי לנייטשרסייג (לא להעתיק)

**להעתיק כמו שהוא (עם שינוי שמות/טקסטים בלבד):**
- `astro.config.mjs`, `scripts/*`, `tsconfig.json`, `package.json` (אותן גרסאות!
  Astro 4.16.19, @astrojs/vercel 7.8.2, @astrojs/sitemap 3.2.1, @sanity/client 6,
  leaflet 1.9 + markercluster, nodemailer 10).
- `vercel.json`: הכותרות (CSP וכו'), ה-rewrite של `/_image`, הכלל ל-`*.vercel.app`.
  **לא** את ההפניות של האתר הישן.
- `src/layouts/*`, כל `src/components/*` למעט אלה שמכילים תוכן קשיח (ראו למטה),
  `src/lib/sanity.ts`, `src/lib/portableText.ts`, `src/styles/*`.
- `src/pages/`: contact, stores, faq, 404, `[...path]`, privacy/terms/cookies/accessibility,
  `api/contact.ts`, `api/instagram.ts`, community (אם יש אינסטגרם), products/[slug] +
  ProductView (אם יש מוצרים), articles/[slug] + ArticleShell (אם יש תוכן).
- `sanity/`: sanity.config.ts, schemas/ כולם, lib/, מבנה הסידים (לא התוכן שבהם),
  geocode-stores.mjs + seed-stores.mjs (אם יש רשימת חנויות).
- `docs/`: המדריכים למייל ולאינסטגרם, תבנית תוכנית המעבר, תוכנית האבטחה.

**ספציפי לנייטשרסייג, לא להעתיק:**
- כל `public/img`, `public/brand`, `public/icons/stores`, `public/icons/badges`, `og-default.jpg`.
- `src/lib/references.ts`, `src/lib/contentPatches.ts`, `src/lib/sections.ts` (רק
  המבנה; ה-BOOTSTRAP כולו טקסטים של המותג).
- עמודים תוכניים: product.astro (הדגל), compare, production, omega-3-conversion,
  omega-3-index, experts, research/[slug].
- תוכן הסידים, `vercel.json` redirects, `migration/`.
- טקסטים קשיחים ברכיבים: Header (fallbackMegaNav, buyMenu, SHOP_URL), Footer
  (קישורים, כתובת, דיסקליימר), Seo (שם הארגון ב-JSON-LD), CookieConsent (טקסטים),
  Accessibility (טקסטים), Base (tagline).

---

## 3. סדר העבודה המומלץ

1. **ריפו וסביבה.** ריפו חדש ריק. העתקת השלד לפי סעיף 2. `npm install` ב-`astro/`
   ו-`sanity/`. `.env.example` מעודכן; `.env` לעולם לא בקומיט.
2. **Sanity חדש.** `npm create sanity` או שימוש ב-`sanity/` הקיים עם projectId חדש
   (`sanity.cli.ts`, `sanity.config.ts`, `astro/src/lib/sanity.ts`). dataset `production`
   ציבורי לקריאה. בלי טוקנים בבנייה (ה-CDN בלבד; ראו לקחים).
3. **טוקנים של עיצוב.** `styles/tokens.css` בלבד: צבעי מותג, פונטים (קבצי woff2
   ב-`public/fonts` + `@font-face`, או Google Fonts דרך siteSettings), רדיוסים,
   צללים. בדיקה: דף הבית, צור קשר, חנויות, FAQ נראים "של המותג" בלי לגעת ברכיבים.
4. **ניווט ופוטר.** Header: `fallbackMegaNav`, `buyMenu`/`SHOP_URL` (או להסיר את
   הגלולה), אייקונים. Footer: עמודות קישורים, פרטי קשר (מ-siteSettings), דיסקליימר.
5. **עמודים לפי הצ'קליסט בסעיף 0.** כל עמוד = `PageHero` + סקשנים; טקסט ארוך =
   `ContentSections` (שני טורים + "קרא עוד"); עמוד מידע = `ArticleShell` (סרגל
   מקטעים דביק). תוכן ב-Sanity, סידים אידמפוטנטיים (`createOrReplace`, מזהים יציבים).
6. **רשימת חנויות.** CSV → `geocode-stores.mjs` (גיאוקודינג) → `seed-stores.mjs`.
   קטגוריות/אזורים בסכמת `store` ובעמוד. לוגואים ב-`public/icons/stores/<cat>.png`.
7. **טופס צור קשר.** `PUBLIC_WEB3FORMS_KEY` (הכי פשוט) או `MS_*` / `SMTP_*`.
   מדריך: `docs/contact-form-microsoft-graph-setup.md`.
8. **SEO.** `Seo.astro`: שם ארגון, `og-default.jpg` חדש (1200×630), robots.txt,
   `SITE_URL` ב-Vercel. אם יש אתר ישן: מפת הפניות ב-`vercel.json` (מקורות
   בעברית **מקודדים ב-percent-encoding**) + `[...path].astro` כגיבוי + `check-redirects.mjs`.
9. **אבטחה.** `docs/security-plan.md` סעיפים 3–4 (הכותרות כבר ב-vercel.json; 2FA,
   Deployment Protection, סודות רק ב-Vercel).
10. **בדיקות לפני מסירה.** Playwright (מותקן בסביבה: `/opt/pw-browsers/chromium`):
    צילומי מסך דסקטופ/נייד, אפס שגיאות JS, אפס הפרות CSP, הפניות, Lighthouse-ish:
    ראו תבניות הבדיקה ב-HANDOFF של המקור.

---

## 4. לקחים טכניים שנלמדו בפרויקט המקורי (חובה לקרוא)

- **Vercel + עברית בכתובות:** מקורות ההפניות ב-`vercel.json` חייבים להיות
  percent-encoded (`/%D7%9E...`), אחרת לא תופסים. `[...path].astro` (prerender=false)
  מפענח כל כתובת לא מוכרת ומחזיר 301 מאותה מפה; מכסה גם אותיות קטנות וסלאש בסוף.
- **Sanity, מכסה:** התוכנית החינמית = 100k בקשות API לחודש. בנייה חייבת לקרוא דרך
  ה-CDN (`useCdn: true`, בלי טוקן) ולשמור memo לכל שאילתה (`fetchQ`). טוקן בסביבת
  הייצור של Vercel עוקף את ה-CDN ושורף את המכסה. ה-CDN מתעדכן תוך 1–3 דקות אחרי
  עריכה; בנייה מיידית אחרי עריכה עלולה לקרוא ערך ישן.
- **hybrid build:** אחרי `astro build` חובה `node scripts/patch-vercel-runtime.mjs`
  (המתאם 7 כותב nodejs18.x שוורסל דחתה). `public/` נפתר מ-`process.cwd()`, לא
  מ-`import.meta.url` (בבנייה זה מצביע לפלט).
- **CSS מוגבל (scoped):** כל מה שהסקריפט מזריק ל-DOM (שורות ברשימה, כרטיסי פיד,
  קישורים) חייב סגנון גלובלי (`is:global` או `:global()`), אחרת לא יעוצב.
- **ביצועים:** לא לשלוח מאות שורות ב-HTML (עמוד החנויות: רק 40 שורות ב-DOM,
  JSON לשאר, סמנים בהפרש). "חשיפה בגלילה" חייבת לרוץ מסקריפט מוטמע, וההירו
  מונפש ב-CSS בלבד, אחרת המסך הראשון מחכה ל-JS.
- **scrollIntoView בתוך sticky** גורם לקפיצות דף בכרום; לגלול את המיכל עצמו.
- **מגה-מניו רחב:** למקם ביחס למיכל הדף, לא לפריט, כדי לא לצאת מהמסך.
- **שיתוף (OG):** תמונה 1200×630 JPEG מתחת ל-300KB; תמונות Sanity מנורמלות ב-`Seo.astro`.
- **סודות:** לעולם לא בצ'אט ולא בקומיט. טוקן אינסטגרם פג אחרי 60 יום.
- **וורדפרס ישן:** sitemap + REST API שלו הם מקור הכתובות והתוכן; גיאוקודינג
  דרך הפרוקסי של האתר הישן עבד כשספקים חיצוניים נחסמו.
- **הסביבה של Claude Code:** vercel.app ו-cdn.sanity.io חסומים ברשת; הדומיין
  האמיתי נגיש. בדיקות ויזואליות עם Playwright על `npx serve .vercel/output/static`.

---

## 5. משתני סביבה (רשימה מלאה, לפי `astro/.env.example` במקור)

`SITE_URL`, `SANITY_PROJECT_ID`, `SANITY_DATASET`, `SANITY_API_VERSION`,
`PUBLIC_SANITY_VISUAL_EDITING_ENABLED` + `PUBLIC_SANITY_STUDIO_URL` + `SANITY_READ_TOKEN`
(פריוויו בלבד), `PUBLIC_MAP_TILE_URL` + `PUBLIC_MAP_TILE_ATTRIBUTION` (אופציונלי),
`PUBLIC_WEB3FORMS_KEY` או `MS_TENANT_ID/MS_CLIENT_ID/MS_CLIENT_SECRET/MS_SENDER` או
`SMTP_*` או `RESEND_API_KEY`, `CONTACT_TO`, `INSTAGRAM_ACCESS_TOKEN` (+ `INSTAGRAM_USER_ID`,
`INSTAGRAM_GRAPH_TOKEN`, `INSTAGRAM_BUSINESS_ID`), `PUBLIC_INSTAGRAM_DEMO`.

---

## 6. הגדרת ציפיות לסשן החדש

- לעבוד בענף ייעודי בריפו החדש, `git pull --rebase` לפני כל push, בלי PR אלא אם התבקש.
- לבדוק כל שינוי בבנייה מקומית + צילומי מסך לפני דיווח; אחרי חיבור דומיין, לאמת
  מול האתר החי.
- לדווח בעברית, קצר, עם מה שנבדק ומה פתוח.
