'use client'

import './globals.css'
import { Inter } from 'next/font/google'
import { SimpleHeader } from '../components/SimpleHeader'
import { SimpleSidebar } from '../components/SimpleSidebar'
import { FloatingChatBar } from '../components/FloatingChatBar'
import { useEffect } from 'react'
import { SocketProvider } from '../contexts/SocketContext'
import { ChatSocketProvider } from '../contexts/ChatSocketContext'
import { ThemeProvider, useTheme } from '../contexts/ThemeContext'
import { useRouter, usePathname } from 'next/navigation'

const inter = Inter({ subsets: ['latin'] })

function LayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isLight } = useTheme()
  
  // Define routes that should not show the sidebar
  const sidebarHiddenRoutes = ['/events', '/evento']
  const shouldHideSidebar = sidebarHiddenRoutes.some(route => pathname.startsWith(route))
  
  // Global profile navigation setup
  // IMPORTANT: This function is GLOBAL and should NEVER be deleted by child components
  useEffect(() => {
    // Set up global function once at the root level
    ;(window as any).openProfileModal = () => {
      // Navigate to home with profile view using Next.js router
      router.push('/?view=profile')
    }

    // Cleanup on unmount - ONLY the root layout should delete this function
    return () => {
      delete (window as any).openProfileModal
    }
  }, [router])

  return (
    <SocketProvider>
      <ChatSocketProvider>
        <div className={`min-h-screen ${isLight ? 'bg-white' : 'bg-[#2b2d31]'}`}>
          <SimpleHeader />
          <div className="flex justify-center">
            <div className="flex w-full relative min-h-screen">
              {/* Global Sidebar - conditionally shown */}
              {!shouldHideSidebar && (
                <aside className="hidden lg:block w-64 shrink-0">
                  <div className={`fixed top-[var(--header-h)] w-64 h-[calc(100vh-var(--header-h))] overflow-y-auto z-40 ${isLight ? 'bg-gray-50' : 'bg-[#2b2d31]'}`}>
                    <div className="p-4">
                      <SimpleSidebar />
                    </div>
                  </div>
                </aside>
              )}

              {/* Main Content Area - adjusts based on sidebar presence */}
              <main className={`flex-1 min-h-screen ${
                !shouldHideSidebar ? `lg:border-l ${isLight ? 'border-gray-200' : 'border-[#404249]'}` : ''
              }`}>
                {children}
              </main>
            </div>
          </div>
          
          {/* Global Floating Chat */}
          <FloatingChatBar />
        </div>
      </ChatSocketProvider>
    </SocketProvider>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <ThemeProvider>
          <LayoutContent>{children}</LayoutContent>
        </ThemeProvider>
      </body>
    </html>
  )
}