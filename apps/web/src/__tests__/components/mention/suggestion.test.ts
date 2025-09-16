import mentionSuggestion from '../../../components/mention/suggestion'

// Mock fetch
global.fetch = jest.fn()

// Mock ReactRenderer
jest.mock('@tiptap/react', () => ({
  ReactRenderer: jest.fn().mockImplementation(() => ({
    element: document.createElement('div'),
    destroy: jest.fn(),
    updateProps: jest.fn(),
    ref: {
      onKeyDown: jest.fn(() => true),
    },
  })),
}))

// Mock @floating-ui/dom
jest.mock('@floating-ui/dom', () => ({
  computePosition: jest.fn(() => 
    Promise.resolve({ x: 100, y: 200, strategy: 'absolute' })
  ),
  flip: jest.fn(),
  shift: jest.fn(),
}))

describe('mentionSuggestion', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    
    // Reset fetch mock
    ;(global.fetch as jest.Mock).mockClear()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
    
    // Clear any cached results
    const userSearchCache = (mentionSuggestion as any).userSearchCache
    if (userSearchCache) {
      userSearchCache.clear()
    }
  })

  describe('Configuration', () => {
    it('should have correct character configuration', () => {
      expect(mentionSuggestion.char).toBe('@')
      expect(mentionSuggestion.allowedPrefixes).toEqual([' ', '\n'])
      expect(mentionSuggestion.startOfLine).toBe(false)
      expect(mentionSuggestion.decorationClass).toBe('suggestion')
    })
  })

  describe('Items function', () => {
    it('should return empty array for empty query', async () => {
      const result = await mentionSuggestion.items({ query: '' })
      expect(result).toEqual([])
    })

    it('should return empty array for whitespace query', async () => {
      const result = await mentionSuggestion.items({ query: '   ' })
      expect(result).toEqual([])
    })

    it('should make API call for valid query', async () => {
      const mockUsers = [
        { id: '1', name: 'John Doe', username: 'johndoe', avatar: null }
      ]
      
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUsers),
      })

      const result = await mentionSuggestion.items({ query: 'john' })

      expect(global.fetch).toHaveBeenCalledWith('/api/users/search?q=john')
    })

    it('should handle API errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      })

      const result = await mentionSuggestion.items({ query: 'test' })

      expect(result).toEqual([])
      expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch users:', 'Not Found')

      consoleSpy.mockRestore()
    })

    it('should handle fetch exceptions', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      const result = await mentionSuggestion.items({ query: 'test' })

      expect(result).toEqual([])
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching users:', expect.any(Error))

      consoleSpy.mockRestore()
    })

    it('should use cached results when available', async () => {
      const mockUsers = [
        { id: '1', name: 'John Doe', username: 'johndoe', avatar: null }
      ]
      
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUsers),
      })

      // First call should fetch from API
      await mentionSuggestion.items({ query: 'john' })
      
      // Clear the fetch mock
      ;(global.fetch as jest.Mock).mockClear()
      
      // Second call should use cache
      const result = await mentionSuggestion.items({ query: 'john' })
      
      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('should encode query parameters correctly', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      })

      await mentionSuggestion.items({ query: 'test@example.com' })

      expect(global.fetch).toHaveBeenCalledWith('/api/users/search?q=test%40example.com')
    })
  })

  describe('Render function', () => {
    it('should return object with lifecycle methods', () => {
      const render = mentionSuggestion.render()

      expect(render).toHaveProperty('onStart')
      expect(render).toHaveProperty('onUpdate')
      expect(render).toHaveProperty('onKeyDown')
      expect(render).toHaveProperty('onExit')
      expect(typeof render.onStart).toBe('function')
      expect(typeof render.onUpdate).toBe('function')
      expect(typeof render.onKeyDown).toBe('function')
      expect(typeof render.onExit).toBe('function')
    })
  })

  describe('Lifecycle methods', () => {
    let render: ReturnType<typeof mentionSuggestion.render>
    let mockProps: any

    beforeEach(() => {
      render = mentionSuggestion.render()
      mockProps = {
        editor: { view: {} },
        clientRect: { x: 0, y: 0, width: 100, height: 20 },
        items: [],
        command: jest.fn(),
      }

      // Mock document.body.appendChild
      jest.spyOn(document.body, 'appendChild').mockImplementation()
      jest.spyOn(document.body, 'removeChild').mockImplementation()
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    describe('onStart', () => {
      it('should create ReactRenderer and append to DOM', () => {
        render.onStart(mockProps)

        expect(document.body.appendChild).toHaveBeenCalled()
      })

      it('should handle missing clientRect', () => {
        const propsWithoutClientRect = { ...mockProps, clientRect: null }

        expect(() => render.onStart(propsWithoutClientRect)).not.toThrow()
      })

      it('should handle errors gracefully', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
        
        // Make ReactRenderer throw an error
        const { ReactRenderer } = require('@tiptap/react')
        ReactRenderer.mockImplementationOnce(() => {
          throw new Error('Test error')
        })

        render.onStart(mockProps)

        expect(consoleSpy).toHaveBeenCalledWith('Error starting mention suggestion:', expect.any(Error))

        consoleSpy.mockRestore()
      })
    })

    describe('onKeyDown', () => {
      beforeEach(() => {
        render.onStart(mockProps)
      })

      it('should handle Escape key', () => {
        const escapeEvent = { key: 'Escape' }
        
        const result = render.onKeyDown({ event: escapeEvent })

        expect(result).toBe(true)
      })

      it('should delegate other keys to component', () => {
        const arrowEvent = { key: 'ArrowDown' }
        
        const result = render.onKeyDown({ event: arrowEvent })

        expect(result).toBe(true) // Mock returns true
      })

      it('should handle errors in key handling', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
        
        // Make the component's onKeyDown throw an error
        const { ReactRenderer } = require('@tiptap/react')
        const mockInstance = ReactRenderer.mock.results[0].value
        mockInstance.ref.onKeyDown.mockImplementationOnce(() => {
          throw new Error('Key handling error')
        })

        const result = render.onKeyDown({ event: { key: 'ArrowDown' } })

        expect(result).toBe(false)
        expect(consoleSpy).toHaveBeenCalledWith('Error handling mention keydown:', expect.any(Error))

        consoleSpy.mockRestore()
      })

      it('should return false when component is not visible', () => {
        render.onExit() // This sets isVisible to false
        
        const result = render.onKeyDown({ event: { key: 'ArrowDown' } })

        expect(result).toBe(false)
      })
    })

    describe('onUpdate', () => {
      beforeEach(() => {
        render.onStart(mockProps)
      })

      it('should update component props when visible', () => {
        const updateProps = { ...mockProps, items: [{ id: '1', name: 'New User' }] }
        
        render.onUpdate(updateProps)

        const { ReactRenderer } = require('@tiptap/react')
        const mockInstance = ReactRenderer.mock.results[0].value
        expect(mockInstance.updateProps).toHaveBeenCalledWith(updateProps)
      })

      it('should handle missing clientRect in update', () => {
        const propsWithoutClientRect = { ...mockProps, clientRect: null }

        expect(() => render.onUpdate(propsWithoutClientRect)).not.toThrow()
      })

      it('should handle errors in update', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
        
        // Make updateProps throw an error
        const { ReactRenderer } = require('@tiptap/react')
        const mockInstance = ReactRenderer.mock.results[0].value
        mockInstance.updateProps.mockImplementationOnce(() => {
          throw new Error('Update error')
        })

        render.onUpdate(mockProps)

        expect(consoleSpy).toHaveBeenCalledWith('Error updating mention suggestion:', expect.any(Error))

        consoleSpy.mockRestore()
      })
    })

    describe('onExit', () => {
      beforeEach(() => {
        render.onStart(mockProps)
      })

      it('should clean up DOM and destroy component', () => {
        render.onExit()

        expect(document.body.removeChild).toHaveBeenCalled()
        
        const { ReactRenderer } = require('@tiptap/react')
        const mockInstance = ReactRenderer.mock.results[0].value
        expect(mockInstance.destroy).toHaveBeenCalled()
      })

      it('should handle cleanup errors', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
        
        // Make destroy throw an error
        const { ReactRenderer } = require('@tiptap/react')
        const mockInstance = ReactRenderer.mock.results[0].value
        mockInstance.destroy.mockImplementationOnce(() => {
          throw new Error('Cleanup error')
        })

        render.onExit()

        expect(consoleSpy).toHaveBeenCalledWith('Error cleaning up mention suggestion:', expect.any(Error))

        consoleSpy.mockRestore()
      })
    })
  })
})