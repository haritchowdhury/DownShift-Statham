import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Price from '@/components/Price'
import ProductImageFallback from '@/components/ProductImageFallback'
import ProductListings from '@/components/ProductListings'
import { getFacetOptions, normalizeProducts, searchProducts } from '@/lib/products'

const INITIAL_VISIBLE_COUNT = 24
const LOAD_MORE_COUNT = 24
const RECENT_LAUNCH_COUNT = 50
const BEST_RATED_COUNT = 50
const PRODUCT_BLOCK_COUNT = 6

function CategoryPill({ category, activeCategory, onChange }) {
  const isActive = activeCategory === category

  return (
    <button
      type="button"
      onClick={() => onChange(category)}
      className={`rounded-full border px-3 py-1.5 font-primary text-sm font-semibold leading-tight transition ${
        isActive
          ? 'border-palette-primary bg-palette-primary text-white'
          : 'border-palette-light bg-white text-palette-dark hover:border-palette-primary'
      }`}
    >
      {category}
    </button>
  )
}

function CompactFilterPill({ value, activeValue, onChange }) {
  const isActive = activeValue === value

  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={`rounded-full border px-2 py-0.5 font-primary text-xs font-semibold leading-tight transition ${
        isActive
          ? 'border-palette-primary bg-palette-primary text-white'
          : 'border-palette-light bg-white text-gray-600 hover:border-palette-primary hover:text-palette-dark'
      }`}
    >
      {value}
    </button>
  )
}

function CompactFilterRow({ label, options, activeValue, onChange }) {
  if (!options.length) return null

  return (
    <div>
      <div className="text-center font-primary text-xs font-extrabold uppercase tracking-wide text-gray-700">
        {label}
      </div>
      <div className="mt-1.5 flex flex-wrap justify-center gap-1">
        {['All'].concat(options).map(option => (
          <CompactFilterPill
            key={option}
            value={option}
            activeValue={activeValue}
            onChange={onChange}
          />
        ))}
      </div>
    </div>
  )
}

function releasedTime(product) {
  if (!product.releasedAt) return 0
  const time = new Date(product.releasedAt).getTime()
  if (Number.isNaN(time) || time > Date.now()) return 0
  return time
}

function formatReleaseDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

function CarouselImage({ product, fallbackLabel }) {
  const [imageFailed, setImageFailed] = useState(false)
  const showImage = product.image && !imageFailed

  return showImage ? (
    <img
      src={product.image}
      alt={product.title}
      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
      loading="lazy"
      onError={() => setImageFailed(true)}
    />
  ) : (
    <ProductImageFallback label={fallbackLabel} />
  )
}

