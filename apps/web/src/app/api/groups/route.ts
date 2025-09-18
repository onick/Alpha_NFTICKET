import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import CacheService from '@/lib/redis'
import { getIO } from '@/lib/socket'

// GET - Get event groups
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const event_id = searchParams.get('event_id')
    const user_id = searchParams.get('user_id') || 'galileo_user_123' // TODO: Get from auth

    if (!event_id) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      )
    }

    // Try cache first
    const cacheKey = `groups:event:${event_id}`
    const cachedGroups = await CacheService.get(cacheKey)
    
    if (cachedGroups) {
      console.log('📦 Serving groups from Redis cache')
      return NextResponse.json(cachedGroups)
    }

    console.log('🗄️ Cache miss - fetching groups from database')

    // Get from Supabase
    const { data: groups, error } = await supabase
      .from('event_groups')
      .select(`
        *,
        organizer:profiles!event_groups_organizer_id_fkey(id, username, full_name, avatar_url),
        event:events(id, name, date, location),
        members:group_members(
          *,
          user:profiles!group_members_user_id_fkey(id, username, full_name, avatar_url)
        )
      `)
      .eq('event_id', event_id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching groups:', error)
      // Return mock groups as fallback
      return NextResponse.json({
        groups: getMockGroups(event_id),
        user_groups: []
      })
    }

    // Transform groups
    const transformedGroups = groups.map(group => ({
      id: group.id,
      name: group.name,
      description: group.description,
      event_id: group.event_id,
      event_name: group.event?.name,
      organizer_id: group.organizer_id,
      organizer_name: group.organizer?.full_name || group.organizer?.username,
      max_members: group.max_members,
      current_members: group.members?.length || 0,
      meeting_point: group.meeting_point,
      meeting_time: group.meeting_time,
      required_ticket_verified: group.required_ticket_verified,
      is_private: group.is_private,
      created_at: group.created_at,
      members: group.members?.map((member: any) => ({
        id: member.id,
        user_id: member.user_id,
        name: member.user?.full_name || member.user?.username,
        username: member.user?.username,
        avatar_url: member.user?.avatar_url,
        ticket_verified: member.ticket_verified,
        joined_at: member.joined_at,
        role: member.role
      })) || []
    }))

    // Get user's groups
    const { data: userGroups } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', user_id)

    const result = {
      groups: transformedGroups,
      user_groups: userGroups?.map(ug => ug.group_id) || []
    }

    // Cache for 5 minutes
    await CacheService.set(cacheKey, result, 300)

    return NextResponse.json(result)

  } catch (error) {
    console.error('Groups API Error:', error)
    return NextResponse.json({
      groups: getMockGroups('default'),
      user_groups: []
    })
  }
}

