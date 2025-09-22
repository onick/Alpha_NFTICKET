import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useState, useEffect } from 'react'

export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  created_at: string
}

export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

// Mock users for development
const mockUsers: User[] = [
  {
    id: 'user-123',
    email: 'maria@example.com',
    name: 'María González',
    avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b9f67f95?w=150&h=150&fit=crop&crop=face',
    created_at: '2024-01-15T00:00:00Z'
  },
  {
    id: 'user-456',
    email: 'carlos@example.com',
    name: 'Carlos Rodríguez',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    created_at: '2024-02-20T00:00:00Z'
  }
]

class MockAuthService {
  private currentUser: User | null = null
  private listeners: ((user: User | null) => void)[] = []

  constructor() {
    // Check if user was logged in (stored in localStorage)
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('nfticket_mock_user')
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser)
      }
    }
  }

  async signIn(email: string, password: string): Promise<{ user: User | null, error: string | null }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const user = mockUsers.find(u => u.email === email)
    
    if (!user || password !== 'demo123') {
      return { user: null, error: 'Credenciales inválidas' }
    }

    this.currentUser = user
    if (typeof window !== 'undefined') {
      localStorage.setItem('nfticket_mock_user', JSON.stringify(user))
    }
    
    this.notifyListeners(user)
    return { user, error: null }
  }

  async signUp(email: string, password: string, name: string): Promise<{ user: User | null, error: string | null }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1200))
    
    // Check if user already exists
    if (mockUsers.find(u => u.email === email)) {
      return { user: null, error: 'El email ya está registrado' }
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      name,
      avatar_url: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face`,
      created_at: new Date().toISOString()
    }

    mockUsers.push(newUser)
    this.currentUser = newUser
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('nfticket_mock_user', JSON.stringify(newUser))
    }
    
    this.notifyListeners(newUser)
    return { user: newUser, error: null }
  }

  async signOut(): Promise<void> {
    this.currentUser = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nfticket_mock_user')
    }
    this.notifyListeners(null)
  }

  getCurrentUser(): User | null {
    return this.currentUser
  }

  onAuthStateChange(callback: (user: User | null) => void) {
    this.listeners.push(callback)
    // Call immediately with current user
    callback(this.currentUser)
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  private notifyListeners(user: User | null) {
    this.listeners.forEach(callback => callback(user))
  }
}

// Singleton instance
let authService: MockAuthService | null = null

export function getAuthService() {
  if (!authService) {
    authService = new MockAuthService()
  }
  return authService
}

// React hook for authentication
export function useAuth(): AuthState & {
  signIn: (email: string, password: string) => Promise<{ user: User | null, error: string | null }>
  signUp: (email: string, password: string, name: string) => Promise<{ user: User | null, error: string | null }>
  signOut: () => Promise<void>
} {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true)
    
    // Check localStorage after hydration
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('nfticket_mock_user')
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)
        } catch (e) {
          // If parsing fails, remove invalid data
          localStorage.removeItem('nfticket_mock_user')
        }
      }
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!isHydrated) return
    
    const auth = getAuthService()
    
    const unsubscribe = auth.onAuthStateChange((user) => {
      setUser(user)
    })

    return unsubscribe
  }, [isHydrated])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    
    const auth = getAuthService()
    const result = await auth.signIn(email, password)
    
    if (result.error) {
      setError(result.error)
    }
    
    setLoading(false)
    return result
  }

  const signUp = async (email: string, password: string, name: string) => {
    setLoading(true)
    setError(null)
    
    const auth = getAuthService()
    const result = await auth.signUp(email, password, name)
    
    if (result.error) {
      setError(result.error)
    }
    
    setLoading(false)
    return result
  }

  const signOut = async () => {
    setLoading(true)
    const auth = getAuthService()
    await auth.signOut()
    setLoading(false)
  }

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut
  }
}