import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import CacheService from '@/lib/redis'

// POST - Toggle like on post or comment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { targetId, targetType, action } = body // action: 'like' | 'unlike'

    if (!targetId || !targetType || !action) {
      return NextResponse.json(
        { error: 'targetId, targetType, and action are required' },
        { status: 400 }
      )
    }

    if (!['post', 'comment'].includes(targetType)) {
      return NextResponse.json(
        { error: 'targetType must be "post" or "comment"' },
        { status: 400 }
      )
    }

    if (!['like', 'unlike'].includes(action)) {
      return NextResponse.json(
        { error: 'action must be "like" or "unlike"' },
        { status: 400 }
      )
    }

    // Get current user (mock for now - same as posts API)
    const currentUserId = 'galileo_user_123' // TODO: Get from auth

    // Redis counter keys
    const counterKey = `likes:${targetType}:${targetId}`
    const userLikeKey = `user_likes:${currentUserId}:${targetType}:${targetId}`

    if (action === 'like') {
      // Check if user already liked
      const alreadyLiked = await CacheService.get(userLikeKey)
      if (alreadyLiked) {
        return NextResponse.json(
          { error: 'Already liked' },
          { status: 400 }
        )
      }

      // 1. Update Redis counters first (for instant feedback)
      const newCount = await CacheService.incrementCounter(counterKey, 1)
      await CacheService.set(userLikeKey, true, 3600) // 1 hour TTL

      // 2. Update database in background
      try {
        // Insert like record
        await supabase
          .from('likes')
          .insert([{
            user_id: currentUserId,
            target_type: targetType,
            target_id: targetId
          }])

        // Update counter in database (triggers will handle this automatically)
        console.log(`✅ Like recorded in database for ${targetType} ${targetId}`)
      } catch (dbError) {
        console.error('Database error for like:', dbError)
        // Don't fail the request - Redis counter is the source of truth for real-time
      }

      // 3. Invalidate related caches
      if (targetType === 'post') {
        await CacheService.invalidatePostsCache()
      } else {
        // Find which post this comment belongs to and invalidate
        const { data: comment } = await supabase
          .from('comments')
          .select('post_id')
          .eq('id', targetId)
          .single()
        
        if (comment) {
          await CacheService.invalidateCommentsCache(comment.post_id)
        }
      }

      return NextResponse.json({
        success: true,
        action: 'liked',
        newCount,
        isLiked: true
      })

    } else { // unlike
      // Check if user actually liked it
      const wasLiked = await CacheService.get(userLikeKey)
      if (!wasLiked) {
        return NextResponse.json(
          { error: 'Not liked yet' },
          { status: 400 }
        )
      }

      // 1. Update Redis counters first
      const newCount = await CacheService.incrementCounter(counterKey, -1)
      await CacheService.del(userLikeKey)

      // 2. Update database in background
      try {
        await supabase
          .from('likes')
          .delete()
          .eq('user_id', currentUserId)
          .eq('target_type', targetType)
          .eq('target_id', targetId)

        console.log(`✅ Unlike recorded in database for ${targetType} ${targetId}`)
      } catch (dbError) {
        console.error('Database error for unlike:', dbError)
      }

      // 3. Invalidate related caches
      if (targetType === 'post') {
        await CacheService.invalidatePostsCache()
      } else {
        const { data: comment } = await supabase
          .from('comments')
          .select('post_id')
          .eq('id', targetId)
          .single()
        
        if (comment) {
          await CacheService.invalidateCommentsCache(comment.post_id)
        }
      }

      return NextResponse.json({
        success: true,
        action: 'unliked',
        newCount: Math.max(0, newCount), // Ensure count doesn't go negative
        isLiked: false
      })
    }

  } catch (error) {
    console.error('Likes API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET - Get like status and count
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const targetId = searchParams.get('targetId')
    const targetType = searchParams.get('targetType')
    const userId = searchParams.get('userId') || 'galileo_user_123'

    if (!targetId || !targetType) {
      return NextResponse.json(
        { error: 'targetId and targetType are required' },
        { status: 400 }
      )
    }

    // Get from Redis first
    const counterKey = `likes:${targetType}:${targetId}`
    const userLikeKey = `user_likes:${userId}:${targetType}:${targetId}`

    const [count, isLiked] = await Promise.all([
      CacheService.getCounter(counterKey),
      CacheService.get(userLikeKey)
    ])

    // If no Redis data, fallback to database
    if (count === 0) {
      const table = targetType === 'post' ? 'posts' : 'comments'
      const { data } = await supabase
        .from(table)
        .select('likes_count')
        .eq('id', targetId)
        .single()

      const dbCount = data?.likes_count || 0
      
      // Cache the database value
      await CacheService.set(counterKey, dbCount, 60)

      return NextResponse.json({
        count: dbCount,
        isLiked: !!isLiked
      })
    }

    return NextResponse.json({
      count,
      isLiked: !!isLiked
    })

  } catch (error) {
    console.error('Get likes API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}