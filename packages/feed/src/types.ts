// Social Feed Types for NFTicket

export type PostType = 'user' | 'purchase' | 'community' | 'activity' | 'event_recommendation' | 'sponsored'

export type PostVisibility = 'public' | 'followers' | 'private'

export type MediaType = 'image' | 'video'

export interface PostMedia {
  id: string
  post_id: string
  url: string
  type: MediaType
  metadata?: {
    width?: number
    height?: number
    duration?: number
    alt?: string
  }
}

export interface PostBase {
  id: string
  author_id: string
  type: PostType
  text?: string
  visibility: PostVisibility
  created_at: string
  updated_at?: string
  
  // Engagement metrics
  likes_count: number
  comments_count: number
  saves_count: number
  shares_count: number
  reports_count: number
  
  // User interaction state
  is_liked?: boolean
  is_saved?: boolean
  is_following_author?: boolean
}

export interface UserPost extends PostBase {
  type: 'user'
  hashtags?: string[]
  mentions?: string[]
  location?: {
    name: string
    coordinates?: [number, number]
  }
  media?: PostMedia[]
}

export interface PurchasePost extends PostBase {
  type: 'purchase'
  order_id: string
  event_id: string
  tickets_count: number
  total_amount: number
  event?: {
    id: string
    title: string
    image_url?: string
    start_date: string
    venue_name: string
  }
}

export interface CommunityPost extends PostBase {
  type: 'community'
  community_id: string
  community?: {
    id: string
    name: string
    slug: string
    avatar_url?: string
  }
}

export interface ActivityPost extends PostBase {
  type: 'activity'
  activity_type: 'follow' | 'save_event' | 'join_community'
  target_id: string
  target_type: 'user' | 'event' | 'community'
  target_data?: Record<string, any>
}

export interface EventRecommendationPost extends PostBase {
  type: 'event_recommendation'
  event_id: string
  recommendation_reason: 'trending' | 'category_match' | 'location_based' | 'friend_activity'
  event?: {
    id: string
    title: string
    description?: string
    image_url?: string
    start_date: string
    venue_name: string
    category?: string
    ticket_types?: Array<{
      id: string
      name: string
      price: number
    }>
  }
}

export interface SponsoredPost extends PostBase {
  type: 'sponsored'
  sponsor_id: string
  campaign_id: string
  target_audience?: string[]
  budget_info?: {
    bid_amount: number
    daily_budget: number
  }
}

export type FeedPost = UserPost | PurchasePost | CommunityPost | ActivityPost | EventRecommendationPost | SponsoredPost

// Author information for posts
export interface PostAuthor {
  id: string
  username: string
  name: string // Display name for UI
  full_name: string
  avatar_url?: string
  is_verified?: boolean
  is_organizer?: boolean
}

// Complete post with author info
export interface FeedPostWithAuthor {
  id: string
  author_id: string
  type: PostType
  text?: string
  visibility: PostVisibility
  created_at: string
  updated_at?: string
  
  // Engagement metrics
  likes_count: number
  comments_count: number
  saves_count: number
  shares_count: number
  reports_count: number
  
  // User interaction state
  is_liked?: boolean
  is_saved?: boolean
  is_following_author?: boolean
  
  // Author information
  author: PostAuthor
  
  // Type-specific data (using discriminated union pattern)
  hashtags?: string[]
  mentions?: string[]
  location?: string | {
    name: string
    coordinates?: [number, number]
  }
  media?: PostMedia[]
  
  // Purchase post specific
  order_id?: string
  event_id?: string
  tickets_count?: number
  total_amount?: number
  
  // Event data (for purchase and event recommendation posts)
  event_name?: string
  ticket_type?: string
  ticket_price?: number
  event_date?: string
  event_location?: string
  event_capacity?: number
  event?: {
    id: string
    title: string
    image_url?: string
    start_date: string
    venue_name: string
    category?: string
    ticket_types?: Array<{
      id: string
      name: string
      price: number
    }>
  }
  
  // Community post specific
  community_id?: string
  community?: {
    id: string
    name: string
    slug: string
    avatar_url?: string
  }
  
  // Activity post specific
  activity_type?: 'follow' | 'save_event' | 'join_community'
  target_id?: string
  target_type?: 'user' | 'event' | 'community'
  target_data?: Record<string, any>
  
  // Event recommendation specific
  recommendation_reason?: 'trending' | 'category_match' | 'location_based' | 'friend_activity'
  
  // Sponsored post specific
  sponsor_id?: string
  campaign_id?: string
  target_audience?: string[]
  budget_info?: {
    bid_amount: number
    daily_budget: number
  }
  
  // Personalization metadata
  personalization_score?: number
}

// Comments
export interface PostComment {
  id: string
  post_id: string
  author_id: string
  text: string
  parent_id?: string
  created_at: string
  updated_at?: string
  likes_count: number
  is_liked?: boolean
  author?: PostAuthor
  replies?: PostComment[]
}

// Feed request/response types
export interface FeedRequest {
  cursor?: string
  limit?: number
  type?: 'home' | 'popular' | 'following'
}

export interface FeedResponse {
  posts: FeedPostWithAuthor[]
  next_cursor?: string
  has_more: boolean
  total_count?: number
}

// User signals for ranking
export interface UserSignals {
  // Engagement preferences
  likes_on_purchases: number
  likes_on_social: number
  comments_ratio: number
  saves_ratio: number
  
  // Time-based behavior
  dwell_time_avg: number
  peak_activity_hours: number[]
  
  // Content preferences
  categories_fav: string[]
  hashtags_fav: string[]
  
  // Social behavior
  following_count: number
  followers_count: number
  community_memberships: string[]
  
  // Location preferences
  location_preference?: {
    latitude: number
    longitude: number
    radius: number
  }
  
  // Purchase behavior
  avg_ticket_price: number
  events_attended: number
  preferred_venues: string[]
}

// Ranking weights for different post types
export interface RankingWeights {
  purchase_weight: number
  social_weight: number
  community_weight: number
  activity_weight: number
  event_recommendation_weight: number
  sponsored_weight: number
  
  // Engagement multipliers
  like_multiplier: number
  comment_multiplier: number
  save_multiplier: number
  share_multiplier: number
  
  // Freshness decay
  freshness_decay_factor: number
  
  // Personalization
  following_boost: number
  category_match_boost: number
  location_boost: number
}

// Feed mixing strategy
export interface FeedMixingStrategy {
  social_ratio: number
  purchase_ratio: number
  event_recommendation_ratio: number
  sponsored_ratio: number
  max_consecutive_same_type: number
  inject_trending_interval: number
}

// Create post requests
export interface CreateUserPostRequest {
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

export interface CreatePurchasePostRequest {
  order_id: string
  event_id: string
  tickets_count: number
  total_amount: number
  text?: string
  visibility: PostVisibility
}

// Interaction types
export interface PostInteraction {
  post_id: string
  user_id: string
  type: 'like' | 'save' | 'share' | 'report'
  created_at: string
  metadata?: Record<string, any>
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

// Follow relationships
export interface Follow {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}

export interface FollowStats {
  followers_count: number
  following_count: number
  is_following?: boolean
  is_followed_by?: boolean
}