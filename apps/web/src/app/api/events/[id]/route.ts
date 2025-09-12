import { NextRequest, NextResponse } from 'next/server'
import { createServerEventsService } from '@nfticket/api'
import { cookies } from 'next/headers'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies()
    const eventsService = createServerEventsService(cookieStore)
    
    const event = await eventsService.getEventById(params.id)
    
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(event)
  } catch (error) {
    console.error('Event detail API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const cookieStore = cookies()
    const eventsService = createServerEventsService(cookieStore)
    
    // TODO: Get organizer ID from auth session
    const organizerId = 'temp-organizer-id'
    
    const event = await eventsService.updateEvent(params.id, body, organizerId)
    
    return NextResponse.json(event)
  } catch (error) {
    console.error('Update event API error:', error)
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies()
    const eventsService = createServerEventsService(cookieStore)
    
    // TODO: Get organizer ID from auth session
    const organizerId = 'temp-organizer-id'
    
    await eventsService.deleteEvent(params.id, organizerId)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete event API error:', error)
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    )
  }
}