import Link from 'next/link'
import { useCartContext } from '@/context/Store'

function Nav() {
  const cartContext = useCartContext()
  const itemCount = cartContext?.itemCount || 0

  return (
    <header className="sticky top-0 z-20 border-b border-palette-lighter bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 pb-2 pt-4 md:pt-6">
        <Link href="/?reset=1" className="flex flex-col leading-none no-underline">
          <span className="font-primary text-2xl font-extrabold tracking-tight text-palette-primary">
            Down<span className="text-palette-dark">Shift</span>
          </span>
          <span className="mt-1 font-primary text-xs font-bold uppercase tracking-wide text-palette-dark">
            Statham
          </span>
        </Link>
        <Link
          href="/cart"
          className="relative font-primary text-sm font-semibold text-palette-primary no-underline hover:text-palette-dark"
          aria-label="Cart"
        >
          Cart
          {itemCount > 0 && (
            <span className="absolute -right-4 -top-3 rounded-full bg-palette-primary px-2 py-0.5 text-xs text-white">
              {itemCount}
            </span>
          )}
        </Link>
      </div>
    </header >
  )
}

export default Nav
