interface TicketData {
  id: string
  eventName: string
  eventDate: string
  venue: string
  ticketType: string
  price: number
  qrCode: string
  status: 'active' | 'used'
  userName?: string
}

export function generateTicketCanvas(ticket: TicketData, userName: string): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  
  // Set canvas size
  canvas.width = 800
  canvas.height = 400
  
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
  gradient.addColorStop(0, '#8B5CF6')  // purple-500
  gradient.addColorStop(1, '#6366F1')  // indigo-500
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  
  // Add some texture with overlay
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  
  // NFTicket branding
  ctx.fillStyle = 'white'
  ctx.font = 'bold 28px Arial'
  ctx.fillText('NFTicket', 40, 50)
  
  // Ticket status badge
  if (ticket.status === 'active') {
    ctx.fillStyle = '#10B981'  // green-500
  } else {
    ctx.fillStyle = '#6B7280'  // gray-500
  }
  ctx.fillRect(650, 20, 120, 30)
  ctx.fillStyle = 'white'
  ctx.font = 'bold 14px Arial'
  ctx.fillText(ticket.status === 'active' ? 'ACTIVO' : 'USADO', 670, 40)
  
  // Event name
  ctx.fillStyle = 'white'
  ctx.font = 'bold 36px Arial'
  ctx.fillText(ticket.eventName, 40, 120)
  
  // Event details
  ctx.font = '18px Arial'
  ctx.fillText(`📅 ${ticket.eventDate}`, 40, 160)
  ctx.fillText(`📍 ${ticket.venue}`, 40, 190)
  ctx.fillText(`🎫 ${ticket.ticketType}`, 40, 220)
  ctx.fillText(`💰 RD$${ticket.price.toLocaleString()}`, 40, 250)
  ctx.fillText(`👤 ${userName}`, 40, 280)
  
  // QR Code placeholder (would be actual QR in production)
  ctx.fillStyle = 'white'
  ctx.fillRect(600, 120, 160, 160)
  ctx.fillStyle = '#1F2937'
  ctx.font = '14px monospace'
  ctx.textAlign = 'center'
  ctx.fillText('QR CODE', 680, 190)
  ctx.fillText(`#${ticket.qrCode}`, 680, 210)
  ctx.textAlign = 'left'
  
  // Bottom border
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
  ctx.fillRect(0, canvas.height - 60, canvas.width, 60)
  
  // Footer text
  ctx.fillStyle = 'white'
  ctx.font = '16px Arial'
  ctx.fillText('🌟 Ticket NFT verificado en blockchain', 40, canvas.height - 30)
  ctx.fillText(`Ticket ID: ${ticket.id}`, 40, canvas.height - 10)
  
  return canvas
}

