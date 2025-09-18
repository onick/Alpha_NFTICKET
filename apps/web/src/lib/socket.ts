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

    // Join group chat rooms
    socket.on('join_group_chat', (groupId: string) => {
      socket.join(`group:${groupId}`)
      console.log(`👥 Socket ${socket.id} joined group chat: ${groupId}`)
    })

    // Leave group chat room
    socket.on('leave_group_chat', (groupId: string) => {
      socket.leave(`group:${groupId}`)
      console.log(`👥 Socket ${socket.id} left group chat: ${groupId}`)
    })

    // Handle group typing events
    socket.on('group_typing_start', ({ group_id, user_id, user_name }) => {
      socket.to(`group:${group_id}`).emit('group_typing_start', { 
        group_id, 
        user_id, 
        user_name 
      })
      console.log(`👥 ${user_name} started typing in group ${group_id}`)
    })

    socket.on('group_typing_stop', ({ group_id, user_id, user_name }) => {
      socket.to(`group:${group_id}`).emit('group_typing_stop', { 
        group_id, 
        user_id, 
        user_name 
      })
      console.log(`👥 ${user_name} stopped typing in group ${group_id}`)
    })

    // Handle group messages
    socket.on('group_message', (message) => {
      socket.to(`group:${message.group_id}`).emit('group_message', message)
      console.log(`💬 Message sent to group ${message.group_id}`)
    })

    // Handle group events
    socket.on('group_created', (group) => {
      socket.broadcast.emit('group_created', group)
      console.log(`🎯 Group created: ${group.name}`)
    })

    socket.on('group_updated', (group) => {
      socket.to(`group:${group.id}`).emit('group_updated', group)
      console.log(`🎯 Group updated: ${group.id}`)
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
    subscriber.subscribe('realtime:comments', 'realtime:likes', 'realtime:posts', 'realtime:groups')

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
            
          case 'realtime:groups':
            // Handle group-related events
            if (data.type === 'group_created') {
              io.emit('group_created', data.group)
              console.log(`🎯 Broadcasted group creation: ${data.group.name}`)
            } else if (data.type === 'group_updated') {
              io.to(`group:${data.group.id}`).emit('group_updated', data.group)
              console.log(`🎯 Broadcasted group update: ${data.group.id}`)
            } else if (data.type === 'group_message') {
              io.to(`group:${data.message.group_id}`).emit('group_message', data.message)
              console.log(`💬 Broadcasted group message to ${data.message.group_id}`)
            }
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

export const publishGroupEvent = async (type: 'group_created' | 'group_updated' | 'group_message', data: any) => {
  try {
    await redis.publish('realtime:groups', JSON.stringify({
      type,
      ...data
    }))
  } catch (error) {
    console.error('Error publishing group event:', error)
  }
}