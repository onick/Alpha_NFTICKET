'use client'

import { useState, useEffect, useRef } from 'react'
import { Hash, Heart, MessageCircle, Share2, UserPlus, Users, Camera, MapPin, Bookmark, MoreHorizontal, Image as ImageIcon, Smile, Send, Eye } from 'lucide-react'
import { SimpleSidebar } from './SimpleSidebar'
import { ModularLayout } from './ModularLayout'
import { SuggestedFriends } from '../modules/SuggestedFriends'
import { useAuth } from '@/lib/auth'
import ProductionTipTapEditor, { ProductionEditorMonitor } from './ProductionTipTapEditor'
import { PostComposer as RealPostComposer } from './PostComposer'
import { TipTapEditorRef } from './TipTapEditor'
import { extractHashtags, extractMentions, htmlToPlainText } from '@/lib/tiptap-helpers'
import { CommentsModal } from './CommentsModal'
import { ShareModal } from './ShareModal'

interface SocialPost {
  id: string
  user: {
    id: string
    name: string
    username: string
    avatar: string
    verified?: boolean
    following?: boolean
  }
  content: string
  media?: {
    type: 'image' | 'video'
    url: string
    thumbnail?: string
  }[]
  location?: string
  event?: {
    name: string
    venue: string
    date: string
  }
  hashtags: string[]
  mentions: string[]
  metrics: {
    likes: number
    comments: number
    shares: number
    saves: number
  }
  isLiked: boolean
  isSaved: boolean
  timestamp: string
  comments?: Comment[]
}

interface Comment {
  id: string
  user: {
    name: string
    username: string
    avatar: string
  }
  content: string
  timestamp: string
  likes: number
  isLiked: boolean
}

interface Community {
  id: string
  name: string
  description: string
  members: number
  avatar: string
  color: string
  isJoined: boolean
  recentActivity: string
}

