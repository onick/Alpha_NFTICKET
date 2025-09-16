// Hashtags and Communities System - Social Discovery Features

export interface Hashtag {
  id: string
  tag: string // Without the # symbol
  displayTag: string // With the # symbol
  category: 'eventos' | 'música' | 'tech' | 'deporte' | 'arte' | 'cultura' | 'general'
  postsCount: number
  usersCount: number // Unique users who used this hashtag
  trendingScore: number
  growthPercentage: number
  isFollowing: boolean
  description?: string
  relatedHashtags: string[]
  topPosts: string[] // Post IDs of top posts with this hashtag
  createdAt: string
  lastUsed: string
}

export interface Community {
  id: string
  name: string // e.g., "c/eventos-rd"
  displayName: string // e.g., "Eventos RD"
  description: string
  memberCount: number
  onlineCount: number
  category: 'eventos' | 'música' | 'tech' | 'deporte' | 'arte' | 'cultura' | 'local'
  avatar: string
  banner?: string
  color: string
  isJoined: boolean
  isModerator: boolean
  isPrivate: boolean
  rules: string[]
  moderators: CommunityModerator[]
  recentActivity: CommunityActivity[]
  topHashtags: string[]
  createdAt: string
  stats: {
    postsToday: number
    postsThisWeek: number
    newMembersThisWeek: number
    activeDiscussions: number
  }
}

export interface CommunityModerator {
  id: string
  name: string
  username: string
  avatar: string
  role: 'owner' | 'admin' | 'moderator'
  joinedAt: string
}

export interface CommunityActivity {
  id: string
  type: 'new_post' | 'new_member' | 'event_created' | 'discussion_started'
  user: {
    id: string
    name: string
    username: string
    avatar: string
  }
  content: string
  timestamp: string
  metadata?: any
}

export interface HashtagTrend {
  hashtag: Hashtag
  position: number
  previousPosition?: number
  changeDirection: 'up' | 'down' | 'new' | 'stable'
  changeAmount: number
}

// Hashtag Management System
export class HashtagManager {
  private static instance: HashtagManager
  private hashtags: Map<string, Hashtag> = new Map()
  private userHashtagInteractions: Map<string, Set<string>> = new Map() // userId -> hashtag IDs

  static getInstance(): HashtagManager {
    if (!HashtagManager.instance) {
      HashtagManager.instance = new HashtagManager()
    }
    return HashtagManager.instance
  }

  constructor() {
    this.loadMockData()
  }

  // Extract hashtags from text
  extractHashtags(text: string): string[] {
    const hashtagRegex = /#[a-zA-ZÀ-ÿ0-9_]{2,50}/g
    const matches = text.match(hashtagRegex) || []
    return matches.map(tag => tag.toLowerCase().slice(1)) // Remove # and convert to lowercase
  }

  // Get or create hashtag
  getOrCreateHashtag(tag: string, userId?: string): Hashtag {
    const normalizedTag = tag.toLowerCase()
    
    if (this.hashtags.has(normalizedTag)) {
      const hashtag = this.hashtags.get(normalizedTag)!
      // Increment usage
      hashtag.postsCount++
      hashtag.lastUsed = new Date().toISOString()
      
      // Track user interaction
      if (userId) {
        if (!this.userHashtagInteractions.has(userId)) {
          this.userHashtagInteractions.set(userId, new Set())
        }
        if (!this.userHashtagInteractions.get(userId)!.has(normalizedTag)) {
          this.userHashtagInteractions.get(userId)!.add(normalizedTag)
          hashtag.usersCount++
        }
      }
      
      return hashtag
    }

    // Create new hashtag
    const newHashtag: Hashtag = {
      id: `hashtag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tag: normalizedTag,
      displayTag: `#${normalizedTag}`,
      category: this.categorizeHashtag(normalizedTag),
      postsCount: 1,
      usersCount: userId ? 1 : 0,
      trendingScore: 1,
      growthPercentage: 100, // New hashtag = 100% growth
      isFollowing: false,
      relatedHashtags: [],
      topPosts: [],
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString()
    }

    this.hashtags.set(normalizedTag, newHashtag)
    
    if (userId) {
      if (!this.userHashtagInteractions.has(userId)) {
        this.userHashtagInteractions.set(userId, new Set())
      }
      this.userHashtagInteractions.get(userId)!.add(normalizedTag)
    }

    return newHashtag
  }

  // Categorize hashtag automatically
  private categorizeHashtag(tag: string): Hashtag['category'] {
    const eventKeywords = ['evento', 'concierto', 'festival', 'show', 'live', 'ticket', 'vip']
    const musicKeywords = ['música', 'musica', 'canción', 'album', 'artista', 'banda', 'dj', 'bachata', 'merengue', 'reggaeton', 'salsa']
    const techKeywords = ['tech', 'tecnología', 'programación', 'software', 'startup', 'ia', 'ai', 'coding', 'developer']
    const sportsKeywords = ['deporte', 'fútbol', 'futbol', 'baseball', 'baloncesto', 'volleyball', 'tennis']
    const artKeywords = ['arte', 'pintura', 'escultura', 'galería', 'artista', 'cultura', 'museo']

    const lowerTag = tag.toLowerCase()

    if (eventKeywords.some(keyword => lowerTag.includes(keyword))) return 'eventos'
    if (musicKeywords.some(keyword => lowerTag.includes(keyword))) return 'música'
    if (techKeywords.some(keyword => lowerTag.includes(keyword))) return 'tech'
    if (sportsKeywords.some(keyword => lowerTag.includes(keyword))) return 'deporte'
    if (artKeywords.some(keyword => lowerTag.includes(keyword))) return 'arte'

    return 'general'
  }

