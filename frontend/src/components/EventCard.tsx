import { ArrowLeft, CalendarDays, Heart, MapPin, Star } from 'lucide-react'
import { Link } from '../router'
import { useApp } from '../context/AppContext'
import { localeMeta, useLanguage } from '../i18n'
import { classNames, formatPrice, formatShortDate, formatTime, getDateBadge } from '../lib/format'
import type { EventItem } from '../types'

export const EventCard = ({ event, featured = false }: { event: EventItem; featured?: boolean }) => {
  const { favoriteIds, toggleFavorite } = useApp()
  const { locale, t } = useLanguage()
  const isFavorite = favoriteIds.includes(event.id)
  const lowestPrice = event.ticket_classes.length ? Math.min(...event.ticket_classes.map((ticket) => ticket.price)) : null
  const dateBadge = getDateBadge(event.date, locale)

  return (
    <article className={classNames('event-card', featured && 'event-card--featured')}>
      <Link className="event-card__image-wrap" to={`/events/${event.slug}`} aria-label={`${t('common.details')}: ${event.title}`}>
        <img src={event.cover_image} alt={`${event.title} — ${t('card.eventType')}`} className="event-card__image" loading="lazy" />
        <span className="date-badge" aria-label={formatShortDate(event.date, locale)}>
          <strong>{dateBadge.day}</strong>
          <small>{dateBadge.month}</small>
        </span>
        {event.featured && <span className="event-card__featured-label">{t('home.editorialPick')}</span>}
      </Link>
      <button
        type="button"
        className={classNames('icon-button event-card__favorite', isFavorite && 'is-active')}
        onClick={() => toggleFavorite(event.id)}
        aria-label={isFavorite ? `${t('cart.remove')}: ${event.title}` : `${t('common.favorite')}: ${event.title}`}
        aria-pressed={isFavorite}
      >
        <Heart size={19} fill={isFavorite ? 'currentColor' : 'none'} />
      </button>
      <div className="event-card__content">
        <div className="eyebrow-row">
          <span className="event-card__category">{event.categories[0]?.name ?? t('card.eventType')}</span>
          {event.rating && (
            <span className="rating"><Star size={13} fill="currentColor" /> {event.rating.toLocaleString(localeMeta[locale].intl)}</span>
          )}
        </div>
        <h3><Link to={`/events/${event.slug}`}>{event.title}</Link></h3>
        <div className="event-card__details">
          <span><CalendarDays size={15} />{formatShortDate(event.date, locale)}, {formatTime(event.date, locale)}</span>
          <span><MapPin size={15} />{event.location}</span>
        </div>
        <div className="event-card__footer">
          <span className="event-card__price-label">{lowestPrice === null ? t('detail.soldOut') : <>{t('common.from')} <strong>{formatPrice(lowestPrice, locale)}</strong></>}</span>
          <Link className="text-link" to={`/events/${event.slug}`}>{t('common.details')} <ArrowLeft size={15} aria-hidden="true" /></Link>
        </div>
      </div>
    </article>
  )
}
