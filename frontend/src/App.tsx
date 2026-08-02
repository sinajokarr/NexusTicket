import { useEffect, useState, type ReactNode } from 'react'
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from './router'
import { CartDrawer } from './components/CartDrawer'
import { Footer, Header, MobileBottomNav } from './components/Layout'
import { useApp, AppProvider } from './context/AppContext'
import { type Locale, LanguageProvider, useLanguage } from './i18n'
import { AUTH_CHANGE_EVENT, hasAuthenticatedSession } from './lib/api'
import { AccountPage } from './pages/AccountPage'
import { AuthPage } from './pages/AuthPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { EventDetailPage } from './pages/EventDetailPage'
import { EventsPage } from './pages/EventsPage'
import { FavoritesPage } from './pages/FavoritesPage'
import { HomePage } from './pages/HomePage'
import { AboutPage, ContactPage, LegalPage, NotFoundPage } from './pages/InfoPages'

const routeTitles: Record<Locale, Record<string, string>> = {
  en: { '/': 'Nexa | Find your next live moment', '/events': 'Events | Nexa', '/checkout': 'Secure checkout | Nexa', '/login': 'Sign in | Nexa', '/account': 'My account | Nexa', '/favorites': 'Saved events | Nexa', '/about': 'About Nexa', '/contact': 'Contact Nexa', '/legal': 'Terms & privacy | Nexa', detail: 'Event details | Nexa', fallback: 'Nexa | Live experiences, beautifully booked' },
  fa: { '/': 'نکسا | لحظهٔ زندهٔ بعدی‌تان را پیدا کنید', '/events': 'رویدادها | نکسا', '/checkout': 'پرداخت امن | نکسا', '/login': 'ورود | نکسا', '/account': 'حساب من | نکسا', '/favorites': 'رویدادهای ذخیره‌شده | نکسا', '/about': 'دربارهٔ نکسا', '/contact': 'تماس با نکسا', '/legal': 'قوانین و حریم خصوصی | نکسا', detail: 'جزئیات رویداد | نکسا', fallback: 'نکسا | تجربه‌های زنده، رزروی بی‌دردسر' },
  ru: { '/': 'Nexa | Найдите следующее живое впечатление', '/events': 'События | Nexa', '/checkout': 'Безопасная оплата | Nexa', '/login': 'Войти | Nexa', '/account': 'Мой аккаунт | Nexa', '/favorites': 'Сохранённые события | Nexa', '/about': 'О Nexa', '/contact': 'Контакты Nexa', '/legal': 'Условия и конфиденциальность | Nexa', detail: 'Детали события | Nexa', fallback: 'Nexa | Живые впечатления, красивое бронирование' },
  tr: { '/': 'Nexa | Sıradaki canlı anınızı bulun', '/events': 'Etkinlikler | Nexa', '/checkout': 'Güvenli ödeme | Nexa', '/login': 'Giriş | Nexa', '/account': 'Hesabım | Nexa', '/favorites': 'Kaydedilenler | Nexa', '/about': 'Nexa hakkında', '/contact': 'Nexa ile iletişim', '/legal': 'Koşullar ve gizlilik | Nexa', detail: 'Etkinlik detayları | Nexa', fallback: 'Nexa | Canlı deneyimler, kusursuz rezervasyon' },
}

const protectedMessage: Record<Locale, string> = {
  en: 'Taking you to secure sign in…',
  fa: 'در حال انتقال به ورود امن…',
  ru: 'Перенаправляем на безопасный вход…',
  tr: 'Güvenli girişe yönlendiriliyorsunuz…',
}

const ScrollAndMeta = () => {
  const { pathname } = useLocation()
  const { locale } = useLanguage()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    const titles = routeTitles[locale]
    document.title = pathname.startsWith('/events/') ? titles.detail : (titles[pathname] ?? titles.fallback)
  }, [locale, pathname])
  return null
}

const Toast = () => {
  const { toast } = useApp()
  if (!toast) return null
  return <div className={`toast toast--${toast.tone ?? 'success'}`} role="status">{toast.message}</div>
}

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { pathname, search } = useLocation()
  const navigate = useNavigate()
  const { locale } = useLanguage()
  const [authenticated, setAuthenticated] = useState(hasAuthenticatedSession)

  useEffect(() => {
    const syncAuthentication = () => setAuthenticated(hasAuthenticatedSession())
    syncAuthentication()
    window.addEventListener(AUTH_CHANGE_EVENT, syncAuthentication)
    const timer = window.setInterval(syncAuthentication, 60_000)
    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, syncAuthentication)
      window.clearInterval(timer)
    }
  }, [])

  useEffect(() => {
    if (!authenticated) navigate(`/login?next=${encodeURIComponent(`${pathname}${search}`)}`, true)
  }, [authenticated, navigate, pathname, search])

  if (!authenticated) {
    return <main className="route-guard" aria-live="polite"><span className="route-guard__spinner" /><p>{protectedMessage[locale]}</p></main>
  }
  return <>{children}</>
}

const AppShell = () => {
  const { pathname } = useLocation()
  const authMode = pathname === '/login'
  return (
    <>
      <ScrollAndMeta />
      {!authMode && <Header />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:slug" element={<EventDetailPage />} />
        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
        <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/legal" element={<LegalPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      {!authMode && <Footer />}
      {!authMode && <MobileBottomNav />}
      <CartDrawer />
      <Toast />
    </>
  )
}

export const App = () => (
  <LanguageProvider>
    <AppProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AppProvider>
  </LanguageProvider>
)
