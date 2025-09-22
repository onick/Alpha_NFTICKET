'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  type: 'text' | 'image' | 'event_share' | 'ticket_share'
  metadata?: any
  timestamp: string
  readBy: string[]
}

interface UserPresence {
  userId: string
  userName: string
  status: 'online' | 'offline'
  timestamp: string
}

interface TypingIndicator {
  conversationId: string
  userId: string
  userName: string
}

interface ChatSocketContextType {
  socket: Socket | null
  isConnected: boolean
  sendMessage: (conversationId: string, content: string, type?: string, metadata?: any) => void
  joinConversation: (conversationId: string) => void
  leaveConversation: (conversationId: string) => void
  startTyping: (conversationId: string) => void
  stopTyping: (conversationId: string) => void
  markAsRead: (conversationId: string, messageId: string) => void
  shareEvent: (conversationId: string, eventId: string, eventData: any) => void
  onNewMessage: (callback: (message: ChatMessage) => void) => void
  onUserPresence: (callback: (presence: UserPresence) => void) => void
  onTypingStart: (callback: (typing: TypingIndicator) => void) => void
  onTypingStop: (callback: (typing: TypingIndicator) => void) => void
  onMessageRead: (callback: (data: { conversationId: string; messageId: string; readBy: string }) => void) => void
}

const ChatSocketContext = createContext<ChatSocketContextType | null>(null)

export function ChatSocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const eventListenersRef = useRef<Map<string, Function[]>>(new Map())

  // Initialize socket connection
  useEffect(() => {
    const CHAT_SERVICE_URL = process.env.NEXT_PUBLIC_CHAT_SERVICE_URL || 'http://localhost:3002'
    
    // TODO: Get actual auth token from your auth system
    const token = 'mock-token' // Replace with actual token
    const userId = 'user-123' // Replace with actual user ID
    const userName = 'Test User' // Replace with actual user name
    
    const socketInstance = io(CHAT_SERVICE_URL, {
      auth: {
        token,
        userId,
        name: userName
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    })

    // Connection event handlers
    socketInstance.on('connect', () => {
      console.log('🔗 Connected to Chat Service (Global)')
      setIsConnected(true)
    })

    socketInstance.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from Chat Service (Global):', reason)
      setIsConnected(false)
    })

    socketInstance.on('connect_error', (error) => {
      console.error('❌ Chat Service connection error (Global):', error)
      setIsConnected(false)
    })

    // Chat event handlers
    socketInstance.on('chat:new_message', (message: ChatMessage) => {
      const listeners = eventListenersRef.current.get('newMessage') || []
      listeners.forEach(callback => callback(message))
    })

    socketInstance.on('user_presence', (presence: UserPresence) => {
      const listeners = eventListenersRef.current.get('userPresence') || []
      listeners.forEach(callback => callback(presence))
    })

    socketInstance.on('chat:typing_start', (typing: TypingIndicator) => {
      const listeners = eventListenersRef.current.get('typingStart') || []
      listeners.forEach(callback => callback(typing))
    })

    socketInstance.on('chat:typing_stop', (typing: TypingIndicator) => {
      const listeners = eventListenersRef.current.get('typingStop') || []
      listeners.forEach(callback => callback(typing))
    })

    socketInstance.on('chat:message_read', (data: { conversationId: string; messageId: string; readBy: string }) => {
      const listeners = eventListenersRef.current.get('messageRead') || []
      listeners.forEach(callback => callback(data))
    })

    socketInstance.on('chat:error', (error: any) => {
      console.error('💬 Chat error:', error)
    })

    setSocket(socketInstance)

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up global Chat Socket connection')
      socketInstance.disconnect()
    }
  }, [])

  // Helper function to add event listeners
  const addEventListener = useCallback((event: string, callback: Function) => {
    const currentListeners = eventListenersRef.current.get(event) || []
    currentListeners.push(callback)
    eventListenersRef.current.set(event, currentListeners)

    // Return cleanup function
    return () => {
      const listeners = eventListenersRef.current.get(event) || []
      const filteredListeners = listeners.filter(cb => cb !== callback)
      eventListenersRef.current.set(event, filteredListeners)
    }
  }, [])

  // Socket action functions
  const sendMessage = useCallback((
    conversationId: string, 
    content: string, 
    type: string = 'text', 
    metadata?: any
  ) => {
    if (socket && isConnected) {
      socket.emit('chat:send_message', {
        conversationId,
        content,
        type,
        metadata
      })
    }
  }, [socket, isConnected])

  const joinConversation = useCallback((conversationId: string) => {
    if (socket && isConnected) {
      socket.emit('chat:join_conversation', { conversationId })
    }
  }, [socket, isConnected])

  const leaveConversation = useCallback((conversationId: string) => {
    if (socket && isConnected) {
      socket.emit('chat:leave_conversation', { conversationId })
    }
  }, [socket, isConnected])

  const startTyping = useCallback((conversationId: string) => {
    if (socket && isConnected) {
      socket.emit('chat:typing_start', { conversationId })
    }
  }, [socket, isConnected])

  const stopTyping = useCallback((conversationId: string) => {
    if (socket && isConnected) {
      socket.emit('chat:typing_stop', { conversationId })
    }
  }, [socket, isConnected])

  const markAsRead = useCallback((conversationId: string, messageId: string) => {
    if (socket && isConnected) {
      socket.emit('chat:mark_read', { conversationId, messageId })
    }
  }, [socket, isConnected])

  const shareEvent = useCallback((conversationId: string, eventId: string, eventData: any) => {
    if (socket && isConnected) {
      socket.emit('chat:share_event', {
        conversationId,
        eventId,
        eventData
      })
    }
  }, [socket, isConnected])

  // Event listener registration functions
  const onNewMessage = useCallback((callback: (message: ChatMessage) => void) => {
    return addEventListener('newMessage', callback)
  }, [addEventListener])

  const onUserPresence = useCallback((callback: (presence: UserPresence) => void) => {
    return addEventListener('userPresence', callback)
  }, [addEventListener])

  const onTypingStart = useCallback((callback: (typing: TypingIndicator) => void) => {
    return addEventListener('typingStart', callback)
  }, [addEventListener])

  const onTypingStop = useCallback((callback: (typing: TypingIndicator) => void) => {
    return addEventListener('typingStop', callback)
  }, [addEventListener])

  const onMessageRead = useCallback((callback: (data: { conversationId: string; messageId: string; readBy: string }) => void) => {
    return addEventListener('messageRead', callback)
  }, [addEventListener])

  const value: ChatSocketContextType = {
    socket,
    isConnected,
    sendMessage,
    joinConversation,
    leaveConversation,
    startTyping,
    stopTyping,
    markAsRead,
    shareEvent,
    onNewMessage,
    onUserPresence,
    onTypingStart,
    onTypingStop,
    onMessageRead
  }

  return (
    <ChatSocketContext.Provider value={value}>
      {children}
    </ChatSocketContext.Provider>
  )
}

export function useGlobalChatSocket() {
  const context = useContext(ChatSocketContext)
  if (!context) {
    throw new Error('useGlobalChatSocket must be used within a ChatSocketProvider')
  }
  return context
}