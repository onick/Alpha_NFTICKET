import { NextRequest, NextResponse } from 'next/server'
import { createServerFeedService } from '@nfticket/api'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cursor = searchParams.get('cursor') || undefined
    const limit = parseInt(searchParams.get('limit') || '20')
    
    // Optional user ID for personalization
    const userId = undefined // TODO: Get from auth if available
    
    const cookieStore = cookies()
    const feedService = createServerFeedService(cookieStore)
    
    const feed = await feedService.getPopularFeed(userId, cursor, limit)
    
    return NextResponse.json(feed)
  } catch (error) {
    console.error('Popular feed API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch popular feed' },
      { status: 500 }
    )
  }
}