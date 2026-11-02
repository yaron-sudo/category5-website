import blockContent from './objects/blockContent'
import keyStat from './objects/keyStat'
import headingBlock from './objects/headingBlock'
import seo from './objects/seo'
import faqItem from './objects/faqItem'
import { sectionTypes } from './sections'
import page from './documents/page'
import product from './documents/product'
import category from './documents/category'
import feature from './documents/feature'
import siteSettings from './documents/siteSettings'
import homePage from './documents/homePage'
import store from './documents/store'

// Objects first, then documents.
export const schemaTypes = [
  // objects
  blockContent,
  keyStat,
  headingBlock,
  seo,
  faqItem,
  ...sectionTypes,
  // documents
  page,
  product,
  category,
  feature,
  siteSettings,
  homePage,
  store,
]
