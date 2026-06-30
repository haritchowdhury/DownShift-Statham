const LOW_PRICE_WORDS = ['cheap', 'budget', 'affordable']
const PREMIUM_WORDS = ['premium', 'luxury', 'expensive']
const BEST_WORDS = ['best', 'top', 'popular']
const INTENT_WORDS = LOW_PRICE_WORDS.concat(PREMIUM_WORDS, BEST_WORDS)

function compact(value) {
  return String(value || '').trim().replace(/\s+/g, ' ')
}

function toTitleCase(value) {
  return compact(value).replace(/\w\S*/g, word => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  })
}

function normalizeTitle(title) {
  const clean = compact(title)
  if (!clean) return 'Untitled Product'

  const letters = clean.replace(/[^a-z]/gi, '')
  if (!letters) return clean

  const isAllCaps = letters === letters.toUpperCase()
  const isLowercase = letters === letters.toLowerCase()
  return isAllCaps || isLowercase ? toTitleCase(clean) : clean
}

function parsePrice(price) {
  if (price === null || price === undefined || price === '') return null
  if (typeof price === 'number') return Number.isFinite(price) ? price : null

  const parsed = Number(String(price).replace(/,/g, ''))
  return Number.isFinite(parsed) ? parsed : null
}

function normalizeTags(tags) {
  return Array.isArray(tags) ? tags.map(compact).filter(Boolean) : []
}

function isReleased(releasedAt) {
  if (!releasedAt) return true
  const releaseDate = new Date(releasedAt)
  if (Number.isNaN(releaseDate.getTime())) return true
  return releaseDate <= new Date()
}

export function normalizeProduct(rawProduct) {
  const title = normalizeTitle(rawProduct.title)
  const brand = compact(rawProduct.brand) || 'Unknown Brand'
  const category = compact(rawProduct.category) || 'Uncategorized'
  const tags = normalizeTags(rawProduct.tags)
  const description = compact(rawProduct.description)
  const price = parsePrice(rawProduct.price)
  const reviews = Number(rawProduct.reviews) || 0
  const rating = reviews > 0 && rawProduct.rating !== null
    ? Number(rawProduct.rating)
    : null
  const releasedAt = rawProduct.releasedAt || null
  const released = isReleased(releasedAt)

  return {
    id: rawProduct.id,
    title,
    brand,
    category,
    tags,
    price,
    rating: Number.isFinite(rating) ? rating : null,
    reviews,
    inStock: Boolean(rawProduct.inStock),
    available: Boolean(rawProduct.inStock) && released,
    releasedAt,
    image: compact(rawProduct.image),
    imageWidth: rawProduct.imageWidth || null,
    imageHeight: rawProduct.imageHeight || null,
    description,
  }
}

export function normalizeProducts(rawProducts) {
  return Array.isArray(rawProducts) ? rawProducts.map(normalizeProduct) : []
}

export function getProducts(rawProducts) {
  return normalizeProducts(rawProducts)
}

function uniqueSorted(products, getter) {
  return products
    .reduce((options, product) => {
      const value = getter(product)
      if (value && !options.includes(value)) options.push(value)
      return options
    }, [])
    .sort((a, b) => a.localeCompare(b))
}

export function getCategories(products) {
  return uniqueSorted(products, product => product.category)
}

export function getBrands(products) {
  return uniqueSorted(products, product => product.brand)
}

export function getTags(products, limit = 24) {
  const counts = products.reduce((tagCounts, product) => {
    product.tags.forEach(tag => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
    })
    return tagCounts
  }, new Map())

  return Array.from(counts.entries())
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1]
      return a[0].localeCompare(b[0])
    })
    .slice(0, limit)
    .map(([tag]) => tag)
}

export function getFacetOptions(products) {
  return {
    categories: getCategories(products),
    brands: getBrands(products),
    tags: getTags(products),
  }
}

function tokenize(query) {
  return compact(query)
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
}

