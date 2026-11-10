# Category 5 website — rules for Claude Code

Read `BRIEF.md` first. It is the single source of truth. `mockups/` are the visual reference (HTML/CSS/JS); `assets/` are the only images, icons, logo and fonts to use.

Hard rules:
- Build exactly what BRIEF.md says. Do not add sections, copy, badges, FAQs, maps, trust rows or any element that is not in the brief.
- Where content or an image is missing, render a grey area (`#e9e9e7`) labelled "באנר" / "אימג׳" or the placeholder text given in the brief. Never invent text.
- All text is `#141414`. Only the series icons/squares carry the series colours.
- One font: Noto Sans Hebrew (assets/fonts). Body 17px/400, h3 20px/400, h1/h2 22px/600.
- Buttons: white, 1px black border, black text, 4px radius; hover inverts to black (soft buttons hover to `#efeeea`).
- Never crop, recolour or edit product images or banners.
- Motion: copy `mockups/site.js` + the motion rules in `mockups/site.css` (easing `cubic-bezier(.22,.61,.36,1)`, fail-safe reveal, reduced-motion respected).
- RTL Hebrew first; keep an i18n layer ready for English.
- Glossary terms anywhere on the site link to `/glossary#<id>`.
