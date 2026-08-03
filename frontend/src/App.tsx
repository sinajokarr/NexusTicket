import { useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation, useParams } from './router'
import { CartDrawer, Footer, Header } from './components/ShopUI'
import { LanguageProvider, type Locale, useLanguage } from './i18n/sinshop'
import { ShopProvider } from './context/ShopContext'
import { AccountPage, AuthPage, CheckoutPage, HomePage, InfoPage, NotFound, ProductPage, ShopPage, StoryPage, WishlistPage } from './pages/StorePages'
import type { Category } from './data/catalog'

const titles: Record<Locale, string> = { en: 'SinShop — Movement, considered.', fa: 'سین‌شاپ — حرکت، با دقت.', tr: 'SinShop — Hareket, özenle.', ru: 'SinShop — Движение, осмысленно.' }
const Meta = () => { const { locale } = useLanguage(); const { pathname } = useLocation(); useEffect(() => { document.title = titles[locale]; window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }); const description = 'SinShop — premium active lifestyle equipment for movement, recovery and wellbeing.'; let element = document.querySelector('meta[name="description"]'); if (!element) { element = document.createElement('meta'); element.setAttribute('name', 'description'); document.head.append(element) }; element.setAttribute('content', description); document.documentElement.style.colorScheme = 'light' }, [locale, pathname]); return null }
const CategoryRoute = () => { const { category } = useParams<{ category: string }>(); return <ShopPage category={category as Category | undefined} /> }
const Shell = () => <><Meta /><Header /><Routes>
  <Route path="/" element={<HomePage />} /><Route path="/:locale" element={<HomePage />} />
  <Route path="/shop" element={<ShopPage />} /><Route path="/:locale/shop" element={<ShopPage />} />
  <Route path="/categories/:category" element={<CategoryRoute />} /><Route path="/:locale/categories/:category" element={<CategoryRoute />} />
  <Route path="/product/:slug" element={<ProductPage />} /><Route path="/:locale/product/:slug" element={<ProductPage />} />
  <Route path="/wishlist" element={<WishlistPage />} /><Route path="/:locale/wishlist" element={<WishlistPage />} />
  <Route path="/checkout" element={<CheckoutPage />} /><Route path="/:locale/checkout" element={<CheckoutPage />} />
  <Route path="/login" element={<AuthPage />} /><Route path="/:locale/login" element={<AuthPage />} /><Route path="/register" element={<AuthPage register />} /><Route path="/:locale/register" element={<AuthPage register />} /><Route path="/forgot" element={<InfoPage kind="faq" />} /><Route path="/:locale/forgot" element={<InfoPage kind="faq" />} />
  <Route path="/account" element={<AccountPage />} /><Route path="/:locale/account" element={<AccountPage />} />
  <Route path="/story" element={<StoryPage />} /><Route path="/:locale/story" element={<StoryPage />} />
  <Route path="/contact" element={<InfoPage kind="contact" />} /><Route path="/:locale/contact" element={<InfoPage kind="contact" />} /><Route path="/shipping" element={<InfoPage kind="shipping" />} /><Route path="/:locale/shipping" element={<InfoPage kind="shipping" />} /><Route path="/legal" element={<InfoPage kind="legal" />} /><Route path="/:locale/legal" element={<InfoPage kind="legal" />} /><Route path="/faq" element={<InfoPage kind="faq" />} /><Route path="/:locale/faq" element={<InfoPage kind="faq" />} />
  <Route path="*" element={<NotFound />} /></Routes><Footer /><CartDrawer /></>
export const App = () => <LanguageProvider><ShopProvider><BrowserRouter><Shell /></BrowserRouter></ShopProvider></LanguageProvider>
