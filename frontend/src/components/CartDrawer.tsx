import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import { Link } from '../router'
import { useApp } from '../context/AppContext'
import { useLanguage } from '../i18n'
import { formatNumber, formatPrice } from '../lib/format'

export const CartDrawer = () => {
  const { cart, cartOpen, cartTotal, removeFromCart, setCartOpen, updateQuantity } = useApp()
  const { locale, t } = useLanguage()

  return (
    <div className={`cart-drawer-wrap${cartOpen ? ' is-open' : ''}`} aria-hidden={!cartOpen}>
      <button className="drawer-backdrop" type="button" aria-label={t('common.close')} onClick={() => setCartOpen(false)} />
      <aside className="cart-drawer" aria-label={t('cart.title')}>
        <header className="cart-drawer__header">
          <div><span className="eyebrow">{t('cart.title')}</span><h2>{cart.length ? `${formatNumber(cart.length, locale)} ${t('cart.selections')}` : t('cart.emptyTitle')}</h2></div>
          <button className="icon-button" type="button" onClick={() => setCartOpen(false)} aria-label={t('common.close')}><X size={21} /></button>
        </header>
        {cart.length === 0 ? (
          <div className="cart-empty">
            <span><ShoppingBag size={30} /></span>
            <h3>{t('cart.emptyTitle')}</h3>
            <p>{t('cart.emptyDescription')}</p>
            <Link className="button button--primary" to="/events" onClick={() => setCartOpen(false)}>{t('cart.discover')}</Link>
          </div>
        ) : (
          <>
            <div className="cart-drawer__items">
              {cart.map((item) => (
                <article className="cart-line" key={item.ticket.id}>
                  <img src={item.event.cover_image} alt="" />
                  <div className="cart-line__body">
                    <h3>{item.event.title}</h3>
                    <p>{item.ticket.title}</p>
                    <strong>{formatPrice(item.ticket.price, locale)}</strong>
                    <div className="quantity-stepper" aria-label={`${t('detail.ticketQuantity')}: ${item.event.title}`}>
                      <button type="button" onClick={() => updateQuantity(item.ticket.id, item.quantity - 1)} aria-label="−"><Minus size={14} /></button>
                      <span>{formatNumber(item.quantity, locale)}</span>
                      <button type="button" onClick={() => updateQuantity(item.ticket.id, item.quantity + 1)} disabled={item.quantity >= item.ticket.remaining_capacity} aria-label="+"><Plus size={14} /></button>
                    </div>
                  </div>
                  <button className="icon-button cart-line__delete" type="button" onClick={() => removeFromCart(item.ticket.id)} aria-label={`${t('cart.remove')} ${item.event.title}`}><Trash2 size={17} /></button>
                </article>
              ))}
            </div>
            <footer className="cart-drawer__footer">
              <div><span>{t('cart.payable')}</span><strong>{formatPrice(cartTotal, locale)}</strong></div>
              <Link className="button button--primary button--full" to="/checkout" onClick={() => setCartOpen(false)}>{t('cart.continue')}</Link>
              <p>{t('cart.note')}</p>
            </footer>
          </>
        )}
      </aside>
    </div>
  )
}