  // Get trending hashtags
  getTrendingHashtags(limit: number = 10): HashtagTrend[] {
    const hashtags = Array.from(this.hashtags.values())
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, limit)

    return hashtags.map((hashtag, index) => ({
      hashtag,
      position: index + 1,
      changeDirection: 'stable' as const,
      changeAmount: 0
    }))
  }

  // Get hashtags by category
  getHashtagsByCategory(category: Hashtag['category']): Hashtag[] {
    return Array.from(this.hashtags.values())
      .filter(hashtag => hashtag.category === category)
      .sort((a, b) => b.postsCount - a.postsCount)
  }

  // Search hashtags
  searchHashtags(query: string): Hashtag[] {
    const searchTerm = query.toLowerCase().replace('#', '')
    return Array.from(this.hashtags.values())
      .filter(hashtag => 
        hashtag.tag.includes(searchTerm) || 
        hashtag.description?.toLowerCase().includes(searchTerm)
      )
      .sort((a, b) => b.postsCount - a.postsCount)
      .slice(0, 20)
  }

  // Load mock data
  private loadMockData(): void {
    const mockHashtags = [
      {
        tag: 'conciertosd',
        category: 'música' as const,
        postsCount: 1247,
        usersCount: 456,
        growthPercentage: 45.2,
        description: 'Todo sobre conciertos en República Dominicana'
      },
      {
        tag: 'techsummitrd',
        category: 'tech' as const,
        postsCount: 856,
        usersCount: 234,
        growthPercentage: 89.1,
        description: 'Summit de tecnología más importante del país'
      },
      {
        tag: 'romeosantos',
        category: 'música' as const,
        postsCount: 634,
        usersCount: 287,
        growthPercentage: 156.7,
        description: 'El Rey de la Bachata'
      },
      {
        tag: 'eventosrd',
        category: 'eventos' as const,
        postsCount: 445,
        usersCount: 178,
        growthPercentage: 23.4,
        description: 'Eventos y actividades en RD'
      },
      {
        tag: 'nfticket',
        category: 'general' as const,
        postsCount: 378,
        usersCount: 123,
        growthPercentage: 67.8,
        description: 'Plataforma de tickets NFT'
      },
      {
        tag: 'musicaelectronica',
        category: 'música' as const,
        postsCount: 267,
        usersCount: 89,
        growthPercentage: 34.5,
        description: 'EDM, house, techno y más'
      },
      {
        tag: 'culturard',
        category: 'cultura' as const,
        postsCount: 198,
        usersCount: 67,
        growthPercentage: 12.3,
        description: 'Cultura dominicana y eventos culturales'
      }
    ]

    mockHashtags.forEach(mock => {
      const hashtag: Hashtag = {
        id: `hashtag_${mock.tag}`,
        tag: mock.tag,
        displayTag: `#${mock.tag}`,
        category: mock.category,
        postsCount: mock.postsCount,
        usersCount: mock.usersCount,
        trendingScore: mock.postsCount * 0.1 + mock.growthPercentage * 0.5,
        growthPercentage: mock.growthPercentage,
        isFollowing: false,
        description: mock.description,
        relatedHashtags: [],
        topPosts: [],
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        lastUsed: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
      }
      this.hashtags.set(mock.tag, hashtag)
    })
  }
}

// Community Management System
export class CommunityManager {
  private static instance: CommunityManager
  private communities: Map<string, Community> = new Map()
  private userCommunityMemberships: Map<string, Set<string>> = new Map() // userId -> community IDs

  static getInstance(): CommunityManager {
    if (!CommunityManager.instance) {
      CommunityManager.instance = new CommunityManager()
    }
    return CommunityManager.instance
  }

  constructor() {
    this.loadMockData()
  }

  // Join/Leave community
  joinCommunity(userId: string, communityId: string): boolean {
    const community = this.communities.get(communityId)
    if (!community || community.isPrivate) return false

    community.memberCount++
    community.isJoined = true

    if (!this.userCommunityMemberships.has(userId)) {
      this.userCommunityMemberships.set(userId, new Set())
    }
    this.userCommunityMemberships.get(userId)!.add(communityId)

    // Add activity
    this.addCommunityActivity(communityId, {
      id: Date.now().toString(),
      type: 'new_member',
      user: { id: userId, name: 'Usuario', username: 'usuario', avatar: '' },
      content: 'se unió a la comunidad',
      timestamp: new Date().toISOString()
    })

    return true
  }

