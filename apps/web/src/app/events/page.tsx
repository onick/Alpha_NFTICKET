'use client'

import { useState, useEffect } from 'react'
import { Button } from '@nfticket/ui'
import { EventsHero } from '../../components/EventsHero'
import { getEcosystemManager, Event } from '@/lib/ecosystem-integration'
import { useTheme } from '@/contexts/ThemeContext'
import { Search, Filter, Plus, Calendar, MapPin, ShoppingCart, Heart, Share2, Ticket, Grid3X3, List } from 'lucide-react'

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const { theme, isLight } = useTheme()

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

  const formatDateForCalendar = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const day = date.getDate().toString().padStart(2, '0')
      const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']
      const month = months[date.getMonth()]
      const year = date.getFullYear()
      
      return { day, month, year }
    } catch (error) {
      // Fallback if date parsing fails
      return { day: '01', month: 'ENE', year: new Date().getFullYear() }
    }
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
    <>
      {/* Ticket styles */}
      <style jsx>{`
        .ticket-card {
          position: relative;
        }
        .ticket-card::before,
        .ticket-card::after {
          content: '';
          position: absolute;
          width: 20px;
          height: 20px;
          background-color: ${isLight ? '#ffffff' : '#2b2d31'};
          border-radius: 50%;
          z-index: 20;
          box-shadow: inset 0 0 0 3px ${isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.2)'};
        }
        .ticket-card::before {
          top: 190px;
          left: -10px;
        }
        .ticket-card::after {
          top: 190px;
          right: -10px;
        }
      `}</style>
      
      <div className={`space-y-0 min-h-screen ${isLight ? 'bg-white' : 'bg-[#2b2d31]'}`}>
        {/* Hero Section */}
        <EventsHero />

      {/* Events Content */}
      <div className="container py-12 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Todos los Eventos</h1>
            <p className={`mt-2 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Descubre los mejores eventos con tickets NFT</p>
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
          <select className={`px-4 py-2 border rounded-lg focus:border-brand-500 focus:outline-none ${
            isLight 
              ? 'border-gray-300 bg-white text-gray-700' 
              : 'border-gray-600 bg-gray-800 text-gray-300'
          }`}>
            <option>Todas las categorías</option>
            <option>Música</option>
            <option>Tecnología</option>
            <option>Deportes</option>
            <option>Arte</option>
          </select>
          <div className="relative flex-1 max-w-md">
            <Search size={18} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isLight ? 'text-gray-400' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Buscar eventos..."
              className={`pl-10 pr-4 py-2 border rounded-lg w-full focus:border-brand-500 focus:outline-none ${
                isLight 
                  ? 'border-gray-300 bg-white text-gray-700 placeholder-gray-400' 
                  : 'border-gray-600 bg-gray-800 text-gray-300 placeholder-gray-400'
              }`}
            />
          </div>
          <Button variant="outline" className="flex items-center space-x-2">
            <Filter size={16} />
            <span>Filtrar</span>
          </Button>
          
          {/* View Toggle */}
          <div className={`flex rounded-lg border ${isLight ? 'border-gray-300' : 'border-gray-600'}`}>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 rounded-l-lg transition-colors flex items-center space-x-1 ${
                viewMode === 'grid'
                  ? isLight
                    ? 'bg-purple-500 text-white'
                    : 'bg-purple-600 text-white'
                  : isLight
                    ? 'bg-white text-gray-700 hover:bg-gray-50'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Grid3X3 size={16} />
              <span>Tarjetas</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-r-lg transition-colors flex items-center space-x-1 border-l ${
                isLight ? 'border-gray-300' : 'border-gray-600'
              } ${
                viewMode === 'list'
                  ? isLight
                    ? 'bg-purple-500 text-white'
                    : 'bg-purple-600 text-white'
                  : isLight
                    ? 'bg-white text-gray-700 hover:bg-gray-50'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <List size={16} />
              <span>Lista</span>
            </button>
          </div>
        </div>

        {/* Events Display - Grid or List View */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-500 mx-auto mb-4"></div>
            <p className={`${isLight ? 'text-gray-700' : 'text-white'}`}>Cargando eventos...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className={`h-16 w-16 mx-auto mb-4 ${isLight ? 'text-gray-400' : 'text-gray-500'}`} />
            <h3 className={`text-xl font-semibold mb-2 ${isLight ? 'text-gray-900' : 'text-white'}`}>No hay eventos disponibles</h3>
            <p className={`mb-6 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>¡Sé el primero en crear un evento increíble!</p>
            <Button 
              onClick={() => window.location.href = '/test-ecosystem'}
              className="bg-brand-500 hover:bg-brand-600"
            >
              Probar el Sistema Completo
            </Button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {events.map((event) => (
            <div 
              key={event.id} 
              className="relative rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-2xl group ticket-card"
              onClick={() => handleEventClick(event)}
              style={{
                background: isLight 
                  ? 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)' 
                  : 'linear-gradient(145deg, #2b2d31 0%, #36393f 100%)',
                boxShadow: isLight 
                  ? '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)' 
                  : '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              }}
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
              
              {/* Ticket separation line */}
              <div className="relative">
                <div className={`border-t-2 border-dashed mx-4 ${isLight ? 'border-gray-300' : 'border-gray-600'}`}></div>
              </div>

              <div className="p-6">
                <h3 className={`font-bold text-xl mb-2 group-hover:text-purple-400 transition-colors ${isLight ? 'text-gray-900' : 'text-white'}`}>
                  {event.name}
                </h3>
                <p className={`text-sm mb-4 line-clamp-2 ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>
                  {event.description}
                </p>
                <div className="space-y-3 mb-6">
                  <div className={`flex items-center text-sm space-x-2 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                    <Calendar size={16} className="text-purple-500" />
                    <span className="font-medium">{event.startDate} • {event.startTime}</span>
                  </div>
                  <div className={`flex items-center text-sm space-x-2 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                    <MapPin size={16} className="text-purple-500" />
                    <span className="font-medium">{event.venue || event.onlineLink}</span>
                  </div>
                </div>
                <div className={`border-t pt-4 ${isLight ? 'border-gray-200' : 'border-gray-600'}`}>
                  <Button 
                    size="sm" 
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center space-x-2 font-semibold py-3 group-hover:bg-purple-500 transition-all rounded-lg"
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
        ) : (
          /* List View */
          <div className="space-y-4">
            {events.map((event) => {
              const dateInfo = formatDateForCalendar(event.startDate)
              return (
                <div 
                  key={event.id} 
                  className={`flex h-[140px] rounded-lg shadow-lg overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-xl group ${
                    isLight 
                      ? 'bg-white border border-gray-200' 
                      : 'bg-gray-800 border border-gray-700'
                  }`}
                  onClick={() => handleEventClick(event)}
                >
                  {/* Date Block */}
                  <div className={`flex flex-col items-center justify-center w-24 px-3 h-full ${
                    isLight ? 'bg-gray-50 border-r border-gray-200' : 'bg-gray-700 border-r border-gray-600'
                  }`}>
                    <div className={`text-xs font-medium uppercase tracking-wide mb-1 ${
                      isLight ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      {dateInfo.month}
                    </div>
                    <div className={`text-2xl font-bold ${
                      isLight ? 'text-gray-900' : 'text-white'
                    }`}>
                      {dateInfo.day}
                    </div>
                    <div className={`text-xs ${
                      isLight ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      {dateInfo.year}
                    </div>
                  </div>

                  {/* Event Image */}
                  <div className="relative w-40 flex-shrink-0 h-full overflow-hidden">
                    <img 
                      src={event.bannerImage || `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop`} 
                      alt={event.name}
                      className="w-full h-full object-cover group-hover:brightness-110 transition-all duration-200"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-1 text-xs bg-black/70 text-white rounded-full backdrop-blur-sm">
                        {event.category}
                      </span>
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 text-xs font-bold bg-green-500/90 text-white rounded-full backdrop-blur-sm">
                        {formatPrice(event)}
                      </span>
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className={`font-bold text-lg group-hover:text-purple-400 transition-colors ${isLight ? 'text-gray-900' : 'text-white'}`}>
                          {event.name}
                        </h3>
                        <div className="flex items-center space-x-1 ml-4">
                          <button
                            onClick={(e) => toggleFavorite(event.id, e)}
                            className={`p-1.5 rounded-full transition-all duration-200 group/heart ${
                              isLight ? 'hover:bg-gray-100' : 'hover:bg-gray-700'
                            }`}
                          >
                            <Heart 
                              size={14} 
                              className={`transition-all duration-200 ${
                                favorites.has(event.id) 
                                  ? 'text-red-500 fill-red-500' 
                                  : isLight 
                                    ? 'text-gray-600 group-hover/heart:text-red-400' 
                                    : 'text-gray-400 group-hover/heart:text-red-400'
                              }`} 
                            />
                          </button>
                          <button
                            onClick={(e) => shareEvent(event, e)}
                            className={`p-1.5 rounded-full transition-all duration-200 group/share ${
                              isLight ? 'hover:bg-gray-100' : 'hover:bg-gray-700'
                            }`}
                          >
                            <Share2 
                              size={14} 
                              className={`transition-all duration-200 ${
                                isLight 
                                  ? 'text-gray-600 group-hover/share:text-blue-400' 
                                  : 'text-gray-400 group-hover/share:text-blue-400'
                                }`} 
                              />
                            </button>
                          </div>
                        </div>
                        <p className={`text-sm mb-3 line-clamp-2 ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>
                          {event.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`flex items-center text-sm space-x-2 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                            <Calendar size={14} className="text-purple-500" />
                            <span className="font-medium text-xs">{event.startTime}</span>
                          </div>
                          <div className={`flex items-center text-sm space-x-2 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                            <MapPin size={14} className="text-purple-500" />
                            <span className="font-medium text-xs truncate max-w-[120px]">{event.venue || event.onlineLink}</span>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          className="bg-purple-600 hover:bg-purple-700 text-white flex items-center space-x-2 font-semibold group-hover:bg-purple-500 transition-all px-3 py-2"
                          onClick={() => handleEventClick(event)}
                        >
                          <Ticket size={14} />
                          <span className="text-xs">Ver Evento</span>
                        </Button>
                      </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* NFT Info */}
        <div className={`rounded-xl p-8 text-center border ${
          isLight 
            ? 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200' 
            : 'bg-gradient-to-r from-brand-900/30 to-brand-800/40 border-brand-700/30'
        }`}>
          <h2 className={`text-2xl font-bold mb-4 ${isLight ? 'text-gray-900' : 'text-white'}`}>
            Tickets NFT Únicos
          </h2>
          <p className={`mb-6 max-w-2xl mx-auto ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
            Cada ticket es un NFT único que te garantiza autenticidad, 
            transferibilidad segura y acceso a beneficios exclusivos del evento.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">🔒</div>
              <h3 className={`font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>Seguro</h3>
              <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Verificación blockchain</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🔄</div>
              <h3 className={`font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>Transferible</h3>
              <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Revende fácilmente</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">⭐</div>
              <h3 className={`font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>Exclusivo</h3>
              <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Beneficios únicos</p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  )
}