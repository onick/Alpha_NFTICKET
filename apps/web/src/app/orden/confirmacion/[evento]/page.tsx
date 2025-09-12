'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@nfticket/ui'
import { ticketGenerator } from '@/lib/ticket-generator'
import { socialShareService, createPurchaseShareFromCheckout } from '@/lib/social-share'
import { 
  CheckCircle, 
  Download, 
  Mail, 
  Calendar, 
  MapPin, 
  Users, 
  Ticket,
  Share2,
  ArrowLeft,
  Star,
  Clock,
  CreditCard
} from 'lucide-react'

interface PurchaseData {
  event: {
    name: string
    date: string
    time: string
    location: string
    address: string
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
    phone: string
  }
  total: number
  paymentMethod: string
  orderId: string
  purchaseDate: string
}

const ticketTypes = [
  { id: 1, name: 'General', price: 75 },
  { id: 2, name: 'Preferencial', price: 150 },
  { id: 3, name: 'VIP', price: 350 },
  { id: 4, name: 'Palco', price: 750 }
]

export default function ConfirmationPage({ params }: { params: { evento: string } }) {
  const router = useRouter()
  const [purchaseData, setPurchaseData] = useState<PurchaseData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const data = localStorage.getItem('lastPurchase')
    if (data) {
      setPurchaseData(JSON.parse(data))
    } else {
      router.push('/events')
    }
  }, [router])

  const downloadTickets = async () => {
    if (!purchaseData) return
    
    setIsLoading(true)
    try {
      await ticketGenerator.downloadTickets(purchaseData)
    } catch (error) {
      console.error('Error downloading tickets:', error)
      alert('Error al descargar los tickets. Inténtalo de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  const shareOnSocial = async () => {
    if (!purchaseData) return
    
    try {
      const shareData = createPurchaseShareFromCheckout()
      if (!shareData) {
        alert('Error al preparar el post. Inténtalo de nuevo.')
        return
      }

      const success = await socialShareService.shareToFeed(shareData)
      if (success) {
        alert('¡Tu compra ha sido compartida en tu feed social! 🎉')
      } else {
        alert('Error al compartir en el feed. Inténtalo más tarde.')
      }
    } catch (error) {
      console.error('Error sharing on social:', error)
      alert('Error al compartir en el feed. Inténtalo más tarde.')
    }
  }

  const getTotalTickets = () => {
    if (!purchaseData) return 0
    return purchaseData.tickets.reduce((sum, ticket) => sum + ticket.quantity, 0)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-DO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (!purchaseData) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-white">Cargando confirmación...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-dark">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background-dark/95 backdrop-blur-sm border-b border-surface-border">
        <div className="container py-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.push('/events')}
            className="flex items-center space-x-2 text-text-muted hover:text-white"
          >
            <ArrowLeft size={20} />
            <span>Ver más eventos</span>
          </Button>
        </div>
      </div>

      <div className="container py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Success Header */}
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="bg-green-500/20 p-6 rounded-full">
                <CheckCircle className="h-16 w-16 text-green-400" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                ¡Compra Exitosa!
              </h1>
              <p className="text-xl text-gray-300">
                Tus tickets han sido confirmados y enviados a tu correo
              </p>
              <p className="text-sm text-text-muted mt-2">
                Orden #{purchaseData.orderId} • {formatDate(purchaseData.purchaseDate)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Event Info */}
              <div className="bg-background-dark-muted rounded-2xl p-6 border border-surface-border">
                <div className="flex items-start space-x-4">
                  <img 
                    src={purchaseData.event.image} 
                    alt={purchaseData.event.name}
                    className="w-24 h-24 object-cover rounded-xl"
                  />
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {purchaseData.event.name}
                    </h2>
                    <div className="space-y-2 text-text-muted">
                      <div className="flex items-center space-x-2">
                        <Calendar className="text-brand-400" size={18} />
                        <span>{purchaseData.event.date} • {purchaseData.event.time}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="text-brand-400" size={18} />
                        <span>{purchaseData.event.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ticket Details */}
              <div className="bg-background-dark-muted rounded-2xl p-6 border border-surface-border">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                  <Ticket className="text-brand-400" />
                  <span>Detalles de tus Tickets</span>
                </h3>
                <div className="space-y-4">
                  {purchaseData.tickets.map((ticket) => {
                    const ticketType = ticketTypes.find(t => t.id === ticket.ticketId)
                    return (
                      <div key={ticket.ticketId} className="flex justify-between items-center bg-surface-glass rounded-xl p-4 border border-surface-border">
                        <div>
                          <h4 className="font-semibold text-white">{ticketType?.name}</h4>
                          <p className="text-sm text-text-muted">Cantidad: {ticket.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-white">
                            RD${((ticketType?.price || 0) * ticket.quantity).toLocaleString()}
                          </p>
                          <p className="text-sm text-text-muted">
                            RD${ticketType?.price.toLocaleString()} c/u
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-background-dark-muted rounded-2xl p-6 border border-surface-border">
                <h3 className="text-xl font-bold text-white mb-4">Información del Comprador</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-text-muted">
                  <div>
                    <p className="text-sm text-gray-400">Nombre</p>
                    <p className="font-medium text-white">
                      {purchaseData.user.firstName} {purchaseData.user.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="font-medium text-white">{purchaseData.user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Teléfono</p>
                    <p className="font-medium text-white">{purchaseData.user.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Método de Pago</p>
                    <p className="font-medium text-white">{purchaseData.paymentMethod}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Order Summary */}
                <div className="bg-background-dark-muted rounded-2xl p-6 border border-surface-border">
                  <h3 className="text-xl font-bold text-white mb-4">Resumen del Pedido</h3>
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-text-muted">
                      <span>{getTotalTickets()} tickets</span>
                      <span>RD${purchaseData.total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-text-muted">
                      <span>Cargos de servicio</span>
                      <span>RD$0</span>
                    </div>
                    <div className="border-t border-surface-border pt-3">
                      <div className="flex justify-between font-bold text-white text-lg">
                        <span>Total Pagado</span>
                        <span>RD${purchaseData.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-4">
                  <Button
                    className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-4"
                    onClick={downloadTickets}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Generando PDF...</span>
                      </div>
                    ) : (
                      <>
                        <Download className="mr-2" size={20} />
                        Descargar Tickets (PDF)
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={shareOnSocial}
                  >
                    <Share2 className="mr-2" size={18} />
                    Compartir en Feed Social
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full text-text-muted hover:text-white"
                    onClick={() => router.push('/perfil/tickets')}
                  >
                    <Ticket className="mr-2" size={18} />
                    Ver Mis Tickets
                  </Button>
                </div>

                {/* Important Info */}
                <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/30">
                  <h4 className="font-semibold text-blue-400 mb-2 flex items-center space-x-2">
                    <Clock size={18} />
                    <span>Información Importante</span>
                  </h4>
                  <ul className="text-sm text-blue-300 space-y-2">
                    <li>• Llega 30 minutos antes del evento</li>
                    <li>• Trae identificación válida</li>
                    <li>• Los tickets son no reembolsables</li>
                    <li>• Puedes transferir tus tickets desde tu perfil</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Support */}
          <div className="bg-gradient-to-r from-brand-900/30 to-brand-800/40 rounded-xl p-8 text-center border border-brand-700/30">
            <div className="flex justify-center mb-4">
              <Mail className="h-12 w-12 text-brand-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">¿Necesitas Ayuda?</h3>
            <p className="text-text-muted mb-6">
              Si tienes alguna pregunta sobre tu compra o el evento, nuestro equipo está aquí para ayudarte.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline">
                <Mail className="mr-2" size={18} />
                soporte@nfticket.com
              </Button>
              <Button variant="outline">
                WhatsApp: +1 (809) 123-4567
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}