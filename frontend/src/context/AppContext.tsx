import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { CartItem, EventItem, TicketClass } from '../types'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { type Locale, useLanguage } from '../i18n'

type Toast = { message: string; tone?: 'success' | 'error' | 'info' } | null

type AppContextValue = {
  cart: CartItem[]
  favoriteIds: number[]
  cartOpen: boolean
  toast: Toast
  cartCount: number
  cartTotal: number
  addToCart: (event: EventItem, ticket: TicketClass, quantity: number) => void
  updateQuantity: (ticketId: number, quantity: number) => void
  removeFromCart: (ticketId: number) => void
  toggleFavorite: (eventId: number) => void
  setCartOpen: (open: boolean) => void
  showToast: (message: string, tone?: NonNullable<Toast>['tone']) => void
  clearCart: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

const cartAddedCopy: Record<Locale, string> = {
  en: 'Tickets added to your reservations.',
  fa: 'بلیت به سبد رزرو شما اضافه شد.',
  ru: 'Билеты добавлены в ваши бронирования.',
  tr: 'Biletler rezervasyonlarınıza eklendi.',
}

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { locale } = useLanguage()
  const [cart, setCart] = useLocalStorage<CartItem[]>('nexus-cart', [])
  const [favoriteIds, setFavoriteIds] = useLocalStorage<number[]>('nexus-favorites', [])
  const [cartOpen, setCartOpen] = useState(false)
  const [toast, setToast] = useState<Toast>(null)

  const showToast = (message: string, tone: NonNullable<Toast>['tone'] = 'success') => {
    setToast({ message, tone })
    window.setTimeout(() => setToast(null), 3600)
  }

  const addToCart = (event: EventItem, ticket: TicketClass, quantity: number) => {
    setCart((current) => {
      const existing = current.find((item) => item.ticket.id === ticket.id)
      if (existing) {
        return current.map((item) =>
          item.ticket.id === ticket.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, ticket.remaining_capacity) }
            : item,
        )
      }
      return [...current, { event, ticket, quantity }]
    })
    setCartOpen(true)
    showToast(cartAddedCopy[locale])
  }

  const updateQuantity = (ticketId: number, quantity: number) => {
    if (quantity < 1) {
      setCart((current) => current.filter((item) => item.ticket.id !== ticketId))
      return
    }
    setCart((current) =>
      current.map((item) =>
        item.ticket.id === ticketId
          ? { ...item, quantity: Math.min(quantity, item.ticket.remaining_capacity) }
          : item,
      ),
    )
  }

  const removeFromCart = (ticketId: number) =>
    setCart((current) => current.filter((item) => item.ticket.id !== ticketId))

  const toggleFavorite = (eventId: number) => {
    setFavoriteIds((current) =>
      current.includes(eventId) ? current.filter((id) => id !== eventId) : [...current, eventId],
    )
  }

  const value = useMemo<AppContextValue>(
    () => ({
      cart,
      favoriteIds,
      cartOpen,
      toast,
      cartCount: cart.reduce((sum, item) => sum + item.quantity, 0),
      cartTotal: cart.reduce((sum, item) => sum + item.ticket.price * item.quantity, 0),
      addToCart,
      updateQuantity,
      removeFromCart,
      toggleFavorite,
      setCartOpen,
      showToast,
      clearCart: () => setCart([]),
    }),
    [cart, favoriteIds, cartOpen, locale, toast],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used inside AppProvider')
  return context
}
