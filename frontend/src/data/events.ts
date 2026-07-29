import { useMemo } from 'react'
import type { Locale } from '../i18n'
import { useLanguage } from '../i18n'
import type { EventCategory, EventItem } from '../types'
import { internationalEventCategories, internationalEvents, type InternationalEventSeed } from './international-events'

const categoryNames: Record<Locale, Record<string, string>> = {
  en: {
    'live-music': 'Live Music',
    'film-culture': 'Film & Culture',
    'markets-workshops': 'Markets & Workshops',
    'sport-outdoors': 'Sport & Outdoors',
    family: 'Family',
  },
  fa: {
    'live-music': 'موسیقی زنده',
    'film-culture': 'فیلم و فرهنگ',
    'markets-workshops': 'بازار و کارگاه',
    'sport-outdoors': 'ورزش و فضای باز',
    family: 'خانواده',
  },
  ru: {
    'live-music': 'Живая музыка',
    'film-culture': 'Кино и культура',
    'markets-workshops': 'Маркеты и мастерские',
    'sport-outdoors': 'Спорт и природа',
    family: 'Семья',
  },
  tr: {
    'live-music': 'Canlı Müzik',
    'film-culture': 'Film ve Kültür',
    'markets-workshops': 'Pazarlar ve Atölyeler',
    'sport-outdoors': 'Spor ve Açık Hava',
    family: 'Aile',
  },
}

export const localizedCities: Record<Locale, Array<{ value: string; label: string }>> = {
  en: [
    { value: 'New York', label: 'New York' },
    { value: 'Los Angeles', label: 'Los Angeles' },
    { value: 'Chicago', label: 'Chicago' },
    { value: 'San Francisco', label: 'San Francisco' },
  ],
  fa: [
    { value: 'نیویورک', label: 'نیویورک' },
    { value: 'لس‌آنجلس', label: 'لس‌آنجلس' },
    { value: 'شیکاگو', label: 'شیکاگو' },
    { value: 'سان‌فرانسیسکو', label: 'سان‌فرانسیسکو' },
  ],
  ru: [
    { value: 'Нью-Йорк', label: 'Нью-Йорк' },
    { value: 'Лос-Анджелес', label: 'Лос-Анджелес' },
    { value: 'Чикаго', label: 'Чикаго' },
    { value: 'Сан-Франциско', label: 'Сан-Франциско' },
  ],
  tr: [
    { value: 'New York', label: 'New York' },
    { value: 'Los Angeles', label: 'Los Angeles' },
    { value: 'Chicago', label: 'Chicago' },
    { value: 'San Francisco', label: 'San Francisco' },
  ],
}

export const getLocalizedCategories = (locale: Locale): EventCategory[] =>
  internationalEventCategories.map((category) => ({
    ...category,
    name: categoryNames[locale][category.slug] ?? category.name,
  }))

const localizeEvent = (event: InternationalEventSeed, locale: Locale): EventItem => {
  if (locale === 'en') {
    return {
      ...event,
      categories: event.categories.map((category) => ({ ...category })),
      ticket_classes: event.ticket_classes.map((ticket) => ({ ...ticket })),
    }
  }

  const translation = event.translations[locale]
  return {
    ...event,
    title: translation.title,
    description: translation.description,
    location: translation.location,
    address: translation.address,
    categories: event.categories.map((category) => ({
      ...category,
      name: categoryNames[locale][category.slug] ?? category.name,
    })),
    ticket_classes: event.ticket_classes.map((ticket) => ({
      ...ticket,
      title: translation.ticketTiers[ticket.id] ?? ticket.title,
    })),
  }
}

export const getLocalizedEvents = (locale: Locale): EventItem[] => internationalEvents.map((event) => localizeEvent(event, locale))

// English is the fallback for API and non-react consumers.
export const categories = getLocalizedCategories('en')
export const events = getLocalizedEvents('en')

export const useLocalizedCategories = () => {
  const { locale } = useLanguage()
  return useMemo(() => getLocalizedCategories(locale), [locale])
}

export const useLocalizedEvents = () => {
  const { locale } = useLanguage()
  return useMemo(() => getLocalizedEvents(locale), [locale])
}

export const useLocalizedCities = () => {
  const { locale } = useLanguage()
  return localizedCities[locale]
}
