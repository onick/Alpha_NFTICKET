'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Home, Calendar, Users, Ticket } from 'lucide-react'
import { SimpleSidebar } from './SimpleSidebar'
import { SimpleFeed } from './SimpleFeed'
import { ProfileModal } from './ProfileModal'
import { EditProfileModal } from './EditProfileModal'
import { ModularLayout } from './ModularLayout'
import { TrendingEvents } from '../modules/TrendingEvents'

export function TwitterLikeLayout() {
  const [currentView, setCurrentView] = useState<'feed' | 'profile'>('feed')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check URL parameters to determine current view
    const view = searchParams.get('view')
    if (view === 'profile') {
      setCurrentView('profile')
    } else {
      setCurrentView('feed')
    }
  }, [searchParams])

  useEffect(() => {
    // Set up global functions for navigation
    ;(window as any).openProfileModal = () => {
      setCurrentView('profile')
      // Update URL without page reload
      const url = new URL(window.location.href)
      url.searchParams.set('view', 'profile')
      window.history.pushState({}, '', url.toString())
    }

    ;(window as any).closeProfileModal = () => {
      setCurrentView('feed')
      // Update URL without page reload
      const url = new URL(window.location.href)
      url.searchParams.delete('view')
      window.history.pushState({}, '', url.toString())
    }

    // Handle browser back/forward
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search)
      const view = urlParams.get('view')
      if (view === 'profile') {
        setCurrentView('profile')
      } else {
        setCurrentView('feed')
      }
    }

    window.addEventListener('popstate', handlePopState)

    // Clean up
    return () => {
      delete (window as any).openProfileModal
      delete (window as any).closeProfileModal
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  const handleCloseProfile = () => {
    if ((window as any).closeProfileModal) {
      (window as any).closeProfileModal()
    }
  }

  // Configure which modules to show on the right sidebar
  const rightModules = [
    <TrendingEvents key="trending" />
  ]

  // Enhanced Feed content with personalization
  const FeedWithHeader = () => (
    <div className="space-y-6">
      {/* Feed Controls */}
      <div className="flex justify-end">
        <div className="flex space-x-2">
          <button className="px-3 py-1 text-sm bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors duration-200">
            Para Ti
          </button>
          <button className="px-3 py-1 text-sm text-text-muted hover:bg-surface-glass hover:text-white rounded-lg transition-colors duration-200">
            Siguiendo
          </button>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-[#313338] border border-[#404249] rounded-lg">
        <button className="flex flex-col items-center space-y-2 p-3 hover:bg-[#404249]/50 rounded-lg transition-colors">
          <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
            <Calendar className="text-green-400" size={20} />
          </div>
          <span className="text-sm text-white">Explorar Eventos</span>
        </button>
        <button className="flex flex-col items-center space-y-2 p-3 hover:bg-[#404249]/50 rounded-lg transition-colors">
          <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
            <Users className="text-purple-400" size={20} />
          </div>
          <span className="text-sm text-white">Mis Comunidades</span>
        </button>
        <button className="flex flex-col items-center space-y-2 p-3 hover:bg-[#404249]/50 rounded-lg transition-colors">
          <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
            <Ticket className="text-blue-400" size={20} />
          </div>
          <span className="text-sm text-white">Mis Tickets</span>
        </button>
      </div>
      
      <SimpleFeed />
    </div>
  )

  // Main content based on current view
  const mainContent = currentView === 'profile' 
    ? <ProfileContent onClose={handleCloseProfile} />
    : <FeedWithHeader />

  return (
    <ModularLayout
      leftSidebar={<SimpleSidebar />}
      mainContent={mainContent}
      rightModules={rightModules}
      showRightSidebar={true}
      pageTitle={currentView === 'profile' ? 'Perfil' : 'Home'}
      pageSubtitle={currentView === 'profile' ? undefined : 'Descubre los eventos más populares'}
      showHeader={currentView !== 'profile'}
    />
  )
}

// Profile content that fits in the main column (Twitter style)
function ProfileContent({ onClose }: { onClose: () => void }) {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'tickets' | 'activity' | 'preferences'>('overview')
  const [tickets, setTickets] = useState<any[]>([])
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedTicketForQR, setSelectedTicketForQR] = useState<any>(null)
  const [isQRModalOpen, setIsQRModalOpen] = useState(false)

  useEffect(() => {
    // Load profile data
    if (user && !profile) {
      // Try to load saved profile data first
      const savedProfile = loadProfileFromStorage(user.id)
      
      let userProfile
      
      if (savedProfile) {
        console.log('🔄 Using saved profile data as priority')
        // If we have saved data, PRIORITIZE IT over auth data
        userProfile = {
          // Start with auth data
          id: user.id,
          email: user.email,
          joinDate: user.created_at,
          // Override with ALL saved data (this is the key fix)
          ...savedProfile,
          // Only fallback to auth data if saved data doesn't exist
          name: savedProfile.name || user.name,
          avatar: savedProfile.avatar || user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
          // Ensure banner field exists (empty string if not set)
          banner: savedProfile.banner || ''
        }
      } else {
        console.log('🆕 Creating new profile with default values')
        // First time, use default values
        userProfile = {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
          banner: '', // Initialize banner field
          joinDate: user.created_at,
          bio: '',
          location: '',
          website: '',
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
      }

      console.log('🎯 Final profile being set:', userProfile)
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

          // Load user tickets (mock data for now)
          const mockTickets = [
            {
              id: '1',
              eventName: 'Concierto de Bachata',
              eventDate: '2024-12-20',
              ticketType: 'VIP',
              price: 150,
              status: 'active',
              qrCode: 'NFT123456',
              venue: 'Teatro Nacional'
            },
            {
              id: '2', 
              eventName: 'Tech Summit RD 2024',
              eventDate: '2024-11-15',
              ticketType: 'General',
              price: 75,
              status: 'used',
              qrCode: 'NFT789012',
              venue: 'Centro de Convenciones'
            },
            {
              id: '3',
              eventName: 'Festival de Jazz',
              eventDate: '2025-01-10',
              ticketType: 'Premium',
              price: 125,
              status: 'active',
              qrCode: 'NFT345678',
              venue: 'Malecón Centro'
            }
          ]
          setTickets(mockTickets)
        }
      } catch (error) {
        console.error('Error loading recent activity:', error)
      }

      setIsLoading(false)
    }
  }, [user])

  const handlePreferenceChange = (key: string) => {
    if (!profile) return
    
    const updatedProfile = {
      ...profile,
      preferences: {
        ...profile.preferences,
        [key]: !profile.preferences[key]
      }
    }
    
    setProfile(updatedProfile)
    
    // Persist to localStorage
    saveProfileToStorage(user.id, updatedProfile)
  }

  const handleSaveProfile = (newData: any) => {
    console.log('💾 Profile save - received newData:', newData)
    console.log('🖼️ Banner in newData:', newData.banner)
    
    const updatedProfile = {
      ...profile,
      name: newData.name,
      bio: newData.bio,
      location: newData.location,
      website: newData.website,
      avatar: newData.avatar,
      banner: newData.banner
    }
    
    console.log('💾 Final updatedProfile being saved:', updatedProfile)
    console.log('🖼️ Banner in final profile:', updatedProfile.banner)
    
    setProfile(updatedProfile)
    
    // Persist to localStorage
    saveProfileToStorage(user.id, updatedProfile)
  }

  const handleShowQR = (ticket: any) => {
    setSelectedTicketForQR(ticket)
    setIsQRModalOpen(true)
  }

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', { 
      month: 'long', 
      year: 'numeric' 
    })
  }

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    })
  }

  if (authLoading || isLoading || !profile) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-500 mx-auto mb-4"></div>
        <p className="text-white">Cargando perfil...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile Header - replaces any previous breadcrumb */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
            <p className="text-gray-400">@{profile.name.toLowerCase().replace(' ', '')}</p>
          </div>
        </div>
      </div>

      {/* Profile Banner & Avatar */}
      <div className="relative">
        <div className="h-48 bg-gradient-to-r from-purple-600 to-purple-800 rounded-t-2xl relative overflow-hidden">
          {profile.banner && (
            <img 
              src={profile.banner} 
              alt="Profile banner"
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div className="absolute -bottom-12 left-6">
          <img 
            src={profile.avatar} 
            alt={profile.name}
            className="w-24 h-24 rounded-full border-4 border-[#2b2d31] object-cover"
          />
        </div>
      </div>

      {/* Profile Info */}
      <div className="pt-14 px-6 pb-6 bg-[#313338] rounded-2xl border border-[#404249]">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
            <p className="text-gray-400">@{profile.name.toLowerCase().replace(' ', '')}</p>
            {profile.bio && (
              <p className="text-white mt-2 text-sm">{profile.bio}</p>
            )}
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-400">
              {profile.location && (
                <span className="flex items-center space-x-1">
                  <MapPin size={14} />
                  <span>{profile.location}</span>
                </span>
              )}
              {profile.website && (
                <span className="flex items-center space-x-1">
                  <span>🔗</span>
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:text-brand-300">
                    {profile.website.replace(/^https?:\/\//, '')}
                  </a>
                </span>
              )}
            </div>
            <p className="text-gray-400 mt-2 text-sm">
              Miembro desde {formatJoinDate(profile.joinDate)}
            </p>
          </div>
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="px-4 py-2 border border-[#404249] rounded-full text-white hover:bg-gray-700/50 transition-colors"
          >
            Editar Perfil
          </button>
        </div>

        {/* Stats */}
        <div className="flex space-x-6 py-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{profile.stats.totalTickets}</div>
            <div className="text-sm text-gray-400">Tickets</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{profile.stats.eventsAttended}</div>
            <div className="text-sm text-gray-400">Eventos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">RD${profile.stats.totalSpent.toLocaleString()}</div>
            <div className="text-sm text-gray-400">Gastado</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation - Twitter Style */}
      <div className="bg-[#313338] rounded-lg border border-[#404249] overflow-hidden">
        <div className="flex border-b border-[#404249]">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'text-white bg-brand-500/10 border-b-2 border-brand-500'
                : 'text-gray-400 hover:text-white hover:bg-[#404249]/30'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <User size={16} />
              <span>Resumen</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'tickets'
                ? 'text-white bg-brand-500/10 border-b-2 border-brand-500'
                : 'text-gray-400 hover:text-white hover:bg-[#404249]/30'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Ticket size={16} />
              <span>Mis Tickets</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'activity'
                ? 'text-white bg-brand-500/10 border-b-2 border-brand-500'
                : 'text-gray-400 hover:text-white hover:bg-[#404249]/30'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Activity size={16} />
              <span>Actividad</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'preferences'
                ? 'text-white bg-brand-500/10 border-b-2 border-brand-500'
                : 'text-gray-400 hover:text-white hover:bg-[#404249]/30'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Settings size={16} />
              <span>Configuración</span>
            </div>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white">Resumen de Actividad</h3>
              {recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-[#2b2d31] rounded-lg hover:bg-[#404249]/30 transition-colors">
                      <div className="w-10 h-10 bg-brand-500/20 rounded-full flex items-center justify-center">
                        <activity.icon size={16} className="text-brand-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{activity.title}</p>
                        <p className="text-gray-400 text-sm">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">No hay actividad reciente</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'tickets' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Mis Tickets NFT</h3>
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-gray-400">
                    {tickets.filter(t => t.status === 'active').length} activos • {tickets.filter(t => t.status === 'used').length} usados
                  </div>
                  {tickets.length > 0 && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          tickets.forEach(ticket => {
                            setTimeout(() => downloadTicketAsImage(ticket, profile.name), tickets.indexOf(ticket) * 500)
                          })
                        }}
                        className="flex items-center space-x-2 px-3 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-sm"
                        title="Descargar todos los tickets como PNG"
                      >
                        <Download size={16} />
                        <span>PNG Todos</span>
                      </button>
                      <button 
                        onClick={() => {
                          tickets.forEach(ticket => {
                            setTimeout(() => downloadTicketAsPDF(ticket, profile.name), tickets.indexOf(ticket) * 500)
                          })
                        }}
                        className="flex items-center space-x-2 px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                        title="Descargar todos los tickets como PDF"
                      >
                        <FileImage size={16} />
                        <span>PDF Todos</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {tickets.length > 0 ? (
                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <div key={ticket.id} className="bg-[#2b2d31] border border-[#404249] rounded-lg p-4 hover:border-brand-400/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold text-white">{ticket.eventName}</h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              ticket.status === 'active' 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {ticket.status === 'active' ? 'Activo' : 'Usado'}
                            </span>
                          </div>
                          <div className="space-y-1 text-sm text-gray-400">
                            <p className="flex items-center space-x-2">
                              <Calendar size={14} />
                              <span>{formatEventDate(ticket.eventDate)}</span>
                            </p>
                            <p className="flex items-center space-x-2">
                              <MapPin size={14} />
                              <span>{ticket.venue}</span>
                            </p>
                            <p className="flex items-center space-x-2">
                              <span>🎫</span>
                              <span>{ticket.ticketType} • RD${ticket.price.toLocaleString()}</span>
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-brand-400 font-mono text-xs mb-3">
                            #{ticket.qrCode}
                          </div>
                          <div className="flex flex-col gap-2">
                            <div className="flex gap-1">
                              <button 
                                onClick={() => downloadTicketAsImage(ticket, profile.name)}
                                className="flex items-center space-x-1 px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors"
                                title="Descargar ticket como imagen PNG"
                              >
                                <Download size={12} />
                                <span>PNG</span>
                              </button>
                              <button 
                                onClick={() => downloadTicketAsPDF(ticket, profile.name)}
                                className="flex items-center space-x-1 px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                                title="Descargar ticket como PDF"
                              >
                                <FileImage size={12} />
                                <span>PDF</span>
                              </button>
                              <button 
                                onClick={() => shareTicket(ticket, profile.name)}
                                className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors"
                                title="Compartir ticket"
                              >
                                <Share2 size={12} />
                              </button>
                            </div>
                            <button 
                              onClick={() => handleShowQR(ticket)}
                              className="px-3 py-1 text-xs bg-brand-500/20 text-brand-400 rounded hover:bg-brand-500/30 transition-colors"
                            >
                              <Eye size={12} className="inline mr-1" />
                              Ver QR
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">No tienes tickets aún</p>
                  <button className="mt-4 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors">
                    Explorar Eventos
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white">Historial de Actividad</h3>
              <div className="space-y-3">
                {[...recentActivity, ...recentActivity].map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-[#2b2d31] rounded-lg hover:bg-[#404249]/30 transition-colors">
                    <div className="w-10 h-10 bg-brand-500/20 rounded-full flex items-center justify-center">
                      <activity.icon size={16} className="text-brand-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{activity.title}</p>
                      <p className="text-gray-400 text-sm">{activity.time}</p>
                    </div>
                    <button className="text-gray-400 hover:text-white">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white">Configuración y Privacidad</h3>
              
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
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveProfile}
        initialData={{
          name: profile.name,
          email: profile.email,
          avatar: profile.avatar,
          banner: profile.banner || '',
          bio: profile.bio || '',
          location: profile.location || '',
          website: profile.website || ''
        }}
      />

      {selectedTicketForQR && (
        <QRModal
          isOpen={isQRModalOpen}
          onClose={() => {
            setIsQRModalOpen(false)
            setSelectedTicketForQR(null)
          }}
          ticket={selectedTicketForQR}
          userName={profile.name}
        />
      )}
    </div>
  )
}

// Profile persistence functions
function saveProfileToStorage(userId: string, profile: any) {
  if (typeof window !== 'undefined') {
    const profileKey = `nfticket_profile_${userId}`
    console.log('💾 Saving profile to localStorage:', profileKey, profile)
    localStorage.setItem(profileKey, JSON.stringify(profile))
    
    // Verify it was saved
    const saved = localStorage.getItem(profileKey)
    console.log('✅ Verified saved profile:', saved ? JSON.parse(saved) : 'null')
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('profileUpdated', {
      detail: { userId, profile }
    }))
    console.log('📢 Profile update event dispatched')
  }
}

function loadProfileFromStorage(userId: string) {
  if (typeof window !== 'undefined') {
    const profileKey = `nfticket_profile_${userId}`
    const savedProfile = localStorage.getItem(profileKey)
    console.log('📂 Loading profile from localStorage:', profileKey)
    console.log('🔑 User ID being searched:', userId)
    console.log('💾 Profile data found:', savedProfile)
    
    // Debug: Let's see all profile keys
    const allProfileKeys = Object.keys(localStorage).filter(key => key.includes('nfticket_profile'))
    console.log('🗂️ All profile keys in storage:', allProfileKeys)
    
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile)
        console.log('✅ Loaded profile successfully:', parsed)
        return parsed
      } catch (error) {
        console.error('❌ Error parsing saved profile:', error)
        return null
      }
    } else {
      console.log('🚫 No saved profile found for user:', userId)
    }
  }
  return null
}

// Import statements that were missing
import { ArrowLeft, Eye, Activity, User, Settings, MapPin, MoreHorizontal, Download, Share2, FileImage } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { getEcosystemManager } from '@/lib/ecosystem-integration'
import { downloadTicketAsImage, downloadTicketAsPDF, shareTicket } from '@/lib/ticket-download'
import { QRModal } from './QRModal'