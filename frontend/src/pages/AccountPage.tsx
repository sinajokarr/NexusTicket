import { CalendarDays, ChevronLeft, Heart, LogOut, MapPin, ReceiptText, Settings2, Ticket, UserRound } from 'lucide-react'
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { RefreshButton, StatePanel } from '../components/StatePanel'
import { useApp } from '../context/AppContext'
import { useLocalizedEvents } from '../data/events'
import { formatDate, formatNumber, formatPrice, formatTime } from '../lib/format'
import { type Locale, useLanguage } from '../i18n'
import { apiEnabled, authApi, getStoredUser, orderApi } from '../lib/api'
import { Link } from '../router'
import type { Order } from '../types'

type AccountInlineCopy = {
  greeting: string
  orders: string
  notifications: string
  signOut: string
  ticketsEyebrow: string
  activeReservations: string
  paidReservations: string
  viewedEvents: string
  savedEvents: string
  paid: string
  pending: string
  canceled: string
  reference: string
  ticketCount: (count: number, formattedCount: string) => string
  profileEyebrow: string
  profile: string
  city: string
  cityPlaceholder: string
  phonePlaceholder: string
  saveChanges: string
  defaultName: string
  noOrdersTitle: string
  noOrdersDescription: string
  reservationLabel: string
  profileSaved: string
  profileNote: string
}

const accountCopy: Record<Locale, AccountInlineCopy> = {
  en: {
    greeting: 'Hello', orders: 'My reservations', notifications: 'Notification settings', signOut: 'Sign out', ticketsEyebrow: 'Your tickets', activeReservations: 'Active reservations', paidReservations: 'Paid reservations', viewedEvents: 'Events viewed', savedEvents: 'Saved events', paid: 'Paid', pending: 'Pending payment', canceled: 'Canceled', reference: 'Booking reference:', ticketCount: (count, formattedCount) => `${formattedCount} ticket${count === 1 ? '' : 's'}`, profileEyebrow: 'Your details', profile: 'Profile', city: 'City', cityPlaceholder: 'New York, NY', phonePlaceholder: '(212) 555-0148', saveChanges: 'Save preferences', defaultName: 'Alex Morgan', noOrdersTitle: 'No reservations yet', noOrdersDescription: 'When you reserve a ticket, its live status will appear here.', reservationLabel: 'Nexa reservation', profileSaved: 'Your on-device profile preferences were saved.', profileNote: 'Your sign-in email is managed by your account provider.',
  },
  fa: {
    greeting: 'سلام', orders: 'رزروهای من', notifications: 'تنظیمات اطلاع‌رسانی', signOut: 'خروج از حساب', ticketsEyebrow: 'بلیت‌های شما', activeReservations: 'رزروهای فعال', paidReservations: 'رزروهای پرداخت‌شده', viewedEvents: 'رویدادهای دیده‌شده', savedEvents: 'علاقه‌مندی‌ها', paid: 'پرداخت‌شده', pending: 'در انتظار پرداخت', canceled: 'لغوشده', reference: 'کد پیگیری:', ticketCount: (_count, formattedCount) => `${formattedCount} بلیت`, profileEyebrow: 'اطلاعات شما', profile: 'پروفایل', city: 'شهر', cityPlaceholder: 'نیویورک، نیویورک', phonePlaceholder: '‎(212) 555-0148', saveChanges: 'ذخیرهٔ ترجیحات', defaultName: 'الکس مورگان', noOrdersTitle: 'هنوز رزروی ندارید', noOrdersDescription: 'پس از رزرو بلیت، وضعیت واقعی آن همین‌جا نمایش داده می‌شود.', reservationLabel: 'رزرو نکسا', profileSaved: 'ترجیحات پروفایل شما روی این دستگاه ذخیره شد.', profileNote: 'ایمیل ورود شما توسط حساب کاربری مدیریت می‌شود.',
  },
  ru: {
    greeting: 'Здравствуйте', orders: 'Мои бронирования', notifications: 'Настройки уведомлений', signOut: 'Выйти', ticketsEyebrow: 'Ваши билеты', activeReservations: 'Активные бронирования', paidReservations: 'Оплаченные бронирования', viewedEvents: 'Просмотренные события', savedEvents: 'Сохранённые события', paid: 'Оплачено', pending: 'Ожидает оплаты', canceled: 'Отменено', reference: 'Номер бронирования:', ticketCount: (count, formattedCount) => `${formattedCount} ${count === 1 ? 'билет' : count < 5 ? 'билета' : 'билетов'}`, profileEyebrow: 'Ваши данные', profile: 'Профиль', city: 'Город', cityPlaceholder: 'Нью-Йорк, штат Нью-Йорк', phonePlaceholder: '(212) 555-0148', saveChanges: 'Сохранить настройки', defaultName: 'Алекс Морган', noOrdersTitle: 'Бронирований пока нет', noOrdersDescription: 'После бронирования здесь появится его актуальный статус.', reservationLabel: 'Бронирование Nexa', profileSaved: 'Настройки профиля сохранены на этом устройстве.', profileNote: 'Email для входа управляется вашим аккаунтом.',
  },
  tr: {
    greeting: 'Merhaba', orders: 'Rezervasyonlarım', notifications: 'Bildirim ayarları', signOut: 'Çıkış yap', ticketsEyebrow: 'Biletleriniz', activeReservations: 'Aktif rezervasyonlar', paidReservations: 'Ödenen rezervasyonlar', viewedEvents: 'Görüntülenen etkinlikler', savedEvents: 'Kaydedilenler', paid: 'Ödendi', pending: 'Ödeme bekliyor', canceled: 'İptal edildi', reference: 'Rezervasyon kodu:', ticketCount: (_count, formattedCount) => `${formattedCount} bilet`, profileEyebrow: 'Bilgileriniz', profile: 'Profil', city: 'Şehir', cityPlaceholder: 'New York, NY', phonePlaceholder: '(212) 555-0148', saveChanges: 'Tercihleri kaydet', defaultName: 'Alex Morgan', noOrdersTitle: 'Henüz rezervasyonunuz yok', noOrdersDescription: 'Bir bilet rezerve ettiğinizde güncel durumu burada görünür.', reservationLabel: 'Nexa rezervasyonu', profileSaved: 'Profil tercihleriniz bu cihazda kaydedildi.', profileNote: 'Giriş e-postanız hesap sağlayıcınız tarafından yönetilir.',
  },
}

