'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, Heart, MessageCircle, Share, Bookmark, Send, MoreHorizontal } from 'lucide-react'
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
  const rootComments: Comment[] = []
  const allReplies = new Map<string, Comment[]>() // Map of root comment ID to all its replies

  // First pass: separate root comments and collect all replies
  comments.forEach(comment => {
    if (!comment.parent_id) {
      // This is a root comment
      rootComments.push({ ...comment, replies: [] })
      allReplies.set(comment.id, [])
    }
  })

  // Second pass: collect ALL replies for each root comment (flatten nested structure)
  comments.forEach(comment => {
    if (comment.parent_id) {
      // Find the root comment this reply ultimately belongs to
      let rootId = comment.parent_id
      let parentComment = comments.find(c => c.id === comment.parent_id)
      
      // Traverse up to find the root comment
      while (parentComment && parentComment.parent_id) {
        rootId = parentComment.parent_id
        parentComment = comments.find(c => c.id === parentComment!.parent_id)
      }
      
      // Add this reply to the root comment's flat replies list
      if (allReplies.has(rootId)) {
        allReplies.get(rootId)!.push({ ...comment, replies: [] })
      }
    }
  })

  // Third pass: attach flattened replies to root comments
  rootComments.forEach(rootComment => {
    const replies = allReplies.get(rootComment.id) || []
    rootComment.replies = replies.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
  })

  return rootComments
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
  const [organizedComments, setOrganizedComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isPostLiked, setIsPostLiked] = useState(false)
  const [isPostSaved, setIsPostSaved] = useState(false)
  const [postLikesCount, setPostLikesCount] = useState(post.likes_count)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [visibleReplies, setVisibleReplies] = useState<{[commentId: string]: number}>({})
  
  // Ref for auto-focus on reply input
  const replyInputRef = useRef<HTMLInputElement>(null)
  
  // Socket.IO integration
  const { joinPost, leavePost, on, off, isConnected } = useSocket()

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

  useEffect(() => {
    if (isOpen) {
      // Load existing comments and mock comments
      loadComments()
    }
  }, [isOpen, post.id, existingComments])

  // Organize comments into nested structure whenever comments change
  useEffect(() => {
    const organized = organizeComments(comments)
    setOrganizedComments(organized)
  }, [comments])

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
      
      // Add the new comment to the state
      setComments(prev => {
        // Avoid duplicates
        const exists = prev.some(c => c.id === newComment.id)
        if (exists) return prev
        
        return [...prev, newComment]
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

    on('new_comment', handleNewComment)

    // Cleanup: leave room and remove listeners when modal closes
    return () => {
      console.log(`🚪 Leaving Socket.IO room for post: ${post.id}`)
      leavePost(post.id)
      off('new_comment', handleNewComment)
    }
  }, [isOpen, isConnected, post.id, joinPost, leavePost, on, off, comments, INITIAL_REPLIES_SHOWN])

  // Recursive component to render nested comments
  const CommentItem = ({ comment, isReply = false }: { comment: Comment, isReply?: boolean }) => (
    <div className={`${isReply ? 'ml-8 mt-2' : ''}`}>
      <div className="flex space-x-3">
        <Avatar className={`${isReply ? 'h-7 w-7' : 'h-8 w-8'} flex-shrink-0`}>
          <AvatarImage src={comment.author.avatar_url} alt={comment.author.name} />
          <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-600 text-white text-xs">
            {comment.author.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className={`bg-[#2b2d31] rounded-lg p-3 ${isReply ? 'bg-[#1e1f22]' : ''}`}>
            <div className="flex items-center space-x-2 mb-1">
              <span className={`font-semibold text-white ${isReply ? 'text-sm' : ''}`}>
                {comment.author.name}
              </span>
              <span className={`text-gray-400 ${isReply ? 'text-xs' : 'text-sm'}`}>
                @{comment.author.username}
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
                      <AvatarImage src={reply.author.avatar_url} alt={reply.author.name} />
                      <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-600 text-white text-xs">
                        {reply.author.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="bg-[#1e1f22] rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold text-sm text-white">
                            {reply.author.name}
                          </span>
                          <span className="text-gray-400 text-xs">
                            @{reply.author.username}
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
                          onClick={() => handleReply(reply.id, reply.author.name)}
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
                    onClick={() => showMoreReplies(comment.id, comment.replies.length)}
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
          is_liked: comment.isLiked,
          parent_id: comment.parent_id || null
        }))

        // Load like status for each comment from Redis
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
        
        // Combine with existing comments and remove duplicates
        const allComments = [...commentsWithLikeStatus, ...existingComments]
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

  const handleCommentLikeLocal = async (commentId: string) => {
    // Find the comment to get current likes
    const currentComment = comments.find(c => c.id === commentId)
    if (!currentComment) return

    const action = currentComment.is_liked ? 'unlike' : 'like'

    try {
      // 1. Optimistic update for instant feedback
      setComments(prevComments => 
        prevComments.map(comment => 
          comment.id === commentId 
            ? {
                ...comment,
                is_liked: !comment.is_liked,
                likes_count: comment.is_liked ? comment.likes_count - 1 : comment.likes_count + 1
              }
            : comment
        )
      )

      // 2. Call Redis-powered API for persistence
      const response = await fetch('/api/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetId: commentId,
          targetType: 'comment',
          action: action
        }),
      })

      if (response.ok) {
        const result = await response.json()
        
        // 3. Update with server response (Redis counter)
        setComments(prevComments => 
          prevComments.map(comment => 
            comment.id === commentId 
              ? {
                  ...comment,
                  is_liked: result.isLiked,
                  likes_count: result.newCount
                }
              : comment
          )
        )
        
        console.log(`✅ Comment ${action} successful - new count: ${result.newCount}`)
      } else {
        // 4. Revert optimistic update on error
        setComments(prevComments => 
          prevComments.map(comment => 
            comment.id === commentId 
              ? {
                  ...comment,
                  is_liked: currentComment.is_liked,
                  likes_count: currentComment.likes_count
                }
              : comment
          )
        )
        console.error('Failed to update comment like')
      }
    } catch (error) {
      // 5. Revert optimistic update on network error
      setComments(prevComments => 
        prevComments.map(comment => 
          comment.id === commentId 
            ? {
                ...comment,
                is_liked: currentComment.is_liked,
                likes_count: currentComment.likes_count
              }
            : comment
        )
      )
      console.error('Error liking comment:', error)
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
          is_liked: savedReply.isLiked,
          parent_id: replyingTo
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
            {organizedComments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
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
                    ref={replyInputRef}
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