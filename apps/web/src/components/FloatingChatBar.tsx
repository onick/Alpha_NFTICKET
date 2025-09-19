'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Minus, Send, Users } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useChatSocket } from '@/hooks/useChatSocket'

interface Contact {
  id: string
  name: string
  username: string
  avatar?: string
  isOnline: boolean
  lastSeen?: string
  unreadCount: number
}

interface Message {
  id: string
  senderId: string
  content: string
  timestamp: string
  type: 'text' | 'image' | 'event_share'
  metadata?: any
}

interface ChatWindow {
  id: string
  contact: Contact
  messages: Message[]
  isMinimized: boolean
  isTyping: boolean
}

export function FloatingChatBar() {
  const [isOpen, setIsOpen] = useState(false)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [chatWindows, setChatWindows] = useState<ChatWindow[]>([])
  const [totalUnread, setTotalUnread] = useState(0)
  const { socket, isConnected } = useChatSocket()

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

    const newChatWindow: ChatWindow = {
      id: `chat-${contact.id}`,
      contact,
      messages: [
        {
          id: '1',
          senderId: contact.id,
          content: `¡Hola! ¿Cómo estás?`,
          timestamp: new Date().toISOString(),
          type: 'text'
        }
      ],
      isMinimized: false,
      isTyping: false
    }

    setChatWindows(prev => [...prev, newChatWindow])
    setIsOpen(false)
  }

  const closeChat = (contactId: string) => {
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

  const sendMessage = (contactId: string, content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'current-user', // Reemplazar con ID del usuario actual
      content,
      timestamp: new Date().toISOString(),
      type: 'text'
    }

    setChatWindows(prev =>
      prev.map(chat =>
        chat.contact.id === contactId
          ? { ...chat, messages: [...chat.messages, newMessage] }
          : chat
      )
    )

    // TODO: Enviar mensaje via Socket.IO
    if (socket && isConnected) {
      socket.emit('chat:message', {
        recipientId: contactId,
        message: newMessage
      })
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
            {/* Header */}
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
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={contact.avatar} />
                      <AvatarFallback className="bg-gray-600 text-gray-200">{contact.name[0]}</AvatarFallback>
                    </Avatar>
                    {contact.isOnline && (
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
                          {contact.isOnline ? 'Activo(a) ahora' : `Activo(a) hace ${contact.lastSeen}`}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-500 text-sm mt-0.5 truncate">
                      {contact.unreadCount > 0 ? 'Mensaje nuevo' : 'Toca para enviar un mensaje'}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer con icono de escribir */}
            <div className="absolute bottom-4 right-4">
              <button className="w-12 h-12 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center shadow-lg transition-colors">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
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
  onSendMessage: (content: string) => void
  onBackToList: () => void
  style?: React.CSSProperties
}

function ChatWindow({ chatWindow, onClose, onMinimize, onSendMessage, onBackToList, style }: ChatWindowProps) {
  const [message, setMessage] = useState('')
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
            <Avatar className="h-8 w-8">
              <AvatarImage src={chatWindow.contact.avatar} />
              <AvatarFallback className="bg-gray-600 text-gray-200">{chatWindow.contact.name[0]}</AvatarFallback>
            </Avatar>
            {chatWindow.contact.isOnline && (
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-[#1e1f22]"></div>
            )}
          </div>
          <div className="ml-2">
            <p className="text-white font-medium text-sm">{chatWindow.contact.name}</p>
            {chatWindow.isTyping ? (
              <p className="text-purple-400 text-xs">escribiendo...</p>
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
        {chatWindow.messages.map((msg) => (
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
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-[#404249] bg-[#1e1f22]">
        <div className="flex items-center space-x-2">
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
    </div>
  )
}