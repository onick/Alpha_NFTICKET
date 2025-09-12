import { NextRequest, NextResponse } from 'next/server'
import { createServerEventsService } from '@nfticket/api'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '4')
    
    const cookieStore = cookies()
    const eventsService = createServerEventsService(cookieStore)
    
    const trendingEvents = await eventsService.getTrendingEvents(limit)
    
    return NextResponse.json(trendingEvents)
  } catch (error) {
    console.error('Trending events API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trending events' },
      { status: 500 }
    )
  }
}