'use client'

import { useState, useEffect } from 'react'
import { X, Download, Share2, Copy } from 'lucide-react'
import { Button } from '@nfticket/ui'

interface QRModalProps {
  isOpen: boolean
  onClose: () => void
  ticket: {
    id: string
    eventName: string
    eventDate: string
    venue: string
    ticketType: string
    price: number
    qrCode: string
    status: 'active' | 'used'
  }
  userName: string
}

export function QRModal({ isOpen, onClose, ticket, userName }: QRModalProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen && ticket) {
      generateQRCode()
    }
  }, [isOpen, ticket])

  const generateQRCode = async () => {
    setIsLoading(true)
    try {
      // Dynamically import QRCode to avoid SSR issues
      const QRCode = (await import('qrcode')).default
      
      // Create QR data with ticket information
      const qrData = JSON.stringify({
        ticketId: ticket.id,
        eventName: ticket.eventName,
        eventDate: ticket.eventDate,
        ticketType: ticket.ticketType,
        userName: userName,
        status: ticket.status,
        verificationUrl: `${window.location.origin}/verify/${ticket.id}`,
        timestamp: Date.now()
      })

      // Generate QR code as data URL
      const qrDataUrl = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1F2937', // Dark gray
          light: '#FFFFFF' // White
        }
      })

      setQrCodeDataUrl(qrDataUrl)
    } catch (error) {
      console.error('Error generating QR code:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const downloadQRCode = () => {
    if (qrCodeDataUrl) {
      const link = document.createElement('a')
      link.href = qrCodeDataUrl
      link.download = `qr-ticket-${ticket.eventName.replace(/\s+/g, '-').toLowerCase()}-${ticket.id}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const copyTicketInfo = async () => {
    const ticketInfo = `🎫 Ticket NFTicket
📍 ${ticket.eventName}
📅 ${ticket.eventDate}
🏷️ ${ticket.ticketType}
👤 ${userName}
🆔 ${ticket.id}
🔗 ${window.location.origin}/verify/${ticket.id}`

    try {
      await navigator.clipboard.writeText(ticketInfo)
      // Could show a toast notification here
      console.log('Información copiada al portapapeles')
    } catch (err) {
      console.error('Error copiando al portapapeles:', err)
    }
  }

  const shareTicket = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Ticket - ${ticket.eventName}`,
          text: `Mi ticket NFT para ${ticket.eventName}`,
          url: `${window.location.origin}/verify/${ticket.id}`
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback to copying
      copyTicketInfo()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-[#313338] rounded-2xl border border-[#404249] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#404249]">
          <h2 className="text-xl font-bold text-white">Código QR del Ticket</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          {/* Event Info */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">{ticket.eventName}</h3>
            <div className="space-y-1 text-sm text-gray-400">
              <p>📅 {ticket.eventDate}</p>
              <p>📍 {ticket.venue}</p>
              <p>🎫 {ticket.ticketType}</p>
              <p>👤 {userName}</p>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex justify-center mb-6">
            {isLoading ? (
              <div className="w-[300px] h-[300px] bg-[#2b2d31] rounded-lg flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
              </div>
            ) : qrCodeDataUrl ? (
              <div className="p-4 bg-white rounded-lg">
                <img 
                  src={qrCodeDataUrl} 
                  alt="Código QR del ticket"
                  className="w-[300px] h-[300px]"
                />
              </div>
            ) : (
              <div className="w-[300px] h-[300px] bg-[#2b2d31] rounded-lg flex items-center justify-center">
                <p className="text-gray-400">Error generando QR</p>
              </div>
            )}
          </div>

          {/* Status Badge */}
          <div className="mb-6">
            <span className={`px-3 py-1 text-sm rounded-full ${
              ticket.status === 'active' 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-gray-500/20 text-gray-400'
            }`}>
              {ticket.status === 'active' ? '✅ Ticket Activo' : '❌ Ticket Usado'}
            </span>
          </div>

          {/* Instructions */}
          <div className="mb-6 p-4 bg-[#2b2d31] rounded-lg">
            <h4 className="text-sm font-semibold text-white mb-2">📱 Instrucciones:</h4>
            <div className="text-xs text-gray-400 space-y-1 text-left">
              <p>• Presenta este QR en la entrada del evento</p>
              <p>• Lleva tu identificación oficial</p>
              <p>• Llega 30 minutos antes del evento</p>
              <p>• El QR es único y verificable en blockchain</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-center">
            <Button
              onClick={downloadQRCode}
              disabled={!qrCodeDataUrl}
              className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-2 flex items-center space-x-2"
            >
              <Download size={16} />
              <span>Descargar</span>
            </Button>
            <Button
              onClick={shareTicket}
              className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 flex items-center space-x-2"
            >
              <Share2 size={16} />
              <span>Compartir</span>
            </Button>
            <Button
              onClick={copyTicketInfo}
              className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 px-4 py-2 flex items-center space-x-2"
            >
              <Copy size={16} />
              <span>Copiar</span>
            </Button>
          </div>

          {/* Ticket ID */}
          <div className="mt-4 text-xs text-gray-500">
            ID: {ticket.id}
          </div>
        </div>
      </div>
    </div>
  )
}