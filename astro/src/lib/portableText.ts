import type { PortableBlock } from './sanity'
import { youtubeId } from './sanity'

// Minimal, dependency-free Portable Text -> HTML serializer covering exactly the
// shapes our schema allows: blocks (normal/lead/small/h2-h4/blockquote),
// bullet/number lists, strong/em/underline decorators, link annotations
// (with optional new-tab), image blocks (alt + caption), and the editorial
// blocks youtube / ctaButton / callout. Styles for pt-* classes live in
// styles/components.css.

/** Allow only safe link targets (http/https/mailto/tel or site-relative); anything else (javascript:, data:…) is dropped. */
export function safeHref(href: string | undefined): string | null {
  const h = (href ?? '').trim()
  if (!h) return null
  if (/^(https?:|mailto:|tel:)/i.test(h) || /^[/#?]/.test(h)) return h
  return null
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

interface Span {
  _type: string
  text?: string
  marks?: string[]
}
interface MarkDef {
  _key: string
  _type: string
  href?: string
  blank?: boolean
}

function renderSpans(children: Span[] = [], markDefs: MarkDef[] = []): string {
  return children
    .map((span) => {
      if (span._type !== 'span') return ''
      let html = esc(span.text ?? '')
      for (const mark of span.marks ?? []) {
        if (mark === 'strong') html = `<strong>${html}</strong>`
        else if (mark === 'em') html = `<em>${html}</em>`
        else if (mark === 'underline') html = `<u>${html}</u>`
        else {
          const def = markDefs.find((d) => d._key === mark)
          const link = def?._type === 'link' ? safeHref(def.href) : null
          if (link) {
            const external = /^https?:\/\//.test(link)
            const target = def.blank ? ' target="_blank"' : ''
            const rel = def.blank ? ' rel="noopener noreferrer"' : external ? ' rel="noopener"' : ''
            html = `<a href="${esc(link)}"${target}${rel}>${html}</a>`
          }
        }
      }
      return html
    })
    .join('')
}

const HEADING_STYLES = new Set(['h2', 'h3', 'h4'])

export function portableToHtml(
  blocks: PortableBlock[] = [],
  imageUrl: (block: PortableBlock) => string | null,
): string {
  const out: string[] = []
  let listType: 'bullet' | 'number' | null = null
  const listItems: string[] = []

  const flushList = () => {
    if (!listType) return
    const tag = listType === 'number' ? 'ol' : 'ul'
    out.push(`<${tag}>${listItems.join('')}</${tag}>`)
    listItems.length = 0
    listType = null
  }

  for (const block of blocks) {
    if (block._type === 'image') {
      flushList()
      const src = imageUrl(block)
      if (src) {
        const alt = esc((block.alt as string) ?? '')
        const caption = (block.caption as string) ?? ''
        const img = `<img src="${esc(src)}" alt="${alt}" loading="lazy" decoding="async" />`
        out.push(
          caption
            ? `<figure class="pt-figure">${img}<figcaption>${esc(caption)}</figcaption></figure>`
            : img,
        )
      }
      continue
    }
    if (block._type === 'youtube') {
      flushList()
      const id = youtubeId(block.url as string | undefined)
      if (id) {
        const caption = (block.caption as string) ?? ''
        const iframe =
          `<div class="pt-video"><iframe src="https://www.youtube-nocookie.com/embed/${esc(id)}?rel=0&playsinline=1&modestbranding=1"` +
          ` title="${esc(caption || 'YouTube video')}" loading="lazy" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>`
        out.push(
          caption
            ? `<figure class="pt-figure">${iframe}<figcaption>${esc(caption)}</figcaption></figure>`
            : iframe,
        )
      }
      continue
    }
    if (block._type === 'ctaButton') {
      flushList()
      const label = (block.label as string) ?? ''
      const href = safeHref(block.href as string) ?? ''
      if (label && href) {
        const variant = block.variant === 'outline' ? 'pt-cta--outline' : 'pt-cta--solid'
        const external = /^https?:\/\//.test(href)
        const rel = external ? ' rel="noopener"' : ''
        out.push(`<p class="pt-cta-row"><a class="pt-cta ${variant}" href="${esc(href)}"${rel}>${esc(label)}</a></p>`)
      }
      continue
    }
    if (block._type === 'callout') {
      flushList()
      const text = (block.text as string) ?? ''
      if (text) {
        const tone = block.tone === 'warning' ? 'pt-callout--warning' : 'pt-callout--info'
        const title = (block.title as string) ?? ''
        out.push(
          `<aside class="pt-callout ${tone}">` +
            (title ? `<strong class="pt-callout__title">${esc(title)}</strong>` : '') +
            `<span>${esc(text)}</span></aside>`,
        )
      }
      continue
    }
    if (block._type !== 'block') continue

    const children = block.children as Span[] | undefined
    const markDefs = block.markDefs as MarkDef[] | undefined
    const inner = renderSpans(children, markDefs)
    const lstItem = block.listItem as 'bullet' | 'number' | undefined

    if (lstItem) {
      if (listType && listType !== lstItem) flushList()
      listType = lstItem
      listItems.push(`<li>${inner}</li>`)
      continue
    }

    flushList()
    const style = (block.style as string) ?? 'normal'
    if (HEADING_STYLES.has(style)) out.push(`<${style}>${inner}</${style}>`)
    else if (style === 'blockquote') out.push(`<blockquote>${inner}</blockquote>`)
    else if (style === 'lead') out.push(`<p class="pt-lead">${inner}</p>`)
    else if (style === 'small') out.push(`<p class="pt-small">${inner}</p>`)
    else out.push(`<p>${inner}</p>`)
  }
  flushList()
  return out.join('\n')
}

/** A content page split at its h2 headings: [{ heading, blocks }] (leading blocks → heading ''). */
export function splitAtH2(blocks: PortableBlock[] = []): Array<{ heading: string; blocks: PortableBlock[] }> {
  const out: Array<{ heading: string; blocks: PortableBlock[] }> = []
  let cur: { heading: string; blocks: PortableBlock[] } | null = null
  for (const b of blocks) {
    if (b._type === 'block' && b.style === 'h2') {
      const heading = ((b.children as Array<{ text?: string }>) ?? []).map((c) => c.text ?? '').join('').trim()
      cur = { heading, blocks: [] }
      out.push(cur)
      continue
    }
    if (!cur) { cur = { heading: '', blocks: [] }; out.push(cur) }
    cur.blocks.push(b)
  }
  return out.filter((s) => s.heading || s.blocks.length)
}

/**
 * Balance the two-column card rows: when one card of a pair is a short
 * paragraph with no visual and its neighbour is long and carries an image,
 * move that image across so the row reads symmetric instead of leaving an
 * almost-empty card beside a full one. Pure — returns new section objects.
 */
export function balancePairs<T extends { heading: string; blocks: PortableBlock[] }>(sections: T[]): T[] {
  const textLen = (blocks: PortableBlock[]) =>
    blocks.reduce((n, b) => n + (b._type === 'block' ? ((b.children as Array<{ text?: string }>) ?? []).reduce((m, c) => m + (c.text?.length ?? 0), 0) : 0), 0)
  const hasVisual = (blocks: PortableBlock[]) => blocks.some((b) => b._type !== 'block')
  const out = sections.map((s) => ({ ...s, blocks: [...s.blocks] }))
  for (let i = 0; i + 1 < out.length; i += 2) {
    const a = out[i], b = out[i + 1]
    const [short, long] = textLen(a.blocks) <= textLen(b.blocks) ? [a, b] : [b, a]
    if (hasVisual(short.blocks)) continue
    if (textLen(short.blocks) * 1.8 > textLen(long.blocks)) continue
    const idx = long.blocks.map((x) => x._type).lastIndexOf('image')
    if (idx < 0) continue
    const [img] = long.blocks.splice(idx, 1)
    short.blocks.push(img)
  }
  return out
}
