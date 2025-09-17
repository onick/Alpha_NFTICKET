import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import CacheService from '@/lib/redis'

// GET - Obtener posts del feed
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // 1. Try to get from Redis cache first
    const cachedPosts = await CacheService.getCachedPosts(limit, offset)
    if (cachedPosts) {
      console.log('📦 Serving posts from Redis cache')
      return NextResponse.json({
        posts: cachedPosts,
        hasMore: cachedPosts.length === limit
      })
    }

    console.log('🗄️ Cache miss - fetching from database')
    // 2. If cache miss, get from Supabase
    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles(id, username, full_name, avatar_url),
        comments(
          id,
          content,
          created_at,
          likes_count,
          author:profiles(id, username, full_name, avatar_url)
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching posts:', error)
      return NextResponse.json(
        { error: 'Failed to fetch posts' },
        { status: 500 }
      )
    }

    // Transformar a formato compatible con el frontend
    const transformedPosts = posts.map(post => {
      // Transformar comentarios a formato esperado por el frontend
      const transformedComments = (post.comments || []).map((comment: any) => ({
        id: comment.id,
        user: {
          name: comment.author.full_name,
          username: comment.author.username,
          avatar: comment.author.avatar_url
        },
        content: comment.content,
        timestamp: formatTimeAgo(comment.created_at),
        likes: comment.likes_count,
        isLiked: false
      }))

      return {
        id: post.id,
        user: {
          id: post.author.id,
          name: post.author.full_name,
          username: post.author.username,
          avatar: post.author.avatar_url,
          verified: false,
          following: false
        },
        content: post.content,
        media: post.media || [],
        location: post.location,
        hashtags: post.hashtags || [],
        mentions: post.mentions || [],
        metrics: {
          likes: post.likes_count,
          comments: (post.comments || []).length,
          shares: post.shares_count,
          saves: post.saves_count
        },
        isLiked: false,
        isSaved: false,
        timestamp: formatTimeAgo(post.created_at),
        comments: transformedComments
      }
    })

    // 3. Cache the results for future requests
    await CacheService.cachePosts(transformedPosts, limit, offset)
    
    return NextResponse.json({
      posts: transformedPosts,
      hasMore: posts.length === limit
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar datos requeridos
    if (!body.text || typeof body.text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    // Try to get user by email first, fallback to creating a new profile
    let currentUser = null
    
    // First try to find user by username (assuming maria@example.com -> maria)
    const emailUsername = 'galileo_galilei' // Based on your current user
    
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .eq('username', emailUsername)
      .single()

    if (existingUser) {
      currentUser = existingUser
    } else {
      // Create a new profile for the current user
      const { data: newUser, error: createError } = await supabase
        .from('profiles')
        .insert([{
          username: emailUsername,
          full_name: 'Galileo Galilei',
          avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face'
        }])
        .select()
        .single()

      if (createError || !newUser) {
        // Fallback to first user if creation fails
        const { data: firstUser } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url')
          .limit(1)
          .single()
          
        currentUser = firstUser
      } else {
        currentUser = newUser
      }
    }

    if (!currentUser) {
      return NextResponse.json(
        { error: 'No users found' },
        { status: 400 }
      )
    }

    // Insertar post en la base de datos
    const { data: post, error } = await supabase
      .from('posts')
      .insert([
        {
          author_id: currentUser.id,
          content: body.text,
          hashtags: body.hashtags || [],
          mentions: body.mentions || [],
          media: body.media || [],
          location: body.location || null,
          type: 'text'
        }
      ])
      .select(`
        *,
        author:profiles(id, username, full_name, avatar_url)
      `)
      .single()

    if (error) {
      console.error('Error creating post:', error)
      return NextResponse.json(
        { error: 'Failed to create post' },
        { status: 500 }
      )
    }

    // Transformar respuesta
    const transformedPost = {
      id: post.id,
      user: {
        id: post.author.id,
        name: post.author.full_name,
        username: post.author.username,
        avatar: post.author.avatar_url,
        verified: false,
        following: false
      },
      content: post.content,
      media: post.media || [],
      location: post.location,
      hashtags: post.hashtags || [],
      mentions: post.mentions || [],
      metrics: {
        likes: post.likes_count,
        comments: post.comments?.length || post.comments_count || 0,
        shares: post.shares_count,
        saves: post.saves_count
      },
      isLiked: false,
      isSaved: false,
      timestamp: 'ahora mismo'
    }

    // 4. Invalidate posts cache since we have a new post
    await CacheService.invalidatePostsCache()
    console.log('🗑️ Posts cache invalidated after new post creation')

    return NextResponse.json(transformedPost, { status: 201 })

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