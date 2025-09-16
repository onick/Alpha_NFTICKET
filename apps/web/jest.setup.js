import '@testing-library/jest-dom'
import 'whatwg-fetch'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '/',
}))

// Mock Next.js Response and Request
global.Response = Response
global.Request = Request

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => {
      const response = new Response(JSON.stringify(data), {
        status: init?.status || 200,
        headers: {
          'content-type': 'application/json',
          ...init?.headers,
        },
      })
      
      // Add json method to response
      response.json = jest.fn(() => Promise.resolve(data))
      return response
    }),
  },
  NextRequest: class NextRequest extends Request {
    constructor(input, init) {
      super(input, init)
      this.nextUrl = new URL(input)
    }
  },
}))

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock fetch
global.fetch = jest.fn()

// Mock URL constructor
global.URL = URL

// Mock DOM methods - enhance existing document
const originalCreateElement = document.createElement.bind(document)
document.createElement = jest.fn().mockImplementation((tagName) => {
  const element = originalCreateElement(tagName)
  
  // Add common properties and methods that tests might need
  element.click = jest.fn()
  element.addEventListener = jest.fn()
  element.removeEventListener = jest.fn()
  element.setAttribute = jest.fn()
  element.getAttribute = jest.fn()
  element.style = {}
  
  return element
})

// Mock document.body methods
document.body.appendChild = jest.fn()
document.body.removeChild = jest.fn()

// Mock DOMParser for tiptap-helpers
global.DOMParser = class DOMParser {
  parseFromString(htmlString) {
    const mockElement = {
      innerHTML: htmlString,
      textContent: htmlString.replace(/<[^>]*>/g, ''),
      querySelectorAll: jest.fn(() => []),
    }
    
    return {
      body: mockElement,
      querySelectorAll: jest.fn(() => []),
    }
  }
}