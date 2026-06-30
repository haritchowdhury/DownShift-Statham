import ProductCard from '@/components/ProductCard'

function ProductListings({ products }) {
  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-x-4 gap-y-8 py-10 sm:grid-cols-2 lg:grid-cols-3">
      {
        products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))
      }
    </div>
  )
}

export default ProductListings
