'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Heart, MessageCircle, Share, Bookmark, ShoppingBag, Calendar, MapPin } from 'lucide-react'
import { FeedPostWithAuthor } from '@nfticket/feed'

interface PurchaseCardProps {
  post: FeedPostWithAuthor
  onLike?: (postId: string, liked: boolean) => void
  onComment?: (postId: string) => void
  onShare?: (postId: string) => void
  onSave?: (postId: string, saved: boolean) => void
}

export function PurchaseCard({ post, onLike, onComment, onShare, onSave }: PurchaseCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [likesCount, setLikesCount] = useState(post.likes_count)

  const handleLike = async () => {
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
    const newSaved = !isSaved
    setIsSaved(newSaved)
    
    try {
      await onSave?.(post.id, newSaved)
    } catch (error) {
      setIsSaved(!newSaved)
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

  const formatEventDate = (dateString?: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('es-DO', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Card className="w-full border-l-4 border-l-green-500">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author.avatar_url} alt={post.author.name} />
              <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <p className="font-semibold text-sm">{post.author.name}</p>
                <Badge className="text-xs bg-green-100 text-green-800">
                  <ShoppingBag className="h-3 w-3 mr-1" />
                  compra
                </Badge>
              </div>
              <p className="text-xs text-gray-500">
                @{post.author.username} · {formatTimeAgo(post.created_at)}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {post.text && (
          <div className="mb-4">
            <p className="text-sm leading-relaxed">{post.text}</p>
          </div>
        )}

        {/* Purchase Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <ShoppingBag className="h-4 w-4 text-green-600" />
            <span className="font-medium text-sm">Compra de Ticket</span>
          </div>
          
          {post.event_name && (
            <h3 className="font-semibold text-base mb-2">{post.event_name}</h3>
          )}
          
          <div className="space-y-1 text-sm text-gray-600">
            {post.ticket_type && (
              <p><span className="font-medium">Tipo:</span> {post.ticket_type}</p>
            )}
            {post.ticket_price && (
              <p><span className="font-medium">Precio:</span> RD${post.ticket_price}</p>
            )}
            {post.event_date && (
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>{formatEventDate(post.event_date)}</span>
              </div>
            )}
            {post.event_location && (
              <div className="flex items-center space-x-1">
                <MapPin className="h-3 w-3" />
                <span>{post.event_location}</span>
              </div>
            )}
          </div>
        </div>

        {post.hashtags && post.hashtags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1">
            {post.hashtags.map((tag, index) => (
              <span key={index} className="text-blue-600 text-sm hover:underline cursor-pointer">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
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
      </CardContent>
    </Card>
  )
}