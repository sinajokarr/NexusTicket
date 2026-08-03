import { Heart, Menu, Minus, Plus, Search, ShoppingBag, UserRound, X, ArrowUpRight } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { categories, type Product } from '../data/catalog'
import { useLanguage, locales, localeInfo, type Locale } from '../i18n/sinshop'
import { Link, useNavigate } from '../router'
import { cartKey, useShop } from '../context/ShopContext'

const localPath = (locale: Locale) => {
  const bits = location.pathname.split('/').filter(Boolean)
  if (locales.includes(bits[0] as Locale)) bits[0] = locale
  else bits.unshift(locale)
  return `/${bits.join('/')}${location.search}`
}
export const route = (locale: Locale, path = '') => `/${locale}${path}`

export const Header = () => {
  const { locale, setLocale, t } = useLanguage(); const { cart, setCartOpen } = useShop(); const navigate = useNavigate(); const [open, setOpen] = useState(false); const [searchOpen, setSearchOpen] = useState(false)
  const changeLocale = (value: Locale) => { setLocale(value); navigate(localPath(value)) }
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const value = String(new FormData(event.currentTarget).get('query') ?? ''); setSearchOpen(false); navigate(`${route(locale, '/shop')}?search=${encodeURIComponent(value)}`) }
  return <>
    <div className="announcement">{t('announce')} <span>•</span> {t('returns')}</div>
    <header className="site-header"><Link to={route(locale)} className="wordmark" aria-label="SinShop home">SIN<span>◒</span>SHOP</Link><nav aria-label="Primary navigation"><Link to={route(locale, '/shop')}>{t('shop')}</Link><Link to={route(locale, '/categories/training')}>{t('categories')}</Link><Link to={route(locale, '/story')}>{t('story')}</Link></nav><div className="header-actions"><button aria-label={t('search')} onClick={() => setSearchOpen(true)}><Search /></button><select value={locale} onChange={event => changeLocale(event.target.value as Locale)} aria-label="Language">{locales.map(item => <option value={item} key={item}>{localeInfo[item].label}</option>)}</select><Link to={route(locale, '/account')} aria-label={t('account')}><UserRound /></Link><Link to={route(locale, '/wishlist')} aria-label={t('wishlist')}><Heart /></Link><button aria-label={t('bag')} onClick={() => setCartOpen(true)} className="bag-button"><ShoppingBag /><i>{cart.reduce((sum, line) => sum + line.quantity, 0)}</i></button><button className="mobile-menu" aria-label={t('menu')} onClick={() => setOpen(true)}><Menu /></button></div></header>
    {open && <div className="mobile-nav" role="dialog" aria-modal="true"><button aria-label={t('close')} onClick={() => setOpen(false)}><X /></button><Link onClick={() => setOpen(false)} to={route(locale, '/shop')}>{t('shop')}</Link><Link onClick={() => setOpen(false)} to={route(locale, '/categories/training')}>{t('categories')}</Link><Link onClick={() => setOpen(false)} to={route(locale, '/story')}>{t('story')}</Link><Link onClick={() => setOpen(false)} to={route(locale, '/account')}>{t('account')}</Link></div>}
    {searchOpen && <div className="search-modal" role="dialog" aria-modal="true" aria-label={t('search')}><button className="modal-close" onClick={() => setSearchOpen(false)} aria-label={t('close')}><X /></button><form onSubmit={submit}><label>{t('search')}<input autoFocus name="query" placeholder="Axis Knit Runner" /></label><button className="button" type="submit">{t('search')} <ArrowUpRight size={17} /></button></form><div className="search-suggestions">{categories.slice(0, 4).map(category => <Link onClick={() => setSearchOpen(false)} to={route(locale, `/categories/${category.id}`)} key={category.id}>{category.label}</Link>)}</div></div>}
  </>
}

