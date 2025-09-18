import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import CacheService from '@/lib/redis'

// PATCH - Mark notification as read
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const notificationId = params.id
    
    // Get current user (mock for now)
    const currentUserId = 'galileo_user_123' // TODO: Get from auth

    // Update notification in database
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .eq('to_user_id', currentUserId) // Security: only update own notifications

    if (error) {
      console.error('Error marking notification as read:', error)
      return NextResponse.json(
        { error: 'Failed to update notification' },
        { status: 500 }
      )
    }

    // Invalidate cache
    await CacheService.del(`notifications:${currentUserId}`)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Mark notification read API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}