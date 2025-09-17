'use client'

import { useState, useEffect } from 'react'
import { Button } from '@nfticket/ui'
import { 
  User,
  Settings, 
  Ticket, 
  Calendar, 
  Heart,
  Share2,
  Eye,
  EyeOff,
  Edit,
  Camera,
  TrendingUp,
  Activity,
  Clock,
  MapPin,
  X,
  ArrowLeft
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { getEcosystemManager } from '@/lib/ecosystem-integration'

interface UserProfile {
  id: string
  name: string
  email: string
  avatar: string
  joinDate: string
  preferences: {
    shareTicketPurchases: boolean
    publicProfile: boolean
    emailNotifications: boolean
  }
  stats: {
    totalTickets: number
    activeTickets: number
    eventsAttended: number
    totalSpent: number
    favoriteEvents: number
  }
}

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    // Load profile data when modal opens
    if (user && !profile) {
      const userProfile: UserProfile = {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
        joinDate: user.created_at,
        preferences: {
          shareTicketPurchases: true,
          publicProfile: true,
          emailNotifications: true
        },
        stats: {
          totalTickets: 3,
          activeTickets: 2,
          eventsAttended: 1,
          totalSpent: 775,
          favoriteEvents: 5
        }
      }

      setProfile(userProfile)

      // Load recent activity from ecosystem
      try {
        const manager = getEcosystemManager()
        if (manager) {
          const events = manager.getPublishedEvents()
          const recentEvents = events.slice(0, 3).map(event => ({
            type: 'event_view',
            title: `Viste ${event.name}`,
            time: 'hace 2 horas',
            icon: Eye
          }))
          setRecentActivity(recentEvents)
        }
      } catch (error) {
        console.error('Error loading recent activity:', error)
      }

      setIsLoading(false)
    }
  }, [isOpen, user, profile])

  const handlePreferenceChange = (key: keyof UserProfile['preferences']) => {
    if (!profile) return
    setProfile(prev => ({
      ...prev!,
      preferences: {
        ...prev!.preferences,
        [key]: !prev!.preferences[key]
      }
    }))
  }

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', { 
      month: 'long', 
      year: 'numeric' 
    })
  }

  if (!isOpen) return null

  if (authLoading || isLoading || !profile) {
    return (
      <div className="fixed inset-0 z-50 bg-[#2b2d31] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-white">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#2b2d31] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#2b2d31]/95 backdrop-blur-sm border-b border-[#404249]">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onClose}
              className="flex items-center space-x-2 text-gray-300 hover:text-white"
            >
              <ArrowLeft size={20} />
              <span>Volver al Feed</span>
            </Button>
            <h1 className="text-xl font-bold text-white">Mi Perfil</h1>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-2"
          >
            <Settings size={16} />
            <span>Editar</span>
          </Button>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto py-8 px-4 space-y-8">
        {/* Profile Header */}
        <div className="bg-[#313338] rounded-2xl p-8 border border-[#404249]">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="relative">
              <img 
                src={profile.avatar} 
                alt={profile.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-brand-500/20"
              />
              <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-brand-500 hover:bg-brand-600 rounded-full flex items-center justify-center transition-colors">
                <Camera size={14} className="text-white" />
              </button>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
                <button className="text-gray-400 hover:text-white">
                  <Edit size={18} />
                </button>
              </div>
              <p className="text-gray-400 mb-2">{profile.email}</p>
              <p className="text-sm text-gray-400">
                Miembro desde {formatJoinDate(profile.joinDate)}
              </p>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={() => window.location.href = '/perfil/tickets'}
                className="bg-brand-500 hover:bg-brand-600 flex items-center space-x-2"
              >
                <Ticket size={16} />
                <span>Mis Tickets</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#313338] rounded-xl p-6 border border-[#404249] text-center hover:border-brand-400/50 transition-colors cursor-pointer">
            <div className="text-3xl font-bold text-brand-400 mb-2">{profile.stats.totalTickets}</div>
            <div className="text-sm text-gray-400">Tickets Total</div>
          </div>
          <div className="bg-[#313338] rounded-xl p-6 border border-[#404249] text-center hover:border-green-400/50 transition-colors cursor-pointer">
            <div className="text-3xl font-bold text-green-400 mb-2">{profile.stats.activeTickets}</div>
            <div className="text-sm text-gray-400">Activos</div>
          </div>
          <div className="bg-[#313338] rounded-xl p-6 border border-[#404249] text-center hover:border-purple-400/50 transition-colors cursor-pointer">
            <div className="text-3xl font-bold text-purple-400 mb-2">{profile.stats.eventsAttended}</div>
            <div className="text-sm text-gray-400">Eventos Asistidos</div>
          </div>
          <div className="bg-[#313338] rounded-xl p-6 border border-[#404249] text-center hover:border-yellow-400/50 transition-colors cursor-pointer">
            <div className="text-3xl font-bold text-yellow-400 mb-2">RD${profile.stats.totalSpent.toLocaleString()}</div>
            <div className="text-sm text-gray-400">Invertido</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Privacy & Sharing Controls */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#313338] rounded-2xl p-6 border border-[#404249]">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                <Share2 size={20} className="text-brand-400" />
                <span>Privacidad y Compartir</span>
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[#2b2d31] rounded-lg border border-[#404249]">
                  <div>
                    <h4 className="font-medium text-white">Compartir compras en el feed</h4>
                    <p className="text-sm text-gray-400">Permite que otros vean tus compras de tickets en la red social</p>
                  </div>
                  <button 
                    onClick={() => handlePreferenceChange('shareTicketPurchases')}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      profile.preferences.shareTicketPurchases ? 'bg-brand-500' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
                      profile.preferences.shareTicketPurchases ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#2b2d31] rounded-lg border border-[#404249]">
                  <div>
                    <h4 className="font-medium text-white">Perfil público</h4>
                    <p className="text-sm text-gray-400">Permite que otros usuarios vean tu perfil y actividad</p>
                  </div>
                  <button 
                    onClick={() => handlePreferenceChange('publicProfile')}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      profile.preferences.publicProfile ? 'bg-brand-500' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
                      profile.preferences.publicProfile ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#2b2d31] rounded-lg border border-[#404249]">
                  <div>
                    <h4 className="font-medium text-white">Notificaciones por email</h4>
                    <p className="text-sm text-gray-400">Recibe actualizaciones sobre eventos y tickets por email</p>
                  </div>
                  <button 
                    onClick={() => handlePreferenceChange('emailNotifications')}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      profile.preferences.emailNotifications ? 'bg-brand-500' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
                      profile.preferences.emailNotifications ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-[#313338] rounded-2xl p-6 border border-[#404249]">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                <TrendingUp size={20} className="text-brand-400" />
                <span>Acciones Rápidas</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => window.location.href = '/events'}
                  variant="outline"
                  className="h-16 flex-col space-y-1"
                >
                  <Calendar size={24} />
                  <span className="text-sm">Ver Eventos</span>
                </Button>
                
                <Button
                  onClick={() => window.location.href = '/perfil/tickets'}
                  variant="outline"
                  className="h-16 flex-col space-y-1"
                >
                  <Ticket size={24} />
                  <span className="text-sm">Mis Tickets</span>
                </Button>
                
                <Button
                  onClick={() => alert('Próximamente: Eventos favoritos')}
                  variant="outline"
                  className="h-16 flex-col space-y-1"
                >
                  <Heart size={24} />
                  <span className="text-sm">Favoritos</span>
                </Button>
                
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="h-16 flex-col space-y-1"
                >
                  <Activity size={24} />
                  <span className="text-sm">Feed Social</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Recent Activity Sidebar */}
          <div className="space-y-6">
            <div className="bg-[#313338] rounded-2xl p-6 border border-[#404249]">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Clock size={18} className="text-brand-400" />
                <span>Actividad Reciente</span>
              </h3>
              
              <div className="space-y-3">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-[#2b2d31] rounded-lg">
                      <activity.icon size={16} className="text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{activity.title}</p>
                        <p className="text-xs text-gray-400">{activity.time}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">No hay actividad reciente</p>
                  </div>
                )}
              </div>
            </div>

            {/* Profile completion */}
            <div className="bg-gradient-to-br from-brand-900/40 to-brand-800/40 rounded-2xl p-6 border border-brand-700/30">
              <h3 className="text-lg font-semibold text-white mb-4">Completa tu perfil</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Información básica</span>
                  <span className="text-xs text-green-400">✓ Completo</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Foto de perfil</span>
                  <span className="text-xs text-green-400">✓ Completo</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Preferencias</span>
                  <span className="text-xs text-yellow-400">⚡ Configurado</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-brand-500 h-2 rounded-full" style={{width: '85%'}}></div>
                </div>
                <p className="text-xs text-gray-400 mt-1">85% completo</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}