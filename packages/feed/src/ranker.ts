import {
  FeedPostWithAuthor,
  UserSignals,
  RankingWeights,
  FeedMixingStrategy,
  PostType
} from './types'

export class FeedRanker {
  private defaultWeights: RankingWeights = {
    purchase_weight: 2.0,
    social_weight: 1.0,
    community_weight: 1.2,
    activity_weight: 0.8,
    event_recommendation_weight: 1.5,
    sponsored_weight: 0.5,
    
    like_multiplier: 1.0,
    comment_multiplier: 2.0,
    save_multiplier: 1.5,
    share_multiplier: 3.0,
    
    freshness_decay_factor: 1.4,
    
    following_boost: 2.0,
    category_match_boost: 1.3,
    location_boost: 1.8
  }

  private defaultMixingStrategy: FeedMixingStrategy = {
    social_ratio: 0.4,
    purchase_ratio: 0.25,
    event_recommendation_ratio: 0.25,
    sponsored_ratio: 0.1,
    max_consecutive_same_type: 3,
    inject_trending_interval: 8
  }

  calculateWeights(userSignals: UserSignals): RankingWeights {
    const weights = { ...this.defaultWeights }
    
    // Adjust based on user engagement patterns
    const purchaseEngagementRatio = userSignals.likes_on_purchases / 
      Math.max(1, userSignals.likes_on_purchases + userSignals.likes_on_social)
    
    if (purchaseEngagementRatio > 0.6) {
      weights.purchase_weight *= 1.3
      weights.event_recommendation_weight *= 1.2
    } else if (purchaseEngagementRatio < 0.3) {
      weights.social_weight *= 1.2
      weights.community_weight *= 1.1
    }
    
    // Adjust comment multiplier based on user's commenting behavior
    if (userSignals.comments_ratio > 0.15) {
      weights.comment_multiplier *= 1.2
    }
    
    // Boost following content for social users
    if (userSignals.following_count > 50) {
      weights.following_boost *= 1.2
    }
    
    return weights
  }

  scorePost(
    post: FeedPostWithAuthor,
    userSignals: UserSignals,
    weights: RankingWeights,
    viewerId?: string
  ): number {
    let score = this.getBaseTypeScore(post.type, weights)
    
    // Engagement score
    const engagementScore = (
      post.likes_count * weights.like_multiplier +
      post.comments_count * weights.comment_multiplier +
      post.saves_count * weights.save_multiplier +
      post.shares_count * weights.share_multiplier
    ) / Math.max(1, post.likes_count + post.comments_count + post.saves_count + post.shares_count)
    
    score += engagementScore
    
    // Freshness decay
    const hoursAge = this.getHoursAge(post.created_at)
    const freshnessScore = 1 / Math.pow(hoursAge + 2, weights.freshness_decay_factor)
    score *= freshnessScore
    
    // Personalization boosts
    score += this.getPersonalizationBoosts(post, userSignals, weights, viewerId)
    
    // Quality penalties
    score -= this.getQualityPenalties(post)
    
    return Math.max(0, score)
  }

  private getBaseTypeScore(type: PostType, weights: RankingWeights): number {
    switch (type) {
      case 'purchase': return weights.purchase_weight
      case 'user': return weights.social_weight
      case 'community': return weights.community_weight
      case 'activity': return weights.activity_weight
      case 'event_recommendation': return weights.event_recommendation_weight
      case 'sponsored': return weights.sponsored_weight
      default: return 1.0
    }
  }

  private getPersonalizationBoosts(
    post: FeedPostWithAuthor,
    userSignals: UserSignals,
    weights: RankingWeights,
    viewerId?: string
  ): number {
    let boost = 0
    
    // Following boost
    if (post.is_following_author) {
      boost += weights.following_boost
    }
    
    // Category matching for purchase and event recommendation posts
    if (post.type === 'purchase' || post.type === 'event_recommendation') {
      const eventCategory = post.type === 'purchase' 
        ? (post as any).event?.category 
        : (post as any).event?.category
      
      if (eventCategory && userSignals.categories_fav.includes(eventCategory.toLowerCase())) {
        boost += weights.category_match_boost
      }
    }
    
    // Location boost for events
    if (userSignals.location_preference && 
        (post.type === 'purchase' || post.type === 'event_recommendation')) {
      // Simplified location boost - would need actual coordinates in real implementation
      boost += weights.location_boost * 0.5
    }
    
    // Community membership boost
    if (post.type === 'community') {
      const communityId = (post as any).community_id
      if (communityId && userSignals.community_memberships.includes(communityId)) {
        boost += weights.following_boost * 0.8
      }
    }
    
    // Time-based boost (peak activity hours)
    const postHour = new Date(post.created_at).getHours()
    if (userSignals.peak_activity_hours.includes(postHour)) {
      boost += 0.3
    }
    
    return boost
  }

  private getQualityPenalties(post: FeedPostWithAuthor): number {
    let penalty = 0
    
    // Report penalty
    if (post.reports_count > 0) {
      penalty += Math.log(post.reports_count + 1) * 0.5
    }
    
    // Low engagement penalty for older posts
    const hoursAge = this.getHoursAge(post.created_at)
    if (hoursAge > 24 && post.likes_count + post.comments_count < 2) {
      penalty += 0.3
    }
    
    return penalty
  }