export const ProductCard = ({ product, compact = false }: { product: Product; compact?: boolean }) => {
  const { locale, t, money } = useLanguage(); const { add, wishlist, toggleWish } = useShop()
  return <article className={`product-card ${compact ? 'product-card--compact' : ''}`}><Link to={route(locale, `/product/${product.slug}`)} className="product-image"><img src={product.image} alt={product.imageAlt} loading="lazy" /><span>{product.new ? t('new') : product.bestseller ? t('bestseller') : ''}</span></Link><button className={`wish ${wishlist.includes(product.id) ? 'is-active' : ''}`} onClick={() => toggleWish(product.id)} aria-label={t('wishlist')}><Heart fill={wishlist.includes(product.id) ? 'currentColor' : 'none'} /></button><div className="product-copy"><p>{product.category.replace('-', ' ')}</p><Link to={route(locale, `/product/${product.slug}`)}><h3>{product.name}</h3></Link><div className="rating">★ {product.rating} <small>({product.reviews})</small></div><div className="product-bottom"><strong>{money(product.price)}</strong><button onClick={() => add(product, product.sizes[0], product.colors[0])}>{t('quickAdd')} <Plus size={15} /></button></div></div></article>
}

export const CartDrawer = () => {
  const { cart, cartOpen, setCartOpen, update, remove } = useShop(); const { locale, t, money } = useLanguage(); const total = cart.reduce((sum, line) => sum + line.product.price * line.quantity, 0)
  if (!cartOpen) return null
  return <div className="drawer-backdrop" onMouseDown={() => setCartOpen(false)}><aside className="cart-drawer" onMouseDown={event => event.stopPropagation()} aria-label={t('bagTitle')}><header><h2>{t('bagTitle')}</h2><button onClick={() => setCartOpen(false)} aria-label={t('close')}><X /></button></header>{cart.length === 0 ? <div className="empty-cart"><p>{t('emptyBag')}</p><Link onClick={() => setCartOpen(false)} className="button button--dark" to={route(locale, '/shop')}>{t('continueShopping')}</Link></div> : <><div className="cart-lines">{cart.map(line => <article key={cartKey(line)}><img src={line.product.image} alt="" /><div><h3>{line.product.name}</h3><p>{line.size} · {line.color && <i style={{ background: line.color }} />}</p><strong>{money(line.product.price)}</strong><div className="quantity"><button onClick={() => update(cartKey(line), line.quantity - 1)} aria-label="Decrease"><Minus size={13} /></button><span>{line.quantity}</span><button onClick={() => update(cartKey(line), line.quantity + 1)} aria-label="Increase"><Plus size={13} /></button></div><button className="text-button" onClick={() => remove(cartKey(line))}>{t('remove')}</button></div></article>)}</div><div className="cart-summary"><p><span>{t('subtotal')}</span><strong>{money(total)}</strong></p><p><span>{t('shipping')}</span><strong>{total >= 150 ? t('free') : money(15)}</strong></p><p className="cart-total"><span>{t('total')}</span><strong>{money(total + (total >= 150 ? 0 : 15))}</strong></p><Link onClick={() => setCartOpen(false)} className="button button--dark" to={route(locale, '/checkout')}>{t('checkout')} <ArrowUpRight size={17} /></Link></div></>}</aside></div>
}

export const Footer = () => { const { locale, t } = useLanguage(); return <footer className="site-footer"><div className="footer-top"><Link to={route(locale)} className="wordmark">SIN<span>◒</span>SHOP</Link><p>Objects for a more capable body.</p><form onSubmit={event => event.preventDefault()}><label>{t('newsletterKicker')}<input type="email" placeholder={t('email')} /></label><button aria-label={t('subscribe')}><ArrowUpRight /></button></form></div><div className="footer-bottom"><span>© 2026 SinShop</span><Link to={route(locale, '/shipping')}>{t('shippingReturns')}</Link><Link to={route(locale, '/legal')}>{t('legal')}</Link><Link to={route(locale, '/contact')}>{t('contact')}</Link></div></footer> }
