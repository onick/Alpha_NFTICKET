// Email Service - Sistema de envío de emails para confirmaciones y comunicaciones
// En producción se integraría con SendGrid, Mailgun, o similar

export interface EmailTemplate {
  subject: string
  htmlBody: string
  textBody: string
}

export interface PurchaseEmailData {
  customerName: string
  customerEmail: string
  eventName: string
  eventDate: string
  eventTime: string
  eventLocation: string
  orderId: string
  tickets: Array<{
    type: string
    quantity: number
    price: number
  }>
  total: number
  qrCodes: string[]
}

export interface EventUpdateEmailData {
  eventName: string
  organizerName: string
  updateMessage: string
  eventDate: string
  eventLocation: string
  attendeeEmails: string[]
}

class EmailService {
  private static instance: EmailService

  private constructor() {}

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService()
    }
    return EmailService.instance
  }

  // Purchase confirmation email template
  public generatePurchaseConfirmationEmail(data: PurchaseEmailData): EmailTemplate {
    const subject = `✅ Confirmación de compra - ${data.eventName}`
    
    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Confirmación de Compra - NFTicket</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .ticket-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3B82F6; }
          .total { background: #3B82F6; color: white; padding: 15px; text-align: center; border-radius: 8px; font-size: 18px; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .qr-section { text-align: center; margin: 20px 0; padding: 20px; background: white; border-radius: 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎫 ¡Compra Confirmada!</h1>
            <p>Gracias por elegir NFTicket para tu experiencia</p>
          </div>
          
          <div class="content">
            <h2>Hola ${data.customerName},</h2>
            
            <p>¡Excelente noticia! Tu compra ha sido procesada exitosamente. Aquí tienes todos los detalles:</p>
            
            <div class="ticket-info">
              <h3>📅 Detalles del Evento</h3>
              <p><strong>Evento:</strong> ${data.eventName}</p>
              <p><strong>Fecha:</strong> ${data.eventDate}</p>
              <p><strong>Hora:</strong> ${data.eventTime}</p>
              <p><strong>Ubicación:</strong> ${data.eventLocation}</p>
            </div>
            
            <div class="ticket-info">
              <h3>🎟️ Tus Tickets</h3>
              ${data.tickets.map(ticket => `
                <p><strong>${ticket.type}</strong> - Cantidad: ${ticket.quantity} - RD$${ticket.price.toLocaleString()} c/u</p>
              `).join('')}
            </div>
            
            <div class="total">
              Total Pagado: RD$${data.total.toLocaleString()}
            </div>
            
            <div class="qr-section">
              <h3>📱 Tus Códigos QR</h3>
              <p>Presenta estos códigos en la entrada del evento:</p>
              ${data.qrCodes.map((qr, index) => `
                <div style="margin: 10px 0;">
                  <p><strong>Ticket ${index + 1}</strong></p>
                  <img src="${qr}" alt="QR Code ${index + 1}" style="width: 150px; height: 150px;" />
                </div>
              `).join('')}
            </div>
            
            <div class="ticket-info">
              <h3>📋 Información Importante</h3>
              <ul>
                <li>Llega 30 minutos antes del evento</li>
                <li>Trae una identificación válida</li>
                <li>Los tickets son transferibles desde tu perfil</li>
                <li>Guarda este email como respaldo</li>
              </ul>
            </div>
            
            <div class="ticket-info">
              <h3>🔗 Enlaces Útiles</h3>
              <p><a href="${typeof window !== 'undefined' ? window.location.origin : 'https://nfticket.com'}/perfil/tickets">Ver Mis Tickets</a></p>
              <p><a href="${typeof window !== 'undefined' ? window.location.origin : 'https://nfticket.com'}/evento/${data.eventName.toLowerCase().replace(/\s+/g, '-')}">Página del Evento</a></p>
            </div>
          </div>
          
          <div class="footer">
            <p>¿Tienes preguntas? Contáctanos en <strong>soporte@nfticket.com</strong></p>
            <p>Order ID: ${data.orderId}</p>
            <p>© 2024 NFTicket. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `
    
    const textBody = `
      🎫 ¡COMPRA CONFIRMADA! - NFTicket
      
      Hola ${data.customerName},
      
      ¡Tu compra ha sido procesada exitosamente!
      
      DETALLES DEL EVENTO:
      📅 Evento: ${data.eventName}
      📅 Fecha: ${data.eventDate} a las ${data.eventTime}
      📍 Ubicación: ${data.eventLocation}
      
      TUS TICKETS:
      ${data.tickets.map(ticket => `🎟️ ${ticket.type} - Cantidad: ${ticket.quantity} - RD$${ticket.price.toLocaleString()} c/u`).join('\n')}
      
      💰 TOTAL PAGADO: RD$${data.total.toLocaleString()}
      
      INFORMACIÓN IMPORTANTE:
      • Llega 30 minutos antes del evento
      • Trae una identificación válida
      • Los tickets son transferibles desde tu perfil
      • Presenta los códigos QR en la entrada
      
      Enlaces útiles:
      • Mis Tickets: ${typeof window !== 'undefined' ? window.location.origin : 'https://nfticket.com'}/perfil/tickets
      • Evento: ${typeof window !== 'undefined' ? window.location.origin : 'https://nfticket.com'}/evento/${data.eventName.toLowerCase().replace(/\s+/g, '-')}
      
      ¿Preguntas? Escríbenos a soporte@nfticket.com
      Order ID: ${data.orderId}
      
      © 2024 NFTicket
    `
    
    return { subject, htmlBody, textBody }
  }

  // Event update email template
  public generateEventUpdateEmail(data: EventUpdateEmailData): EmailTemplate {
    const subject = `📢 Actualización importante - ${data.eventName}`
    
    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Actualización del Evento - NFTicket</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #F59E0B, #EF4444); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .alert { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0; }
          .event-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📢 Actualización del Evento</h1>
            <p>Información importante sobre tu evento</p>
          </div>
          
          <div class="content">
            <div class="alert">
              <p><strong>Mensaje del organizador ${data.organizerName}:</strong></p>
              <p>${data.updateMessage}</p>
            </div>
            
            <div class="event-info">
              <h3>📅 Detalles del Evento</h3>
              <p><strong>Evento:</strong> ${data.eventName}</p>
              <p><strong>Fecha:</strong> ${data.eventDate}</p>
              <p><strong>Ubicación:</strong> ${data.eventLocation}</p>
            </div>
            
            <p>Si tienes preguntas adicionales, puedes contactar directamente al organizador o a nuestro equipo de soporte.</p>
          </div>
          
          <div class="footer">
            <p>📧 <strong>soporte@nfticket.com</strong> | 📱 <strong>+1 (809) 123-4567</strong></p>
            <p>© 2024 NFTicket. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `
    
    const textBody = `
      📢 ACTUALIZACIÓN DEL EVENTO - NFTicket
      
      Mensaje del organizador ${data.organizerName}:
      ${data.updateMessage}
      
      DETALLES DEL EVENTO:
      📅 Evento: ${data.eventName}
      📅 Fecha: ${data.eventDate}
      📍 Ubicación: ${data.eventLocation}
      
      Si tienes preguntas, contáctanos:
      📧 soporte@nfticket.com
      📱 +1 (809) 123-4567
      
      © 2024 NFTicket
    `
    
    return { subject, htmlBody, textBody }
  }

  // Send email (mock implementation)
  public async sendEmail(to: string | string[], template: EmailTemplate): Promise<boolean> {
    try {
      // En producción, aquí se integraría con el servicio de email real
      console.log('📧 ENVIANDO EMAIL:')
      console.log('Para:', Array.isArray(to) ? to.join(', ') : to)
      console.log('Asunto:', template.subject)
      console.log('Contenido HTML:', template.htmlBody.length, 'caracteres')
      
      // Simular delay de envío
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Simular éxito del 95% del tiempo
      if (Math.random() > 0.05) {
        console.log('✅ Email enviado exitosamente')
        return true
      } else {
        console.log('❌ Error simulado en envío de email')
        return false
      }
      
    } catch (error) {
      console.error('Error enviando email:', error)
      return false
    }
  }

  // Send purchase confirmation email
  public async sendPurchaseConfirmation(data: PurchaseEmailData): Promise<boolean> {
    const template = this.generatePurchaseConfirmationEmail(data)
    return await this.sendEmail(data.customerEmail, template)
  }

  // Send event update to all attendees
  public async sendEventUpdate(data: EventUpdateEmailData): Promise<{ sent: number; failed: number }> {
    const template = this.generateEventUpdateEmail(data)
    let sent = 0
    let failed = 0
    
    // Enviar emails en lotes para evitar saturar el servicio
    const batchSize = 10
    for (let i = 0; i < data.attendeeEmails.length; i += batchSize) {
      const batch = data.attendeeEmails.slice(i, i + batchSize)
      
      const results = await Promise.all(
        batch.map(email => this.sendEmail(email, template))
      )
      
      results.forEach(success => {
        if (success) sent++
        else failed++
      })
      
      // Pausa entre lotes
      if (i + batchSize < data.attendeeEmails.length) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
    
    return { sent, failed }
  }

  // Preview email template (for testing)
  public previewEmail(template: EmailTemplate): void {
    const previewWindow = window.open('', '_blank')
    if (previewWindow) {
      previewWindow.document.write(template.htmlBody)
      previewWindow.document.close()
    }
  }

  // Integration helpers for production
  public async setupSendGrid(apiKey: string): Promise<void> {
    // Configuración para SendGrid
    console.log('🔧 Configurando SendGrid... (API Key configurada)')
  }

  public async setupMailgun(domain: string, apiKey: string): Promise<void> {
    // Configuración para Mailgun
    console.log('🔧 Configurando Mailgun... (Dominio y API Key configurados)')
  }
}

export const emailService = EmailService.getInstance()

// Utility function para generar QR codes para emails
export function generateEmailQRCode(ticketId: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(ticketId)}&bgcolor=ffffff&color=000000`
}