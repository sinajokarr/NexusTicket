import { Heart } from 'lucide-react'
import { EventCard } from '../components/EventCard'
import { StatePanel } from '../components/StatePanel'
import { useApp } from '../context/AppContext'
import { useLocalizedEvents } from '../data/events'
import { type Locale, useLanguage } from '../i18n'
import { Link } from '../router'

type FavoritesInlineCopy = {
  eyebrow: string
  description: string
  emptyTitle: string
  emptyDescription: string
}

const favoritesCopy: Record<Locale, FavoritesInlineCopy> = {
  en: {
    eyebrow: 'Your personal picks',
    description: 'The events you want to keep close are waiting for you here.',
    emptyTitle: 'Nothing saved yet',
    emptyDescription: 'When an event catches your eye, save it with the heart so it is easy to find again later.',
  },
  fa: {
    eyebrow: 'انتخاب‌های شخصی شما',
    description: 'رویدادهایی که دوست دارید فراموش نشوند، اینجا منتظر شما هستند.',
    emptyTitle: 'هنوز چیزی ذخیره نکرده‌اید',
    emptyDescription: 'هر رویدادی که دلتان را برد، با قلب کنار آن نگه دارید تا بعداً راحت‌تر پیدایش کنید.',
  },
  ru: {
    eyebrow: 'Ваши личные выборы',
    description: 'События, которые вы не хотите упустить, ждут вас здесь.',
    emptyTitle: 'Пока ничего не сохранено',
    emptyDescription: 'Если событие вам понравилось, сохраните его сердечком — так его будет легко найти позже.',
  },
  tr: {
    eyebrow: 'Size özel seçimler',
    description: 'Unutmak istemediğiniz etkinlikler burada sizi bekliyor.',
    emptyTitle: 'Henüz bir şey kaydetmediniz',
    emptyDescription: 'İlginizi çeken bir etkinliği kalp simgesiyle kaydedin; daha sonra kolayca bulabilirsiniz.',
  },
}

export const FavoritesPage = () => {
  const { favoriteIds } = useApp()
  const { locale, t } = useLanguage()
  const events = useLocalizedEvents()
  const copy = favoritesCopy[locale]
  const favorites = events.filter((event) => favoriteIds.includes(event.id))

  return (
    <main id="main-content" className="page-shell favorites-page">
      <section className="page-hero page-hero--compact">
        <div className="container">
          <span className="eyebrow"><Heart size={15} /> {copy.eyebrow}</span>
          <h1>{t('nav.favorites')}</h1>
          <p>{copy.description}</p>
        </div>
      </section>
      <section className="container section">
        {favorites.length ? (
          <div className="event-grid event-grid--four">{favorites.map((event) => <EventCard event={event} key={event.id} />)}</div>
        ) : (
          <StatePanel
            type="empty"
            title={copy.emptyTitle}
            description={copy.emptyDescription}
            action={<Link className="button button--primary" to="/events">{t('common.explore')}</Link>}
          />
        )}
      </section>
    </main>
  )
}