function queryIntent(tokens) {
  return {
    lowPrice: tokens.some(term => LOW_PRICE_WORDS.includes(term)),
    premium: tokens.some(term => PREMIUM_WORDS.includes(term)),
    best: tokens.some(term => BEST_WORDS.includes(term)),
  }
}

function hasIntent(intent) {
  return intent.lowPrice || intent.premium || intent.best
}

function qualityScore(product) {
  const rating = product.rating || 0
  const reviewStrength = Math.log10(product.reviews + 1)
  return (rating * 6) + (reviewStrength * 8)
}

function defaultScore(product) {
  let score = qualityScore(product)
  if (product.available) score += 16
  if (product.image) score += 28
  if (product.price !== null) score += 5
  if (product.description) score += 2
  return score
}

function priceScore(product, direction) {
  if (product.price === null) return -30
  if (direction === 'low') return Math.max(0, 1200 - product.price) / 18
  return Math.min(product.price, 1800) / 24
}

function textFields(product) {
  return {
    title: product.title.toLowerCase(),
    brand: product.brand.toLowerCase(),
    category: product.category.toLowerCase(),
    tags: product.tags.join(' ').toLowerCase(),
    description: product.description.toLowerCase(),
  }
}

function scoreTerm(fields, term) {
  let score = 0
  if (fields.title.includes(term)) score += 34
  if (fields.category.includes(term)) score += 32
  if (fields.tags.includes(term)) score += 25
  if (fields.brand.includes(term)) score += 16
  if (fields.description.includes(term)) score += 6
  return score
}

function applyIntentScore(product, score, intent) {
  let nextScore = score
  if (intent.lowPrice) nextScore += priceScore(product, 'low')
  if (intent.premium) nextScore += priceScore(product, 'high') + qualityScore(product) / 2
  if (intent.best) nextScore += qualityScore(product)
  return nextScore
}

function scoreProduct(product, phrase, terms, intent) {
  let score = terms.length ? 0 : defaultScore(product)

  if (!terms.length) {
    return applyIntentScore(product, score, intent)
  }

  const fields = textFields(product)
  if (phrase) {
    if (fields.title.includes(phrase)) score += 90
    if (fields.category.includes(phrase)) score += 80
    if (fields.tags.includes(phrase)) score += 62
    if (fields.brand.includes(phrase)) score += 45
    if (fields.description.includes(phrase)) score += 18
  }

  let matchedTerms = 0
  terms.forEach(term => {
    const termScore = scoreTerm(fields, term)
    if (termScore > 0) matchedTerms += 1
    score += termScore
  })

  if (matchedTerms < terms.length) return 0

  if (terms.length > 1) score += matchedTerms * 20
  if (product.available) score += 6
  if (product.image) score += 16
  if (!product.image) score -= 24
  if (product.price === null) score -= 7
  score += qualityScore(product) / 4

  return applyIntentScore(product, score, intent)
}

export function searchProducts(products, query, options = {}) {
  const category = options.category || 'All'
  const brand = options.brand || 'All'
  const tag = options.tag || 'All'
  const tokens = tokenize(query)
  const intent = queryIntent(tokens)
  const matchTerms = tokens.filter(term => !INTENT_WORDS.includes(term))
  const phrase = matchTerms.join(' ')
  const isFilteredSearch = matchTerms.length > 0 || hasIntent(intent)

  return products
    .filter(product => category === 'All' || product.category === category)
    .filter(product => brand === 'All' || product.brand === brand)
    .filter(product => tag === 'All' || product.tags.includes(tag))
    .map(product => ({
      product,
      score: scoreProduct(product, phrase, matchTerms, intent),
    }))
    .filter(result => !isFilteredSearch || result.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      if (Boolean(a.product.image) !== Boolean(b.product.image)) return a.product.image ? -1 : 1
      if (a.product.available !== b.product.available) return a.product.available ? -1 : 1
      return a.product.title.localeCompare(b.product.title)
    })
    .map(result => result.product)
}
