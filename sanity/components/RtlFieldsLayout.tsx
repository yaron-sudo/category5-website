import { Fragment, createElement } from 'react'
import type { LayoutProps } from 'sanity'

// Hebrew-aware text direction for ALL edit fields, without breaking
// English/URL fields: `unicode-bidi: plaintext` makes each line follow its
// first strong character (Hebrew lines render RTL and right-aligned, Latin
// lines stay LTR) — the same behaviour as dir="auto". The Studio chrome
// itself has no RTL mode (sanity-io/locales has no he-IL), so this targets
// only the content inputs, where it matters.
const RTL_CSS = `
  input[type='text'], input[type='search'], textarea {
    unicode-bidi: plaintext;
  }
  [data-slate-editor='true'] [data-slate-node='element'] {
    unicode-bidi: plaintext;
    text-align: start;
  }
`

export function RtlFieldsLayout(props: LayoutProps) {
  return createElement(Fragment, null, createElement('style', null, RTL_CSS), props.renderDefault(props))
}
