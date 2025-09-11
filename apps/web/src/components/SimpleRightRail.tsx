'use client'

import { TrendingUp, Calendar, BarChart3 } from 'lucide-react'

export function SimpleRightRail() {
  return (
    <div className="space-y-6">
      {/* Trending Communities Card */}
      <div className="card-right-rail">
        <h3 className="font-semibold text-white mb-4 flex items-center space-x-2">
          <TrendingUp size={18} className="text-brand-500" />
          <span>Comunidades Trending</span>
        </h3>
        <div className="space-y-3">
          {['Eventos Tech', 'Amantes de la Música', 'Fanáticos del Deporte'].map((community) => (
            <div key={community} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-brand-500 to-brand-600 rounded-full"></div>
                <span className="text-sm font-medium text-text-muted">{community}</span>
              </div>
              <button className="text-xs text-brand-500 hover:text-brand-600 font-medium">
                Unirse
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested Events Card */}
      <div className="card-right-rail">
        <h3 className="font-semibold text-white mb-4 flex items-center space-x-2">
          <Calendar size={18} className="text-brand-500" />
          <span>Eventos Sugeridos</span>
        </h3>
        <div className="space-y-4">
          {[
            { name: 'Cumbre Web3 2024', date: 'Dic 15', price: '$150' },
            { name: 'Festival de Rock', date: 'Ene 20', price: '$75' },
          ].map((event) => (
            <div key={event.name} className="border-l-4 border-brand-500 pl-3">
              <h4 className="font-medium text-white text-sm">{event.name}</h4>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-text-muted">{event.date}</span>
                <span className="text-xs font-medium text-brand-500">{event.price}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats Card */}
      <div className="card-right-rail">
        <h3 className="font-semibold text-white mb-4 flex items-center space-x-2">
          <BarChart3 size={18} className="text-brand-500" />
          <span>Tu Actividad</span>
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-brand-500">12</div>
            <div className="text-xs text-text-muted">Eventos Asistidos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">8</div>
            <div className="text-xs text-text-muted">NFTs Poseídos</div>
          </div>
        </div>
      </div>
    </div>
  )
}