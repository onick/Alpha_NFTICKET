import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import CacheService from '@/lib/redis'
import { publishComment } from '@/lib/socket'

// GET - Obtener comentarios de un post
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId')
    
    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      )
    }

    // 1. Try to get from Redis cache first
    const cachedComments = await CacheService.getCachedComments(postId)
    if (cachedComments) {
      console.log('📦 Serving comments from Redis cache')
      return NextResponse.json({
        comments: cachedComments
      })
    }

    console.log('🗃️ Cache miss - fetching comments from database')
    // 2. If cache miss, get from Supabase
    const { data: comments, error } = await supabase
      .from('comments')
      .select(`
        *,
        author:profiles(id, username, full_name, avatar_url)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching comments:', error)
      return NextResponse.json(
        { error: 'Failed to fetch comments' },
        { status: 500 }
      )
    }

    // Transformar a formato compatible con el frontend
    const transformedComments = comments.map(comment => ({
      id: comment.id,
      parent_id: comment.parent_id,
      user: {
        id: comment.author.id,
        name: comment.author.full_name,
        username: comment.author.username,
        avatar: comment.author.avatar_url
      },
      content: comment.content,
      timestamp: formatTimeAgo(comment.created_at),
      likes: comment.likes_count,
      isLiked: false
    }))

    // 3. Cache the comments for future requests
    await CacheService.cacheComments(postId, transformedComments)

    return NextResponse.json({
      comments: transformedComments
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo comentario
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar datos requeridos
    if (!body.postId || !body.content || typeof body.content !== 'string') {
      return NextResponse.json(
        { error: 'Post ID and content are required' },
        { status: 400 }
      )
    }

    // Obtener el usuario actual (Galileo Galilei)
    const { data: currentUser } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .eq('username', 'galileo_galilei')
      .single()

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 400 }
      )
    }

    // Insertar comentario en la base de datos
    const { data: comment, error } = await supabase
      .from('comments')
      .insert([
        {
          post_id: body.postId,
          author_id: currentUser.id,
          content: body.content,
          parent_id: body.parentId || null
        }
      ])
      .select(`
        *,
        author:profiles(id, username, full_name, avatar_url)
      `)
      .single()

    if (error) {
      console.error('Error creating comment:', error)
      return NextResponse.json(
        { error: 'Failed to create comment' },
        { status: 500 }
      )
    }

    // Transformar respuesta
    const transformedComment = {
      id: comment.id,
      user: {
        id: comment.author.id,
        name: comment.author.full_name,
        username: comment.author.username,
        avatar: comment.author.avatar_url
      },
      content: comment.content,
      timestamp: 'ahora mismo',
      likes: comment.likes_count,
      isLiked: false
    }

    // 4. Invalidate comments cache and posts cache 
    await CacheService.invalidateCommentsCache(body.postId)
    await CacheService.invalidatePostsCache() // Posts cache includes comment counts
    console.log('🗑️ Comments and posts cache invalidated after new comment')

    // 5. Publish real-time comment event (non-blocking)
    try {
      await publishComment(body.postId, transformedComment)
      console.log('🚀 Real-time comment event published')
    } catch (socketError) {
      console.error('Socket.IO publish error (non-critical):', socketError)
      // Don't fail the request if Socket.IO has issues
    }

    return NextResponse.json(transformedComment, { status: 201 })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Función auxiliar para formatear tiempo
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) return 'ahora mismo'
  if (diffInMinutes < 60) return `hace ${diffInMinutes}m`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `hace ${diffInHours}h`
  
  const diffInDays = Math.floor(diffInHours / 24)
  return `hace ${diffInDays}d`
}