// Articles (BRIEF §11) — add articles here. Until there are any, /articles shows the
// mockup's placeholder teasers.
// body blocks: { h2: '…' } | { p: '…' } | { image: '/assets/…' } (image without src → grey "אימג׳")
export type ArticleBlock = { h2: string } | { p: string } | { image?: string; alt?: string }
export interface Article {
  slug: string
  title: string
  excerpt: string
  image?: string
  body: ArticleBlock[]
  // ---- review articles (ingredientArticles.ts) ----
  /** Small label over the title, e.g. "סקירת רכיב". */
  tag?: string
  /** Latin / English name shown under the Hebrew title. */
  latin?: string
  /** Reading time in minutes. */
  minutes?: number
  /** Topic tags shown on the list page (filterable). */
  tags?: string[]
  /** Credit line under the image (e.g. a CC BY study figure). */
  imageCredit?: string
  /** Text-first article: no image and no grey placeholder. */
  noImage?: boolean
}

import { INGREDIENT_ARTICLES } from './ingredientArticles'

/** Hand-entered articles (shown first). */
const MANUAL: Article[] = []

export const ARTICLES: Article[] = [...MANUAL, ...INGREDIENT_ARTICLES]
