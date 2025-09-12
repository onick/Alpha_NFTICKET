import { NextRequest, NextResponse } from 'next/server'
import { createServerEventsService } from '@nfticket/api'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category') || undefined
    
    const cookieStore = cookies()
    const eventsService = createServerEventsService(cookieStore)
    
    const events = await eventsService.listUpcomingEvents({
      limit,
      category
    })
    
    return NextResponse.json(events)
  } catch (error) {
    console.error('Events API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const cookieStore = cookies()
    const eventsService = createServerEventsService(cookieStore)
    
    // TODO: Get organizer ID from auth session
    const organizerId = 'temp-organizer-id'
    
    const event = await eventsService.createEvent(body, organizerId)
    
    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Create event API error:', error)
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
}