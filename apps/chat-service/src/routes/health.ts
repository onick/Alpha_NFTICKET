import { Router } from 'express'
import { redis } from '../index'

const router = Router()

// Health check endpoint
router.get('/', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'chat-service',
      version: '1.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      checks: {
        redis: 'unknown'
      }
    }
    
    // Check Redis connection
    try {
      await redis.ping()
      health.checks.redis = 'healthy'
    } catch (error) {
      health.checks.redis = 'unhealthy'
      health.status = 'degraded'
    }
    
    const statusCode = health.status === 'healthy' ? 200 : 503
    res.status(statusCode).json(health)
    
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'chat-service',
      error: 'Health check failed'
    })
  }
})

// Readiness probe
router.get('/ready', async (req, res) => {
  try {
    // Check if service is ready to accept requests
    await redis.ping()
    
    res.json({
      status: 'ready',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: 'Service dependencies not available'
    })
  }
})

// Liveness probe
router.get('/live', (req, res) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

export { router as healthRoutes }