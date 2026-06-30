import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'downshift-statham-cart'

const CartContext = createContext(null)

export function useCartContext() {
  return useContext(CartContext)
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])

  useEffect(() => {
    try {
      const storedCart = JSON.parse(localStorage.getItem(STORAGE_KEY))
      if (Array.isArray(storedCart)) setCart(storedCart)
    } catch {
      setCart([])
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart))
  }, [cart])

  function addToCart(product) {
    setCart(currentCart => {
      const existingItem = currentCart.find(item => item.id === product.id)
      if (existingItem) {
        return currentCart.map(item => (
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ))
      }

      return currentCart.concat({
        id: product.id,
        title: product.title,
        brand: product.brand,
        price: product.price,
        image: product.image,
        quantity: 1,
      })
    })
  }

  function updateCartQuantity(id, quantity) {
    const nextQuantity = Math.max(0, Number(quantity) || 0)
    setCart(currentCart => (
      currentCart
        .map(item => (
          item.id === id ? { ...item, quantity: nextQuantity } : item
        ))
        .filter(item => item.quantity > 0)
    ))
  }

  function clearCart() {
    setCart([])
  }

  const subtotal = cart.reduce((total, item) => {
    if (item.price === null) return total
    return total + item.price * item.quantity
  }, 0)

  const itemCount = cart.reduce((total, item) => total + item.quantity, 0)

  const value = useMemo(() => ({
    cart,
    itemCount,
    subtotal,
    addToCart,
    updateCartQuantity,
    clearCart,
  }), [cart, itemCount, subtotal])

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}