function ProductCarousel({ eyebrow, title, products, renderMeta, fallbackLabel, previousLabel, nextLabel }) {
  const carouselRef = useRef(null)

  if (!products.length) return null

  function slide(direction) {
    const carousel = carouselRef.current
    if (!carousel) return
    carousel.scrollBy({
      left: direction * Math.min(carousel.clientWidth * 0.8, 720),
      behavior: 'smooth',
    })
  }

  return (
    <section className="mx-auto mt-5 max-w-6xl text-left">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-primary text-xs font-bold uppercase tracking-wide text-palette-primary">
            {eyebrow}
          </p>
          <h2 className="mt-0.5 font-primary text-xl font-bold text-palette-dark sm:text-2xl">
            {title}
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => slide(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-palette-light bg-white font-primary text-xl font-semibold text-palette-primary shadow-sm hover:border-palette-primary"
            aria-label={previousLabel}
          >
            &lsaquo;
          </button>
          <button
            type="button"
            onClick={() => slide(1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-palette-light bg-white font-primary text-xl font-semibold text-palette-primary shadow-sm hover:border-palette-primary"
            aria-label={nextLabel}
          >
            &rsaquo;
          </button>
        </div>
      </div>

      <div
        ref={carouselRef}
        className="scrollbar-hide mt-3 flex snap-x gap-3 overflow-x-auto pb-2"
      >
        {products.map(product => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="group relative h-60 w-56 flex-shrink-0 snap-start overflow-hidden rounded-md border border-palette-lighter bg-white text-left no-underline shadow-lg sm:h-64 sm:w-60"
          >
            <div className="absolute inset-0">
              <CarouselImage product={product} fallbackLabel={fallbackLabel} />
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-white bg-opacity-95 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-primary text-xs font-bold uppercase tracking-wide text-palette-primary">
                    {renderMeta(product)}
                  </p>
                  <h3 className="mt-1 max-h-10 overflow-hidden font-primary text-base font-bold leading-tight text-palette-dark">
                    {product.title}
                  </h3>
                </div>
                <div className="flex-shrink-0 font-primary text-sm font-bold text-palette-dark">
                  <Price amount={product.price} />
                </div>
              </div>
              <p className="mt-2 truncate font-primary text-sm text-gray-600">
                {product.brand} &middot; {product.category}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

function RecentLaunchCarousel({ products }) {
  return (
    <ProductCarousel
      eyebrow="Recently launched"
      title="Fresh arrivals"
      products={products}
      renderMeta={product => formatReleaseDate(product.releasedAt)}
      fallbackLabel="New arrival preview coming soon"
      previousLabel="Previous launches"
      nextLabel="Next launches"
    />
  )
}

function BestRatedCarousel({ products }) {
  return (
    <ProductCarousel
      eyebrow="Best rated"
      title="Customer favorites"
      products={products}
      renderMeta={product => `${product.rating.toFixed(1)} rating / ${product.reviews.toLocaleString()} reviews`}
      fallbackLabel="Favorite product preview coming soon"
      previousLabel="Previous best rated products"
      nextLabel="Next best rated products"
    />
  )
}

function BestRatedUnderCarousel({ products, maxPrice }) {
  return (
    <ProductCarousel
      eyebrow={`Best rated under $${maxPrice.toLocaleString()}`}
      title={`Top picks under $${maxPrice.toLocaleString()}`}
      products={products}
      renderMeta={product => `${product.rating.toFixed(1)} rating / ${product.reviews.toLocaleString()} reviews`}
      fallbackLabel="Top pick preview coming soon"
      previousLabel={`Previous best rated products under $${maxPrice.toLocaleString()}`}
      nextLabel={`Next best rated products under $${maxPrice.toLocaleString()}`}
    />
  )
}

function IndexPage() {
  const router = useRouter()
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeBrand, setActiveBrand] = useState('All')
  const [activeTag, setActiveTag] = useState('All')
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT)

  useEffect(() => {
    let isMounted = true

    async function loadProducts() {
      try {
        const response = await fetch('/data/items.json')
        if (!response.ok) throw new Error('Catalog request failed')
        const rawProducts = await response.json()
        if (isMounted) {
          setProducts(normalizeProducts(rawProducts))
          setLoadError('')
        }
      } catch (error) {
        if (isMounted) setLoadError(error.message || 'Catalog could not be loaded')
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadProducts()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!router.isReady || router.query.reset !== '1') return

    setQuery('')
    setActiveCategory('All')
    setActiveBrand('All')
    setActiveTag('All')
    setVisibleCount(INITIAL_VISIBLE_COUNT)
    router.replace('/', undefined, { shallow: true })
  }, [router])

  const facets = useMemo(() => getFacetOptions(products), [products])
  const scopedProductsForBrand = useMemo(() => {
    if (activeCategory === 'All') return products
    return products.filter(product => product.category === activeCategory)
  }, [products, activeCategory])
  const scopedProductsForMaterial = useMemo(() => {
    return scopedProductsForBrand.filter(product => {
      return activeBrand === 'All' || product.brand === activeBrand
    })
  }, [scopedProductsForBrand, activeBrand])
  const scopedBrandOptions = useMemo(() => {
    return getFacetOptions(scopedProductsForBrand).brands
  }, [scopedProductsForBrand])
  const scopedTagOptions = useMemo(() => {
    return getFacetOptions(scopedProductsForMaterial).tags
  }, [scopedProductsForMaterial])
  const recentLaunches = useMemo(() => {
    return products
      .filter(product => releasedTime(product) > 0)
      .slice()
      .sort((a, b) => releasedTime(b) - releasedTime(a))
      .slice(0, RECENT_LAUNCH_COUNT)
  }, [products])
  const bestRatedProducts = useMemo(() => {
    return products
      .filter(product => product.rating !== null)
      .slice()
      .sort((a, b) => {
        if (b.rating !== a.rating) return b.rating - a.rating
        return b.reviews - a.reviews
      })
      .slice(0, BEST_RATED_COUNT)
  }, [products])
  const bestRatedUnder5000 = useMemo(() => {
    return products
      .filter(product => product.rating !== null && product.price !== null && product.price < 5000)
      .slice()
      .sort((a, b) => {
        if (b.rating !== a.rating) return b.rating - a.rating
        return b.reviews - a.reviews
      })
      .slice(0, BEST_RATED_COUNT)
  }, [products])
  const bestRatedUnder10000 = useMemo(() => {
    return products
      .filter(product => product.rating !== null && product.price !== null && product.price < 10000)
      .slice()
      .sort((a, b) => {
        if (b.rating !== a.rating) return b.rating - a.rating
        return b.reviews - a.reviews
      })
      .slice(0, BEST_RATED_COUNT)
  }, [products])

  const results = useMemo(() => {
    return searchProducts(products, query, {
      category: activeCategory,
      brand: activeBrand,
      tag: activeTag,
    })
  }, [products, query, activeCategory, activeBrand, activeTag])

  const visibleProducts = results.slice(0, visibleCount)
  const firstProductBlock = visibleProducts.slice(0, PRODUCT_BLOCK_COUNT)
  const secondProductBlock = visibleProducts.slice(PRODUCT_BLOCK_COUNT, PRODUCT_BLOCK_COUNT * 2)
  const thirdProductBlock = visibleProducts.slice(PRODUCT_BLOCK_COUNT * 2, PRODUCT_BLOCK_COUNT * 3)
  const remainingProducts = visibleProducts.slice(PRODUCT_BLOCK_COUNT * 3)
  const hasActiveFilter = Boolean(query.trim())
    || activeCategory !== 'All'
    || activeBrand !== 'All'
    || activeTag !== 'All'
  const showCuratedSections = !hasActiveFilter
  const resultsLabel = isLoading
    ? 'Loading catalog'
    : `${results.length.toLocaleString()} ${results.length === 1 ? 'product' : 'products'}`

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_COUNT)
  }, [query, activeCategory, activeBrand, activeTag])

  useEffect(() => {
    if (activeBrand !== 'All' && !scopedBrandOptions.includes(activeBrand)) {
      setActiveBrand('All')
    }
  }, [activeBrand, scopedBrandOptions])

  useEffect(() => {
    if (activeTag !== 'All' && !scopedTagOptions.includes(activeTag)) {
      setActiveTag('All')
    }
  }, [activeTag, scopedTagOptions])

  function clearFilters() {
    setQuery('')
    setActiveCategory('All')
    setActiveBrand('All')
    setActiveTag('All')
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <section className="pt-5 text-center sm:pt-7">
        <h1 className="font-primary text-3xl font-bold tracking-normal text-palette-dark sm:text-4xl">
          Downshift Home Goods
        </h1>
        <p className="mx-auto mt-1.5 max-w-2xl font-primary text-sm font-light leading-6 text-gray-600 sm:text-base">
          Browse a local catalog of furniture, lighting, storage, textiles, decor, and everyday home pieces.
        </p>

        <div className="mx-auto mt-3 flex max-w-5xl flex-wrap justify-center gap-1.5">
          {['All'].concat(facets.categories).map(category => (
            <CategoryPill
              key={category}
              category={category}
              activeCategory={activeCategory}
              onChange={setActiveCategory}
            />
          ))}
        </div>

        <div className="mx-auto mt-3 grid max-w-5xl gap-3 px-2 py-1">
          <CompactFilterRow
            label="Brand"
            options={scopedBrandOptions}
            activeValue={activeBrand}
            onChange={setActiveBrand}
          />
          <CompactFilterRow
            label="Material"
            options={scopedTagOptions}
            activeValue={activeTag}
            onChange={setActiveTag}
          />
        </div>

        <div className="mx-auto mt-3 max-w-3xl">
          <label className="sr-only" htmlFor="product-search">Search products</label>
          <input
            id="product-search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search products"
            className="form-input w-full rounded-md border-palette-light bg-white px-3 py-2.5 font-primary text-sm text-palette-dark shadow-sm focus:border-palette-primary focus:ring-palette-primary sm:text-base"
          />
        </div>

        {showCuratedSections && (
          <RecentLaunchCarousel products={recentLaunches} />
        )}

        <div className="mt-3 flex items-center justify-center gap-4 font-primary text-sm text-gray-600">
          <span className="font-semibold text-palette-dark">{resultsLabel}</span>
          {hasActiveFilter && (
            <button
              type="button"
              onClick={clearFilters}
              className="font-semibold text-palette-primary hover:text-palette-dark"
            >
              Clear
            </button>
          )}
        </div>
      </section>

      <section>
        {isLoading ? (
          <div className="py-16 text-center font-primary text-gray-600">
            Loading products...
          </div>
        ) : loadError ? (
          <div className="mx-auto my-12 max-w-xl rounded-md border border-red-200 bg-red-50 px-6 py-8 text-center font-primary text-red-700">
            {loadError}
          </div>
        ) : results.length > 0 ? (
          <>
            {showCuratedSections ? (
              <>
                <ProductListings products={firstProductBlock} />
                <BestRatedCarousel products={bestRatedProducts} />
                {secondProductBlock.length > 0 && (
                  <ProductListings products={secondProductBlock} />
                )}
                <BestRatedUnderCarousel products={bestRatedUnder5000} maxPrice={5000} />
                {thirdProductBlock.length > 0 && (
                  <ProductListings products={thirdProductBlock} />
                )}
                <BestRatedUnderCarousel products={bestRatedUnder10000} maxPrice={10000} />
                {remainingProducts.length > 0 && (
                  <ProductListings products={remainingProducts} />
                )}
              </>
            ) : (
              <ProductListings products={visibleProducts} />
            )}
            {visibleProducts.length < results.length && (
              <div className="flex justify-center pb-12">
                <button
                  type="button"
                  onClick={() => setVisibleCount(count => count + LOAD_MORE_COUNT)}
                  className="rounded-md bg-palette-primary px-6 py-3 font-primary text-sm font-semibold text-white shadow-md hover:bg-palette-dark"
                >
                  Show more
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="mx-auto my-12 max-w-xl rounded-md border border-palette-light bg-white px-6 py-10 text-center font-primary">
            <h2 className="text-2xl font-semibold text-palette-dark">No matching products</h2>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 rounded-md bg-palette-primary px-5 py-2 text-sm font-semibold text-white"
            >
              Clear
            </button>
          </div>
        )}
      </section>
    </div>
  )
}

export default IndexPage
