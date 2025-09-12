import { FeedPostWithAuthor, UserSignals, FeedMixingStrategy } from './types'
import { FeedRanker } from './ranker'

export interface FeedStrategy {
  name: string
  description: string
  generateFeed(
    posts: FeedPostWithAuthor[],
    userSignals: UserSignals,
    viewerId?: string,
    limit?: number
  ): FeedPostWithAuthor[]
}

export class HomeFeedStrategy implements FeedStrategy {
  name = 'home'
  description = 'Personalized home feed with mixed content types'
  
  private ranker = new FeedRanker()
  
  private mixingStrategy: FeedMixingStrategy = {
    social_ratio: 0.35,
    purchase_ratio: 0.3,
    event_recommendation_ratio: 0.25,
    sponsored_ratio: 0.1,
    max_consecutive_same_type: 3,
    inject_trending_interval: 6
  }

  generateFeed(
    posts: FeedPostWithAuthor[],
    userSignals: UserSignals,
    viewerId?: string,
    limit: number = 20
  ): FeedPostWithAuthor[] {
    // Separate posts by type
    const socialPosts = posts.filter(p => 
      p.type === 'user' || p.type === 'community' || p.type === 'activity'
    )
    const purchasePosts = posts.filter(p => p.type === 'purchase')
    const eventPosts = posts.filter(p => p.type === 'event_recommendation')
    const sponsoredPosts = posts.filter(p => p.type === 'sponsored')
    
    // Rank each category separately
    const rankedSocial = this.ranker.rankPosts(socialPosts, userSignals, viewerId)
    const rankedPurchase = this.ranker.rankPosts(purchasePosts, userSignals, viewerId)
    const rankedEvents = this.ranker.rankPosts(eventPosts, userSignals, viewerId)
    const rankedSponsored = this.ranker.rankPosts(sponsoredPosts, userSignals, viewerId)
    
    // Mix the feed according to strategy
    const mixedFeed = this.ranker.mixFeed(
      rankedSocial,
      rankedPurchase,
      rankedEvents,
      rankedSponsored,
      this.mixingStrategy
    )
    
    // Apply final personalization and limit
    return this.applyFinalPersonalization(mixedFeed, userSignals, viewerId)
      .slice(0, limit)
  }

  private applyFinalPersonalization(
    posts: FeedPostWithAuthor[],
    userSignals: UserSignals,
    viewerId?: string
  ): FeedPostWithAuthor[] {
    // Boost posts from users with high interaction history
    // Demote posts the user has already interacted with
    // Apply time-zone personalization
    
    return posts.map(post => {
      // Add personalization metadata that could be used by UI
      return {
        ...post,
        personalization_score: this.calculatePersonalizationScore(post, userSignals)
      }
    })
  }

  private calculatePersonalizationScore(
    post: FeedPostWithAuthor,
    userSignals: UserSignals
  ): number {
    let score = 0
    
    // Following relationship
    if (post.is_following_author) score += 2
    
    // Category preferences
    if (post.type === 'purchase' || post.type === 'event_recommendation') {
      const eventCategory = (post as any).event?.category
      if (eventCategory && userSignals.categories_fav.includes(eventCategory.toLowerCase())) {
        score += 1.5
      }
    }
    
    // Community membership
    if (post.type === 'community') {
      const communityId = (post as any).community_id
      if (communityId && userSignals.community_memberships.includes(communityId)) {
        score += 1.8
      }
    }
    
    return score
  }
}

export class PopularFeedStrategy implements FeedStrategy {
  name = 'popular'
  description = 'Trending posts based on engagement in the last 72 hours'
  
  private ranker = new FeedRanker()

  generateFeed(
    posts: FeedPostWithAuthor[],
    userSignals: UserSignals,
    viewerId?: string,
    limit: number = 20
  ): FeedPostWithAuthor[] {
    // Filter out sponsored posts for popular feed
    const nonSponsoredPosts = posts.filter(p => p.type !== 'sponsored')
    
    // Use popular ranking algorithm
    const rankedPosts = this.ranker.rankPopularPosts(nonSponsoredPosts, 72)
    
    // Apply diversity to prevent too many similar posts
    const diversifiedPosts = this.applyDiversity(rankedPosts)
    
    return diversifiedPosts.slice(0, limit)
  }

  private applyDiversity(posts: FeedPostWithAuthor[]): FeedPostWithAuthor[] {
    const result: FeedPostWithAuthor[] = []
    const recentAuthors = new Set<string>()
    const recentEvents = new Set<string>()
    
    for (const post of posts) {
      // Avoid showing multiple posts from same author in close proximity
      if (recentAuthors.has(post.author_id) && result.length > 0 && 
          result.length % 5 !== 0) {
        continue
      }
      
      // Avoid duplicate events
      if ((post.type === 'purchase' || post.type === 'event_recommendation')) {
        const eventId = (post as any).event_id
        if (eventId && recentEvents.has(eventId)) {
          continue
        }
        if (eventId) recentEvents.add(eventId)
      }
      
      result.push(post)
      recentAuthors.add(post.author_id)
      
      // Clear recent tracking every 10 posts to allow diversity
      if (result.length % 10 === 0) {
        recentAuthors.clear()
        recentEvents.clear()
      }
    }
    
    return result
  }
}

