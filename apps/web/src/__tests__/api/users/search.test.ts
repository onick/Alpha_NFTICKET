import { GET } from '../../../app/api/users/search/route'
import { NextRequest } from 'next/server'

// Mock NextRequest
const createMockRequest = (url: string) => {
  return {
    url,
    nextUrl: new URL(url),
  } as NextRequest
}

describe('/api/users/search', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/users/search', () => {
    it('should return users matching the search query by name', async () => {
      const request = createMockRequest('http://localhost:3000/api/users/search?q=María')
      
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data).toHaveLength(1)
      expect(data[0]).toEqual({
        id: '1',
        name: 'María González',
        username: 'mariag_music',
        avatar: null
      })
    })

    it('should return users matching the search query by username', async () => {
      const request = createMockRequest('http://localhost:3000/api/users/search?q=carlostech')
      
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data).toHaveLength(1)
      expect(data[0]).toEqual({
        id: '2',
        name: 'Carlos Rivera',
        username: 'carlostech',
        avatar: null
      })
    })

    it('should return multiple users for broader search queries', async () => {
      const request = createMockRequest('http://localhost:3000/api/users/search?q=a')
      
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBeGreaterThan(1)
      expect(data.length).toBeLessThanOrEqual(5) // Should limit to 5 results
      
      // All results should contain 'a' in name or username
      data.forEach((user: any) => {
        const containsQuery = 
          user.name.toLowerCase().includes('a') || 
          user.username.toLowerCase().includes('a')
        expect(containsQuery).toBe(true)
      })
    })

    it('should limit results to maximum 5 users', async () => {
      const request = createMockRequest('http://localhost:3000/api/users/search?q=e')
      
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBeLessThanOrEqual(5)
    })

    it('should return empty array for queries with no matches', async () => {
      const request = createMockRequest('http://localhost:3000/api/users/search?q=xyznomatch')
      
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data).toHaveLength(0)
    })

    it('should return empty array when no query parameter is provided', async () => {
      const request = createMockRequest('http://localhost:3000/api/users/search')
      
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data).toHaveLength(0)
    })

    it('should return empty array for empty query parameter', async () => {
      const request = createMockRequest('http://localhost:3000/api/users/search?q=')
      
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data).toHaveLength(0)
    })

    it('should return empty array for whitespace-only query', async () => {
      const request = createMockRequest('http://localhost:3000/api/users/search?q=%20%20%20')
      
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data).toHaveLength(0)
    })

    it('should be case insensitive', async () => {
      const request = createMockRequest('http://localhost:3000/api/users/search?q=MARIA')
      
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data).toHaveLength(1)
      expect(data[0].name).toBe('María González')
    })

    it('should handle special characters in search query', async () => {
      const request = createMockRequest('http://localhost:3000/api/users/search?q=González')
      
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data).toHaveLength(1)
      expect(data[0].name).toBe('María González')
    })

    it('should return correct data structure for each user', async () => {
      const request = createMockRequest('http://localhost:3000/api/users/search?q=María')
      
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveLength(1)
      
      const user = data[0]
      expect(user).toHaveProperty('id')
      expect(user).toHaveProperty('name')
      expect(user).toHaveProperty('username')
      expect(user).toHaveProperty('avatar')
      
      expect(typeof user.id).toBe('string')
      expect(typeof user.name).toBe('string')
      expect(typeof user.username).toBe('string')
      expect(user.avatar).toBeNull() // In mock data, avatar is null
    })

    it('should handle URL encoded query parameters', async () => {
      const request = createMockRequest('http://localhost:3000/api/users/search?q=Mar%C3%ADa')
      
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveLength(1)
      expect(data[0].name).toBe('María González')
    })

    it('should handle partial matches', async () => {
      const request = createMockRequest('http://localhost:3000/api/users/search?q=Riv')
      
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveLength(1)
      expect(data[0].name).toBe('Carlos Rivera')
    })
  })

  describe('Error handling', () => {
    it('should handle malformed URLs gracefully', async () => {
      // This test simulates what would happen with an invalid URL
      // In a real scenario, this would be handled by Next.js routing
      const request = createMockRequest('http://localhost:3000/api/users/search?q=test&invalid=%%')
      
      const response = await GET(request)
      
      // Should still work despite malformed additional parameters
      expect(response.status).toBe(200)
    })
  })
})