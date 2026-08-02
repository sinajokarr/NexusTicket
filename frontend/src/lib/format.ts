import type { Locale } from '../i18n'
import { getIntlLocale } from '../i18n'

const configuredCurrency = import.meta.env.VITE_CURRENCY?.trim().toUpperCase()
export const priceCurrency = configuredCurrency && /^[A-Z]{3}$/.test(configuredCurrency) ? configuredCurrency : 'USD'

export const formatPrice = (price: number | string, locale: Locale = 'en') =>
  new Intl.NumberFormat(getIntlLocale(locale), {
    style: 'currency',
    currency: priceCurrency,
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: 0,
  }).format(Number(price) || 0)

export const formatNumber = (value: number, locale: Locale = 'en') => new Intl.NumberFormat(getIntlLocale(locale)).format(value)

export const formatDate = (value: string, locale: Locale = 'en', options: Intl.DateTimeFormatOptions = {}) =>
  new Intl.DateTimeFormat(getIntlLocale(locale), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...options,
  }).format(new Date(value))

export const formatShortDate = (value: string, locale: Locale = 'en') =>
  new Intl.DateTimeFormat(getIntlLocale(locale), {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(new Date(value))

export const formatTime = (value: string, locale: Locale = 'en') =>
  new Intl.DateTimeFormat(getIntlLocale(locale), { hour: '2-digit', minute: '2-digit' }).format(new Date(value))

export const getDateBadge = (value: string, locale: Locale = 'en') => {
  const parts = new Intl.DateTimeFormat(getIntlLocale(locale), {
    day: 'numeric',
    month: 'short',
  }).formatToParts(new Date(value))

  return {
    day: parts.find((part) => part.type === 'day')?.value ?? '',
    month: parts.find((part) => part.type === 'month')?.value ?? '',
  }
}

export const classNames = (...values: Array<string | false | null | undefined>) =>
  values.filter(Boolean).join(' ')
