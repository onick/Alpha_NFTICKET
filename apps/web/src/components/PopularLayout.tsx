'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Users, Hash, MessageCircle, Heart, Share2, Eye, Trophy, Zap, Clock, Star } from 'lucide-react'
import { SimpleSidebar } from './SimpleSidebar'
import { ModularLayout } from './ModularLayout'
import { TrendingEvents } from '../modules/TrendingEvents'

interface TrendingPost {
  id: string
  type: 'purchase' | 'review' | 'photo' | 'achievement'
  user: {
    name: string
    avatar: string
    username: string
    verified?: boolean
  }
  content: string
  media?: string
  event?: {
    name: string
    image: string
    venue: string
    date: string
  }
  metrics: {
    likes: number
    comments: number
    shares: number
    views: number
  }
  timestamp: string
  isHot?: boolean
  trending_score: number
}

interface TrendingHashtag {
  tag: string
  posts: number
  growth: number
  category: 'eventos' | 'música' | 'tech' | 'deporte'
}

interface PopularUser {
  id: string
  name: string
  username: string
  avatar: string
  followers: number
  tickets_purchased: number
  events_attended: number
  influence_score: number
  badge?: string
  verified?: boolean
}

interface TrendingEvent {
  id: string
  name: string
  image: string
  venue: string
  date: string
  price_range: string
  availability: string // "Good Availability", "Limited", "Nearly Sold Out"
  demand_level: string // "Low", "Moderate", "High", "Very High", "Extreme"
  trending_score: number
  social_mentions: number
  hashtags: string[]
}

