// NFTicket Database Types
export interface Profile {
  id: string
  username?: string
  full_name?: string
  avatar_url?: string
  created_at: string
}

export interface Event {
  id: string
  organizer_id: string
  title: string
  description?: string
  image_url?: string
  category?: string
  start_date: string
  end_date: string
  venue_name: string
  venue_address?: string
  created_at: string
  // Relaciones
  organizer?: Profile
  ticket_types?: TicketType[]
}

export interface TicketType {
  id: string
  event_id: string
  name: string
  price: number
  quantity_available: number
  created_at: string
  // Relaciones
  event?: Event
}

export interface Order {
  id: string
  buyer_id: string
  event_id: string
  status: 'pending' | 'paid' | 'failed' | 'refunded'
  total_amount: number
  payment_provider?: string
  provider_session_id?: string
  created_at: string
  // Relaciones
  buyer?: Profile
  event?: Event
  tickets?: Ticket[]
}

export interface Ticket {
  id: string
  ticket_type_id: string
  event_id: string
  order_id: string
  owner_id: string
  unique_qr_code: string
  is_used: boolean
  purchased_at: string
  // Relaciones
  ticket_type?: TicketType
  event?: Event
  order?: Order
  owner?: Profile
}

// Input types para creación
export interface CreateEventInput {
  title: string
  description?: string
  image_url?: string
  category?: string
  start_date: string
  end_date: string
  venue_name: string
  venue_address?: string
}

export interface CreateTicketTypeInput {
  event_id: string
  name: string
  price: number
  quantity_available: number
}

export interface CreateOrderInput {
  buyer_id: string
  event_id: string
  total_amount: number
  items?: {
    ticket_type_id: string
    quantity: number
  }[]
}

export interface CreateTicketInput {
  ticket_type_id: string
  event_id: string
  order_id: string
  owner_id: string
  unique_qr_code: string
}

// Utility types
export interface EventFilters {
  limit?: number
  category?: string
  near?: {
    lat: number
    lng: number
    radius?: number
  }
}

export interface UpcomingEventsResponse {
  data: Event[]
  total: number
  hasMore: boolean
}

// Extended types with full relations
export interface OrderWithDetails extends Order {
  buyer: Profile
  event: Event & {
    organizer: Profile
  }
  tickets?: TicketWithDetails[]
}

export interface TicketWithDetails extends Ticket {
  ticket_type: TicketType
  event: Event & {
    organizer: Profile
  }
  owner: Profile
  order?: Order
}

// =============================
// SOCIAL FEED TYPES
// =============================

export type PostType = 'user' | 'purchase' | 'community' | 'activity' | 'event_recommendation' | 'sponsored'
export type PostVisibility = 'public' | 'followers' | 'private'

export interface Post {
  id: string
  author_id: string
  type: PostType
  text?: string
  visibility: PostVisibility
  likes_count: number
  comments_count: number
  saves_count: number
  shares_count: number
  reports_count: number
  created_at: string
  updated_at?: string
}

export interface PostMedia {
  id: string
  post_id: string
  url: string
  type: 'image' | 'video'
  metadata?: Record<string, any>
  created_at: string
}

export interface UserPost {
  post_id: string
  hashtags?: string[]
  mentions?: string[]
  location?: {
    name: string
    coordinates?: [number, number]
  }
}

export interface PurchasePost {
  post_id: string
  order_id: string
  event_id: string
  tickets_count: number
  total_amount: number
}

export interface Community {
  id: string
  name: string
  slug: string
  description?: string
  avatar_url?: string
  is_private: boolean
  created_by: string
  created_at: string
}

export interface CommunityMember {
  id: string
  community_id: string
  user_id: string
  role: 'member' | 'moderator' | 'admin'
  joined_at: string
}

export interface CommunityPost {
  post_id: string
  community_id: string
}

export interface ActivityPost {
  post_id: string
  activity_type: 'follow' | 'save_event' | 'join_community'
  target_id: string
  target_type: 'user' | 'event' | 'community'
  target_data?: Record<string, any>
}

export interface EventRecommendationPost {
  post_id: string
  event_id: string
  recommendation_reason: 'trending' | 'category_match' | 'location_based' | 'friend_activity'
}

export interface SponsoredPost {
  post_id: string
  sponsor_id: string
  campaign_id: string
  target_audience?: string[]
  budget_info?: Record<string, any>
}

export interface PostLike {
  id: string
  post_id: string
  user_id: string
  created_at: string
}

export interface PostSave {
  id: string
  post_id: string
  user_id: string
  created_at: string
}

export interface PostComment {
  id: string
  post_id: string
  author_id: string
  text: string
  parent_id?: string
  likes_count: number
  created_at: string
  updated_at?: string
}

export interface CommentLike {
  id: string
  comment_id: string
  user_id: string
  created_at: string
}

export interface PostReport {
  id: string
  post_id: string
  reporter_id: string
  reason: 'spam' | 'harassment' | 'inappropriate' | 'misleading' | 'other'
  description?: string
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
  created_at: string
  reviewed_at?: string
  reviewed_by?: string
}

export interface Follow {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}

export interface UserSignalsData {
  id: string
  user_id: string
  likes_on_purchases: number
  likes_on_social: number
  comments_ratio: number
  saves_ratio: number
  dwell_time_avg: number
  peak_activity_hours: number[]
  categories_fav: string[]
  hashtags_fav: string[]
  following_count: number
  followers_count: number
  community_memberships: string[]
  location_preference?: {
    latitude: number
    longitude: number
    radius: number
  }
  avg_ticket_price: number
  events_attended: number
  preferred_venues: string[]
  updated_at: string
}

// Input types for creating posts
export interface CreateUserPostInput {
  text: string
  visibility: PostVisibility
  hashtags?: string[]
  mentions?: string[]
  location?: {
    name: string
    coordinates?: [number, number]
  }
  media_urls?: string[]
}

export interface CreatePurchasePostInput {
  order_id: string
  event_id: string
  tickets_count: number
  total_amount: number
  text?: string
  visibility?: PostVisibility
}

export interface CreateCommentInput {
  post_id: string
  text: string
  parent_id?: string
}

export interface CreateCommunityInput {
  name: string
  slug: string
  description?: string
  avatar_url?: string
  is_private?: boolean
}