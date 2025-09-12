// Sistema de integración para conectar los flujos de Organizador y Comprador
// Maneja la persistencia de datos y la sincronización entre flujos

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  isOrganizer: boolean
  organizerStatus?: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

export interface Event {
  id: string
  organizerId: string
  name: string
  description: string
  detailedDescription?: string
  bannerImage?: string
  category: string
  tags: string[]
  eventType: 'physical' | 'online'
  venue?: string
  address?: string
  city?: string
  country?: string
  onlineLink?: string
  startDate: string
  startTime: string
  endDate?: string
  endTime?: string
  timezone: string
  ticketTypes: TicketType[]
  status: 'draft' | 'published' | 'paused' | 'ended'
  isPublic: boolean
  allowTransfers: boolean
  refundPolicy: string
  createdAt: string
  updatedAt: string
  // Analytics
  ticketsSold: number
  revenue: number
  views: number
}

export interface TicketType {
  id: string
  name: string
  description: string
  price: number
  quantity: number
  sold: number
  saleStartDate?: string
  saleEndDate?: string
}

export interface Purchase {
  id: string
  eventId: string
  userId: string
  tickets: PurchaseTicket[]
  userInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  total: number
  paymentMethod: string
  status: 'pending' | 'completed' | 'cancelled'
  shareOnFeed?: boolean
  createdAt: string
}

export interface PurchaseTicket {
  ticketTypeId: string
  quantity: number
  price: number
  ticketIds: string[] // Individual ticket IDs for QR codes
}

export interface CheckInRecord {
  ticketId: string
  eventId: string
  userId: string
  organizerId: string
  checkedInAt: string
  checkedInBy: string
}

class EcosystemManager {
  private static instance: EcosystemManager
  private users: Map<string, User> = new Map()
  private events: Map<string, Event> = new Map()
  private purchases: Map<string, Purchase> = new Map()
  private checkIns: Map<string, CheckInRecord> = new Map()

  private constructor() {
    this.loadFromStorage()
  }

  public static getInstance(): EcosystemManager {
    if (!EcosystemManager.instance) {
      EcosystemManager.instance = new EcosystemManager()
    }
    return EcosystemManager.instance
  }

  private loadFromStorage() {
    try {
      // Check if we're in browser environment
      if (typeof window === 'undefined') return

      // Load users
      const storedUsers = localStorage.getItem('nfticket_users')
      if (storedUsers) {
        const users = JSON.parse(storedUsers)
        users.forEach((user: User) => this.users.set(user.id, user))
      }

      // Load events
      const storedEvents = localStorage.getItem('nfticket_events')
      if (storedEvents) {
        const events = JSON.parse(storedEvents)
        events.forEach((event: Event) => this.events.set(event.id, event))
      }

      // Load purchases
      const storedPurchases = localStorage.getItem('nfticket_purchases')
      if (storedPurchases) {
        const purchases = JSON.parse(storedPurchases)
        purchases.forEach((purchase: Purchase) => this.purchases.set(purchase.id, purchase))
      }

      // Load check-ins
      const storedCheckIns = localStorage.getItem('nfticket_checkins')
      if (storedCheckIns) {
        const checkIns = JSON.parse(storedCheckIns)
        checkIns.forEach((checkIn: CheckInRecord) => this.checkIns.set(checkIn.ticketId, checkIn))
      }
    } catch (error) {
      console.error('Error loading ecosystem data:', error)
    }
  }

  private saveToStorage() {
    try {
      // Check if we're in browser environment
      if (typeof window === 'undefined') return

      localStorage.setItem('nfticket_users', JSON.stringify(Array.from(this.users.values())))
      localStorage.setItem('nfticket_events', JSON.stringify(Array.from(this.events.values())))
      localStorage.setItem('nfticket_purchases', JSON.stringify(Array.from(this.purchases.values())))
      localStorage.setItem('nfticket_checkins', JSON.stringify(Array.from(this.checkIns.values())))
    } catch (error) {
      console.error('Error saving ecosystem data:', error)
    }
  }

  // User Management
  public createUser(userData: Omit<User, 'id' | 'createdAt'>): User {
    const user: User = {
      ...userData,
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    }
    this.users.set(user.id, user)
    this.saveToStorage()
    return user
  }

