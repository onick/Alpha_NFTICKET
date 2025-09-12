import { NextRequest, NextResponse } from 'next/server'
import { createServerTicketsService } from '@nfticket/api'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const qrCode = searchParams.get('qrCode')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    const cookieStore = cookies()
    const ticketsService = createServerTicketsService(cookieStore)
    
    if (qrCode) {
      // Get ticket by QR code for validation
      const ticket = await ticketsService.getTicketByQRCode(qrCode)
      return NextResponse.json(ticket)
    }
    
    if (userId) {
      // Get user's tickets
      const tickets = await ticketsService.getUserTickets(userId, limit)
      return NextResponse.json(tickets)
    }
    
    return NextResponse.json(
      { error: 'User ID or QR code is required' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Get tickets API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    
    const cookieStore = cookies()
    const ticketsService = createServerTicketsService(cookieStore)
    
    if (action === 'validate') {
      // Validate ticket
      const { qrCode, validatorId } = await request.json()
      const result = await ticketsService.validateTicket(qrCode, validatorId)
      return NextResponse.json(result)
    }
    
    if (action === 'generate') {
      // Generate tickets for order
      const { orderId, ticketTypeId, eventId, ownerId, quantity } = await request.json()
      const tickets = await ticketsService.generateTicketsForOrder(
        orderId, ticketTypeId, eventId, ownerId, quantity
      )
      return NextResponse.json(tickets, { status: 201 })
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Tickets action API error:', error)
    return NextResponse.json(
      { error: 'Failed to process ticket action' },
      { status: 500 }
    )
  }
}