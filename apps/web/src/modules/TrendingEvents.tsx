'use client'

import { TrendingUp, Calendar, MapPin, Users, Flame } from 'lucide-react'

export function TrendingEvents() {
  const trendingEvents = [
    {
      id: 1,
      title: 'Bad Bunny - World Tour 2024',
      location: 'Estadio Olímpico, Santo Domingo',
      date: '15 Mar',
      attendees: '45.2K',
      trend: '+127%',
      image: 'https://picsum.photos/seed/badbunny1/400/240',
      category: 'Reggaeton'
    },
    {
      id: 2,
      title: 'Tomorrowland República Dominicana',
      location: 'Cap Cana, Punta Cana',
      date: '22 Mar',
      attendees: '12.8K',
      trend: '+89%',
      image: 'https://picsum.photos/seed/tomorrowland2/400/240',
      category: 'EDM'
    },
    {
      id: 3,
      title: 'Festival Presidente 2024',
      location: 'Malecón de Santo Domingo',
      date: '28 Mar',
      attendees: '28.5K',
      trend: '+65%',
      image: 'https://picsum.photos/seed/presidente3/400/240',
      category: 'Festival'
    },
    {
      id: 4,
      title: 'Romeo Santos - Golden Tour',
      location: 'Palacio de los Deportes',
      date: '5 Abr',
      attendees: '18.7K',
      trend: '+43%',
      image: 'https://picsum.photos/seed/romeosantos4/400/240',
      category: 'Bachata'
    }
  ]

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
        {trendingEvents.map((event, index) => (
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
                  src={event.image} 
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Event info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-medium text-white group-hover:text-purple-400 transition-colors line-clamp-1 flex-1 mr-2">
                    {event.title}
                  </h3>
                  
                  {/* Category badge - moved to title line */}
                  <span className="px-2 py-1 text-xs font-medium bg-gray-800/80 text-gray-300 rounded-md backdrop-blur-sm border border-[#404249] flex-shrink-0">
                    {event.category}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex items-center space-x-1">
                    <Calendar size={12} className="text-gray-400" />
                    <span className="text-xs text-gray-400">{event.date}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users size={12} className="text-gray-400" />
                    <span className="text-xs text-gray-400">{event.attendees}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center space-x-1 flex-1 min-w-0 mr-2">
                    <MapPin size={12} className="text-gray-400 flex-shrink-0" />
                    <span className="text-xs text-gray-400 truncate">{event.location}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <TrendingUp size={12} className="text-green-400" />
                    <span className="text-xs text-green-400 font-medium">{event.trend}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Ver más button */}
      <button className="w-full mt-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-[#404249] rounded-lg transition-colors duration-200">
        Ver más eventos trending
      </button>
    </div>
  )
}