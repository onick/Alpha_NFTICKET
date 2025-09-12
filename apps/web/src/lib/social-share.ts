// Social media sharing utilities for purchase posts

interface PurchaseShareData {
  event: {
    name: string
    date: string
    time: string
    location: string
    image: string
  }
  tickets: {
    ticketId: number
    quantity: number
  }[]
  user: {
    firstName: string
    lastName: string
    email: string
  }
  total: number
  orderId: string
}

interface SocialFeedPost {
  author_id: string
  type: 'purchase'
  text: string
  visibility: 'public'
  hashtags: string[]
  event_name: string
  ticket_type: string
  ticket_price: number
  event_date: string
  event_location: string
}

const ticketTypes = [
  { id: 1, name: 'General', price: 75 },
  { id: 2, name: 'Preferencial', price: 150 },
  { id: 3, name: 'VIP', price: 350 },
  { id: 4, name: 'Palco', price: 750 }
]

export class SocialShareService {
  private generatePurchasePost(purchaseData: PurchaseShareData): SocialFeedPost {
    // Get the primary ticket type (most expensive one purchased)
    const primaryTicket = purchaseData.tickets.reduce((prev, current) => {
      const prevType = ticketTypes.find(t => t.id === prev.ticketId)
      const currentType = ticketTypes.find(t => t.id === current.ticketId)
      return (currentType?.price || 0) > (prevType?.price || 0) ? current : prev
    })

    const ticketType = ticketTypes.find(t => t.id === primaryTicket.ticketId)
    const totalTickets = purchaseData.tickets.reduce((sum, ticket) => sum + ticket.quantity, 0)

    // Generate engaging text based on ticket type and event
    const texts = [
      `¡Acabo de conseguir mis tickets para ${purchaseData.event.name}! 🎫✨`,
      `¡No puedo esperar! Ya tengo mis entradas para ${purchaseData.event.name} 🔥`,
      `¡Oficialmente confirmado para ${purchaseData.event.name}! 🎉`,
      `¡Ya está! Tickets asegurados para ${purchaseData.event.name} 🚀`
    ]

    const randomText = texts[Math.floor(Math.random() * texts.length)]
    
    const ticketInfo = totalTickets > 1 
      ? `${totalTickets} tickets ${ticketType?.name}`
      : `ticket ${ticketType?.name}`

    const finalText = `${randomText} ${ticketInfo} - ¡Nos vemos ahí! 🎵`

    // Generate relevant hashtags
    const hashtags = [
      'NFTicket',
      'LiveMusic',
      'Concert',
      purchaseData.event.name.split(' ')[0], // First word of event name
      ticketType?.name || 'General'
    ].filter(tag => tag.length > 2) // Filter out very short tags

    return {
      author_id: purchaseData.user.email, // Mock user ID from email
      type: 'purchase',
      text: finalText,
      visibility: 'public',
      hashtags,
      event_name: purchaseData.event.name,
      ticket_type: ticketType?.name || 'General',
      ticket_price: purchaseData.total,
      event_date: purchaseData.event.date,
      event_location: purchaseData.event.location
    }
  }

  public async shareToFeed(purchaseData: PurchaseShareData): Promise<boolean> {
    try {
      const post = this.generatePurchasePost(purchaseData)
      
      // In a real implementation, this would make an API call to create the post
      const response = await fetch('/api/feed/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(post)
      })

      if (!response.ok) {
        throw new Error('Failed to share to feed')
      }

      return true
    } catch (error) {
      console.error('Error sharing to feed:', error)
      
      // For demo purposes, simulate successful sharing
      console.log('Demo: Purchase would be shared to feed:', {
        text: this.generatePurchasePost(purchaseData).text,
        event: purchaseData.event.name,
        tickets: purchaseData.tickets.length
      })
      
      return true
    }
  }

  public generateShareText(purchaseData: PurchaseShareData): string {
    const post = this.generatePurchasePost(purchaseData)
    return post.text
  }

  public generateHashtags(purchaseData: PurchaseShareData): string[] {
    const post = this.generatePurchasePost(purchaseData)
    return post.hashtags
  }
}

export const socialShareService = new SocialShareService()

// Helper function to create a purchase share from localStorage data
export function createPurchaseShareFromCheckout(): PurchaseShareData | null {
  try {
    const checkoutData = localStorage.getItem('lastPurchase')
    if (!checkoutData) return null

    const data = JSON.parse(checkoutData)
    return {
      event: data.event,
      tickets: data.tickets,
      user: data.user,
      total: data.total,
      orderId: data.orderId
    }
  } catch (error) {
    console.error('Error creating purchase share data:', error)
    return null
  }
}