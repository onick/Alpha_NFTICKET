'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Users, X, MapPin, Calendar, Paperclip, Smile, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useSocket } from '@/hooks/useSocket'

interface GroupMessage {
  id: string
  group_id: string
  user_id: string
  user_name: string
  user_username: string
  user_avatar?: string
  content: string
  type: 'text' | 'image' | 'location' | 'system'
  created_at: string
  is_deleted: boolean
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
  is_online?: boolean
}

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

interface GroupChatModalProps {
  isOpen: boolean
  onClose: () => void
  group: EventGroup
}

export function GroupChatModal({ isOpen, onClose, group }: GroupChatModalProps) {
  const [messages, setMessages] = useState<GroupMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  const { on, off, emit, isConnected } = useSocket()

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load messages when modal opens
  useEffect(() => {
    if (isOpen && group) {
      loadGroupMessages()
      // Join the group room for real-time updates
      if (isConnected) {
        emit('join_group_chat', group.id)
      }
    }
    return () => {
      if (isConnected && group) {
        emit('leave_group_chat', group.id)
      }
    }
  }, [isOpen, group, isConnected, emit])

  // Real-time message handling
  useEffect(() => {
    if (!isConnected) return

    const handleNewMessage = (message: GroupMessage) => {
      if (message.group_id === group.id) {
        setMessages(prev => [...prev, message])
      }
    }

    const handleTypingStart = (data: { user_id: string, user_name: string, group_id: string }) => {
      if (data.group_id === group.id && data.user_id !== 'galileo_user_123') {
        setTypingUsers(prev => [...prev.filter(u => u !== data.user_name), data.user_name])
      }
    }

    const handleTypingStop = (data: { user_id: string, user_name: string, group_id: string }) => {
      if (data.group_id === group.id) {
        setTypingUsers(prev => prev.filter(u => u !== data.user_name))
      }
    }

    on('group_message', handleNewMessage)
    on('group_typing_start', handleTypingStart)
    on('group_typing_stop', handleTypingStop)

    return () => {
      off('group_message', handleNewMessage)
      off('group_typing_start', handleTypingStart)
      off('group_typing_stop', handleTypingStop)
    }
  }, [isConnected, group.id, on, off])

  const loadGroupMessages = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/groups/${group.id}/messages`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      } else {
        // Mock messages for demonstration
        setMessages([
          {
            id: '1',
            group_id: group.id,
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
            id: '2',
            group_id: group.id,
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
            id: '3',
            group_id: group.id,
            user_id: 'system',
            user_name: 'Sistema',
            user_username: 'system',
            content: 'Luis Fernández se unió al grupo',
            type: 'system',
            created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
            is_deleted: false
          }
        ])
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading) return

    const messageContent = newMessage.trim()
    setNewMessage('')

    // Stop typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    if (isConnected) {
      emit('group_typing_stop', {
        group_id: group.id,
        user_id: 'galileo_user_123',
        user_name: 'Galileo Galilei'
      })
    }

    try {
      const response = await fetch(`/api/groups/${group.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: messageContent,
          type: 'text'
        })
      })

      if (response.ok) {
        const newMsg = await response.json()
        setMessages(prev => [...prev, newMsg])
        
        // Emit real-time message
        if (isConnected) {
          emit('group_message', newMsg)
        }
      } else {
        // Mock message for demonstration
        const mockMessage: GroupMessage = {
          id: `mock_${Date.now()}`,
          group_id: group.id,
          user_id: 'galileo_user_123',
          user_name: 'Galileo Galilei',
          user_username: 'galileo',
          user_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
          content: messageContent,
          type: 'text',
          created_at: new Date().toISOString(),
          is_deleted: false
        }
        setMessages(prev => [...prev, mockMessage])
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)
    
    // Handle typing indicators
    if (isConnected && e.target.value.length > 0) {
      emit('group_typing_start', {
        group_id: group.id,
        user_id: 'galileo_user_123',
        user_name: 'Galileo Galilei'
      })

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      // Set new timeout to stop typing
      typingTimeoutRef.current = setTimeout(() => {
        if (isConnected) {
          emit('group_typing_stop', {
            group_id: group.id,
            user_id: 'galileo_user_123',
            user_name: 'Galileo Galilei'
          })
        }
      }, 1000)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer'
    } else {
      return date.toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'short' 
      })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl h-[80vh] bg-[#1e1f22] border-[#404249] flex flex-col">
        <CardHeader className="pb-4 border-b border-[#404249]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-500/20 p-2 rounded-lg">
                <MessageCircle className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-lg text-white">{group.name}</CardTitle>
                <div className="flex items-center space-x-3 text-sm text-gray-400">
                  <span className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {group.current_members} miembros
                  </span>
                  {group.meeting_point && (
                    <span className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {group.meeting_point}
                    </span>
                  )}
                  {group.meeting_time && (
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {group.meeting_time}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-b-2 border-purple-500 rounded-full mx-auto"></div>
                <p className="text-gray-400 mt-2">Cargando mensajes...</p>
              </div>
            ) : (
              <>
                {messages.map((message, index) => {
                  const showDate = index === 0 || 
                    formatDate(messages[index - 1].created_at) !== formatDate(message.created_at)
                  
                  return (
                    <div key={message.id}>
                      {showDate && (
                        <div className="text-center text-xs text-gray-500 mb-4">
                          {formatDate(message.created_at)}
                        </div>
                      )}
                      
                      {message.type === 'system' ? (
                        <div className="text-center text-sm text-gray-400 py-2">
                          {message.content}
                        </div>
                      ) : (
                        <div className="flex space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={message.user_avatar} />
                            <AvatarFallback className="bg-purple-500/20 text-purple-400 text-xs">
                              {message.user_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-sm font-medium text-white">
                                {message.user_name}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatTime(message.created_at)}
                              </span>
                            </div>
                            <div className="bg-[#2b2d31] rounded-lg rounded-tl-none p-3">
                              <p className="text-gray-200 text-sm leading-relaxed">
                                {message.content}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
                
                {/* Typing Indicators */}
                {typingUsers.length > 0 && (
                  <div className="flex space-x-3">
                    <div className="h-8 w-8"></div>
                    <div className="text-sm text-gray-400 italic">
                      {typingUsers.length === 1 
                        ? `${typingUsers[0]} está escribiendo...`
                        : `${typingUsers.slice(0, -1).join(', ')} y ${typingUsers[typingUsers.length - 1]} están escribiendo...`
                      }
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Message Input */}
          <div className="border-t border-[#404249] p-4">
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Paperclip className="h-5 w-5" />
              </Button>
              
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={newMessage}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribe un mensaje..."
                  className="bg-[#404249] border-[#5c5f66] text-white pr-12"
                  disabled={isLoading}
                />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute right-1 top-1 text-gray-400 hover:text-white"
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </div>
              
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isLoading}
                className="bg-purple-500 hover:bg-purple-600 text-white"
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}