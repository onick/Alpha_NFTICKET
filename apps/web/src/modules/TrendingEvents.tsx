'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Calendar, MapPin, Users, Flame, Loader2 } from 'lucide-react'
import { createBrowserEventsService, type Event } from '@nfticket/api'
import { getEcosystemManager } from '@/lib/ecosystem-integration'

export function TrendingEvents() {
  const [trendingEvents, setTrendingEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadTrendingEvents = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Try to fetch from API first
        const response = await fetch('/api/events/trending', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch trending events')
        }
        
        const events = await response.json()
        setTrendingEvents(events.slice(0, 4)) // Show only top 4
      } catch (err) {
        console.error('Error loading trending events:', err)
        
        // Fallback to client-side service
        try {
          const eventsService = createBrowserEventsService()
          const fallbackEvents = await eventsService.getTrendingEvents(4)
          setTrendingEvents(fallbackEvents)
        } catch (fallbackErr) {
          console.error('Fallback also failed:', fallbackErr)
          
          // Try ecosystem data as third fallback
          try {
            const manager = getEcosystemManager()
            if (manager) {
              const localEvents = manager.getPublishedEvents()
              if (localEvents.length > 0) {
                // Convert ecosystem events to API Event format
                const convertedEvents = localEvents.slice(0, 4).map(event => ({
                  id: event.id,
                  title: event.name,
                  description: event.description,
                  venue_name: event.venue || event.onlineLink || 'Evento Online',
                  start_date: event.startDate + 'T' + event.startTime,
                  end_date: event.endDate + 'T' + event.endTime,
                  image_url: event.bannerImage || `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&seed=${event.id}`,
                  category: event.category,
                  organizer_id: event.organizerId,
                  venue_address: event.address || '',
                  created_at: event.createdAt
                }))
                setTrendingEvents(convertedEvents as Event[])
              } else {
                throw new Error('No ecosystem events found')
              }
            } else {
              throw new Error('Ecosystem manager not available')
            }
          } catch (ecosystemErr) {
            console.error('Ecosystem fallback also failed:', ecosystemErr)
            setError('Unable to load trending events')
            
            // Use mock data as absolute last resort
            setTrendingEvents([
              {
                id: 'welcome-event',
                title: '🎉 ¡Bienvenido a NFTicket!',
                description: 'Explora eventos increíbles',
                venue_name: 'Plataforma NFTicket',
                start_date: new Date().toISOString(),
                end_date: new Date().toISOString(),
                image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
                category: 'Bienvenida',
                organizer_id: 'nfticket',
                venue_address: 'Online',
                created_at: new Date().toISOString()
              }
            ] as Event[])
          }
        }
      } finally {
        setLoading(false)
      }
    }

    loadTrendingEvents()
  }, [])

  // Helper function to format date
  const formatEventDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES', { 
        month: 'short', 
        day: 'numeric' 
      })
    } catch {
      return 'TBD'
    }
  }

  // Helper function to generate mock attendees and trends
  const getMockStats = (index: number) => {
    const attendeesCounts = ['45.2K', '28.5K', '18.7K', '12.8K']
    const trends = ['+127%', '+89%', '+65%', '+43%']
    return {
      attendees: attendeesCounts[index] || `${Math.floor(Math.random() * 50)}K`,
      trend: trends[index] || `+${Math.floor(Math.random() * 100)}%`
    }
  }

  return (
    <div className="discord-card animate-in slide-in-from-top-4 fade-in duration-500">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Flame className="text-orange-400 animate-pulse" size={20} />
          <h2 className="text-lg font-semibold text-white">Trending Events</h2>
        </div>
        <button className="text-sm text-gray-400 hover:text-white transition-colors">
          Ver todos
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="animate-spin text-gray-400" size={24} />
            <span className="ml-2 text-sm text-gray-400">Cargando eventos trending...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-sm text-red-400 mb-2">Error al cargar eventos</p>
            <button 
              onClick={() => window.location.reload()} 
              className="text-xs text-gray-400 hover:text-white"
            >
              Reintentar
            </button>
          </div>
        ) : (
          trendingEvents.map((event, index) => {
            const stats = getMockStats(index)
            return (
              <div 
                key={event.id} 
                className="group relative bg-[#1e1f26] hover:bg-[#0f1014] rounded-lg p-4 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg animate-in slide-in-from-left-4 fade-in border border-[#404249] min-h-[100px]"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationDuration: '600ms'
                }}
              >
                <div className="flex items-start space-x-3">
                  {/* Ranking number */}
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-300">
                    {index + 1}
                  </div>

                  {/* Event image */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden">
                    <img 
                      src={event.image_url || `https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=240&fit=crop&seed=${event.id}`} 
                      alt={event.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = `https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=240&fit=crop&seed=${event.id}`
                      }}
                    />
                  </div>

                  {/* Event info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h3 className="text-sm font-medium text-white group-hover:text-purple-400 transition-colors line-clamp-1 flex-1 mr-2">
                        {event.title}
                      </h3>
                      
                      {/* Category badge */}
                      <span className="px-2 py-1 text-xs font-medium bg-gray-800/80 text-gray-300 rounded-md backdrop-blur-sm border border-[#404249] flex-shrink-0">
                        {event.category || 'Event'}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex items-center space-x-1">
                        <Calendar size={12} className="text-gray-400" />
                        <span className="text-xs text-gray-400">{formatEventDate(event.start_date)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users size={12} className="text-gray-400" />
                        <span className="text-xs text-gray-400">{stats.attendees}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-1 flex-1 min-w-0 mr-2">
                        <MapPin size={12} className="text-gray-400 flex-shrink-0" />
                        <span className="text-xs text-gray-400 truncate">
                          {event.venue_name}
                          {event.venue_address && `, ${event.venue_address}`}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <TrendingUp size={12} className="text-green-400" />
                        <span className="text-xs text-green-400 font-medium">{stats.trend}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Ver más button */}
      <button className="w-full mt-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-[#404249] rounded-lg transition-colors duration-200">
        Ver más eventos trending
      </button>
    </div>
  )
}