  public updateUser(userId: string, updates: Partial<User>): User | null {
    const user = this.users.get(userId)
    if (!user) return null
    
    const updatedUser = { ...user, ...updates }
    this.users.set(userId, updatedUser)
    this.saveToStorage()
    return updatedUser
  }

  public getUserByEmail(email: string): User | null {
    return Array.from(this.users.values()).find(user => user.email === email) || null
  }

  public approveOrganizer(userId: string): boolean {
    const user = this.users.get(userId)
    if (!user) return false
    
    user.isOrganizer = true
    user.organizerStatus = 'approved'
    this.users.set(userId, user)
    this.saveToStorage()
    return true
  }

  // Event Management
  public createEvent(eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'ticketsSold' | 'revenue' | 'views'>): Event {
    const event: Event = {
      ...eventData,
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ticketTypes: eventData.ticketTypes.map(ticket => ({
        ...ticket,
        id: `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sold: 0
      })),
      ticketsSold: 0,
      revenue: 0,
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    this.events.set(event.id, event)
    this.saveToStorage()
    return event
  }

  public updateEvent(eventId: string, updates: Partial<Event>): Event | null {
    const event = this.events.get(eventId)
    if (!event) return null
    
    const updatedEvent = { 
      ...event, 
      ...updates, 
      updatedAt: new Date().toISOString() 
    }
    this.events.set(eventId, updatedEvent)
    this.saveToStorage()
    return updatedEvent
  }

  public getEvent(eventId: string): Event | null {
    return this.events.get(eventId) || null
  }

  public getPublishedEvents(): Event[] {
    return Array.from(this.events.values())
      .filter(event => event.status === 'published' && event.isPublic)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  public getEventsByOrganizer(organizerId: string): Event[] {
    return Array.from(this.events.values())
      .filter(event => event.organizerId === organizerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  public incrementEventViews(eventId: string): void {
    const event = this.events.get(eventId)
    if (event) {
      event.views += 1
      event.updatedAt = new Date().toISOString()
      this.events.set(eventId, event)
      this.saveToStorage()
    }
  }

  // Purchase Management
  public createPurchase(purchaseData: Omit<Purchase, 'id' | 'createdAt' | 'status'>): Purchase {
    const purchase: Purchase = {
      ...purchaseData,
      id: `purchase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'completed',
      createdAt: new Date().toISOString(),
      tickets: purchaseData.tickets.map(ticket => ({
        ...ticket,
        ticketIds: Array.from({ length: ticket.quantity }, () => 
          `TIK-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        )
      }))
    }

    // Update event statistics
    const event = this.events.get(purchase.eventId)
    if (event) {
      const totalTickets = purchase.tickets.reduce((sum, ticket) => sum + ticket.quantity, 0)
      event.ticketsSold += totalTickets
      event.revenue += purchase.total
      event.updatedAt = new Date().toISOString()
      
      // Update ticket type sold counts
      purchase.tickets.forEach(purchaseTicket => {
        const ticketType = event.ticketTypes.find(t => t.id === purchaseTicket.ticketTypeId)
        if (ticketType) {
          ticketType.sold += purchaseTicket.quantity
        }
      })
      
      this.events.set(event.id, event)
    }

    this.purchases.set(purchase.id, purchase)
    this.saveToStorage()
    return purchase
  }

  public getPurchasesByUser(userId: string): Purchase[] {
    return Array.from(this.purchases.values())
      .filter(purchase => purchase.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  public getPurchasesByEvent(eventId: string): Purchase[] {
    return Array.from(this.purchases.values())
      .filter(purchase => purchase.eventId === eventId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  public getTicketById(ticketId: string): { purchase: Purchase; ticket: PurchaseTicket; ticketIndex: number } | null {
    for (const purchase of Array.from(this.purchases.values())) {
      for (const ticket of purchase.tickets) {
        const ticketIndex = ticket.ticketIds.indexOf(ticketId)
        if (ticketIndex !== -1) {
          return { purchase, ticket, ticketIndex }
        }
      }
    }
    return null
  }

  // Check-in Management
  public checkInTicket(ticketId: string, organizerId: string): { success: boolean; message: string; attendee?: any } {
    // Check if ticket exists
    const ticketInfo = this.getTicketById(ticketId)
    if (!ticketInfo) {
      return { success: false, message: 'Ticket no válido o no encontrado' }
    }

    // Check if already checked in
    if (this.checkIns.has(ticketId)) {
      const checkIn = this.checkIns.get(ticketId)!
      const user = this.users.get(ticketInfo.purchase.userId)
      return { 
        success: false, 
        message: 'Este ticket ya fue utilizado',
        attendee: {
          name: `${user?.firstName} ${user?.lastName}`,
          email: user?.email,
          checkedInAt: checkIn.checkedInAt
        }
      }
    }

    // Verify organizer permissions
    const event = this.events.get(ticketInfo.purchase.eventId)
    if (!event || event.organizerId !== organizerId) {
      return { success: false, message: 'No tienes permisos para este evento' }
    }

    // Perform check-in
    const checkIn: CheckInRecord = {
      ticketId,
      eventId: ticketInfo.purchase.eventId,
      userId: ticketInfo.purchase.userId,
      organizerId,
      checkedInAt: new Date().toISOString(),
      checkedInBy: organizerId
    }

    this.checkIns.set(ticketId, checkIn)
    this.saveToStorage()

    const user = this.users.get(ticketInfo.purchase.userId)
    const ticketType = event.ticketTypes.find(t => t.id === ticketInfo.ticket.ticketTypeId)
    
    return {
      success: true,
      message: 'Check-in exitoso',
      attendee: {
        name: `${user?.firstName} ${user?.lastName}`,
        email: user?.email,
        ticketType: ticketType?.name,
        ticketId,
        checkedInAt: checkIn.checkedInAt
      }
    }
  }

  public getEventCheckIns(eventId: string): CheckInRecord[] {
    return Array.from(this.checkIns.values())
      .filter(checkIn => checkIn.eventId === eventId)
      .sort((a, b) => new Date(b.checkedInAt).getTime() - new Date(a.checkedInAt).getTime())
  }

  public getEventAttendees(eventId: string) {
    const purchases = this.getPurchasesByEvent(eventId)
    const checkIns = this.getEventCheckIns(eventId)
    const checkInMap = new Map(checkIns.map(c => [c.ticketId, c]))
    
    const attendees: any[] = []
    
    purchases.forEach(purchase => {
      const user = this.users.get(purchase.userId)
      purchase.tickets.forEach(ticket => {
        const event = this.events.get(eventId)
        const ticketType = event?.ticketTypes.find(t => t.id === ticket.ticketTypeId)
        
        ticket.ticketIds.forEach(ticketId => {
          const checkIn = checkInMap.get(ticketId)
          attendees.push({
            id: ticketId,
            name: `${user?.firstName} ${user?.lastName}`,
            email: user?.email,
            phone: purchase.userInfo.phone,
            ticketType: ticketType?.name,
            ticketId,
            purchaseDate: purchase.createdAt,
            checkedIn: !!checkIn,
            checkinTime: checkIn?.checkedInAt
          })
        })
      })
    })
    
    return attendees.sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())
  }

  // Analytics
  public getOrganizerStats(organizerId: string) {
    const events = this.getEventsByOrganizer(organizerId)
    const totalTicketsSold = events.reduce((sum, event) => sum + event.ticketsSold, 0)
    const totalRevenue = events.reduce((sum, event) => sum + event.revenue, 0)
    const totalViews = events.reduce((sum, event) => sum + event.views, 0)
    
    return {
      totalEvents: events.length,
      publishedEvents: events.filter(e => e.status === 'published').length,
      totalTicketsSold,
      totalRevenue,
      totalViews,
      events
    }
  }

  // Demo/Testing utilities
  public clearAllData() {
    this.users.clear()
    this.events.clear()
    this.purchases.clear()
    this.checkIns.clear()
    this.saveToStorage()
  }

  public seedDemoData() {
    // Create demo organizer
    const demoOrganizer = this.createUser({
      email: 'organizador@demo.com',
      firstName: 'Demo',
      lastName: 'Organizador',
      isOrganizer: true,
      organizerStatus: 'approved'
    })

    // Create demo buyer
    const demoBuyer = this.createUser({
      email: 'comprador@demo.com',
      firstName: 'Demo',
      lastName: 'Comprador',
      isOrganizer: false
    })

    console.log('Demo data seeded:', { demoOrganizer, demoBuyer })
  }
}

// Simple client-side getter - no Proxy, no complexity
export const getEcosystemManager = (): EcosystemManager | null => {
  if (typeof window === 'undefined') {
    return null
  }
  return EcosystemManager.getInstance()
}