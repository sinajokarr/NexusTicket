import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  Headphones,
  MapPin,
  Music2,
  PartyPopper,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TicketCheck,
  Trophy,
  UsersRound,
  VenetianMask,
} from 'lucide-react'
import { type FormEvent } from 'react'
import { EventCard } from '../components/EventCard'
import { useLocalizedCategories, useLocalizedCities, useLocalizedEvents } from '../data/events'
import { localeMeta, useLanguage } from '../i18n'
import { formatDate, formatNumber, formatPrice, formatShortDate, getDateBadge } from '../lib/format'
import { Link, useNavigate } from '../router'

const categoryIcons = [Music2, VenetianMask, PartyPopper, Trophy, UsersRound, Sparkles]

export const HomePage = () => {
  const navigate = useNavigate()
  const { locale, t } = useLanguage()
  const categories = useLocalizedCategories()
  const cities = useLocalizedCities()
  const events = useLocalizedEvents()
  const heroEvent = events[0]
  const featuredEvent = events[3]
  const heroDate = getDateBadge(heroEvent.date, locale)
  const newYork = cities[0]?.value ?? 'New York'
  const twoDigits = (value: number) => formatNumber(value, locale).padStart(2, locale === 'fa' ? '۰' : '0')

  const submitDiscovery = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const search = String(data.get('search') ?? '').trim()
    const location = String(data.get('location') ?? '')
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (location) params.set('location', location)
    navigate(`/events${params.size ? `?${params.toString()}` : ''}`)
  }

  return (
    <main id="main-content" className="premium-home">
      <section className="premium-hero">
        <div className="premium-hero__texture" aria-hidden="true" />
        <div className="premium-hero__orb premium-hero__orb--one" aria-hidden="true" />
        <div className="premium-hero__orb premium-hero__orb--two" aria-hidden="true" />
        <div className="container premium-hero__grid">
          <div className="premium-hero__copy">
            <span className="premium-kicker"><Sparkles size={14} /> {t('home.kicker')}</span>
            <h1>{t('home.titleLine1')}<br /><span>{t('home.titleLine2')}</span></h1>
            <p>{t('home.description')}</p>
            <div className="premium-hero__actions">
              <Link className="button button--signal" to="/events">{t('home.browse')} <ArrowLeft size={18} /></Link>
              <a className="premium-watch-link" href="#selected-events"><span>{twoDigits(1)}</span> {t('home.weeklySelections')}</a>
            </div>
            <div className="premium-proof"><div className="premium-proof__faces"><span>S</span><span>M</span><span>R</span><span>N</span></div><p><strong>25,000+</strong> {t('home.proof')}</p></div>
          </div>

          <div className="premium-hero__stage" aria-label={t('home.editorialPick')}>
            <div className="premium-stage__glow" aria-hidden="true" />
            <article className="premium-stage-card">
              <img src={heroEvent.cover_image} alt={`${heroEvent.title} event poster`} fetchPriority="high" />
              <div className="premium-stage-card__veil" />
              <div className="premium-stage-card__top"><span>{t('home.editorialPick')}</span><div className="premium-date-chip"><strong>{heroDate.day}</strong><small>{heroDate.month}</small></div></div>
              <div className="premium-stage-card__content"><p>{formatDate(heroEvent.date, locale, { weekday: 'long' })} · {heroEvent.location}</p><h2>{heroEvent.title}</h2><Link to={`/events/${heroEvent.slug}`}>{t('home.reserveSeat')} <ChevronLeft size={17} /></Link></div>
            </article>
            <div className="premium-stage-note"><span className="premium-stage-note__number">{twoDigits(2)}</span><div><small>{t('home.startsAt')}</small><strong>{formatPrice(Math.min(...heroEvent.ticket_classes.map((item) => item.price)), locale)}</strong></div><span className="premium-stage-note__line" /></div>
            <div className="premium-stage-stamp"><span>LIVE</span><strong>EXPERIENCE<br />IS NOW</strong></div>
          </div>
        </div>
        <div className="container premium-search-wrap">
          <form className="premium-discovery" onSubmit={submitDiscovery} role="search">
            <label className="premium-discovery__field"><span><Search size={18} /> {t('home.searchLabel')}</span><input name="search" placeholder={t('home.searchPlaceholder')} aria-label={t('home.searchLabel')} /></label>
            <label className="premium-discovery__field premium-discovery__field--city"><span><MapPin size={18} /> {t('home.cityLabel')}</span><select name="location" defaultValue=""><option value="">{t('home.anywhere')}</option>{cities.slice(0, 3).map((city) => <option key={city.value} value={city.value}>{city.label}</option>)}</select></label>
            <button className="premium-discovery__submit" type="submit" aria-label={t('listing.search')}><ArrowLeft size={23} /></button>
          </form>
          <div className="premium-search-wrap__hint"><span>{t('home.quickPicks')}</span><Link to="/events?category=live-music">{t('nav.music')}</Link><Link to="/events?category=film-culture">{t('nav.theater')}</Link><Link to="/events?category=sport-outdoors">{t('nav.sports')}</Link></div>
        </div>
        <div className="premium-marquee" aria-hidden="true"><span>LIVE MUSIC</span><i>✦</i><span>THEATRE</span><i>✦</i><span>SPORT</span><i>✦</i><span>ONE NIGHT ONLY</span><i>✦</i><span>LIVE MUSIC</span><i>✦</i><span>THEATRE</span><i>✦</i><span>SPORT</span></div>
      </section>

      <section className="container premium-category-section" aria-labelledby="category-title">
        <div className="premium-section-heading"><div><span className="premium-kicker premium-kicker--dark">{t('home.categoryEyebrow')}</span><h2 id="category-title">{t('home.categoryTitle')}</h2></div><Link className="premium-outline-link" to="/events">{t('common.seeAll')} <ArrowLeft size={16} /></Link></div>
        <div className="premium-category-rail">{categories.map((category, index) => { const Icon = categoryIcons[index] ?? Sparkles; return <Link to={`/events?category=${category.slug}`} className="premium-category" key={category.id}><span className="premium-category__index">{twoDigits(index + 1)}</span><span className="premium-category__icon"><Icon size={25} /></span><h3>{category.name}</h3><small>{t('home.discoverShows')}</small><ArrowLeft className="premium-category__arrow" size={17} /></Link> })}</div>
      </section>

      <section className="premium-feature-row" id="selected-events" aria-labelledby="selected-title">
        <div className="container">
          <div className="premium-section-heading"><div><span className="premium-kicker premium-kicker--dark">{t('home.selectedEyebrow')}</span><h2 id="selected-title">{t('home.selectedTitle')}</h2></div><Link className="premium-outline-link" to="/events?sort=popular">{t('home.viewCalendar')} <ArrowLeft size={16} /></Link></div>
          <div className="premium-selected-layout">
            <article className="premium-featured-event">
              <img src={featuredEvent.cover_image} alt={`${featuredEvent.title} event poster`} loading="lazy" />
              <div className="premium-featured-event__shade" />
              <div className="premium-featured-event__header"><span>{t('home.cityPulse')}</span><span><Star size={13} fill="currentColor" /> {(featuredEvent.rating ?? 4.9).toLocaleString(localeMeta[locale].intl)}</span></div>
              <div className="premium-featured-event__body"><p><CalendarDays size={15} /> {formatShortDate(featuredEvent.date, locale)} <i /> <MapPin size={15} /> {featuredEvent.location}</p><h3>{featuredEvent.title}</h3><div><strong>{t('common.from')} {formatPrice(Math.min(...featuredEvent.ticket_classes.map((item) => item.price)), locale)}</strong><Link to={`/events/${featuredEvent.slug}`}>{t('common.reserve')} <ArrowLeft size={16} /></Link></div></div>
            </article>
            <div className="premium-event-grid">{events.slice(1, 5).filter((event) => event.id !== featuredEvent.id).map((event) => <EventCard event={event} key={event.id} />)}</div>
          </div>
        </div>
      </section>

      <section className="container premium-city-section" aria-labelledby="city-title">
        <div className="premium-city-copy"><span className="premium-kicker premium-kicker--dark">{t('home.cityPulse')}</span><h2 id="city-title">{t('home.cityTitle1')}<br />{t('home.cityTitle2')}</h2><p>{t('home.cityDescription')}</p><div className="premium-city-copy__facts"><span><TicketCheck size={19} /><strong>700+</strong> {t('home.trustedEvents')}</span><span><ShieldCheck size={19} /><strong>{t('home.securePayment')}</strong></span></div><Link className="button button--ink" to={`/events?location=${encodeURIComponent(newYork)}`}>{t('home.cityEvents')} <ArrowLeft size={18} /></Link></div>
        <div className="premium-city-collage"><img className="premium-city-collage__main" src="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1100&q=85" alt={t('home.cityHighlight')} loading="lazy" /><img className="premium-city-collage__side" src="https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=700&q=80" alt={t('card.eventType')} loading="lazy" /><span className="premium-city-collage__tag">{t('home.cityHighlight')}</span></div>
      </section>

      <section className="premium-assurance"><div className="container premium-assurance__grid"><div><span><TicketCheck size={24} /></span><h3>{t('home.clearTickets')}</h3><p>{t('home.clearTicketsText')}</p></div><div><span><ShieldCheck size={24} /></span><h3>{t('home.safeReservation')}</h3><p>{t('home.safeReservationText')}</p></div><div><span><Headphones size={24} /></span><h3>{t('home.support')}</h3><p>{t('home.supportText')}</p></div></div></section>

      <section className="container premium-journal-section" aria-labelledby="journal-title">
        <div className="premium-section-heading"><div><span className="premium-kicker premium-kicker--dark">{t('home.journalEyebrow')}</span><h2 id="journal-title">{t('home.journal')}</h2></div><Link className="premium-outline-link" to="/about">{t('home.readMore')} <ArrowLeft size={16} /></Link></div>
        <div className="premium-journal-grid"><article className="premium-journal-story premium-journal-story--large"><img src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=85" alt={t('home.journalTitle')} loading="lazy" /><div><span>{t('home.journalCategory')}</span><h3>{t('home.journalTitle')}</h3><Link to="/about" aria-label={t('home.readMore')}><ArrowLeft size={18} /></Link></div></article><article className="premium-journal-story"><img src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80" alt={t('home.journalSecond')} loading="lazy" /><div><span>{t('home.journalBackstage')}</span><h3>{t('home.journalSecond')}</h3></div></article><aside className="premium-quote"><span>«</span><blockquote>{t('home.quote')}</blockquote><div><span className="premium-quote__avatar">N</span><p><strong>{t('home.quoteBy')}</strong><small>{t('home.quoteRole')}</small></p></div></aside></div>
      </section>

      <section className="premium-newsletter"><div className="container premium-newsletter__inner"><div><span className="premium-kicker">{t('home.newsletterEyebrow')}</span><h2>{t('home.newsletterTitle1')}<br /><em>{t('home.newsletterTitle2')}</em></h2></div><form onSubmit={(event) => event.preventDefault()}><label className="sr-only" htmlFor="premium-email">{t('checkout.email')}</label><div><input id="premium-email" type="email" placeholder={t('home.newsletterPlaceholder')} dir="ltr" /><button type="submit">{t('home.newsletterButton')} <ArrowLeft size={17} /></button></div><p>{t('home.newsletterNote')}</p></form></div></section>
    </main>
  )
}
