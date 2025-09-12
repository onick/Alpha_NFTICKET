// Ticket PDF generation utility
// This is a mock implementation - in production you'd use libraries like:
// - jsPDF for PDF generation
// - qrcode for QR code generation
// - html2canvas for rendering complex layouts

export interface TicketData {
  orderId: string
  eventName: string
  eventDate: string
  eventTime: string
  eventLocation: string
  customerName: string
  customerEmail: string
  ticketType: string
  ticketPrice: number
  seatNumber?: string
  qrCode: string
}

export interface PurchaseTickets {
  event: {
    name: string
    date: string
    time: string
    location: string
    address: string
  }
  user: {
    firstName: string
    lastName: string
    email: string
  }
  tickets: {
    ticketId: number
    quantity: number
  }[]
  orderId: string
  purchaseDate: string
}

const ticketTypes = [
  { id: 1, name: 'General', price: 75 },
  { id: 2, name: 'Preferencial', price: 150 },
  { id: 3, name: 'VIP', price: 350 },
  { id: 4, name: 'Palco', price: 750 }
]

export class TicketGenerator {
  private generateQRCode(data: string): string {
    // Mock QR code generation
    // In real implementation, this would generate actual QR code
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`
  }

  private generateTicketId(): string {
    return `TIK-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  }

  public async generateTickets(purchaseData: PurchaseTickets): Promise<TicketData[]> {
    const tickets: TicketData[] = []

    for (const ticketPurchase of purchaseData.tickets) {
      const ticketType = ticketTypes.find(t => t.id === ticketPurchase.ticketId)
      if (!ticketType) continue

      for (let i = 0; i < ticketPurchase.quantity; i++) {
        const ticketId = this.generateTicketId()
        const qrData = JSON.stringify({
          ticketId,
          orderId: purchaseData.orderId,
          eventName: purchaseData.event.name,
          customerEmail: purchaseData.user.email,
          validUntil: purchaseData.event.date
        })

        tickets.push({
          orderId: purchaseData.orderId,
          eventName: purchaseData.event.name,
          eventDate: purchaseData.event.date,
          eventTime: purchaseData.event.time,
          eventLocation: purchaseData.event.location,
          customerName: `${purchaseData.user.firstName} ${purchaseData.user.lastName}`,
          customerEmail: purchaseData.user.email,
          ticketType: ticketType.name,
          ticketPrice: ticketType.price,
          qrCode: this.generateQRCode(qrData)
        })
      }
    }

    return tickets
  }

  public async generatePDF(tickets: TicketData[]): Promise<Blob> {
    // Mock PDF generation
    // In real implementation, this would use jsPDF or similar
    
    // Create a simple HTML representation that could be converted to PDF
    const htmlContent = this.generateTicketHTML(tickets)
    
    // Convert to blob (mock)
    const blob = new Blob([htmlContent], { type: 'application/pdf' })
    return blob
  }

  private generateTicketHTML(tickets: TicketData[]): string {
    const ticketCards = tickets.map((ticket, index) => `
      <div style="
        width: 8.5in; 
        height: 3.5in; 
        border: 2px solid #3B82F6; 
        border-radius: 12px; 
        padding: 20px; 
        margin-bottom: 20px; 
        background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%);
        color: white;
        font-family: 'Arial', sans-serif;
        display: flex;
        page-break-inside: avoid;
      ">
        <div style="flex: 2; padding-right: 20px;">
          <div style="display: flex; align-items: center; margin-bottom: 15px;">
            <div style="
              background: #3B82F6; 
              color: white; 
              padding: 4px 12px; 
              border-radius: 20px; 
              font-size: 12px; 
              font-weight: bold;
            ">
              ${ticket.ticketType}
            </div>
          </div>
          
          <h1 style="font-size: 24px; font-weight: bold; margin: 0 0 10px 0; line-height: 1.2;">
            ${ticket.eventName}
          </h1>
          
          <div style="display: flex; gap: 30px; margin-bottom: 15px; font-size: 14px;">
            <div>
              <div style="color: #94A3B8; font-size: 12px;">FECHA</div>
              <div style="font-weight: 600;">${ticket.eventDate}</div>
            </div>
            <div>
              <div style="color: #94A3B8; font-size: 12px;">HORA</div>
              <div style="font-weight: 600;">${ticket.eventTime}</div>
            </div>
          </div>
          
          <div style="margin-bottom: 15px;">
            <div style="color: #94A3B8; font-size: 12px;">UBICACIÓN</div>
            <div style="font-weight: 600; font-size: 14px;">${ticket.eventLocation}</div>
          </div>
          
          <div style="display: flex; gap: 30px; font-size: 12px; color: #94A3B8;">
            <div>
              <span>Cliente: </span>
              <span style="color: white;">${ticket.customerName}</span>
            </div>
            <div>
              <span>Orden: </span>
              <span style="color: white;">${ticket.orderId}</span>
            </div>
          </div>
          
          <div style="margin-top: 10px; font-size: 18px; font-weight: bold; color: #10B981;">
            RD$${ticket.ticketPrice.toLocaleString()}
          </div>
        </div>
        
        <div style="
          flex: 0 0 150px; 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          justify-content: center;
          border-left: 2px dashed #475569;
          padding-left: 20px;
        ">
          <img src="${ticket.qrCode}" alt="QR Code" style="width: 120px; height: 120px; margin-bottom: 10px;" />
          <div style="font-size: 10px; text-align: center; color: #94A3B8;">
            Escanea para validar
          </div>
          <div style="font-size: 8px; text-align: center; color: #64748B; margin-top: 5px;">
            Ticket #${index + 1}
          </div>
        </div>
      </div>
    `).join('')

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>NFTicket - Entradas</title>
        <style>
          @page { 
            size: A4; 
            margin: 0.5in; 
          }
          body { 
            margin: 0; 
            padding: 0; 
            font-family: Arial, sans-serif; 
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid #E5E7EB;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #E5E7EB;
            font-size: 12px;
            color: #6B7280;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="color: #3B82F6; margin: 0; font-size: 32px;">🎫 NFTicket</h1>
          <p style="margin: 5px 0 0 0; color: #6B7280;">Tus tickets con tecnología blockchain</p>
        </div>
        
        ${ticketCards}
        
        <div class="footer">
          <p><strong>Instrucciones importantes:</strong></p>
          <p>• Presenta este ticket y una identificación válida en la entrada</p>
          <p>• Llega 30 minutos antes del inicio del evento</p>
          <p>• Los tickets son no reembolsables pero transferibles</p>
          <p>• Para soporte: soporte@nfticket.com | WhatsApp: +1 (809) 123-4567</p>
        </div>
      </body>
      </html>
    `
  }

  public async downloadTickets(purchaseData: PurchaseTickets): Promise<void> {
    try {
      const tickets = await this.generateTickets(purchaseData)
      const pdfBlob = await this.generatePDF(tickets)
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `tickets-${purchaseData.orderId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error generating tickets:', error)
      throw new Error('Error al generar los tickets. Inténtalo de nuevo.')
    }
  }
}

export const ticketGenerator = new TicketGenerator()