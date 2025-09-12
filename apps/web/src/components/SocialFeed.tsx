'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, RefreshCw } from 'lucide-react'
import { PostCard } from './PostCard'
import { PurchaseCard } from './PurchaseCard'
import { EventCard } from './EventCard'
import { PostComposer } from './PostComposer'
import { FeedPostWithAuthor } from '@nfticket/feed'

interface SocialFeedProps {
  initialTab?: 'home' | 'popular' | 'following'
}

type FeedType = 'home' | 'popular' | 'following'

export function SocialFeed({ initialTab = 'home' }: SocialFeedProps) {
  const [activeTab, setActiveTab] = useState<FeedType>(initialTab)
  const [posts, setPosts] = useState<FeedPostWithAuthor[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [cursor, setCursor] = useState<string | undefined>()
  const [error, setError] = useState<string | null>(null)

  // Mock current user
  const currentUser = {
    name: 'Juan Pérez',
    username: 'juanperez',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
  }

  const fetchFeed = async (feedType: FeedType, cursor?: string, append = false) => {
    try {
      if (!append) {
        setIsLoading(true)
        setError(null)
      } else {
        setIsLoadingMore(true)
      }

      const params = new URLSearchParams()
      if (cursor) params.append('cursor', cursor)
      params.append('limit', '20')

      const response = await fetch(`/api/feed/${feedType}?${params}`)
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (append) {
        setPosts(prev => [...prev, ...data.posts])
      } else {
        setPosts(data.posts)
      }
      
      setCursor(data.next_cursor)
      setHasMore(data.has_more)
      
    } catch (error) {
      console.error('Feed fetch error:', error)
      setError('Error al cargar el feed. Mostrando contenido de ejemplo.')
      
      // Fallback to mock data
      if (!append) {
        setPosts(getMockPosts())
        setHasMore(false)
      }
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }

  const loadMore = () => {
    if (cursor && hasMore && !isLoadingMore) {
      fetchFeed(activeTab, cursor, true)
    }
  }

  const refreshFeed = () => {
    setCursor(undefined)
    setHasMore(true)
    fetchFeed(activeTab)
  }

  const handleTabChange = (tab: string) => {
    const feedType = tab as FeedType
    setActiveTab(feedType)
    setCursor(undefined)
    setHasMore(true)
    fetchFeed(feedType)
  }

  const handleNewPost = async (postData: any) => {
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      })

      if (!response.ok) {
        throw new Error('Error al crear el post')
      }

      const newPost = await response.json()
      
      // Add optimistically to the beginning of the feed
      setPosts(prev => [newPost, ...prev])
      
    } catch (error) {
      console.error('Error creating post:', error)
      throw error // Re-throw to let PostComposer handle the error
    }
  }

  const handleLike = async (postId: string, liked: boolean) => {
    try {
      const method = liked ? 'POST' : 'DELETE'
      const response = await fetch(`/api/posts/${postId}/like`, { method })
      
      if (!response.ok) {
        throw new Error('Error al dar like')
      }
    } catch (error) {
      console.error('Like error:', error)
      throw error
    }
  }

  const handleComment = (postId: string) => {
    // TODO: Implement comment functionality
    console.log('Comment on post:', postId)
  }

  const handleShare = (postId: string) => {
    // TODO: Implement share functionality
    console.log('Share post:', postId)
  }

  const handleSave = async (postId: string, saved: boolean) => {
    // TODO: Implement save functionality
    console.log('Save post:', postId, saved)
  }

  const renderPostCard = (post: FeedPostWithAuthor) => {
    const commonProps = {
      key: post.id,
      post,
      onLike: handleLike,
      onComment: handleComment,
      onShare: handleShare,
      onSave: handleSave
    }

    switch (post.type) {
      case 'purchase':
        return <PurchaseCard {...commonProps} />
      case 'event_recommendation':
        return <EventCard {...commonProps} />
      default:
        return <PostCard {...commonProps} />
    }
  }

  // Load initial feed
  useEffect(() => {
    fetchFeed(activeTab)
  }, [])

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Post Composer */}
      <PostComposer onPost={handleNewPost} currentUser={currentUser} />

      {/* Feed Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="home">Inicio</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
            <TabsTrigger value="following">Siguiendo</TabsTrigger>
          </TabsList>
          
          <Button
            variant="outline"
            size="sm"
            onClick={refreshFeed}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {error && (
          <Card className="mb-4 border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <p className="text-orange-800 text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        <TabsContent value="home" className="mt-0">
          <FeedContent
            posts={posts}
            isLoading={isLoading}
            isLoadingMore={isLoadingMore}
            hasMore={hasMore}
            onLoadMore={loadMore}
            renderPostCard={renderPostCard}
            emptyMessage="Tu feed está vacío. ¡Sigue a más personas para ver sus posts!"
          />
        </TabsContent>

        <TabsContent value="popular" className="mt-0">
          <FeedContent
            posts={posts}
            isLoading={isLoading}
            isLoadingMore={isLoadingMore}
            hasMore={hasMore}
            onLoadMore={loadMore}
            renderPostCard={renderPostCard}
            emptyMessage="No hay posts populares en este momento."
          />
        </TabsContent>

        <TabsContent value="following" className="mt-0">
          <FeedContent
            posts={posts}
            isLoading={isLoading}
            isLoadingMore={isLoadingMore}
            hasMore={hasMore}
            onLoadMore={loadMore}
            renderPostCard={renderPostCard}
            emptyMessage="No hay posts de las personas que sigues."
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface FeedContentProps {
  posts: FeedPostWithAuthor[]
  isLoading: boolean
  isLoadingMore: boolean
  hasMore: boolean
  onLoadMore: () => void
  renderPostCard: (post: FeedPostWithAuthor) => React.ReactNode
  emptyMessage: string
}

function FeedContent({
  posts,
  isLoading,
  isLoadingMore,
  hasMore,
  onLoadMore,
  renderPostCard,
  emptyMessage
}: FeedContentProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-gray-500">{emptyMessage}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map(renderPostCard)}
      
      {hasMore && (
        <div className="flex justify-center py-4">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="w-full max-w-xs"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Cargando...
              </>
            ) : (
              'Cargar más'
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

// Mock data fallback
function getMockPosts(): FeedPostWithAuthor[] {
  return [
    {
      id: '1',
      author_id: 'user1',
      type: 'user',
      text: '¡Acabo de llegar a Santo Domingo! La ciudad se ve increíble desde el avión 🇩🇴',
      visibility: 'public',
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      likes_count: 15,
      comments_count: 3,
      saves_count: 2,
      shares_count: 1,
      reports_count: 0,
      hashtags: ['SantoDomingo', 'RepublicaDominicana'],
      location: 'Aeropuerto Las Américas',
      author: {
        id: 'user1',
        name: 'María González',
        full_name: 'María González',
        username: 'mariag',
        avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b5ab?w=32&h=32&fit=crop&crop=face'
      }
    },
    {
      id: '2',
      author_id: 'user2',
      type: 'purchase',
      text: 'No puedo esperar a ver a Bad Bunny en vivo! 🐰🔥',
      visibility: 'public',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      likes_count: 45,
      comments_count: 12,
      saves_count: 8,
      shares_count: 5,
      reports_count: 0,
      hashtags: ['BadBunny', 'Concierto', 'RD'],
      event_name: 'Bad Bunny - World\'s Hottest Tour',
      ticket_type: 'VIP',
      ticket_price: 8500,
      event_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
      event_location: 'Estadio Olímpico, Santo Domingo',
      author: {
        id: 'user2',
        name: 'Carlos Rodríguez',
        full_name: 'Carlos Rodríguez',
        username: 'carlosr',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face'
      }
    }
  ]
}