export function SocialFeedLayout() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [newPostContent, setNewPostContent] = useState('')
  const [selectedMedia, setSelectedMedia] = useState<File[]>([])
  const [communities, setCommunities] = useState<Community[]>([])
  const [activeTab, setActiveTab] = useState<'following' | 'discover' | 'communities'>('following')
  const [isCommentsOpen, setIsCommentsOpen] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null)
  const [postComments, setPostComments] = useState<Record<string, any[]>>({})
  const [commentLikes, setCommentLikes] = useState<Record<string, { liked: boolean, count: number }>>({})

  // Handler para crear nuevos posts desde PostComposer
  const handlePost = async (postData: any) => {
    console.log('📝 Nuevo post creado desde feed:', postData)
    
    const newPost: SocialPost = {
      id: Date.now().toString(),
      user: {
        id: user?.id || 'demo_user',
        name: user?.name || 'Usuario Demo',
        username: user?.email?.split('@')[0] || 'usuario_demo',
        avatar: user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
        verified: false,
        following: false
      },
      content: postData.text || '',
      media: postData.images ? postData.images.map((image: string, index: number) => ({
        id: `${Date.now()}-${index}`,
        type: 'image' as const,
        url: image,
        thumbnail: image
      })) : [],
      location: postData.location || '',
      event: postData.type === 'purchase' ? {
        name: postData.event_name,
        venue: postData.event_location || '',
        date: postData.event_date || ''
      } : undefined,
      hashtags: postData.hashtags || [],
      mentions: [], // TODO: Extraer mentions del contenido
      metrics: {
        likes: 0,
        comments: 0,
        shares: 0,
        saves: 0
      },
      isLiked: false,
      isSaved: false,
      timestamp: new Date().toISOString()
    }
    
    // Agregar el post al inicio de la lista
    setPosts(prevPosts => [newPost, ...prevPosts])
  }

  useEffect(() => {
    // Load social feed data
    setPosts([
      {
        id: '1',
        user: {
          id: '1',
          name: 'María González',
          username: 'mariag_music',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face',
          verified: true,
          following: true
        },
        content: '¡Qué noche tan increíble en el concierto de Romeo Santos! 🎤✨ La energía del público fue impresionante. Ya extraño estar ahí... #RomeoSantos #ConciertosRD #MemoriasInolvidables',
        media: [
          {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop'
          },
          {
            type: 'image', 
            url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&h=400&fit=crop'
          }
        ],
        location: 'Palacio de los Deportes, Santo Domingo',
        event: {
          name: 'Romeo Santos - Golden Tour',
          venue: 'Palacio de los Deportes',
          date: '2024-12-15'
        },
        hashtags: ['#RomeoSantos', '#ConciertosRD', '#MemoriasInolvidables'],
        mentions: [],
        metrics: {
          likes: 847,
          comments: 156,
          shares: 203,
          saves: 89
        },
        isLiked: false,
        isSaved: false,
        timestamp: 'hace 3 horas',
        comments: [
          {
            id: '1',
            user: {
              name: 'Carlos Rivera',
              username: 'carlostech',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
            },
            content: '¡Se ve que estuvo increíble! Yo no pude conseguir tickets 😢',
            timestamp: 'hace 2 horas',
            likes: 12,
            isLiked: false
          },
          {
            id: '2',
            user: {
              name: 'Ana Herrera',
              username: 'ana_events',
              avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
            },
            content: 'Estuve ahí también! La sección VIP estaba brutal 🔥',
            timestamp: 'hace 1 hora',
            likes: 8,
            isLiked: true
          }
        ]
      },
      {
        id: '2',
        user: {
          id: '2',
          name: 'Carlos Rivera',
          username: 'carlostech',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          following: true
        },
        content: 'Reflexionando sobre todo lo aprendido en Tech Summit RD 2024 🚀. La keynote sobre IA transformó mi perspectiva completamente. ¿Alguien más estuvo ahí? Me encantaría conectar y discutir ideas. #TechSummitRD #IA #Networking',
        media: [
          {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop'
          }
        ],
        location: 'Centro de Convenciones, Santiago',
        event: {
          name: 'Tech Summit RD 2024',
          venue: 'Centro de Convenciones',
          date: '2024-11-20'
        },
        hashtags: ['#TechSummitRD', '#IA', '#Networking'],
        mentions: [],
        metrics: {
          likes: 234,
          comments: 45,
          shares: 67,
          saves: 23
        },
        isLiked: true,
        isSaved: false,
        timestamp: 'hace 6 horas'
      },
      {
        id: '3',
        user: {
          id: '3',
          name: 'Ana Herrera',
          username: 'ana_events',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
          verified: true,
          following: false
        },
        content: '🏆 Milestone achieved! Acabo de completar mi ticket #100 en NFTicket. Desde pequeños meetups hasta mega conciertos, cada experiencia ha sido única. Gracias a esta plataforma por hacer que coleccionar momentos sea tan fácil y seguro. #NFTicket #EventCollector #Milestone',
        hashtags: ['#NFTicket', '#EventCollector', '#Milestone'],
        mentions: [],
        metrics: {
          likes: 567,
          comments: 89,
          shares: 134,
          saves: 45
        },
        isLiked: false,
        isSaved: true,
        timestamp: 'hace 12 horas'
      }
    ])

    setCommunities([
      {
        id: '1',
        name: 'c/eventos-rd',
        description: 'La comunidad principal para eventos en República Dominicana',
        members: 1250,
        avatar: 'E',
        color: 'bg-purple-500',
        isJoined: true,
        recentActivity: 'María González publicó sobre Romeo Santos'
      },
      {
        id: '2',
        name: 'c/musica-electronica',
        description: 'Todo sobre EDM, techno, house y más',
        members: 890,
        avatar: 'M',
        color: 'bg-pink-500',
        isJoined: false,
        recentActivity: '3 nuevos eventos publicados hoy'
      },
      {
        id: '3',
        name: 'c/conciertos-dr',
        description: 'Conciertos y festivales musicales',
        members: 567,
        avatar: 'C',
        color: 'bg-blue-500',
        isJoined: true,
        recentActivity: 'Discusión activa sobre próximos conciertos'
      }
    ])
  }, [])

  const handleLike = (postId: string) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? {
              ...post,
              isLiked: !post.isLiked,
              metrics: {
                ...post.metrics,
                likes: post.isLiked ? post.metrics.likes - 1 : post.metrics.likes + 1
              }
            }
          : post
      )
    )
  }

  const handleSave = (postId: string) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? {
              ...post,
              isSaved: !post.isSaved,
              metrics: {
                ...post.metrics,
                saves: post.isSaved ? post.metrics.saves - 1 : post.metrics.saves + 1
              }
            }
          : post
      )
    )
  }

  const handleShare = (postId: string) => {
    const post = posts.find(p => p.id === postId)
    if (!post) return
    
    setSelectedPost(post)
    setIsShareModalOpen(true)
  }

  const handleShareAction = (method: 'whatsapp' | 'copy' | 'friend', data?: any) => {
    if (!selectedPost) return

    // Increment share count
    setPosts(prevPosts => 
      prevPosts.map(p => 
        p.id === selectedPost.id 
          ? {
              ...p,
              metrics: {
                ...p.metrics,
                shares: p.metrics.shares + 1
              }
            }
          : p
      )
    )

    // Handle different share methods
    switch (method) {
      case 'whatsapp':
        console.log('📱 Compartido por WhatsApp')
        break
      case 'copy':
        console.log('📋 Enlace copiado al portapapeles')
        break
      case 'friend':
        console.log('👥 Compartido con amigos:', data?.friends?.map((f: any) => f.name).join(', '))
        // Here you would send the post to the selected friends via your API
        break
    }
  }

  const handleComment = (post: SocialPost) => {
    setSelectedPost(post)
    setIsCommentsOpen(true)
  }

  const handleNewComment = (postId: string) => {
    // Update comment count in the original post
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? {
              ...post,
              metrics: {
                ...post.metrics,
                comments: post.metrics.comments + 1
              }
            }
          : post
      )
    )
  }

  const handleAddComment = (postId: string, comment: any) => {
    // Add comment to the persistent storage
    setPostComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), comment]
    }))
    handleNewComment(postId)
  }

  const getCommentsForPost = (postId: string) => {
    return postComments[postId] || []
  }

  const handleCommentLike = (commentId: string, currentLikes: number) => {
    setCommentLikes(prev => {
      const currentState = prev[commentId] || { liked: false, count: currentLikes }
      const newLiked = !currentState.liked
      return {
        ...prev,
        [commentId]: {
          liked: newLiked,
          count: newLiked ? currentState.count + 1 : currentState.count - 1
        }
      }
    })
  }

  const getCommentLikeState = (commentId: string, originalCount: number) => {
    const state = commentLikes[commentId]
    return state || { liked: false, count: originalCount }
  }

  // Convert SocialPost to FeedPostWithAuthor for CommentsModal
  const convertToFeedPost = (post: SocialPost) => {
    return {
      id: post.id,
      author_id: post.user.id,
      type: 'user' as const,
      text: post.content,
      visibility: 'public' as const,
      created_at: new Date().toISOString(),
      likes_count: post.metrics.likes,
      comments_count: post.metrics.comments,
      saves_count: post.metrics.saves,
      shares_count: post.metrics.shares,
      reports_count: 0,
      is_liked: post.isLiked,
      is_saved: post.isSaved,
      author: {
        id: post.user.id,
        username: post.user.username,
        name: post.user.name,
        full_name: post.user.name,
        avatar_url: post.user.avatar,
        is_verified: post.user.verified
      },
      hashtags: post.hashtags,
      media: post.media ? post.media.map((m, index) => ({
        id: `${post.id}-${index}`,
        post_id: post.id,
        url: m.url,
        type: 'image' as const
      })) : undefined,
      location: post.location
    }
  }

  const handleFollow = (userId: string) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.user.id === userId 
          ? {
              ...post,
              user: {
                ...post.user,
                following: !post.user.following
              }
            }
          : post
      )
    )
  }

  const handleNewPost = () => {
    // Get the current content directly from the editor
    const currentContent = editorRef.current?.getContent() || newPostContent
    
    if (!currentContent.trim()) return

    // Extract hashtags and mentions from TipTap HTML content
    const hashtags = extractHashtags(currentContent)
    const mentions = extractMentions(currentContent)
    
    // Convert HTML content to plain text for display
    const plainTextContent = htmlToPlainText(currentContent)

    const newPost: SocialPost = {
      id: Date.now().toString(),
      user: {
        id: user?.id || 'demo_user',
        name: user?.name || 'Usuario Demo',
        username: user?.name?.toLowerCase().replace(' ', '_') || 'usuario_demo',
        avatar: user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
        verified: false,
        following: false
      },
      content: plainTextContent,
      hashtags: hashtags,
      mentions: mentions,
      metrics: {
        likes: 0,
        comments: 0,
        shares: 0,
        saves: 0
      },
      isLiked: false,
      isSaved: false,
      timestamp: 'ahora mismo'
    }

    setPosts(prevPosts => [newPost, ...prevPosts])
    
    // Clear the states and editor AFTER creating the post
    setNewPostContent('')
    setSelectedMedia([])
    
    // Clear the editor content with a small delay to ensure it happens after state updates
    setTimeout(() => {
      editorRef.current?.setContent('')
    }, 100)
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const editorRef = useRef<TipTapEditorRef>(null)
  
  // Handle editor content updates
  const handleEditorUpdate = (content: string) => {
    setNewPostContent(content)
  }

  // Handle keyboard shortcuts for TipTap editor
  const handleEditorKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault()
      if (newPostContent.trim()) {
        handleNewPost()
      }
      return true
    }
    return false
  }

  const PostComposer = () => {
    return (
      <div className="bg-[#313338] border border-[#404249] rounded-lg p-4 mb-6 transition-all duration-200 hover:border-brand-400/30">
        <div className="flex space-x-3">
          <img 
            src={user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face'} 
            alt={user?.name || "Usuario Demo"} 
            className="w-10 h-10 rounded-full flex-shrink-0"
            onError={(e) => {
              // Si falla la imagen, usar la imagen por defecto
              const target = e.target as HTMLImageElement
              target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face'
            }}
          />
          <div className="flex-1 min-w-0">
            <ProductionTipTapEditor
              ref={editorRef}
              placeholder="¿Qué está pasando? Comparte tu experiencia en eventos... Usa @ para mencionar usuarios y # para hashtags"
              maxLength={280}
              onUpdate={handleEditorUpdate}
              onKeyDown={handleEditorKeyDown}
              enablePerformanceMonitoring={false}
              optimizationLevel={
                (process.env.TIPTAP_OPTIMIZATION_LEVEL as 'basic' | 'aggressive') || 'basic'
              }
            />
            
            {/* Publish button and shortcuts */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex-1" />
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={handleNewPost}
                  disabled={!newPostContent.trim() || (editorRef.current?.getCharacterCount() || 0) > 280}
                  className="px-6 py-2 bg-brand-500 hover:bg-brand-600 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 text-white rounded-full font-medium transition-all duration-200 flex items-center space-x-2 min-w-[100px]"
                >
                  <Send size={16} />
                  <span>Publicar</span>
                </button>
              </div>
            </div>
            
            {/* Keyboard shortcut hint */}
            {newPostContent.trim() && (
              <div className="text-xs text-gray-500 mt-1 text-right">
                Cmd/Ctrl + Enter para publicar • @ para mencionar • # para hashtags
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const PostCard = ({ post }: { post: SocialPost }) => (
    <div className="bg-[#313338] border border-[#404249] rounded-lg p-4 hover:border-brand-400/30 transition-all duration-300">
      {/* Post Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <img src={post.user.avatar} alt={post.user.name} className="w-10 h-10 rounded-full" />
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-medium text-white">{post.user.name}</h4>
              {post.user.verified && <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>}
            </div>
            <p className="text-xs text-gray-400">@{post.user.username} • {post.timestamp}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {!post.user.following && post.user.id !== user?.id && (
            <button
              onClick={() => handleFollow(post.user.id)}
              className="flex items-center space-x-1 px-3 py-1 bg-brand-500/20 text-brand-400 rounded-full text-sm hover:bg-brand-500/30 transition-colors"
            >
              <UserPlus size={14} />
              <span>Seguir</span>
            </button>
          )}
          <button className="text-gray-400 hover:text-white transition-colors">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>

      {/* Post Content */}
      <div className="mb-3">
        <p className="text-white leading-relaxed">{post.content}</p>
        {post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {post.hashtags.map((hashtag, idx) => (
              <span key={idx} className="text-brand-400 hover:text-brand-300 cursor-pointer">
                {hashtag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Media */}
      {post.media && post.media.length > 0 && (
        <div className={`grid gap-2 mb-3 rounded-lg overflow-hidden ${
          post.media.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
        }`}>
          {post.media.map((media, idx) => (
            <img
              key={idx}
              src={media.url}
              alt="Post media"
              className={`w-full object-cover cursor-pointer hover:opacity-90 transition-opacity ${
                post.media!.length === 1 ? 'h-80' : 'h-48'
              }`}
            />
          ))}
        </div>
      )}

      {/* Location */}
      {post.location && (
        <div className="flex items-center space-x-1 text-gray-400 text-sm mb-3">
          <MapPin size={14} />
          <span>{post.location}</span>
        </div>
      )}

      {/* Event Info */}
      {post.event && (
        <div className="p-3 bg-[#2b2d31] rounded-lg mb-3">
          <div className="flex items-center space-x-2 text-brand-400 text-sm">
            <span>🎫</span>
            <span>Evento: {post.event.name}</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">{post.event.venue} • {new Date(post.event.date).toLocaleDateString('es-ES')}</p>
        </div>
      )}

      {/* Post Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-[#404249]">
        <div className="flex items-center space-x-6">
          <button
            onClick={() => handleLike(post.id)}
            className={`flex items-center space-x-1 transition-colors ${
              post.isLiked ? 'text-red-400' : 'text-gray-400 hover:text-red-400'
            }`}
          >
            <Heart size={16} className={post.isLiked ? 'fill-current' : ''} />
            <span className="text-sm">{formatNumber(post.metrics.likes)}</span>
          </button>
          <button 
            onClick={() => handleComment(post)}
            className="flex items-center space-x-1 text-gray-400 hover:text-blue-400 transition-colors"
          >
            <MessageCircle size={16} />
            <span className="text-sm">{formatNumber(post.metrics.comments)}</span>
          </button>
          <button 
            onClick={() => handleShare(post.id)}
            className="flex items-center space-x-1 text-gray-400 hover:text-green-400 transition-colors"
          >
            <Share2 size={16} />
            <span className="text-sm">{formatNumber(post.metrics.shares)}</span>
          </button>
        </div>
        <button
          onClick={() => handleSave(post.id)}
          className={`transition-colors ${
            post.isSaved ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'
          }`}
        >
          <Bookmark size={16} className={post.isSaved ? 'fill-current' : ''} />
        </button>
      </div>

      {/* Comments Preview */}
      {post.comments && post.comments.length > 0 && (
        <div className="mt-4 pt-3 border-t border-[#404249]">
          <div className="space-y-3">
            {post.comments.slice(0, 2).map((comment) => (
              <div key={comment.id} className="flex space-x-2">
                <img src={comment.user.avatar} alt={comment.user.name} className="w-6 h-6 rounded-full" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-white">{comment.user.name}</span>
                    <span className="text-xs text-gray-400">{comment.timestamp}</span>
                  </div>
                  <p className="text-sm text-gray-300">{comment.content}</p>
                </div>
              </div>
            ))}
            {post.comments.length > 2 && (
              <button className="text-sm text-brand-400 hover:text-brand-300">
                Ver los {post.comments.length - 2} comentarios restantes
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )

  const CommunityCard = ({ community }: { community: Community }) => (
    <div className="bg-[#313338] border border-[#404249] rounded-lg p-4 hover:border-brand-400/30 transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 ${community.color} rounded-full flex items-center justify-center`}>
            <span className="text-white font-bold">{community.avatar}</span>
          </div>
          <div>
            <h4 className="font-medium text-white">{community.name}</h4>
            <p className="text-xs text-gray-400">{formatNumber(community.members)} miembros</p>
          </div>
        </div>
        <button
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            community.isJoined
              ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              : 'bg-brand-500 text-white hover:bg-brand-600'
          }`}
        >
          {community.isJoined ? 'Unirse' : 'Unido'}
        </button>
      </div>
      <p className="text-sm text-gray-300 mb-2">{community.description}</p>
      <p className="text-xs text-gray-400">{community.recentActivity}</p>
    </div>
  )

  const SocialFeedContent = () => (
    <div className="space-y-6">
      {/* Live Indicator */}
      <div className="flex justify-end">
        <div className="flex items-center space-x-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
          <Eye size={14} />
          <span>En vivo</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-2 bg-[#313338] p-1 rounded-lg border border-[#404249]">
        {[
          { id: 'following', label: 'Siguiendo', icon: Users },
          { id: 'discover', label: 'Descubrir', icon: Hash },
          { id: 'communities', label: 'Comunidades', icon: Users }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-brand-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-[#404249]/50'
            }`}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Post Composer */}
      {(activeTab === 'following' || activeTab === 'discover') && (
        <RealPostComposer 
          onPost={handlePost}
          currentUser={user ? {
            name: user.name,
            username: user.email?.split('@')[0] || 'usuario',
            avatar_url: user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face'
          } : undefined}
        />
      )}

      {/* Content based on active tab */}
      <div className="space-y-6">
        {activeTab === 'communities' ? (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Comunidades Activas</h2>
            <div className="grid gap-4">
              {communities.map((community) => (
                <CommunityCard key={community.id} community={community} />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  )

  // Configure right sidebar modules for social feed
  const rightModules = [
    <SuggestedFriends key="suggested" />
  ]

  return (
    <>
      <ModularLayout
        leftSidebar={<SimpleSidebar />}
        mainContent={<SocialFeedContent />}
        rightModules={rightModules}
        showRightSidebar={true}
        pageTitle="Feed Social"
        pageSubtitle="Conecta con la comunidad de eventos"
        showHeader={true}
      />
      <ProductionEditorMonitor />
      
      {/* Comments Modal */}
      {selectedPost && (
        <CommentsModal
          post={convertToFeedPost(selectedPost)}
          isOpen={isCommentsOpen}
          onClose={() => {
            setIsCommentsOpen(false)
            setSelectedPost(null)
          }}
          onLike={(postId, liked) => handleLike(postId)}
          onShare={(postId) => {
            const post = posts.find(p => p.id === postId)
            if (post) {
              setSelectedPost(post)
              setIsShareModalOpen(true)
            }
          }}
          onSave={(postId, saved) => handleSave(postId)}
          onNewComment={handleNewComment}
          onAddComment={handleAddComment}
          existingComments={getCommentsForPost(selectedPost.id)}
          onCommentLike={handleCommentLike}
          getCommentLikeState={getCommentLikeState}
        />
      )}

      {/* Share Modal */}
      {selectedPost && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => {
            setIsShareModalOpen(false)
            setSelectedPost(null)
          }}
          post={{
            id: selectedPost.id,
            content: selectedPost.content,
            author: {
              name: selectedPost.user.name,
              username: selectedPost.user.username
            },
            location: selectedPost.location
          }}
          onShare={handleShareAction}
        />
      )}
    </>
  )
}