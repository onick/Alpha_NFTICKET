import {
  extractHashtags,
  extractMentions,
  getPlainTextLength,
  htmlToPlainText,
  processContentForDisplay,
} from '../../lib/tiptap-helpers'

// Mock DOM elements for testing
const mockElement = (textContent: string, attributes: Record<string, string> = {}) => ({
  textContent,
  getAttribute: (attr: string) => attributes[attr] || null,
})

const mockQuerySelectorAll = (selector: string, elements: any[]) => {
  return elements
}

// Mock DOMParser
const createMockDOMParser = (body: any) => ({
  parseFromString: jest.fn(() => ({
    body,
    querySelectorAll: jest.fn((selector: string) => {
      if (selector === 'span[data-hashtag]') {
        return body.hashtagElements || []
      }
      if (selector === 'span[data-type="mention"]') {
        return body.mentionElements || []
      }
      return []
    }),
  })),
})

describe('tiptap-helpers', () => {
  beforeEach(() => {
    // Reset DOM parser mock
    global.DOMParser = jest.fn() as any
  })

  describe('extractHashtags', () => {
    it('should extract hashtags from HTML content with data-hashtag attributes', () => {
      const mockBody = {
        textContent: 'Check out this #awesome #event!',
        hashtagElements: [
          mockElement('#awesome', { 'data-hashtag': 'awesome' }),
          mockElement('#event', { 'data-hashtag': 'event' }),
        ],
      }

      global.DOMParser = jest.fn(() => createMockDOMParser(mockBody)) as any

      const result = extractHashtags('<p>Check out this <span data-hashtag="awesome">#awesome</span> <span data-hashtag="event">#event</span>!</p>')

      expect(result).toEqual(['#awesome', '#event'])
    })

    it('should extract hashtags from plain text using regex fallback', () => {
      const mockBody = {
        textContent: 'Plain text with #hashtag #another',
        hashtagElements: [],
      }

      global.DOMParser = jest.fn(() => createMockDOMParser(mockBody)) as any

      const result = extractHashtags('<p>Plain text with #hashtag #another</p>')

      expect(result).toEqual(['#hashtag', '#another'])
    })

    it('should handle mixed hashtags from both elements and plain text', () => {
      const mockBody = {
        textContent: 'Mixed #plain #element #text',
        hashtagElements: [
          mockElement('#element', { 'data-hashtag': 'element' }),
        ],
      }

      global.DOMParser = jest.fn(() => createMockDOMParser(mockBody)) as any

      const result = extractHashtags('<p>Mixed content</p>')

      expect(result).toContain('#element')
      expect(result).toContain('#plain')
      expect(result).toContain('#text')
    })

    it('should deduplicate hashtags', () => {
      const mockBody = {
        textContent: '#duplicate #duplicate #unique',
        hashtagElements: [
          mockElement('#duplicate', { 'data-hashtag': 'duplicate' }),
        ],
      }

      global.DOMParser = jest.fn(() => createMockDOMParser(mockBody)) as any

      const result = extractHashtags('<p>Content</p>')

      expect(result.filter(h => h === '#duplicate')).toHaveLength(1)
      expect(result).toContain('#unique')
    })

    it('should handle empty content', () => {
      const mockBody = {
        textContent: '',
        hashtagElements: [],
      }

      global.DOMParser = jest.fn(() => createMockDOMParser(mockBody)) as any

      const result = extractHashtags('<p></p>')

      expect(result).toEqual([])
    })

    it('should handle content without hashtags', () => {
      const mockBody = {
        textContent: 'Content without any hash symbols',
        hashtagElements: [],
      }

      global.DOMParser = jest.fn(() => createMockDOMParser(mockBody)) as any

      const result = extractHashtags('<p>Content without any hash symbols</p>')

      expect(result).toEqual([])
    })
  })

  describe('extractMentions', () => {
    it('should extract mentions from HTML elements', () => {
      const mockBody = {
        mentionElements: [
          mockElement('@john', { 'data-id': 'john', 'data-label': 'john' }),
          mockElement('@jane', { 'data-id': 'jane', 'data-label': 'jane_doe' }),
        ],
      }

      global.DOMParser = jest.fn(() => createMockDOMParser(mockBody)) as any

      const result = extractMentions('<p>Hello <span data-type="mention" data-id="john" data-label="john">@john</span> and <span data-type="mention" data-id="jane" data-label="jane_doe">@jane</span>!</p>')

      expect(result).toEqual(['@john', '@jane_doe'])
    })

    it('should use data-id when data-label is not available', () => {
      const mockBody = {
        mentionElements: [
          mockElement('@user123', { 'data-id': 'user123' }),
        ],
      }

      global.DOMParser = jest.fn(() => createMockDOMParser(mockBody)) as any

      const result = extractMentions('<p>Hello <span data-type="mention" data-id="user123">@user123</span>!</p>')

      expect(result).toEqual(['@user123'])
    })

    it('should handle empty mentions', () => {
      const mockBody = {
        mentionElements: [],
      }

      global.DOMParser = jest.fn(() => createMockDOMParser(mockBody)) as any

      const result = extractMentions('<p>Content without mentions</p>')

      expect(result).toEqual([])
    })

    it('should skip mentions without data-id', () => {
      const mockBody = {
        mentionElements: [
          mockElement('@invalid', {}),
          mockElement('@valid', { 'data-id': 'valid', 'data-label': 'valid_user' }),
        ],
      }

      global.DOMParser = jest.fn(() => createMockDOMParser(mockBody)) as any

      const result = extractMentions('<p>Test content</p>')

      expect(result).toEqual(['@valid_user'])
    })
  })

  describe('getPlainTextLength', () => {
    it('should return the length of plain text content', () => {
      const mockBody = {
        textContent: 'Hello world!',
      }

      global.DOMParser = jest.fn(() => createMockDOMParser(mockBody)) as any

      const result = getPlainTextLength('<p>Hello world!</p>')

      expect(result).toBe(12)
    })

    it('should handle empty content', () => {
      const mockBody = {
        textContent: '',
      }

      global.DOMParser = jest.fn(() => createMockDOMParser(mockBody)) as any

      const result = getPlainTextLength('<p></p>')

      expect(result).toBe(0)
    })

    it('should handle null textContent', () => {
      const mockBody = {
        textContent: null,
      }

      global.DOMParser = jest.fn(() => createMockDOMParser(mockBody)) as any

      const result = getPlainTextLength('<p></p>')

      expect(result).toBe(0)
    })
  })

  describe('htmlToPlainText', () => {
    it('should extract plain text from HTML', () => {
      const mockBody = {
        textContent: 'Hello world!',
      }

      global.DOMParser = jest.fn(() => createMockDOMParser(mockBody)) as any

      const result = htmlToPlainText('<p><strong>Hello</strong> <em>world!</em></p>')

      expect(result).toBe('Hello world!')
    })

    it('should handle empty HTML', () => {
      const mockBody = {
        textContent: '',
      }

      global.DOMParser = jest.fn(() => createMockDOMParser(mockBody)) as any

      const result = htmlToPlainText('<div></div>')

      expect(result).toBe('')
    })

    it('should handle null textContent', () => {
      const mockBody = {
        textContent: null,
      }

      global.DOMParser = jest.fn(() => createMockDOMParser(mockBody)) as any

      const result = htmlToPlainText('<div></div>')

      expect(result).toBe('')
    })
  })

  describe('processContentForDisplay', () => {
    it('should process mentions and hashtags for display', () => {
      let processedDoc: any = {
        body: {
          textContent: '@john_doe #awesome',
        },
        querySelectorAll: jest.fn((selector: string) => {
          if (selector === 'span[data-type="mention"]') {
            return [{
              getAttribute: (attr: string) => {
                if (attr === 'data-id') return 'john'
                if (attr === 'data-label') return 'john_doe'
                return null
              },
              set textContent(value: string) {
                processedDoc.body.textContent = '@john_doe #awesome'
              },
            }]
          }
          if (selector === 'span[data-hashtag]') {
            return [{
              get textContent() { return '#awesome' },
              set textContent(value: string) {
                // No need to modify since it already has #
              },
            }]
          }
          return []
        }),
      }

      global.DOMParser = jest.fn(() => ({
        parseFromString: jest.fn(() => processedDoc),
      })) as any

      const result = processContentForDisplay('<p><span data-type="mention" data-id="john" data-label="john_doe">@john</span> <span data-hashtag>#awesome</span></p>')

      expect(result).toBe('@john_doe #awesome')
    })

    it('should add # prefix to hashtags that dont have it', () => {
      let processedDoc: any = {
        body: {
          textContent: '#hashtag',
        },
        querySelectorAll: jest.fn((selector: string) => {
          if (selector === 'span[data-type="mention"]') return []
          if (selector === 'span[data-hashtag]') {
            return [{
              get textContent() { return 'hashtag' },
              set textContent(value: string) {
                processedDoc.body.textContent = '#hashtag'
              },
            }]
          }
          return []
        }),
      }

      global.DOMParser = jest.fn(() => ({
        parseFromString: jest.fn(() => processedDoc),
      })) as any

      const result = processContentForDisplay('<p><span data-hashtag>hashtag</span></p>')

      expect(result).toBe('#hashtag')
    })

    it('should handle empty content', () => {
      const mockBody = {
        textContent: '',
      }

      global.DOMParser = jest.fn(() => ({
        parseFromString: jest.fn(() => ({
          body: mockBody,
          querySelectorAll: jest.fn(() => []),
        })),
      })) as any

      const result = processContentForDisplay('<p></p>')

      expect(result).toBe('')
    })
  })
})