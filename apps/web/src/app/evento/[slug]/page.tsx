'use client'

import { useState } from 'react'
import { Button } from '@nfticket/ui'
import { ArrowLeft, Calendar, MapPin, Users, Clock, Share2, Heart, Minus, Plus, ShoppingCart, Ticket, Info } from 'lucide-react'
import { useRouter } from 'next/navigation'

// Mock data - Later replace with API call based on slug
const eventData = {
  name: 'Bad Bunny - World Tour 2024',
  slug: 'bad-bunny-world-tour-2024',
  description: 'El conejo más famoso del mundo llega a República Dominicana con su tour más esperado. Una noche llena de reggaetón, perreo y los éxitos que han marcado una generación. No te pierdas esta experiencia única que promete ser el evento del año.',
  longDescription: `
    Bad Bunny regresa a República Dominicana con su espectacular World Tour 2024, presentando todos sus éxitos más recientes junto con los clásicos que lo convirtieron en el artista de reggaetón más grande del mundo.
    
    Esta será una experiencia única e irrepetible, con una producción de primer nivel internacional, efectos visuales espectaculares, y una puesta en escena que solo Bad Bunny puede ofrecer.
    
    El show incluirá:
    • Todos sus éxitos más recientes
    • Efectos pirotécnicos de primer nivel
    • Pantallas LED de última generación
    • Invitados especiales sorpresa
    • Merchandising exclusivo del tour
    
    ¡Esta es la oportunidad que estabas esperando para ver al Conejo Bad en vivo!
  `,
  category: 'Música',
  date: '15 de Marzo, 2024',
  time: '8:00 PM',
  location: 'Estadio Olímpico Félix Sánchez',
  address: 'Av. John F. Kennedy, Santo Domingo, República Dominicana',
  capacity: '45,000',
  organizer: 'Rimas Entertainment',
  image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&crop=center',
  gallery: [
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=300&fit=crop'
  ],
  ticketTypes: [
    {
      id: 1,
      name: 'General',
      description: 'Acceso general al estadio',
      price: 75,
      available: 15000,
      maxQuantity: 8
    },
    {
      id: 2,
      name: 'Preferencial',
      description: 'Área preferencial más cerca del escenario',
      price: 150,
      available: 8000,
      maxQuantity: 6
    },
    {
      id: 3,
      name: 'VIP',
      description: 'Acceso VIP con bebidas incluidas y área exclusiva',
      price: 350,
      available: 2000,
      maxQuantity: 4
    },
    {
      id: 4,
      name: 'Palco',
      description: 'Experiencia premium en palcos con servicio completo',
      price: 750,
      available: 500,
      maxQuantity: 2
    }
  ]
}

