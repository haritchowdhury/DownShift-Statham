import { useState } from 'react'
import Link from 'next/link'
import Price from '@/components/Price'
import ProductImageFallback from '@/components/ProductImageFallback'
import { useCartContext } from '@/context/Store'
import rawItems from '@/data/items.json'
import { normalizeProduct } from '@/lib/products'

function ProductPage({ product }) {
  const [imageFailed, setImageFailed] = useState(false)
  const showImage = product.image && !imageFailed
  const cartContext = useCartContext()
  const stockLabel = product.available
    ? 'In stock'
    : product.inStock
      ? 'Coming soon'
      : 'Out of stock'

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link href="/" className="font-primary text-sm font-semibold text-palette-primary no-underline hover:text-palette-dark">
        Back to catalog
      </Link>

      <section className="mt-8 grid gap-10 lg:grid-cols-2">
        <div className="overflow-hidden rounded-md border border-palette-lighter bg-palette-lighter shadow-lg">
          {showImage ? (
            <img
              src={product.image}
              alt={product.title}
              className="h-full min-h-96 w-full object-cover"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="min-h-96">
              <ProductImageFallback label="Product image coming soon" large />
            </div>
          )}
        </div>

        <div className="font-primary">
          <p className="text-sm font-semibold uppercase tracking-wide text-palette-primary">
            {product.category}
          </p>
          <h1 className="mt-3 text-4xl font-bold leading-tight text-palette-dark">
            {product.title}
          </h1>
          <p className="mt-3 text-lg font-semibold text-gray-700">
            {product.brand}
          </p>

          <div className="mt-6 inline-flex bg-palette-lighter px-5 py-3 text-xl font-semibold text-palette-dark">
            <Price amount={product.price} />
          </div>

          <button
            type="button"
            onClick={() => cartContext?.addToCart(product)}
            disabled={!product.available}
            className="mt-6 block w-full max-w-sm rounded-md bg-palette-primary px-5 py-3 font-primary text-base font-semibold text-white shadow-md hover:bg-palette-dark disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            Add to cart
          </button>

          <p className="mt-6 max-w-xl text-base font-light leading-7 text-gray-600">
            {product.description || 'No product description is available for this item.'}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className={`rounded-full px-3 py-1 text-sm font-semibold ${
              product.available
                ? 'bg-emerald-50 text-emerald-700'
                : product.inStock
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-stone-100 text-stone-600'
            }`}>
              {stockLabel}
            </span>
            {product.rating && product.reviews > 0 && (
              <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-gray-700 shadow-sm">
                {product.rating.toFixed(1)} / {product.reviews.toLocaleString()} reviews
              </span>
            )}
          </div>

          {product.tags.length > 0 && (
            <div className="mt-8">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Tags
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.tags.map(tag => (
                  <span key={tag} className="rounded-full border border-palette-light bg-white px-3 py-1 text-sm text-palette-dark">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking',
  }
}

export async function getStaticProps({ params }) {
  const rawProduct = rawItems.find(item => String(item.id) === String(params.product))

  if (!rawProduct) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      product: normalizeProduct(rawProduct),
    },
  }
}

export default ProductPage
