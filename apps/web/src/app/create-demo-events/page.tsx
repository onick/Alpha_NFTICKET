'use client'

import { useEffect, useState } from 'react'
import { Button } from '@nfticket/ui'
import { getEcosystemManager, Event } from '@/lib/ecosystem-integration'

export default function CreateDemoEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [isCreating, setIsCreating] = useState(false)

  const loadEvents = () => {
    const manager = getEcosystemManager()
    if (manager) {
      const publishedEvents = manager.getPublishedEvents()
      setEvents(publishedEvents)
    }
  }

  useEffect(() => {
    loadEvents()
  }, [])

  const createDemoEvents = async () => {
    setIsCreating(true)
    try {
      const manager = getEcosystemManager()
      if (!manager) return

      // Crear organizador demo si no existe
      let organizerId = 'demo_organizer_123'
      
      // Eventos de demostración
      const demoEvents = [
        {
          organizerId,
          name: 'Festival de Música Electrónica Dominican Beats',
          description: 'El festival de música electrónica más grande de República Dominicana con DJs internacionales y locales.',
          detailedDescription: 'Una experiencia única que combina los mejores DJs internacionales con el talento local dominicano. Tres escenarios, efectos visuales espectaculares y la mejor producción audiovisual del país.',
          bannerImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
          category: 'Música',
          tags: ['electronica', 'festival', 'dj', 'internacional'],
          eventType: 'physical' as const,
          venue: 'Estadio Olímpico Santo Domingo',
          address: 'Av. John F. Kennedy, Santo Domingo',
          city: 'Santo Domingo',
          country: 'República Dominicana',
          startDate: '2025-02-15',
          startTime: '18:00',
          endDate: '2025-02-16',
          endTime: '02:00',
          timezone: 'America/Santo_Domingo',
          ticketTypes: [
            {
              id: '', // Se generará automáticamente
              name: 'General',
              description: 'Acceso general al festival',
              price: 2500,
              quantity: 1000,
              sold: 0
            },
            {
              id: '', // Se generará automáticamente
              name: 'VIP',
              description: 'Acceso VIP con área exclusiva y bebidas incluidas',
              price: 5000,
              quantity: 200,
              sold: 0
            }
          ],
          status: 'published' as const,
          isPublic: true,
          allowTransfers: true,
          refundPolicy: 'Reembolso completo hasta 7 días antes del evento'
        },
        {
          organizerId,
          name: 'Conferencia Tech Caribbean 2025',
          description: 'La conferencia de tecnología más importante del Caribe con speakers internacionales.',
          detailedDescription: 'Dos días de conferencias magistrales, workshops prácticos y networking con los líderes tecnológicos más importantes de la región y el mundo.',
          bannerImage: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=600&fit=crop',
          category: 'Tecnología',
          tags: ['tecnologia', 'conferencia', 'innovation', 'networking'],
          eventType: 'physical' as const,
          venue: 'Centro de Convenciones Hotel Jaragua',
          address: 'Av. George Washington 367, Santo Domingo',
          city: 'Santo Domingo',
          country: 'República Dominicana',
          startDate: '2025-03-08',
          startTime: '09:00',
          endDate: '2025-03-09',
          endTime: '18:00',
          timezone: 'America/Santo_Domingo',
          ticketTypes: [
            {
              id: '',
              name: 'Estudiante',
              description: 'Acceso para estudiantes universitarios',
              price: 1500,
              quantity: 300,
              sold: 0
            },
            {
              id: '',
              name: 'Profesional',
              description: 'Acceso completo + materiales digitales',
              price: 3500,
              quantity: 500,
              sold: 0
            },
            {
              id: '',
              name: 'Premium',
              description: 'Acceso + almuerzo + networking VIP',
              price: 6000,
              quantity: 100,
              sold: 0
            }
          ],
          status: 'published' as const,
          isPublic: true,
          allowTransfers: false,
          refundPolicy: 'No hay reembolsos. Transferencias permitidas hasta 48h antes.'
        },
        {
          organizerId,
          name: 'Salsa Night - Malecón Social Club',
          description: 'Noche de salsa con orquestas en vivo y los mejores bailarines de la ciudad.',
          detailedDescription: 'Una velada espectacular con tres orquestas en vivo, clases de salsa para principiantes, competencia de baile y la mejor gastronomía caribeña.',
          bannerImage: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=600&fit=crop',
          category: 'Música',
          tags: ['salsa', 'baile', 'orquesta', 'social'],
          eventType: 'physical' as const,
          venue: 'Malecón Social Club',
          address: 'Av. George Washington 500, Santo Domingo',
          city: 'Santo Domingo',
          country: 'República Dominicana',
          startDate: '2025-01-25',
          startTime: '20:00',
          endDate: '2025-01-26',
          endTime: '03:00',
          timezone: 'America/Santo_Domingo',
          ticketTypes: [
            {
              id: '',
              name: 'Mesa Regular',
              description: 'Mesa para 6 personas + 2 botellas',
              price: 8000,
              quantity: 50,
              sold: 0
            },
            {
              id: '',
              name: 'Mesa VIP',
              description: 'Mesa premium + servicio exclusivo + 3 botellas',
              price: 15000,
              quantity: 20,
              sold: 0
            }
          ],
          status: 'published' as const,
          isPublic: true,
          allowTransfers: true,
          refundPolicy: 'Reembolso del 50% hasta 3 días antes del evento'
        },
        {
          organizerId,
          name: 'Masterclass de Fotografía Digital',
          description: 'Taller intensivo de fotografía digital con equipos profesionales incluidos.',
          detailedDescription: 'Masterclass de 8 horas con fotógrafos profesionales internacionales. Incluye uso de equipos Canon y Sony, modelos profesionales y sesión práctica en exteriores.',
          bannerImage: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop',
          category: 'Educación',
          tags: ['fotografia', 'masterclass', 'digital', 'profesional'],
          eventType: 'physical' as const,
          venue: 'Studio Creativo RD',
          address: 'Calle Mercedes 108, Zona Colonial',
          city: 'Santo Domingo',
          country: 'República Dominicana',
          startDate: '2025-02-01',
          startTime: '09:00',
          endDate: '2025-02-01',
          endTime: '17:00',
          timezone: 'America/Santo_Domingo',
          ticketTypes: [
            {
              id: '',
              name: 'Workshop Completo',
              description: 'Masterclass + almuerzo + certificado + portfolio review',
              price: 4500,
              quantity: 25,
              sold: 0
            }
          ],
          status: 'published' as const,
          isPublic: true,
          allowTransfers: false,
          refundPolicy: 'Reembolso completo hasta 5 días antes. No hay reembolsos después.'
        }
      ]

      // Crear cada evento
      demoEvents.forEach(eventData => {
        const event = manager.createEvent(eventData)
        console.log('Evento creado:', event.name)
      })

      // Recargar eventos
      loadEvents()
      alert('¡4 eventos de demostración creados exitosamente!')
      
    } catch (error) {
      console.error('Error creando eventos demo:', error)
      alert('Error creando eventos: ' + error)
    } finally {
      setIsCreating(false)
    }
  }

  const clearAllEvents = () => {
    const manager = getEcosystemManager()
    if (manager && confirm('¿Estás seguro? Esto eliminará TODOS los datos del sistema.')) {
      manager.clearAllData()
      loadEvents()
      alert('Todos los datos eliminados.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-white mb-4">Gestión de Eventos Demo</h1>
          <p className="text-gray-300 mb-6">
            Esta página te permite crear eventos de demostración que aparecerán en /events
          </p>
          
          <div className="flex space-x-4 mb-6">
            <Button 
              onClick={createDemoEvents}
              disabled={isCreating}
              className="bg-green-600 hover:bg-green-700"
            >
              {isCreating ? 'Creando...' : 'Crear 4 Eventos Demo'}
            </Button>
            
            <Button 
              onClick={clearAllEvents}
              variant="outline"
              className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
            >
              Limpiar Todos los Datos
            </Button>
            
            <Button 
              onClick={loadEvents}
              variant="outline"
            >
              Recargar Lista
            </Button>

            <Button 
              onClick={() => window.location.href = '/events'}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Ver Página /events
            </Button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">
            Eventos Publicados ({events.length})
          </h2>
          
          {events.length === 0 ? (
            <p className="text-gray-400">No hay eventos publicados aún.</p>
          ) : (
            <div className="space-y-4">
              {events.map(event => (
                <div key={event.id} className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-white font-semibold">{event.name}</h3>
                      <p className="text-gray-300 text-sm mt-1">{event.description}</p>
                      <div className="flex space-x-4 text-xs text-gray-400 mt-2">
                        <span>📅 {event.startDate} {event.startTime}</span>
                        <span>📍 {event.venue}</span>
                        <span>🎟️ {event.ticketTypes.length} tipos</span>
                        <span>👁️ {event.views} vistas</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded text-xs ${
                        event.status === 'published' ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'
                      }`}>
                        {event.status}
                      </span>
                      <div className="text-xs text-gray-400 mt-1">
                        {event.isPublic ? '🌍 Público' : '🔒 Privado'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}