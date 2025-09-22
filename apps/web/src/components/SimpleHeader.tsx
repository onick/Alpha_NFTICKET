'use client'

import { Calendar, TrendingUp, Users, Plus, Bell, Settings, User, Sun, Moon } from 'lucide-react'
import { AuthDropdown } from './AuthDropdown'
import { NotificationsCenter } from './NotificationsCenter'
import { useTheme } from '../contexts/ThemeContext'

export function SimpleHeader() {
  const { theme, toggleTheme, isLight } = useTheme()
  
  return (
    <header className={`sticky top-0 z-[9998] border-b h-[var(--header-h)] ${
      isLight 
        ? 'bg-white border-gray-200' 
        : 'bg-[#313338] border-[#404249]'
    }`}>
      <div className="flex justify-center h-full">
        <div className="flex w-full relative h-full">
          {/* Left sidebar space - matching the sidebar width */}
          <div className={`hidden lg:block w-64 shrink-0 ${isLight ? 'bg-gray-50' : 'bg-[#313338]'}`}>
            <div className="flex items-center h-full pl-8">
              {/* Logo aligned to left with padding */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">N</span>
                </div>
                <h1 className={`text-lg font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>NFTicket</h1>
              </div>
            </div>
          </div>

          {/* Main header content - aligned with main content */}
          <div className={`flex-1 lg:border-l ${isLight ? 'border-gray-200 bg-white' : 'border-[#404249] bg-[#313338]'}`}>
            <div className="flex items-center justify-between h-full px-4 lg:px-6">
              <div className="flex items-center space-x-4 lg:space-x-8">
                {/* Logo for mobile */}
                <div className="lg:hidden flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">N</span>
                  </div>
                  <h1 className={`text-lg font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>NFTicket</h1>
                </div>
                
                {/* Navigation - Hidden on mobile */}
                <nav className="hidden md:flex items-center space-x-1">
                  <a href="/events" className={`px-2 lg:px-3 py-2 rounded-lg transition-colors duration-200 text-sm ${
                    isLight 
                      ? 'text-gray-700 hover:bg-gray-100 hover:text-gray-900' 
                      : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                  }`}>
                    Eventos
                  </a>
                  <a href="/popular" className={`px-2 lg:px-3 py-2 rounded-lg transition-colors duration-200 text-sm ${
                    isLight 
                      ? 'text-gray-700 hover:bg-gray-100 hover:text-gray-900' 
                      : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                  }`}>
                    Popular
                  </a>
                  <a href="/communities" className={`px-2 lg:px-3 py-2 rounded-lg transition-colors duration-200 text-sm ${
                    isLight 
                      ? 'text-gray-700 hover:bg-gray-100 hover:text-gray-900' 
                      : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                  }`}>
                    Comunidades
                  </a>
                </nav>
              </div>

              {/* Right side controls */}
              <div className="flex items-center space-x-2 lg:space-x-3">
                {/* Create Event Button - Text hidden on mobile */}
                <button className="px-3 lg:px-4 py-2 text-sm bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2">
                  <Plus size={16} />
                  <span className="hidden sm:inline">Crear Evento</span>
                </button>
                
                {/* Notifications */}
                <NotificationsCenter />
                
                {/* Theme Toggle */}
                <button 
                  onClick={toggleTheme}
                  className={`flex w-8 h-8 rounded-lg items-center justify-center transition-colors duration-200 ${
                    isLight 
                      ? 'bg-gray-100 hover:bg-gray-200' 
                      : 'bg-gray-700/50 hover:bg-gray-600/50'
                  }`}
                  title={isLight ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
                >
                  {isLight ? (
                    <Moon size={16} className={isLight ? 'text-gray-700' : 'text-gray-300'} />
                  ) : (
                    <Sun size={16} className={isLight ? 'text-gray-700' : 'text-gray-300'} />
                  )}
                </button>
                
                {/* Settings - Hidden on mobile */}
                <button className={`hidden sm:flex w-8 h-8 rounded-lg items-center justify-center transition-colors duration-200 ${
                  isLight 
                    ? 'bg-gray-100 hover:bg-gray-200' 
                    : 'bg-gray-700/50 hover:bg-gray-600/50'
                }`}>
                  <Settings size={16} className={isLight ? 'text-gray-700' : 'text-gray-300'} />
                </button>
                
                {/* Authentication Dropdown */}
                <AuthDropdown />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}