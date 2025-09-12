'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@nfticket/ui'
import { 
  ArrowLeft, 
  Users, 
  DollarSign, 
  TrendingUp,
  Eye,
  Calendar,
  MapPin,
  Download,
  Mail,
  QrCode,
  Edit3,
  Share2,
  Settings,
  BarChart3,
  Clock,
  Ticket,
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from 'lucide-react'

interface EventAnalytics {
  totalTicketsSold: number
  totalRevenue: number
  totalViews: number
  conversionRate: number
  dailySales: Array<{ date: string; sales: number; revenue: number }>
  ticketTypeBreakdown: Array<{ type: string; sold: number; revenue: number; percentage: number }>
  topReferrers: Array<{ source: string; views: number; sales: number }>
}

interface EventAttendee {
  id: string
  name: string
  email: string
  phone: string
  ticketType: string
  purchaseDate: string
  ticketId: string
  checkedIn: boolean
  checkinTime?: string
}

// Mock data
const mockEvent = {
  id: '1',
  name: 'Bad Bunny - World Tour 2024',
  description: 'El conejo más famoso del mundo llega a República Dominicana',
  date: '15 de Marzo, 2024',
  time: '8:00 PM',
  location: 'Estadio Olímpico Félix Sánchez',
  address: 'Av. John F. Kennedy, Santo Domingo, República Dominicana',
  image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
  status: 'published',
  totalTickets: 25000,
  ticketTypes: [
    { name: 'General', price: 75, total: 15000, sold: 8500 },
    { name: 'Preferencial', price: 150, total: 8000, sold: 4200 },
    { name: 'VIP', price: 350, total: 2000, sold: 1800 },
    { name: 'Palco', price: 750, total: 500, sold: 450 }
  ]
}

const mockAnalytics: EventAnalytics = {
  totalTicketsSold: 14950,
  totalRevenue: 2245750,
  totalViews: 45200,
  conversionRate: 33.1,
  dailySales: [
    { date: '2024-01-15', sales: 1200, revenue: 180000 },
    { date: '2024-01-16', sales: 950, revenue: 142500 },
    { date: '2024-01-17', sales: 1100, revenue: 165000 },
    { date: '2024-01-18', sales: 850, revenue: 127500 },
    { date: '2024-01-19', sales: 1300, revenue: 195000 },
    { date: '2024-01-20', sales: 1150, revenue: 172500 },
    { date: '2024-01-21', sales: 980, revenue: 147000 }
  ],
  ticketTypeBreakdown: [
    { type: 'General', sold: 8500, revenue: 637500, percentage: 56.9 },
    { type: 'Preferencial', sold: 4200, revenue: 630000, percentage: 28.1 },
    { type: 'VIP', sold: 1800, revenue: 630000, percentage: 12.0 },
    { type: 'Palco', sold: 450, revenue: 337500, percentage: 3.0 }
  ],
  topReferrers: [
    { source: 'Búsqueda Directa', views: 18500, sales: 6200 },
    { source: 'Instagram', views: 12000, sales: 4100 },
    { source: 'Facebook', views: 8900, sales: 2800 },
    { source: 'WhatsApp', views: 3400, sales: 1200 },
    { source: 'Twitter', views: 2400, sales: 650 }
  ]
}

const mockAttendees: EventAttendee[] = [
  {
    id: '1',
    name: 'María González',
    email: 'maria@email.com',
    phone: '+1 809-123-4567',
    ticketType: 'VIP',
    purchaseDate: '2024-01-15T14:30:00Z',
    ticketId: 'TIK-ABC123',
    checkedIn: true,
    checkinTime: '2024-03-15T19:30:00Z'
  },
  {
    id: '2',
    name: 'Carlos Rodríguez',
    email: 'carlos@email.com',
    phone: '+1 809-234-5678',
    ticketType: 'General',
    purchaseDate: '2024-01-16T10:15:00Z',
    ticketId: 'TIK-DEF456',
    checkedIn: false
  },
  // More mock attendees...
]

export default function EventManagementPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'analytics' | 'attendees' | 'settings'>('analytics')
  const [analytics, setAnalytics] = useState<EventAnalytics | null>(null)
  const [attendees, setAttendees] = useState<EventAttendee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setAnalytics(mockAnalytics)
      setAttendees(mockAttendees)
      setIsLoading(false)
    }, 1500)
  }, [])

  const filteredAttendees = attendees.filter(attendee =>
    attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attendee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attendee.ticketId.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getEventProgress = () => {
    if (!analytics) return 0
    return Math.round((analytics.totalTicketsSold / mockEvent.totalTickets) * 100)
  }

  const exportAttendees = () => {
    // Create CSV content
    const csvContent = [
      ['Nombre', 'Email', 'Teléfono', 'Tipo de Ticket', 'ID de Ticket', 'Fecha de Compra', 'Check-in'].join(','),
      ...attendees.map(attendee => [
        attendee.name,
        attendee.email,
        attendee.phone,
        attendee.ticketType,
        attendee.ticketId,
        new Date(attendee.purchaseDate).toLocaleDateString('es-DO'),
        attendee.checkedIn ? 'Sí' : 'No'
      ].join(','))
    ].join('\n')

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `asistentes-${mockEvent.name.toLowerCase().replace(/\s+/g, '-')}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const sendEventUpdate = () => {
    alert('Funcionalidad de envío de comunicaciones será implementada próximamente')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-white">Cargando analytics del evento...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-dark">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background-dark/95 backdrop-blur-sm border-b border-surface-border">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => router.push('/organizador/dashboard')}
                className="flex items-center space-x-2 text-text-muted hover:text-white"
              >
                <ArrowLeft size={20} />
                <span>Dashboard</span>
              </Button>
              <div>
                <h1 className="text-xl font-bold text-white">{mockEvent.name}</h1>
                <p className="text-text-muted">{mockEvent.date} • {mockEvent.location}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => router.push(`/organizador/eventos/${params.id}/checkin`)}
                className="flex items-center space-x-2"
              >
                <QrCode size={16} />
                <span>Check-in</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push(`/evento/${mockEvent.name.toLowerCase().replace(/\s+/g, '-')}`)}
                className="flex items-center space-x-2"
              >
                <Eye size={16} />
                <span>Ver Público</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Event Header Card */}
      <div className="container py-6">
        <div className="bg-background-dark-muted rounded-2xl p-6 border border-surface-border mb-6">
          <div className="flex items-start space-x-6">
            <img 
              src={mockEvent.image} 
              alt={mockEvent.name}
              className="w-24 h-24 object-cover rounded-xl"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm font-medium rounded-full border border-green-500/30">
                  <CheckCircle2 size={14} className="inline mr-1" />
                  Publicado
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{mockEvent.name}</h2>
              <p className="text-gray-300 mb-4">{mockEvent.description}</p>
              <div className="flex items-center space-x-6 text-sm text-text-muted">
                <div className="flex items-center space-x-2">
                  <Calendar size={16} className="text-brand-400" />
                  <span>{mockEvent.date} • {mockEvent.time}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin size={16} className="text-brand-400" />
                  <span>{mockEvent.location}</span>
                </div>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-2xl font-bold text-white">{analytics?.totalTicketsSold.toLocaleString()}</p>
                <p className="text-xs text-text-muted">Vendidos</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{formatCurrency(analytics?.totalRevenue || 0)}</p>
                <p className="text-xs text-text-muted">Ingresos</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{getEventProgress()}%</p>
                <p className="text-xs text-text-muted">Completado</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-muted">Progreso de Ventas</span>
              <span className="text-sm font-medium text-white">
                {analytics?.totalTicketsSold.toLocaleString()} / {mockEvent.totalTickets.toLocaleString()} tickets
              </span>
            </div>
            <div className="w-full bg-surface-border rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-brand-500 to-brand-600 h-3 rounded-full transition-all duration-300" 
                style={{ width: `${getEventProgress()}%` }}
              />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 mb-6 bg-background-dark-muted rounded-xl p-2 border border-surface-border">
          {[
            { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={16} /> },
            { id: 'attendees', label: 'Asistentes', icon: <Users size={16} /> },
            { id: 'settings', label: 'Configuración', icon: <Settings size={16} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-1 justify-center ${
                activeTab === tab.id
                  ? 'bg-brand-500 text-white'
                  : 'text-text-muted hover:text-white hover:bg-surface-glass'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'analytics' && analytics && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-background-dark-muted rounded-xl p-6 border border-surface-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-muted">Tickets Vendidos</p>
                    <p className="text-2xl font-bold text-white">{analytics.totalTicketsSold.toLocaleString()}</p>
                    <p className="text-xs text-green-400">+12% esta semana</p>
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
                    <p className="text-2xl font-bold text-white">{formatCurrency(analytics.totalRevenue)}</p>
                    <p className="text-xs text-green-400">+8% esta semana</p>
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
                    <p className="text-2xl font-bold text-white">{analytics.totalViews.toLocaleString()}</p>
                    <p className="text-xs text-blue-400">+15% esta semana</p>
                  </div>
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <Eye className="h-6 w-6 text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="bg-background-dark-muted rounded-xl p-6 border border-surface-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-muted">Conversión</p>
                    <p className="text-2xl font-bold text-white">{analytics.conversionRate}%</p>
                    <p className="text-xs text-orange-400">Promedio: 28%</p>
                  </div>
                  <div className="p-3 bg-orange-500/20 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-orange-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily Sales Chart */}
              <div className="bg-background-dark-muted rounded-xl p-6 border border-surface-border">
                <h3 className="font-semibold text-white mb-4">Ventas por Día</h3>
                <div className="space-y-3">
                  {analytics.dailySales.slice(-7).map((day, index) => (
                    <div key={day.date} className="flex items-center justify-between">
                      <span className="text-sm text-text-muted">
                        {new Date(day.date).toLocaleDateString('es-DO', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      <div className="flex-1 mx-4">
                        <div className="w-full bg-surface-border rounded-full h-2">
                          <div 
                            className="bg-brand-500 h-2 rounded-full" 
                            style={{ width: `${(day.sales / Math.max(...analytics.dailySales.map(d => d.sales))) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-medium text-white">{day.sales}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ticket Type Breakdown */}
              <div className="bg-background-dark-muted rounded-xl p-6 border border-surface-border">
                <h3 className="font-semibold text-white mb-4">Ventas por Tipo de Ticket</h3>
                <div className="space-y-4">
                  {analytics.ticketTypeBreakdown.map((ticket, index) => (
                    <div key={ticket.type}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-white">{ticket.type}</span>
                        <span className="text-sm font-medium text-white">
                          {ticket.sold.toLocaleString()} ({ticket.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-surface-border rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            index === 0 ? 'bg-brand-500' : 
                            index === 1 ? 'bg-green-500' : 
                            index === 2 ? 'bg-purple-500' : 'bg-orange-500'
                          }`}
                          style={{ width: `${ticket.percentage}%` }}
                        />
                      </div>
                      <div className="text-xs text-text-muted mt-1">
                        {formatCurrency(ticket.revenue)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Referrers */}
            <div className="bg-background-dark-muted rounded-xl p-6 border border-surface-border">
              <h3 className="font-semibold text-white mb-4">Fuentes de Tráfico</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-surface-border">
                      <th className="text-left py-3 text-sm font-medium text-text-muted">Fuente</th>
                      <th className="text-right py-3 text-sm font-medium text-text-muted">Vistas</th>
                      <th className="text-right py-3 text-sm font-medium text-text-muted">Ventas</th>
                      <th className="text-right py-3 text-sm font-medium text-text-muted">Conversión</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.topReferrers.map((referrer, index) => (
                      <tr key={referrer.source} className="border-b border-surface-border">
                        <td className="py-3 text-sm text-white">{referrer.source}</td>
                        <td className="py-3 text-sm text-right text-text-muted">{referrer.views.toLocaleString()}</td>
                        <td className="py-3 text-sm text-right text-white font-medium">{referrer.sales.toLocaleString()}</td>
                        <td className="py-3 text-sm text-right text-green-400">
                          {((referrer.sales / referrer.views) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'attendees' && (
          <div className="space-y-6">
            {/* Attendees Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white">Lista de Asistentes</h3>
                <p className="text-text-muted">{attendees.length} asistentes registrados</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={exportAttendees}
                  className="flex items-center space-x-2"
                >
                  <Download size={16} />
                  <span>Exportar CSV</span>
                </Button>
                <Button
                  onClick={sendEventUpdate}
                  className="bg-brand-500 hover:bg-brand-600 flex items-center space-x-2"
                >
                  <Mail size={16} />
                  <span>Enviar Comunicación</span>
                </Button>
              </div>
            </div>

            {/* Search */}
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Buscar por nombre, email o ID de ticket..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 border border-surface-border rounded-lg bg-background-dark-muted text-white placeholder-text-muted focus:border-brand-500 focus:outline-none"
                />
              </div>
              <Button variant="outline" className="flex items-center space-x-2">
                <RefreshCw size={16} />
                <span>Actualizar</span>
              </Button>
            </div>

            {/* Attendees Table */}
            <div className="bg-background-dark-muted rounded-xl border border-surface-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-surface-glass">
                    <tr>
                      <th className="text-left py-4 px-6 text-sm font-medium text-text-muted">Asistente</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-text-muted">Ticket</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-text-muted">Compra</th>
                      <th className="text-center py-4 px-6 text-sm font-medium text-text-muted">Check-in</th>
                      <th className="text-center py-4 px-6 text-sm font-medium text-text-muted">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAttendees.map((attendee) => (
                      <tr key={attendee.id} className="border-t border-surface-border">
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-medium text-white">{attendee.name}</p>
                            <p className="text-sm text-text-muted">{attendee.email}</p>
                            <p className="text-xs text-text-muted">{attendee.phone}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-medium text-white">{attendee.ticketType}</p>
                            <p className="text-sm text-text-muted font-mono">{attendee.ticketId}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm text-text-muted">
                            {new Date(attendee.purchaseDate).toLocaleDateString('es-DO', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </td>
                        <td className="py-4 px-6 text-center">
                          {attendee.checkedIn ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                              <CheckCircle2 size={12} className="mr-1" />
                              Confirmado
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400 border border-gray-500/30">
                              <Clock size={12} className="mr-1" />
                              Pendiente
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <Button variant="outline" size="sm">
                              <Mail size={14} />
                            </Button>
                            <Button variant="outline" size="sm">
                              <QrCode size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredAttendees.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-text-muted mx-auto mb-4" />
                  <h4 className="font-semibold text-white mb-2">No se encontraron asistentes</h4>
                  <p className="text-text-muted">
                    {searchTerm ? 'Intenta con un término de búsqueda diferente' : 'Aún no hay asistentes registrados'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-background-dark-muted rounded-xl p-6 border border-surface-border">
              <h3 className="text-xl font-semibold text-white mb-4">Configuración del Evento</h3>
              <p className="text-text-muted">Las opciones de configuración avanzada se implementarán próximamente.</p>
              
              <div className="mt-6 space-y-4">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/organizador/eventos/${params.id}/editar`)}
                  className="flex items-center space-x-2"
                >
                  <Edit3 size={16} />
                  <span>Editar Información del Evento</span>
                </Button>
                
                <div className="flex items-center space-x-3">
                  <Button variant="outline" className="flex items-center space-x-2">
                    <Share2 size={16} />
                    <span>Compartir Evento</span>
                  </Button>
                  
                  <Button variant="outline" className="flex items-center space-x-2">
                    <Settings size={16} />
                    <span>Configuración Avanzada</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}