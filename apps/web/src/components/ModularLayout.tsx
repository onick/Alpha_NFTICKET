'use client'

import { ReactNode } from 'react'

interface ModularLayoutProps {
  leftSidebar?: ReactNode
  mainContent: ReactNode
  rightModules?: ReactNode[]
  showRightSidebar?: boolean
}

export function ModularLayout({ 
  leftSidebar, 
  mainContent, 
  rightModules = [], 
  showRightSidebar = true 
}: ModularLayoutProps) {
  return (
    <div className="min-h-screen bg-[#2b2d31]">
      <div className="flex justify-center">
        <div className="flex w-full relative min-h-screen">
          {/* Left Sidebar */}
          {leftSidebar && (
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="fixed top-[var(--header-h)] w-64 h-[calc(100vh-var(--header-h))] bg-[#2b2d31] overflow-y-auto z-40">
                <div className="p-4">
                  {leftSidebar}
                </div>
              </div>
            </aside>
          )}

          {/* Main Content Area */}
          <div className="flex-1 lg:border-l border-[#404249] min-h-screen">
            {/* Header */}
            <div className="px-4 lg:px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button className="lg:hidden w-8 h-8 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 flex items-center justify-center transition-colors duration-200">
                    <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  <svg className="text-purple-400 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                  </svg>
                  <div>
                    <h1 className="text-xl font-bold text-white">Home</h1>
                    <p className="text-sm text-gray-400 hidden sm:block">Descubre los eventos más populares</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content with flexible layout */}
            <div className="p-4 lg:p-6">
              <div className="max-w-none mx-auto">
                <div className={`flex gap-6 ${showRightSidebar && rightModules.length > 0 ? '' : 'justify-center'}`}>
                  {/* Main content */}
                  <div className={`${showRightSidebar && rightModules.length > 0 ? 'flex-1 max-w-3xl' : 'w-full max-w-2xl'}`}>
                    {mainContent}
                  </div>

                  {/* Right modules */}
                  {showRightSidebar && rightModules.length > 0 && (
                    <aside className="hidden xl:block w-96 shrink-0">
                      <div className="sticky top-4 space-y-4">
                        {rightModules.map((module, index) => (
                          <div key={index}>
                            {module}
                          </div>
                        ))}
                      </div>
                    </aside>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}