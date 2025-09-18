'use client'

import { useState } from 'react'
import { EventGroupModal } from '@/components/EventGroupModal'
import { Users, Calendar, MapPin } from 'lucide-react'

export default function GroupsDemoPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Mock event data
  const mockEvent = {
    id: 'event_bad_bunny_2024',
    name: 'Bad Bunny - World\'s Hottest Tour',
    date: '2024-02-15',
    location: 'Estadio El Campín, Bogotá'
  }

  return (
    <div className="min-h-screen bg-[#1a1d21] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            🎯 Sistema de Grupos para Eventos
          </h1>
          <p className="text-gray-400 text-lg">
            Organiza viajes y encuentra compañeros para eventos
          </p>
        </div>

        {/* Event Card Demo */}
        <div className="bg-[#2b2d31] rounded-xl p-6 mb-8 border border-[#404249]">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-white mb-2">
                {mockEvent.name}
              </h2>
              <div className="flex items-center space-x-4 text-gray-400 text-sm mb-4">
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {new Date(mockEvent.date).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                <span className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  {mockEvent.location}
                </span>
              </div>
              
              <p className="text-gray-300 mb-4">
                ¡No te pierdas el mejor concierto del año! Bad Bunny llega a Bogotá con su gira mundial.
                Únete a grupos de otros asistentes para organizar tu viaje, compartir transporte y 
                vivir la experiencia al máximo.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Users className="h-5 w-5" />
                  <span>Ver Grupos</span>
                </button>
                
                <button className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors">
                  <span>Comprar Tickets</span>
                </button>
              </div>
            </div>
            
            <div className="ml-6">
              <img 
                src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop&crop=face"
                alt="Bad Bunny Concert"
                className="w-32 h-32 object-cover rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Features Preview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#2b2d31] rounded-lg p-6 border border-[#404249]">
            <div className="bg-purple-500/20 p-3 rounded-lg w-fit mb-4">
              <Users className="h-6 w-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Crear Grupos
            </h3>
            <p className="text-gray-400 text-sm">
              Organiza grupos para viajes, encuentra compañeros con tickets VIP o 
              comparte transporte desde tu zona.
            </p>
          </div>

          <div className="bg-[#2b2d31] rounded-lg p-6 border border-[#404249]">
            <div className="bg-green-500/20 p-3 rounded-lg w-fit mb-4">
              <Calendar className="h-6 w-6 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Coordinar Encuentros
            </h3>
            <p className="text-gray-400 text-sm">
              Define puntos y horarios de encuentro, organiza actividades pre-evento 
              y mantén a todos informados.
            </p>
          </div>

          <div className="bg-[#2b2d31] rounded-lg p-6 border border-[#404249]">
            <div className="bg-blue-500/20 p-3 rounded-lg w-fit mb-4">
              <MapPin className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Verificación Segura
            </h3>
            <p className="text-gray-400 text-sm">
              Únete solo a grupos con tickets verificados para garantizar que 
              todos realmente asistirán al evento.
            </p>
          </div>
        </div>

        {/* How it Works */}
        <div className="bg-[#2b2d31] rounded-xl p-6 border border-[#404249]">
          <h3 className="text-xl font-semibold text-white mb-6 text-center">
            ¿Cómo funciona?
          </h3>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-purple-500/20 p-4 rounded-full w-fit mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-400">1</span>
              </div>
              <h4 className="font-semibold text-white mb-2">Explora Grupos</h4>
              <p className="text-gray-400 text-sm">
                Ve grupos existentes o crea uno nuevo para el evento
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-500/20 p-4 rounded-full w-fit mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-400">2</span>
              </div>
              <h4 className="font-semibold text-white mb-2">Únete</h4>
              <p className="text-gray-400 text-sm">
                Solicita unirte al grupo que más te guste
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-500/20 p-4 rounded-full w-fit mx-auto mb-4">
                <span className="text-2xl font-bold text-green-400">3</span>
              </div>
              <h4 className="font-semibold text-white mb-2">Organiza</h4>
              <p className="text-gray-400 text-sm">
                Planea el viaje, punto de encuentro y actividades
              </p>
            </div>

            <div className="text-center">
              <div className="bg-yellow-500/20 p-4 rounded-full w-fit mx-auto mb-4">
                <span className="text-2xl font-bold text-yellow-400">4</span>
              </div>
              <h4 className="font-semibold text-white mb-2">¡Disfruta!</h4>
              <p className="text-gray-400 text-sm">
                Vive la experiencia con tus nuevos amigos
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Group Modal */}
      <EventGroupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        event={mockEvent}
      />
    </div>
  )
}