const statusLabel = (status: Order['status'], copy: AccountInlineCopy) => ({
  paid: copy.paid,
  pending: copy.pending,
  canceled: copy.canceled,
})[status]

export const AccountPage = () => {
  const [tab, setTab] = useState<'orders' | 'profile'>('orders')
  const { locale, t } = useLanguage()
  const { favoriteIds, showToast } = useApp()
  const localizedEvents = useLocalizedEvents()
  const copy = accountCopy[locale]
  const sessionUser = getStoredUser()
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(apiEnabled)
  const [ordersError, setOrdersError] = useState('')
  const [name, setName] = useState(() => sessionUser?.name || sessionUser?.email.split('@')[0] || (apiEnabled ? '—' : copy.defaultName))
  const [phone, setPhone] = useState(() => sessionUser?.phone ?? '')
  const [city, setCity] = useState(() => sessionUser?.city ?? '')

  const loadOrders = useCallback(async () => {
    if (!apiEnabled) {
      setOrders([])
      setOrdersError('')
      setOrdersLoading(false)
      return
    }
    setOrdersLoading(true)
    setOrdersError('')
    try {
      setOrders(await orderApi.list())
    } catch (reason) {
      setOrdersError(reason instanceof Error ? reason.message : t('listing.connectionError'))
    } finally {
      setOrdersLoading(false)
    }
  }, [t])

  useEffect(() => { void loadOrders() }, [loadOrders])

  useEffect(() => {
    setName(sessionUser?.name || sessionUser?.email.split('@')[0] || (apiEnabled ? '—' : copy.defaultName))
    setPhone(sessionUser?.phone ?? '')
    setCity(sessionUser?.city ?? '')
  }, [copy.defaultName, sessionUser?.city, sessionUser?.name, sessionUser?.phone])

  const demoOrders = [
    { id: 'NX-68241', event: localizedEvents[0], ticket: localizedEvents[0].ticket_classes[1], count: 2 },
    { id: 'NX-66927', event: localizedEvents[5], ticket: localizedEvents[5].ticket_classes[0], count: 1 },
  ]
  const accountEmail = orders[0]?.user_email || sessionUser?.email || (apiEnabled ? '' : 'alex.morgan@example.com')
  const activeOrderCount = apiEnabled ? orders.filter((order) => order.status !== 'canceled').length : demoOrders.length
  const paidOrderCount = apiEnabled ? orders.filter((order) => order.status === 'paid').length : 7

  const logout = () => {
    authApi.logout()
    window.location.href = '/'
  }

  const saveProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    authApi.updateLocalProfile({ name, phone, city })
    showToast(copy.profileSaved)
  }

  return (
    <main id="main-content" className="page-shell account-page">
      <section className="account-hero"><div className="container"><div className="account-avatar">{name.slice(0, 1)}</div><div><span className="eyebrow">{t('nav.account')}</span><h1>{copy.greeting}, {name}</h1>{accountEmail && <p>{accountEmail}</p>}</div></div></section>
      <div className="container account-layout"><aside className="account-nav"><button type="button" className={tab === 'orders' ? 'is-active' : ''} onClick={() => setTab('orders')}><Ticket size={19} /> {copy.orders}</button><Link to="/favorites"><Heart size={19} /> {t('nav.favorites')}</Link><button type="button" className={tab === 'profile' ? 'is-active' : ''} onClick={() => setTab('profile')}><UserRound size={19} /> {t('nav.account')}</button><button type="button"><Settings2 size={19} /> {copy.notifications}</button><button type="button" className="account-nav__logout" onClick={logout}><LogOut size={19} /> {copy.signOut}</button></aside><section className="account-content">{tab === 'orders' ? <><header className="account-content__heading"><div><span className="eyebrow">{copy.ticketsEyebrow}</span><h2>{copy.orders}</h2></div><Link className="button button--secondary" to="/events">{t('common.explore')}</Link></header><div className="account-stats"><div><span>{copy.activeReservations}</span><strong>{formatNumber(activeOrderCount, locale)}</strong></div><div><span>{apiEnabled ? copy.paidReservations : copy.viewedEvents}</span><strong>{formatNumber(paidOrderCount, locale)}</strong></div><div><span>{copy.savedEvents}</span><strong>{formatNumber(favoriteIds.length, locale)}</strong></div></div>{ordersLoading ? <p>{t('common.loading')}</p> : ordersError ? <StatePanel type="error" title={t('listing.connectionError')} description={ordersError} action={<RefreshButton onClick={() => void loadOrders()} />} /> : apiEnabled ? (orders.length ? <div className="account-orders">{orders.map((order) => { const ticketCount = order.items.reduce((sum, item) => sum + item.quantity, 0); const ticketTitle = order.items.map((item) => item.ticket_title).join(' · ') || copy.reservationLabel; return <article className="account-order" key={order.id}><div aria-hidden="true" style={{ display: 'grid', minHeight: '100%', placeItems: 'center', borderRadius: '10px', background: 'var(--canvas-deep)', color: 'var(--green)' }}><ReceiptText size={30} /></div><div className="account-order__body" style={{ gridColumn: '2 / -1' }}><div className="account-order__topline"><span className="status-badge">{statusLabel(order.status, copy)}</span><small>{copy.reference} <span dir="ltr">NX-{order.id}</span></small></div><h3>{ticketTitle}</h3><p><CalendarDays size={15} /> {formatDate(order.created_at, locale)} · {formatTime(order.created_at, locale)}</p><p><MapPin size={15} /> {copy.reservationLabel}</p><footer><span>{copy.ticketCount(ticketCount, formatNumber(ticketCount, locale))}</span><strong>{formatPrice(order.final_amount, locale)}</strong></footer></div></article> })}</div> : <StatePanel type="empty" title={copy.noOrdersTitle} description={copy.noOrdersDescription} action={<Link className="button button--primary" to="/events">{t('common.explore')}</Link>} />) : <div className="account-orders">{demoOrders.map((order) => <article className="account-order" key={order.id}><img src={order.event.cover_image} alt="" /><div className="account-order__body"><div className="account-order__topline"><span className="status-badge">{copy.paid}</span><small>{copy.reference} <span dir="ltr">{order.id}</span></small></div><h3>{order.event.title}</h3><p><CalendarDays size={15} /> {formatDate(order.event.date, locale)} · {formatTime(order.event.date, locale)}</p><p><MapPin size={15} /> {order.event.location}</p><footer><span>{order.ticket.title} · {copy.ticketCount(order.count, formatNumber(order.count, locale))}</span><strong>{formatPrice(order.ticket.price * order.count, locale)}</strong></footer></div><Link className="button button--secondary button--compact" to={`/events/${order.event.slug}`}>{t('common.details')} <ChevronLeft size={16} /></Link></article>)}</div>}</> : <><header className="account-content__heading"><div><span className="eyebrow">{copy.profileEyebrow}</span><h2>{copy.profile}</h2></div></header><form className="profile-form" onSubmit={saveProfile}><label>{t('checkout.fullName')}<input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" /></label><label>{t('checkout.email')}<input value={accountEmail} dir="ltr" readOnly aria-readonly="true" /></label><label>{t('checkout.phone')}<input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder={copy.phonePlaceholder} dir="ltr" autoComplete="tel" /></label><label>{copy.city}<input value={city} onChange={(event) => setCity(event.target.value)} placeholder={copy.cityPlaceholder} autoComplete="address-level2" /></label><button className="button button--primary" type="submit">{copy.saveChanges}</button></form><p className="checkout-terms">{copy.profileNote}</p></>}</section></div>
    </main>
  )
}
