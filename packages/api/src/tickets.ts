import { nanoid } from 'nanoid'
import { 
  createBrowserClient, 
  createServerClient, 
  type TypedSupabaseClient,
  type Ticket,
  type CreateTicketInput,
  type TicketWithDetails 
} from '@nfticket/database'

/**
 * Tickets Service - Ticket management and QR code generation
 */
export class TicketsService {
  constructor(private supabase: TypedSupabaseClient) {}

  /**
   * Generate tickets for a paid order
   */
  async generateTicketsForOrder(
    orderId: string,
    ticketTypeId: string,
    eventId: string,
    ownerId: string,
    quantity: number
  ): Promise<Ticket[]> {
    const tickets: CreateTicketInput[] = []
    
    for (let i = 0; i < quantity; i++) {
      tickets.push({
        ticket_type_id: ticketTypeId,
        event_id: eventId,
        order_id: orderId,
        owner_id: ownerId,
        unique_qr_code: this.generateUniqueQRCode()
      })
    }

    const { data, error } = await this.supabase
      .from('tickets')
      .insert(tickets)
      .select('*')

    if (error) {
      throw new Error(`Failed to generate tickets: ${error.message}`)
    }

    return data || []
  }

  /**
   * Get ticket by ID with full details
   */
  async getTicketById(id: string): Promise<TicketWithDetails | null> {
    const { data, error } = await this.supabase
      .from('tickets')
      .select(`
        *,
        ticket_type:ticket_types!ticket_type_id(
          id,
          name,
          price
        ),
        event:events!event_id(
          id,
          title,
          start_date,
          end_date,
          venue_name,
          venue_address,
          organizer:profiles!organizer_id(
            id,
            username,
            full_name
          )
        ),
        owner:profiles!owner_id(
          id,
          username,
          full_name,
          avatar_url
        ),
        order:orders!order_id(
          id,
          status,
          total_amount,
          created_at
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(`Failed to fetch ticket: ${error.message}`)
    }

    return data
  }

  /**
   * Get ticket by QR code for validation
   */
  async getTicketByQRCode(qrCode: string): Promise<TicketWithDetails | null> {
    const { data, error } = await this.supabase
      .from('tickets')
      .select(`
        *,
        ticket_type:ticket_types!ticket_type_id(
          id,
          name,
          price
        ),
        event:events!event_id(
          id,
          title,
          start_date,
          end_date,
          venue_name,
          venue_address,
          organizer:profiles!organizer_id(
            id,
            username,
            full_name
          )
        ),
        owner:profiles!owner_id(
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('unique_qr_code', qrCode)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(`Failed to fetch ticket by QR code: ${error.message}`)
    }

    return data
  }

  /**
   * Validate and mark ticket as used
   */
  async validateTicket(qrCode: string, validatorId: string): Promise<{
    success: boolean
    ticket?: TicketWithDetails
    message: string
  }> {
    const ticket = await this.getTicketByQRCode(qrCode)

    if (!ticket) {
      return {
        success: false,
        message: 'Ticket not found'
      }
    }

    if (ticket.is_used) {
      return {
        success: false,
        ticket,
        message: 'Ticket has already been used'
      }
    }

    // Check if event is today or in the past
    const eventDate = new Date(ticket.event.start_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (eventDate > today) {
      return {
        success: false,
        ticket,
        message: 'Event has not started yet'
      }
    }

    // Mark ticket as used
    const { error } = await this.supabase
      .from('tickets')
      .update({ is_used: true })
      .eq('id', ticket.id)

    if (error) {
      return {
        success: false,
        ticket,
        message: 'Failed to validate ticket'
      }
    }

    return {
      success: true,
      ticket: { ...ticket, is_used: true },
      message: 'Ticket validated successfully'
    }
  }

  /**
   * Get user's tickets
   */
  async getUserTickets(userId: string, limit: number = 20): Promise<TicketWithDetails[]> {
    const { data, error } = await this.supabase
      .from('tickets')
      .select(`
        *,
        ticket_type:ticket_types!ticket_type_id(
          id,
          name,
          price
        ),
        event:events!event_id(
          id,
          title,
          start_date,
          venue_name,
          image_url
        ),
        order:orders!order_id(
          id,
          status,
          created_at
        )
      `)
      .eq('owner_id', userId)
      .order('purchased_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Failed to fetch user tickets: ${error.message}`)
    }

    return data || []
  }

  /**
   * Get tickets for an event (for organizers)
   */
  async getEventTickets(eventId: string, organizerId: string): Promise<TicketWithDetails[]> {
    // First verify organizer owns the event
    const { data: event, error: eventError } = await this.supabase
      .from('events')
      .select('organizer_id')
      .eq('id', eventId)
      .eq('organizer_id', organizerId)
      .single()

    if (eventError || !event) {
      throw new Error('Event not found or access denied')
    }

    const { data, error } = await this.supabase
      .from('tickets')
      .select(`
        *,
        ticket_type:ticket_types!ticket_type_id(
          id,
          name,
          price
        ),
        owner:profiles!owner_id(
          id,
          username,
          full_name
        ),
        order:orders!order_id(
          id,
          status,
          total_amount
        )
      `)
      .eq('event_id', eventId)
      .order('purchased_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch event tickets: ${error.message}`)
    }

    return data || []
  }

  /**
   * Transfer ticket to another user
   */
  async transferTicket(
    ticketId: string, 
    currentOwnerId: string, 
    newOwnerId: string
  ): Promise<Ticket> {
    const { data, error } = await this.supabase
      .from('tickets')
      .update({ owner_id: newOwnerId })
      .eq('id', ticketId)
      .eq('owner_id', currentOwnerId)
      .eq('is_used', false)
      .select('*')
      .single()

    if (error) {
      throw new Error(`Failed to transfer ticket: ${error.message}`)
    }

    return data
  }

  /**
   * Get ticket statistics for an event
   */
  async getEventTicketStats(eventId: string): Promise<{
    totalTickets: number
    usedTickets: number
    availableTickets: number
    usageRate: number
  }> {
    const { data, error } = await this.supabase
      .from('tickets')
      .select('id, is_used')
      .eq('event_id', eventId)

    if (error) {
      throw new Error(`Failed to fetch ticket stats: ${error.message}`)
    }

    const tickets = data || []
    const usedTickets = tickets.filter(t => t.is_used).length
    const totalTickets = tickets.length

    return {
      totalTickets,
      usedTickets,
      availableTickets: totalTickets - usedTickets,
      usageRate: totalTickets > 0 ? (usedTickets / totalTickets) * 100 : 0
    }
  }

  /**
   * Generate unique QR code for ticket
   */
  private generateUniqueQRCode(): string {
    // Generate a unique code using nanoid
    // Format: NFT-{timestamp}-{nanoid}
    const timestamp = Date.now().toString(36)
    const uniqueId = nanoid(12)
    return `NFT-${timestamp}-${uniqueId}`
  }

  /**
   * Check if QR code is valid format
   */
  isValidQRCode(qrCode: string): boolean {
    const qrCodePattern = /^NFT-[a-z0-9]+-[A-Za-z0-9_-]{12}$/
    return qrCodePattern.test(qrCode)
  }

  /**
   * Get upcoming tickets for user (next 30 days)
   */
  async getUpcomingTickets(userId: string): Promise<TicketWithDetails[]> {
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    const { data, error } = await this.supabase
      .from('tickets')
      .select(`
        *,
        ticket_type:ticket_types!ticket_type_id(
          id,
          name,
          price
        ),
        event:events!event_id(
          id,
          title,
          start_date,
          venue_name,
          image_url
        )
      `)
      .eq('owner_id', userId)
      .eq('is_used', false)
      .gte('events.start_date', new Date().toISOString())
      .lte('events.start_date', thirtyDaysFromNow.toISOString())
      .order('events.start_date', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch upcoming tickets: ${error.message}`)
    }

    return data || []
  }
}

/**
 * Factory functions for different contexts
 */
export function createTicketsService(client: TypedSupabaseClient): TicketsService {
  return new TicketsService(client)
}

// Browser client helper
export function createBrowserTicketsService(): TicketsService {
  return new TicketsService(createBrowserClient())
}

// Server client helper  
export function createServerTicketsService(cookieStore: any): TicketsService {
  return new TicketsService(createServerClient(cookieStore))
}