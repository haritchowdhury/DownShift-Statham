import { useState } from 'react'
import Link from 'next/link'
import Price from '@/components/Price'
import ProductImageFallback from '@/components/ProductImageFallback'
import { useCartContext } from '@/context/Store'

function ProductCard({ product }) {
  const [imageFailed, setImageFailed] = useState(false)
  const cartContext = useCartContext()
  const showImage = product.image && !imageFailed
  const stockLabel = product.available
    ? 'In stock'
    : product.inStock
      ? 'Coming soon'
      : 'Out of stock'

  return (
    <article className="group flex h-120 w-full max-w-xs flex-col overflow-hidden rounded-md border border-palette-lighter bg-white shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:w-72">
      <Link href={`/products/${product.id}`} className="block flex-1 no-underline">
        <div className="relative h-64 overflow-hidden border-b-2 border-palette-lighter bg-palette-lighter">
          {showImage ? (
            <img
              src={product.image}
              alt={product.title}
              className="h-full w-full object-cover transition duration-500 ease-in-out group-hover:scale-110"
              loading="lazy"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <ProductImageFallback />
          )}
          <div className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${
            product.available
              ? 'bg-white text-emerald-700'
              : product.inStock
                ? 'bg-white text-amber-700'
                : 'bg-white text-stone-600'
          }`}>
            {stockLabel}
          </div>
        </div>

        <div className="flex flex-col px-4 pt-4">
          <div className="font-primary text-xs font-semibold uppercase tracking-wide text-palette-primary">
            {product.category}
          </div>
          <h2 className="pt-1 font-primary text-xl font-semibold leading-tight text-palette-primary">
            {product.title}
          </h2>
          <p className="pt-2 font-primary text-sm font-light leading-5 text-gray-600">
            {product.description || product.brand}
          </p>
        </div>
      </Link>

      <div className="mt-auto px-4 pb-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 truncate text-xs font-semibold uppercase tracking-wide text-gray-500">
            {product.brand}
          </div>
          <div className="rounded-full bg-palette-lighter px-3 py-1 font-primary text-sm font-semibold text-palette-dark">
            <Price amount={product.price} />
          </div>
        </div>
        <button
          type="button"
          onClick={() => cartContext?.addToCart(product)}
          disabled={!product.available}
          className="mt-3 w-full rounded-md bg-palette-primary px-4 py-2 font-primary text-sm font-semibold text-white shadow-sm transition hover:bg-palette-dark disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          Add to cart
        </button>
      </div>
    </article>
  )
}

export default ProductCard
