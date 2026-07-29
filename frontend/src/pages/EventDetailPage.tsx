import {
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Heart,
  MapPin,
  Maximize2,
  Minus,
  Plus,
  Share2,
  ShieldCheck,
  Star,
  Ticket,
  Truck,
  UsersRound,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from '../router'
import { EventCard } from '../components/EventCard'
import { StatePanel } from '../components/StatePanel'
import { useApp } from '../context/AppContext'
import { useLocalizedEvents } from '../data/events'
import { localeMeta, type Locale, useLanguage } from '../i18n'
import { apiEnabled, eventApi } from '../lib/api'
import { classNames, formatDate, formatNumber, formatPrice, formatTime } from '../lib/format'
import type { EventItem, TicketClass } from '../types'

type DetailExtraCopy = {
  categoryFallback: string
  withArtists: string
  descriptionExtra: string
  entryText: string
  cancellationText: string
  accessText: string
  reviewEyebrow: string
  reviewList: Array<{ name: string; initial: string; score: number; text: string; date: string }>
  shareCopied: string
  imageOf: string
  imageView: string
  expandImage: string
  decrease: string
  increase: string
  removeImage: string
  eventFor: string
}

const detailExtra: Record<Locale, DetailExtraCopy> = {
  en: {
    categoryFallback: 'Live experience',
    withArtists: 'Featuring',
    descriptionExtra: 'The room is designed around sound, light, and an easy flow from arrival to encore. Keep your digital ticket and a photo ID ready for a seamless entry.',
    entryText: 'Venue doors open 90 minutes before the start time. Late entry is managed by the venue team and may be paused during the performance.',
    cancellationText: 'Refund and exchange terms are set by each organizer. Your final policy is shown before payment and remains available with your ticket.',
    accessText: 'Plan to arrive a little early so you can settle in before the first moment begins.',
    reviewEyebrow: 'From the guest list',
    reviewList: [
      { name: 'Maya Wilson', initial: 'M', score: 5, text: 'Everything was clear from ticket selection to the door. The whole evening felt thoughtfully put together.', date: '2 days ago' },
      { name: 'Oliver Reed', initial: 'O', score: 5, text: 'Great event details, instant ticket delivery, and a very smooth checkout.', date: '1 week ago' },
      { name: 'Nora Bennett', initial: 'N', score: 4, text: 'Fast to book and the support team answered my question quickly.', date: '2 weeks ago' },
    ],
    shareCopied: 'Event link copied to your clipboard.',
    imageOf: 'A view of',
    imageView: 'Show image',
    expandImage: 'Expand image',
    decrease: 'Decrease quantity',
    increase: 'Increase quantity',
    removeImage: 'Close image',
    eventFor: 'A live room for anyone looking to feel more of the city.',
  },
  fa: {
    categoryFallback: 'تجربهٔ زنده',
    withArtists: 'با حضور',
    descriptionExtra: 'فضای اجرا با تمرکز بر صدا، نور و جریان روان ورود تا پایان برنامه طراحی شده است. برای ورود بی‌دردسر، بلیت دیجیتال و کارت شناسایی خود را آماده نگه دارید.',
    entryText: 'درهای سالن ۹۰ دقیقه پیش از شروع باز می‌شوند. ورود دیرهنگام با نظر تیم محل برگزاری مدیریت می‌شود و ممکن است هنگام اجرا متوقف شود.',
    cancellationText: 'شرایط بازگشت وجه و جابه‌جایی هر اجرا توسط برگزارکننده تعیین می‌شود. سیاست نهایی پیش از پرداخت نشان داده می‌شود و در بلیت شما باقی می‌ماند.',
    accessText: 'کمی زودتر برسید تا پیش از شروع، با آرامش در فضا مستقر شوید.',
    reviewEyebrow: 'از زبان مهمان‌ها',
    reviewList: [
      { name: 'مایا ویلسون', initial: 'م', score: 5, text: 'از انتخاب بلیت تا ورود، همه‌چیز روشن و منظم بود. کل شب واقعاً با دقت طراحی شده بود.', date: '۲ روز پیش' },
      { name: 'الیور رید', initial: 'ا', score: 5, text: 'اطلاعات اجرا کامل بود، بلیت فوری رسید و پرداخت خیلی روان انجام شد.', date: '۱ هفته پیش' },
      { name: 'نورا بنت', initial: 'ن', score: 4, text: 'رزرو سریع بود و تیم پشتیبانی خیلی زود به پرسشم جواب داد.', date: '۲ هفته پیش' },
    ],
    shareCopied: 'پیوند رویداد در کلیپ‌بورد کپی شد.',
    imageOf: 'نمایی از',
    imageView: 'نمایش تصویر',
    expandImage: 'بزرگ‌نمایی تصویر',
    decrease: 'کاهش تعداد',
    increase: 'افزایش تعداد',
    removeImage: 'بستن تصویر',
    eventFor: 'یک فضای زنده برای کسانی که می‌خواهند بیشتر از شهرشان حس بگیرند.',
  },
  ru: {
    categoryFallback: 'Живое впечатление',
    withArtists: 'С участием',
    descriptionExtra: 'Пространство выстроено вокруг звука, света и спокойного пути от входа до финального аккорда. Подготовьте электронный билет и документ с фото для лёгкого входа.',
    entryText: 'Двери площадки открываются за 90 минут до начала. Поздний вход регулирует команда площадки и во время выступления он может быть приостановлен.',
    cancellationText: 'Условия возврата и обмена устанавливает организатор. Итоговые правила показаны до оплаты и остаются доступными вместе с билетом.',
    accessText: 'Приезжайте немного раньше, чтобы спокойно освоиться до первого номера.',
    reviewEyebrow: 'От гостей',
    reviewList: [
      { name: 'Майя Уилсон', initial: 'М', score: 5, text: 'От выбора билета до входа всё было понятно. Весь вечер ощущался очень продуманным.', date: '2 дня назад' },
      { name: 'Оливер Рид', initial: 'О', score: 5, text: 'Отличные детали события, мгновенный билет и очень плавная оплата.', date: '1 неделю назад' },
      { name: 'Нора Беннетт', initial: 'Н', score: 4, text: 'Бронировать было быстро, а поддержка оперативно ответила на вопрос.', date: '2 недели назад' },
    ],
    shareCopied: 'Ссылка на событие скопирована.',
    imageOf: 'Вид на',
    imageView: 'Показать изображение',
    expandImage: 'Увеличить изображение',
    decrease: 'Уменьшить количество',
    increase: 'Увеличить количество',
    removeImage: 'Закрыть изображение',
    eventFor: 'Живое пространство для тех, кто хочет почувствовать город сильнее.',
  },
  tr: {
    categoryFallback: 'Canlı deneyim',
    withArtists: 'Sahnede',
    descriptionExtra: 'Mekân; ses, ışık ve girişten kapanışa rahat bir akış etrafında tasarlandı. Sorunsuz giriş için dijital biletinizi ve fotoğraflı kimliğinizi hazır bulundurun.',
    entryText: 'Mekân kapıları başlangıç saatinden 90 dakika önce açılır. Geç giriş mekân ekibi tarafından yönetilir ve performans sırasında durdurulabilir.',
    cancellationText: 'İade ve değişim koşulları her organizatör tarafından belirlenir. Nihai politikanız ödeme öncesinde gösterilir ve biletinizle birlikte erişilebilir kalır.',
    accessText: 'İlk an başlamadan önce yerleşebilmek için biraz erken gelmenizi öneririz.',
    reviewEyebrow: 'Konuklardan',
    reviewList: [
      { name: 'Maya Wilson', initial: 'M', score: 5, text: 'Bilet seçiminden kapıya kadar her şey açıktı. Tüm akşam özenle kurgulanmış hissettirdi.', date: '2 gün önce' },
      { name: 'Oliver Reed', initial: 'O', score: 5, text: 'Etkinlik detayları harikaydı, bilet anında geldi ve ödeme çok rahattı.', date: '1 hafta önce' },
      { name: 'Nora Bennett', initial: 'N', score: 4, text: 'Rezervasyon hızlıydı, destek ekibi de soruma kısa sürede yanıt verdi.', date: '2 hafta önce' },
    ],
    shareCopied: 'Etkinlik bağlantısı panoya kopyalandı.',
    imageOf: 'Görünüm:',
    imageView: 'Görseli göster',
    expandImage: 'Görseli büyüt',
    decrease: 'Adedi azalt',
    increase: 'Adedi artır',
    removeImage: 'Görseli kapat',
    eventFor: 'Şehrin daha fazlasını hissetmek isteyen herkes için canlı bir oda.',
  },
}

const galleryImages = [
  'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1400&q=85',
  'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?auto=format&fit=crop&w=1200&q=80',
]

const getFirstAvailable = (event: EventItem) => event.ticket_classes.find((ticket) => !ticket.is_sold_out) ?? event.ticket_classes[0]

export const EventDetailPage = () => {
  const { slug } = useParams()
  const { locale, t } = useLanguage()
  const events = useLocalizedEvents()
  const fallback = events.find((item) => item.slug === slug)
  const [event, setEvent] = useState<EventItem | undefined>(fallback)
  const [loading, setLoading] = useState(apiEnabled && !fallback)
  const [selectedTicket, setSelectedTicket] = useState<TicketClass | undefined>(fallback ? getFirstAvailable(fallback) : undefined)
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const [imageOpen, setImageOpen] = useState(false)
  const { addToCart, favoriteIds, toggleFavorite, showToast } = useApp()
  const extra = detailExtra[locale]

  useEffect(() => {
    if (fallback) {
      setEvent(fallback)
      setSelectedTicket(getFirstAvailable(fallback))
      setLoading(false)
      return
    }
    if (!apiEnabled) return
    eventApi.list().then((rows) => {
      const found = rows.find((item) => item.slug === slug)
      setEvent(found)
      setSelectedTicket(found ? getFirstAvailable(found) : undefined)
    }).finally(() => setLoading(false))
  }, [fallback, slug])

  const gallery = useMemo(() => event ? [event.cover_image, ...galleryImages.filter((image) => image !== event.cover_image)] : [], [event])
  if (loading) return <main id="main-content" className="page-shell"><div className="container detail-loading"><div className="skeleton skeleton--detail-image" /><div><div className="skeleton skeleton--line" /><div className="skeleton skeleton--line skeleton--medium" /><div className="skeleton skeleton--line" /></div></div></main>
  if (!event || !selectedTicket) return <main id="main-content" className="page-shell"><div className="container"><StatePanel type="empty" title={t('detail.notFound')} description={t('detail.notFoundDescription')} action={<Link className="button button--primary" to="/events">{t('detail.backToEvents')}</Link>} /></div></main>

  const lowestPrice = Math.min(...event.ticket_classes.map((ticket) => ticket.price))
  const isFavorite = favoriteIds.includes(event.id)
  const activeImageUrl = gallery[activeImage] ?? event.cover_image
  const amount = selectedTicket.price * quantity
  const availability = selectedTicket.remaining_capacity

  const addSelection = () => {
    if (selectedTicket.is_sold_out || availability === 0) return
    addToCart(event, selectedTicket, quantity)
  }

  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: event.title, url: window.location.href })
      else {
        await navigator.clipboard.writeText(window.location.href)
        showToast(extra.shareCopied)
      }
    } catch {
      // A dismissed share sheet should not interrupt the page.
    }
  }

  return (
    <main id="main-content" className="page-shell event-detail-page">
      <div className="container breadcrumbs"><Link to="/">{t('common.home')}</Link><span>/</span><Link to="/events">{t('nav.events')}</Link><span>/</span><strong>{event.title}</strong></div>
      <section className="container detail-top">
        <div className="event-gallery">
          <div className="event-gallery__main"><img src={activeImageUrl} alt={`${extra.imageOf} ${event.title}`} /><button className="gallery-expand" type="button" onClick={() => setImageOpen(true)} aria-label={extra.expandImage}><Maximize2 size={19} /></button></div>
          <div className="event-gallery__thumbnails">{gallery.map((image, index) => <button type="button" className={activeImage === index ? 'is-active' : ''} key={image} onClick={() => setActiveImage(index)} aria-label={`${extra.imageView} ${formatNumber(index + 1, locale)}`}><img src={image} alt="" /></button>)}</div>
        </div>
        <div className="detail-intro">
          <div className="detail-intro__topline"><span className="event-card__category">{event.categories.map((category) => category.name).join(' · ') || extra.categoryFallback}</span><div><button className={classNames('icon-button', isFavorite && 'is-active')} type="button" aria-label={t('common.favorite')} aria-pressed={isFavorite} onClick={() => toggleFavorite(event.id)}><Heart size={19} fill={isFavorite ? 'currentColor' : 'none'} /></button><button className="icon-button" type="button" aria-label={t('common.share')} onClick={share}><Share2 size={19} /></button></div></div>
          <h1>{event.title}</h1>
          {event.artists.length > 0 && <p className="detail-intro__artists">{extra.withArtists} {event.artists.map((artist) => artist.name).join(' · ')}</p>}
          <div className="event-meta-list">
            <div><span><CalendarDays size={19} /></span><div><strong>{formatDate(event.date, locale, { weekday: 'long' })}</strong><p>{formatTime(event.date, locale)} · {t('detail.venueDoors')}</p></div></div>
            <div><span><MapPin size={19} /></span><div><strong>{event.location}</strong><p>{event.address}</p></div></div>
          </div>
          <div className="detail-rating"><span><Star size={16} fill="currentColor" /> {event.rating?.toLocaleString(localeMeta[locale].intl) ?? t('detail.recent')}</span>{event.reviewCount && <a href="#reviews">{t('detail.basedOn', { count: formatNumber(event.reviewCount, locale) })}</a>}<span className="detail-rating__dot" /> <span>{t('detail.verifiedReviews')}</span></div>
        </div>
        <aside className="ticket-picker" aria-labelledby="ticket-picker-heading">
          <div className="ticket-picker__header"><div><span className="eyebrow">{t('detail.bookingSecure')}</span><h2 id="ticket-picker-heading">{t('detail.chooseTicket')}</h2></div><Ticket size={23} /></div>
          <div className="ticket-picker__progress" aria-label={t('detail.chooseTicket')}><span className="is-active">1</span><i /><span className="is-active">2</span><i /><span>3</span><small>{t('detail.stepZone')}</small><small>{t('detail.stepQuantity')}</small><small>{t('detail.stepPayment')}</small></div>
          <p className="ticket-picker__step-label"><b>1</b> {t('detail.chooseZone').replace(/^1\.\s*/, '')}</p>
          <div className="ticket-options" role="radiogroup" aria-label={t('detail.chooseTicket')}>
            {event.ticket_classes.map((ticket) => {
              const isSelected = selectedTicket.id === ticket.id
              return <button type="button" className={classNames('ticket-option', isSelected && 'is-selected', ticket.is_sold_out && 'is-sold-out')} key={ticket.id} role="radio" aria-checked={isSelected} disabled={ticket.is_sold_out} onClick={() => { setSelectedTicket(ticket); setQuantity(1) }}><span className="ticket-option__radio">{isSelected && <Check size={13} />}</span><span className="ticket-option__body"><strong>{ticket.title}</strong><small>{ticket.is_sold_out ? t('detail.soldOut') : t('detail.left', { count: formatNumber(ticket.remaining_capacity, locale) })}</small></span><strong className="ticket-option__price">{formatPrice(ticket.price, locale)}</strong></button>
            })}
          </div>
          {!selectedTicket.is_sold_out && <div className="ticket-quantity"><span><b>2</b> {t('detail.ticketQuantity').replace(/^2\.\s*/, '')}</span><div className="quantity-stepper"><button type="button" aria-label={extra.decrease} onClick={() => setQuantity((count) => Math.max(1, count - 1))}><Minus size={15} /></button><strong>{formatNumber(quantity, locale)}</strong><button type="button" aria-label={extra.increase} onClick={() => setQuantity((count) => Math.min(availability, count + 1))} disabled={quantity >= availability}><Plus size={15} /></button></div></div>}
          <div className="ticket-picker__total"><span>{t('detail.ticketTotal')}</span><strong>{formatPrice(amount, locale)}</strong></div>
          <button className="button button--primary button--full button--large" type="button" onClick={addSelection} disabled={selectedTicket.is_sold_out}>{selectedTicket.is_sold_out ? t('detail.soldOut') : t('detail.continueBooking')}</button>
          <p className="ticket-picker__note"><ShieldCheck size={15} /> {t('detail.capacityConfirmed')}</p>
        </aside>
      </section>

      <section className="container event-content-grid">
        <div className="event-content">
          <section className="content-block"><span className="eyebrow">{t('detail.about')}</span><h2>{event.title}</h2><p>{event.description}</p><p>{extra.descriptionExtra}</p></section>
          <section className="content-block details-accordion"><h2>{t('detail.whatToKnow')}</h2><details open><summary>{t('detail.entryTiming')} <ChevronDown size={18} /></summary><p>{extra.entryText}</p></details><details><summary>{t('detail.cancellation')} <ChevronDown size={18} /></summary><p>{extra.cancellationText}</p></details><details><summary>{t('detail.access')} <ChevronDown size={18} /></summary><p>{event.address}. {extra.accessText}</p></details></section>
          <section className="content-block" id="reviews"><div className="content-block__heading"><div><span className="eyebrow">{extra.reviewEyebrow}</span><h2>{t('detail.reviews')}</h2></div><div className="reviews-score"><strong>{event.rating?.toLocaleString(localeMeta[locale].intl) ?? '4.9'}</strong><span><span className="review-stars">★★★★★</span><small>{t('detail.basedOn', { count: formatNumber(event.reviewCount ?? 0, locale) })}</small></span></div></div><div className="reviews-list">{extra.reviewList.map((review) => <article className="review-card" key={review.name}><span className="review-avatar">{review.initial}</span><div><header><strong>{review.name}</strong><time>{review.date}</time></header><span className="review-stars">{'★'.repeat(review.score)}{'☆'.repeat(5 - review.score)}</span><p>{review.text}</p></div></article>)}</div><button className="button button--secondary" type="button">{t('detail.showReviews')}</button></section>
        </div>
        <aside className="event-info-rail"><div><span><Clock3 size={19} /></span><div><small>{t('detail.eventTime')}</small><strong>{formatDate(event.date, locale)} · {formatTime(event.date, locale)}</strong></div></div><div><span><UsersRound size={19} /></span><div><small>{t('detail.designedFor')}</small><strong>{t('detail.designedForValue')}</strong></div></div><div><span><Truck size={19} /></span><div><small>{t('detail.delivery')}</small><strong>{t('detail.deliveryValue')}</strong></div></div></aside>
      </section>

      <section className="section container related-events" aria-labelledby="related-heading"><div className="section-heading section-heading--split"><div><span className="eyebrow">{t('detail.related')}</span><h2 id="related-heading">{t('detail.relatedTitle')}</h2></div><Link className="text-link" to="/events">{t('common.seeAll')}</Link></div><div className="event-grid event-grid--three">{events.filter((item) => item.id !== event.id).slice(0, 3).map((item) => <EventCard event={item} key={item.id} />)}</div></section>

      <div className="mobile-reserve-bar"><div><span>{t('common.from')}</span><strong>{formatPrice(lowestPrice, locale)}</strong></div><button className="button button--primary" type="button" onClick={addSelection}>{t('detail.addToCart')}</button></div>
      {imageOpen && <div className="image-lightbox" role="dialog" aria-modal="true" aria-label={`${extra.imageOf} ${event.title}`}><button type="button" className="icon-button icon-button--light" onClick={() => setImageOpen(false)} aria-label={extra.removeImage}><X size={22} /></button><img src={activeImageUrl} alt={`${extra.imageOf} ${event.title}`} /></div>}
      <script type="application/ld+json">{JSON.stringify({ '@context': 'https://schema.org', '@type': 'Event', name: event.title, startDate: event.date, location: { '@type': 'Place', name: event.location, address: event.address }, image: [event.cover_image], offers: { '@type': 'Offer', price: lowestPrice, priceCurrency: 'USD', availability: selectedTicket.is_sold_out ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock', url: window.location.href } })}</script>
    </main>
  )
}
