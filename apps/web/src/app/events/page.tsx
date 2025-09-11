'use client'

import { Button } from '@nfticket/ui'
import { EventsHero } from '../../components/EventsHero'
import { Search, Filter, Plus, Calendar, MapPin, ShoppingCart } from 'lucide-react'

const mockEvents = [
  {
    id: 1,
    name: 'Concierto de Rock 2024',
    date: '15 Diciembre, 2024',
    location: 'Estadio Nacional',
    price: '$50',
    category: 'Música',
    image: 'https://picsum.photos/seed/rock1/400/300',
    description: 'El mejor concierto de rock del año'
  },
  {
    id: 2,
    name: 'Cumbre Web3',
    date: '20 Enero, 2025',
    location: 'Centro de Convenciones',
    price: '$150',
    category: 'Tecnología',
    image: 'https://picsum.photos/seed/tech1/400/300',
    description: 'La conferencia más importante de Web3'
  },
  {
    id: 3,
    name: 'Final de Fútbol',
    date: '5 Febrero, 2025',
    location: 'Estadio Olímpico',
    price: '$75',
    category: 'Deportes',
    image: 'https://picsum.photos/seed/sport1/400/300',
    description: 'Final del campeonato nacional'
  },
  {
    id: 4,
    name: 'Festival de Arte',
    date: '12 Marzo, 2025',
    location: 'Parque Central',
    price: '$25',
    category: 'Arte',
    image: 'https://picsum.photos/seed/art1/400/300',
    description: 'Exposición de arte contemporáneo'
  }
]

export default function EventsPage() {
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
          <Button className="flex items-center space-x-2">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mockEvents.map((event) => (
            <div key={event.id} className="discord-card overflow-hidden">
              <img 
                src={event.image} 
                alt={event.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-1 text-xs bg-surface-glass text-brand-500 rounded-lg">
                    {event.category}
                  </span>
                  <span className="text-lg font-bold text-green-400">
                    {event.price}
                  </span>
                </div>
                <h3 className="font-semibold text-white mb-2">
                  {event.name}
                </h3>
                <p className="text-sm text-gray-300 mb-3">
                  {event.description}
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-text-muted space-x-2">
                    <Calendar size={14} />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center text-sm text-text-muted space-x-2">
                    <MapPin size={14} />
                    <span>{event.location}</span>
                  </div>
                </div>
                <Button size="sm" className="w-full bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center space-x-2">
                  <ShoppingCart size={16} />
                  <span>Comprar Ticket</span>
                </Button>
              </div>
            </div>
          ))}
        </div>

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