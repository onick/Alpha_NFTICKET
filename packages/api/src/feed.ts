import { TypedSupabaseClient } from '@nfticket/database'
import { 
  FeedPostWithAuthor,
  FeedStrategyFactory,
  FeedPagination,
  UserSignals
} from '@nfticket/feed'
import type {
  Post,
  PostType,
  PostVisibility,
  CreateUserPostInput,
  CreatePurchasePostInput,
  CreateCommentInput,
  PostComment,
  UserSignalsData
} from '@nfticket/database'

export interface FeedResponse {
  posts: FeedPostWithAuthor[]
  next_cursor?: string
  has_more: boolean
  total_count?: number
}

export class SocialFeedService {
  constructor(private supabase: TypedSupabaseClient) {}

  // =============================
  // FEED RETRIEVAL
  // =============================

  async getHomeFeed(
    userId: string,
    cursor?: string,
    limit: number = 20
  ): Promise<FeedResponse> {
    try {
      // Get user signals for personalization
      const userSignals = await this.getUserSignals(userId)
      
      // Fetch posts with pagination
      const posts = await this.fetchPosts({
        userId,
        cursor,
        limit: limit * 2, // Fetch more to allow for filtering
        includeFollowing: true
      })

      // Apply feed strategy
      const strategyFactory = new FeedStrategyFactory()
      const homeStrategy = strategyFactory.getStrategy('home')
      
      const rankedPosts = homeStrategy.generateFeed(
        posts,
        userSignals,
        userId,
        limit
      )

      // Generate pagination cursor
      const nextCursor = rankedPosts.length >= limit ? 
        FeedPagination.generateNextCursor(rankedPosts) : undefined

      return {
        posts: rankedPosts,
        next_cursor: nextCursor,
        has_more: rankedPosts.length >= limit
      }
    } catch (error) {
      console.error('Error fetching home feed:', error)
      throw new Error('Failed to fetch home feed')
    }
  }

  async getPopularFeed(
    userId?: string,
    cursor?: string,
    limit: number = 20
  ): Promise<FeedResponse> {
    try {
      // Fetch recent posts for popular feed
      const posts = await this.fetchPosts({
        userId,
        cursor,
        limit: limit * 3, // Fetch more for better ranking
        timeWindow: 72 // Last 72 hours
      })

      // Get user signals if authenticated
      const userSignals = userId ? await this.getUserSignals(userId) : this.getDefaultUserSignals()

      // Apply popular strategy
      const strategyFactory = new FeedStrategyFactory()
      const popularStrategy = strategyFactory.getStrategy('popular')
      
      const rankedPosts = popularStrategy.generateFeed(
        posts,
        userSignals,
        userId,
        limit
      )

      const nextCursor = rankedPosts.length >= limit ? 
        FeedPagination.generateNextCursor(rankedPosts) : undefined

      return {
        posts: rankedPosts,
        next_cursor: nextCursor,
        has_more: rankedPosts.length >= limit
      }
    } catch (error) {
      console.error('Error fetching popular feed:', error)
      throw new Error('Failed to fetch popular feed')
    }
  }

  async getFollowingFeed(
    userId: string,
    cursor?: string,
    limit: number = 20
  ): Promise<FeedResponse> {
    try {
      // Fetch posts only from following
      const posts = await this.fetchPosts({
        userId,
        cursor,
        limit,
        followingOnly: true
      })

      // Get user signals
      const userSignals = await this.getUserSignals(userId)

      // Apply following strategy (chronological)
      const strategyFactory = new FeedStrategyFactory()
      const followingStrategy = strategyFactory.getStrategy('following')
      
      const rankedPosts = followingStrategy.generateFeed(
        posts,
        userSignals,
        userId,
        limit
      )

      const nextCursor = rankedPosts.length >= limit ? 
        FeedPagination.generateNextCursor(rankedPosts) : undefined

      return {
        posts: rankedPosts,
        next_cursor: nextCursor,
        has_more: rankedPosts.length >= limit
      }
    } catch (error) {
      console.error('Error fetching following feed:', error)
      throw new Error('Failed to fetch following feed')
    }
  }

  // =============================
  // POST CREATION
  // =============================