export function PopularLayout() {
  const [activeTab, setActiveTab] = useState<'all' | 'events' | 'posts' | 'users' | 'hashtags'>('all')
  const [trendingPosts, setTrendingPosts] = useState<TrendingPost[]>([])
  const [trendingHashtags, setTrendingHashtags] = useState<TrendingHashtag[]>([])
  const [popularUsers, setPopularUsers] = useState<PopularUser[]>([])
  const [trendingEvents, setTrendingEvents] = useState<TrendingEvent[]>([])

  useEffect(() => {
    // Load safe metrics data (no sensitive business information exposed)
    setTrendingPosts([
      {
        id: '1',
        type: 'purchase',
        user: {
          name: 'María González',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face',
          username: 'mariag_music',
          verified: true
        },
        content: '¡Acabo de conseguir tickets VIP para Romeo Santos! 🎤✨ No puedo esperar, va a ser épico. #RomeoSantos #ConciertosRD',
        event: {
          name: 'Romeo Santos - Golden Tour',
          image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
          venue: 'Palacio de los Deportes',
          date: '2024-12-15'
        },
        metrics: {
          likes: 847,
          comments: 156,
          shares: 203,
          views: 12400
        },
        timestamp: 'hace 2 horas',
        isHot: true,
        trending_score: 95.2
      },
      {
        id: '2',
        type: 'photo',
        user: {
          name: 'Carlos Rivera',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          username: 'carlostech',
          verified: false
        },
        content: 'La mejor experiencia en Tech Summit RD 2024! 🚀 La keynote sobre IA fue increíble. Ya tengo mi ticket para el próximo año.',
        media: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&h=400&fit=crop',
        event: {
          name: 'Tech Summit RD 2024',
          image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop',
          venue: 'Centro de Convenciones',
          date: '2024-11-20'
        },
        metrics: {
          likes: 634,
          comments: 89,
          shares: 145,
          views: 8900
        },
        timestamp: 'hace 5 horas',
        isHot: true,
        trending_score: 87.8
      },
      {
        id: '3',
        type: 'achievement',
        user: {
          name: 'Ana Herrera',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
          username: 'ana_events',
          verified: true
        },
        content: '🏆 ¡Completé mi 50vo evento este año! Desde conciertos hasta conferencias tech. NFTicket ha hecho que coleccionar experiencias sea increíble.',
        metrics: {
          likes: 523,
          comments: 67,
          shares: 98,
          views: 6700
        },
        timestamp: 'hace 8 horas',
        trending_score: 76.4
      }
    ])

    setTrendingHashtags([
      { tag: '#ConciertosRD', posts: 1247, growth: 45.2, category: 'música' },
      { tag: '#TechSummitRD', posts: 856, growth: 89.1, category: 'tech' },
      { tag: '#RomeoSantos', posts: 634, growth: 156.7, category: 'música' },
      { tag: '#EventosRD', posts: 445, growth: 23.4, category: 'eventos' },
      { tag: '#NFTicket', posts: 378, growth: 67.8, category: 'eventos' }
    ])

    setPopularUsers([
      {
        id: '1',
        name: 'María González',
        username: 'mariag_music',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face',
        followers: 12400,
        tickets_purchased: 67,
        events_attended: 45,
        influence_score: 94.2,
        badge: 'Influencer Musical',
        verified: true
      },
      {
        id: '2',
        name: 'Carlos Rivera',
        username: 'carlostech',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        followers: 8900,
        tickets_purchased: 34,
        events_attended: 28,
        influence_score: 87.6,
        badge: 'Tech Pioneer'
      },
      {
        id: '3',
        name: 'Ana Herrera',
        username: 'ana_events',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        followers: 6700,
        tickets_purchased: 89,
        events_attended: 56,
        influence_score: 91.3,
        badge: 'Event Collector',
        verified: true
      }
    ])

    setTrendingEvents([
      {
        id: '1',
        name: 'Romeo Santos - Golden Tour',
        image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
        venue: 'Palacio de los Deportes',
        date: '2024-12-15',
        price_range: 'RD$2,500 - RD$8,500',
        availability: 'Limited Availability',
        demand_level: 'Extreme Demand',
        trending_score: 98.7,
        social_mentions: 1247,
        hashtags: ['#RomeoSantos', '#ConciertosRD', '#GoldenTour']
      },
      {
        id: '2',
        name: 'Tech Summit RD 2025',
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop',
        venue: 'Centro de Convenciones',
        date: '2025-03-10',
        price_range: 'RD$1,200 - RD$3,500',
        availability: 'Good Availability',
        demand_level: 'High Demand',
        trending_score: 89.2,
        social_mentions: 856,
        hashtags: ['#TechSummitRD', '#IA', '#Tecnología']
      }
    ])
  }, [])

  const getTrendingIcon = (score: number) => {
    if (score >= 90) return <Zap className="text-red-400" size={14} />
    if (score >= 80) return <TrendingUp className="text-orange-400" size={14} />
    return <Clock className="text-yellow-400" size={14} />
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const PopularContent = () => (
    <div className="space-y-6">
      {/* Live Update Indicator */}
      <div className="flex justify-end">
        <div className="flex items-center space-x-1 px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm">
          <Zap size={14} />
          <span>Actualizado en vivo</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-2 bg-[#313338] p-1 rounded-lg border border-[#404249]">
        {[
          { id: 'all', label: 'Todo', icon: TrendingUp },
          { id: 'events', label: 'Eventos', icon: Star },
          { id: 'posts', label: 'Posts', icon: MessageCircle },
          { id: 'users', label: 'Usuarios', icon: Users },
          { id: 'hashtags', label: 'Hashtags', icon: Hash }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-brand-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-[#404249]/50'
            }`}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content based on active tab */}
      <div className="space-y-6">
        {(activeTab === 'all' || activeTab === 'events') && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
              <Star className="text-yellow-400" size={20} />
              <span>Eventos Trending</span>
            </h2>
            <div className="grid gap-4">
              {trendingEvents.map((event) => (
                <div key={event.id} className="bg-[#313338] border border-[#404249] rounded-lg p-4 hover:border-brand-400/50 transition-all duration-300">
                  <div className="flex space-x-4">
                    <img 
                      src={event.image} 
                      alt={event.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-white mb-1">{event.name}</h3>
                          <p className="text-gray-400 text-sm mb-2">{event.venue} • {new Date(event.date).toLocaleDateString('es-ES')}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              event.availability.includes('Limited') || event.availability.includes('Nearly')
                                ? 'bg-orange-500/20 text-orange-400'
                                : 'bg-green-500/20 text-green-400'
                            }`}>
                              {event.availability}
                            </span>
                            <span>{formatNumber(event.social_mentions)} menciones</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1 mb-2">
                            {getTrendingIcon(event.trending_score)}
                            <span className="text-sm font-medium text-white">{event.trending_score}</span>
                          </div>
                          <p className="text-xs text-gray-400">{event.price_range}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-3">
                        {event.hashtags.map((hashtag) => (
                          <span key={hashtag} className="px-2 py-1 bg-brand-500/20 text-brand-400 text-xs rounded-full">
                            {hashtag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(activeTab === 'all' || activeTab === 'posts') && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
              <MessageCircle className="text-blue-400" size={20} />
              <span>Posts Virales</span>
            </h2>
            <div className="space-y-4">
              {trendingPosts.map((post) => (
                <div key={post.id} className="bg-[#313338] border border-[#404249] rounded-lg p-4 hover:border-brand-400/50 transition-all duration-300">
                  {/* Post Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <img src={post.user.avatar} alt={post.user.name} className="w-10 h-10 rounded-full" />
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-white">{post.user.name}</h4>
                          {post.user.verified && <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>}
                        </div>
                        <p className="text-xs text-gray-400">@{post.user.username} • {post.timestamp}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {post.isHot && (
                        <div className="flex items-center space-x-1 px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">
                          <Zap size={12} />
                          <span>HOT</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        {getTrendingIcon(post.trending_score)}
                        <span className="text-sm font-medium text-white">{post.trending_score}</span>
                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <p className="text-white mb-3">{post.content}</p>

                  {/* Media */}
                  {post.media && (
                    <img src={post.media} alt="Post media" className="w-full h-64 object-cover rounded-lg mb-3" />
                  )}

                  {/* Event Info */}
                  {post.event && (
                    <div className="flex items-center space-x-3 p-3 bg-[#2b2d31] rounded-lg mb-3">
                      <img src={post.event.image} alt={post.event.name} className="w-12 h-12 rounded-lg object-cover" />
                      <div>
                        <h5 className="font-medium text-white text-sm">{post.event.name}</h5>
                        <p className="text-xs text-gray-400">{post.event.venue} • {new Date(post.event.date).toLocaleDateString('es-ES')}</p>
                      </div>
                    </div>
                  )}

                  {/* Metrics */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#404249]">
                    <div className="flex items-center space-x-6 text-gray-400">
                      <button className="flex items-center space-x-1 hover:text-red-400 transition-colors">
                        <Heart size={16} />
                        <span className="text-sm">{formatNumber(post.metrics.likes)}</span>
                      </button>
                      <button className="flex items-center space-x-1 hover:text-blue-400 transition-colors">
                        <MessageCircle size={16} />
                        <span className="text-sm">{formatNumber(post.metrics.comments)}</span>
                      </button>
                      <button className="flex items-center space-x-1 hover:text-green-400 transition-colors">
                        <Share2 size={16} />
                        <span className="text-sm">{formatNumber(post.metrics.shares)}</span>
                      </button>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-400 text-sm">
                      <Eye size={14} />
                      <span>{formatNumber(post.metrics.views)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(activeTab === 'all' || activeTab === 'users') && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
              <Users className="text-purple-400" size={20} />
              <span>Usuarios Populares</span>
            </h2>
            <div className="grid gap-4">
              {popularUsers.map((user, index) => (
                <div key={user.id} className="bg-[#313338] border border-[#404249] rounded-lg p-4 hover:border-brand-400/50 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full" />
                        <div className="absolute -top-1 -left-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {index + 1}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-white">{user.name}</h4>
                          {user.verified && <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>}
                        </div>
                        <p className="text-sm text-gray-400">@{user.username}</p>
                        {user.badge && (
                          <span className="inline-block mt-1 px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                            {user.badge}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1 mb-1">
                        <Trophy className="text-yellow-400" size={14} />
                        <span className="text-sm font-medium text-white">{user.influence_score}</span>
                      </div>
                      <div className="text-sm text-gray-400 space-y-1">
                        <div>{formatNumber(user.followers)} seguidores</div>
                        <div>{user.events_attended} eventos</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(activeTab === 'all' || activeTab === 'hashtags') && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
              <Hash className="text-green-400" size={20} />
              <span>Hashtags Trending</span>
            </h2>
            <div className="grid gap-3">
              {trendingHashtags.map((hashtag, index) => (
                <div key={hashtag.tag} className="bg-[#313338] border border-[#404249] rounded-lg p-4 hover:border-brand-400/50 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{hashtag.tag}</h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          <span>{formatNumber(hashtag.posts)} posts</span>
                          <span>•</span>
                          <span className="capitalize">{hashtag.category}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1 text-green-400">
                        <TrendingUp size={14} />
                        <span className="text-sm font-medium">+{hashtag.growth}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )

  // Configure right sidebar modules for popular page
  const rightModules = [
    <TrendingEvents key="trending" />
  ]

  return (
    <ModularLayout
      leftSidebar={<SimpleSidebar />}
      mainContent={<PopularContent />}
      rightModules={rightModules}
      showRightSidebar={true}
      pageTitle="Popular"
      pageSubtitle="Descubre lo más trending de la comunidad"
      showHeader={true}
    />
  )
}