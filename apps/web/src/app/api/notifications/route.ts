import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import CacheService from '@/lib/redis'
import { getIO } from '@/lib/socket'

// GET - Get user notifications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    // Get current user (mock for now)
    const currentUserId = 'galileo_user_123' // TODO: Get from auth

    // Try to get from Redis cache first
    const cacheKey = `notifications:${currentUserId}`
    const cachedNotifications = await CacheService.get(cacheKey)
    
    if (cachedNotifications) {
      console.log('📦 Serving notifications from Redis cache')
      return NextResponse.json(cachedNotifications)
    }

    console.log('🗄️ Cache miss - fetching notifications from database')
    
    // Get from Supabase
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select(`
        *,
        user:profiles!notifications_from_user_id_fkey(id, username, full_name, avatar_url),
        event:events(id, name),
        group:event_groups(id, name)
      `)
      .eq('to_user_id', currentUserId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching notifications:', error)
      // Return mock notifications as fallback
      return NextResponse.json({
        notifications: getMockNotifications(),
        unread_count: 3
      })
    }

    // Transform notifications
    const transformedNotifications = notifications.map(notification => ({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      user: notification.user ? {
        id: notification.user.id,
        name: notification.user.full_name,
        username: notification.user.username,
        avatar_url: notification.user.avatar_url
      } : null,
      event: notification.event,
      group: notification.group,
      read: notification.read,
      created_at: notification.created_at,
      action_url: notification.action_url
    }))

    // Count unread notifications
    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('to_user_id', currentUserId)
      .eq('read', false)

    const result = {
      notifications: transformedNotifications,
      unread_count: unreadCount || 0
    }

    // Cache for 5 minutes
    await CacheService.set(cacheKey, result, 300)

    return NextResponse.json(result)

  } catch (error) {
    console.error('Notifications API Error:', error)
    return NextResponse.json({
      notifications: getMockNotifications(),
      unread_count: 3
    })
  }
}

// POST - Create new notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      to_user_id, 
      from_user_id, 
      type, 
      title, 
      message, 
      event_id, 
      group_id, 
      action_url 
    } = body

    // Validate required fields
    if (!to_user_id || !type || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create notification in database
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert([{
        to_user_id,
        from_user_id,
        type,
        title,
        message,
        event_id,
        group_id,
        action_url,
        read: false
      }])
      .select(`
        *,
        user:profiles!notifications_from_user_id_fkey(id, username, full_name, avatar_url),
        event:events(id, name),
        group:event_groups(id, name)
      `)
      .single()

    if (error) {
      console.error('Error creating notification:', error)
      return NextResponse.json(
        { error: 'Failed to create notification' },
        { status: 500 }
      )
    }

    // Transform notification
    const transformedNotification = {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      user: notification.user ? {
        id: notification.user.id,
        name: notification.user.full_name,
        username: notification.user.username,
        avatar_url: notification.user.avatar_url
      } : null,
      event: notification.event,
      group: notification.group,
      read: notification.read,
      created_at: notification.created_at,
      action_url: notification.action_url
    }

    // Invalidate cache
    await CacheService.del(`notifications:${to_user_id}`)

    // Send real-time notification via Socket.IO
    try {
      const io = getIO()
      if (io) {
        // Send to specific user room
        io.to(`user:${to_user_id}`).emit('new_notification', transformedNotification)
        console.log(`🔔 Notification sent to user ${to_user_id}: ${title}`)
      }
    } catch (socketError) {
      console.error('Socket.IO notification error (non-critical):', socketError)
    }

    return NextResponse.json(transformedNotification, { status: 201 })

  } catch (error) {
    console.error('Create notification API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Mock notifications for fallback
function getMockNotifications() {
  return [
    {
      id: '1',
      type: 'comment',
      title: 'Nuevo comentario',
      message: 'María comentó en tu post sobre el evento de Bad Bunny',
      user: {
        id: 'user1',
        name: 'María González',
        username: 'mariag',
        avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b5ab?w=32&h=32&fit=crop&crop=face'
      },
      read: false,
      created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      action_url: '/feed'
    },
    {
      id: '2',
      type: 'group',
      title: 'Nuevo grupo de evento',
      message: 'Te agregaron al grupo "Bad Bunny VIP Experience"',
      event: {
        id: 'event1',
        name: 'Bad Bunny - World\'s Hottest Tour'
      },
      read: false,
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      action_url: '/groups/event1'
    },
    {
      id: '3',
      type: 'ticket',
      title: 'Ticket verificado',
      message: 'Tu ticket para Bad Bunny ha sido verificado por el organizador',
      read: true,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      action_url: '/tickets'
    }
  ]
}