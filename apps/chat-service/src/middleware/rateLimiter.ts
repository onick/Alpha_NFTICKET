import { Request, Response, NextFunction } from 'express'
import { RateLimiterRedis } from 'rate-limiter-flexible'
import { createClient } from 'redis'

// Create Redis client for rate limiting
const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
})

redis.connect().catch(console.error)

// Rate limiter configurations
const rateLimiters = {
  // General API rate limiting
  general: new RateLimiterRedis({
    storeClient: redis,
    keyPrefix: 'chat_api_limit',
    points: 100, // Number of requests
    duration: 60, // Per 60 seconds
    blockDuration: 60 // Block for 60 seconds if limit exceeded
  }),

  // Message sending rate limiting (more restrictive)
  messaging: new RateLimiterRedis({
    storeClient: redis,
    keyPrefix: 'chat_msg_limit',
    points: 30, // 30 messages
    duration: 60, // Per 60 seconds
    blockDuration: 120 // Block for 2 minutes
  }),

  // Socket connection rate limiting
  socket: new RateLimiterRedis({
    storeClient: redis,
    keyPrefix: 'chat_socket_limit',
    points: 10, // 10 connections
    duration: 60, // Per 60 seconds
    blockDuration: 300 // Block for 5 minutes
  })
}

export const rateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const key = req.ip || req.connection.remoteAddress || 'unknown'
    
    // Choose rate limiter based on endpoint
    let limiter = rateLimiters.general
    if (req.path.includes('/messages') && req.method === 'POST') {
      limiter = rateLimiters.messaging
    }
    
    await limiter.consume(key)
    next()
    
  } catch (rateLimiterRes) {
    const remainingPoints = rateLimiterRes?.remainingPoints || 0
    const msBeforeNext = rateLimiterRes?.msBeforeNext || 0
    
    res.set({
      'Retry-After': Math.round(msBeforeNext / 1000) || 1,
      'X-RateLimit-Limit': limiter.points,
      'X-RateLimit-Remaining': remainingPoints,
      'X-RateLimit-Reset': new Date(Date.now() + msBeforeNext)
    })
    
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Too many requests. Please try again later.',
      retryAfter: Math.round(msBeforeNext / 1000)
    })
  }
}

// Socket.IO rate limiter middleware
export const socketRateLimiter = async (socket: any, next: any) => {
  try {
    const key = socket.handshake.address || 'unknown'
    await rateLimiters.socket.consume(key)
    next()
  } catch (rateLimiterRes) {
    const error = new Error('Rate limit exceeded for socket connections')
    error.data = {
      type: 'rate_limit',
      retryAfter: Math.round((rateLimiterRes?.msBeforeNext || 60000) / 1000)
    }
    next(error)
  }
}

export { rateLimiters }