  private getHoursAge(createdAt: string): number {
    const now = Date.now()
    const created = new Date(createdAt).getTime()
    return (now - created) / (1000 * 60 * 60)
  }

  rankPosts(
    posts: FeedPostWithAuthor[],
    userSignals: UserSignals,
    viewerId?: string
  ): FeedPostWithAuthor[] {
    const weights = this.calculateWeights(userSignals)
    
    const scoredPosts = posts.map(post => ({
      post,
      score: this.scorePost(post, userSignals, weights, viewerId)
    }))
    
    return scoredPosts
      .sort((a, b) => b.score - a.score)
      .map(item => item.post)
  }

  mixFeed(
    socialPosts: FeedPostWithAuthor[],
    purchasePosts: FeedPostWithAuthor[],
    eventPosts: FeedPostWithAuthor[],
    sponsoredPosts: FeedPostWithAuthor[],
    strategy: FeedMixingStrategy = this.defaultMixingStrategy
  ): FeedPostWithAuthor[] {
    const totalPosts = socialPosts.length + purchasePosts.length + 
                     eventPosts.length + sponsoredPosts.length
    
    if (totalPosts === 0) return []
    
    // Calculate target counts based on ratios
    const targetSocial = Math.floor(totalPosts * strategy.social_ratio)
    const targetPurchase = Math.floor(totalPosts * strategy.purchase_ratio)
    const targetEvents = Math.floor(totalPosts * strategy.event_recommendation_ratio)
    const targetSponsored = Math.floor(totalPosts * strategy.sponsored_ratio)
    
    // Take the required number from each category
    const selectedSocial = socialPosts.slice(0, targetSocial)
    const selectedPurchase = purchasePosts.slice(0, targetPurchase)
    const selectedEvents = eventPosts.slice(0, targetEvents)
    const selectedSponsored = sponsoredPosts.slice(0, targetSponsored)
    
    // Interleave posts while respecting max consecutive rule
    return this.interleavePosts([
      ...selectedSocial,
      ...selectedPurchase, 
      ...selectedEvents,
      ...selectedSponsored
    ], strategy.max_consecutive_same_type)
  }

  private interleavePosts(
    posts: FeedPostWithAuthor[], 
    maxConsecutive: number
  ): FeedPostWithAuthor[] {
    if (posts.length === 0) return []
    
    // Group posts by type
    const postsByType = posts.reduce((acc, post) => {
      if (!acc[post.type]) acc[post.type] = []
      acc[post.type].push(post)
      return acc
    }, {} as Record<PostType, FeedPostWithAuthor[]>)
    
    const result: FeedPostWithAuthor[] = []
    const types = Object.keys(postsByType) as PostType[]
    let currentTypeIndex = 0
    let consecutiveCount = 0
    let lastType: PostType | null = null
    
    while (result.length < posts.length) {
      const currentType = types[currentTypeIndex]
      const availablePosts = postsByType[currentType]
      
      if (availablePosts && availablePosts.length > 0) {
        // Check if we need to switch type due to consecutive limit
        if (lastType === currentType && consecutiveCount >= maxConsecutive) {
          // Find next type with available posts
          let nextTypeIndex = (currentTypeIndex + 1) % types.length
          let attempts = 0
          
          while (attempts < types.length) {
            const nextType = types[nextTypeIndex]
            if (postsByType[nextType] && postsByType[nextType].length > 0) {
              currentTypeIndex = nextTypeIndex
              consecutiveCount = 0
              break
            }
            nextTypeIndex = (nextTypeIndex + 1) % types.length
            attempts++
          }
          
          if (attempts >= types.length) break // No more posts available
          continue
        }
        
        // Add post from current type
        const post = availablePosts.shift()!
        result.push(post)
        
        if (lastType === currentType) {
          consecutiveCount++
        } else {
          consecutiveCount = 1
          lastType = currentType
        }
      }
      
      // Move to next type
      currentTypeIndex = (currentTypeIndex + 1) % types.length
      
      // Check if all types are exhausted
      if (types.every(type => !postsByType[type] || postsByType[type].length === 0)) {
        break
      }
    }
    
    return result
  }

  // Popular feed ranking (different algorithm)
  rankPopularPosts(
    posts: FeedPostWithAuthor[],
    timeWindowHours: number = 72
  ): FeedPostWithAuthor[] {
    const cutoffTime = Date.now() - (timeWindowHours * 60 * 60 * 1000)
    
    const recentPosts = posts.filter(post => 
      new Date(post.created_at).getTime() > cutoffTime
    )
    
    const scoredPosts = recentPosts.map(post => {
      const hoursAge = this.getHoursAge(post.created_at)
      const engagementScore = (
        post.likes_count + 
        post.comments_count * 2 + 
        post.saves_count * 3
      )
      
      // Popular posts formula: engagement divided by time decay
      const score = engagementScore / Math.pow(hoursAge + 1, 1.2)
      
      return { post, score }
    })
    
    return scoredPosts
      .sort((a, b) => b.score - a.score)
      .map(item => item.post)
  }

  // Following feed (chronological)
  rankFollowingPosts(posts: FeedPostWithAuthor[]): FeedPostWithAuthor[] {
    return posts
      .filter(post => post.is_following_author)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }
}