  leaveCommunity(userId: string, communityId: string): boolean {
    const community = this.communities.get(communityId)
    if (!community) return false

    community.memberCount = Math.max(0, community.memberCount - 1)
    community.isJoined = false

    if (this.userCommunityMemberships.has(userId)) {
      this.userCommunityMemberships.get(userId)!.delete(communityId)
    }

    return true
  }

  // Get user's communities
  getUserCommunities(userId: string): Community[] {
    const userCommunities = this.userCommunityMemberships.get(userId) || new Set()
    return Array.from(userCommunities)
      .map(id => this.communities.get(id))
      .filter(Boolean) as Community[]
  }

  // Get trending communities
  getTrendingCommunities(limit: number = 10): Community[] {
    return Array.from(this.communities.values())
      .sort((a, b) => {
        const aScore = a.stats.newMembersThisWeek * 10 + a.stats.postsThisWeek * 5 + a.memberCount
        const bScore = b.stats.newMembersThisWeek * 10 + b.stats.postsThisWeek * 5 + b.memberCount
        return bScore - aScore
      })
      .slice(0, limit)
  }

  // Search communities
  searchCommunities(query: string): Community[] {
    const searchTerm = query.toLowerCase()
    return Array.from(this.communities.values())
      .filter(community => 
        community.name.toLowerCase().includes(searchTerm) ||
        community.displayName.toLowerCase().includes(searchTerm) ||
        community.description.toLowerCase().includes(searchTerm)
      )
      .sort((a, b) => b.memberCount - a.memberCount)
  }

  // Add community activity
  private addCommunityActivity(communityId: string, activity: CommunityActivity): void {
    const community = this.communities.get(communityId)
    if (!community) return

    community.recentActivity.unshift(activity)
    community.recentActivity = community.recentActivity.slice(0, 50) // Keep last 50 activities
  }

  // Load mock communities
  private loadMockData(): void {
    const mockCommunities = [
      {
        name: 'c/eventos-rd',
        displayName: 'Eventos RD',
        description: 'La comunidad principal para eventos en República Dominicana',
        memberCount: 1250,
        category: 'eventos' as const,
        avatar: 'E',
        color: 'bg-purple-500'
      },
      {
        name: 'c/musica-electronica',
        displayName: 'Música Electrónica',
        description: 'Todo sobre EDM, techno, house y más géneros electrónicos',
        memberCount: 890,
        category: 'música' as const,
        avatar: 'M',
        color: 'bg-pink-500'
      },
      {
        name: 'c/conciertos-dr',
        displayName: 'Conciertos DR',
        description: 'Conciertos y festivales musicales en República Dominicana',
        memberCount: 567,
        category: 'música' as const,
        avatar: 'C',
        color: 'bg-blue-500'
      },
      {
        name: 'c/tech-rd',
        displayName: 'Tech RD',
        description: 'Comunidad tecnológica dominicana - startups, developers, innovación',
        memberCount: 445,
        category: 'tech' as const,
        avatar: 'T',
        color: 'bg-green-500'
      },
      {
        name: 'c/arte-cultura',
        displayName: 'Arte y Cultura',
        description: 'Promoción y discusión sobre arte y cultura dominicana',
        memberCount: 334,
        category: 'cultura' as const,
        avatar: 'A',
        color: 'bg-orange-500'
      }
    ]

    mockCommunities.forEach(mock => {
      const community: Community = {
        id: `community_${mock.name.replace('c/', '')}`,
        name: mock.name,
        displayName: mock.displayName,
        description: mock.description,
        memberCount: mock.memberCount,
        onlineCount: Math.floor(mock.memberCount * 0.05), // 5% online
        category: mock.category,
        avatar: mock.avatar,
        color: mock.color,
        isJoined: false,
        isModerator: false,
        isPrivate: false,
        rules: [
          'Mantén el respeto hacia todos los miembros',
          'No spam ni contenido irrelevante',
          'Comparte contenido relacionado con la temática',
          'Reporta contenido inapropiado'
        ],
        moderators: [],
        recentActivity: [
          {
            id: '1',
            type: 'new_post',
            user: {
              id: '1',
              name: 'Usuario Ejemplo',
              username: 'usuario_ejemplo',
              avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face'
            },
            content: 'compartió una nueva publicación',
            timestamp: new Date(Date.now() - Math.random() * 2 * 60 * 60 * 1000).toISOString()
          }
        ],
        topHashtags: ['#' + mock.name.replace('c/', ''), '#eventos', '#rd'],
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        stats: {
          postsToday: Math.floor(Math.random() * 20) + 5,
          postsThisWeek: Math.floor(Math.random() * 100) + 25,
          newMembersThisWeek: Math.floor(Math.random() * 50) + 10,
          activeDiscussions: Math.floor(Math.random() * 15) + 3
        }
      }
      this.communities.set(community.id, community)
    })
  }

  getAllCommunities(): Community[] {
    return Array.from(this.communities.values())
  }
}

// Global instances
export const hashtagManager = HashtagManager.getInstance()
export const communityManager = CommunityManager.getInstance()