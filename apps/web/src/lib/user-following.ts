// User Following System - Social Network Features

export interface UserProfile {
  id: string
  name: string
  username: string
  avatar: string
  bio?: string
  verified?: boolean
  followerCount: number
  followingCount: number
  isFollowing: boolean
  isMutualFollow: boolean
  badges: string[]
  joinDate: string
  lastActivity: string
}

export interface FollowingActivity {
  id: string
  type: 'follow' | 'unfollow' | 'mutual_follow'
  user: {
    id: string
    name: string
    username: string
    avatar: string
  }
  targetUser: {
    id: string
    name: string
    username: string
    avatar: string
  }
  timestamp: string
}

export interface SuggestedUser {
  id: string
  name: string
  username: string
  avatar: string
  bio?: string
  mutualFollowers: number
  mutualFriends: string[] // Names of mutual connections
  reason: 'mutual_friends' | 'popular' | 'same_interests' | 'recent_activity'
  verified?: boolean
  badges: string[]
  isFollowing: boolean
}

// Following management class
export class FollowingManager {
  private static instance: FollowingManager
  private followingData: Map<string, Set<string>> = new Map() // userId -> Set of following userIds
  private followersData: Map<string, Set<string>> = new Map() // userId -> Set of follower userIds

  static getInstance(): FollowingManager {
    if (!FollowingManager.instance) {
      FollowingManager.instance = new FollowingManager()
    }
    return FollowingManager.instance
  }

  constructor() {
    this.loadFromStorage()
  }

  // Follow/Unfollow operations
  followUser(currentUserId: string, targetUserId: string): boolean {
    if (currentUserId === targetUserId) return false

    // Add to current user's following
    if (!this.followingData.has(currentUserId)) {
      this.followingData.set(currentUserId, new Set())
    }
    this.followingData.get(currentUserId)!.add(targetUserId)

    // Add to target user's followers
    if (!this.followersData.has(targetUserId)) {
      this.followersData.set(targetUserId, new Set())
    }
    this.followersData.get(targetUserId)!.add(currentUserId)

    this.saveToStorage()
    this.logActivity('follow', currentUserId, targetUserId)
    
    return true
  }

  unfollowUser(currentUserId: string, targetUserId: string): boolean {
    if (currentUserId === targetUserId) return false

    // Remove from current user's following
    if (this.followingData.has(currentUserId)) {
      this.followingData.get(currentUserId)!.delete(targetUserId)
    }

    // Remove from target user's followers
    if (this.followersData.has(targetUserId)) {
      this.followersData.get(targetUserId)!.delete(currentUserId)
    }

    this.saveToStorage()
    this.logActivity('unfollow', currentUserId, targetUserId)
    
    return true
  }

  // Check relationships
  isFollowing(currentUserId: string, targetUserId: string): boolean {
    return this.followingData.get(currentUserId)?.has(targetUserId) || false
  }

  isMutualFollow(userId1: string, userId2: string): boolean {
    return this.isFollowing(userId1, userId2) && this.isFollowing(userId2, userId1)
  }

  // Get counts
  getFollowerCount(userId: string): number {
    return this.followersData.get(userId)?.size || 0
  }

  getFollowingCount(userId: string): number {
    return this.followingData.get(userId)?.size || 0
  }

  // Get lists
  getFollowers(userId: string): string[] {
    return Array.from(this.followersData.get(userId) || [])
  }

  getFollowing(userId: string): string[] {
    return Array.from(this.followingData.get(userId) || [])
  }

  getMutualFriends(currentUserId: string, targetUserId: string): string[] {
    const currentFollowing = this.followingData.get(currentUserId) || new Set()
    const targetFollowing = this.followingData.get(targetUserId) || new Set()
    
    const mutual: string[] = []
    currentFollowing.forEach(userId => {
      if (targetFollowing.has(userId)) {
        mutual.push(userId)
      }
    })
    
    return mutual
  }

  // Suggestions algorithm
  getSuggestedUsers(currentUserId: string, allUsers: UserProfile[]): SuggestedUser[] {
    const suggestions: SuggestedUser[] = []
    const currentFollowing = this.followingData.get(currentUserId) || new Set()

    allUsers.forEach(user => {
      if (user.id === currentUserId || currentFollowing.has(user.id)) {
        return // Skip self and already following
      }

      const mutualFriends = this.getMutualFriends(currentUserId, user.id)
      const mutualCount = mutualFriends.length
      
      let reason: SuggestedUser['reason'] = 'recent_activity'
      
      if (mutualCount >= 3) {
        reason = 'mutual_friends'
      } else if (this.getFollowerCount(user.id) > 100) {
        reason = 'popular'
      } else if (mutualCount > 0) {
        reason = 'same_interests'
      }

      // Get names of mutual friends (up to 3)
      const mutualFriendNames = mutualFriends.slice(0, 3).map(id => {
        const friend = allUsers.find(u => u.id === id)
        return friend?.name || 'Usuario'
      })

      suggestions.push({
        id: user.id,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
        mutualFollowers: mutualCount,
        mutualFriends: mutualFriendNames,
        reason,
        verified: user.verified,
        badges: user.badges,
        isFollowing: false
      })
    })

    // Sort by relevance (mutual friends first, then popularity)
    return suggestions
      .sort((a, b) => {
        if (a.reason === 'mutual_friends' && b.reason !== 'mutual_friends') return -1
        if (b.reason === 'mutual_friends' && a.reason !== 'mutual_friends') return 1
        return b.mutualFollowers - a.mutualFollowers
      })
      .slice(0, 10) // Limit to top 10 suggestions
  }

