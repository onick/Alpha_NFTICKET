'use client'

import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  transport: string
  joinPost: (postId: string) => void
  leavePost: (postId: string) => void
  startTyping: (postId: string, user: any) => void
  stopTyping: (postId: string, user: any) => void
  on: (event: string, callback: (...args: any[]) => void) => void
  off: (event: string, callback?: (...args: any[]) => void) => void
  emit: (event: string, ...args: any[]) => void
}

const SocketContext = createContext<SocketContextType | null>(null)

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [transport, setTransport] = useState('N/A')
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    // Initialize Socket.IO server first
    fetch('/api/socket')

    // Connect to Socket.IO server
    const socket = io({
      path: '/api/socket',
      addTrailingSlash: false,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('🔗 Connected to Socket.IO server (Global)')
      setIsConnected(true)
      setTransport(socket.io.engine.transport.name)

      socket.io.engine.on('upgrade', () => {
        setTransport(socket.io.engine.transport.name)
      })
    })

    socket.on('disconnect', () => {
      console.log('🔌 Disconnected from Socket.IO server (Global)')
      setIsConnected(false)
    })

    socket.on('connect_error', (error) => {
      console.error('❌ Socket.IO connection error (Global):', error)
      setIsConnected(false)
    })

    return () => {
      console.log('🧹 Cleaning up global Socket.IO connection')
      socket.disconnect()
    }
  }, [])

  // Helper methods
  const joinPost = (postId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join_post', postId)
    }
  }

  const leavePost = (postId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leave_post', postId)
    }
  }

  const startTyping = (postId: string, user: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing_start', { postId, user })
    }
  }

  const stopTyping = (postId: string, user: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing_stop', { postId, user })
    }
  }

  const on = (event: string, callback: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback)
    }
  }

  const off = (event: string, callback?: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback)
    }
  }

  const emit = (event: string, ...args: any[]) => {
    if (socketRef.current) {
      socketRef.current.emit(event, ...args)
    }
  }

  const value: SocketContextType = {
    socket: socketRef.current,
    isConnected,
    transport,
    joinPost,
    leavePost,
    startTyping,
    stopTyping,
    on,
    off,
    emit,
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}

export function useGlobalSocket() {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useGlobalSocket must be used within a SocketProvider')
  }
  return context
}