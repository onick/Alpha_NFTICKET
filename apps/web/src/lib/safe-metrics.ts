// Safe Metrics System - Protects sensitive business data while providing meaningful insights

export interface SafeMetrics {
  // Public engagement metrics (safe to show)
  socialScore: number; // 0-100 based on social interactions
  engagementLevel: 'Low' | 'Medium' | 'High' | 'Trending' | 'Viral';
  communityBuzz: 'Quiet' | 'Active' | 'Hot' | 'Explosive';
  
  // Relative indicators (no absolute numbers)
  popularityTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  trendingStatus: 'Rising' | 'Hot' | 'Peak' | 'Cooling';
  
  // Safe social metrics
  socialInteractions: {
    likes: number;
    shares: number;
    comments: number;
    mentions: number;
    saves: number;
  };
  
  // Badges (qualitative, not quantitative)
  badges: string[];
  
  // Growth indicators (percentage, not absolute)
  growthPercentage?: number;
  
  // Community metrics
  communityEngagement: {
    activeDiscussions: number;
    newMembers: number;
    postsToday: number;
  };
}

export interface SafeEventMetrics extends SafeMetrics {
  availabilityStatus: 'Available' | 'Limited' | 'Nearly Sold Out' | 'Sold Out';
  demandLevel: 'Low' | 'Moderate' | 'High' | 'Very High' | 'Extreme';
  priceRange: string; // Only show price range, not sales data
  hashtags: string[];
  venue: string;
  date: string;
}

export interface SafeUserMetrics {
  influenceScore: number; // 0-100 based on social influence
  communityLevel: 'Newcomer' | 'Regular' | 'Active' | 'Influencer' | 'Champion';
  badges: string[];
  followersCount?: number; // Only if user opts in to show
  publicStats: {
    eventsAttended: number; // User can control visibility
    postsShared: number;
    communitiesJoined: number;
  };
}

// Helper functions to calculate safe metrics
export class SafeMetricsCalculator {
  static calculateSocialScore(interactions: { likes: number; shares: number; comments: number; mentions: number }): number {
    const { likes, shares, comments, mentions } = interactions;
    
    // Weighted algorithm (shares and comments worth more than likes)
    const weightedScore = (likes * 1) + (comments * 3) + (shares * 5) + (mentions * 4);
    
    // Normalize to 0-100 scale
    return Math.min(100, Math.round(weightedScore / 100));
  }
  
  static getEngagementLevel(socialScore: number): SafeMetrics['engagementLevel'] {
    if (socialScore >= 90) return 'Viral';
    if (socialScore >= 75) return 'Trending';
    if (socialScore >= 50) return 'High';
    if (socialScore >= 25) return 'Medium';
    return 'Low';
  }
  
  static getCommunityBuzz(postsCount: number, activeUsers: number): SafeMetrics['communityBuzz'] {
    const buzzScore = postsCount + (activeUsers * 2);
    
    if (buzzScore >= 100) return 'Explosive';
    if (buzzScore >= 50) return 'Hot';
    if (buzzScore >= 20) return 'Active';
    return 'Quiet';
  }
  
  static getPopularityTier(socialScore: number, growthRate: number): SafeMetrics['popularityTier'] {
    const combinedScore = socialScore + (growthRate * 0.3);
    
    if (combinedScore >= 95) return 'Diamond';
    if (combinedScore >= 85) return 'Platinum';
    if (combinedScore >= 70) return 'Gold';
    if (combinedScore >= 50) return 'Silver';
    return 'Bronze';
  }
  
  static getTrendingStatus(growthRate: number): SafeMetrics['trendingStatus'] {
    if (growthRate >= 100) return 'Peak';
    if (growthRate >= 50) return 'Hot';
    if (growthRate >= 20) return 'Rising';
    return 'Cooling';
  }
  
  static generateEventBadges(metrics: SafeEventMetrics): string[] {
    const badges: string[] = [];
    
    if (metrics.engagementLevel === 'Viral') badges.push('🔥 Viral');
    if (metrics.demandLevel === 'Very High' || metrics.demandLevel === 'Extreme') badges.push('⚡ High Demand');
    if (metrics.communityBuzz === 'Explosive') badges.push('💥 Community Favorite');
    if (metrics.trendingStatus === 'Peak') badges.push('📈 Peak Trending');
    if (metrics.socialScore >= 90) badges.push('🌟 Top Rated');
    
    return badges;
  }
  
  static generateUserBadges(stats: SafeUserMetrics['publicStats'], socialScore: number): string[] {
    const badges: string[] = [];
    
    if (stats.eventsAttended >= 50) badges.push('🎟️ Event Collector');
    if (stats.eventsAttended >= 100) badges.push('🏆 Century Club');
    if (stats.postsShared >= 100) badges.push('📝 Content Creator');
    if (stats.communitiesJoined >= 10) badges.push('🌐 Community Builder');
    if (socialScore >= 85) badges.push('⭐ Influencer');
    
    return badges;
  }
  
  // Mock safe event metrics (replace with real data later)
  static getMockEventMetrics(): SafeEventMetrics[] {
    return [
      {
        socialScore: 95,
        engagementLevel: 'Viral',
        communityBuzz: 'Explosive',
        popularityTier: 'Diamond',
        trendingStatus: 'Peak',
        availabilityStatus: 'Limited',
        demandLevel: 'Extreme',
        priceRange: 'RD$2,500 - RD$8,500',
        socialInteractions: {
          likes: 1247,
          shares: 856,
          comments: 445,
          mentions: 378,
          saves: 623
        },
        hashtags: ['#RomeoSantos', '#ConciertosRD', '#GoldenTour'],
        badges: ['🔥 Viral', '⚡ High Demand', '💥 Community Favorite'],
        growthPercentage: 156,
        communityEngagement: {
          activeDiscussions: 23,
          newMembers: 145,
          postsToday: 67
        },
        venue: 'Palacio de los Deportes',
        date: '2024-12-15'
      },
      {
        socialScore: 78,
        engagementLevel: 'Trending',
        communityBuzz: 'Hot',
        popularityTier: 'Gold',
        trendingStatus: 'Hot',
        availabilityStatus: 'Available',
        demandLevel: 'High',
        priceRange: 'RD$1,200 - RD$3,500',
        socialInteractions: {
          likes: 634,
          shares: 423,
          comments: 234,
          mentions: 178,
          saves: 345
        },
        hashtags: ['#TechSummitRD', '#IA', '#Tecnología'],
        badges: ['📈 Peak Trending', '🌟 Top Rated'],
        growthPercentage: 89,
        communityEngagement: {
          activeDiscussions: 15,
          newMembers: 78,
          postsToday: 34
        },
        venue: 'Centro de Convenciones',
        date: '2025-03-10'
      }
    ];
  }
}

// Privacy-first approach: Only show data users explicitly consent to share
export interface UserPrivacySettings {
  showFollowerCount: boolean;
  showEventsAttended: boolean;
  showTicketsPurchased: boolean;
  showSpendingData: boolean;
  allowPublicProfile: boolean;
  shareActivityInFeed: boolean;
}

export const defaultPrivacySettings: UserPrivacySettings = {
  showFollowerCount: true,
  showEventsAttended: true,
  showTicketsPurchased: false, // Private by default
  showSpendingData: false, // Private by default
  allowPublicProfile: true,
  shareActivityInFeed: true
};