  async createUserPost(
    userId: string,
    input: CreateUserPostInput
  ): Promise<FeedPostWithAuthor> {
    try {
      // Create main post record
      const { data: post, error: postError } = await this.supabase
        .from('posts')
        .insert({
          author_id: userId,
          type: 'user' as PostType,
          text: input.text,
          visibility: input.visibility
        })
        .select()
        .single()

      if (postError) throw postError

      // Create user post details
      if (input.hashtags || input.mentions || input.location) {
        const { error: userPostError } = await this.supabase
          .from('user_posts')
          .insert({
            post_id: post.id,
            hashtags: input.hashtags || [],
            mentions: input.mentions || [],
            location: input.location
          })

        if (userPostError) throw userPostError
      }

      // Handle media uploads if provided
      if (input.media_urls && input.media_urls.length > 0) {
        const mediaInserts = input.media_urls.map(url => ({
          post_id: post.id,
          url,
          type: url.includes('video') ? 'video' as const : 'image' as const
        }))

        const { error: mediaError } = await this.supabase
          .from('post_media')
          .insert(mediaInserts)

        if (mediaError) throw mediaError
      }

      // Fetch the complete post with author info
      return await this.getPostWithAuthor(post.id, userId)
    } catch (error) {
      console.error('Error creating user post:', error)
      throw new Error('Failed to create post')
    }
  }

  async createPurchasePost(
    userId: string,
    input: CreatePurchasePostInput
  ): Promise<FeedPostWithAuthor> {
    try {
      // Create main post record
      const { data: post, error: postError } = await this.supabase
        .from('posts')
        .insert({
          author_id: userId,
          type: 'purchase' as PostType,
          text: input.text || null,
          visibility: input.visibility || 'public'
        })
        .select()
        .single()

      if (postError) throw postError

      // Create purchase post details
      const { error: purchaseError } = await this.supabase
        .from('purchase_posts')
        .insert({
          post_id: post.id,
          order_id: input.order_id,
          event_id: input.event_id,
          tickets_count: input.tickets_count,
          total_amount: input.total_amount
        })

      if (purchaseError) throw purchaseError

      // Update user signals for purchase behavior
      await this.updateUserSignalsForPurchase(userId, input)

      return await this.getPostWithAuthor(post.id, userId)
    } catch (error) {
      console.error('Error creating purchase post:', error)
      throw new Error('Failed to create purchase post')
    }
  }

  // =============================
  // POST INTERACTIONS
  // =============================

