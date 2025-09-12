'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@nfticket/ui'
import { 
  Plus, 
  Calendar, 
  Users, 
  DollarSign, 
  TrendingUp,
  Eye,
  Edit3,
  MoreHorizontal,
  BarChart3,
  Clock,
  MapPin,
  Ticket,
  AlertCircle,
  CheckCircle2,
  PauseCircle
} from 'lucide-react'

interface OrganizerEvent {
  id: string
  name: string
  date: string
  time: string
  location: string
  image: string
  status: 'draft' | 'published' | 'paused' | 'ended'
  ticketsSold: number
  totalTickets: number
  revenue: number
  views: number
  createdAt: string
}

// Mock data for organizer events
const mockOrganizerEvents: OrganizerEvent[] = [
  {
    id: '1',
    name: 'Bad Bunny - World Tour 2024',
    date: '15 de Marzo, 2024',
    time: '8:00 PM',
    location: 'Estadio Olímpico Félix Sánchez',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
    status: 'published',
    ticketsSold: 15420,
    totalTickets: 25000,
    revenue: 2850000,
    views: 45200,
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    name: 'Festival de Arte Digital 2024',
    date: '28 de Febrero, 2024',
    time: '6:00 PM',
    location: 'Centro Cultural',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=300&fit=crop',
    status: 'published',
    ticketsSold: 890,
    totalTickets: 1500,
    revenue: 156750,
    views: 8400,
    createdAt: '2024-01-20T14:20:00Z'
  },
  {
    id: '3',
    name: 'Conferencia Tech Innovación',
    date: '10 de Abril, 2024',
    time: '9:00 AM',
    location: 'Hotel Intercontinental',
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&h=300&fit=crop',
    status: 'draft',
    ticketsSold: 0,
    totalTickets: 500,
    revenue: 0,
    views: 0,
    createdAt: '2024-02-01T09:15:00Z'
  }
]

const statusConfig = {
  draft: { 
    label: 'Borrador', 
    color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    icon: <Edit3 size={14} />
  },
  published: { 
    label: 'Publicado', 
    color: 'bg-green-500/20 text-green-400 border-green-500/30',
    icon: <CheckCircle2 size={14} />
  },
  paused: { 
    label: 'Pausado', 
    color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    icon: <PauseCircle size={14} />
  },
  ended: { 
    label: 'Terminado', 
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    icon: <CheckCircle2 size={14} />
  }
}

