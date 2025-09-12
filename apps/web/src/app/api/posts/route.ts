import { NextRequest, NextResponse } from 'next/server'
import { createServerFeedService } from '@nfticket/api'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
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
    
    // Validate input
    if (!body.text || typeof body.text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }
    
    if (!body.visibility || !['public', 'followers', 'private'].includes(body.visibility)) {
      return NextResponse.json(
        { error: 'Valid visibility is required (public, followers, private)' },
        { status: 400 }
      )
    }
    
    const post = await feedService.createUserPost(userId, {
      text: body.text,
      visibility: body.visibility,
      hashtags: body.hashtags || [],
      mentions: body.mentions || [],
      location: body.location,
      media_urls: body.media_urls || []
    })
    
    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('Create post API error:', error)
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}