'use client'

import { Home, TrendingUp, Hash, Plus, Users, User } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { usePathname, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export function SimpleSidebar() {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [currentView, setCurrentView] = useState<string | null>(null)
  
  // Listen for view changes from URL params and custom events
  useEffect(() => {
    const urlView = searchParams.get('view')
    setCurrentView(urlView)
  }, [searchParams])

  // Listen for custom navigation events from TwitterLikeLayout
  useEffect(() => {
    const handleViewChange = (event: CustomEvent) => {
      setCurrentView(event.detail.view)
    }

    window.addEventListener('viewChanged', handleViewChange as EventListener)
    return () => {
      window.removeEventListener('viewChanged', handleViewChange as EventListener)
    }
  }, [])
  
  const currentPath = pathname
  
  const principalItems = [
    { label: 'Home', href: '/', icon: Home, active: currentPath === '/' && currentView !== 'profile' },
    { label: 'Popular', href: '/popular', icon: TrendingUp, active: currentPath === '/popular' },
    { label: 'Feed Social', href: '/feed', icon: Hash, active: currentPath === '/feed' },
  ]

  const communities = [
    { name: 'c/eventos-rd', members: '1,250 miembros', avatar: 'E', color: 'bg-purple-500' },
    { name: 'c/musica-electronica', members: '890 miembros', avatar: 'M', color: 'bg-pink-500' },
    { name: 'c/conciertos-dr', members: '567 miembros', avatar: 'C', color: 'bg-blue-500' },
  ]

  return (
    <div className="discord-sidebar rounded-lg p-4 space-y-6">
      {/* Principal Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">PRINCIPAL</h3>
        <div className="space-y-1">
          {principalItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-2 py-2 rounded-lg transition-all duration-200 ${
                item.active 
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* User Profile Section - Show loading placeholder or user profile */}
      {(loading || user) && (
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">MI CUENTA</h3>
          <div className="space-y-1">
            {loading ? (
              // Loading placeholder that matches the button size
              <div className="w-full flex items-center space-x-3 px-2 py-2 rounded-lg bg-gray-700/30 animate-pulse">
                <div className="w-5 h-5 bg-gray-600 rounded"></div>
                <div className="h-4 bg-gray-600 rounded w-20"></div>
              </div>
            ) : (
              <button
                onClick={() => {
                  if ((window as any).openProfileModal) {
                    (window as any).openProfileModal()
                  }
                }}
                className={`w-full flex items-center space-x-3 px-2 py-2 rounded-lg transition-all duration-200 ${
                  currentView === 'profile'
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                }`}
              >
                <User size={20} />
                <span className="font-medium">Mi Perfil</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Communities Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">COMUNIDADES</h3>
          <Plus size={16} className="text-gray-400 hover:text-white cursor-pointer" />
        </div>

        {/* Create Community Button */}
        <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg text-gray-300 hover:text-white transition-all duration-200">
          <Plus size={16} />
          <span className="text-sm font-medium">Crear comunidad</span>
        </button>

        {/* Community List */}
        <div className="space-y-2">
          {communities.map((community) => (
            <div key={community.name} className="flex items-center space-x-3 px-2 py-2 rounded-lg hover:bg-gray-700/30 cursor-pointer transition-all duration-200">
              <div className={`w-8 h-8 ${community.color} rounded-full flex items-center justify-center`}>
                <span className="text-white text-sm font-bold">{community.avatar}</span>
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">{community.name}</p>
                <p className="text-xs text-gray-400">{community.members}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Show More */}
        <button className="flex items-center space-x-2 px-2 py-1 text-gray-400 hover:text-white text-sm transition-all duration-200">
          <span>Ver 2 más</span>
        </button>

        {/* Discover Communities */}
        <button className="flex items-center space-x-2 px-2 py-2 text-gray-400 hover:text-white text-sm transition-all duration-200">
          <Users size={16} />
          <span>Descubrir comunidades</span>
        </button>
      </div>
    </div>
  )
}