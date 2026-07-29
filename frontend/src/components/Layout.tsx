import {
  CalendarDays,
  ChevronDown,
  Globe2,
  Heart,
  House,
  LogIn,
  Menu,
  Search,
  ShoppingBag,
  Ticket,
  UserRound,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, NavLink, useLocation, useNavigate } from '../router'
import { useApp } from '../context/AppContext'
import { type Locale, localeMeta, useLanguage } from '../i18n'
import { SiteLogo } from './SiteLogo'

const chromeCopy: Record<Locale, { skip: string; menuOpen: string; menuClose: string; primaryNav: string; language: string; mobileNav: string }> = {
  en: { skip: 'Skip to main content', menuOpen: 'Open menu', menuClose: 'Close menu', primaryNav: 'Primary navigation', language: 'Choose language', mobileNav: 'Mobile navigation' },
  fa: { skip: 'پرش به محتوای اصلی', menuOpen: 'باز کردن منو', menuClose: 'بستن منو', primaryNav: 'ناوبری اصلی', language: 'انتخاب زبان', mobileNav: 'ناوبری موبایل' },
  ru: { skip: 'Перейти к основному содержанию', menuOpen: 'Открыть меню', menuClose: 'Закрыть меню', primaryNav: 'Основная навигация', language: 'Выбрать язык', mobileNav: 'Мобильная навигация' },
  tr: { skip: 'Ana içeriğe geç', menuOpen: 'Menüyü aç', menuClose: 'Menüyü kapat', primaryNav: 'Ana navigasyon', language: 'Dil seçin', mobileNav: 'Mobil navigasyon' },
}

const LanguageSwitcher = () => {
  const { locale, setLocale } = useLanguage()
  const chrome = chromeCopy[locale]
  const [open, setOpen] = useState(false)
  const switcherRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const closeOnOutsidePress = (event: MouseEvent) => {
      if (!switcherRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', closeOnOutsidePress)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutsidePress)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  return (
    <div className="language-switcher" ref={switcherRef}>
      <button type="button" className="language-switcher__trigger" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-haspopup="menu" aria-label={chrome.language}>
        <Globe2 size={16} /> <span>{localeMeta[locale].shortLabel}</span><ChevronDown size={13} />
      </button>
      {open && <div className="language-switcher__menu" role="menu">{(Object.keys(localeMeta) as Array<keyof typeof localeMeta>).map((code) => <button key={code} type="button" role="menuitem" className={code === locale ? 'is-active' : ''} onClick={() => { setLocale(code); setOpen(false) }}><span>{localeMeta[code].shortLabel}</span>{localeMeta[code].nativeName}</button>)}</div>}
    </div>
  )
}

export const Header = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { cartCount, setCartOpen } = useApp()
  const { t, locale } = useLanguage()
  const chrome = chromeCopy[locale]
  const [query, setQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const isAuthenticated = Boolean(localStorage.getItem('nexus-demo-user') || localStorage.getItem('nexus-access-token'))
  const navItems = [
    { label: t('nav.events'), to: '/events' },
    { label: t('nav.music'), to: '/events?category=live-music' },
    { label: t('nav.theater'), to: '/events?category=film-culture' },
    { label: t('nav.sports'), to: '/events?category=sport-outdoors' },
    { label: t('nav.journal'), to: '/about' },
  ]

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = query.trim()
    navigate(trimmed ? `/events?search=${encodeURIComponent(trimmed)}` : '/events')
    setMenuOpen(false)
  }

  return (
    <>
      <a className="skip-link" href="#main-content">{chrome.skip}</a>
      <header className="site-header">
        <div className="container site-header__inner">
          <button className="icon-button site-header__menu" type="button" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? chrome.menuClose : chrome.menuOpen} aria-expanded={menuOpen}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <SiteLogo />
          <nav className={`main-nav${menuOpen ? ' main-nav--open' : ''}`} aria-label={chrome.primaryNav}>
            {navItems.map((item) => <NavLink key={item.to} to={item.to} onClick={() => setMenuOpen(false)}>{item.label}</NavLink>)}
          </nav>
          <form className="header-search" onSubmit={submitSearch} role="search">
            <Search size={18} aria-hidden="true" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('nav.search')} aria-label={t('nav.search')} />
          </form>
          <div className="header-actions">
            <LanguageSwitcher />
            <Link className={`icon-button${pathname === '/favorites' ? ' is-active' : ''}`} to="/favorites" aria-label={t('nav.favorites')}><Heart size={20} /></Link>
            <Link className="header-login" to={isAuthenticated ? '/account' : '/login'} aria-label={isAuthenticated ? t('nav.account') : t('nav.signIn')}>
              {isAuthenticated ? <UserRound size={17} /> : <LogIn size={17} />}
              <span>{isAuthenticated ? t('nav.account') : t('nav.signIn')}</span>
            </Link>
            <button className="icon-button cart-button" type="button" onClick={() => setCartOpen(true)} aria-label={`${t('nav.cart')}, ${cartCount.toLocaleString(localeMeta[locale].intl)}`}>
              <ShoppingBag size={20} />
              {cartCount > 0 && <span>{cartCount.toLocaleString(localeMeta[locale].intl)}</span>}
            </button>
          </div>
        </div>
      </header>
    </>
  )
}

