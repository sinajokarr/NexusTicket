import { events as demoEvents } from '../data/events'
import type { EventItem, Order, TicketClass } from '../types'

const rawApiUrl = import.meta.env.VITE_API_URL?.trim()
const apiUrl = rawApiUrl ? rawApiUrl.replace(/\/$/, '') : ''

const ACCESS_TOKEN_KEY = 'nexus-access-token'
const REFRESH_TOKEN_KEY = 'nexus-refresh-token'
const PROFILE_KEY = 'nexus-user-profile'
const DEMO_USER_KEY = 'nexus-demo-user'
export const AUTH_CHANGE_EVENT = 'nexus-auth-change'

const fallbackCoverImage = 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1400&q=80'

type ApiEvent = Omit<Partial<EventItem>, 'ticket_classes'> & {
  ticket_classes?: Array<Partial<TicketClass> & { price?: number | string }>
}

type ApiList<T> = T[] | { results: T[] }

export type SessionUser = {
  email: string
  name?: string
  phone?: string
  city?: string
}

export type EventReview = {
  id: number
  user_email: string
  event_title: string
  rating: number
  comment: string
  created_at: string
}

export class ApiError extends Error {
  readonly status: number
  readonly payload: unknown

  constructor(message: string, status = 0, payload: unknown = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

const storageGet = (key: string) => {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

const storageSet = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Storage is an enhancement; API requests still work in restrictive browsers.
  }
}

const storageRemove = (key: string) => {
  try {
    localStorage.removeItem(key)
  } catch {
    // Ignore unavailable storage.
  }
}

const notifyAuthChange = () => {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(AUTH_CHANGE_EVENT))
}

const readUser = (key: string): SessionUser | null => {
  try {
    const parsed = JSON.parse(storageGet(key) ?? 'null') as Partial<SessionUser> | null
    if (!parsed?.email || typeof parsed.email !== 'string') return null
    return {
      email: parsed.email,
      name: typeof parsed.name === 'string' ? parsed.name : undefined,
      phone: typeof parsed.phone === 'string' ? parsed.phone : undefined,
      city: typeof parsed.city === 'string' ? parsed.city : undefined,
    }
  } catch {
    return null
  }
}

const writeUser = (key: string, user: SessionUser) => storageSet(key, JSON.stringify(user))

const getJwtPayload = (token: string | null) => {
  if (!token) return null
  try {
    const segment = token.split('.')[1]
    if (!segment) return null
    const base64 = segment.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
    return JSON.parse(atob(padded)) as { exp?: number; sub?: string | number; user_id?: string | number }
  } catch {
    return null
  }
}

const isUsableToken = (token: string | null) => {
  const payload = getJwtPayload(token)
  if (!payload) return false
  return typeof payload.exp !== 'number' || payload.exp * 1000 > Date.now()
}

export const getStoredUser = () => (apiEnabled ? readUser(PROFILE_KEY) : readUser(DEMO_USER_KEY))

export const getAuthScope = () => {
  const user = getStoredUser()
  const tokenIdentity = getJwtPayload(storageGet(ACCESS_TOKEN_KEY))?.user_id ?? getJwtPayload(storageGet(ACCESS_TOKEN_KEY))?.sub
  const identity = user?.email || tokenIdentity || 'guest'
  return `${apiEnabled ? 'api' : 'demo'}:${encodeURIComponent(String(identity).toLowerCase())}`
}

export const hasAuthenticatedSession = () => {
  if (!apiEnabled) return Boolean(readUser(DEMO_USER_KEY)?.email)
  return isUsableToken(storageGet(ACCESS_TOKEN_KEY)) || isUsableToken(storageGet(REFRESH_TOKEN_KEY))
}

const clearApiSession = () => {
  storageRemove(ACCESS_TOKEN_KEY)
  storageRemove(REFRESH_TOKEN_KEY)
  storageRemove(PROFILE_KEY)
  notifyAuthChange()
}

