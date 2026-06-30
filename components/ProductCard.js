import { useState } from 'react'
import Link from 'next/link'
import Price from '@/components/Price'
import ProductImageFallback from '@/components/ProductImageFallback'

function ProductCard({ product }) {
  const [imageFailed, setImageFailed] = useState(false)
  const showImage = product.image && !imageFailed
  const stockLabel = product.available
    ? 'In stock'
    : product.inStock
      ? 'Coming soon'
      : 'Out of stock'

  return (
    <Link
      href={`/products/${product.id}`}
      className="group block h-120 w-full max-w-xs overflow-hidden rounded-md border border-palette-lighter bg-white no-underline shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:w-72"
    >
      <div className="relative h-72 overflow-hidden border-b-2 border-palette-lighter bg-palette-lighter">
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

      <div className="relative flex h-48 flex-col">
        <div className="px-4 pt-4 font-primary text-xs font-semibold uppercase tracking-wide text-palette-primary">
          {product.category}
        </div>
        <h2 className="px-4 pt-1 font-primary text-2xl font-semibold leading-tight text-palette-primary">
          {product.title}
        </h2>
        <p className="px-4 pt-2 font-primary text-sm font-light leading-5 text-gray-600">
          {product.description || product.brand}
        </p>

        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-3">
          <div className="px-4 pb-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
            {product.brand}
          </div>
          <div className="triangle relative bg-palette-lighter pb-1 pl-8 pr-4 pt-2 font-primary text-base font-medium text-palette-dark">
            <Price amount={product.price} />
          </div>
        </div>
      </div>
    </Link>
  )
}

export default ProductCard
