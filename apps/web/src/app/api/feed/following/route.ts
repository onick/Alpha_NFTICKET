import { NextRequest, NextResponse } from 'next/server'
import { createServerFeedService } from '@nfticket/api'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cursor = searchParams.get('cursor') || undefined
    const limit = parseInt(searchParams.get('limit') || '20')
    
    // Get user ID from auth (required for following feed)
    const userId = 'mock-user-id' // TODO: Get from actual auth
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const cookieStore = cookies()
    const feedService = createServerFeedService(cookieStore)
    
    const feed = await feedService.getFollowingFeed(userId, cursor, limit)
    
    return NextResponse.json(feed)
  } catch (error) {
    console.error('Following feed API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch following feed' },
      { status: 500 }
    )
  }
}