const resolveImage = (image: string | null | undefined) => {
  if (!image) return fallbackCoverImage
  if (/^https?:\/\//i.test(image)) return image
  return `${apiUrl}${image.startsWith('/') ? image : `/${image}`}`
}

const normaliseEvent = (event: ApiEvent): EventItem => ({
  id: event.id ?? 0,
  title: event.title ?? 'Untitled event',
  slug: event.slug ?? `event-${event.id ?? 'unknown'}`,
  description: event.description ?? '',
  cover_image: resolveImage(event.cover_image),
  date: event.date ?? new Date().toISOString(),
  location: event.location ?? 'New York, NY',
  address: event.address ?? '',
  categories: event.categories ?? [],
  artists: event.artists ?? [],
  ticket_classes: (event.ticket_classes ?? []).map((ticket, index) => ({
    id: ticket.id ?? index,
    title: ticket.title ?? 'General admission',
    price: Number(ticket.price ?? 0),
    capacity: Number(ticket.capacity ?? 0),
    sold: Number(ticket.sold ?? 0),
    is_sold_out: Boolean(ticket.is_sold_out),
    remaining_capacity: Number(ticket.remaining_capacity ?? 0),
    event: ticket.event,
  })),
  organizer: event.organizer,
  is_active: event.is_active,
  created_at: event.created_at,
})

const firstErrorMessage = (payload: unknown): string | null => {
  if (typeof payload === 'string' && payload.trim()) return payload
  if (Array.isArray(payload)) return payload.map(firstErrorMessage).find((message): message is string => Boolean(message)) ?? null
  if (!payload || typeof payload !== 'object') return null

  const record = payload as Record<string, unknown>
  if (typeof record.detail === 'string') return record.detail
  if (typeof record.message === 'string') return record.message

  for (const [field, value] of Object.entries(record)) {
    const message = firstErrorMessage(value)
    if (message) return field === 'non_field_errors' ? message : `${field}: ${message}`
  }
  return null
}

const readPayload = async (response: Response): Promise<unknown> => {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}

let refreshPromise: Promise<string | null> | null = null

const refreshAccessToken = async () => {
  const refresh = storageGet(REFRESH_TOKEN_KEY)
  if (!refresh || !isUsableToken(refresh) || !apiUrl) return null

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch(`${apiUrl}/api/auth/refresh/`, {
          method: 'POST',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh }),
        })
        const payload = await readPayload(response) as { access?: unknown }
        if (!response.ok || typeof payload?.access !== 'string') {
          clearApiSession()
          return null
        }
        storageSet(ACCESS_TOKEN_KEY, payload.access)
        notifyAuthChange()
        return payload.access
      } catch {
        return null
      } finally {
        refreshPromise = null
      }
    })()
  }
  return refreshPromise
}

type RequestOptions = {
  authenticate?: boolean
  retryAfterRefresh?: boolean
}

const request = async <T>(path: string, init?: RequestInit, options: RequestOptions = {}): Promise<T> => {
  if (!apiUrl) throw new ApiError('API URL is not configured.')

  const authenticate = options.authenticate ?? true
  const retryAfterRefresh = options.retryAfterRefresh ?? true
  const token = authenticate ? storageGet(ACCESS_TOKEN_KEY) : null
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  })

  if (response.status === 401 && authenticate && retryAfterRefresh) {
    const access = await refreshAccessToken()
    if (access) return request<T>(path, init, { ...options, retryAfterRefresh: false })
  }

  const payload = await readPayload(response)
  if (!response.ok) {
    if (response.status === 401 && authenticate) clearApiSession()
    const fallback = response.status === 401
      ? 'Your session has expired. Please sign in again.'
      : 'We could not complete that request. Please try again.'
    throw new ApiError(firstErrorMessage(payload) ?? fallback, response.status, payload)
  }
  return payload as T
}

const rowsFrom = <T,>(payload: ApiList<T>): T[] => Array.isArray(payload) ? payload : payload.results

export const apiEnabled = Boolean(apiUrl)

