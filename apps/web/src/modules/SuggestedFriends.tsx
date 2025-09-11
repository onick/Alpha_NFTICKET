'use client'

import { UserPlus, Music, Calendar, Star, Users } from 'lucide-react'

export function SuggestedFriends() {
  const suggestedUsers = [
    {
      id: 1,
      name: 'María González',
      username: '@mariagdz',
      avatar: 'https://picsum.photos/seed/maria1/200/200',
      verified: false,
      followers: '2.1K',
      mutualFriends: 12,
      interests: ['Reggaeton', 'Conciertos'],
      lastEvent: 'Bad Bunny Concert',
      isFollowing: false
    },
    {
      id: 2,
      name: 'Carlos Martínez',
      username: '@carlosmtz',
      avatar: 'https://picsum.photos/seed/carlos2/200/200',
      verified: true,
      followers: '8.7K',
      mutualFriends: 8,
      interests: ['EDM', 'Festivales'],
      lastEvent: 'Ultra Music Festival',
      isFollowing: false
    },
    {
      id: 3,
      name: 'Ana Rodríguez',
      username: '@anarodz',
      avatar: 'https://picsum.photos/seed/ana3/200/200',
      verified: false,
      followers: '1.5K',
      mutualFriends: 15,
      interests: ['Bachata', 'Salsa'],
      lastEvent: 'Romeo Santos',
      isFollowing: false
    },
    {
      id: 4,
      name: 'DJ Phoenix',
      username: '@djphoenix',
      avatar: 'https://picsum.photos/seed/djphoenix4/200/200',
      verified: true,
      followers: '24.3K',
      mutualFriends: 3,
      interests: ['House', 'Techno'],
      lastEvent: 'Tomorrowland',
      isFollowing: false
    }
  ]

  return (
    <div className="discord-card animate-in slide-in-from-top-4 fade-in duration-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <UserPlus className="text-blue-400 animate-bounce" size={20} style={{animationDuration: '2s'}} />
          <h2 className="text-lg font-semibold text-white">A quién seguir</h2>
        </div>
        <button className="text-sm text-gray-400 hover:text-white transition-colors">
          Ver todos
        </button>
      </div>

      <div className="space-y-4">
        {suggestedUsers.map((user, index) => (
          <div 
            key={user.id} 
            className="group bg-[#1e1f26] hover:bg-[#2a2d38] rounded-lg p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-md animate-in slide-in-from-right-4 fade-in"
            style={{
              animationDelay: `${(index * 150) + 200}ms`,
              animationDuration: '700ms'
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {user.verified && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <Star size={8} className="text-white fill-current" />
                    </div>
                  )}
                </div>

                {/* User info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-semibold text-white group-hover:text-purple-400 transition-colors">
                      {user.name}
                    </h3>
                  </div>
                  
                  <p className="text-xs text-gray-400 mb-1">{user.username}</p>
                  
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="flex items-center space-x-1">
                      <Users size={12} className="text-gray-400" />
                      <span className="text-xs text-gray-400">{user.followers} seguidores</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {user.mutualFriends} amigos en común
                    </div>
                  </div>

                  {/* Interests tags */}
                  <div className="flex items-center space-x-1 mb-2">
                    {user.interests.slice(0, 2).map((interest, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 text-xs bg-gray-700/50 text-gray-300 rounded-full"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>

                  {/* Last event */}
                  <div className="flex items-center space-x-1">
                    <Calendar size={12} className="text-gray-400" />
                    <span className="text-xs text-gray-400">
                      Último evento: {user.lastEvent}
                    </span>
                  </div>
                </div>
              </div>

              {/* Follow button */}
              <button 
                className="flex-shrink-0 px-3 py-1.5 text-xs bg-purple-500 hover:bg-purple-600 text-white rounded-full transition-all duration-200 flex items-center space-x-1 hover:scale-105 active:scale-95"
              >
                <UserPlus size={12} className="transition-transform duration-200 group-hover:rotate-12" />
                <span>Seguir</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Ver más button */}
      <button className="w-full mt-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-[#404249] rounded-lg transition-colors duration-200">
        Descubrir más personas
      </button>
    </div>
  )
}