import type { Product } from '../data/catalog'
import type { CartLine } from '../context/ShopContext'

export type Sort = 'featured' | 'new' | 'low' | 'high' | 'rated'
export const cartLineKey = (line: Pick<CartLine, 'product' | 'size' | 'color'>) => `${line.product.id}:${line.size ?? ''}:${line.color ?? ''}`
export const mergeCartLine = (cart: CartLine[], product: Product, size?: string, color?: string) => {
  const key = cartLineKey({ product, size, color })
  return cart.some(line => cartLineKey(line) === key) ? cart.map(line => cartLineKey(line) === key ? { ...line, quantity: Math.min(line.quantity + 1, product.stock) } : line) : [...cart, { product, quantity: 1, size, color }]
}
export const updateCartLine = (cart: CartLine[], key: string, quantity: number) => quantity < 1 ? cart.filter(line => cartLineKey(line) !== key) : cart.map(line => cartLineKey(line) === key ? { ...line, quantity: Math.min(quantity, line.product.stock) } : line)
export const filterProducts = (items: Product[], options: { category?: string; query?: string; maxPrice?: number; inStock?: boolean; sort?: Sort }) => {
  const { category, query = '', maxPrice = Infinity, inStock = false, sort = 'featured' } = options
  return items.filter(product => (!category || product.category === category) && product.price <= maxPrice && (!inStock || product.stock > 0) && (!query || `${product.name} ${product.type} ${product.category}`.toLowerCase().includes(query.toLowerCase()))).sort((a, b) => sort === 'low' ? a.price - b.price : sort === 'high' ? b.price - a.price : sort === 'rated' ? b.rating - a.rating : sort === 'new' ? Number(b.new) - Number(a.new) : Number(b.featured) - Number(a.featured))
}
