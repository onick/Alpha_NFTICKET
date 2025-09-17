import Redis from 'ioredis'

class RedisClient {
  private static instance: Redis | null = null
  private static isConnected = false

  public static getInstance(): Redis {
    if (!RedisClient.instance) {
      RedisClient.instance = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        // For development - use Redis Cloud or local Redis
        // For production - use Redis Cloud, AWS ElastiCache, etc.
      })

      RedisClient.instance.on('connect', () => {
        console.log('✅ Redis connected successfully')
        RedisClient.isConnected = true
      })

      RedisClient.instance.on('error', (error) => {
        console.error('❌ Redis connection error:', error)
        RedisClient.isConnected = false
      })

      RedisClient.instance.on('close', () => {
        console.log('⚠️ Redis connection closed')
        RedisClient.isConnected = false
      })
    }

    return RedisClient.instance
  }

  public static isRedisConnected(): boolean {
    return RedisClient.isConnected
  }

  public static async disconnect(): Promise<void> {
    if (RedisClient.instance) {
      await RedisClient.instance.disconnect()
      RedisClient.instance = null
      RedisClient.isConnected = false
    }
  }
}

export const redis = RedisClient.getInstance()

// Cache utilities with error handling
export class CacheService {
  private static TTL = {
    POSTS: 300, // 5 minutes
    USERS: 600, // 10 minutes
    COMMENTS: 180, // 3 minutes
    COUNTERS: 60, // 1 minute
  }

  // Generic cache getter with fallback
  static async get<T>(key: string): Promise<T | null> {
    try {
      if (!RedisClient.isRedisConnected()) {
        return null
      }

      const cached = await redis.get(key)
      return cached ? JSON.parse(cached) : null
    } catch (error) {
      console.error(`Redis GET error for key ${key}:`, error)
      return null
    }
  }

  // Generic cache setter with TTL
  static async set(key: string, value: any, ttl?: number): Promise<boolean> {
    try {
      if (!RedisClient.isRedisConnected()) {
        return false
      }

      const serialized = JSON.stringify(value)
      if (ttl) {
        await redis.setex(key, ttl, serialized)
      } else {
        await redis.set(key, serialized)
      }
      return true
    } catch (error) {
      console.error(`Redis SET error for key ${key}:`, error)
      return false
    }
  }

  // Delete cache key
  static async del(key: string): Promise<boolean> {
    try {
      if (!RedisClient.isRedisConnected()) {
        return false
      }

      await redis.del(key)
      return true
    } catch (error) {
      console.error(`Redis DEL error for key ${key}:`, error)
      return false
    }
  }

  // Cache posts with specific TTL
  static async cachePosts(posts: any[], limit: number, offset: number): Promise<void> {
    const key = `posts:${limit}:${offset}`
    await this.set(key, posts, this.TTL.POSTS)
  }

  // Get cached posts
  static async getCachedPosts(limit: number, offset: number): Promise<any[] | null> {
    const key = `posts:${limit}:${offset}`
    return await this.get<any[]>(key)
  }

  // Cache user search results
  static async cacheUserSearch(query: string, users: any[]): Promise<void> {
    const key = `users:search:${query.toLowerCase()}`
    await this.set(key, users, this.TTL.USERS)
  }

  // Get cached user search
  static async getCachedUserSearch(query: string): Promise<any[] | null> {
    const key = `users:search:${query.toLowerCase()}`
    return await this.get<any[]>(key)
  }

  // Cache comments for a post
  static async cacheComments(postId: string, comments: any[]): Promise<void> {
    const key = `comments:${postId}`
    await this.set(key, comments, this.TTL.COMMENTS)
  }

  // Get cached comments
  static async getCachedComments(postId: string): Promise<any[] | null> {
    const key = `comments:${postId}`
    return await this.get<any[]>(key)
  }

  // Invalidate comments cache when new comment is added
  static async invalidateCommentsCache(postId: string): Promise<void> {
    const key = `comments:${postId}`
    await this.del(key)
  }

  // Real-time counter management
  static async incrementCounter(key: string, amount: number = 1): Promise<number> {
    try {
      // Check Redis status and handle connection
      if (redis.status !== 'ready') {
        console.log(`⚠️ Redis status: ${redis.status} for key ${key}`)
        
        // If not connecting or connected, try to connect
        if (redis.status === 'end' || redis.status === 'close') {
          await redis.connect()
        } else if (redis.status === 'connecting') {
          // Wait for connection to complete
          await new Promise(resolve => {
            redis.once('ready', resolve)
            redis.once('error', resolve) // Also resolve on error to avoid hanging
          })
        }
      }

      const result = await redis.incrby(key, amount)
      await redis.expire(key, this.TTL.COUNTERS)
      console.log(`📊 Redis counter ${key} incremented by ${amount}, new value: ${result}`)
      return result
    } catch (error) {
      console.error(`Redis INCR error for key ${key}:`, error)
      return 0
    }
  }

  // Get counter value
  static async getCounter(key: string): Promise<number> {
    try {
      // Check Redis status and handle connection
      if (redis.status !== 'ready') {
        console.log(`⚠️ Redis status: ${redis.status} for key ${key}`)
        
        // If not connecting or connected, try to connect
        if (redis.status === 'end' || redis.status === 'close') {
          await redis.connect()
        } else if (redis.status === 'connecting') {
          // Wait for connection to complete
          await new Promise(resolve => {
            redis.once('ready', resolve)
            redis.once('error', resolve) // Also resolve on error to avoid hanging
          })
        }
      }

      const value = await redis.get(key)
      return parseInt(value || '0')
    } catch (error) {
      console.error(`Redis GET counter error for key ${key}:`, error)
      return 0
    }
  }

  // Invalidate all posts cache (when new post is created)
  static async invalidatePostsCache(): Promise<void> {
    try {
      if (!RedisClient.isRedisConnected()) {
        return
      }

      const keys = await redis.keys('posts:*')
      if (keys.length > 0) {
        await redis.del(...keys)
      }
    } catch (error) {
      console.error('Redis invalidate posts cache error:', error)
    }
  }
}

export default CacheService