export const eventApi = {
  async list(params = new URLSearchParams()) {
    if (!apiEnabled) return demoEvents
    const response = await request<ApiList<ApiEvent>>(`/api/events/list/?${params.toString()}`, undefined, { authenticate: false })
    return rowsFrom(response).map(normaliseEvent)
  },
  async byId(id: number) {
    if (!apiEnabled) return demoEvents.find((event) => event.id === id)
    // The public event detail route is keyed by slug. Preserve this helper for callers
    // that still hold an ID without assuming a numeric detail URL exists.
    const rows = await this.list()
    return rows.find((event) => event.id === id)
  },
  async bySlug(slug: string) {
    if (!apiEnabled) return demoEvents.find((event) => event.slug === slug)
    try {
      return normaliseEvent(await request<ApiEvent>(`/api/events/list/${encodeURIComponent(slug)}/`, undefined, { authenticate: false }))
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return undefined
      throw error
    }
  },
}

export const reviewApi = {
  async listForEvent(eventId: number) {
    if (!apiEnabled) return []
    const response = await request<ApiList<EventReview>>(
      `/api/events/reviews/?event=${encodeURIComponent(String(eventId))}`,
      undefined,
      { authenticate: false },
    )
    return rowsFrom(response)
  },
}

export const authApi = {
  async login(email: string, password: string, profile?: Partial<SessionUser>) {
    const response = await request<{ access: string; refresh: string }>('/api/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }, { authenticate: false })
    storageSet(ACCESS_TOKEN_KEY, response.access)
    storageSet(REFRESH_TOKEN_KEY, response.refresh)
    const existing = readUser(PROFILE_KEY)
    writeUser(PROFILE_KEY, {
      ...(existing ?? {}),
      email,
      name: profile?.name?.trim() || existing?.name || email.split('@')[0],
    })
    notifyAuthChange()
    return response
  },
  async register(email: string, password: string) {
    return request('/api/auth/register/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }, { authenticate: false })
  },
  completeDemoLogin(user: SessionUser) {
    writeUser(DEMO_USER_KEY, user)
    notifyAuthChange()
  },
  updateLocalProfile(profile: Partial<SessionUser>) {
    const user = getStoredUser()
    if (!user) return
    writeUser(apiEnabled ? PROFILE_KEY : DEMO_USER_KEY, {
      ...user,
      ...profile,
      email: user.email,
      name: profile.name?.trim() || user.name,
    })
    notifyAuthChange()
  },
  logout() {
    storageRemove(DEMO_USER_KEY)
    clearApiSession()
  },
}

export type PaymentRedirect = {
  paymentUrl: string
}

export type OrderLineInput = {
  ticketClassId: number
  quantity: number
}

export const orderApi = {
  async list() {
    const response = await request<ApiList<Order>>('/api/orders/')
    return rowsFrom(response)
  },
  async create(items: readonly OrderLineInput[], couponCode?: string) {
    const lineItems = items.map((item) => ({
      ticket_class_id: item.ticketClassId,
      quantity: item.quantity,
    }))
    if (!lineItems.length) throw new ApiError('Add at least one ticket before creating a reservation.')
    return request<Order>('/api/orders/', {
      method: 'POST',
      body: JSON.stringify({ items: lineItems, coupon_code: couponCode }),
    })
  },
  async requestPayment(orderId: number): Promise<PaymentRedirect> {
    const response = await request<{ payment_url?: unknown; paymentUrl?: unknown; redirect_url?: unknown; url?: unknown }>('/api/payments/request/', {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId }),
    })

    // Accept the conventional payment_url response used by Django and common redirect aliases.
    // Only http(s) destinations are allowed before navigating away from the storefront.
    const rawUrl = response.payment_url ?? response.paymentUrl ?? response.redirect_url ?? response.url
    if (typeof rawUrl !== 'string' || !rawUrl.trim()) throw new ApiError('The payment service did not return a valid redirect URL.')
    let parsed: URL
    try {
      parsed = new URL(rawUrl, apiUrl)
    } catch {
      throw new ApiError('The payment service returned an invalid redirect URL.')
    }
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new ApiError('The payment service returned an unsafe redirect URL.')
    return { paymentUrl: parsed.href }
  },
}
