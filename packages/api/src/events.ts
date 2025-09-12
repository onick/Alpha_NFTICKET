import { 
  createBrowserClient, 
  createServerClient, 
  type TypedSupabaseClient,
  type Event,
  type TicketType,
  type CreateEventInput,
  type CreateTicketTypeInput,
  type EventFilters,
  type UpcomingEventsResponse
} from '@nfticket/database'

/**
 * Events Service - CRUD operations for events
 */
export class EventsService {
  constructor(private supabase: TypedSupabaseClient) {}

  /**
   * List upcoming events with optional filters
   */
  async listUpcomingEvents(filters: EventFilters = {}): Promise<UpcomingEventsResponse> {
    const { limit = 10, category } = filters
    
    let query = this.supabase
      .from('events')
      .select(`
        *,
        organizer:profiles!organizer_id(
          id,
          username,
          full_name,
          avatar_url
        ),
        ticket_types(
          id,
          name,
          price,
          quantity_available
        )
      `)
      .gte('start_date', new Date().toISOString())
      .order('start_date', { ascending: true })
      .limit(limit)

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error, count } = await query

    if (error) {
      throw new Error(`Failed to fetch events: ${error.message}`)
    }

    return {
      data: data || [],
      total: count || 0,
      hasMore: (data?.length || 0) >= limit
    }
  }

  /**
   * Get event by ID with full details
   */
  async getEventById(id: string): Promise<Event | null> {
    const { data, error } = await this.supabase
      .from('events')
      .select(`
        *,
        organizer:profiles!organizer_id(
          id,
          username,
          full_name,
          avatar_url
        ),
        ticket_types(
          id,
          name,
          price,
          quantity_available
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(`Failed to fetch event: ${error.message}`)
    }

    return data
  }

  /**
   * Create a new event (organizer only)
   */
  async createEvent(input: CreateEventInput, organizerId: string): Promise<Event> {
    const { data, error } = await this.supabase
      .from('events')
      .insert({
        ...input,
        organizer_id: organizerId
      })
      .select(`
        *,
        organizer:profiles!organizer_id(
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .single()

    if (error) {
      throw new Error(`Failed to create event: ${error.message}`)
    }

    return data
  }

  /**
   * Update event (organizer only)
   */
  async updateEvent(id: string, input: Partial<CreateEventInput>, organizerId: string): Promise<Event> {
    const { data, error } = await this.supabase
      .from('events')
      .update(input)
      .eq('id', id)
      .eq('organizer_id', organizerId)
      .select(`
        *,
        organizer:profiles!organizer_id(
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .single()

    if (error) {
      throw new Error(`Failed to update event: ${error.message}`)
    }

    return data
  }

  /**
   * Delete event (organizer only)
   */
  async deleteEvent(id: string, organizerId: string): Promise<void> {
    const { error } = await this.supabase
      .from('events')
      .delete()
      .eq('id', id)
      .eq('organizer_id', organizerId)

    if (error) {
      throw new Error(`Failed to delete event: ${error.message}`)
    }
  }

  /**
   * List ticket types for an event
   */
  async listTicketTypes(eventId: string): Promise<TicketType[]> {
    const { data, error } = await this.supabase
      .from('ticket_types')
      .select('*')
      .eq('event_id', eventId)
      .order('price', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch ticket types: ${error.message}`)
    }

    return data || []
  }

  /**
   * Create ticket type for event (organizer only)
   */
  async createTicketType(input: CreateTicketTypeInput): Promise<TicketType> {
    // Verify organizer owns the event
    const event = await this.getEventById(input.event_id)
    if (!event) {
      throw new Error('Event not found')
    }

    const { data, error } = await this.supabase
      .from('ticket_types')
      .insert(input)
      .select('*')
      .single()

    if (error) {
      throw new Error(`Failed to create ticket type: ${error.message}`)
    }

    return data
  }

  /**
   * Get trending events (for homepage)
   */
  async getTrendingEvents(limit: number = 4): Promise<Event[]> {
    // Simple trending algorithm: upcoming events with most ticket sales
    const { data, error } = await this.supabase
      .from('events')
      .select(`
        *,
        organizer:profiles!organizer_id(
          id,
          username,
          full_name,
          avatar_url
        ),
        ticket_types(
          id,
          name,
          price,
          quantity_available
        ),
        tickets(count)
      `)
      .gte('start_date', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Failed to fetch trending events: ${error.message}`)
    }

    return data || []
  }

  /**
   * Search events by text
   */
  async searchEvents(query: string, limit: number = 10): Promise<Event[]> {
    const { data, error } = await this.supabase
      .from('events')
      .select(`
        *,
        organizer:profiles!organizer_id(
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,venue_name.ilike.%${query}%`)
      .gte('start_date', new Date().toISOString())
      .order('start_date', { ascending: true })
      .limit(limit)

    if (error) {
      throw new Error(`Failed to search events: ${error.message}`)
    }

    return data || []
  }
}

/**
 * Factory functions for different contexts
 */
export function createEventsService(client: TypedSupabaseClient): EventsService {
  return new EventsService(client)
}

// Browser client helper
export function createBrowserEventsService(): EventsService {
  return new EventsService(createBrowserClient())
}

// Server client helper  
export function createServerEventsService(cookieStore: any): EventsService {
  return new EventsService(createServerClient(cookieStore))
}