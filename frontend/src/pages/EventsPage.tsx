import {
  ChevronDown,
  Filter,
  Grid2X2,
  List,
  MapPin,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { EventCard } from '../components/EventCard'
import { EventSkeletons, RefreshButton, StatePanel } from '../components/StatePanel'
import { useLocalizedCategories, useLocalizedCities, useLocalizedEvents } from '../data/events'
import { apiEnabled, eventApi } from '../lib/api'
import { type Locale, useLanguage } from '../i18n'
import { formatNumber, formatPrice } from '../lib/format'
import { useSearchParams } from '../router'
import type { EventItem } from '../types'

type ViewMode = 'grid' | 'list'
const demoMaxPriceCap = 150
const localeTag = (locale: string) => locale === 'fa' ? 'fa-IR' : locale === 'ru' ? 'ru-RU' : locale === 'tr' ? 'tr-TR' : 'en-US'

const lowestTicketPrice = (event: EventItem) => {
  const prices = event.ticket_classes.map((ticket) => ticket.price).filter(Number.isFinite)
  return prices.length ? Math.min(...prices) : 0
}

const viewLabels: Record<Locale, { grid: string; list: string }> = {
  en: { grid: 'Grid view', list: 'List view' },
  fa: { grid: 'نمایش شبکه‌ای', list: 'نمایش فهرستی' },
  ru: { grid: 'Сетка', list: 'Список' },
  tr: { grid: 'Izgara görünümü', list: 'Liste görünümü' },
}

export const EventsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const { locale, t } = useLanguage()
  const localizedCategories = useLocalizedCategories()
  const localizedCities = useLocalizedCities()
  const localizedEvents = useLocalizedEvents()
  const priorLocale = useRef(locale)
  const [items, setItems] = useState<EventItem[]>(localizedEvents)
  const [loading, setLoading] = useState(apiEnabled)
  const [loadError, setLoadError] = useState('')
  const [category, setCategory] = useState(searchParams.get('category') ?? '')
  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const [location, setLocation] = useState(searchParams.get('location') ?? '')
  const [dateWindow, setDateWindow] = useState('')
  const [maxPrice, setMaxPrice] = useState<number | null>(() => apiEnabled ? null : demoMaxPriceCap)
  const [sort, setSort] = useState(searchParams.get('sort') ?? 'soon')
  const [view, setView] = useState<ViewMode>('grid')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [visibleCount, setVisibleCount] = useState(6)

  const categories = useMemo(() => {
    if (!apiEnabled) return localizedCategories
    return Array.from(new Map(
      items.flatMap((item) => item.categories).map((category) => [category.id, category] as const),
    ).values())
  }, [items, localizedCategories])

  const cities = useMemo(() => {
    if (!apiEnabled) return localizedCities
    return Array.from(new Set(items.map((item) => item.location).filter(Boolean)))
      .sort((left, right) => left.localeCompare(right, locale))
      .map((value) => ({ value, label: value }))
  }, [items, locale, localizedCities])

  const priceRange = useMemo(() => {
    if (!apiEnabled) return { min: 10, max: demoMaxPriceCap, step: 2 }
    const highestPrice = Math.max(0, ...items.flatMap((item) => item.ticket_classes.map((ticket) => ticket.price)).filter(Number.isFinite))
    if (!highestPrice) return { min: 0, max: demoMaxPriceCap, step: 2 }
    const roundingUnit = 10 ** Math.max(0, Math.floor(Math.log10(highestPrice)) - 1)
    const max = Math.ceil(highestPrice / roundingUnit) * roundingUnit
    return { min: 0, max: Math.max(1, max), step: Math.max(1, Math.round(max / 100)) }
  }, [items])
  const selectedMaxPrice = Math.min(maxPrice ?? priceRange.max, priceRange.max)

  const loadEvents = () => {
    if (!apiEnabled) return
    setLoading(true)
    setLoadError('')
    const apiParams = new URLSearchParams()
    if (search) apiParams.set('search', search)
    if (location) apiParams.set('location', location)
    eventApi.list(apiParams)
      .then(setItems)
      .catch((error: Error) => setLoadError(error.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!apiEnabled) setItems(localizedEvents)
  }, [localizedEvents])

  useEffect(() => {
    if (priorLocale.current !== locale) {
      setLocation('')
      priorLocale.current = locale
    }
  }, [locale])

  useEffect(() => {
    setMaxPrice((current) => current === null ? null : Math.min(current, priceRange.max))
  }, [priceRange.max])

  useEffect(() => { loadEvents() }, [])

  const filtered = useMemo(() => {
    const now = new Date('2026-08-01T00:00:00-04:00').getTime()
    const inWindow = (event: EventItem) => {
      if (!dateWindow) return true
      const difference = (new Date(event.date).getTime() - now) / 86_400_000
      if (dateWindow === 'week') return difference <= 7
      if (dateWindow === 'weekend') return difference >= 2 && difference <= 5
      if (dateWindow === 'month') return difference <= 31
      return true
    }
    const rows = items.filter((event) => {
      const haystack = `${event.title} ${event.location} ${event.artists.map((artist) => artist.name).join(' ')}`.toLocaleLowerCase(locale)
      const lowest = lowestTicketPrice(event)
      return (!search || haystack.includes(search.toLocaleLowerCase(locale)))
        && (!category || event.categories.some((item) => item.slug === category))
        && (!location || event.location.toLocaleLowerCase(locale).includes(location.toLocaleLowerCase(locale)))
        && lowest <= selectedMaxPrice
        && inWindow(event)
    })
    return rows.sort((a, b) => {
      if (sort === 'popular') return (b.reviewCount ?? 0) - (a.reviewCount ?? 0)
      if (sort === 'price-low') return lowestTicketPrice(a) - lowestTicketPrice(b)
      if (sort === 'price-high') return lowestTicketPrice(b) - lowestTicketPrice(a)
      return new Date(a.date).getTime() - new Date(b.date).getTime()
    })
  }, [category, dateWindow, items, locale, location, search, selectedMaxPrice, sort])

  const applySearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (category) params.set('category', category)
    if (location) params.set('location', location)
    setSearchParams(params)
    setVisibleCount(6)
  }

  const resetFilters = () => {
    setCategory('')
    setSearch('')
    setLocation('')
    setDateWindow('')
    setMaxPrice(apiEnabled ? null : demoMaxPriceCap)
    setSort('soon')
    setSearchParams({})
  }

  const selectedCount = [category, location, dateWindow, maxPrice !== null && maxPrice < priceRange.max].filter(Boolean).length

  return (
    <main id="main-content" className="page-shell events-page">
      <section className="page-hero page-hero--events"><div className="container"><span className="eyebrow">{t('listing.eyebrow')}</span><h1>{t('listing.title')}</h1><p>{t('listing.description')}</p></div></section>
      <div className="container events-layout">
        <aside className={`filters-panel${filtersOpen ? ' filters-panel--open' : ''}`} aria-label={t('listing.filters')}>
          <div className="filters-panel__header"><h2><SlidersHorizontal size={18} /> {t('listing.filters')}</h2><div><button className="filters-reset" type="button" onClick={resetFilters}>{t('listing.reset')}</button><button className="icon-button filters-close" type="button" aria-label={t('common.close')} onClick={() => setFiltersOpen(false)}><X size={20} /></button></div></div>
          <div className="filter-group"><h3>{t('listing.category')}</h3><div className="filter-options"><label><input type="radio" name="category" checked={!category} onChange={() => setCategory('')} /><span>{t('listing.allCategories')}</span></label>{categories.map((item) => <label key={item.id}><input type="radio" name="category" checked={category === item.slug} onChange={() => setCategory(item.slug)} /><span>{item.name}</span></label>)}</div></div>
          <div className="filter-group"><h3>{t('listing.time')}</h3><div className="filter-options"><label><input type="radio" name="date" checked={dateWindow === 'week'} onChange={() => setDateWindow('week')} /><span>{t('listing.comingWeek')}</span></label><label><input type="radio" name="date" checked={dateWindow === 'weekend'} onChange={() => setDateWindow('weekend')} /><span>{t('listing.weekend')}</span></label><label><input type="radio" name="date" checked={dateWindow === 'month'} onChange={() => setDateWindow('month')} /><span>{t('listing.month')}</span></label><label><input type="radio" name="date" checked={!dateWindow} onChange={() => setDateWindow('')} /><span>{t('listing.anyDate')}</span></label></div></div>
          <div className="filter-group"><h3>{t('listing.price')}</h3><div className="price-range-label"><span>{t('listing.upTo')}</span><strong>{formatPrice(selectedMaxPrice, locale)}</strong></div><input className="range-input" type="range" min={priceRange.min} max={priceRange.max} step={priceRange.step} value={selectedMaxPrice} onChange={(event) => setMaxPrice(Number(event.target.value))} aria-label={t('listing.price')} /><div className="range-ends"><span>{formatPrice(priceRange.min, locale)}</span><span>{formatPrice(priceRange.max, locale)}</span></div></div>
          <div className="filter-group"><h3>{t('listing.venue')}</h3><label className="select-wrap"><MapPin size={16} /><select value={location} onChange={(event) => setLocation(event.target.value)}><option value="">{t('listing.allVenues')}</option>{cities.map((city) => <option value={city.value} key={city.value}>{city.label}</option>)}</select><ChevronDown size={15} /></label></div>
          <button className="button button--primary button--full filters-apply" type="button" onClick={() => setFiltersOpen(false)}>{t('listing.showEvents', { count: formatNumber(filtered.length, locale) })}</button>
        </aside>
        {filtersOpen && <button className="filters-backdrop" type="button" aria-label={t('common.close')} onClick={() => setFiltersOpen(false)} />}
        <section className="events-results" aria-labelledby="events-heading">
          <div className="events-results__heading"><div><span className="eyebrow">{t('listing.eyebrow')}</span><h1 id="events-heading">{t('nav.events')}</h1><p>{loading ? t('common.loading') : `${formatNumber(filtered.length, locale)} ${t('listing.results')}`}</p></div><button className="button button--secondary filters-trigger" type="button" onClick={() => setFiltersOpen(true)}><Filter size={17} /> {t('listing.filters')} {selectedCount > 0 && <b>{selectedCount.toLocaleString(localeTag(locale))}</b>}</button></div>
          <form className="events-search" onSubmit={applySearch}><Search size={19} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('listing.searchPlaceholder')} aria-label={t('listing.search')} /><button className="button button--primary" type="submit">{t('listing.search')}</button></form>
          <div className="results-toolbar"><div className="active-filter-row">{category && <button type="button" onClick={() => setCategory('')}>{categories.find((item) => item.slug === category)?.name}<X size={14} /></button>}{location && <button type="button" onClick={() => setLocation('')}>{location}<X size={14} /></button>}{dateWindow && <button type="button" onClick={() => setDateWindow('')}>{t('listing.selectedTime')}<X size={14} /></button>}</div><div className="view-controls"><label className="sort-select"><span>{t('listing.sorting')}</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="soon">{t('listing.soonest')}</option><option value="popular">{t('listing.popular')}</option><option value="price-low">{t('listing.lowPrice')}</option><option value="price-high">{t('listing.highPrice')}</option></select><ChevronDown size={15} /></label><div className="view-toggle"><button type="button" className={view === 'grid' ? 'is-active' : ''} onClick={() => setView('grid')} aria-label={viewLabels[locale].grid}><Grid2X2 size={17} /></button><button type="button" className={view === 'list' ? 'is-active' : ''} onClick={() => setView('list')} aria-label={viewLabels[locale].list}><List size={18} /></button></div></div></div>
          {loading ? <EventSkeletons /> : loadError ? <StatePanel type="error" title={t('listing.connectionError')} description={loadError} action={<RefreshButton onClick={loadEvents} />} /> : filtered.length === 0 ? <StatePanel type="empty" title={t('listing.noResultsTitle')} description={t('listing.noResultsDescription')} action={<button className="button button--secondary" type="button" onClick={resetFilters}><RotateCcw size={17} /> {t('listing.clearFilters')}</button>} /> : <><div className={`event-grid events-results__grid${view === 'list' ? ' event-grid--list' : ''}`}>{filtered.slice(0, visibleCount).map((event) => <EventCard event={event} key={event.id} />)}</div>{visibleCount < filtered.length && <div className="load-more"><button className="button button--secondary" type="button" onClick={() => setVisibleCount((count) => count + 6)}>{t('listing.loadMore')}</button></div>}</>}
        </section>
      </div>
    </main>
  )
}