  // Activity logging
  private logActivity(type: 'follow' | 'unfollow', currentUserId: string, targetUserId: string): void {
    const activity: FollowingActivity = {
      id: Date.now().toString(),
      type: type as any,
      user: { id: currentUserId, name: '', username: '', avatar: '' }, // Will be populated by caller
      targetUser: { id: targetUserId, name: '', username: '', avatar: '' },
      timestamp: new Date().toISOString()
    }

    // Store in localStorage for now (in production, this would go to a database)
    const existingActivity = JSON.parse(localStorage.getItem('nfticket_following_activity') || '[]')
    existingActivity.unshift(activity)
    localStorage.setItem('nfticket_following_activity', JSON.stringify(existingActivity.slice(0, 100))) // Keep last 100 activities
  }

  // Persistence
  private saveToStorage(): void {
    if (typeof window !== 'undefined') {
      const followingObj = Object.fromEntries(
        Array.from(this.followingData.entries()).map(([key, value]) => [key, Array.from(value)])
      )
      const followersObj = Object.fromEntries(
        Array.from(this.followersData.entries()).map(([key, value]) => [key, Array.from(value)])
      )
      
      localStorage.setItem('nfticket_following', JSON.stringify(followingObj))
      localStorage.setItem('nfticket_followers', JSON.stringify(followersObj))
    }
  }

  private loadFromStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        const followingData = JSON.parse(localStorage.getItem('nfticket_following') || '{}')
        const followersData = JSON.parse(localStorage.getItem('nfticket_followers') || '{}')
        
        // Convert back to Maps with Sets
        this.followingData = new Map(
          Object.entries(followingData).map(([key, value]) => [key, new Set(value as string[])])
        )
        this.followersData = new Map(
          Object.entries(followersData).map(([key, value]) => [key, new Set(value as string[])])
        )
      } catch (error) {
        console.error('Error loading following data from storage:', error)
      }
    }
  }

  // Mock data for development
  static getMockUsers(): UserProfile[] {
    return [
      {
        id: '1',
        name: 'María González',
        username: 'mariag_music',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face',
        bio: 'Amante de la música latina y los conciertos en vivo 🎤',
        verified: true,
        followerCount: 1247,
        followingCount: 567,
        isFollowing: false,
        isMutualFollow: false,
        badges: ['🎵 Music Lover', '🎟️ Event Collector'],
        joinDate: '2023-08-15',
        lastActivity: 'hace 2 horas'
      },
      {
        id: '2',
        name: 'Carlos Rivera',
        username: 'carlostech',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        bio: 'Tech enthusiast | Startup founder | Conferencista',
        verified: false,
        followerCount: 892,
        followingCount: 234,
        isFollowing: false,
        isMutualFollow: false,
        badges: ['💻 Tech Pioneer', '🚀 Innovator'],
        joinDate: '2023-09-20',
        lastActivity: 'hace 5 horas'
      },
      {
        id: '3',
        name: 'Ana Herrera',
        username: 'ana_events',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        bio: 'Event planner | Community builder | Networking enthusiast',
        verified: true,
        followerCount: 2156,
        followingCount: 1089,
        isFollowing: false,
        isMutualFollow: false,
        badges: ['🎭 Event Master', '👥 Community Builder', '🏆 Century Club'],
        joinDate: '2023-06-10',
        lastActivity: 'hace 1 hora'
      },
      {
        id: '4',
        name: 'Luis Martínez',
        username: 'luis_sports',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        bio: 'Sports fanatic | Event photographer | Adventure seeker',
        verified: false,
        followerCount: 445,
        followingCount: 678,
        isFollowing: false,
        isMutualFollow: false,
        badges: ['⚽ Sports Fan', '📸 Photographer'],
        joinDate: '2023-10-05',
        lastActivity: 'hace 3 horas'
      },
      {
        id: '5',
        name: 'Carmen Jiménez',
        username: 'carmen_art',
        avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
        bio: 'Artist | Gallery owner | Cultural events promoter',
        verified: true,
        followerCount: 1834,
        followingCount: 445,
        isFollowing: false,
        isMutualFollow: false,
        badges: ['🎨 Artist', '🏛️ Culture Promoter', '⭐ Influencer'],
        joinDate: '2023-07-22',
        lastActivity: 'hace 4 horas'
      }
    ]
  }
}

// Global instance
export const followingManager = FollowingManager.getInstance()