export class FollowingFeedStrategy implements FeedStrategy {
  name = 'following'
  description = 'Chronological posts from users and communities you follow'
  
  private ranker = new FeedRanker()

  generateFeed(
    posts: FeedPostWithAuthor[],
    userSignals: UserSignals,
    viewerId?: string,
    limit: number = 20
  ): FeedPostWithAuthor[] {
    // Filter to only following relationships
    const followingPosts = posts.filter(post => 
      post.is_following_author || 
      (post.type === 'community' && 
       userSignals.community_memberships.includes((post as any).community_id))
    )
    
    // Use chronological ranking
    const rankedPosts = this.ranker.rankFollowingPosts(followingPosts)
    
    // Group by day to improve readability
    const groupedPosts = this.groupByTimeframe(rankedPosts)
    
    return groupedPosts.slice(0, limit)
  }

  private groupByTimeframe(posts: FeedPostWithAuthor[]): FeedPostWithAuthor[] {
    // Add day separators or group similar time posts
    // For now, just return chronological
    return posts.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  }
}

export class EventFeedStrategy implements FeedStrategy {
  name = 'events'
  description = 'Feed focused on event-related content and recommendations'
  
  private ranker = new FeedRanker()

  generateFeed(
    posts: FeedPostWithAuthor[],
    userSignals: UserSignals,
    viewerId?: string,
    limit: number = 20
  ): FeedPostWithAuthor[] {
    // Focus on event-related posts
    const eventRelatedPosts = posts.filter(post => 
      post.type === 'purchase' || 
      post.type === 'event_recommendation' ||
      (post.type === 'user' && this.hasEventContent(post))
    )
    
    // Rank with emphasis on event preferences
    const eventFocusedSignals = {
      ...userSignals,
      // Boost event-related preferences
      likes_on_purchases: userSignals.likes_on_purchases * 1.5,
      categories_fav: userSignals.categories_fav
    }
    
    const rankedPosts = this.ranker.rankPosts(
      eventRelatedPosts, 
      eventFocusedSignals, 
      viewerId
    )
    
    return rankedPosts.slice(0, limit)
  }

  private hasEventContent(post: FeedPostWithAuthor): boolean {
    if (post.type !== 'user') return false
    
    const text = post.text?.toLowerCase() || ''
    const eventKeywords = [
      'evento', 'concierto', 'festival', 'show', 'entrada', 'ticket',
      'venue', 'presentación', 'performance', 'vivo'
    ]
    
    return eventKeywords.some(keyword => text.includes(keyword))
  }
}

// Strategy factory
export class FeedStrategyFactory {
  private strategies = new Map<string, FeedStrategy>([
    ['home', new HomeFeedStrategy()],
    ['popular', new PopularFeedStrategy()],
    ['following', new FollowingFeedStrategy()],
    ['events', new EventFeedStrategy()]
  ])

  getStrategy(type: string): FeedStrategy {
    const strategy = this.strategies.get(type)
    if (!strategy) {
      throw new Error(`Unknown feed strategy: ${type}`)
    }
    return strategy
  }

  listStrategies(): Array<{ name: string; description: string }> {
    return Array.from(this.strategies.values()).map(strategy => ({
      name: strategy.name,
      description: strategy.description
    }))
  }
}

// Cursor-based pagination helper
export class FeedPagination {
  static encodeCursor(timestamp: string, id: string): string {
    const data = JSON.stringify({ timestamp, id })
    return Buffer.from(data).toString('base64')
  }

  static decodeCursor(cursor: string): { timestamp: string; id: string } | null {
    try {
      const data = Buffer.from(cursor, 'base64').toString('utf-8')
      return JSON.parse(data)
    } catch {
      return null
    }
  }

  static applyCursor(
    posts: FeedPostWithAuthor[],
    cursor?: string
  ): FeedPostWithAuthor[] {
    if (!cursor) return posts

    const cursorData = this.decodeCursor(cursor)
    if (!cursorData) return posts

    const cursorTime = new Date(cursorData.timestamp).getTime()
    
    return posts.filter(post => {
      const postTime = new Date(post.created_at).getTime()
      return postTime < cursorTime || 
        (postTime === cursorTime && post.id < cursorData.id)
    })
  }

  static generateNextCursor(posts: FeedPostWithAuthor[]): string | undefined {
    if (posts.length === 0) return undefined
    
    const lastPost = posts[posts.length - 1]
    return this.encodeCursor(lastPost.created_at, lastPost.id)
  }
}