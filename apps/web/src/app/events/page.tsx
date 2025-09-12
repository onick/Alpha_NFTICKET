'use client'

import { useState, useEffect } from 'react'
import { Button } from '@nfticket/ui'
import { EventsHero } from '../../components/EventsHero'
import { getEcosystemManager, Event } from '@/lib/ecosystem-integration'
import { Search, Filter, Plus, Calendar, MapPin, ShoppingCart, Heart, Share2, Ticket } from 'lucide-react'

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Load published events only on client side
    const loadEvents = async () => {
      if (typeof window === 'undefined') return
      
      try {
        // Add delay to ensure ecosystemManager is ready
        await new Promise(resolve => setTimeout(resolve, 100))
        const manager = getEcosystemManager()
        const publishedEvents = manager ? manager.getPublishedEvents() : []
        setEvents(publishedEvents || [])
      } catch (error) {
        console.error('Error loading events:', error)
        setEvents([])
      } finally {
        setIsLoading(false)
      }
    }

    loadEvents()
  }, [])

  const formatPrice = (event: Event) => {
    if (!event?.ticketTypes?.length) return 'Gratis'
    const minPrice = Math.min(...event.ticketTypes.map(t => t.price))
    return `RD$${minPrice.toLocaleString()}`
  }

  const handleEventClick = (event: Event) => {
    try {
      const manager = getEcosystemManager()
      if (manager) {
        manager.incrementEventViews(event.id)
      }
      window.location.href = `/evento/${event.name.toLowerCase().replace(/\s+/g, '-')}?eventId=${event.id}`
    } catch (error) {
      console.error('Error handling event click:', error)
    }
  }

  const toggleFavorite = (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(eventId)) {
        newFavorites.delete(eventId)
      } else {
        newFavorites.add(eventId)
      }
      return newFavorites
    })
  }

  const shareEvent = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation()
    if (navigator.share) {
      navigator.share({
        title: event.name,
        text: event.description,
        url: `${window.location.origin}/evento/${event.name.toLowerCase().replace(/\s+/g, '-')}?eventId=${event.id}`
      })
    } else {
      // Fallback - copy to clipboard
      const shareUrl = `${window.location.origin}/evento/${event.name.toLowerCase().replace(/\s+/g, '-')}?eventId=${event.id}`
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('Enlace copiado al portapapeles')
      })
    }
  }

  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <EventsHero />

      {/* Events Content */}
      <div className="container py-12 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Todos los Eventos</h1>
            <p className="text-text-muted mt-2">Descubre los mejores eventos con tickets NFT</p>
          </div>
          <Button 
            className="flex items-center space-x-2"
            onClick={() => window.location.href = '/organizador/solicitar'}
          >
            <Plus size={16} />
            <span>Crear Evento</span>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <select className="px-4 py-2 border border-surface-border rounded-lg bg-background-dark-muted text-text-muted focus:border-brand-500 focus:outline-none">
            <option>Todas las categorías</option>
            <option>Música</option>
            <option>Tecnología</option>
            <option>Deportes</option>
            <option>Arte</option>
          </select>
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Buscar eventos..."
              className="pl-10 pr-4 py-2 border border-surface-border rounded-lg bg-background-dark-muted text-text-muted placeholder-text-muted w-full focus:border-brand-500 focus:outline-none"
            />
          </div>
          <Button variant="outline" className="flex items-center space-x-2">
            <Filter size={16} />
            <span>Filtrar</span>
          </Button>
        </div>

        {/* Events Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-500 mx-auto mb-4"></div>
            <p className="text-white">Cargando eventos...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-text-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No hay eventos disponibles</h3>
            <p className="text-text-muted mb-6">¡Sé el primero en crear un evento increíble!</p>
            <Button 
              onClick={() => window.location.href = '/test-ecosystem'}
              className="bg-brand-500 hover:bg-brand-600"
            >
              Probar el Sistema Completo
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {events.map((event) => (
            <div 
              key={event.id} 
              className="discord-card overflow-hidden cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-xl group"
              onClick={() => handleEventClick(event)}
            >
              <div className="relative">
                <img 
                  src={event.bannerImage || `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop`} 
                  alt={event.name}
                  className="w-full h-48 object-cover group-hover:brightness-110 transition-all duration-200"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 text-xs bg-black/70 text-white rounded-full backdrop-blur-sm">
                    {event.category}
                  </span>
                </div>
                <div className="absolute top-3 right-3 flex items-center space-x-2">
                  <button
                    onClick={(e) => toggleFavorite(event.id, e)}
                    className="p-2 bg-black/70 backdrop-blur-sm rounded-full hover:bg-black/90 transition-all duration-200 group/heart"
                  >
                    <Heart 
                      size={16} 
                      className={`transition-all duration-200 ${
                        favorites.has(event.id) 
                          ? 'text-red-500 fill-red-500' 
                          : 'text-white group-hover/heart:text-red-400'
                      }`} 
                    />
                  </button>
                  <button
                    onClick={(e) => shareEvent(event, e)}
                    className="p-2 bg-black/70 backdrop-blur-sm rounded-full hover:bg-black/90 transition-all duration-200 group/share"
                  >
                    <Share2 
                      size={16} 
                      className="text-white group-hover/share:text-blue-400 transition-all duration-200" 
                    />
                  </button>
                </div>
                <div className="absolute bottom-3 right-3">
                  <span className="px-3 py-1 text-sm font-bold bg-green-500/90 text-white rounded-full backdrop-blur-sm">
                    {formatPrice(event)}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-xl text-white mb-2 group-hover:text-brand-400 transition-colors">
                  {event.name}
                </h3>
                <p className="text-sm text-gray-300 mb-4 line-clamp-2">
                  {event.description}
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-text-muted space-x-2">
                    <Calendar size={16} className="text-brand-400" />
                    <span className="font-medium">{event.startDate} • {event.startTime}</span>
                  </div>
                  <div className="flex items-center text-sm text-text-muted space-x-2">
                    <MapPin size={16} className="text-brand-400" />
                    <span className="font-medium">{event.venue || event.onlineLink}</span>
                  </div>
                </div>
                <div className="border-t border-surface-border pt-4">
                  <Button 
                    size="sm" 
                    className="w-full bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center space-x-2 font-semibold py-3 group-hover:bg-brand-400 transition-all"
                    onClick={() => handleEventClick(event)}
                  >
                    <Ticket size={18} />
                    <span>Ver Evento</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
          </div>
        )}

        {/* NFT Info */}
        <div className="bg-gradient-to-r from-brand-900/30 to-brand-800/40 rounded-xl p-8 text-center border border-brand-700/30">
          <h2 className="text-2xl font-bold text-white mb-4">
            Tickets NFT Únicos
          </h2>
          <p className="text-text-muted mb-6 max-w-2xl mx-auto">
            Cada ticket es un NFT único que te garantiza autenticidad, 
            transferibilidad segura y acceso a beneficios exclusivos del evento.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">🔒</div>
              <h3 className="font-semibold text-white">Seguro</h3>
              <p className="text-sm text-text-muted">Verificación blockchain</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🔄</div>
              <h3 className="font-semibold text-white">Transferible</h3>
              <p className="text-sm text-text-muted">Revende fácilmente</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">⭐</div>
              <h3 className="font-semibold text-white">Exclusivo</h3>
              <p className="text-sm text-text-muted">Beneficios únicos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}