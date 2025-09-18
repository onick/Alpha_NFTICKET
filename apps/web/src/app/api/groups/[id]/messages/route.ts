import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import CacheService from '@/lib/redis'
import { getIO } from '@/lib/socket'

// GET - Get group messages
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const groupId = params.id
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Try cache first
    const cacheKey = `group_messages:${groupId}:${offset}:${limit}`
    const cachedMessages = await CacheService.get(cacheKey)
    
    if (cachedMessages && offset === 0) {
      console.log('📦 Serving group messages from Redis cache')
      return NextResponse.json(cachedMessages)
    }

    console.log('🗄️ Cache miss - fetching messages from database')

    // Get messages from Supabase
    const { data: messages, error } = await supabase
      .from('group_messages')
      .select(`
        *,
        user:profiles!group_messages_user_id_fkey(id, username, full_name, avatar_url)
      `)
      .eq('group_id', groupId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching group messages:', error)
      // Return mock messages as fallback
      return NextResponse.json({
        messages: getMockMessages(groupId),
        has_more: false
      })
    }

    // Transform messages
    const transformedMessages = messages.map(message => ({
      id: message.id,
      group_id: message.group_id,
      user_id: message.user_id,
      user_name: message.user?.full_name || message.user?.username || 'Usuario',
      user_username: message.user?.username || 'user',
      user_avatar: message.user?.avatar_url,
      content: message.content,
      type: message.type,
      created_at: message.created_at,
      is_deleted: message.is_deleted
    }))

    const result = {
      messages: transformedMessages,
      has_more: transformedMessages.length === limit
    }

    // Cache for 2 minutes (shorter cache for messages)
    if (offset === 0) {
      await CacheService.set(cacheKey, result, 120)
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Group messages API Error:', error)
    return NextResponse.json({
      messages: getMockMessages(params.id),
      has_more: false
    })
  }
}

// POST - Send new message
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const groupId = params.id
    const body = await request.json()
    const { content, type } = body

    // Get current user (mock for now)
    const currentUserId = 'galileo_user_123' // TODO: Get from auth
    const currentUserName = 'Galileo Galilei' // TODO: Get from auth

    // Validate required fields
    if (!content || !type) {
      return NextResponse.json(
        { error: 'Content and type are required' },
        { status: 400 }
      )
    }

    // Check if user is a member of the group
    const { data: membership } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', currentUserId)
      .single()

    if (!membership) {
      return NextResponse.json(
        { error: 'You are not a member of this group' },
        { status: 403 }
      )
    }

    // Insert message
    const { data: message, error } = await supabase
      .from('group_messages')
      .insert([{
        group_id: groupId,
        user_id: currentUserId,
        content,
        type,
        is_deleted: false
      }])
      .select(`
        *,
        user:profiles!group_messages_user_id_fkey(id, username, full_name, avatar_url)
      `)
      .single()

    if (error) {
      console.error('Error creating message:', error)
      
      // Create mock message for demonstration
      const mockMessage = {
        id: `mock_${Date.now()}`,
        group_id: groupId,
        user_id: currentUserId,
        user_name: currentUserName,
        user_username: 'galileo',
        user_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
        content,
        type,
        created_at: new Date().toISOString(),
        is_deleted: false
      }
      
      return NextResponse.json(mockMessage, { status: 201 })
    }

    // Transform message
    const transformedMessage = {
      id: message.id,
      group_id: message.group_id,
      user_id: message.user_id,
      user_name: message.user?.full_name || currentUserName,
      user_username: message.user?.username || 'galileo',
      user_avatar: message.user?.avatar_url,
      content: message.content,
      type: message.type,
      created_at: message.created_at,
      is_deleted: message.is_deleted
    }

    // Invalidate message cache
    const cachePattern = `group_messages:${groupId}:*`
    await CacheService.delPattern(cachePattern)

    // Send real-time notification via Socket.IO
    try {
      const io = getIO()
      if (io) {
        // Send to group chat room
        io.to(`group:${groupId}`).emit('group_message', transformedMessage)
        
        // Send notification to group members (except sender)
        const { data: members } = await supabase
          .from('group_members')
          .select('user_id')
          .eq('group_id', groupId)
          .neq('user_id', currentUserId)

        if (members) {
          members.forEach(member => {
            io.to(`user:${member.user_id}`).emit('new_notification', {
              id: `message_${Date.now()}`,
              type: 'group_message',
              title: 'Nuevo mensaje en grupo',
              message: `${currentUserName}: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
              user: {
                id: currentUserId,
                name: currentUserName,
                username: 'galileo',
                avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
              },
              group: {
                id: groupId,
                name: 'Group Chat' // TODO: Get actual group name
              },
              read: false,
              created_at: new Date().toISOString(),
              action_url: `/groups/${groupId}/chat`
            })
          })
        }
        
        console.log(`💬 Message sent to group ${groupId}`)
      }
    } catch (socketError) {
      console.error('Socket.IO notification error (non-critical):', socketError)
    }

    return NextResponse.json(transformedMessage, { status: 201 })

  } catch (error) {
    console.error('Send message API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Mock messages for fallback
function getMockMessages(groupId: string) {
  return [
    {
      id: 'mock_1',
      group_id: groupId,
      user_id: 'user1',
      user_name: 'Carlos Rodríguez',
      user_username: 'carlos',
      user_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      content: '¡Hola a todos! Ya tengo mi ticket VIP confirmado. ¿Alguien más viene desde la zona norte?',
      type: 'text',
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      is_deleted: false
    },
    {
      id: 'mock_2',
      group_id: groupId,
      user_id: 'user2',
      user_name: 'Ana Martínez',
      user_username: 'ana',
      user_avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b1e5?w=40&h=40&fit=crop&crop=face',
      content: 'Yo también! Podemos compartir el Uber. ¿A qué hora nos encontramos?',
      type: 'text',
      created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      is_deleted: false
    },
    {
      id: 'mock_3',
      group_id: groupId,
      user_id: 'system',
      user_name: 'Sistema',
      user_username: 'system',
      content: 'Luis Fernández se unió al grupo',
      type: 'system',
      created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      is_deleted: false
    },
    {
      id: 'mock_4',
      group_id: groupId,
      user_id: 'user3',
      user_name: 'Luis Fernández',
      user_username: 'luis',
      user_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
      content: '¡Perfecto! Confirmo que tengo mi ticket. Nos vemos en Unicentro a las 7:30pm',
      type: 'text',
      created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      is_deleted: false
    }
  ]
}