'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { FeedPostWithAuthor } from '@nfticket/feed'

interface PostDetailModalProps {
  post: FeedPostWithAuthor | null
  isOpen: boolean
  onClose: () => void
  onLike?: (postId: string, liked: boolean) => void
  onComment?: (postId: string) => void
  onShare?: (postId: string) => void
  onSave?: (postId: string, saved: boolean) => void
}

interface MediaItem {
  id: string
  url: string
  type: 'image' | 'video'
  thumbnail?: string
  metadata?: {
    width?: number
    height?: number
    duration?: number
    size?: number
  }
}

export function PostDetailModal({ 
  post, 
  isOpen, 
  onClose, 
  onLike, 
  onComment, 
  onShare, 
  onSave 
}: PostDetailModalProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [likesCount, setLikesCount] = useState(post?.likes_count || 0)
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [isLoadingMedia, setIsLoadingMedia] = useState(false)

  useEffect(() => {
    if (post?.media && post.media.length > 0) {
      processMediaWithService(post.media)
    }
  }, [post])

  const processMediaWithService = async (media: any[]) => {
    setIsLoadingMedia(true)
    try {
      const processedMedia: MediaItem[] = await Promise.all(
        media.map(async (item, index) => {
          // Check if media service can optimize this item
          if (item.url && typeof item.url === 'string') {
            try {
              // Try to get optimized version from media service
              const response = await fetch(`http://localhost:3003/api/media/optimize`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  url: item.url,
                  type: item.url.includes('video') || item.url.endsWith('.mp4') || item.url.endsWith('.webm') ? 'video' : 'image',
                  options: {
                    width: 800,
                    height: 600,
                    quality: 0.9
                  }
                })
              })

              if (response.ok) {
                const optimizedData = await response.json()
                return {
                  id: item.id || `media-${index}`,
                  url: optimizedData.optimizedUrl || item.url,
                  type: optimizedData.type || 'image',
                  thumbnail: optimizedData.thumbnail,
                  metadata: optimizedData.metadata
                }
              }
            } catch (error) {
              console.warn('Media service optimization failed, using original:', error)
            }
          }

          // Fallback to original
          return {
            id: item.id || `media-${index}`,
            url: item.url,
            type: item.url?.includes('video') || item.url?.endsWith('.mp4') || item.url?.endsWith('.webm') ? 'video' : 'image'
          }
        })
      )
      setMediaItems(processedMedia)
    } catch (error) {
      console.error('Error processing media:', error)
      // Fallback to original media
      setMediaItems(media.map((item, index) => ({
        id: item.id || `media-${index}`,
        url: item.url,
        type: 'image'
      })))
    } finally {
      setIsLoadingMedia(false)
    }
  }

  const handleLike = async () => {
    if (!post) return
    const newLiked = !isLiked
    setIsLiked(newLiked)
    setLikesCount(prev => newLiked ? prev + 1 : prev - 1)
    
    try {
      await onLike?.(post.id, newLiked)
    } catch (error) {
      setIsLiked(!newLiked)
      setLikesCount(prev => newLiked ? prev - 1 : prev + 1)
    }
  }

  const handleSave = async () => {
    if (!post) return
    const newSaved = !isSaved
    setIsSaved(newSaved)
    
    try {
      await onSave?.(post.id, newSaved)
    } catch (error) {
      setIsSaved(!newSaved)
    }
  }

  const nextMedia = () => {
    setCurrentMediaIndex(prev => 
      prev === mediaItems.length - 1 ? 0 : prev + 1
    )
  }

  const prevMedia = () => {
    setCurrentMediaIndex(prev => 
      prev === 0 ? mediaItems.length - 1 : prev - 1
    )
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'user': return 'bg-blue-100 text-blue-800'
      case 'community': return 'bg-green-100 text-green-800'
      case 'activity': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'hace unos minutos'
    if (diffInHours < 24) return `hace ${diffInHours}h`
    const diffInDays = Math.floor(diffInHours / 24)
    return `hace ${diffInDays}d`
  }

  if (!post) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full h-[90vh] p-0 bg-white dark:bg-gray-900">
        <div className="flex h-full">
          {/* Left side - Media */}
          <div className="flex-1 bg-black relative flex items-center justify-center">
            {mediaItems.length > 0 && !isLoadingMedia ? (
              <>
                {mediaItems[currentMediaIndex]?.type === 'video' ? (
                  <video
                    src={mediaItems[currentMediaIndex].url}
                    controls
                    className="max-w-full max-h-full object-contain"
                    poster={mediaItems[currentMediaIndex].thumbnail}
                  />
                ) : (
                  <img
                    src={mediaItems[currentMediaIndex]?.url}
                    alt={`Media ${currentMediaIndex + 1}`}
                    className="max-w-full max-h-full object-contain"
                  />
                )}
                
                {/* Navigation arrows */}
                {mediaItems.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={prevMedia}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={nextMedia}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                  </>
                )}

                {/* Media indicator dots */}
                {mediaItems.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                    {mediaItems.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentMediaIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentMediaIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : isLoadingMedia ? (
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                <p>Optimizando medios...</p>
              </div>
            ) : (
              <div className="text-white text-center">
                <p>Sin medios para mostrar</p>
              </div>
            )}

            {/* Close button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Right side - Post details */}
          <div className="w-96 flex flex-col bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={post.author.avatar_url} alt={post.author.name} />
                  <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <p className="font-semibold text-sm">{post.author.name}</p>
                    <Badge variant="secondary" className={`text-xs ${getTypeColor(post.type)}`}>
                      {post.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">
                    @{post.author.username} · {formatTimeAgo(post.created_at)}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {post.text && (
                <div className="mb-4">
                  <p className="text-sm leading-relaxed dark:text-gray-100">{post.text}</p>
                </div>
              )}

              {post.hashtags && post.hashtags.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-1">
                  {post.hashtags.map((tag, index) => (
                    <span key={index} className="text-blue-600 text-sm hover:underline cursor-pointer">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {post.location && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500">📍 {typeof post.location === 'string' ? post.location : post.location.name}</p>
                </div>
              )}

              {/* Comments section would go here */}
              <div className="text-sm text-gray-500 text-center py-8">
                Los comentarios se mostrarán aquí
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLike}
                    className={`flex items-center space-x-1 ${isLiked ? 'text-red-600' : 'text-gray-600'}`}
                  >
                    <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                    <span className="text-xs">{likesCount}</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onComment?.(post.id)}
                    className="flex items-center space-x-1 text-gray-600"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-xs">{post.comments_count}</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onShare?.(post.id)}
                    className="flex items-center space-x-1 text-gray-600"
                  >
                    <Share className="h-4 w-4" />
                    <span className="text-xs">{post.shares_count}</span>
                  </Button>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSave}
                  className={`${isSaved ? 'text-yellow-600' : 'text-gray-600'}`}
                >
                  <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}