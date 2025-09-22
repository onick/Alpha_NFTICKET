'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  isLight: boolean
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark') // Default to dark
  const [isHydrated, setIsHydrated] = useState(false)

  // Load theme from localStorage on mount
  useEffect(() => {
    setIsHydrated(true)
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('nfticket_theme') as Theme
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        setTheme(savedTheme)
      }
    }
  }, [])

  // Save theme to localStorage when it changes
  useEffect(() => {
    if (isHydrated && typeof window !== 'undefined') {
      localStorage.setItem('nfticket_theme', theme)
    }
  }, [theme, isHydrated])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  const value = {
    theme,
    toggleTheme,
    isLight: theme === 'light',
    isDark: theme === 'dark'
  }

  // Show loading placeholder during hydration to prevent flash
  if (!isHydrated) {
    return <div className="min-h-screen bg-[#2b2d31]">{children}</div>
  }

  return (
    <ThemeContext.Provider value={value}>
      <div className={theme === 'dark' ? 'dark' : ''}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    // Return default values instead of throwing error to prevent crashes
    console.warn('useTheme must be used within a ThemeProvider, using defaults')
    return {
      theme: 'dark' as const,
      toggleTheme: () => {},
      isLight: false,
      isDark: true
    }
  }
  return context
}