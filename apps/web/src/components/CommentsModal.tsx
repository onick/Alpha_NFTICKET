'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, Heart, MessageCircle, Share, Bookmark, Send, MoreHorizontal } from 'lucide-react'
import { FeedPostWithAuthor } from '@nfticket/feed'
import { useAuth } from '@/lib/auth'

interface Comment {
  id: string
  text: string
  author: {
    id: string
    name: string
    username: string
    avatar_url: string
  }
  created_at: string
  likes_count: number
  is_liked?: boolean
}

interface CommentsModalProps {
  post: FeedPostWithAuthor
  isOpen: boolean
  onClose: () => void
  onLike?: (postId: string, liked: boolean) => void
  onShare?: (postId: string) => void
  onSave?: (postId: string, saved: boolean) => void
  onNewComment?: (postId: string) => void
  onAddComment?: (postId: string, comment: any) => void
  existingComments?: any[]
  onCommentLike?: (commentId: string, currentLikes: number) => void
  getCommentLikeState?: (commentId: string, originalCount: number) => { liked: boolean, count: number }
}

export function CommentsModal({ 
  post, 
  isOpen, 
  onClose, 
  onLike, 
  onShare, 
  onSave,
  onNewComment,
  onAddComment,
  existingComments = [],
  onCommentLike,
  getCommentLikeState
}: CommentsModalProps) {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isPostLiked, setIsPostLiked] = useState(false)
  const [isPostSaved, setIsPostSaved] = useState(false)
  const [postLikesCount, setPostLikesCount] = useState(post.likes_count)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')

  // Mock user for comments
  const defaultUser = {
    id: 'demo_user',
    name: user?.name || 'Usuario Demo',
    username: user?.email?.split('@')[0] || 'usuario_demo',
    avatar_url: user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face'
  }

  useEffect(() => {
    if (isOpen) {
      // Load existing comments and mock comments
      loadComments()
    }
  }, [isOpen, post.id, existingComments])

  const loadComments = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/comments?postId=${post.id}`)
      if (response.ok) {
        const data = await response.json()
        const apiComments = data.comments.map((comment: any) => ({
          id: comment.id,
          text: comment.content,
          author: {
            id: comment.user.id,
            name: comment.user.name,
            username: comment.user.username,
            avatar_url: comment.user.avatar
          },
          created_at: new Date().toISOString(),
          likes_count: comment.likes,
          is_liked: comment.isLiked
        }))
        
        // Combine with existing comments and remove duplicates
        const allComments = [...apiComments, ...existingComments]
        const uniqueComments = allComments.filter((comment, index, self) => 
          index === self.findIndex(c => c.id === comment.id)
        )
        
        setComments(uniqueComments)
      } else {
        // Fallback to existing comments and mock data
        loadMockComments()
      }
    } catch (error) {
      console.error('Error loading comments:', error)
      // Fallback to existing comments and mock data
      loadMockComments()
    } finally {
      setIsLoading(false)
    }
  }

  const loadMockComments = () => {
    // Don't load mock comments for new posts - only use existing comments
    setComments([...existingComments])
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    setIsLoading(true)
    
    try {
      // Save comment to database via API
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: post.id,
          content: newComment.trim()
        }),
      })

      if (response.ok) {
        const savedComment = await response.json()
        
        // Convert to our Comment format
        const comment: Comment = {
          id: savedComment.id,
          text: savedComment.content,
          author: {
            id: savedComment.user.id,
            name: savedComment.user.name,
            username: savedComment.user.username,
            avatar_url: savedComment.user.avatar
          },
          created_at: new Date().toISOString(),
          likes_count: savedComment.likes,
          is_liked: savedComment.isLiked
        }

        // Add to local state for immediate display
        setComments(prev => [...prev, comment])
        setNewComment('')
        
        // Add to persistent storage via parent
        onAddComment?.(post.id, comment)
        
        // Update comment count
        onNewComment?.(post.id)
      } else {
        console.error('Failed to save comment')
        // Fallback: create comment locally
        createLocalComment()
      }
    } catch (error) {
      console.error('Error saving comment:', error)
      // Fallback: create comment locally
      createLocalComment()
    } finally {
      setIsLoading(false)
    }
  }

  const createLocalComment = () => {
    const comment: Comment = {
      id: Date.now().toString(),
      text: newComment.trim(),
      author: defaultUser,
      created_at: new Date().toISOString(),
      likes_count: 0,
      is_liked: false
    }

    // Add to local state for immediate display
    setComments(prev => [...prev, comment])
    setNewComment('')
    
    // Add to persistent storage via parent
    onAddComment?.(post.id, comment)
  }

  const handleCommentLikeLocal = (commentId: string) => {
    // Find the comment to get current likes
    const comment = comments.find(c => c.id === commentId)
    if (comment && onCommentLike) {
      onCommentLike(commentId, comment.likes_count)
    }
  }

  const handleReply = (commentId: string, authorName: string) => {
    setReplyingTo(commentId)
    setReplyText(`@${authorName} `)
  }

  const submitReply = async () => {
    if (!replyText.trim() || !replyingTo) return
    
    setIsLoading(true)
    
    try {
      // Save reply to database via API
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: post.id,
          content: replyText.trim(),
          parentId: replyingTo // This makes it a reply
        }),
      })

      if (response.ok) {
        const savedReply = await response.json()
        
        // Convert to our Comment format
        const replyComment: Comment = {
          id: savedReply.id,
          text: savedReply.content,
          author: {
            id: savedReply.user.id,
            name: savedReply.user.name,
            username: savedReply.user.username,
            avatar_url: savedReply.user.avatar
          },
          created_at: new Date().toISOString(),
          likes_count: savedReply.likes,
          is_liked: savedReply.isLiked
        }

        // Add to local state for immediate display
        setComments(prev => [...prev, replyComment])
        setReplyText('')
        setReplyingTo(null)
        
        // Add to persistent storage via parent
        onAddComment?.(post.id, replyComment)
        
        // Update comment count
        onNewComment?.(post.id)
      } else {
        console.error('Failed to save reply')
        // Fallback: create reply locally
        createLocalReply()
      }
    } catch (error) {
      console.error('Error saving reply:', error)
      // Fallback: create reply locally
      createLocalReply()
    } finally {
      setIsLoading(false)
    }
  }

  const createLocalReply = () => {
    const replyComment: Comment = {
      id: Date.now().toString(),
      text: replyText.trim(),
      author: defaultUser,
      created_at: new Date().toISOString(),
      likes_count: 0,
      is_liked: false
    }

    setComments(prev => [...prev, replyComment])
    setReplyText('')
    setReplyingTo(null)
    onAddComment?.(post.id, replyComment)
  }

  const handlePostLike = async () => {
    const newLiked = !isPostLiked
    setIsPostLiked(newLiked)
    setPostLikesCount(prev => newLiked ? prev + 1 : prev - 1)
    
    try {
      await onLike?.(post.id, newLiked)
    } catch (error) {
      // Revert on error
      setIsPostLiked(!newLiked)
      setPostLikesCount(prev => newLiked ? prev - 1 : prev + 1)
    }
  }

  const handlePostSave = async () => {
    const newSaved = !isPostSaved
    setIsPostSaved(newSaved)
    
    try {
      await onSave?.(post.id, newSaved)
    } catch (error) {
      setIsPostSaved(!newSaved)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'ahora'
    if (diffInMinutes < 60) return `${diffInMinutes}m`
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d`
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'user': return 'bg-blue-100 text-blue-800'
      case 'community': return 'bg-green-100 text-green-800'
      case 'activity': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#313338] rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#404249]">
          <h2 className="text-lg font-semibold text-white">Comentarios</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-col h-[calc(90vh-80px)]">
          {/* Original Post */}
          <div className="p-4 border-b border-[#404249]">
            <Card className="w-full bg-[#2b2d31] border-[#404249]">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.author.avatar_url} alt={post.author.name} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {post.author.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-semibold text-sm text-white">{post.author.name}</p>
                        <Badge variant="secondary" className={`text-xs ${getTypeColor(post.type)}`}>
                          {post.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400">
                        @{post.author.username} · {formatTimeAgo(post.created_at)}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {post.text && (
                  <div className="mb-4">
                    <p className="text-sm leading-relaxed text-white">{post.text}</p>
                  </div>
                )}

                {/* Images */}
                {post.media && post.media.length > 0 && (
                  <div className="mb-4">
                    <div className={`grid gap-2 rounded-lg overflow-hidden ${
                      post.media.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
                    }`}>
                      {post.media.slice(0, 4).map((media, index) => (
                        <div key={media.id || index} className="relative">
                          <img 
                            src={media.url} 
                            alt={`Post image ${index + 1}`}
                            className="w-full h-32 object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {post.hashtags && post.hashtags.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-1">
                    {post.hashtags.map((tag, index) => (
                      <span key={index} className="text-blue-400 text-sm hover:underline cursor-pointer">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-[#404249]">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handlePostLike}
                      className={`flex items-center space-x-1 ${isPostLiked ? 'text-red-400' : 'text-gray-400'}`}
                    >
                      <Heart className={`h-4 w-4 ${isPostLiked ? 'fill-current' : ''}`} />
                      <span className="text-xs">{postLikesCount}</span>
                    </Button>

                    <div className="flex items-center space-x-1 text-blue-400">
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-xs">{comments.length}</span>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onShare?.(post.id)}
                      className="flex items-center space-x-1 text-gray-400"
                    >
                      <Share className="h-4 w-4" />
                      <span className="text-xs">{post.shares_count}</span>
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePostSave}
                    className={`${isPostSaved ? 'text-yellow-400' : 'text-gray-400'}`}
                  >
                    <Bookmark className={`h-4 w-4 ${isPostSaved ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex space-x-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={comment.author.avatar_url} alt={comment.author.name} />
                  <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-600 text-white text-xs">
                    {comment.author.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="bg-[#2b2d31] rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="font-medium text-sm text-white">{comment.author.name}</p>
                      <p className="text-xs text-gray-400">@{comment.author.username}</p>
                      <p className="text-xs text-gray-500">·</p>
                      <p className="text-xs text-gray-500">{formatTimeAgo(comment.created_at)}</p>
                    </div>
                    <p className="text-sm text-gray-200">{comment.text}</p>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCommentLikeLocal(comment.id)}
                      className={`h-6 px-2 text-xs ${
                        getCommentLikeState ? 
                          getCommentLikeState(comment.id, comment.likes_count).liked ? 'text-red-400' : 'text-gray-400' 
                          : comment.is_liked ? 'text-red-400' : 'text-gray-400'
                      }`}
                    >
                      <Heart className={`h-3 w-3 mr-1 ${
                        getCommentLikeState ? 
                          getCommentLikeState(comment.id, comment.likes_count).liked ? 'fill-current' : '' 
                          : comment.is_liked ? 'fill-current' : ''
                      }`} />
                      {getCommentLikeState ? 
                        getCommentLikeState(comment.id, comment.likes_count).count > 0 && getCommentLikeState(comment.id, comment.likes_count).count
                        : comment.likes_count > 0 && comment.likes_count
                      }
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReply(comment.id, comment.author.username)}
                      className="h-6 px-2 text-xs text-gray-400 hover:text-blue-400"
                    >
                      Responder
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Reply Input */}
          {replyingTo && (
            <div className="p-4 border-t border-[#404249] bg-[#2b2d31]">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-blue-400">Respondiendo a un comentario</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setReplyingTo(null)
                    setReplyText('')
                  }}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                >
                  ×
                </Button>
              </div>
              <div className="flex space-x-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={defaultUser.avatar_url} alt={defaultUser.name} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white text-xs">
                    {defaultUser.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 flex space-x-2">
                  <input
                    type="text"
                    placeholder="Escribe tu respuesta..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        submitReply()
                      }
                    }}
                    className="flex-1 bg-[#313338] border border-[#404249] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button
                    onClick={submitReply}
                    disabled={!replyText.trim()}
                    size="sm"
                    className="px-3"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Comment Input */}
          <div className="p-4 border-t border-[#404249]">
            <div className="flex space-x-3">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={defaultUser.avatar_url} alt={defaultUser.name} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white text-xs">
                  {defaultUser.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 flex space-x-2">
                <input
                  type="text"
                  placeholder="Escribe un comentario..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleAddComment()
                    }
                  }}
                  className="flex-1 bg-[#2b2d31] border border-[#404249] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || isLoading}
                  size="sm"
                  className="px-3"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}