export function downloadTicketAsImage(ticket: TicketData, userName: string) {
  const canvas = generateTicketCanvas(ticket, userName)
  
  // Convert to blob and download
  canvas.toBlob((blob) => {
    if (blob) {
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `ticket-${ticket.eventName.replace(/\s+/g, '-').toLowerCase()}-${ticket.id}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }, 'image/png', 1.0)
}

export async function downloadTicketAsPDF(ticket: TicketData, userName: string) {
  // Dynamically import jsPDF to avoid SSR issues
  const { jsPDF } = await import('jspdf')
  
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  })

  // Set colors
  const primaryColor = [139, 92, 246] // purple-500
  const secondaryColor = [99, 102, 241] // indigo-500
  const textColor = [31, 41, 55] // gray-900
  const lightGray = [156, 163, 175] // gray-400

  // Page dimensions
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  
  // Create gradient background (simulated with rectangles)
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.rect(0, 0, pageWidth, pageHeight, 'F')
  
  // Add lighter overlay
  doc.setFillColor(255, 255, 255)
  doc.setGlobalAlpha(0.1)
  doc.rect(0, 0, pageWidth, pageHeight, 'F')
  doc.setGlobalAlpha(1)
  
  // NFTicket Header
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('NFTicket', 20, 25)
  
  // Status badge
  const statusColor = ticket.status === 'active' ? [16, 185, 129] : [107, 114, 128] // green-500 or gray-500
  doc.setFillColor(statusColor[0], statusColor[1], statusColor[2])
  doc.roundedRect(pageWidth - 80, 15, 60, 12, 3, 3, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(10)
  doc.text(ticket.status === 'active' ? 'ACTIVO' : 'USADO', pageWidth - 65, 23)
  
  // Main content box
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(20, 40, pageWidth - 40, pageHeight - 80, 5, 5, 'F')
  
  // Event Name (Large title)
  doc.setTextColor(textColor[0], textColor[1], textColor[2])
  doc.setFontSize(28)
  doc.setFont('helvetica', 'bold')
  doc.text(ticket.eventName, 30, 60)
  
  // Event Details Section
  doc.setFontSize(14)
  doc.setFont('helvetica', 'normal')
  let yPos = 80
  
  // Date
  doc.setTextColor(lightGray[0], lightGray[1], lightGray[2])
  doc.text('📅 Fecha:', 30, yPos)
  doc.setTextColor(textColor[0], textColor[1], textColor[2])
  doc.text(ticket.eventDate, 70, yPos)
  yPos += 15
  
  // Venue
  doc.setTextColor(lightGray[0], lightGray[1], lightGray[2])
  doc.text('📍 Lugar:', 30, yPos)
  doc.setTextColor(textColor[0], textColor[1], textColor[2])
  doc.text(ticket.venue, 70, yPos)
  yPos += 15
  
  // Ticket Type
  doc.setTextColor(lightGray[0], lightGray[1], lightGray[2])
  doc.text('🎫 Tipo:', 30, yPos)
  doc.setTextColor(textColor[0], textColor[1], textColor[2])
  doc.text(ticket.ticketType, 70, yPos)
  yPos += 15
  
  // Price
  doc.setTextColor(lightGray[0], lightGray[1], lightGray[2])
  doc.text('💰 Precio:', 30, yPos)
  doc.setTextColor(textColor[0], textColor[1], textColor[2])
  doc.text(`RD$${ticket.price.toLocaleString()}`, 70, yPos)
  yPos += 15
  
  // User Name
  doc.setTextColor(lightGray[0], lightGray[1], lightGray[2])
  doc.text('👤 Usuario:', 30, yPos)
  doc.setTextColor(textColor[0], textColor[1], textColor[2])
  doc.text(userName, 70, yPos)
  yPos += 20
  
  // QR Code Section (right side)
  const qrX = pageWidth - 120
  const qrY = 70
  
  // QR Code placeholder box
  doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2])
  doc.setLineWidth(2)
  doc.rect(qrX, qrY, 80, 80, 'S')
  
  // QR Code text
  doc.setTextColor(textColor[0], textColor[1], textColor[2])
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('CÓDIGO QR', qrX + 40, qrY + 35, { align: 'center' })
  doc.setFontSize(10)
  doc.setFont('courier', 'normal')
  doc.text(`#${ticket.qrCode}`, qrX + 40, qrY + 45, { align: 'center' })
  
  // Important Information Section
  yPos = pageHeight - 50
  doc.setFillColor(245, 245, 245) // gray-100
  doc.roundedRect(30, yPos - 5, pageWidth - 60, 25, 3, 3, 'F')
  
  doc.setTextColor(textColor[0], textColor[1], textColor[2])
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('🌟 INFORMACIÓN IMPORTANTE', 40, yPos + 5)
  
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('• Este es un ticket NFT verificado en blockchain', 40, yPos + 12)
  doc.text('• Presenta este ticket junto con tu identificación en el evento', 40, yPos + 17)
  doc.text(`• ID del Ticket: ${ticket.id}`, 40, yPos + 22)
  
  // Footer
  doc.setTextColor(lightGray[0], lightGray[1], lightGray[2])
  doc.setFontSize(8)
  doc.text('Generado por NFTicket - Plataforma de Tickets NFT', 30, pageHeight - 10)
  doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-DO')}`, pageWidth - 80, pageHeight - 10)
  
  // Save the PDF
  doc.save(`ticket-${ticket.eventName.replace(/\s+/g, '-').toLowerCase()}-${ticket.id}.pdf`)
}

export function shareTicket(ticket: TicketData, userName: string) {
  if (navigator.share) {
    navigator.share({
      title: `Mi Ticket - ${ticket.eventName}`,
      text: `¡Voy a ${ticket.eventName}! Compré mi ticket NFT en NFTicket.`,
      url: window.location.href
    }).catch((error) => console.log('Error sharing:', error))
  } else {
    // Fallback: copy to clipboard
    const text = `¡Voy a ${ticket.eventName}! Compré mi ticket NFT en NFTicket. ${window.location.href}`
    navigator.clipboard.writeText(text).then(() => {
      // You could show a toast notification here
      console.log('Ticket info copied to clipboard!')
    })
  }
}