import { 
  createBrowserClient, 
  createServerClient, 
  type TypedSupabaseClient,
  type Order,
  type CreateOrderInput,
  type OrderWithDetails 
} from '@nfticket/database'

/**
 * Orders Service - Order management and Stripe integration
 */
export class OrdersService {
  constructor(private supabase: TypedSupabaseClient) {}

  /**
   * Create a pending order for Stripe checkout
   */
  async createPendingOrder(input: CreateOrderInput): Promise<Order> {
    const { data, error } = await this.supabase
      .from('orders')
      .insert({
        ...input,
        status: 'pending'
      })
      .select('*')
      .single()

    if (error) {
      throw new Error(`Failed to create order: ${error.message}`)
    }

    return data
  }

  /**
   * Get order by ID with full details
   */
  async getOrderById(id: string): Promise<OrderWithDetails | null> {
    const { data, error } = await this.supabase
      .from('orders')
      .select(`
        *,
        buyer:profiles!buyer_id(
          id,
          username,
          full_name,
          avatar_url
        ),
        event:events!event_id(
          id,
          title,
          start_date,
          venue_name,
          organizer:profiles!organizer_id(
            id,
            username,
            full_name
          )
        ),
        tickets(
          id,
          ticket_type_id,
          unique_qr_code,
          is_used,
          ticket_type:ticket_types!ticket_type_id(
            id,
            name,
            price
          )
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(`Failed to fetch order: ${error.message}`)
    }

    return data
  }

  /**
   * Mark order as paid after successful Stripe payment
   */
  async markOrderPaid(
    orderId: string, 
    paymentProvider: string,
    providerSessionId: string
  ): Promise<Order> {
    const { data, error } = await this.supabase
      .from('orders')
      .update({
        status: 'paid',
        payment_provider: paymentProvider,
        provider_session_id: providerSessionId
      })
      .eq('id', orderId)
      .select('*')
      .single()

    if (error) {
      throw new Error(`Failed to mark order as paid: ${error.message}`)
    }

    return data
  }

  /**
   * Mark order as failed
   */
  async failOrder(orderId: string, reason?: string): Promise<Order> {
    const { data, error } = await this.supabase
      .from('orders')
      .update({
        status: 'failed'
      })
      .eq('id', orderId)
      .select('*')
      .single()

    if (error) {
      throw new Error(`Failed to mark order as failed: ${error.message}`)
    }

    return data
  }

  /**
   * Process refund for order
   */
  async refundOrder(orderId: string): Promise<Order> {
    const { data, error } = await this.supabase
      .from('orders')
      .update({
        status: 'refunded'
      })
      .eq('id', orderId)
      .select('*')
      .single()

    if (error) {
      throw new Error(`Failed to refund order: ${error.message}`)
    }

    return data
  }

  /**
   * Get user's order history
   */
  async getUserOrders(userId: string, limit: number = 10): Promise<OrderWithDetails[]> {
    const { data, error } = await this.supabase
      .from('orders')
      .select(`
        *,
        event:events!event_id(
          id,
          title,
          start_date,
          venue_name,
          image_url
        ),
        tickets(count)
      `)
      .eq('buyer_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Failed to fetch user orders: ${error.message}`)
    }

    return data || []
  }

  /**
   * Get organizer's sales data
   */
  async getOrganizerSales(organizerId: string, limit: number = 50): Promise<OrderWithDetails[]> {
    const { data, error } = await this.supabase
      .from('orders')
      .select(`
        *,
        buyer:profiles!buyer_id(
          id,
          username,
          full_name
        ),
        event:events!event_id(
          id,
          title,
          start_date
        ),
        tickets(count)
      `)
      .eq('events.organizer_id', organizerId)
      .eq('status', 'paid')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Failed to fetch organizer sales: ${error.message}`)
    }

    return data || []
  }

  /**
   * Get order statistics for an event
   */
  async getEventOrderStats(eventId: string): Promise<{
    totalOrders: number
    paidOrders: number
    pendingOrders: number
    totalRevenue: number
    ticketsSold: number
  }> {
    const { data, error } = await this.supabase
      .from('orders')
      .select(`
        id,
        status,
        total_amount,
        tickets(count)
      `)
      .eq('event_id', eventId)

    if (error) {
      throw new Error(`Failed to fetch event order stats: ${error.message}`)
    }

    const orders = data || []
    const stats = {
      totalOrders: orders.length,
      paidOrders: orders.filter(o => o.status === 'paid').length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      totalRevenue: orders
        .filter(o => o.status === 'paid')
        .reduce((sum, o) => sum + o.total_amount, 0),
      ticketsSold: orders
        .filter(o => o.status === 'paid')
        .reduce((sum, o) => sum + (o.tickets as any)?.[0]?.count || 0, 0)
    }

    return stats
  }

  /**
   * Check if user has valid tickets for event
   */
  async hasValidTickets(userId: string, eventId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('orders')
      .select(`
        id,
        tickets(
          id,
          is_used
        )
      `)
      .eq('buyer_id', userId)
      .eq('event_id', eventId)
      .eq('status', 'paid')

    if (error) {
      throw new Error(`Failed to check user tickets: ${error.message}`)
    }

    const orders = data || []
    return orders.some(order => 
      (order.tickets as any)?.some((ticket: any) => !ticket.is_used)
    )
  }
}

/**
 * Factory functions for different contexts
 */
export function createOrdersService(client: TypedSupabaseClient): OrdersService {
  return new OrdersService(client)
}

// Browser client helper
export function createBrowserOrdersService(): OrdersService {
  return new OrdersService(createBrowserClient())
}

// Server client helper  
export function createServerOrdersService(cookieStore: any): OrdersService {
  return new OrdersService(createServerClient(cookieStore))
}