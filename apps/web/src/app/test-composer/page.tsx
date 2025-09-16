'use client'

import { useState } from 'react'
import { PostComposer } from '@/components/PostComposer'
import { useAuth } from '@/lib/auth'

export default function TestComposerPage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<any[]>([])

  const handlePost = async (postData: any) => {
    console.log('📝 Nuevo post creado:', postData)
    
    // Simular guardado del post
    const newPost = {
      id: Date.now().toString(),
      ...postData,
      user: {
        id: user?.id || 'demo_user',
        name: user?.name || 'Usuario Demo',
        username: user?.email?.split('@')[0] || 'usuario_demo',
        avatar_url: user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face'
      },
      timestamp: new Date().toISOString(),
      metrics: {
        likes: 0,
        comments: 0,
        shares: 0,
        saves: 0
      }
    }
    
    setPosts(prev => [newPost, ...prev])
    alert('¡Post creado exitosamente!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0B12] via-[#0F0F18] to-[#1A215F] p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            🧪 Test - Post Composer
          </h1>
          <p className="text-gray-400">
            Página de prueba para el componente PostComposer
          </p>
          
          {user && (
            <div className="mt-4 p-4 bg-green-900/20 border border-green-600/30 rounded-lg">
              <p className="text-green-400 text-sm">
                ✅ Usuario logueado: <strong>{user.name}</strong> ({user.email})
              </p>
            </div>
          )}
          
          {!user && (
            <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
              <p className="text-yellow-400 text-sm">
                ⚠️ No hay usuario logueado - usando datos por defecto
              </p>
            </div>
          )}
        </div>

        {/* PostComposer Component */}
        <PostComposer 
          onPost={handlePost}
          currentUser={user ? {
            name: user.name,
            username: user.email?.split('@')[0] || 'usuario',
            avatar_url: user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face'
          } : undefined}
        />

        {/* Posts creados */}
        {posts.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-white mb-4">
              📋 Posts Creados ({posts.length})
            </h2>
            
            <div className="space-y-4">
              {posts.map((post) => (
                <div 
                  key={post.id} 
                  className="bg-[#313338] border border-[#404249] rounded-lg p-4"
                >
                  <div className="flex items-start space-x-3">
                    <img 
                      src={post.user.avatar_url} 
                      alt={post.user.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-white">{post.user.name}</h3>
                        <span className="text-gray-400 text-sm">@{post.user.username}</span>
                        <span className="text-gray-500 text-sm">
                          {new Date(post.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      
                      {post.type === 'purchase' && (
                        <div className="mt-2 p-3 bg-green-900/20 border border-green-600/30 rounded-lg">
                          <h4 className="text-green-400 font-medium">🎫 Compra de Ticket</h4>
                          <p className="text-white">{post.event_name}</p>
                          {post.ticket_type && (
                            <p className="text-gray-300 text-sm">Tipo: {post.ticket_type}</p>
                          )}
                          {post.ticket_price && (
                            <p className="text-gray-300 text-sm">Precio: RD${post.ticket_price}</p>
                          )}
                          {post.event_date && (
                            <p className="text-gray-300 text-sm">
                              Fecha: {new Date(post.event_date).toLocaleString()}
                            </p>
                          )}
                          {post.event_location && (
                            <p className="text-gray-300 text-sm">Ubicación: {post.event_location}</p>
                          )}
                        </div>
                      )}
                      
                      {post.text && (
                        <p className="text-white mt-2">{post.text}</p>
                      )}
                      
                      {post.hashtags && post.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {post.hashtags.map((tag: string, index: number) => (
                            <span key={index} className="text-blue-400 text-sm">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {post.location && (
                        <p className="text-gray-400 text-sm mt-2">📍 {post.location}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Información de depuración */}
        <div className="mt-8 p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
          <h3 className="text-white font-medium mb-2">🔧 Información de Debug</h3>
          <div className="text-sm text-gray-400 space-y-1">
            <p>• Usuario actual: {user ? user.name : 'Sin usuario'}</p>
            <p>• Email: {user?.email || 'N/A'}</p>
            <p>• Avatar URL: {user?.avatar_url || 'Usando por defecto'}</p>
            <p>• Posts creados: {posts.length}</p>
            <p>• Página: /test-composer</p>
          </div>
        </div>

        {/* Enlaces de navegación */}
        <div className="mt-6 flex space-x-4">
          <a 
            href="/feed" 
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            ← Volver al Feed
          </a>
          <a 
            href="/" 
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            🏠 Inicio
          </a>
        </div>
      </div>
    </div>
  )
}