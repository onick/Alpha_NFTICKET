'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, Heart, MessageCircle, Share, Bookmark, Send, MoreHorizontal, Ticket } from 'lucide-react'
import { FeedPostWithAuthor } from '@nfticket/feed'
import { useAuth } from '@/lib/auth'
import { useSocket } from '@/hooks/useSocket'

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
  parent_id?: string | null
  replies?: Comment[]
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

// Helper function to organize comments into nested structure
const organizeComments = (comments: Comment[]): Comment[] => {
  console.log('🔧 organizeComments called with', comments.length, 'comments')
  
  const rootComments: Comment[] = []
  const repliesMap = new Map<string, Comment[]>()

  // First pass: separate root comments and group replies
  comments.forEach(comment => {
    if (!comment.parent_id) {
      // This is a root comment
      console.log('📝 Root comment found:', comment.id, comment.text?.substring(0, 20))
      rootComments.push({ ...comment, replies: [] })
      repliesMap.set(comment.id, [])
    } else {
      // This is a reply - add it to its parent's replies
      console.log('💬 Reply found:', comment.id, 'parent:', comment.parent_id, comment.text?.substring(0, 20))
      if (!repliesMap.has(comment.parent_id)) {
        repliesMap.set(comment.parent_id, [])
      }
      repliesMap.get(comment.parent_id)!.push({ ...comment, replies: [] })
    }
  })

  // Second pass: attach replies to root comments and sort them
  rootComments.forEach(rootComment => {
    const replies = repliesMap.get(rootComment.id) || []
    console.log(`📎 Attaching ${replies.length} replies to root comment:`, rootComment.id)
    rootComment.replies = replies.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
  })

  const result = rootComments.sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )
  
  console.log('✅ organizeComments result:', result.length, 'root comments')
  return result
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
  // Organize comments with replies - computed on every render
  const organizedComments = useMemo(() => {
    return organizeComments(comments)
  }, [comments])
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isPostLiked, setIsPostLiked] = useState(false)
  const [isPostSaved, setIsPostSaved] = useState(false)
  const [postLikesCount, setPostLikesCount] = useState(post.likes_count)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [visibleReplies, setVisibleReplies] = useState<{[commentId: string]: number}>({})
  const [typingUsers, setTypingUsers] = useState<{[userId: string]: {name: string, isTyping: boolean}}>({})
  
  // Ref for auto-focus on reply input
  const replyInputRef = useRef<HTMLInputElement>(null)
  
  // Socket.IO integration
  const { joinPost, leavePost, on, off, isConnected, startTyping, stopTyping } = useSocket()
  
  // Typing timeout ref
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Constants for reply pagination
  const INITIAL_REPLIES_SHOWN = 3
  const REPLIES_LOAD_MORE = 10

  // Helper functions
  const getVisibleRepliesCount = (commentId: string) => {
    return visibleReplies[commentId] || INITIAL_REPLIES_SHOWN
  }

  const showMoreReplies = (commentId: string, totalReplies: number) => {
    const currentVisible = getVisibleRepliesCount(commentId)
    const newVisible = Math.min(currentVisible + REPLIES_LOAD_MORE, totalReplies)
    setVisibleReplies(prev => ({
      ...prev,
      [commentId]: newVisible
    }))
  }

  // Mock user for comments
  const defaultUser = {
    id: 'demo_user',
    name: user?.name || 'Usuario Demo',
    username: user?.email?.split('@')[0] || 'usuario_demo',
    avatar_url: user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face'
  }

  const loadComments = async () => {
    try {
      console.log('🔄 loadComments called for post:', post.id)
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
          is_liked: comment.isLiked,
          parent_id: comment.parent_id || null
        }))

        const commentsWithLikeStatus = await Promise.all(
          apiComments.map(async (comment: any) => {
            try {
              const likeResponse = await fetch(`/api/likes?targetId=${comment.id}&targetType=comment`)
              if (likeResponse.ok) {
                const likeData = await likeResponse.json()
                return {
                  ...comment,
                  is_liked: likeData.isLiked,
                  likes_count: likeData.count
                }
              }
              return comment
            } catch (error) {
              console.error(`Error loading like status for comment ${comment.id}:`, error)
              return comment
            }
          })
        )
        
        const allComments = [...commentsWithLikeStatus, ...existingComments]
        console.log('🔄 All comments before deduplication:', allComments.length)
        allComments.forEach(c => console.log(`  - ${c.id}: ${c.text?.substring(0, 20)} (parent_id: ${c.parent_id})`))
        
        // Use a Map to properly handle deduplication
        const commentMap = new Map()
        
        allComments.forEach(comment => {
          const existing = commentMap.get(comment.id)
          const thisHasParent = comment.parent_id !== null && comment.parent_id !== undefined
          
          if (!existing) {
            // First occurrence of this comment ID
            commentMap.set(comment.id, comment)
            console.log(`📝 Added comment ${comment.id}: ${comment.text?.substring(0, 20)} (parent_id: ${comment.parent_id})`)
          } else {
            // Duplicate found - decide which one to keep
            const existingHasParent = existing.parent_id !== null && existing.parent_id !== undefined
            
            console.log(`🔍 Deduplication for ${comment.id}:`)
            console.log(`  - Existing has parent_id: ${existingHasParent} (${existing.parent_id})`)
            console.log(`  - New has parent_id: ${thisHasParent} (${comment.parent_id})`)
            
            // If new comment has parent_id but existing doesn't, replace with new one
            if (thisHasParent && !existingHasParent) {
              console.log(`  - Replacing with new comment (has parent_id)`)
              commentMap.set(comment.id, comment)
            } else {
              console.log(`  - Keeping existing comment`)
            }
          }
        })
        
        const uniqueComments = Array.from(commentMap.values())
        
        console.log('🔄 Unique comments after deduplication:', uniqueComments.length)
        uniqueComments.forEach(c => console.log(`  - ${c.id}: ${c.text?.substring(0, 20)} (parent_id: ${c.parent_id})`))
        
        setComments(uniqueComments)
        console.log('🔄 Comments state updated via loadComments')
      } else {
        console.error('Failed to load comments')
        setComments([])
      }
    } catch (error) {
      console.error('Error loading comments:', error)
      setComments([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim() || isLoading) return

    try {
      setIsLoading(true)
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post.id,
          content: newComment.trim(),
          author: defaultUser
        })
      })

      if (response.ok) {
        const result = await response.json()
        const newCommentData: Comment = {
          id: result.id || `temp_${Date.now()}`,
          text: newComment.trim(),
          author: defaultUser,
          created_at: new Date().toISOString(),
          likes_count: 0,
          is_liked: false,
          parent_id: null
        }

        setComments(prev => [...prev, newCommentData])
        setNewComment('')
        onNewComment?.(post.id)
        onAddComment?.(post.id, newCommentData)
      }
    } catch (error) {
      console.error('Error posting comment:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReply = (commentId: string, authorName: string) => {
    setReplyingTo(commentId)
    setReplyText(`@${authorName} `)
  }

  const handleSubmitReply = async () => {
    if (!replyText.trim() || !replyingTo || isLoading) return

    try {
      setIsLoading(true)
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post.id,
          content: replyText.trim(),
          author: defaultUser,
          parent_id: replyingTo
        })
      })

      if (response.ok) {
        const result = await response.json()
        const newReply: Comment = {
          id: result.id || `temp_${Date.now()}`,
          text: replyText.trim(),
          author: defaultUser,
          created_at: new Date().toISOString(),
          likes_count: 0,
          is_liked: false,
          parent_id: replyingTo
        }

        setComments(prev => [...prev, newReply])
        setReplyText('')
        setReplyingTo(null)
        
        onNewComment?.(post.id)
        onAddComment?.(post.id, newReply)
      }
    } catch (error) {
      console.error('Error posting reply:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCommentLikeLocal = async (commentId: string) => {
    try {
      const response = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetId: commentId,
          targetType: 'comment',
          action: 'toggle'
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        setComments(prev => prev.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              is_liked: data.liked,
              likes_count: data.count
            }
          }
          
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map(reply => 
                reply.id === commentId 
                  ? { ...reply, is_liked: data.liked, likes_count: data.count }
                  : reply
              )
            }
          }
          
          return comment
        }))
        
        onCommentLike?.(commentId, data.count)
      }
    } catch (error) {
      console.error('Error toggling comment like:', error)
    }
  }

  const handleLike = async () => {
    try {
      const response = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetId: post.id,
          targetType: 'post',
          action: 'toggle'
        })
      })

      if (response.ok) {
        const data = await response.json()
        setIsPostLiked(data.liked)
        setPostLikesCount(data.count)
        onLike?.(post.id, data.liked)
      }
    } catch (error) {
      console.error('Error toggling post like:', error)
    }
  }

  const handleTyping = (text: string, isTyping: boolean) => {
    if (isConnected && user) {
      if (isTyping) {
        startTyping(post.id, { id: user.id, name: user.name || 'Usuario' })
        
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current)
        }
        
        typingTimeoutRef.current = setTimeout(() => {
          stopTyping(post.id, { id: user.id, name: user.name || 'Usuario' })
        }, 3000)
      } else {
        stopTyping(post.id, { id: user.id, name: user.name || 'Usuario' })
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current)
        }
      }
    }
  }

  // Component for rendering individual comments
  const CommentItem = ({ comment, isReply = false }: { comment: Comment, isReply?: boolean }) => {
    // Safety check for comment.author
    if (!comment.author) {
      console.warn('Comment without author:', comment)
      return null
    }

    return (
      <div className={`${isReply ? 'ml-8 mt-2' : ''}`}>
        <div className="flex space-x-3">
          <Avatar className={`${isReply ? 'h-7 w-7' : 'h-8 w-8'} flex-shrink-0`}>
            <AvatarImage src={comment.author?.avatar_url || ''} alt={comment.author?.name || 'Usuario'} />
            <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-600 text-white text-xs">
              {comment.author?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className={`bg-[#2b2d31] rounded-lg p-3 ${isReply ? 'bg-[#1e1f22]' : ''}`}>
              <div className="flex items-center space-x-2 mb-1">
                <span className={`font-semibold text-white ${isReply ? 'text-sm' : ''}`}>
                  {comment.author?.name || 'Usuario Desconocido'}
                </span>
                <span className={`text-gray-400 ${isReply ? 'text-xs' : 'text-sm'}`}>
                  @{comment.author?.username || 'usuario'}
                </span>
                <span className={`text-gray-500 ${isReply ? 'text-xs' : 'text-sm'}`}>
                  hace 2h
                </span>
              </div>
              <p className={`text-gray-200 ${isReply ? 'text-sm' : ''}`}>
                {comment.text}
              </p>
            </div>
            
            <div className={`flex items-center space-x-4 mt-2 ${isReply ? 'text-xs' : 'text-sm'}`}>
              <button 
                onClick={() => handleCommentLikeLocal(comment.id)}
                className={`flex items-center space-x-1 transition-colors ${
                  comment.is_liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
                }`}
              >
                <Heart 
                  className={`${isReply ? 'h-3 w-3' : 'h-4 w-4'} ${comment.is_liked ? 'fill-current' : ''}`} 
                />
                <span>{comment.likes_count > 0 ? comment.likes_count : ''}</span>
              </button>
              
              <button 
                onClick={() => handleReply(comment.id, comment.author.name)}
                className="text-gray-400 hover:text-gray-200 transition-colors"
              >
                Responder
              </button>
            </div>

            {/* Render replies with pagination (Instagram-style) */}
            {!isReply && comment.replies && comment.replies.length > 0 && (
              <div className="mt-3 space-y-3">
                {/* Show visible replies */}
                {comment.replies.slice(0, getVisibleRepliesCount(comment.id)).map((reply) => (
                  <div key={reply.id} className="ml-8">
                    <div className="flex space-x-3">
                      <Avatar className="h-7 w-7 flex-shrink-0">
                        <AvatarImage src={reply.author?.avatar_url || ''} alt={reply.author?.name || 'Usuario'} />
                        <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-600 text-white text-xs">
                          {reply.author?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="bg-[#1e1f22] rounded-lg p-3">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-semibold text-sm text-white">
                              {reply.author?.name || 'Usuario Desconocido'}
                            </span>
                            <span className="text-gray-400 text-xs">
                              @{reply.author?.username || 'usuario'}
                            </span>
                            <span className="text-gray-500 text-xs">
                              hace 2h
                            </span>
                          </div>
                          <p className="text-gray-200 text-sm">
                            {reply.text}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-2 text-xs">
                          <button 
                            onClick={() => handleCommentLikeLocal(reply.id)}
                            className={`flex items-center space-x-1 transition-colors ${
                              reply.is_liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
                            }`}
                          >
                            <Heart 
                              className={`h-3 w-3 ${reply.is_liked ? 'fill-current' : ''}`} 
                            />
                            <span>{reply.likes_count > 0 ? reply.likes_count : ''}</span>
                          </button>
                          
                          <button 
                            onClick={() => handleReply(reply.id, reply.author?.name || 'Usuario')}
                            className="text-gray-400 hover:text-gray-200 transition-colors"
                          >
                            Responder
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Show "Ver X respuestas más" button if there are hidden replies */}
                {getVisibleRepliesCount(comment.id) < comment.replies.length && (
                  <div className="ml-8">
                    <button
                      onClick={() => showMoreReplies(comment.id, comment.replies!.length)}
                      className="text-gray-400 hover:text-white text-xs font-medium transition-colors"
                    >
                      Ver {Math.min(REPLIES_LOAD_MORE, comment.replies.length - getVisibleRepliesCount(comment.id))} respuestas más
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Effects
  useEffect(() => {
    if (isOpen) {
      // Load existing comments and mock comments
      loadComments()
    }
  }, [isOpen, post.id, existingComments])


  // Auto-focus reply input when replyingTo changes
  useEffect(() => {
    if (replyingTo && replyInputRef.current) {
      // Small timeout to ensure the input is rendered
      setTimeout(() => {
        replyInputRef.current?.focus()
      }, 100)
    }
  }, [replyingTo])

  // Socket.IO real-time events
  useEffect(() => {
    if (!isOpen || !isConnected) return

    // Join the post room for real-time comments
    joinPost(post.id)
    console.log(`🔗 Joined Socket.IO room for post: ${post.id}`)

    // Listen for new comments
    const handleNewComment = (newComment: Comment) => {
      console.log('📨 Received new comment via Socket.IO:', newComment)
      console.log('🔍 Comment parent_id:', newComment.parent_id)
      console.log('🔍 Comment structure:', JSON.stringify(newComment, null, 2))
      
      // Handle the new comment based on whether it's a reply or root comment
      setComments(prev => {
        // Avoid duplicates
        const exists = prev.some(c => c.id === newComment.id)
        if (exists) {
          console.log('⚠️ Duplicate comment detected, skipping:', newComment.id)
          return prev
        }
        
        // Add all comments (both root and replies) to the main array
        // The organizeComments function will handle organizing them properly
        console.log(`📝 Adding ${newComment.parent_id ? 'reply' : 'root comment'} to comments array`)
        console.log('📝 New comment being added:', JSON.stringify(newComment, null, 2))
        
        const newState = [...prev, newComment]
        console.log('📝 New comments state will have', newState.length, 'total comments')
        return newState
      })

      // Auto-expand replies if this is a new reply and user just created it
      if (newComment.parent_id) {
        const rootCommentId = newComment.parent_id
        setVisibleReplies(prev => {
          const currentVisible = prev[rootCommentId] || INITIAL_REPLIES_SHOWN
          // Find the root comment to get total replies count
          const rootComment = comments.find(c => c.id === rootCommentId)
          if (rootComment && rootComment.replies) {
            const totalReplies = rootComment.replies.length + 1 // +1 for the new reply
            // If the new reply would be hidden, expand to show it
            if (totalReplies > currentVisible) {
              return {
                ...prev,
                [rootCommentId]: totalReplies
              }
            }
          }
          return prev
        })
      }
    }

    // Listen for typing indicators
    const handleUserTyping = (data: { user: any, isTyping: boolean }) => {
      console.log('✍️ Typing update:', data)
      setTypingUsers(prev => ({
        ...prev,
        [data.user.id]: {
          name: data.user.name,
          isTyping: data.isTyping
        }
      }))
      
      // Clear typing indicator after 3 seconds if user stops
      if (!data.isTyping) {
        setTimeout(() => {
          setTypingUsers(prev => {
            const updated = { ...prev }
            delete updated[data.user.id]
            return updated
          })
        }, 3000)
      }
    }

    on('new_comment', handleNewComment)
    on('user_typing', handleUserTyping)

    // Cleanup: leave room and remove listeners when modal closes
    return () => {
      console.log(`🚪 Leaving Socket.IO room for post: ${post.id}`)
      leavePost(post.id)
      off('new_comment', handleNewComment)
      off('user_typing', handleUserTyping)
    }
  }, [isOpen, isConnected, post.id, joinPost, leavePost, on, off, comments, INITIAL_REPLIES_SHOWN])

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] bg-[#1e1f22] border-[#404249] flex flex-col">
        <CardHeader className="flex-shrink-0 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.author.avatar_url} alt={post.author.name} />
                <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-600 text-white">
                  {post.author.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-white">{post.author.name}</span>
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                    <Ticket className="h-3 w-3 mr-1" />
                    Verificado
                  </Badge>
                </div>
                <span className="text-sm text-gray-400">@{post.author.username}</span>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden flex flex-col px-6 pb-6">
          {/* Post Content */}
          <div className="flex-shrink-0 mb-4">
            <p className="text-white mb-3">{post.text}</p>
            {post.media && post.media.length > 0 && (
              <div className="relative rounded-lg overflow-hidden mb-3">
                <img 
                  src={post.media[0].url} 
                  alt="Post content" 
                  className="w-full max-h-80 object-cover"
                />
              </div>
            )}
            
            {/* Post Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[#404249]">
              <div className="flex items-center space-x-6">
                <button 
                  onClick={handleLike}
                  className={`flex items-center space-x-2 transition-colors ${
                    isPostLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isPostLiked ? 'fill-current' : ''}`} />
                  <span>{postLikesCount > 0 ? postLikesCount : ''}</span>
                </button>
                
                <button className="flex items-center space-x-2 text-gray-400 hover:text-gray-200 transition-colors">
                  <MessageCircle className="h-5 w-5" />
                  <span>{organizedComments.length}</span>
                </button>
                
                <button 
                  onClick={() => onShare?.(post.id)}
                  className="flex items-center space-x-2 text-gray-400 hover:text-gray-200 transition-colors"
                >
                  <Share className="h-5 w-5" />
                </button>
                
                <button 
                  onClick={() => {
                    setIsPostSaved(!isPostSaved)
                    onSave?.(post.id, !isPostSaved)
                  }}
                  className={`transition-colors ${
                    isPostSaved ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-400'
                  }`}
                >
                  <Bookmark className={`h-5 w-5 ${isPostSaved ? 'fill-current' : ''}`} />
                </button>
              </div>
              
              <button className="text-gray-400 hover:text-gray-200 transition-colors">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Comments Section */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              {isLoading && organizedComments.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin h-6 w-6 border-b-2 border-purple-500 rounded-full"></div>
                </div>
              ) : organizedComments.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No hay comentarios aún</p>
                  <p className="text-gray-500 text-sm">¡Sé el primero en comentar!</p>
                </div>
              ) : (
                organizedComments.map((comment) => (
                  <CommentItem key={comment.id} comment={comment} />
                ))
              )}

              {/* Typing indicators */}
              {Object.values(typingUsers).some(user => user.isTyping) && (
                <div className="flex items-center space-x-2 text-gray-400 text-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  </div>
                  <span>
                    {Object.values(typingUsers)
                      .filter(user => user.isTyping)
                      .map(user => user.name)
                      .join(', ')} está escribiendo...
                  </span>
                </div>
              )}
            </div>

            {/* Reply Interface */}
            {replyingTo && (
              <div className="flex-shrink-0 bg-[#2b2d31] rounded-lg p-3 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">
                    Respondiendo a comentario
                  </span>
                  <button 
                    onClick={() => {
                      setReplyingTo(null)
                      setReplyText('')
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="flex space-x-2">
                  <input
                    ref={replyInputRef}
                    value={replyText}
                    onChange={(e) => {
                      setReplyText(e.target.value)
                      handleTyping(e.target.value, e.target.value.length > 0)
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSubmitReply()
                      }
                    }}
                    placeholder="Escribe tu respuesta..."
                    className="flex-1 bg-[#404249] border-[#5c5f66] text-white placeholder:text-gray-400 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <Button 
                    onClick={handleSubmitReply}
                    disabled={!replyText.trim() || isLoading}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-4"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Add Comment */}
            <div className="flex-shrink-0 flex items-center space-x-3 pt-3 border-t border-[#404249]">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={defaultUser.avatar_url} alt={defaultUser.name} />
                <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-600 text-white text-sm">
                  {defaultUser.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 flex space-x-2">
                <input
                  value={newComment}
                  onChange={(e) => {
                    setNewComment(e.target.value)
                    handleTyping(e.target.value, e.target.value.length > 0)
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmitComment()
                    }
                  }}
                  placeholder="Escribe un comentario..."
                  className="flex-1 bg-[#404249] border-[#5c5f66] text-white placeholder:text-gray-400 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <Button 
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || isLoading}
                  className="bg-purple-500 hover:bg-purple-600 text-white"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}