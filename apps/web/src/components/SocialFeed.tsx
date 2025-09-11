'use client'

import { Heart, MessageCircle, Share2, Calendar, MapPin } from 'lucide-react'

const feedPosts = [
  {
    id: 1,
    user: {
      name: 'NFTicket Official',
      handle: '@nfticket_official',
      avatar: 'NO',
      verified: true,
      time: 'hace 6d'
    },
    event: {
      title: 'Bad Bunny - World Tour 2024',
      date: '15/3/2024',
      location: 'Estadio Olímpico'
    },
    content: '¡Acabamos de confirmar que Bad Bunny viene a República Dominicana! 🔥 Los boletos salen a la venta mañana. ¿Quién está listo?',
    badge: 'Próximo evento',
    stats: {
      likes: 2847,
      comments: 456,
      shares: 234
    }
  },
  {
    id: 2,
    user: {
      name: 'María Rodríguez',
      handle: '@maria_dev',
      avatar: 'MR',
      verified: false,
      time: 'hace 6d'
    },
    event: {
      title: 'Tech Summit RD 2024',
      date: '15/1/2024',
      location: 'Centro de Convenciones'
    },
    content: 'Increíble experiencia en el Tech Summit! Las charlas sobre IA estuvieron brutales. Ya quiero que sea el próximo año 🚀',
    badge: 'Recuerdo',
    stats: {
      likes: 234,
      comments: 67,
      shares: 45
    }
  },
  {
    id: 3,
    user: {
      name: 'Carlos Martínez',
      handle: '@carlos_music',
      avatar: 'CM',
      verified: false,
      time: 'hace 6d'
    },
    event: {
      title: 'Romeo Santos - Golden Tour',
      date: '14/1/2024',
      location: 'Teatro Nacional'
    },
    content: 'Mi primera vez en un concierto de bachata y fue espectacular! Romeo Santos',
    badge: 'Recuerdo',
    stats: {
      likes: 156,
      comments: 23,
      shares: 12
    }
  }
]

export function SocialFeed() {
  return (
    <div className="space-y-4">
      {feedPosts.map((post) => (
        <div key={post.id} className="bg-[#313338] rounded-lg p-4 lg:p-6 border border-[#404249] hover:border-[#5865f2]/50 transition-all duration-200">
          {/* User Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">{post.user.avatar}</span>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-white">{post.user.name}</span>
                  {post.user.verified && (
                    <span className="text-xs text-blue-400">✓</span>
                  )}
                  <span className="text-sm text-gray-400">{post.user.handle}</span>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-500">{post.user.time}</span>
                </div>
              </div>
            </div>
            <span className={`px-2 py-1 text-xs rounded-lg ${
              post.badge === 'Próximo evento' 
                ? 'bg-orange-500/20 text-orange-300' 
                : 'bg-purple-500/20 text-purple-300'
            }`}>
              {post.badge}
            </span>
          </div>

          {/* Event Info */}
          <div className="mb-4 p-4 bg-[#2b2d31] rounded-lg border border-[#404249]">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <h3 className="font-semibold text-white">{post.event.title}</h3>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center space-x-1">
                <Calendar size={14} />
                <span>{post.event.date}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin size={14} />
                <span>{post.event.location}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <p className="text-gray-200 mb-4 leading-relaxed">
            {post.content}
          </p>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-[#404249]">
            <button className="flex items-center space-x-2 text-gray-400 hover:text-red-400 transition-colors duration-200 group">
              <div className="p-2 rounded-full group-hover:bg-red-500/10">
                <Heart size={16} />
              </div>
              <span className="text-sm">{post.stats.likes}</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-colors duration-200 group">
              <div className="p-2 rounded-full group-hover:bg-blue-500/10">
                <MessageCircle size={16} />
              </div>
              <span className="text-sm">{post.stats.comments}</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-400 hover:text-green-400 transition-colors duration-200 group">
              <div className="p-2 rounded-full group-hover:bg-green-500/10">
                <Share2 size={16} />
              </div>
              <span className="text-sm">Compartir</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}