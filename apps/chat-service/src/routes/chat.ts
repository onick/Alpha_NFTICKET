import { Router } from 'express'
import { AuthenticatedRequest } from '../middleware/auth'

const router = Router()

// Get user's conversations
router.get('/conversations', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' })
    }
    
    // TODO: Implement conversation fetching from database
    // For now, return mock data
    const conversations = [
      {
        id: `${userId}-user-456`,
        type: 'direct',
        participants: [
          {
            id: 'user-456',
            name: 'María González',
            username: 'mariag_music',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b3fa?w=150&h=150&fit=crop&crop=face',
            isOnline: true
          }
        ],
        lastMessage: {
          id: 'msg-123',
          content: '¡Nos vemos en el concierto!',
          senderId: 'user-456',
          timestamp: new Date().toISOString(),
          type: 'text'
        },
        unreadCount: 2,
        updatedAt: new Date().toISOString()
      },
      {
        id: `${userId}-user-789`,
        type: 'direct',
        participants: [
          {
            id: 'user-789',
            name: 'Carlos Rivera',
            username: 'carlostech',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            isOnline: false,
            lastSeen: '2h'
          }
        ],
        lastMessage: {
          id: 'msg-456',
          content: '¿Tienes boletos extra?',
          senderId: userId,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          type: 'text'
        },
        unreadCount: 0,
        updatedAt: new Date(Date.now() - 3600000).toISOString()
      }
    ]
    
    res.json({
      conversations,
      total: conversations.length
    })
    
  } catch (error) {
    console.error('Error fetching conversations:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get messages for a specific conversation
router.get('/conversations/:conversationId/messages', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id
    const { conversationId } = req.params
    const { limit = '50', before } = req.query
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' })
    }
    
    // TODO: Verify user is participant in conversation
    // TODO: Fetch messages from database/Redis
    
    // Mock messages for now
    const messages = [
      {
        id: 'msg-1',
        conversationId,
        senderId: 'user-456',
        senderName: 'María González',
        senderAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b3fa?w=150&h=150&fit=crop&crop=face',
        content: '¡Hola! ¿Cómo estás?',
        type: 'text',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        readBy: ['user-456', userId]
      },
      {
        id: 'msg-2',
        conversationId,
        senderId: userId,
        senderName: req.user?.name || 'You',
        senderAvatar: req.user?.avatar,
        content: '¡Muy bien! ¿Ya tienes tus boletos para el concierto?',
        type: 'text',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        readBy: [userId]
      },
      {
        id: 'msg-3',
        conversationId,
        senderId: 'user-456',
        senderName: 'María González',
        senderAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b3fa?w=150&h=150&fit=crop&crop=face',
        content: '¡Nos vemos en el concierto!',
        type: 'text',
        timestamp: new Date().toISOString(),
        readBy: ['user-456']
      }
    ]
    
    res.json({
      messages,
      hasMore: false,
      nextCursor: null
    })
    
  } catch (error) {
    console.error('Error fetching messages:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Send a message (alternative to Socket.IO)
router.post('/conversations/:conversationId/messages', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id
    const { conversationId } = req.params
    const { content, type = 'text', metadata } = req.body
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' })
    }
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Message content is required' })
    }
    
    if (content.length > 2000) {
      return res.status(400).json({ error: 'Message too long (max 2000 characters)' })
    }
    
    // TODO: Verify user is participant in conversation
    // TODO: Store message in database/Redis
    // TODO: Send real-time notification via Socket.IO
    
    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      conversationId,
      senderId: userId,
      senderName: req.user?.name || 'User',
      senderAvatar: req.user?.avatar,
      content: content.trim(),
      type,
      metadata,
      timestamp: new Date().toISOString(),
      readBy: [userId]
    }
    
    res.status(201).json(message)
    
  } catch (error) {
    console.error('Error sending message:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Create or get a conversation with another user
router.post('/conversations', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id
    const { participantId, type = 'direct' } = req.body
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' })
    }
    
    if (!participantId) {
      return res.status(400).json({ error: 'Participant ID is required' })
    }
    
    if (participantId === userId) {
      return res.status(400).json({ error: 'Cannot create conversation with yourself' })
    }
    
    // TODO: Check if conversation already exists
    // TODO: Create new conversation in database
    
    const conversationId = [userId, participantId].sort().join('-')
    
    const conversation = {
      id: conversationId,
      type,
      participants: [userId, participantId],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    res.status(201).json(conversation)
    
  } catch (error) {
    console.error('Error creating conversation:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Mark messages as read
router.post('/conversations/:conversationId/read', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id
    const { conversationId } = req.params
    const { messageId, allMessages = false } = req.body
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' })
    }
    
    // TODO: Verify user is participant in conversation
    // TODO: Mark message(s) as read in database/Redis
    // TODO: Send real-time read receipt via Socket.IO
    
    res.json({ 
      success: true,
      message: allMessages ? 'All messages marked as read' : 'Message marked as read'
    })
    
  } catch (error) {
    console.error('Error marking messages as read:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get user's contacts/friends
router.get('/contacts', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' })
    }
    
    // TODO: Fetch user's contacts from database
    // For now, return mock data
    const contacts = [
      {
        id: 'user-456',
        name: 'María González',
        username: 'mariag_music',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b3fa?w=150&h=150&fit=crop&crop=face',
        isOnline: true,
        lastSeen: null,
        mutualEvents: 3
      },
      {
        id: 'user-789',
        name: 'Carlos Rivera',
        username: 'carlostech',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        isOnline: false,
        lastSeen: '2h',
        mutualEvents: 1
      },
      {
        id: 'user-101',
        name: 'Ana Martínez',
        username: 'ana_events',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        isOnline: true,
        lastSeen: null,
        mutualEvents: 5
      }
    ]
    
    res.json({ contacts })
    
  } catch (error) {
    console.error('Error fetching contacts:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Search for users to start a conversation
router.get('/users/search', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id
    const { q: query, limit = '10' } = req.query
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' })
    }
    
    if (!query || typeof query !== 'string' || query.trim().length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' })
    }
    
    // TODO: Search users in database
    // For now, return mock data
    const users = [
      {
        id: 'user-202',
        name: 'Diego Fernández',
        username: 'diego_music',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        mutualEvents: 2,
        isContact: false
      }
    ].filter(user => 
      user.name.toLowerCase().includes(query.toLowerCase()) ||
      user.username.toLowerCase().includes(query.toLowerCase())
    )
    
    res.json({ users })
    
  } catch (error) {
    console.error('Error searching users:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export { router as chatRoutes }