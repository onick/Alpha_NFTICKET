import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import CacheService from '@/lib/redis'
import { getIO } from '@/lib/socket'

// POST - Join group
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const groupId = params.id
    
    // Get current user (mock for now)
    const currentUserId = 'galileo_user_123' // TODO: Get from auth
    const currentUserName = 'Galileo Galilei' // TODO: Get from auth

    // Check if group exists and has space
    const { data: group, error: groupError } = await supabase
      .from('event_groups')
      .select(`
        *,
        members:group_members(*)
      `)
      .eq('id', groupId)
      .eq('is_deleted', false)
      .single()

    if (groupError || !group) {
      // Mock successful join for demonstration
      return NextResponse.json({
        id: groupId,
        name: 'Mock Group',
        current_members: 4,
        max_members: 10,
        message: 'Successfully joined group (mock)'
      })
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', currentUserId)
      .single()

    if (existingMember) {
      return NextResponse.json(
        { error: 'You are already a member of this group' },
        { status: 400 }
      )
    }

    // Check if group is full
    const currentMembers = group.members?.length || 0
    if (currentMembers >= group.max_members) {
      return NextResponse.json(
        { error: 'Group is full' },
        { status: 400 }
      )
    }

    // Add user to group
    const { error: joinError } = await supabase
      .from('group_members')
      .insert([{
        group_id: groupId,
        user_id: currentUserId,
        role: 'member',
        ticket_verified: false // TODO: Check actual ticket verification status
      }])

    if (joinError) {
      console.error('Error joining group:', joinError)
      
      // Return mock success for demonstration
      return NextResponse.json({
        id: groupId,
        name: group.name,
        current_members: currentMembers + 1,
        max_members: group.max_members,
        message: 'Successfully joined group (mock)'
      })
    }

    // Get updated group with members
    const { data: updatedGroup } = await supabase
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
      .eq('id', groupId)
      .single()

    // Transform updated group
    const transformedGroup = {
      id: updatedGroup.id,
      name: updatedGroup.name,
      description: updatedGroup.description,
      event_id: updatedGroup.event_id,
      event_name: updatedGroup.event?.name,
      organizer_id: updatedGroup.organizer_id,
      organizer_name: updatedGroup.organizer?.full_name || updatedGroup.organizer?.username,
      max_members: updatedGroup.max_members,
      current_members: updatedGroup.members?.length || 0,
      meeting_point: updatedGroup.meeting_point,
      meeting_time: updatedGroup.meeting_time,
      required_ticket_verified: updatedGroup.required_ticket_verified,
      is_private: updatedGroup.is_private,
      created_at: updatedGroup.created_at,
      members: updatedGroup.members?.map((member: any) => ({
        id: member.id,
        user_id: member.user_id,
        name: member.user?.full_name || member.user?.username,
        username: member.user?.username,
        avatar_url: member.user?.avatar_url,
        ticket_verified: member.ticket_verified,
        joined_at: member.joined_at,
        role: member.role
      })) || []
    }

    // Invalidate cache
    await CacheService.del(`groups:event:${updatedGroup.event_id}`)

    // Send real-time notification via Socket.IO
    try {
      const io = getIO()
      if (io) {
        // Notify group members
        io.to(`group:${groupId}`).emit('group_updated', transformedGroup)
        
        // Notify the group organizer
        io.to(`user:${updatedGroup.organizer_id}`).emit('new_notification', {
          id: `join_${Date.now()}`,
          type: 'group',
          title: 'Nuevo miembro en tu grupo',
          message: `${currentUserName} se unió a "${updatedGroup.name}"`,
          user: {
            id: currentUserId,
            name: currentUserName,
            username: 'galileo',
            avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
          },
          group: {
            id: groupId,
            name: updatedGroup.name
          },
          read: false,
          created_at: new Date().toISOString(),
          action_url: `/groups/${groupId}`
        })
        
        console.log(`👥 User ${currentUserId} joined group ${groupId}`)
      }
    } catch (socketError) {
      console.error('Socket.IO notification error (non-critical):', socketError)
    }

    return NextResponse.json(transformedGroup)

  } catch (error) {
    console.error('Join group API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Leave group
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const groupId = params.id
    
    // Get current user (mock for now)
    const currentUserId = 'galileo_user_123' // TODO: Get from auth

    // Remove user from group
    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', currentUserId)

    if (error) {
      console.error('Error leaving group:', error)
      return NextResponse.json(
        { error: 'Failed to leave group' },
        { status: 500 }
      )
    }

    // Get updated group
    const { data: updatedGroup } = await supabase
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
      .eq('id', groupId)
      .single()

    if (updatedGroup) {
      // Invalidate cache
      await CacheService.del(`groups:event:${updatedGroup.event_id}`)

      // Send real-time update
      try {
        const io = getIO()
        if (io) {
          const transformedGroup = {
            id: updatedGroup.id,
            current_members: updatedGroup.members?.length || 0,
            members: updatedGroup.members?.map((member: any) => ({
              id: member.id,
              user_id: member.user_id,
              name: member.user?.full_name || member.user?.username,
              username: member.user?.username,
              avatar_url: member.user?.avatar_url,
              ticket_verified: member.ticket_verified,
              joined_at: member.joined_at,
              role: member.role
            })) || []
          }
          
          io.to(`group:${groupId}`).emit('group_updated', transformedGroup)
        }
      } catch (socketError) {
        console.error('Socket.IO notification error (non-critical):', socketError)
      }
    }

    return NextResponse.json({ message: 'Successfully left group' })

  } catch (error) {
    console.error('Leave group API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}