export const Footer = () => (
  <FooterContent />
)

const FooterContent = () => {
  const { t } = useLanguage()
  return <footer className="site-footer">
    <div className="container site-footer__grid">
      <section className="site-footer__brand">
        <SiteLogo inverted />
        <p>{t('home.description')}</p>
        <div className="footer-trust"><span>✓ {t('home.securePayment')}</span><span>✓ {t('home.support')}</span><span>✓ {t('home.clearTickets')}</span></div>
      </section>
      <section>
        <h2>{t('footer.discovery')}</h2>
        <Link to="/events">{t('footer.allEvents')}</Link>
        <Link to="/events?category=live-music">{t('nav.music')}</Link>
        <Link to="/events?category=film-culture">{t('nav.theater')}</Link>
        <Link to="/events?category=sport-outdoors">{t('nav.sports')}</Link>
      </section>
      <section>
        <h2>{t('footer.withNexa')}</h2>
        <Link to="/about">{t('footer.about')}</Link>
        <Link to="/contact">{t('footer.contact')}</Link>
        <Link to="/legal">{t('footer.legal')}</Link>
        <a href="mailto:hello@nexa.live">hello@nexa.live</a>
      </section>
      <section>
        <h2>{t('footer.newsletterTitle')}</h2>
        <p className="site-footer__newsletter-copy">{t('footer.newsletterCopy')}</p>
        <form className="footer-newsletter" onSubmit={(event) => event.preventDefault()}>
          <label className="sr-only" htmlFor="footer-email">{t('checkout.email')}</label>
          <input id="footer-email" type="email" placeholder="email@example.com" dir="ltr" />
          <button className="button button--lime button--compact" type="submit">{t('footer.subscribe')}</button>
        </form>
      </section>
    </div>
    <div className="container site-footer__bottom"><span>{t('footer.rights')}</span><span>{t('footer.madeFor')}</span></div>
  </footer>
}

export const MobileBottomNav = () => {
  const { cartCount, setCartOpen } = useApp()
  const { t, locale } = useLanguage()
  const chrome = chromeCopy[locale]
  return (
    <nav className="mobile-bottom-nav" aria-label={chrome.mobileNav}>
      <NavLink to="/"><House size={19} /><span>{t('common.home')}</span></NavLink>
      <NavLink to="/events"><Search size={19} /><span>{t('listing.search')}</span></NavLink>
      <button type="button" onClick={() => setCartOpen(true)}><span className="mobile-cart-icon"><Ticket size={19} />{cartCount > 0 && <b>{cartCount.toLocaleString(localeMeta[locale].intl)}</b>}</span><span>{t('nav.cart')}</span></button>
      <NavLink to="/account"><UserRound size={19} /><span>{t('nav.account')}</span></NavLink>
    </nav>
  )
}

export const AuthPrompt = () => {
  const { t } = useLanguage()
  return <Link className="button button--primary" to="/login"><LogIn size={18} /> {t('nav.signIn')}</Link>
}
