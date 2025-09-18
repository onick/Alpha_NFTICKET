import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import CacheService from '@/lib/redis'

// PATCH - Mark all notifications as read
export async function PATCH(request: NextRequest) {
  try {
    // Get current user (mock for now)
    const currentUserId = 'galileo_user_123' // TODO: Get from auth

    // Update all unread notifications for user
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('to_user_id', currentUserId)
      .eq('read', false)

    if (error) {
      console.error('Error marking all notifications as read:', error)
      return NextResponse.json(
        { error: 'Failed to update notifications' },
        { status: 500 }
      )
    }

    // Invalidate cache
    await CacheService.del(`notifications:${currentUserId}`)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Mark all notifications read API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}