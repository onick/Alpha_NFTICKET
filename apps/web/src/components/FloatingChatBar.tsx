'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Minus, Send, Users, Calendar, Search } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useGlobalChatSocket } from '@/contexts/ChatSocketContext'
import { MOCK_EVENTS } from '@/lib/mockEvents'
import { type Event } from '@nfticket/api'

interface Contact {
  id: string
  name: string
  username: string
  avatar?: string
  isOnline: boolean
  lastSeen?: string
  unreadCount: number
  isGroup?: boolean
  participants?: Contact[]
}

interface Message {
  id: string
  senderId: string
  content: string
  timestamp: string
  type: 'text' | 'image' | 'event_share'
  metadata?: any
  eventData?: {
    id: string
    title: string
    image_url?: string
    start_date: string
    venue_name: string
    organizer?: {
      full_name: string
    }
    ticket_types?: Array<{
      name: string
      price: number
    }>
  }
}

interface ChatWindow {
  id: string
  contact: Contact
  messages: Message[]
  isMinimized: boolean
  isTyping: boolean
  isGroup?: boolean
  participants?: Contact[]
}

export function FloatingChatBar() {
  const [isOpen, setIsOpen] = useState(false)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [chatWindows, setChatWindows] = useState<ChatWindow[]>([])
  const [totalUnread, setTotalUnread] = useState(0)
  const [isCreatingGroup, setIsCreatingGroup] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<Contact[]>([])
  const [groupName, setGroupName] = useState('')
  const [conversationHistory, setConversationHistory] = useState<{[key: string]: Message[]}>({})
  const { socket, isConnected } = useGlobalChatSocket()

  // Mock data para desarrollo
  useEffect(() => {
    const mockContacts: Contact[] = [
      {
        id: '1',
        name: 'María González',
        username: 'mariag_music',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b3fa?w=150&h=150&fit=crop&crop=face',
        isOnline: true,
        unreadCount: 2
      },
      {
        id: '2', 
        name: 'Carlos Rivera',
        username: 'carlostech',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        isOnline: false,
        lastSeen: '2h',
        unreadCount: 0
      },
      {
        id: '3',
        name: 'Ana Martínez',
        username: 'ana_events',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        isOnline: true,
        unreadCount: 1
      }
    ]
    setContacts(mockContacts)
    setTotalUnread(mockContacts.reduce((sum, contact) => sum + contact.unreadCount, 0))
  }, [])

  const openChat = (contact: Contact) => {
    const existingChat = chatWindows.find(chat => chat.contact.id === contact.id)
    
    if (existingChat) {
      if (existingChat.isMinimized) {
        setChatWindows(prev => 
          prev.map(chat => 
            chat.contact.id === contact.id 
              ? { ...chat, isMinimized: false }
              : chat
          )
        )
      }
      return
    }

    // Máximo 3 ventanas abiertas
    if (chatWindows.length >= 3) {
      setChatWindows(prev => prev.slice(1))
    }

    // Obtener mensajes del historial o crear mensajes iniciales
    const savedMessages = conversationHistory[contact.id] || (contact.isGroup ? [
      {
        id: 'system-1',
        senderId: 'system',
        content: 'Creaste el grupo.',
        timestamp: new Date().toISOString(),
        type: 'text'
      }
    ] : [
      {
        id: '1',
        senderId: contact.id,
        content: `¡Hola! ¿Cómo estás?`,
        timestamp: new Date().toISOString(),
        type: 'text'
      }
    ])

    const newChatWindow: ChatWindow = {
      id: `chat-${contact.id}`,
      contact,
      messages: savedMessages,
      isMinimized: false,
      isTyping: false,
      isGroup: contact.isGroup,
      participants: contact.participants
    }

    setChatWindows(prev => [...prev, newChatWindow])
    setIsOpen(false)
  }

  const closeChat = (contactId: string) => {
    // Guardar mensajes antes de cerrar
    const chatToClose = chatWindows.find(chat => chat.contact.id === contactId)
    if (chatToClose) {
      setConversationHistory(prev => ({
        ...prev,
        [contactId]: chatToClose.messages
      }))
    }
    setChatWindows(prev => prev.filter(chat => chat.contact.id !== contactId))
  }

  const minimizeChat = (contactId: string) => {
    setChatWindows(prev =>
      prev.map(chat =>
        chat.contact.id === contactId
          ? { ...chat, isMinimized: true }
          : chat
      )
    )
  }

  const sendMessage = (contactId: string, content: string, type: 'text' | 'event_share' = 'text', eventData?: any) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'current-user', // Reemplazar con ID del usuario actual
      content,
      timestamp: new Date().toISOString(),
      type,
      eventData
    }

    // Actualizar ventana de chat activa
    setChatWindows(prev =>
      prev.map(chat =>
        chat.contact.id === contactId
          ? { ...chat, messages: [...chat.messages, newMessage] }
          : chat
      )
    )

    // Actualizar historial de conversación
    setConversationHistory(prev => {
      const currentMessages = prev[contactId] || []
      return {
        ...prev,
        [contactId]: [...currentMessages, newMessage]
      }
    })

    // TODO: Enviar mensaje via Socket.IO
    if (socket && isConnected) {
      if (type === 'event_share') {
        socket.emit('chat:share_event', {
          conversationId: contactId,
          eventId: eventData.id,
          eventData
        })
      } else {
        socket.emit('chat:message', {
          recipientId: contactId,
          message: newMessage
        })
      }
    }
  }

  const toggleUserSelection = (contact: Contact) => {
    setSelectedUsers(prev => {
      const isSelected = prev.some(user => user.id === contact.id)
      if (isSelected) {
        return prev.filter(user => user.id !== contact.id)
      } else {
        return [...prev, contact]
      }
    })
  }

  const startGroupCreation = () => {
    setIsCreatingGroup(true)
    setSelectedUsers([])
    setGroupName('')
  }

  const cancelGroupCreation = () => {
    setIsCreatingGroup(false)
    setSelectedUsers([])
    setGroupName('')
  }

  const createGroup = () => {
    if (selectedUsers.length >= 2 && groupName.trim()) {
      // TODO: Crear grupo via API
      console.log('Creando grupo:', {
        name: groupName,
        participants: selectedUsers
      })
      
      // Por ahora, simular creación de grupo
      const groupContact: Contact = {
        id: `group-${Date.now()}`,
        name: groupName,
        username: 'grupo',
        isOnline: true,
        unreadCount: 0,
        isGroup: true,
        participants: selectedUsers,
        avatar: selectedUsers[0]?.avatar // Usar avatar del primer participante para la lista principal
      }
      
      // Crear ventana de chat de grupo con participantes
      const newChatWindow: ChatWindow = {
        id: `chat-${groupContact.id}`,
        contact: groupContact,
        messages: [
          {
            id: 'system-1',
            senderId: 'system',
            content: 'Creaste el grupo.',
            timestamp: new Date().toISOString(),
            type: 'text'
          }
        ],
        isMinimized: false,
        isTyping: false,
        isGroup: true,
        participants: selectedUsers
      }

      setChatWindows(prev => [...prev, newChatWindow])
      
      // Agregar el grupo a la lista de contactos para que aparezca en la lista principal
      setContacts(prev => [groupContact, ...prev])
      
      // Inicializar historial del grupo
      setConversationHistory(prev => ({
        ...prev,
        [groupContact.id]: newChatWindow.messages
      }))
      
      cancelGroupCreation()
      setIsOpen(false)
    }
  }

  return (
    <>
      {/* Botón principal flotante */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-4 shadow-lg relative"
        >
          <MessageCircle className="h-6 w-6" />
          {totalUnread > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full min-w-[20px] h-5 flex items-center justify-center text-xs">
              {totalUnread > 99 ? '99+' : totalUnread}
            </Badge>
          )}
        </Button>

        {/* Lista de mensajes estilo Instagram modo oscuro */}
        {isOpen && (
          <div className="absolute bottom-16 right-0 bg-[#1e1f22] rounded-lg shadow-2xl w-80 max-h-96 overflow-hidden border border-[#404249]">
            {!isCreatingGroup ? (
              <>
                {/* Header - Vista normal */}
                <div className="flex items-center justify-between p-4 border-b border-[#404249]">
                  <h3 className="text-white font-semibold text-base">
                    Mensajes
                    {totalUnread > 0 && (
                      <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                        {totalUnread}
                      </span>
                    )}
                  </h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-300 p-1"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Lista de contactos */}
                <div className="overflow-y-auto max-h-80">
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      onClick={() => openChat(contact)}
                      className="flex items-center p-3 hover:bg-[#2b2d31] cursor-pointer transition-colors border-b border-[#404249] last:border-b-0"
                    >
                      <div className="relative">
                        {contact.isGroup && contact.participants && contact.participants.length >= 2 ? (
                          <div className="relative h-12 w-12">
                            {/* Primer avatar pequeño (atrás) */}
                            <Avatar className="h-8 w-8 border-2 border-[#1e1f22] absolute top-0 left-0">
                              <AvatarImage src={contact.participants[1]?.avatar} />
                              <AvatarFallback className="bg-gray-600 text-gray-200 text-xs">
                                {contact.participants[1]?.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            {/* Segundo avatar pequeño (adelante, solapado) */}
                            <Avatar className="h-8 w-8 border-2 border-[#1e1f22] absolute bottom-0 right-0">
                              <AvatarImage src={contact.participants[0]?.avatar} />
                              <AvatarFallback className="bg-gray-600 text-gray-200 text-xs">
                                {contact.participants[0]?.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        ) : (
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={contact.avatar} />
                            <AvatarFallback className="bg-gray-600 text-gray-200">{contact.name[0]}</AvatarFallback>
                          </Avatar>
                        )}
                        {!contact.isGroup && contact.isOnline && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#1e1f22]"></div>
                        )}
                      </div>

                      <div className="ml-3 flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-white font-medium text-sm truncate">{contact.name}</p>
                          <div className="flex items-center space-x-1">
                            {contact.unreadCount > 0 && (
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            )}
                            <span className="text-gray-400 text-xs">
                              {contact.isGroup 
                                ? `${contact.participants?.length} participantes`
                                : contact.isOnline ? 'Activo(a) ahora' : `Activo(a) hace ${contact.lastSeen}`
                              }
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-500 text-sm mt-0.5 truncate">
                          {contact.unreadCount > 0 ? 'Mensaje nuevo' : 
                           contact.isGroup ? 'Grupo creado' : 'Toca para enviar un mensaje'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer con icono de escribir */}
                <div className="absolute bottom-4 right-4">
                  <button 
                    onClick={startGroupCreation}
                    className="w-12 h-12 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center shadow-lg transition-colors"
                  >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Header - Vista creación de grupo */}
                <div className="flex items-center justify-between p-4 border-b border-[#404249]">
                  <div className="flex items-center">
                    <button
                      onClick={cancelGroupCreation}
                      className="text-gray-400 hover:text-gray-300 p-1 mr-2"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <h3 className="text-white font-semibold text-base">Nuevo Grupo</h3>
                  </div>
                  <button
                    onClick={createGroup}
                    disabled={selectedUsers.length < 2 || !groupName.trim()}
                    className={`text-sm px-3 py-1 rounded-full transition-colors ${
                      selectedUsers.length >= 2 && groupName.trim()
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Crear
                  </button>
                </div>

                {/* Input para nombre del grupo */}
                <div className="p-4 border-b border-[#404249]">
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Nombre del grupo..."
                    className="w-full bg-[#2b2d31] border-0 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    maxLength={25}
                  />
                  {selectedUsers.length > 0 && (
                    <div className="mt-2 text-xs text-gray-400">
                      {selectedUsers.length} participante{selectedUsers.length !== 1 ? 's' : ''} seleccionado{selectedUsers.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>

                {/* Lista de usuarios para seleccionar */}
                <div className="overflow-y-auto max-h-64">
                  {contacts.filter(contact => !contact.isGroup).map((contact) => {
                    const isSelected = selectedUsers.some(user => user.id === contact.id)
                    return (
                      <div
                        key={contact.id}
                        onClick={() => toggleUserSelection(contact)}
                        className="flex items-center p-3 hover:bg-[#2b2d31] cursor-pointer transition-colors border-b border-[#404249] last:border-b-0"
                      >
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={contact.avatar} />
                            <AvatarFallback className="bg-gray-600 text-gray-200">{contact.name[0]}</AvatarFallback>
                          </Avatar>
                          {contact.isOnline && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1e1f22]"></div>
                          )}
                        </div>

                        <div className="ml-3 flex-1 min-w-0">
                          <p className="text-white font-medium text-sm truncate">{contact.name}</p>
                          <p className="text-gray-400 text-xs">@{contact.username}</p>
                        </div>

                        {/* Checkbox visual */}
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isSelected 
                            ? 'bg-purple-600 border-purple-600' 
                            : 'border-gray-400'
                        }`}>
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Ventanas de chat flotantes */}
      <div className="fixed bottom-6 right-20 z-40 flex space-x-2">
        {chatWindows.map((chatWindow, index) => (
          <ChatWindow
            key={chatWindow.id}
            chatWindow={chatWindow}
            onClose={() => closeChat(chatWindow.contact.id)}
            onMinimize={() => minimizeChat(chatWindow.contact.id)}
            onSendMessage={(content) => sendMessage(chatWindow.contact.id, content)}
            onBackToList={() => {
              setIsOpen(true)
              closeChat(chatWindow.contact.id)
            }}
            style={{ 
              marginRight: `${index * 10}px`,
              zIndex: 40 - index 
            }}
          />
        ))}
      </div>
    </>
  )
}

interface ChatWindowProps {
  chatWindow: ChatWindow
  onClose: () => void
  onMinimize: () => void
  onSendMessage: (content: string, type?: 'text' | 'event_share', eventData?: any) => void
  onBackToList: () => void
  style?: React.CSSProperties
}

function ChatWindow({ chatWindow, onClose, onMinimize, onSendMessage, onBackToList, style }: ChatWindowProps) {
  const [message, setMessage] = useState('')
  const [showEventModal, setShowEventModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatWindow.messages])

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim())
      setMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
    if (e.key === 'Escape') {
      onMinimize()
    }
  }

  const shareEvent = (event: Event) => {
    const eventData = {
      id: event.id,
      title: event.title,
      image_url: event.image_url,
      start_date: event.start_date,
      venue_name: event.venue_name,
      organizer: event.organizer,
      ticket_types: event.ticket_types
    }
    
    onSendMessage(`Compartió el evento: ${event.title}`, 'event_share', eventData)
    setShowEventModal(false)
  }

  const filteredEvents = MOCK_EVENTS.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.venue_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.category?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (chatWindow.isMinimized) {
    return (
      <div
        style={style}
        className="bg-[#1e1f22] border border-[#404249] rounded-t-lg shadow-lg w-80 cursor-pointer"
        onClick={() => onMinimize()}
      >
        <div className="flex items-center justify-between p-3 border-b border-[#404249]">
          <div className="flex items-center">
            <Avatar className="h-8 w-8">
              <AvatarImage src={chatWindow.contact.avatar} />
              <AvatarFallback className="bg-gray-600 text-gray-200">{chatWindow.contact.name[0]}</AvatarFallback>
            </Avatar>
            <div className="ml-2">
              <p className="text-white font-medium text-sm">{chatWindow.contact.name}</p>
              {chatWindow.contact.isOnline && (
                <p className="text-green-400 text-xs">Activo(a) ahora</p>
              )}
            </div>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="text-gray-400 hover:text-gray-300 p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      style={style}
      className="bg-[#1e1f22] border border-[#404249] rounded-t-lg shadow-xl w-80 h-96 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-[#404249]">
        <div className="flex items-center">
          {/* Flecha para regresar a la lista */}
          <button 
            onClick={onBackToList}
            className="text-gray-400 hover:text-gray-300 p-1 mr-2"
            title="Volver a mensajes"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="relative">
            {(chatWindow.isGroup || chatWindow.contact.isGroup) && (chatWindow.participants || chatWindow.contact.participants) ? (
              <div className="relative h-8 w-8">
                {(chatWindow.participants || chatWindow.contact.participants)?.length >= 2 ? (
                  <div className="relative">
                    {/* Primer avatar pequeño (atrás) */}
                    <Avatar className="h-6 w-6 border border-[#1e1f22]">
                      <AvatarImage src={(chatWindow.participants || chatWindow.contact.participants)?.[1]?.avatar} />
                      <AvatarFallback className="bg-gray-600 text-gray-200 text-xs">
                        {(chatWindow.participants || chatWindow.contact.participants)?.[1]?.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {/* Segundo avatar pequeño (adelante, solapado) */}
                    <Avatar className="h-6 w-6 border border-[#1e1f22] absolute -right-1 -top-1">
                      <AvatarImage src={(chatWindow.participants || chatWindow.contact.participants)?.[0]?.avatar} />
                      <AvatarFallback className="bg-gray-600 text-gray-200 text-xs">
                        {(chatWindow.participants || chatWindow.contact.participants)?.[0]?.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                ) : (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={(chatWindow.participants || chatWindow.contact.participants)?.[0]?.avatar} />
                    <AvatarFallback className="bg-gray-600 text-gray-200">
                      {(chatWindow.participants || chatWindow.contact.participants)?.[0]?.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ) : (
              <Avatar className="h-8 w-8">
                <AvatarImage src={chatWindow.contact.avatar} />
                <AvatarFallback className="bg-gray-600 text-gray-200">{chatWindow.contact.name[0]}</AvatarFallback>
              </Avatar>
            )}
            {!(chatWindow.isGroup || chatWindow.contact.isGroup) && chatWindow.contact.isOnline && (
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-[#1e1f22]"></div>
            )}
          </div>
          <div className="ml-2">
            <p className="text-white font-medium text-sm">{chatWindow.contact.name}</p>
            {chatWindow.isTyping ? (
              <p className="text-purple-400 text-xs">escribiendo...</p>
            ) : (chatWindow.isGroup || chatWindow.contact.isGroup) ? (
              <p className="text-gray-400 text-xs">
                {(chatWindow.participants || chatWindow.contact.participants)?.length} participante{(chatWindow.participants || chatWindow.contact.participants)?.length !== 1 ? 's' : ''}
              </p>
            ) : (
              <p className="text-gray-400 text-xs">
                {chatWindow.contact.isOnline ? 'Activo(a) ahora' : `Activo(a) hace ${chatWindow.contact.lastSeen}`}
              </p>
            )}
          </div>
        </div>
        <div className="flex space-x-1">
          {/* Botón de información como Instagram */}
          <button 
            className="text-gray-400 hover:text-gray-300 p-1"
            title="Información del contacto"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button 
            onClick={onMinimize}
            className="text-gray-400 hover:text-gray-300 p-1"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300 p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-[#2b2d31]">
        {/* Vista especial para grupos recién creados */}
        {(chatWindow.isGroup || chatWindow.contact.isGroup) && (chatWindow.participants || chatWindow.contact.participants) && (
          <div className="flex flex-col items-center py-8 space-y-4">
            {/* Avatares solapados como WhatsApp */}
            <div className="relative flex items-center justify-center">
              {(chatWindow.participants || chatWindow.contact.participants)?.length >= 2 ? (
                <div className="relative">
                  {/* Primer avatar (atrás) */}
                  <Avatar className="h-20 w-20 border-4 border-[#2b2d31]">
                    <AvatarImage src={(chatWindow.participants || chatWindow.contact.participants)?.[1]?.avatar} />
                    <AvatarFallback className="bg-gray-600 text-gray-200">
                      {(chatWindow.participants || chatWindow.contact.participants)?.[1]?.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {/* Segundo avatar (adelante, solapado) */}
                  <Avatar className="h-20 w-20 border-4 border-[#2b2d31] absolute -right-6 -top-2">
                    <AvatarImage src={(chatWindow.participants || chatWindow.contact.participants)?.[0]?.avatar} />
                    <AvatarFallback className="bg-gray-600 text-gray-200">
                      {(chatWindow.participants || chatWindow.contact.participants)?.[0]?.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              ) : (
                <Avatar className="h-20 w-20 border-4 border-[#2b2d31]">
                  <AvatarImage src={(chatWindow.participants || chatWindow.contact.participants)?.[0]?.avatar} />
                  <AvatarFallback className="bg-gray-600 text-gray-200">
                    {(chatWindow.participants || chatWindow.contact.participants)?.[0]?.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>

            {/* Nombre del grupo */}
            <div className="text-center">
              <h3 className="text-white font-semibold text-lg">{chatWindow.contact.name}</h3>
              <p className="text-gray-400 text-sm mt-1">Creaste este grupo</p>
            </div>
          </div>
        )}

        {/* Mensajes normales */}
        {chatWindow.messages.map((msg) => {
          if (msg.senderId === 'system') {
            return (
              <div key={msg.id} className="flex justify-center my-4">
                <div className="bg-[#404249] px-3 py-1 rounded-full">
                  <span className="text-gray-300 text-xs">{msg.content}</span>
                </div>
              </div>
            )
          }

          if (msg.type === 'event_share' && msg.eventData) {
            return (
              <div
                key={msg.id}
                className={`flex ${msg.senderId === 'current-user' ? 'justify-end' : 'justify-start'} mb-4`}
              >
                <div className={`max-w-sm ${msg.senderId === 'current-user' ? 'ml-8' : 'mr-8'}`}>
                  {/* Tarjeta del evento - Sin mensaje de texto */}
                  <div 
                    className="bg-[#2b2d31] border border-[#404249] rounded-lg overflow-hidden cursor-pointer hover:bg-[#32353a] transition-colors group"
                    onClick={() => {
                      // Navegar al evento para comprar entradas
                      window.open(`/events/${msg.eventData.id}`, '_blank')
                    }}
                  >
                    {msg.eventData.image_url && (
                      <img 
                        src={msg.eventData.image_url} 
                        alt={msg.eventData.title}
                        className="w-full h-32 object-cover group-hover:opacity-90 transition-opacity"
                      />
                    )}
                    <div className="p-3">
                      <h4 className="text-white font-semibold text-sm mb-1 line-clamp-1 group-hover:text-purple-300 transition-colors">
                        {msg.eventData.title}
                      </h4>
                      <p className="text-gray-400 text-xs mb-1">
                        📅 {new Date(msg.eventData.start_date).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short'
                        })} • {msg.eventData.venue_name}
                      </p>
                      <div className="flex items-center justify-between">
                        {msg.eventData.ticket_types && msg.eventData.ticket_types.length > 0 && (
                          <p className="text-purple-400 text-xs font-medium">
                            Desde ${msg.eventData.ticket_types[0].price.toLocaleString()}
                          </p>
                        )}
                        <div className="bg-purple-600 hover:bg-purple-700 px-2 py-1 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          Ver evento
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          }
          
          return (
            <div
              key={msg.id}
              className={`flex ${msg.senderId === 'current-user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-3 py-2 rounded-2xl text-sm ${
                  msg.senderId === 'current-user'
                    ? 'bg-purple-600 text-white rounded-br-sm'
                    : 'bg-[#404249] text-gray-100 rounded-bl-sm'
                }`}
              >
                {msg.content}
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-[#404249] bg-[#1e1f22]">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowEventModal(true)}
            className="p-2 rounded-full bg-[#2b2d31] hover:bg-[#404249] text-gray-400 hover:text-purple-400 transition-colors"
            title="Compartir evento"
          >
            <Calendar className="h-4 w-4" />
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Escribe un mensaje..."
            className="flex-1 bg-[#2b2d31] border-0 rounded-full px-4 py-2 text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-[#404249]"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className={`p-2 rounded-full transition-colors ${
              message.trim() 
                ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Event Selection Modal */}
      {showEventModal && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1e1f22] rounded-lg shadow-2xl w-full max-w-md max-h-96 flex flex-col border border-[#404249]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#404249]">
              <h3 className="text-white font-semibold text-base">Compartir Evento</h3>
              <button
                onClick={() => setShowEventModal(false)}
                className="text-gray-400 hover:text-gray-300 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-[#404249]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar eventos..."
                  className="w-full bg-[#2b2d31] border-0 rounded-lg pl-10 pr-3 py-2 text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Events List */}
            <div className="flex-1 overflow-y-auto">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  onClick={() => shareEvent(event)}
                  className="flex items-center p-3 hover:bg-[#2b2d31] cursor-pointer transition-colors border-b border-[#404249] last:border-b-0"
                >
                  <div className="w-12 h-12 bg-[#404249] rounded-lg overflow-hidden flex-shrink-0">
                    {event.image_url ? (
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-gray-500" />
                      </div>
                    )}
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{event.title}</p>
                    <p className="text-gray-400 text-xs truncate">
                      {new Date(event.start_date).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short'
                      })} • {event.venue_name}
                    </p>
                    <p className="text-purple-400 text-xs">
                      {event.ticket_types && event.ticket_types.length > 0 
                        ? `Desde $${event.ticket_types[0].price.toLocaleString()}`
                        : event.category
                      }
                    </p>
                  </div>
                </div>
              ))}
              {filteredEvents.length === 0 && (
                <div className="p-8 text-center">
                  <Calendar className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No se encontraron eventos</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}