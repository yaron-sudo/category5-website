// Articles (BRIEF §11) — add articles here. Until there are any, /articles shows the
// mockup's placeholder teasers.
// body blocks: { h2: '…' } | { p: '…' } | { image: '/assets/…' } (image without src → grey "אימג׳")
export type ArticleBlock = { h2: string } | { p: string } | { image?: string; alt?: string }
export interface Article { slug: string; title: string; excerpt: string; image?: string; body: ArticleBlock[] }

export const ARTICLES: Article[] = []