export default function OrganizerDashboard() {
  const router = useRouter()
  const [events, setEvents] = useState<OrganizerEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedFilter, setSelectedFilter] = useState<string>('all')

  useEffect(() => {
    // Simulate loading events
    setTimeout(() => {
      setEvents(mockOrganizerEvents)
      setIsLoading(false)
    }, 1000)
  }, [])

  const calculateStats = () => {
    const publishedEvents = events.filter(e => e.status === 'published')
    const totalRevenue = events.reduce((sum, event) => sum + event.revenue, 0)
    const totalTicketsSold = events.reduce((sum, event) => sum + event.ticketsSold, 0)
    const totalViews = events.reduce((sum, event) => sum + event.views, 0)

    return {
      totalEvents: events.length,
      publishedEvents: publishedEvents.length,
      totalRevenue,
      totalTicketsSold,
      totalViews
    }
  }

  const filteredEvents = selectedFilter === 'all' 
    ? events 
    : events.filter(event => event.status === selectedFilter)

  const stats = calculateStats()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getEventProgress = (event: OrganizerEvent) => {
    if (event.totalTickets === 0) return 0
    return Math.round((event.ticketsSold / event.totalTickets) * 100)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-white">Cargando tu dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-dark">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background-dark/95 backdrop-blur-sm border-b border-surface-border">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Dashboard de Organizador</h1>
              <p className="text-text-muted">Gestiona tus eventos y ve tu progreso</p>
            </div>
            <Button 
              onClick={() => router.push('/organizador/eventos/crear')}
              className="bg-brand-500 hover:bg-brand-600 text-white font-semibold"
            >
              <Plus className="mr-2" size={18} />
              Crear Evento
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-background-dark-muted rounded-xl p-6 border border-surface-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Total Eventos</p>
                <p className="text-2xl font-bold text-white">{stats.totalEvents}</p>
                <p className="text-xs text-green-400">{stats.publishedEvents} publicados</p>
              </div>
              <div className="p-3 bg-brand-500/20 rounded-lg">
                <Calendar className="h-6 w-6 text-brand-400" />
              </div>
            </div>
          </div>

          <div className="bg-background-dark-muted rounded-xl p-6 border border-surface-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Tickets Vendidos</p>
                <p className="text-2xl font-bold text-white">{stats.totalTicketsSold.toLocaleString()}</p>
                <p className="text-xs text-green-400">+12% este mes</p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-lg">
                <Ticket className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-background-dark-muted rounded-xl p-6 border border-surface-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Ingresos Totales</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</p>
                <p className="text-xs text-green-400">+8% este mes</p>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-background-dark-muted rounded-xl p-6 border border-surface-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Visualizaciones</p>
                <p className="text-2xl font-bold text-white">{stats.totalViews.toLocaleString()}</p>
                <p className="text-xs text-green-400">+15% esta semana</p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Eye className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Events Section */}
        <div className="bg-background-dark-muted rounded-2xl p-6 border border-surface-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Mis Eventos</h2>
              <p className="text-text-muted">Gestiona y monitorea tus eventos</p>
            </div>
            
            {/* Filter Tabs */}
            <div className="flex items-center space-x-2">
              {['all', 'published', 'draft', 'paused'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedFilter === filter
                      ? 'bg-brand-500 text-white'
                      : 'bg-transparent text-text-muted hover:text-white hover:bg-surface-glass'
                  }`}
                >
                  {filter === 'all' ? 'Todos' : statusConfig[filter as keyof typeof statusConfig]?.label}
                </button>
              ))}
            </div>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-text-muted mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {events.length === 0 ? 'No tienes eventos aún' : 'No hay eventos con este filtro'}
              </h3>
              <p className="text-text-muted mb-6">
                {events.length === 0 
                  ? 'Crea tu primer evento para empezar a vender tickets'
                  : 'Cambia el filtro para ver otros eventos'
                }
              </p>
              {events.length === 0 && (
                <Button 
                  onClick={() => router.push('/organizador/eventos/crear')}
                  className="bg-brand-500 hover:bg-brand-600"
                >
                  <Plus className="mr-2" size={18} />
                  Crear Primer Evento
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <div 
                  key={event.id} 
                  className="bg-surface-glass rounded-xl p-6 border border-surface-border hover:border-brand-400/50 transition-colors"
                >
                  <div className="flex items-start space-x-4">
                    <img 
                      src={event.image} 
                      alt={event.name}
                      className="w-20 h-20 object-cover rounded-xl"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-bold text-white text-lg mb-1 truncate">
                            {event.name}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-text-muted">
                            <div className="flex items-center space-x-1">
                              <Calendar size={14} />
                              <span>{event.date} • {event.time}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin size={14} />
                              <span className="truncate">{event.location}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className={`flex items-center space-x-1 px-3 py-1 rounded-full border text-xs font-medium ${statusConfig[event.status].color}`}>
                            {statusConfig[event.status].icon}
                            <span>{statusConfig[event.status].label}</span>
                          </div>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal size={16} />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Event Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-text-muted">Tickets Vendidos</p>
                          <p className="font-semibold text-white">{event.ticketsSold.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-text-muted">Total Tickets</p>
                          <p className="font-semibold text-white">{event.totalTickets.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-text-muted">Ingresos</p>
                          <p className="font-semibold text-white">{formatCurrency(event.revenue)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-text-muted">Vistas</p>
                          <p className="font-semibold text-white">{event.views.toLocaleString()}</p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {event.status === 'published' && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-text-muted">Progreso de Ventas</span>
                            <span className="text-xs text-text-muted">{getEventProgress(event)}%</span>
                          </div>
                          <div className="w-full bg-surface-border rounded-full h-2">
                            <div 
                              className="bg-brand-500 h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${getEventProgress(event)}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/organizador/eventos/${event.id}`)}
                        >
                          <BarChart3 className="mr-2" size={14} />
                          Ver Analytics
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/organizador/eventos/${event.id}/editar`)}
                        >
                          <Edit3 className="mr-2" size={14} />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/evento/${event.name.toLowerCase().replace(/\s+/g, '-')}`)}
                        >
                          <Eye className="mr-2" size={14} />
                          Ver Público
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-background-dark-muted rounded-xl p-6 border border-surface-border text-center">
            <div className="p-4 bg-brand-500/20 rounded-xl w-fit mx-auto mb-4">
              <Plus className="h-8 w-8 text-brand-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Crear Nuevo Evento</h3>
            <p className="text-sm text-text-muted mb-4">Lanza tu próximo evento en minutos</p>
            <Button 
              onClick={() => router.push('/organizador/eventos/crear')}
              className="w-full bg-brand-500 hover:bg-brand-600"
            >
              Crear Evento
            </Button>
          </div>

          <div className="bg-background-dark-muted rounded-xl p-6 border border-surface-border text-center">
            <div className="p-4 bg-green-500/20 rounded-xl w-fit mx-auto mb-4">
              <BarChart3 className="h-8 w-8 text-green-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Ver Reportes</h3>
            <p className="text-sm text-text-muted mb-4">Analiza el rendimiento de tus eventos</p>
            <Button variant="outline" className="w-full">
              Ver Reportes
            </Button>
          </div>

          <div className="bg-background-dark-muted rounded-xl p-6 border border-surface-border text-center">
            <div className="p-4 bg-purple-500/20 rounded-xl w-fit mx-auto mb-4">
              <Users className="h-8 w-8 text-purple-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Gestionar Asistentes</h3>
            <p className="text-sm text-text-muted mb-4">Check-in y comunicación con asistentes</p>
            <Button variant="outline" className="w-full">
              Gestionar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}