import { Server as NetServer } from 'http'
import { NextApiRequest, NextApiResponse } from 'next'
import { Server as ServerIO } from 'socket.io'
import { redis } from './redis'

export type NextApiResponseServerIO = NextApiResponse & {
  socket: any & {
    server: NetServer & {
      io: ServerIO
    }
  }
}

let io: ServerIO

export const getIO = (): ServerIO => {
  if (!io) {
    throw new Error('Socket.IO not initialized')
  }
  return io
}

export const initializeSocketIO = (server: NetServer): ServerIO => {
  if (io) {
    return io
  }

  console.log('🔌 Initializing Socket.IO server...')
  
  io = new ServerIO(server, {
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? process.env.NEXTAUTH_URL 
        : ['http://localhost:3000', 'http://localhost:3001'],
      methods: ['GET', 'POST'],
    },
  })

  io.on('connection', (socket) => {
    console.log(`🔗 Client connected: ${socket.id}`)

    // Join post-specific rooms for comments
    socket.on('join_post', (postId: string) => {
      socket.join(`post:${postId}`)
      console.log(`📝 Socket ${socket.id} joined post room: ${postId}`)
    })

    // Leave post room
    socket.on('leave_post', (postId: string) => {
      socket.leave(`post:${postId}`)
      console.log(`📝 Socket ${socket.id} left post room: ${postId}`)
    })

    // Handle typing events
    socket.on('typing_start', ({ postId, user }) => {
      socket.to(`post:${postId}`).emit('user_typing', { user, isTyping: true })
    })

    socket.on('typing_stop', ({ postId, user }) => {
      socket.to(`post:${postId}`).emit('user_typing', { user, isTyping: false })
    })

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`)
    })
  })

  // Setup Redis Pub/Sub for scaling across multiple servers
  setupRedisPubSub(io)

  console.log('✅ Socket.IO server initialized successfully')
  return io
}

// Redis Pub/Sub setup for horizontal scaling
const setupRedisPubSub = (io: ServerIO) => {
  try {
    // Create separate Redis connections for pub and sub
    const publisher = redis.duplicate()
    const subscriber = redis.duplicate()

    // Subscribe to real-time events
    subscriber.subscribe('realtime:comments', 'realtime:likes', 'realtime:posts')

    subscriber.on('message', (channel, message) => {
      try {
        const data = JSON.parse(message)
        
        switch (channel) {
          case 'realtime:comments':
            // Emit new comment to all clients in the post room
            io.to(`post:${data.postId}`).emit('new_comment', data.comment)
            console.log(`📨 Broadcasted new comment for post ${data.postId}`)
            break
            
          case 'realtime:likes':
            // Emit like update to all clients
            if (data.targetType === 'post') {
              io.emit('like_updated', {
                targetType: data.targetType,
                targetId: data.targetId,
                newCount: data.newCount,
                isLiked: data.isLiked
              })
            } else {
              // For comment likes, emit to the post room
              io.to(`post:${data.postId}`).emit('like_updated', {
                targetType: data.targetType,
                targetId: data.targetId,
                newCount: data.newCount,
                isLiked: data.isLiked
              })
            }
            console.log(`❤️ Broadcasted like update for ${data.targetType} ${data.targetId}`)
            break
            
          case 'realtime:posts':
            // Emit new post to all connected clients
            io.emit('new_post', data.post)
            console.log(`🆕 Broadcasted new post ${data.post.id}`)
            break
        }
      } catch (error) {
        console.error('Error processing Redis message:', error)
      }
    })

    console.log('✅ Redis Pub/Sub setup complete')
  } catch (error) {
    console.error('❌ Redis Pub/Sub setup failed:', error)
  }
}

// Helper functions to publish events to Redis
export const publishComment = async (postId: string, comment: any) => {
  try {
    await redis.publish('realtime:comments', JSON.stringify({
      postId,
      comment
    }))
  } catch (error) {
    console.error('Error publishing comment:', error)
  }
}

export const publishLike = async (targetType: 'post' | 'comment', targetId: string, newCount: number, isLiked: boolean, postId?: string) => {
  try {
    await redis.publish('realtime:likes', JSON.stringify({
      targetType,
      targetId,
      newCount,
      isLiked,
      postId
    }))
  } catch (error) {
    console.error('Error publishing like:', error)
  }
}

export const publishPost = async (post: any) => {
  try {
    await redis.publish('realtime:posts', JSON.stringify({
      post
    }))
  } catch (error) {
    console.error('Error publishing post:', error)
  }
}