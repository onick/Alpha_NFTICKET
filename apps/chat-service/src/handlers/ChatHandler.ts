import { Server, Socket } from 'socket.io'
import { RedisClientType } from 'redis'
import { z } from 'zod'

// Validation schemas
const SendMessageSchema = z.object({
  conversationId: z.string(),
  content: z.string().min(1).max(2000),
  type: z.enum(['text', 'image', 'event_share', 'ticket_share']).default('text'),
  metadata: z.any().optional()
})

const TypingSchema = z.object({
  conversationId: z.string()
})

const JoinConversationSchema = z.object({
  conversationId: z.string()
})

const MarkReadSchema = z.object({
  conversationId: z.string(),
  messageId: z.string()
})

const ShareEventSchema = z.object({
  conversationId: z.string(),
  eventId: z.string(),
  eventData: z.object({
    name: z.string(),
    date: z.string(),
    location: z.string(),
    image: z.string().optional(),
    price: z.string().optional()
  })
})

interface Message {
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

interface TypingUser {
  userId: string
  userName: string
  timestamp: number
}

export class ChatHandler {
  private io: Server
  private redis: RedisClientType
  private userSockets: Map<string, string> = new Map() // userId -> socketId
  private socketUsers: Map<string, string> = new Map() // socketId -> userId

  constructor(io: Server, redis: RedisClientType) {
    this.io = io
    this.redis = redis
  }

  // User presence management
  async handleUserOnline(socket: Socket) {
    const userId = socket.data.userId
    const userName = socket.data.user.name
    
    // Store user-socket mapping
    this.userSockets.set(userId, socket.id)
    this.socketUsers.set(socket.id, userId)
    
    // Set user as online in Redis
    await this.redis.hSet('user_presence', userId, JSON.stringify({
      status: 'online',
      lastSeen: new Date().toISOString(),
      socketId: socket.id
    }))
    
    // Notify contacts that user is online
    const contacts = await this.getUserContacts(userId)
    for (const contactId of contacts) {
      const contactSocketId = this.userSockets.get(contactId)
      if (contactSocketId) {
        this.io.to(contactSocketId).emit('user_presence', {
          userId,
          userName,
          status: 'online',
          timestamp: new Date().toISOString()
        })
      }
    }
    
    console.log(`👤 User ${userName} (${userId}) is now online`)
  }

  async handleUserOffline(socket: Socket) {
    const userId = this.socketUsers.get(socket.id)
    if (!userId) return
    
    const userName = socket.data.user?.name || 'Unknown'
    
    // Remove user-socket mapping
    this.userSockets.delete(userId)
    this.socketUsers.delete(socket.id)
    
    // Set user as offline in Redis
    await this.redis.hSet('user_presence', userId, JSON.stringify({
      status: 'offline',
      lastSeen: new Date().toISOString(),
      socketId: null
    }))
    
    // Notify contacts that user is offline
    const contacts = await this.getUserContacts(userId)
    for (const contactId of contacts) {
      const contactSocketId = this.userSockets.get(contactId)
      if (contactSocketId) {
        this.io.to(contactSocketId).emit('user_presence', {
          userId,
          userName,
          status: 'offline',
          timestamp: new Date().toISOString()
        })
      }
    }
    
    console.log(`👤 User ${userName} (${userId}) is now offline`)
  }

