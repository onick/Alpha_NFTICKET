import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

interface UseSocketOptions {
  autoConnect?: boolean
}

export const useSocket = (options: UseSocketOptions = {}) => {
  const { autoConnect = true } = options
  const [isConnected, setIsConnected] = useState(false)
  const [transport, setTransport] = useState('N/A')
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!autoConnect) return

    // Initialize Socket.IO server first
    fetch('/api/socket')

    // Connect to Socket.IO server
    const socket = io({
      path: '/api/socket',
      addTrailingSlash: false,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('🔗 Connected to Socket.IO server')
      setIsConnected(true)
      setTransport(socket.io.engine.transport.name)

      socket.io.engine.on('upgrade', () => {
        setTransport(socket.io.engine.transport.name)
      })
    })

    socket.on('disconnect', () => {
      console.log('🔌 Disconnected from Socket.IO server')
      setIsConnected(false)
    })

    socket.on('connect_error', (error) => {
      console.error('❌ Socket.IO connection error:', error)
      setIsConnected(false)
    })

    return () => {
      console.log('🧹 Cleaning up Socket.IO connection')
      socket.disconnect()
    }
  }, [autoConnect])

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

  return {
    socket: socketRef.current,
    isConnected,
    transport,
    joinPost,
    leavePost,
    startTyping,
    stopTyping,
    on,
    off,
  }
}