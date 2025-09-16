import HashtagExtension from '../../../components/extensions/hashtag-extension'

// Mock TipTap core
jest.mock('@tiptap/core', () => ({
  Extension: {
    create: jest.fn((config) => {
      const extension = {
        name: config.name,
        addOptions: config.addOptions,
        addProseMirrorPlugins: config.addProseMirrorPlugins,
        addGlobalAttributes: config.addGlobalAttributes,
        configure: jest.fn((options) => ({ ...extension, options })),
      }
      return extension
    }),
  },
}))

// Mock ProseMirror
jest.mock('@tiptap/pm/state', () => ({
  Plugin: jest.fn().mockImplementation((config) => config),
  PluginKey: jest.fn().mockImplementation((name) => ({ key: name })),
}))

jest.mock('@tiptap/pm/view', () => ({
  Decoration: {
    inline: jest.fn((start, end, attrs) => ({ start, end, attrs, type: 'inline' })),
  },
  DecorationSet: {
    create: jest.fn((doc, decorations) => ({ doc, decorations })),
  },
}))

describe('HashtagExtension', () => {
  let extension: any

  beforeEach(() => {
    extension = HashtagExtension
  })

  describe('Extension configuration', () => {
    it('should have correct name', () => {
      expect(extension.name).toBe('hashtagExtension')
    })

    it('should have default options', () => {
      const defaultOptions = extension.addOptions()
      
      expect(defaultOptions).toEqual({
        hashtagClass: 'hashtag text-brand-400 hover:text-brand-300 cursor-pointer font-medium',
      })
    })

    it('should allow custom options', () => {
      const customOptions = { hashtagClass: 'custom-hashtag-class' }
      const configuredExtension = extension.configure(customOptions)
      
      expect(configuredExtension.options).toEqual(customOptions)
    })
  })

  describe('ProseMirror plugin', () => {
    it('should create plugin with correct key', () => {
      const { Plugin, PluginKey } = require('@tiptap/pm/state')
      
      extension.addProseMirrorPlugins()
      
      expect(PluginKey).toHaveBeenCalledWith('hashtag-highlight')
      expect(Plugin).toHaveBeenCalled()
    })

    it('should create decorations for hashtags in text', () => {
      const { Decoration, DecorationSet } = require('@tiptap/pm/view')
      
      // Mock document structure
      const mockNode = {
        isText: true,
        text: 'This is a #hashtag and another #example',
      }
      
      const mockDoc = {
        descendants: jest.fn((callback) => {
          callback(mockNode, 10) // position 10
        }),
      }
      
      const mockState = { doc: mockDoc }
      
      const plugins = extension.addProseMirrorPlugins()
      const plugin = plugins[0]
      
      // Execute the decorations function
      const result = plugin.props.decorations(mockState)
      
      expect(Decoration.inline).toHaveBeenCalledWith(
        20, // position 10 + match index 10
        28, // position 10 + match index 10 + length 8
        {
          class: 'hashtag text-brand-400 hover:text-brand-300 cursor-pointer font-medium',
          'data-hashtag': 'hashtag',
        }
      )
      
      expect(Decoration.inline).toHaveBeenCalledWith(
        45, // position 10 + match index 35
        53, // position 10 + match index 35 + length 8
        {
          class: 'hashtag text-brand-400 hover:text-brand-300 cursor-pointer font-medium',
          'data-hashtag': 'example',
        }
      )
      
      expect(DecorationSet.create).toHaveBeenCalledWith(
        mockDoc,
        expect.arrayContaining([
          expect.objectContaining({ type: 'inline' }),
          expect.objectContaining({ type: 'inline' }),
        ])
      )
    })

    it('should handle text without hashtags', () => {
      const { Decoration, DecorationSet } = require('@tiptap/pm/view')
      
      const mockNode = {
        isText: true,
        text: 'This text has no hashtags',
      }
      
      const mockDoc = {
        descendants: jest.fn((callback) => {
          callback(mockNode, 0)
        }),
      }
      
      const mockState = { doc: mockDoc }
      
      const plugins = extension.addProseMirrorPlugins()
      const plugin = plugins[0]
      
      plugin.props.decorations(mockState)
      
      expect(DecorationSet.create).toHaveBeenCalledWith(
        mockDoc,
        []
      )
    })

    it('should skip non-text nodes', () => {
      const { Decoration, DecorationSet } = require('@tiptap/pm/view')
      
      const mockNode = {
        isText: false,
        text: '#hashtag',
      }
      
      const mockDoc = {
        descendants: jest.fn((callback) => {
          callback(mockNode, 0)
        }),
      }
      
      const mockState = { doc: mockDoc }
      
      const plugins = extension.addProseMirrorPlugins()
      const plugin = plugins[0]
      
      plugin.props.decorations(mockState)
      
      expect(Decoration.inline).not.toHaveBeenCalled()
      expect(DecorationSet.create).toHaveBeenCalledWith(mockDoc, [])
    })

    it('should handle hashtags with special characters', () => {
      const { Decoration } = require('@tiptap/pm/view')
      
      const mockNode = {
        isText: true,
        text: 'Check #español #café #naïve',
      }
      
      const mockDoc = {
        descendants: jest.fn((callback) => {
          callback(mockNode, 0)
        }),
      }
      
      const mockState = { doc: mockDoc }
      
      const plugins = extension.addProseMirrorPlugins()
      const plugin = plugins[0]
      
      plugin.props.decorations(mockState)
      
      // Should match hashtags with accented characters
      expect(Decoration.inline).toHaveBeenCalledWith(
        6, 14, // #español
        expect.objectContaining({
          'data-hashtag': 'español',
        })
      )
      
      expect(Decoration.inline).toHaveBeenCalledWith(
        15, 20, // #café
        expect.objectContaining({
          'data-hashtag': 'café',
        })
      )
      
      expect(Decoration.inline).toHaveBeenCalledWith(
        21, 27, // #naïve
        expect.objectContaining({
          'data-hashtag': 'naïve',
        })
      )
    })

    it('should handle empty or null text', () => {
      const { DecorationSet } = require('@tiptap/pm/view')
      
      const mockNode = {
        isText: true,
        text: null,
      }
      
      const mockDoc = {
        descendants: jest.fn((callback) => {
          callback(mockNode, 0)
        }),
      }
      
      const mockState = { doc: mockDoc }
      
      const plugins = extension.addProseMirrorPlugins()
      const plugin = plugins[0]
      
      expect(() => plugin.props.decorations(mockState)).not.toThrow()
      expect(DecorationSet.create).toHaveBeenCalledWith(mockDoc, [])
    })
  })

  describe('Global attributes', () => {
    it('should add hashtag attributes to textStyle', () => {
      const globalAttributes = extension.addGlobalAttributes()
      
      expect(globalAttributes).toHaveLength(1)
      expect(globalAttributes[0].types).toEqual(['textStyle'])
      expect(globalAttributes[0].attributes).toHaveProperty('hashtag')
    })

    it('should parse hashtag attribute from HTML', () => {
      const globalAttributes = extension.addGlobalAttributes()
      const hashtagAttribute = globalAttributes[0].attributes.hashtag
      
      const mockElement = {
        getAttribute: jest.fn(() => 'testhashtag'),
      }
      
      const parsedValue = hashtagAttribute.parseHTML(mockElement)
      
      expect(mockElement.getAttribute).toHaveBeenCalledWith('data-hashtag')
      expect(parsedValue).toBe('testhashtag')
    })

    it('should render hashtag attribute to HTML', () => {
      const globalAttributes = extension.addGlobalAttributes()
      const hashtagAttribute = globalAttributes[0].attributes.hashtag
      
      const attributesWithHashtag = { hashtag: 'myhashtag' }
      const result = hashtagAttribute.renderHTML(attributesWithHashtag)
      
      expect(result).toEqual({
        'data-hashtag': 'myhashtag',
      })
    })

    it('should return empty object when no hashtag attribute', () => {
      const globalAttributes = extension.addGlobalAttributes()
      const hashtagAttribute = globalAttributes[0].attributes.hashtag
      
      const attributesWithoutHashtag = { otherAttribute: 'value' }
      const result = hashtagAttribute.renderHTML(attributesWithoutHashtag)
      
      expect(result).toEqual({})
    })

    it('should have default null value', () => {
      const globalAttributes = extension.addGlobalAttributes()
      const hashtagAttribute = globalAttributes[0].attributes.hashtag
      
      expect(hashtagAttribute.default).toBeNull()
    })
  })

  describe('Hashtag regex patterns', () => {
    it('should match basic hashtags', () => {
      const hashtagRegex = /#[\w\u00c0-\u024f\u1e00-\u1eff]+/g
      
      const text = 'Check out #awesome #event'
      const matches = text.match(hashtagRegex)
      
      expect(matches).toEqual(['#awesome', '#event'])
    })

    it('should match hashtags with numbers', () => {
      const hashtagRegex = /#[\w\u00c0-\u024f\u1e00-\u1eff]+/g
      
      const text = 'Event #2024 and #web3'
      const matches = text.match(hashtagRegex)
      
      expect(matches).toEqual(['#2024', '#web3'])
    })

    it('should match hashtags with underscores', () => {
      const hashtagRegex = /#[\w\u00c0-\u024f\u1e00-\u1eff]+/g
      
      const text = 'Follow #my_event and #test_case'
      const matches = text.match(hashtagRegex)
      
      expect(matches).toEqual(['#my_event', '#test_case'])
    })

    it('should not match hashtags with spaces', () => {
      const hashtagRegex = /#[\w\u00c0-\u024f\u1e00-\u1eff]+/g
      
      const text = '#not valid #valid'
      const matches = text.match(hashtagRegex)
      
      expect(matches).toEqual(['#not', '#valid'])
    })

    it('should not match hashtags with special symbols', () => {
      const hashtagRegex = /#[\w\u00c0-\u024f\u1e00-\u1eff]+/g
      
      const text = '#test@symbol #valid'
      const matches = text.match(hashtagRegex)
      
      expect(matches).toEqual(['#test', '#valid'])
    })
  })
})