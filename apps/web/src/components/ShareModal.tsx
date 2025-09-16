'use client'

import { useState } from 'react'
import { X, Search, Copy, Link, MessageCircle, Share2, Check } from 'lucide-react'

interface Friend {
  id: string
  name: string
  username: string
  avatar: string
  isOnline?: boolean
}

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  post: {
    id: string
    content: string
    author: {
      name: string
      username: string
    }
    location?: string
  }
  onShare: (method: 'whatsapp' | 'copy' | 'friend', data?: any) => void
}

export function ShareModal({ isOpen, onClose, post, onShare }: ShareModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFriends, setSelectedFriends] = useState<string[]>([])
  const [copiedLink, setCopiedLink] = useState(false)

  // Mock friends data - in real app, this would come from API
  const friends: Friend[] = [
    {
      id: '1',
      name: 'Ana Herrera',
      username: 'ana_events',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      isOnline: true
    },
    {
      id: '2',
      name: 'Carlos Rivera',
      username: 'carlostech',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      isOnline: true
    },
    {
      id: '3',
      name: 'María González',
      username: 'mariag_music',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face',
      isOnline: false
    },
    {
      id: '4',
      name: 'Luis Martínez',
      username: 'luism_photo',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      isOnline: true
    },
    {
      id: '5',
      name: 'Sofia Reyes',
      username: 'sofia_design',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
      isOnline: false
    },
    {
      id: '6',
      name: 'Diego Santos',
      username: 'diego_music',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
      isOnline: true
    }
  ]

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    friend.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleFriendSelection = (friendId: string) => {
    setSelectedFriends(prev =>
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    )
  }

  const handleShareToWhatsApp = () => {
    const shareUrl = `${window.location.origin}/post/${post.id}`
    const shareText = `¡Mira este post de ${post.author.name}!\n\n"${post.content}"\n\n📍 ${post.location || 'NFTicket'}\n\n`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + shareUrl)}`
    
    window.open(whatsappUrl, '_blank')
    onShare('whatsapp')
    onClose()
  }

  const handleCopyLink = async () => {
    const shareUrl = `${window.location.origin}/post/${post.id}`
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
      onShare('copy')
    } catch (error) {
      console.error('Error copying to clipboard:', error)
    }
  }

  const handleShareToFriends = () => {
    if (selectedFriends.length > 0) {
      const selectedFriendData = friends.filter(f => selectedFriends.includes(f.id))
      onShare('friend', { friends: selectedFriendData, post })
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#2b2d31] rounded-2xl w-full max-w-md mx-auto shadow-2xl border border-[#404249]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#404249]">
          <h3 className="text-lg font-semibold text-white">Compartir post</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-[#404249]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Buscar amigos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1e1f22] border border-[#404249] rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>
        </div>

        {/* Friends List */}
        <div className="max-h-80 overflow-y-auto">
          <div className="p-2">
            {filteredFriends.map((friend) => (
              <div
                key={friend.id}
                onClick={() => toggleFriendSelection(friend.id)}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-[#404249]/50 cursor-pointer transition-colors"
              >
                <div className="relative">
                  <img
                    src={friend.avatar}
                    alt={friend.name}
                    className="w-10 h-10 rounded-full"
                  />
                  {friend.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[#2b2d31] rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{friend.name}</p>
                  <p className="text-gray-400 text-sm truncate">@{friend.username}</p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  selectedFriends.includes(friend.id)
                    ? 'bg-brand-500 border-brand-500'
                    : 'border-gray-400'
                }`}>
                  {selectedFriends.includes(friend.id) && (
                    <Check size={14} className="text-white" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Friends Count */}
        {selectedFriends.length > 0 && (
          <div className="px-4 py-2 bg-[#404249]/30 border-y border-[#404249]">
            <p className="text-brand-400 text-sm font-medium">
              {selectedFriends.length} amigo{selectedFriends.length !== 1 ? 's' : ''} seleccionado{selectedFriends.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* Share Options */}
        <div className="p-4 border-t border-[#404249]">
          <div className="grid grid-cols-3 gap-3 mb-4">
            {/* WhatsApp */}
            <button
              onClick={handleShareToWhatsApp}
              className="flex flex-col items-center space-y-2 p-3 rounded-lg bg-[#404249]/50 hover:bg-[#25D366]/20 transition-colors group"
            >
              <div className="w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center">
                <MessageCircle size={20} className="text-white" />
              </div>
              <span className="text-xs text-gray-300 group-hover:text-[#25D366] transition-colors">WhatsApp</span>
            </button>

            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="flex flex-col items-center space-y-2 p-3 rounded-lg bg-[#404249]/50 hover:bg-blue-500/20 transition-colors group"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                copiedLink ? 'bg-green-500' : 'bg-blue-500'
              }`}>
                {copiedLink ? <Check size={20} className="text-white" /> : <Copy size={20} className="text-white" />}
              </div>
              <span className={`text-xs transition-colors ${
                copiedLink ? 'text-green-400' : 'text-gray-300 group-hover:text-blue-400'
              }`}>
                {copiedLink ? 'Copiado!' : 'Copiar'}
              </span>
            </button>

            {/* Instagram */}
            <button
              onClick={() => {
                const shareUrl = `${window.location.origin}/post/${post.id}`
                const shareText = `¡Mira este post de ${post.author.name}!\n\n"${post.content}"\n\n📍 ${post.location || 'NFTicket'}\n\n`
                
                // Try to open Instagram app or web version
                const instagramUrl = `https://www.instagram.com/`
                
                // Copy content to clipboard for easy pasting
                navigator.clipboard.writeText(`${shareText}${shareUrl}`).then(() => {
                  // Open Instagram
                  window.open(instagramUrl, '_blank')
                  onShare('copy')
                  onClose()
                }).catch(() => {
                  // Fallback: just open Instagram
                  window.open(instagramUrl, '_blank')
                  onShare('copy')
                  onClose()
                })
              }}
              className="flex flex-col items-center space-y-2 p-3 rounded-lg bg-[#404249]/50 hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/20 transition-colors group"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white" className="text-white">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </div>
              <span className="text-xs text-gray-300 group-hover:text-pink-400 transition-colors">Instagram</span>
            </button>
          </div>

          {/* Send to Friends Button */}
          {selectedFriends.length > 0 && (
            <button
              onClick={handleShareToFriends}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white font-medium py-3 rounded-lg transition-colors"
            >
              Enviar a {selectedFriends.length} amigo{selectedFriends.length !== 1 ? 's' : ''}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}