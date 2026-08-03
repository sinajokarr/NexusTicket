import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Product } from '../data/catalog'
import { cartLineKey, mergeCartLine, updateCartLine } from '../lib/commerce'

export type CartLine = { product: Product; quantity: number; size?: string; color?: string }
type ShopContextValue = {
  cart: CartLine[]; wishlist: string[]; cartOpen: boolean; setCartOpen: (value: boolean) => void; toast: string | null
  add: (product: Product, size?: string, color?: string) => void; update: (key: string, quantity: number) => void; remove: (key: string) => void; toggleWish: (id: string) => void; clearCart: () => void
}
const ShopContext = createContext<ShopContextValue | null>(null)
const read = <T,>(key: string, fallback: T): T => { try { return JSON.parse(localStorage.getItem(key) ?? '') as T } catch { return fallback } }

export const ShopProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartLine[]>(() => read('sinshop-cart', []))
  const [wishlist, setWishlist] = useState<string[]>(() => read('sinshop-wishlist', []))
  const [cartOpen, setCartOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  useEffect(() => localStorage.setItem('sinshop-cart', JSON.stringify(cart)), [cart])
  useEffect(() => localStorage.setItem('sinshop-wishlist', JSON.stringify(wishlist)), [wishlist])
  const add = (product: Product, size?: string, color?: string) => {
    setCart(current => mergeCartLine(current, product, size, color))
    setCartOpen(true); setToast('added'); window.setTimeout(() => setToast(null), 2200)
  }
  const value = useMemo(() => ({ cart, wishlist, cartOpen, setCartOpen, toast, add, update: (key: string, quantity: number) => setCart(current => updateCartLine(current, key, quantity)), remove: (key: string) => setCart(current => current.filter(line => cartLineKey(line) !== key)), toggleWish: (id: string) => setWishlist(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]), clearCart: () => setCart([]) }), [cart, wishlist, cartOpen, toast])
  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}
export const useShop = () => { const value = useContext(ShopContext); if (!value) throw new Error('ShopProvider missing'); return value }
export const cartKey = cartLineKey
