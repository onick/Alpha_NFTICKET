import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import CacheService from '@/lib/redis'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.trim().length === 0) {
      return NextResponse.json([])
    }

    // 1. Try to get from Redis cache first
    const cachedUsers = await CacheService.getCachedUserSearch(query)
    if (cachedUsers) {
      console.log('📦 Serving user search from Redis cache')
      return NextResponse.json(cachedUsers)
    }

    console.log('🔍 Cache miss - searching users in database')
    // 2. If cache miss, search in Supabase
    const { data: users, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
      .limit(10)
      .order('full_name', { ascending: true })

    if (error) {
      console.error('Error searching users:', error)
      
      // Fallback to mock data if database fails
      const mockUsers = [
        { id: '1', name: 'Ana Herrera', username: 'ana_events', avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face' },
        { id: '2', name: 'Carlos Rivera', username: 'carlostech', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' },
        { id: '3', name: 'María González', username: 'mariag_music', avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face' },
        { id: '4', name: 'Luis Martínez', username: 'luism_photo', avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' },
        { id: '5', name: 'Sofia Reyes', username: 'sofia_design', avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face' },
        { id: '6', name: 'Diego Santos', username: 'diego_music', avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face' }
      ]
      
      const filteredMockUsers = mockUsers.filter(user => 
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.username.toLowerCase().includes(query.toLowerCase())
      )
      
      return NextResponse.json(
        filteredMockUsers.slice(0, 5).map(user => ({
          id: user.id,
          username: user.username,
          name: user.name,
          avatar: user.avatar_url
        }))
      )
    }

    // Transform to match the expected format for mentions
    const transformedUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      name: user.full_name,
      avatar: user.avatar_url,
      isOnline: Math.random() > 0.5 // Mock online status for now
    }))

    // 3. Cache the search results
    await CacheService.cacheUserSearch(query, transformedUsers)

    return NextResponse.json(transformedUsers)
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}