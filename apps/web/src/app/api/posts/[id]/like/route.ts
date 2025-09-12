import { NextRequest, NextResponse } from 'next/server'
import { createServerFeedService } from '@nfticket/api'
import { cookies } from 'next/headers'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id
    
    // Get user ID from auth
    const userId = 'mock-user-id' // TODO: Get from actual auth
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const cookieStore = cookies()
    const feedService = createServerFeedService(cookieStore)
    
    const success = await feedService.likePost(userId, postId)
    
    return NextResponse.json({ liked: success })
  } catch (error) {
    console.error('Like post API error:', error)
    return NextResponse.json(
      { error: 'Failed to like post' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id
    
    // Get user ID from auth
    const userId = 'mock-user-id' // TODO: Get from actual auth
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const cookieStore = cookies()
    const feedService = createServerFeedService(cookieStore)
    
    const success = await feedService.unlikePost(userId, postId)
    
    return NextResponse.json({ unliked: success })
  } catch (error) {
    console.error('Unlike post API error:', error)
    return NextResponse.json(
      { error: 'Failed to unlike post' },
      { status: 500 }
    )
  }
}