  async likePost(userId: string, postId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('post_likes')
        .insert({
          post_id: postId,
          user_id: userId
        })

      if (error) {
        // Check if already liked
        if (error.code === '23505') { // Unique constraint violation
          return false
        }
        throw error
      }

      // Update user signals
      await this.updateUserSignalsForEngagement(userId, 'like', postId)
      
      return true
    } catch (error) {
      console.error('Error liking post:', error)
      throw new Error('Failed to like post')
    }
  }

  async unlikePost(userId: string, postId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('post_likes')
        .delete()
        .match({ post_id: postId, user_id: userId })

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error unliking post:', error)
      throw new Error('Failed to unlike post')
    }
  }

  async savePost(userId: string, postId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('post_saves')
        .insert({
          post_id: postId,
          user_id: userId
        })

      if (error) {
        if (error.code === '23505') {
          return false
        }
        throw error
      }

      await this.updateUserSignalsForEngagement(userId, 'save', postId)
      return true
    } catch (error) {
      console.error('Error saving post:', error)
      throw new Error('Failed to save post')
    }
  }

  async unsavePost(userId: string, postId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('post_saves')
        .delete()
        .match({ post_id: postId, user_id: userId })

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error unsaving post:', error)
      throw new Error('Failed to unsave post')
    }
  }

  async createComment(
    userId: string,
    input: CreateCommentInput
  ): Promise<PostComment> {
    try {
      const { data: comment, error } = await this.supabase
        .from('post_comments')
        .insert({
          post_id: input.post_id,
          author_id: userId,
          text: input.text,
          parent_id: input.parent_id || null
        })
        .select(`
          *,
          author:profiles!author_id(
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .single()

      if (error) throw error

      await this.updateUserSignalsForEngagement(userId, 'comment', input.post_id)
      
      return comment
    } catch (error) {
      console.error('Error creating comment:', error)
      throw new Error('Failed to create comment')
    }
  }

  // =============================
  // FOLLOW SYSTEM
  // =============================

  async followUser(userId: string, targetUserId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('follows')
        .insert({
          follower_id: userId,
          following_id: targetUserId
        })

      if (error) {
        if (error.code === '23505') {
          return false
        }
        throw error
      }

      return true
    } catch (error) {
      console.error('Error following user:', error)
      throw new Error('Failed to follow user')
    }
  }

  async unfollowUser(userId: string, targetUserId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('follows')
        .delete()
        .match({ follower_id: userId, following_id: targetUserId })

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error unfollowing user:', error)
      throw new Error('Failed to unfollow user')
    }
  }

  // =============================
  // PRIVATE HELPER METHODS
  // =============================

  private async fetchPosts(options: {
    userId?: string
    cursor?: string
    limit: number
    includeFollowing?: boolean
    followingOnly?: boolean
    timeWindow?: number
  }): Promise<FeedPostWithAuthor[]> {
    let query = this.supabase
      .from('posts')
      .select(`
        *,
        author:profiles!author_id(
          id,
          username,
          full_name,
          avatar_url
        ),
        user_posts(hashtags, mentions, location),
        purchase_posts(
          order_id,
          event_id,
          tickets_count,
          total_amount,
          event:events!event_id(
            id,
            title,
            image_url,
            start_date,
            venue_name,
            category
          )
        ),
        community_posts(
          community_id,
          community:communities!community_id(
            id,
            name,
            slug,
            avatar_url
          )
        ),
        post_media(url, type, metadata)
      `)

    // Apply time window for popular feed
    if (options.timeWindow) {
      const cutoffDate = new Date(Date.now() - (options.timeWindow * 60 * 60 * 1000))
      query = query.gte('created_at', cutoffDate.toISOString())
    }

    // Apply following filter
    if (options.followingOnly && options.userId) {
      // Get following list first
      const { data: following } = await this.supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', options.userId)
      
      const followingIds = following?.map(f => f.following_id) || []
      if (followingIds.length > 0) {
        query = query.in('author_id', followingIds)
      } else {
        // If not following anyone, return empty result
        return []
      }
    }

    // Apply cursor pagination
    if (options.cursor) {
      const cursorData = FeedPagination.decodeCursor(options.cursor)
      if (cursorData) {
        query = query
          .lt('created_at', cursorData.timestamp)
          .order('created_at', { ascending: false })
          .order('id', { ascending: false })
      }
    } else {
      query = query
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
    }

    query = query.limit(options.limit)

    const { data: posts, error } = await query

    if (error) throw error

    // Transform to FeedPostWithAuthor format
    return this.transformPosts(posts || [], options.userId)
  }

  private transformPosts(
    rawPosts: any[],
    viewerId?: string
  ): FeedPostWithAuthor[] {
    return rawPosts.map(post => ({
      id: post.id,
      author_id: post.author_id,
      type: post.type,
      text: post.text,
      visibility: post.visibility,
      created_at: post.created_at,
      updated_at: post.updated_at,
      likes_count: post.likes_count,
      comments_count: post.comments_count,
      saves_count: post.saves_count,
      shares_count: post.shares_count,
      reports_count: post.reports_count,
      author: post.author,
      
      // Add type-specific data
      ...(post.user_posts?.[0] && {
        hashtags: post.user_posts[0].hashtags,
        mentions: post.user_posts[0].mentions,
        location: post.user_posts[0].location,
        media: post.post_media
      }),
      
      ...(post.purchase_posts?.[0] && {
        order_id: post.purchase_posts[0].order_id,
        event_id: post.purchase_posts[0].event_id,
        tickets_count: post.purchase_posts[0].tickets_count,
        total_amount: post.purchase_posts[0].total_amount,
        event: post.purchase_posts[0].event
      }),
      
      ...(post.community_posts?.[0] && {
        community_id: post.community_posts[0].community_id,
        community: post.community_posts[0].community
      }),

      // Add interaction state for authenticated users
      is_following_author: viewerId ? 
        this.checkIfFollowing(viewerId, post.author_id) : false
    }))
  }

  private async getPostWithAuthor(
    postId: string, 
    viewerId?: string
  ): Promise<FeedPostWithAuthor> {
    const posts = await this.fetchPosts({
      userId: viewerId,
      limit: 1
    })
    
    const post = posts.find(p => p.id === postId)
    if (!post) {
      throw new Error('Post not found')
    }
    
    return post
  }

  private async getUserSignals(userId: string): Promise<UserSignals> {
    const { data, error } = await this.supabase
      .from('user_signals')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error || !data) {
      return this.getDefaultUserSignals()
    }

    return {
      likes_on_purchases: data.likes_on_purchases,
      likes_on_social: data.likes_on_social,
      comments_ratio: data.comments_ratio,
      saves_ratio: data.saves_ratio,
      dwell_time_avg: data.dwell_time_avg,
      peak_activity_hours: data.peak_activity_hours,
      categories_fav: data.categories_fav,
      hashtags_fav: data.hashtags_fav,
      following_count: data.following_count,
      followers_count: data.followers_count,
      community_memberships: data.community_memberships,
      location_preference: data.location_preference,
      avg_ticket_price: data.avg_ticket_price,
      events_attended: data.events_attended,
      preferred_venues: data.preferred_venues
    }
  }

  private getDefaultUserSignals(): UserSignals {
    return {
      likes_on_purchases: 0,
      likes_on_social: 0,
      comments_ratio: 0,
      saves_ratio: 0,
      dwell_time_avg: 0,
      peak_activity_hours: [9, 12, 18, 20],
      categories_fav: [],
      hashtags_fav: [],
      following_count: 0,
      followers_count: 0,
      community_memberships: [],
      avg_ticket_price: 0,
      events_attended: 0,
      preferred_venues: []
    }
  }

  private async updateUserSignalsForPurchase(
    userId: string,
    purchase: CreatePurchasePostInput
  ): Promise<void> {
    try {
      // Get current signals to calculate new averages
      const { data: signals } = await this.supabase
        .from('user_signals')
        .select('likes_on_purchases, events_attended, avg_ticket_price')
        .eq('user_id', userId)
        .single()

      if (signals) {
        const newEventsCount = signals.events_attended + 1
        const newAvgPrice = Math.round(
          (signals.avg_ticket_price * signals.events_attended + purchase.total_amount) / newEventsCount
        )

        await this.supabase
          .from('user_signals')
          .update({
            likes_on_purchases: signals.likes_on_purchases + 1,
            avg_ticket_price: newAvgPrice,
            events_attended: newEventsCount,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
      }
    } catch (error) {
      console.error('Error updating user signals for purchase:', error)
    }
  }

  private async updateUserSignalsForEngagement(
    userId: string,
    type: 'like' | 'save' | 'comment',
    postId: string
  ): Promise<void> {
    try {
      // Get post type to determine which signal to update
      const { data: post } = await this.supabase
        .from('posts')
        .select('type')
        .eq('id', postId)
        .single()

      if (!post) return

      let updateField = ''
      if (type === 'like') {
        updateField = post.type === 'purchase' ? 'likes_on_purchases' : 'likes_on_social'
      }

      if (updateField) {
        // Get current value to increment
        const { data: signals } = await this.supabase
          .from('user_signals')
          .select(updateField)
          .eq('user_id', userId)
          .single()

        if (signals) {
          await this.supabase
            .from('user_signals')
            .update({
              [updateField]: (signals as any)[updateField] + 1,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId)
        }
      }
    } catch (error) {
      console.error('Error updating user signals for engagement:', error)
    }
  }

  private async checkIfFollowing(
    userId: string, 
    targetUserId: string
  ): Promise<boolean> {
    const { data } = await this.supabase
      .from('follows')
      .select('id')
      .eq('follower_id', userId)
      .eq('following_id', targetUserId)
      .single()

    return !!data
  }
}

// Factory functions
export function createBrowserFeedService(): SocialFeedService {
  const { createBrowserClient } = require('@nfticket/database')
  return new SocialFeedService(createBrowserClient())
}

export function createServerFeedService(cookies?: any): SocialFeedService {
  const { createServerClient } = require('@nfticket/database')
  return new SocialFeedService(createServerClient(cookies))
}

export function createServiceFeedService(): SocialFeedService {
  const { createServiceClient } = require('@nfticket/database')
  return new SocialFeedService(createServiceClient())
}