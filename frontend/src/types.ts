export type EventCategory = {
  id: number
  name: string
  slug: string
  icon?: string | null
}

export type Artist = {
  id: number
  name: string
  slug: string
  image?: string | null
  bio?: string
}

export type TicketClass = {
  id: number
  title: string
  price: number
  capacity: number
  sold: number
  is_sold_out: boolean
  remaining_capacity: number
  event?: number
}

export type EventItem = {
  id: number
  title: string
  slug: string
  description: string
  cover_image: string
  date: string
  location: string
  address: string
  categories: EventCategory[]
  artists: Artist[]
  ticket_classes: TicketClass[]
  organizer?: string
  is_active?: boolean
  created_at?: string
  featured?: boolean
  rating?: number
  reviewCount?: number
}

export type CartItem = {
  ticket: TicketClass
  event: EventItem
  quantity: number
}

export type Order = {
  id: number
  user_email: string
  items: Array<{
    id: number
    ticket_title: string
    quantity: number
    price: string
  }>
  status: 'pending' | 'paid' | 'canceled'
  total_price: string
  final_amount: string
  discount_amount: string
  created_at: string
}