// POST - Create new group
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      description,
      event_id,
      event_name,
      max_members,
      meeting_point,
      meeting_time,
      required_ticket_verified,
      is_private
    } = body

    // Get current user (mock for now)
    const currentUserId = 'galileo_user_123' // TODO: Get from auth
    const currentUserName = 'Galileo Galilei' // TODO: Get from auth

    // Validate required fields
    if (!name || !event_id) {
      return NextResponse.json(
        { error: 'Name and event_id are required' },
        { status: 400 }
      )
    }

    // Create group in database
    const { data: group, error } = await supabase
      .from('event_groups')
      .insert([{
        name,
        description,
        event_id,
        organizer_id: currentUserId,
        max_members: max_members || 10,
        meeting_point,
        meeting_time,
        required_ticket_verified: required_ticket_verified || false,
        is_private: is_private || false,
        is_deleted: false
      }])
      .select(`
        *,
        organizer:profiles!event_groups_organizer_id_fkey(id, username, full_name, avatar_url),
        event:events(id, name, date, location)
      `)
      .single()

    if (error) {
      console.error('Error creating group:', error)
      
      // Create mock group for demonstration
      const mockGroup = {
        id: `mock_${Date.now()}`,
        name,
        description,
        event_id,
        event_name,
        organizer_id: currentUserId,
        organizer_name: currentUserName,
        max_members: max_members || 10,
        current_members: 1,
        meeting_point,
        meeting_time,
        required_ticket_verified: required_ticket_verified || false,
        is_private: is_private || false,
        created_at: new Date().toISOString(),
        members: [{
          id: 'mock_member_1',
          user_id: currentUserId,
          name: currentUserName,
          username: 'galileo',
          avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
          ticket_verified: true,
          joined_at: new Date().toISOString(),
          role: 'organizer'
        }]
      }
      
      return NextResponse.json(mockGroup, { status: 201 })
    }

    // Add organizer as first member
    await supabase
      .from('group_members')
      .insert([{
        group_id: group.id,
        user_id: currentUserId,
        role: 'organizer',
        ticket_verified: true // Organizer is assumed to have verified ticket
      }])

    // Transform group
    const transformedGroup = {
      id: group.id,
      name: group.name,
      description: group.description,
      event_id: group.event_id,
      event_name: group.event?.name || event_name,
      organizer_id: group.organizer_id,
      organizer_name: group.organizer?.full_name || currentUserName,
      max_members: group.max_members,
      current_members: 1,
      meeting_point: group.meeting_point,
      meeting_time: group.meeting_time,
      required_ticket_verified: group.required_ticket_verified,
      is_private: group.is_private,
      created_at: group.created_at,
      members: [{
        id: 'new_member',
        user_id: currentUserId,
        name: currentUserName,
        username: 'galileo',
        avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
        ticket_verified: true,
        joined_at: new Date().toISOString(),
        role: 'organizer'
      }]
    }

    // Invalidate cache
    await CacheService.del(`groups:event:${event_id}`)

    // Send real-time notification via Socket.IO
    try {
      const io = getIO()
      if (io) {
        io.emit('group_created', transformedGroup)
        console.log(`🎯 Group created and broadcasted: ${group.name}`)
      }
    } catch (socketError) {
      console.error('Socket.IO broadcast error (non-critical):', socketError)
    }

    return NextResponse.json(transformedGroup, { status: 201 })

  } catch (error) {
    console.error('Create group API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Mock groups for fallback
function getMockGroups(event_id: string) {
  return [
    {
      id: 'mock_1',
      name: 'VIP Experience Group',
      description: 'Grupo para quienes tienen tickets VIP. Nos encontramos 2 horas antes para cenar juntos.',
      event_id,
      event_name: 'Bad Bunny - World\'s Hottest Tour',
      organizer_id: 'user1',
      organizer_name: 'Carlos Rodríguez',
      max_members: 8,
      current_members: 5,
      meeting_point: 'Restaurante La Estación, Calle 85 #15-20',
      meeting_time: '18:00',
      required_ticket_verified: true,
      is_private: false,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      members: []
    },
    {
      id: 'mock_2',
      name: 'Transporte Compartido Zona Norte',
      description: 'Compartimos Uber/taxi desde la zona norte. Dividimos gastos entre todos.',
      event_id,
      event_name: 'Bad Bunny - World\'s Hottest Tour',
      organizer_id: 'user2',
      organizer_name: 'Ana Martínez',
      max_members: 4,
      current_members: 3,
      meeting_point: 'Centro Comercial Unicentro',
      meeting_time: '19:30',
      required_ticket_verified: true,
      is_private: false,
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      members: []
    },
    {
      id: 'mock_3',
      name: 'Fans de Reggaeton Clásico',
      description: 'Para verdaderos conocedores del género. Vamos a cantar todas las canciones viejas.',
      event_id,
      event_name: 'Bad Bunny - World\'s Hottest Tour',
      organizer_id: 'user3',
      organizer_name: 'Luis Fernández',
      max_members: 15,
      current_members: 8,
      meeting_point: 'Entrada principal del estadio',
      meeting_time: '20:00',
      required_ticket_verified: false,
      is_private: false,
      created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      members: []
    }
  ]
}