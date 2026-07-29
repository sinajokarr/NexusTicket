import { CalendarDays, ChevronLeft, Heart, LogOut, MapPin, Settings2, Ticket, UserRound } from 'lucide-react'
import { useState } from 'react'
import { useLocalizedEvents } from '../data/events'
import { formatDate, formatNumber, formatPrice, formatTime } from '../lib/format'
import { type Locale, useLanguage } from '../i18n'
import { Link } from '../router'

type AccountInlineCopy = {
  greeting: string
  orders: string
  notifications: string
  signOut: string
  ticketsEyebrow: string
  activeReservations: string
  viewedEvents: string
  savedEvents: string
  paid: string
  reference: string
  ticketCount: (count: number, formattedCount: string) => string
  profileEyebrow: string
  profile: string
  city: string
  cityPlaceholder: string
  phonePlaceholder: string
  saveChanges: string
  defaultName: string
}

const accountCopy: Record<Locale, AccountInlineCopy> = {
  en: {
    greeting: 'Hello',
    orders: 'My reservations',
    notifications: 'Notification settings',
    signOut: 'Sign out',
    ticketsEyebrow: 'Your tickets',
    activeReservations: 'Active reservations',
    viewedEvents: 'Events viewed',
    savedEvents: 'Saved events',
    paid: 'Paid',
    reference: 'Booking reference:',
    ticketCount: (count, formattedCount) => `${formattedCount} ticket${count === 1 ? '' : 's'}`,
    profileEyebrow: 'Your details',
    profile: 'Profile',
    city: 'City',
    cityPlaceholder: 'New York, NY',
    phonePlaceholder: '(212) 555-0148',
    saveChanges: 'Save changes',
    defaultName: 'Alex Morgan',
  },
  fa: {
    greeting: 'سلام',
    orders: 'رزروهای من',
    notifications: 'تنظیمات اطلاع‌رسانی',
    signOut: 'خروج از حساب',
    ticketsEyebrow: 'بلیت‌های شما',
    activeReservations: 'رزروهای فعال',
    viewedEvents: 'رویدادهای دیده‌شده',
    savedEvents: 'علاقه‌مندی‌ها',
    paid: 'پرداخت‌شده',
    reference: 'کد پیگیری:',
    ticketCount: (_count, formattedCount) => `${formattedCount} بلیت`,
    profileEyebrow: 'اطلاعات شما',
    profile: 'پروفایل',
    city: 'شهر',
    cityPlaceholder: 'نیویورک، نیویورک',
    phonePlaceholder: '‎(212) 555-0148',
    saveChanges: 'ذخیرهٔ تغییرات',
    defaultName: 'الکس مورگان',
  },
  ru: {
    greeting: 'Здравствуйте',
    orders: 'Мои бронирования',
    notifications: 'Настройки уведомлений',
    signOut: 'Выйти',
    ticketsEyebrow: 'Ваши билеты',
    activeReservations: 'Активные бронирования',
    viewedEvents: 'Просмотренные события',
    savedEvents: 'Сохранённые события',
    paid: 'Оплачено',
    reference: 'Номер бронирования:',
    ticketCount: (count, formattedCount) => `${formattedCount} ${count === 1 ? 'билет' : count < 5 ? 'билета' : 'билетов'}`,
    profileEyebrow: 'Ваши данные',
    profile: 'Профиль',
    city: 'Город',
    cityPlaceholder: 'Нью-Йорк, штат Нью-Йорк',
    phonePlaceholder: '(212) 555-0148',
    saveChanges: 'Сохранить изменения',
    defaultName: 'Алекс Морган',
  },
  tr: {
    greeting: 'Merhaba',
    orders: 'Rezervasyonlarım',
    notifications: 'Bildirim ayarları',
    signOut: 'Çıkış yap',
    ticketsEyebrow: 'Biletleriniz',
    activeReservations: 'Aktif rezervasyonlar',
    viewedEvents: 'Görüntülenen etkinlikler',
    savedEvents: 'Kaydedilenler',
    paid: 'Ödendi',
    reference: 'Rezervasyon kodu:',
    ticketCount: (_count, formattedCount) => `${formattedCount} bilet`,
    profileEyebrow: 'Bilgileriniz',
    profile: 'Profil',
    city: 'Şehir',
    cityPlaceholder: 'New York, NY',
    phonePlaceholder: '(212) 555-0148',
    saveChanges: 'Değişiklikleri kaydet',
    defaultName: 'Alex Morgan',
  },
}

