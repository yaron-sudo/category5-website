// Page-builder section shapes. Source of truth is the CMS `sections[]` array.
import type { PortableBlock, SanityImage } from './sanity'

export interface Heading { text?: string; level?: string; size?: string }

export interface HeroSlideSec { image?: SanityImage; eyebrow?: string; title?: string; text?: string; ctaLabel?: string; ctaHref?: string }
export type Section =
  | { _type: 'heroCarousel'; _key?: string; slides?: HeroSlideSec[]; kicker?: string }
  | { _type: 'statsBand'; _key?: string; stats?: Array<{ value: string; label: string }> }
  | { _type: 'storyDual'; _key?: string; eyebrow?: string; title?: Heading; text?: PortableBlock[]; image?: SanityImage; imageSecond?: SanityImage }
  | { _type: 'badgeRow'; _key?: string; badges?: Array<{ text?: string; icon?: SanityImage }> }
  | { _type: 'featureGrid'; _key?: string; eyebrow?: string; title?: Heading }
  | { _type: 'splitPanel'; _key?: string; eyebrow?: string; title?: Heading; text?: PortableBlock[]; image?: SanityImage; reverse?: boolean }
  | { _type: 'stepsPanel'; _key?: string; eyebrow?: string; title?: Heading; text?: PortableBlock[]; image?: SanityImage; steps?: Array<{ number?: string; title?: string; detail?: string }> }
  | { _type: 'historySection'; _key?: string; eyebrow?: string; title?: Heading; text?: PortableBlock[]; backgroundImage?: SanityImage; milestones?: Array<{ year?: string; text?: string }> }
  | { _type: 'videoSection'; _key?: string; url?: string; videoTitle?: string; poster?: SanityImage }
  | { _type: 'testimonialSection'; _key?: string; eyebrow?: string; title?: Heading }
  | { _type: 'productGrid'; _key?: string; eyebrow?: string; title?: Heading; ctaLabel?: string; ctaHref?: string; cards?: Array<{ name?: string; tag?: string; image?: SanityImage; href?: string }> }
  | { _type: 'ctaBand'; _key?: string; title?: Heading; buttonLabel?: string; buttonHref?: string }
  | { _type: 'richTextSection'; _key?: string; content?: PortableBlock[] }
  | { _type: 'categoryShowcase'; _key?: string; eyebrow?: string; title?: Heading; showCarousels?: boolean; showNew?: boolean }

