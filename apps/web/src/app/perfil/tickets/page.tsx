'use client'

import { useState, useEffect } from 'react'
import { Button } from '@nfticket/ui'
import { 
  ArrowLeft, 
  Ticket, 
  Calendar, 
  MapPin, 
  Download, 
  Share2, 
  QrCode,
  Clock,
  User,
  Filter,
  Search
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface UserTicket {
  id: string
  orderId: string
  event: {
    name: string
    date: string
    time: string
    location: string
    image: string
    slug: string
  }
  ticketType: string
  ticketPrice: number
  purchaseDate: string
  status: 'active' | 'used' | 'expired' | 'transferred'
  transferredTo?: string
  qrCode: string
  seatNumber?: string
}

// Mock user tickets - in real app, this would come from API
const mockUserTickets: UserTicket[] = [
  {
    id: 'TIK-1703123456-ABC123',
    orderId: 'ORD-1703123456789',
    event: {
      name: 'Bad Bunny - World Tour 2024',
      date: '15 de Marzo, 2024',
      time: '8:00 PM',
      location: 'Estadio Olímpico Félix Sánchez',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&crop=center',
      slug: 'bad-bunny-world-tour-2024'
    },
    ticketType: 'VIP',
    ticketPrice: 350,
    purchaseDate: '2024-01-15T10:30:00Z',
    status: 'active',
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=TIK-1703123456-ABC123'
  },
  {
    id: 'TIK-1703123457-DEF456',
    orderId: 'ORD-1703123456789',
    event: {
      name: 'Bad Bunny - World Tour 2024',
      date: '15 de Marzo, 2024',
      time: '8:00 PM',
      location: 'Estadio Olímpico Félix Sánchez',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&crop=center',
      slug: 'bad-bunny-world-tour-2024'
    },
    ticketType: 'VIP',
    ticketPrice: 350,
    purchaseDate: '2024-01-15T10:30:00Z',
    status: 'active',
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=TIK-1703123457-DEF456'
  },
  {
    id: 'TIK-1702000000-OLD123',
    orderId: 'ORD-1702000000000',
    event: {
      name: 'Concierto de Año Nuevo 2024',
      date: '31 de Diciembre, 2023',
      time: '11:00 PM',
      location: 'Teatro Nacional',
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=600&fit=crop',
      slug: 'concierto-ano-nuevo-2024'
    },
    ticketType: 'General',
    ticketPrice: 75,
    purchaseDate: '2023-12-01T14:20:00Z',
    status: 'used',
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=TIK-1702000000-OLD123'
  }
]

const statusConfig = {
  active: { 
    label: 'Activo', 
    color: 'bg-green-500/20 text-green-400 border-green-500/30',
    icon: '✅'
  },
  used: { 
    label: 'Utilizado', 
    color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    icon: '✓'
  },
  expired: { 
    label: 'Expirado', 
    color: 'bg-red-500/20 text-red-400 border-red-500/30',
    icon: '❌'
  },
  transferred: { 
    label: 'Transferido', 
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    icon: '↗️'
  }
}

export default function MyTicketsPage() {
  const router = useRouter()
  const [tickets, setTickets] = useState<UserTicket[]>([])
  const [filteredTickets, setFilteredTickets] = useState<UserTicket[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading tickets
    setTimeout(() => {
      setTickets(mockUserTickets)
      setFilteredTickets(mockUserTickets)
      setIsLoading(false)
    }, 1000)
  }, [])

  useEffect(() => {
    let filtered = tickets

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(ticket => 
        ticket.event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.orderId.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === statusFilter)
    }

    setFilteredTickets(filtered)
  }, [tickets, searchTerm, statusFilter])

  const downloadTicket = (ticket: UserTicket) => {
    // This would use the ticket generator
    alert(`Descargando ticket para ${ticket.event.name}`)
  }

  const transferTicket = (ticket: UserTicket) => {
    // This would open a transfer modal
    alert(`Función de transferencia para ticket ${ticket.id} será implementada`)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-DO', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-white">Cargando tus tickets...</p>
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
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-text-muted hover:text-white"
            >
              <ArrowLeft size={20} />
              <span>Volver</span>
            </Button>
            <h1 className="text-xl font-bold text-white">Mis Tickets</h1>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-background-dark-muted rounded-xl p-4 border border-surface-border text-center">
            <div className="text-2xl font-bold text-white">{tickets.filter(t => t.status === 'active').length}</div>
            <div className="text-sm text-text-muted">Activos</div>
          </div>
          <div className="bg-background-dark-muted rounded-xl p-4 border border-surface-border text-center">
            <div className="text-2xl font-bold text-white">{tickets.filter(t => t.status === 'used').length}</div>
            <div className="text-sm text-text-muted">Utilizados</div>
          </div>
          <div className="bg-background-dark-muted rounded-xl p-4 border border-surface-border text-center">
            <div className="text-2xl font-bold text-white">{tickets.length}</div>
            <div className="text-sm text-text-muted">Total</div>
          </div>
          <div className="bg-background-dark-muted rounded-xl p-4 border border-surface-border text-center">
            <div className="text-2xl font-bold text-brand-400">
              RD${tickets.reduce((sum, t) => sum + t.ticketPrice, 0).toLocaleString()}
            </div>
            <div className="text-sm text-text-muted">Invertido</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Buscar por evento o número de orden..."
              className="pl-10 pr-4 py-2 w-full border border-surface-border rounded-lg bg-background-dark-muted text-white placeholder-text-muted focus:border-brand-500 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="px-4 py-2 border border-surface-border rounded-lg bg-background-dark-muted text-white focus:border-brand-500 focus:outline-none min-w-[160px]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="used">Utilizados</option>
            <option value="expired">Expirados</option>
            <option value="transferred">Transferidos</option>
          </select>
        </div>

        {/* Tickets Grid */}
        {filteredTickets.length === 0 ? (
          <div className="text-center py-12">
            <Ticket className="h-16 w-16 text-text-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {tickets.length === 0 ? 'No tienes tickets aún' : 'No se encontraron tickets'}
            </h3>
            <p className="text-text-muted mb-6">
              {tickets.length === 0 
                ? 'Compra tu primer ticket para empezar a disfrutar eventos increíbles'
                : 'Intenta cambiar los filtros de búsqueda'
              }
            </p>
            {tickets.length === 0 && (
              <Button 
                onClick={() => router.push('/events')}
                className="bg-brand-500 hover:bg-brand-600"
              >
                Ver Eventos Disponibles
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredTickets.map((ticket) => (
              <div 
                key={ticket.id} 
                className="bg-background-dark-muted rounded-2xl p-6 border border-surface-border hover:border-brand-400/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${statusConfig[ticket.status].color}`}>
                      {statusConfig[ticket.status].icon} {statusConfig[ticket.status].label}
                    </span>
                    <span className="px-3 py-1 bg-brand-500/20 text-brand-400 text-xs font-medium rounded-full">
                      {ticket.ticketType}
                    </span>
                  </div>
                  <img 
                    src={ticket.qrCode} 
                    alt="QR Code" 
                    className="w-12 h-12 rounded"
                  />
                </div>

                <div className="flex space-x-4 mb-4">
                  <img 
                    src={ticket.event.image} 
                    alt={ticket.event.name}
                    className="w-16 h-16 object-cover rounded-xl"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-lg mb-1 truncate">
                      {ticket.event.name}
                    </h3>
                    <div className="space-y-1 text-sm text-text-muted">
                      <div className="flex items-center space-x-2">
                        <Calendar size={14} className="text-brand-400" />
                        <span>{ticket.event.date} • {ticket.event.time}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin size={14} className="text-brand-400" />
                        <span className="truncate">{ticket.event.location}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-text-muted mb-4">
                  <div>
                    <span className="text-gray-400">Ticket ID: </span>
                    <span className="font-mono">{ticket.id}</span>
                  </div>
                  <div className="text-xl font-bold text-white">
                    RD${ticket.ticketPrice.toLocaleString()}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => downloadTicket(ticket)}
                    className="flex-1 bg-brand-500 hover:bg-brand-600"
                    disabled={ticket.status === 'expired'}
                  >
                    <Download size={16} className="mr-2" />
                    Descargar
                  </Button>
                  {ticket.status === 'active' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => transferTicket(ticket)}
                      className="flex-1"
                    >
                      <Share2 size={16} className="mr-2" />
                      Transferir
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/evento/${ticket.event.slug}`)}
                  >
                    <QrCode size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}