import { SimpleSidebar } from '../components/SimpleSidebar'
import { SocialFeed } from '../components/SocialFeed'
import { Sparkles, Menu } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#2b2d31]">
      <div className="flex justify-center">
        <div className="flex max-w-7xl w-full">
          {/* Left Sidebar - Hidden on mobile, visible on lg+ */}
          <aside className="hidden lg:block w-64 shrink-0 bg-[#2b2d31]">
            <div className="p-4">
              <SimpleSidebar />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Header with extended background and border */}
            <div className="relative">
              {/* Extended background that goes to screen edge */}
              <div className="absolute inset-0 bg-[#313338] w-screen"></div>
              {/* Extended border that goes to screen edge */}
              <div className="absolute bottom-0 left-0 w-screen h-px bg-[#404249]"></div>
              
              <div className="relative bg-[#313338] border-b border-[#404249] lg:border-l border-[#404249]">
                <div className="px-4 lg:px-6 py-4 max-w-4xl mx-auto">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {/* Mobile menu button */}
                      <button className="lg:hidden w-8 h-8 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 flex items-center justify-center transition-colors duration-200">
                        <Menu size={18} className="text-gray-300" />
                      </button>
                      <Sparkles className="text-purple-400" size={24} />
                      <div>
                        <h1 className="text-xl font-bold text-white">Home</h1>
                        <p className="text-sm text-gray-400 hidden sm:block">Descubre los eventos más populares</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Feed */}
            <div className="lg:border-l border-[#404249]">
              <div className="p-4 lg:p-6">
                <div className="max-w-4xl mx-auto">
                  <div className="max-w-2xl">
                    <SocialFeed />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}