export const AccountPage = () => {
  const [tab, setTab] = useState<'orders' | 'profile'>('orders')
  const { locale, t } = useLanguage()
  const events = useLocalizedEvents()
  const copy = accountCopy[locale]
  const storedUser = JSON.parse(localStorage.getItem('nexus-demo-user') ?? 'null') as Partial<{ name: string; email: string }> | null
  const demoUser = {
    name: storedUser?.name?.trim() || copy.defaultName,
    email: storedUser?.email?.trim() || 'alex.morgan@example.com',
  }
  const accountOrders = [
    { id: 'NX-68241', event: events[0], ticket: events[0].ticket_classes[1], count: 2 },
    { id: 'NX-66927', event: events[5], ticket: events[5].ticket_classes[0], count: 1 },
  ]

  const logout = () => {
    localStorage.removeItem('nexus-demo-user')
    localStorage.removeItem('nexus-access-token')
    localStorage.removeItem('nexus-refresh-token')
    window.location.href = '/'
  }

  return (
    <main id="main-content" className="page-shell account-page">
      <section className="account-hero">
        <div className="container">
          <div className="account-avatar">{demoUser.name.slice(0, 1)}</div>
          <div>
            <span className="eyebrow">{t('nav.account')}</span>
            <h1>{copy.greeting}, {demoUser.name}</h1>
            <p>{demoUser.email}</p>
          </div>
        </div>
      </section>

      <div className="container account-layout">
        <aside className="account-nav">
          <button type="button" className={tab === 'orders' ? 'is-active' : ''} onClick={() => setTab('orders')}>
            <Ticket size={19} /> {copy.orders}
          </button>
          <Link to="/favorites"><Heart size={19} /> {t('nav.favorites')}</Link>
          <button type="button" className={tab === 'profile' ? 'is-active' : ''} onClick={() => setTab('profile')}>
            <UserRound size={19} /> {t('nav.account')}
          </button>
          <button type="button"><Settings2 size={19} /> {copy.notifications}</button>
          <button type="button" className="account-nav__logout" onClick={logout}><LogOut size={19} /> {copy.signOut}</button>
        </aside>

        <section className="account-content">
          {tab === 'orders' ? (
            <>
              <header className="account-content__heading">
                <div>
                  <span className="eyebrow">{copy.ticketsEyebrow}</span>
                  <h2>{copy.orders}</h2>
                </div>
                <Link className="button button--secondary" to="/events">{t('common.explore')}</Link>
              </header>

              <div className="account-stats">
                <div><span>{copy.activeReservations}</span><strong>{formatNumber(2, locale)}</strong></div>
                <div><span>{copy.viewedEvents}</span><strong>{formatNumber(7, locale)}</strong></div>
                <div><span>{copy.savedEvents}</span><strong>{formatNumber(4, locale)}</strong></div>
              </div>

              <div className="account-orders">
                {accountOrders.map((order) => (
                  <article className="account-order" key={order.id}>
                    <img src={order.event.cover_image} alt="" />
                    <div className="account-order__body">
                      <div className="account-order__topline">
                        <span className="status-badge">{copy.paid}</span>
                        <small>{copy.reference} <span dir="ltr">{order.id}</span></small>
                      </div>
                      <h3>{order.event.title}</h3>
                      <p><CalendarDays size={15} /> {formatDate(order.event.date, locale)} · {formatTime(order.event.date, locale)}</p>
                      <p><MapPin size={15} /> {order.event.location}</p>
                      <footer>
                        <span>{order.ticket.title} · {copy.ticketCount(order.count, formatNumber(order.count, locale))}</span>
                        <strong>{formatPrice(order.ticket.price * order.count, locale)}</strong>
                      </footer>
                    </div>
                    <Link className="button button--secondary button--compact" to={`/events/${order.event.slug}`}>
                      {t('common.details')} <ChevronLeft size={16} />
                    </Link>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <>
              <header className="account-content__heading">
                <div>
                  <span className="eyebrow">{copy.profileEyebrow}</span>
                  <h2>{copy.profile}</h2>
                </div>
              </header>
              <form className="profile-form" onSubmit={(event) => event.preventDefault()}>
                <label>{t('checkout.fullName')}<input defaultValue={demoUser.name} /></label>
                <label>{t('checkout.email')}<input defaultValue={demoUser.email} dir="ltr" /></label>
                <label>{t('checkout.phone')}<input placeholder={copy.phonePlaceholder} dir="ltr" /></label>
                <label>{copy.city}<input placeholder={copy.cityPlaceholder} /></label>
                <button className="button button--primary" type="submit">{copy.saveChanges}</button>
              </form>
            </>
          )}
        </section>
      </div>
    </main>
  )
}
