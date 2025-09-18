import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { createClient } from 'redis'
import { ChatHandler } from './handlers/ChatHandler'
import { authMiddleware } from './middleware/auth'
import { rateLimiter } from './middleware/rateLimiter'
import { chatRoutes } from './routes/chat'
import { healthRoutes } from './routes/health'

// Load environment variables
dotenv.config()

const app = express()
const server = createServer(app)

// Socket.IO setup with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
})

// Redis client setup
const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
})

redis.on('error', (err) => {
  console.error('❌ Redis Client Error:', err)
})

redis.on('connect', () => {
  console.log('✅ Connected to Redis')
})

// Middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "ws:", "wss:"],
    }
  }
}))

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}))

app.use(morgan('combined'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Rate limiting
app.use('/api', rateLimiter)

// Routes
app.use('/health', healthRoutes)
app.use('/api/chat', authMiddleware, chatRoutes)

// Chat handler for Socket.IO
const chatHandler = new ChatHandler(io, redis)

// Socket.IO connection handling
io.use(async (socket, next) => {
  try {
    // TODO: Implement JWT verification
    const token = socket.handshake.auth.token
    if (!token) {
      return next(new Error('Authentication required'))
    }
    
    // For now, mock authentication
    socket.data.userId = socket.handshake.auth.userId || 'user-123'
    socket.data.user = {
      id: socket.data.userId,
      name: socket.handshake.auth.name || 'Test User',
      avatar: socket.handshake.auth.avatar
    }
    
    next()
  } catch (error) {
    console.error('Socket authentication error:', error)
    next(new Error('Authentication failed'))
  }
})

io.on('connection', (socket) => {
  console.log(`🔗 Chat client connected: ${socket.data.userId}`)
  
  // Handle user presence
  chatHandler.handleUserOnline(socket)
  
  // Message handling
  socket.on('chat:send_message', (data) => {
    chatHandler.handleSendMessage(socket, data)
  })
  
  socket.on('chat:typing_start', (data) => {
    chatHandler.handleTypingStart(socket, data)
  })
  
  socket.on('chat:typing_stop', (data) => {
    chatHandler.handleTypingStop(socket, data)
  })
  
  socket.on('chat:join_conversation', (data) => {
    chatHandler.handleJoinConversation(socket, data)
  })
  
  socket.on('chat:leave_conversation', (data) => {
    chatHandler.handleLeaveConversation(socket, data)
  })
  
  socket.on('chat:mark_read', (data) => {
    chatHandler.handleMarkAsRead(socket, data)
  })
  
  // Event sharing (NFTicket specific)
  socket.on('chat:share_event', (data) => {
    chatHandler.handleShareEvent(socket, data)
  })
  
  socket.on('chat:share_ticket', (data) => {
    chatHandler.handleShareTicket(socket, data)
  })
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`🔌 Chat client disconnected: ${socket.data.userId}`)
    chatHandler.handleUserOffline(socket)
  })
})

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Chat Service Error:', err)
  res.status(err.status || 500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  })
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🔄 Chat Service shutting down gracefully...')
  
  // Close connections
  io.close()
  await redis.quit()
  
  server.close(() => {
    console.log('✅ Chat Service shut down complete')
    process.exit(0)
  })
})

// Start server
const PORT = process.env.PORT || 3002

async function startServer() {
  try {
    // Connect to Redis
    await redis.connect()
    
    // Start HTTP server
    server.listen(PORT, () => {
      console.log(`🚀 Chat Service running on port ${PORT}`)
      console.log(`📡 Socket.IO server ready`)
      console.log(`🏥 Health check: http://localhost:${PORT}/health`)
      console.log(`💬 Chat API: http://localhost:${PORT}/api/chat`)
    })
  } catch (error) {
    console.error('❌ Failed to start Chat Service:', error)
    process.exit(1)
  }
}

startServer()

export { app, io, redis }