import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
    name: string
    avatar?: string
  }
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'No token provided'
      })
    }
    
    // TODO: Implement proper JWT verification with your auth system
    // For now, we'll use a mock verification
    if (token === 'mock-token') {
      req.user = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        avatar: 'https://example.com/avatar.jpg'
      }
      return next()
    }
    
    // In production, use your actual JWT secret
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any
      req.user = {
        id: decoded.sub || decoded.userId,
        email: decoded.email,
        name: decoded.name,
        avatar: decoded.avatar
      }
      next()
    } catch (jwtError) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Token verification failed'
      })
    }
    
  } catch (error) {
    console.error('Auth middleware error:', error)
    return res.status(500).json({
      error: 'Authentication error',
      message: 'Internal server error'
    })
  }
}

export type { AuthenticatedRequest }