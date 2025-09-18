'use client'

import { useState, useEffect } from 'react'
import { Users, Plus, MapPin, Calendar, Ticket, X, Send, Shield, Clock, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useSocket } from '@/hooks/useSocket'
import { GroupChatModal } from '@/components/GroupChatModal'

interface EventGroup {
  id: string
  name: string
  description: string
  event_id: string
  event_name: string
  organizer_id: string
  organizer_name: string
  max_members: number
  current_members: number
  meeting_point?: string
  meeting_time?: string
  required_ticket_verified: boolean
  is_private: boolean
  created_at: string
  members: GroupMember[]
}

interface GroupMember {
  id: string
  user_id: string
  name: string
  username: string
  avatar_url?: string
  ticket_verified: boolean
  joined_at: string
  role: 'organizer' | 'member'
}

interface CreateGroupFormData {
  name: string
  description: string
  max_members: number
  meeting_point: string
  meeting_time: string
  required_ticket_verified: boolean
  is_private: boolean
}

interface EventGroupModalProps {
  isOpen: boolean
  onClose: () => void
  event: {
    id: string
    name: string
    date: string
    location: string
  }
}

export function EventGroupModal({ isOpen, onClose, event }: EventGroupModalProps) {
  const [activeTab, setActiveTab] = useState<'browse' | 'create'>('browse')
  const [groups, setGroups] = useState<EventGroup[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedGroupForChat, setSelectedGroupForChat] = useState<EventGroup | null>(null)
  const [formData, setFormData] = useState<CreateGroupFormData>({
    name: '',
    description: '',
    max_members: 10,
    meeting_point: '',
    meeting_time: '',
    required_ticket_verified: true,
    is_private: false
  })

  const { on, off, emit, isConnected } = useSocket()

  // Load existing groups for this event
  useEffect(() => {
    if (isOpen) {
      loadEventGroups()
    }
  }, [isOpen, event.id])

  // Real-time group updates
  useEffect(() => {
    if (!isConnected) return

    const handleGroupCreated = (group: EventGroup) => {
      if (group.event_id === event.id) {
        setGroups(prev => [group, ...prev])
      }
    }

    const handleGroupUpdated = (group: EventGroup) => {
      if (group.event_id === event.id) {
        setGroups(prev => prev.map(g => g.id === group.id ? group : g))
      }
    }

    on('group_created', handleGroupCreated)
    on('group_updated', handleGroupUpdated)

    return () => {
      off('group_created', handleGroupCreated)
      off('group_updated', handleGroupUpdated)
    }
  }, [isConnected, event.id, on, off])

  const loadEventGroups = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/groups?event_id=${event.id}`)
      if (response.ok) {
        const data = await response.json()
        setGroups(data.groups || [])
      }
    } catch (error) {
      console.error('Error loading groups:', error)
      // Mock data for demonstration
      setGroups([
        {
          id: '1',
          name: 'VIP Experience Group',
          description: 'Grupo para quienes tienen tickets VIP. Nos encontramos 2 horas antes para cenar juntos.',
          event_id: event.id,
          event_name: event.name,
          organizer_id: 'user1',
          organizer_name: 'Carlos Rodríguez',
          max_members: 8,
          current_members: 5,
          meeting_point: 'Restaurante La Estación, Calle 85 #15-20',
          meeting_time: '18:00',
          required_ticket_verified: true,
          is_private: false,
          created_at: new Date().toISOString(),
          members: []
        },
        {
          id: '2',
          name: 'Transporte Compartido Zona Norte',
          description: 'Compartimos Uber/taxi desde la zona norte. Dividimos gastos entre todos.',
          event_id: event.id,
          event_name: event.name,
          organizer_id: 'user2',
          organizer_name: 'Ana Martínez',
          max_members: 4,
          current_members: 3,
          meeting_point: 'Centro Comercial Unicentro',
          meeting_time: '19:30',
          required_ticket_verified: true,
          is_private: false,
          created_at: new Date().toISOString(),
          members: []
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateGroup = async () => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          event_id: event.id,
          event_name: event.name
        })
      })

      if (response.ok) {
        const newGroup = await response.json()
        setGroups(prev => [newGroup, ...prev])
        setActiveTab('browse')
        setFormData({
          name: '',
          description: '',
          max_members: 10,
          meeting_point: '',
          meeting_time: '',
          required_ticket_verified: true,
          is_private: false
        })
        
        // Emit real-time event
        if (isConnected) {
          emit('group_created', newGroup)
        }
      }
    } catch (error) {
      console.error('Error creating group:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoinGroup = async (groupId: string) => {
    try {
      const response = await fetch(`/api/groups/${groupId}/join`, {
        method: 'POST'
      })

      if (response.ok) {
        const updatedGroup = await response.json()
        setGroups(prev => prev.map(g => g.id === groupId ? updatedGroup : g))
        
        // Emit real-time event
        if (isConnected) {
          emit('group_updated', updatedGroup)
        }
      }
    } catch (error) {
      console.error('Error joining group:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[80vh] bg-[#1e1f22] border-[#404249] overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-white flex items-center">
                <Users className="h-6 w-6 mr-2 text-purple-500" />
                Grupos para {event.name}
              </CardTitle>
              <p className="text-gray-400 text-sm mt-1">
                Organiza tu viaje con otros asistentes
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-[#2b2d31] rounded-lg p-1 mt-4">
            <button
              onClick={() => setActiveTab('browse')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'browse'
                  ? 'bg-[#404249] text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Explorar Grupos
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'create'
                  ? 'bg-[#404249] text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Crear Grupo
            </button>
          </div>
        </CardHeader>

        <CardContent className="overflow-y-auto max-h-[60vh]">
          {activeTab === 'browse' ? (
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-b-2 border-purple-500 rounded-full mx-auto"></div>
                  <p className="text-gray-400 mt-2">Cargando grupos...</p>
                </div>
              ) : groups.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No hay grupos para este evento aún</p>
                  <p className="text-gray-500 text-sm">¡Sé el primero en crear uno!</p>
                </div>
              ) : (
                groups.map((group) => (
                  <Card key={group.id} className="bg-[#2b2d31] border-[#404249]">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white">{group.name}</h3>
                          <p className="text-gray-400 text-sm mb-2">{group.description}</p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              {group.current_members}/{group.max_members}
                            </span>
                            {group.meeting_point && (
                              <span className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {group.meeting_point}
                              </span>
                            )}
                            {group.meeting_time && (
                              <span className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {group.meeting_time}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end space-y-2">
                          {group.required_ticket_verified && (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                              <Shield className="h-3 w-3 mr-1" />
                              Ticket verificado
                            </Badge>
                          )}
                          
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => setSelectedGroupForChat(group)}
                              className="bg-blue-500 hover:bg-blue-600 text-white"
                              size="sm"
                            >
                              <MessageCircle className="h-4 w-4 mr-1" />
                              Chat
                            </Button>
                            <Button
                              onClick={() => handleJoinGroup(group.id)}
                              disabled={group.current_members >= group.max_members}
                              className="bg-purple-500 hover:bg-purple-600 text-white"
                              size="sm"
                            >
                              {group.current_members >= group.max_members ? 'Grupo lleno' : 'Unirse'}
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        Organizado por {group.organizer_name}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Nombre del grupo
                </label>
                <input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ej. VIP Experience Group"
                  className="bg-[#404249] border-[#5c5f66] text-white w-full rounded-md px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Descripción
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe el propósito del grupo, punto de encuentro, etc."
                  className="bg-[#404249] border-[#5c5f66] text-white"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Máximo de miembros
                  </label>
                  <input
                    type="number"
                    value={formData.max_members}
                    onChange={(e) => setFormData({ ...formData, max_members: parseInt(e.target.value) || 10 })}
                    min="2"
                    max="50"
                    className="bg-[#404249] border-[#5c5f66] text-white w-full rounded-md px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Hora de encuentro
                  </label>
                  <input
                    type="time"
                    value={formData.meeting_time}
                    onChange={(e) => setFormData({ ...formData, meeting_time: e.target.value })}
                    className="bg-[#404249] border-[#5c5f66] text-white w-full rounded-md px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Punto de encuentro
                </label>
                <input
                  value={formData.meeting_point}
                  onChange={(e) => setFormData({ ...formData, meeting_point: e.target.value })}
                  placeholder="ej. Restaurante La Estación, Calle 85 #15-20"
                  className="bg-[#404249] border-[#5c5f66] text-white"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.required_ticket_verified}
                    onChange={(e) => setFormData({ ...formData, required_ticket_verified: e.target.checked })}
                    className="rounded border-[#5c5f66] bg-[#404249]"
                  />
                  <span className="text-sm text-white">Requerir ticket verificado</span>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                    Recomendado
                  </Badge>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.is_private}
                    onChange={(e) => setFormData({ ...formData, is_private: e.target.checked })}
                    className="rounded border-[#5c5f66] bg-[#404249]"
                  />
                  <span className="text-sm text-white">Grupo privado (solo por invitación)</span>
                </label>
              </div>

              <Button
                onClick={handleCreateGroup}
                disabled={!formData.name || isLoading}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white"
              >
                {isLoading ? 'Creando...' : 'Crear Grupo'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Group Chat Modal */}
      {selectedGroupForChat && (
        <GroupChatModal
          isOpen={!!selectedGroupForChat}
          onClose={() => setSelectedGroupForChat(null)}
          group={selectedGroupForChat}
        />
      )}
    </div>
  )
}