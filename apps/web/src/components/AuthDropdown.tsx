'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@nfticket/ui'
import { 
  User, 
  LogIn, 
  UserPlus, 
  Settings, 
  LogOut, 
  Ticket,
  Heart,
  Activity,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react'
import { useAuth } from '@/lib/auth'

interface AuthDropdownProps {
  className?: string
}

export function AuthDropdown({ className = '' }: AuthDropdownProps) {
  const { user, loading, signIn, signUp, signOut } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      let result
      if (authMode === 'login') {
        result = await signIn(formData.email, formData.password)
      } else {
        result = await signUp(formData.email, formData.password, formData.name)
      }

      if (result.error) {
        setError(result.error)
      } else {
        setIsOpen(false)
        setFormData({ email: '', password: '', name: '' })
        
        // Si está en eventos después de login/registro, redirigir a la red social (home)
        if (pathname === '/events') {
          router.push('/')
        }
      }
    } catch (err) {
      setError('Ocurrió un error inesperado')
    }

    setSubmitting(false)
  }

  const handleSignOut = async () => {
    await signOut()
    setIsOpen(false)
    
    // Si está en la red social (página home "/"), redirigir a eventos
    // Si está en cualquier otra página protegida, también redirigir a eventos
    if (pathname === '/' || pathname.startsWith('/perfil') || pathname.startsWith('/feed')) {
      router.push('/events')
    }
  }

  const resetForm = () => {
    setFormData({ email: '', password: '', name: '' })
    setError(null)
    setShowPassword(false)
  }

  const switchMode = (mode: 'login' | 'register') => {
    setAuthMode(mode)
    resetForm()
  }

  // If user is logged in, show user menu
  if (user) {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center hover:scale-105 transition-transform duration-200 border-2 border-transparent hover:border-white/20"
          title={user.name}
        >
          {user.avatar_url ? (
            <img 
              src={user.avatar_url} 
              alt={user.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-white text-sm font-bold">
              {user.name.charAt(0).toUpperCase()}
            </span>
          )}
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-80 bg-[#2b2d31] rounded-xl border border-[#404249] shadow-xl z-50 overflow-hidden">
            {/* User info header */}
            <div className="px-4 py-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b border-[#404249]">
              <div className="flex items-center space-x-3">
                {user.avatar_url ? (
                  <img 
                    src={user.avatar_url} 
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{user.name}</p>
                  <p className="text-sm text-gray-400 truncate">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Menu items */}
            <div className="py-2">
              <button
                onClick={() => {
                  window.location.href = '/perfil'
                  setIsOpen(false)
                }}
                className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors"
              >
                <User size={16} />
                <span>Mi Perfil</span>
              </button>
              
              <button
                onClick={() => {
                  window.location.href = '/perfil/tickets'
                  setIsOpen(false)
                }}
                className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors"
              >
                <Ticket size={16} />
                <span>Mis Tickets</span>
              </button>

              <button
                onClick={() => {
                  alert('Próximamente: Eventos favoritos')
                  setIsOpen(false)
                }}
                className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors"
              >
                <Heart size={16} />
                <span>Favoritos</span>
              </button>

              <button
                onClick={() => {
                  window.location.href = '/'
                  setIsOpen(false)
                }}
                className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors"
              >
                <Activity size={16} />
                <span>Feed Social</span>
              </button>

              <div className="border-t border-[#404249] my-2"></div>

              <button
                onClick={() => {
                  alert('Próximamente: Configuración')
                  setIsOpen(false)
                }}
                className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors"
              >
                <Settings size={16} />
                <span>Configuración</span>
              </button>

              <button
                onClick={handleSignOut}
                className="w-full flex items-center space-x-3 px-4 py-2 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
              >
                <LogOut size={16} />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // If not logged in, show auth dropdown
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 text-sm bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg transition-all duration-200 font-medium"
      >
        <User size={16} />
        <span>Iniciar Sesión</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-[#2b2d31] rounded-xl border border-[#404249] shadow-xl z-50 overflow-hidden">
          {/* Header tabs */}
          <div className="flex border-b border-[#404249]">
            <button
              onClick={() => switchMode('login')}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium transition-colors ${
                authMode === 'login' 
                  ? 'bg-purple-500/20 text-purple-400 border-b-2 border-purple-500' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <LogIn size={16} />
              <span>Iniciar Sesión</span>
            </button>
            <button
              onClick={() => switchMode('register')}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium transition-colors ${
                authMode === 'register' 
                  ? 'bg-purple-500/20 text-purple-400 border-b-2 border-purple-500' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <UserPlus size={16} />
              <span>Registrarse</span>
            </button>
          </div>

          {/* Form content */}
          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {authMode === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre completo
                  </label>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 bg-[#1e1f26] border border-[#404249] rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors"
                      placeholder="Ej: María González"
                      required
                      disabled={submitting}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 bg-[#1e1f26] border border-[#404249] rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors"
                    placeholder="tu@email.com"
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full pl-10 pr-12 py-3 bg-[#1e1f26] border border-[#404249] rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors"
                    placeholder="••••••••"
                    required
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    disabled={submitting}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {authMode === 'login' && (
                  <p className="text-xs text-gray-400 mt-1">
                    Demo: usa "demo123" como contraseña
                  </p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full mt-6 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium py-3"
            >
              {submitting ? (
                <div className="flex items-center space-x-2">
                  <Loader2 size={18} className="animate-spin" />
                  <span>{authMode === 'login' ? 'Iniciando sesión...' : 'Registrando...'}</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  {authMode === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />}
                  <span>{authMode === 'login' ? 'Iniciar Sesión' : 'Registrarse'}</span>
                </div>
              )}
            </Button>

            {authMode === 'login' && (
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-xs text-blue-400 mb-1">🚀 Usuarios de prueba:</p>
                <p className="text-xs text-blue-300">maria@example.com / demo123</p>
                <p className="text-xs text-blue-300">carlos@example.com / demo123</p>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  )
}