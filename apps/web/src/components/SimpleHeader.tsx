'use client'

import { Calendar, TrendingUp, Users, Plus, Bell, Settings, User } from 'lucide-react'

export function SimpleHeader() {
  return (
    <header className="sticky top-0 z-50 bg-[#313338] border-b border-[#404249] h-[var(--header-h)]">
      <div className="flex justify-center h-full">
        <div className="flex w-full relative h-full">
          {/* Left sidebar space - matching the sidebar width */}
          <div className="hidden lg:block w-64 shrink-0 bg-[#313338]">
            <div className="flex items-center h-full pl-8">
              {/* Logo aligned to left with padding */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">N</span>
                </div>
                <h1 className="text-lg font-bold text-white">NFTicket</h1>
              </div>
            </div>
          </div>

          {/* Main header content - aligned with main content */}
          <div className="flex-1 lg:border-l border-[#404249] bg-[#313338]">
            <div className="flex items-center justify-between h-full px-4 lg:px-6">
              <div className="flex items-center space-x-4 lg:space-x-8">
                {/* Logo for mobile */}
                <div className="lg:hidden flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">N</span>
                  </div>
                  <h1 className="text-lg font-bold text-white">NFTicket</h1>
                </div>
                
                {/* Navigation - Hidden on mobile */}
                <nav className="hidden md:flex items-center space-x-1">
                  <a href="/events" className="px-2 lg:px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors duration-200 text-sm">
                    Eventos
                  </a>
                  <a href="/popular" className="px-2 lg:px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors duration-200 text-sm">
                    Popular
                  </a>
                  <a href="/communities" className="px-2 lg:px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors duration-200 text-sm">
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
                <button className="relative w-8 h-8 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 flex items-center justify-center transition-colors duration-200">
                  <Bell size={16} className="text-gray-300" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
                    1
                  </span>
                </button>
                
                {/* Settings - Hidden on mobile */}
                <button className="hidden sm:flex w-8 h-8 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 items-center justify-center transition-colors duration-200">
                  <Settings size={16} className="text-gray-300" />
                </button>
                
                {/* User Avatar */}
                <button className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">U</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}