export default function EventPage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const [selectedTickets, setSelectedTickets] = useState<{ [key: number]: number }>({})
  const [isLiked, setIsLiked] = useState(false)

  const updateTicketQuantity = (ticketId: number, change: number) => {
    setSelectedTickets(prev => {
      const currentQuantity = prev[ticketId] || 0
      const newQuantity = Math.max(0, currentQuantity + change)
      const maxQuantity = eventData.ticketTypes.find(t => t.id === ticketId)?.maxQuantity || 0
      
      return {
        ...prev,
        [ticketId]: Math.min(newQuantity, maxQuantity)
      }
    })
  }

  const getTotalTickets = () => {
    return Object.values(selectedTickets).reduce((sum, quantity) => sum + quantity, 0)
  }

  const getTotalPrice = () => {
    return Object.entries(selectedTickets).reduce((total, [ticketId, quantity]) => {
      const ticket = eventData.ticketTypes.find(t => t.id === parseInt(ticketId))
      return total + (ticket ? ticket.price * quantity : 0)
    }, 0)
  }

  const handleBuyTickets = () => {
    if (getTotalTickets() === 0) return
    
    // Navigate to checkout page
    const selectedTicketsData = Object.entries(selectedTickets)
      .filter(([_, quantity]) => quantity > 0)
      .map(([ticketId, quantity]) => ({ ticketId: parseInt(ticketId), quantity }))
    
    // Store in localStorage for checkout
    localStorage.setItem('selectedTickets', JSON.stringify({
      event: eventData,
      tickets: selectedTicketsData,
      total: getTotalPrice()
    }))
    
    router.push(`/orden/checkout/${params.slug}`)
  }

  return (
    <div className="min-h-screen bg-background-dark">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background-dark/95 backdrop-blur-sm border-b border-surface-border">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-text-muted hover:text-white"
            >
              <ArrowLeft size={20} />
              <span>Volver</span>
            </Button>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLiked(!isLiked)}
                className={`${isLiked ? 'text-red-500' : 'text-text-muted'} hover:text-red-400`}
              >
                <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
              </Button>
              <Button variant="outline" size="sm" className="text-text-muted hover:text-white">
                <Share2 size={20} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative">
        <div className="h-96 overflow-hidden">
          <img 
            src={eventData.image} 
            alt={eventData.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/50 to-transparent" />
        </div>
        <div className="container relative -mt-32">
          <div className="bg-background-dark-muted/95 backdrop-blur-sm rounded-2xl p-8 border border-surface-border">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <span className="px-3 py-1 bg-brand-500/20 text-brand-400 text-sm font-medium rounded-full">
                    {eventData.category}
                  </span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                  {eventData.name}
                </h1>
                <p className="text-lg text-gray-300 mb-6 max-w-2xl">
                  {eventData.description}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 text-text-muted">
                    <Calendar className="text-brand-400" size={20} />
                    <div>
                      <p className="font-medium text-white">{eventData.date}</p>
                      <p className="text-sm">{eventData.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 text-text-muted">
                    <MapPin className="text-brand-400" size={20} />
                    <div>
                      <p className="font-medium text-white">{eventData.location}</p>
                      <p className="text-sm">{eventData.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 text-text-muted">
                    <Users className="text-brand-400" size={20} />
                    <div>
                      <p className="font-medium text-white">Capacidad</p>
                      <p className="text-sm">{eventData.capacity} personas</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 text-text-muted">
                    <Clock className="text-brand-400" size={20} />
                    <div>
                      <p className="font-medium text-white">Duración</p>
                      <p className="text-sm">Aproximadamente 3 horas</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Event Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Acerca del Evento</h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                  {eventData.longDescription}
                </p>
              </div>
            </section>

            {/* Gallery */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Galería</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {eventData.gallery.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${eventData.name} ${index + 1}`}
                    className="w-full h-24 md:h-32 object-cover rounded-lg hover:opacity-80 transition-opacity cursor-pointer"
                  />
                ))}
              </div>
            </section>

            {/* Location Map */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Ubicación</h2>
              <div className="bg-surface-glass rounded-xl p-6 border border-surface-border">
                <div className="flex items-start space-x-4">
                  <MapPin className="text-brand-400 mt-1" size={24} />
                  <div>
                    <h3 className="font-semibold text-white text-lg">{eventData.location}</h3>
                    <p className="text-gray-300">{eventData.address}</p>
                    <Button variant="outline" size="sm" className="mt-3">
                      Ver en el mapa
                    </Button>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column - Ticket Selection */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-background-dark-muted rounded-2xl p-6 border border-surface-border">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                  <Ticket className="text-brand-400" />
                  <span>Selecciona tus Tickets</span>
                </h2>

                {/* Ticket Types */}
                <div className="space-y-4 mb-6">
                  {eventData.ticketTypes.map(ticket => (
                    <div key={ticket.id} className="border border-surface-border rounded-xl p-4 hover:border-brand-400/50 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-white text-lg">{ticket.name}</h3>
                          <p className="text-sm text-gray-400 mb-2">{ticket.description}</p>
                          <p className="text-xs text-green-400">{ticket.available.toLocaleString()} disponibles</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-white">
                            RD${ticket.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateTicketQuantity(ticket.id, -1)}
                            disabled={!selectedTickets[ticket.id]}
                            className="w-8 h-8 p-0"
                          >
                            <Minus size={16} />
                          </Button>
                          <span className="w-8 text-center font-medium text-white">
                            {selectedTickets[ticket.id] || 0}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateTicketQuantity(ticket.id, 1)}
                            disabled={(selectedTickets[ticket.id] || 0) >= ticket.maxQuantity}
                            className="w-8 h-8 p-0"
                          >
                            <Plus size={16} />
                          </Button>
                        </div>
                        <p className="text-xs text-gray-400">
                          Máx. {ticket.maxQuantity} por persona
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                {getTotalTickets() > 0 && (
                  <div className="bg-surface-glass rounded-xl p-4 mb-6 border border-brand-400/30">
                    <h3 className="font-semibold text-white mb-3 flex items-center space-x-2">
                      <Info size={18} className="text-brand-400" />
                      <span>Resumen del Pedido</span>
                    </h3>
                    <div className="space-y-2 text-sm">
                      {Object.entries(selectedTickets).map(([ticketId, quantity]) => {
                        if (quantity === 0) return null
                        const ticket = eventData.ticketTypes.find(t => t.id === parseInt(ticketId))
                        return (
                          <div key={ticketId} className="flex justify-between text-gray-300">
                            <span>{quantity}x {ticket?.name}</span>
                            <span>RD${((ticket?.price || 0) * quantity).toLocaleString()}</span>
                          </div>
                        )
                      })}
                      <div className="border-t border-surface-border pt-2 mt-2">
                        <div className="flex justify-between font-semibold text-white">
                          <span>Total ({getTotalTickets()} tickets)</span>
                          <span>RD${getTotalPrice().toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Buy Button */}
                <Button
                  className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={getTotalTickets() === 0}
                  onClick={handleBuyTickets}
                >
                  <ShoppingCart className="mr-2" size={20} />
                  {getTotalTickets() === 0 
                    ? 'Selecciona tickets' 
                    : `Comprar Tickets - RD$${getTotalPrice().toLocaleString()}`
                  }
                </Button>

                {/* Trust indicators */}
                <div className="mt-4 pt-4 border-t border-surface-border">
                  <p className="text-xs text-gray-400 text-center">
                    🔒 Pago seguro • ✅ Tickets verificados • 🎫 Entrega inmediata
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}