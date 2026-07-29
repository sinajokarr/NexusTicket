import { events as demoEvents } from '../data/events'
import type { EventItem, Order, TicketClass } from '../types'

const rawApiUrl = import.meta.env.VITE_API_URL?.trim()
const apiUrl = rawApiUrl ? rawApiUrl.replace(/\/$/, '') : ''

type ApiEvent = Omit<Partial<EventItem>, 'ticket_classes'> & {
  ticket_classes?: Array<Partial<TicketClass> & { price?: number | string }>
}

const imageFor = (id?: number) => demoEvents.find((event) => event.id === id)?.cover_image ?? demoEvents[0].cover_image

const resolveImage = (image: string | null | undefined, id?: number) => {
  if (!image) return imageFor(id)
  if (image.startsWith('http')) return image
  return `${apiUrl}${image}`
}

const normaliseEvent = (event: ApiEvent): EventItem => ({
  id: event.id ?? 0,
  title: event.title ?? 'Untitled event',
  slug: event.slug ?? `event-${event.id ?? 'unknown'}`,
  description: event.description ?? '',
  cover_image: resolveImage(event.cover_image, event.id),
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

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  if (!apiUrl) throw new Error('API URL is not configured.')

  const token = localStorage.getItem('nexus-access-token')
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    throw new Error(payload?.detail ?? 'We could not reach the server. Please try again.')
  }
  return response.json() as Promise<T>
}

export const apiEnabled = Boolean(apiUrl)

export const eventApi = {
  async list(params = new URLSearchParams()) {
    if (!apiUrl) return demoEvents
    const response = await request<ApiEvent[] | { results: ApiEvent[] }>(`/api/events/list/?${params.toString()}`)
    const rows = Array.isArray(response) ? response : response.results
    return rows.map(normaliseEvent)
  },
  async byId(id: number) {
    if (!apiUrl) return demoEvents.find((event) => event.id === id)
    return normaliseEvent(await request<ApiEvent>(`/api/events/list/${id}/`))
  },
}

export const authApi = {
  async login(email: string, password: string) {
    const response = await request<{ access: string; refresh: string }>('/api/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    localStorage.setItem('nexus-access-token', response.access)
    localStorage.setItem('nexus-refresh-token', response.refresh)
    return response
  },
  async register(email: string, password: string) {
    return request('/api/auth/register/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },
}

export const orderApi = {
  async create(ticketClassId: number, quantity: number, couponCode?: string) {
    return request<Order>('/api/orders/', {
      method: 'POST',
      body: JSON.stringify({ ticket_class_id: ticketClassId, quantity, coupon_code: couponCode }),
    })
  },
  async requestPayment(orderId: number) {
    return request<{ payment_url: string }>('/api/payments/request/', {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId }),
    })
  },
}