  // Message handling
  async handleSendMessage(socket: Socket, data: any) {
    try {
      const validatedData = SendMessageSchema.parse(data)
      const userId = socket.data.userId
      const user = socket.data.user
      
      // Create message object
      const message: Message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2)}`,
        conversationId: validatedData.conversationId,
        senderId: userId,
        senderName: user.name,
        senderAvatar: user.avatar,
        content: validatedData.content,
        type: validatedData.type,
        metadata: validatedData.metadata,
        timestamp: new Date().toISOString(),
        readBy: [userId] // Sender automatically reads their own message
      }
      
      // Store message in Redis
      await this.storeMessage(message)
      
      // Get conversation participants
      const participants = await this.getConversationParticipants(validatedData.conversationId)
      
      // Send message to all participants
      for (const participantId of participants) {
        const participantSocketId = this.userSockets.get(participantId)
        if (participantSocketId) {
          this.io.to(participantSocketId).emit('chat:new_message', message)
        }
      }
      
      // Update conversation last_message_at
      await this.updateConversationTimestamp(validatedData.conversationId)
      
      console.log(`💬 Message sent by ${user.name} in conversation ${validatedData.conversationId}`)
      
    } catch (error) {
      console.error('Error handling send message:', error)
      socket.emit('chat:error', { 
        type: 'send_message_failed',
        message: 'Failed to send message'
      })
    }
  }

  // Typing indicators
  async handleTypingStart(socket: Socket, data: any) {
    try {
      const validatedData = TypingSchema.parse(data)
      const userId = socket.data.userId
      const user = socket.data.user
      
      // Store typing state in Redis with expiration
      const typingKey = `typing:${validatedData.conversationId}`
      await this.redis.hSet(typingKey, userId, JSON.stringify({
        userId,
        userName: user.name,
        timestamp: Date.now()
      }))
      await this.redis.expire(typingKey, 10) // Expire after 10 seconds
      
      // Notify other participants
      const participants = await this.getConversationParticipants(validatedData.conversationId)
      for (const participantId of participants) {
        if (participantId !== userId) {
          const participantSocketId = this.userSockets.get(participantId)
          if (participantSocketId) {
            this.io.to(participantSocketId).emit('chat:typing_start', {
              conversationId: validatedData.conversationId,
              userId,
              userName: user.name
            })
          }
        }
      }
      
    } catch (error) {
      console.error('Error handling typing start:', error)
    }
  }

  async handleTypingStop(socket: Socket, data: any) {
    try {
      const validatedData = TypingSchema.parse(data)
      const userId = socket.data.userId
      const user = socket.data.user
      
      // Remove typing state from Redis
      const typingKey = `typing:${validatedData.conversationId}`
      await this.redis.hDel(typingKey, userId)
      
      // Notify other participants
      const participants = await this.getConversationParticipants(validatedData.conversationId)
      for (const participantId of participants) {
        if (participantId !== userId) {
          const participantSocketId = this.userSockets.get(participantId)
          if (participantSocketId) {
            this.io.to(participantSocketId).emit('chat:typing_stop', {
              conversationId: validatedData.conversationId,
              userId,
              userName: user.name
            })
          }
        }
      }
      
    } catch (error) {
      console.error('Error handling typing stop:', error)
    }
  }

  // Conversation management
  async handleJoinConversation(socket: Socket, data: any) {
    try {
      const validatedData = JoinConversationSchema.parse(data)
      const userId = socket.data.userId
      
      // Join socket to conversation room
      socket.join(`conversation:${validatedData.conversationId}`)
      
      // Add user to conversation participants if not already there
      await this.addUserToConversation(validatedData.conversationId, userId)
      
      console.log(`👥 User ${userId} joined conversation ${validatedData.conversationId}`)
      
    } catch (error) {
      console.error('Error handling join conversation:', error)
    }
  }

  async handleLeaveConversation(socket: Socket, data: any) {
    try {
      const validatedData = JoinConversationSchema.parse(data)
      const userId = socket.data.userId
      
      // Leave socket room
      socket.leave(`conversation:${validatedData.conversationId}`)
      
      console.log(`👥 User ${userId} left conversation ${validatedData.conversationId}`)
      
    } catch (error) {
      console.error('Error handling leave conversation:', error)
    }
  }

  // Read receipts
  async handleMarkAsRead(socket: Socket, data: any) {
    try {
      const validatedData = MarkReadSchema.parse(data)
      const userId = socket.data.userId
      
      // Update message read status
      await this.markMessageAsRead(validatedData.messageId, userId)
      
      // Notify other participants
      const participants = await this.getConversationParticipants(validatedData.conversationId)
      for (const participantId of participants) {
        if (participantId !== userId) {
          const participantSocketId = this.userSockets.get(participantId)
          if (participantSocketId) {
            this.io.to(participantSocketId).emit('chat:message_read', {
              conversationId: validatedData.conversationId,
              messageId: validatedData.messageId,
              readBy: userId
            })
          }
        }
      }
      
    } catch (error) {
      console.error('Error handling mark as read:', error)
    }
  }

  // NFTicket specific: Event sharing
  async handleShareEvent(socket: Socket, data: any) {
    try {
      const validatedData = ShareEventSchema.parse(data)
      const userId = socket.data.userId
      const user = socket.data.user
      
      // Create event share message
      const message: Message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2)}`,
        conversationId: validatedData.conversationId,
        senderId: userId,
        senderName: user.name,
        senderAvatar: user.avatar,
        content: `Compartió un evento: ${validatedData.eventData.name}`,
        type: 'event_share',
        metadata: {
          eventId: validatedData.eventId,
          eventData: validatedData.eventData
        },
        timestamp: new Date().toISOString(),
        readBy: [userId]
      }
      
