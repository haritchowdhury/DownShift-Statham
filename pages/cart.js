import Link from 'next/link'
import Price from '@/components/Price'
import { useCartContext } from '@/context/Store'

function CartPage() {
  const cartContext = useCartContext()
  const cart = cartContext?.cart || []
  const subtotal = cartContext?.subtotal || 0

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="font-primary text-4xl font-bold text-palette-dark">
        Your Cart
      </h1>

      {cart.length === 0 ? (
        <div className="mt-10 rounded-md border border-palette-lighter bg-white px-6 py-12 text-center font-primary shadow-sm">
          <p className="text-lg font-semibold text-palette-dark">Your cart is empty.</p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-md bg-palette-primary px-5 py-3 text-sm font-semibold text-white no-underline hover:bg-palette-dark"
          >
            Continue shopping
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-8 divide-y divide-palette-lighter rounded-md border border-palette-lighter bg-white shadow-sm">
            {cart.map(item => (
              <div key={item.id} className="grid gap-4 p-4 sm:grid-cols-[96px_1fr_auto] sm:items-center">
                <div className="h-24 w-24 overflow-hidden rounded bg-palette-lighter">
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center px-2 text-center font-primary text-xs text-palette-primary">
                      No image
                    </div>
                  )}
                </div>

                <div className="font-primary">
                  <Link href={`/products/${item.id}`} className="text-lg font-semibold text-palette-primary no-underline hover:text-palette-dark">
                    {item.title}
                  </Link>
                  <p className="mt-1 text-sm text-gray-600">{item.brand}</p>
                  <div className="mt-2 font-semibold text-palette-dark">
                    <Price amount={item.price} />
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:justify-end">
                  <label className="sr-only" htmlFor={`quantity-${item.id}`}>Quantity</label>
                  <input
                    id={`quantity-${item.id}`}
                    type="number"
                    min="0"
                    step="1"
                    value={item.quantity}
                    onChange={event => cartContext?.updateCartQuantity(item.id, event.target.value)}
                    className="form-input w-20 rounded-sm border-gray-300 text-gray-900 focus:border-palette-primary focus:ring-palette-primary"
                  />
                  <button
                    type="button"
                    onClick={() => cartContext?.updateCartQuantity(item.id, 0)}
                    className="rounded border border-palette-light px-3 py-2 font-primary text-sm font-semibold text-palette-primary hover:bg-palette-lighter"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-4 rounded-md bg-palette-lighter p-5 font-primary sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-palette-primary">Subtotal</p>
              <div className="mt-1 text-2xl font-bold text-palette-dark">
                <Price amount={subtotal} />
              </div>
            </div>
            <button
              type="button"
              onClick={() => cartContext?.clearCart()}
              className="rounded-md border border-palette-primary px-5 py-3 text-sm font-semibold text-palette-primary hover:bg-white"
            >
              Clear cart
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default CartPage