      // Store and broadcast message
      await this.storeMessage(message)
      
      const participants = await this.getConversationParticipants(validatedData.conversationId)
      for (const participantId of participants) {
        const participantSocketId = this.userSockets.get(participantId)
        if (participantSocketId) {
          this.io.to(participantSocketId).emit('chat:new_message', message)
        }
      }
      
      console.log(`🎟️ Event shared by ${user.name} in conversation ${validatedData.conversationId}`)
      
    } catch (error) {
      console.error('Error handling share event:', error)
    }
  }

  // NFTicket specific: Ticket sharing
  async handleShareTicket(socket: Socket, data: any) {
    try {
      // Similar to handleShareEvent but for tickets
      // TODO: Implement ticket sharing logic
      console.log('🎫 Ticket sharing not implemented yet')
    } catch (error) {
      console.error('Error handling share ticket:', error)
    }
  }

  // Helper methods
  private async storeMessage(message: Message) {
    const messageKey = `message:${message.id}`
    await this.redis.set(messageKey, JSON.stringify(message))
    
    // Add to conversation messages list
    const conversationMessagesKey = `conversation:${message.conversationId}:messages`
    await this.redis.lPush(conversationMessagesKey, message.id)
    
    // Keep only last 1000 messages per conversation
    await this.redis.lTrim(conversationMessagesKey, 0, 999)
  }

  private async getConversationParticipants(conversationId: string): Promise<string[]> {
    // TODO: Get from database/Redis
    // For now, extract from conversation ID format: "user1-user2"
    return conversationId.split('-').filter(id => id.startsWith('user'))
  }

  private async getUserContacts(userId: string): Promise<string[]> {
    // TODO: Get user's contacts from database
    // For now, return empty array
    return []
  }

  private async addUserToConversation(conversationId: string, userId: string) {
    const participantsKey = `conversation:${conversationId}:participants`
    await this.redis.sAdd(participantsKey, userId)
  }

  private async updateConversationTimestamp(conversationId: string) {
    const conversationKey = `conversation:${conversationId}`
    await this.redis.hSet(conversationKey, 'last_message_at', new Date().toISOString())
  }

  private async markMessageAsRead(messageId: string, userId: string) {
    const messageKey = `message:${messageId}`
    const message = await this.redis.get(messageKey)
    
    if (message) {
      const messageData = JSON.parse(message)
      if (!messageData.readBy.includes(userId)) {
        messageData.readBy.push(userId)
        await this.redis.set(messageKey, JSON.stringify(messageData))
      }
    }
  }
}