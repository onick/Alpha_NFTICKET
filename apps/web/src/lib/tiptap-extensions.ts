import { Mark, mergeAttributes } from '@tiptap/core'

// Custom hashtag extension
export const Hashtag = Mark.create({
  name: 'hashtag',

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'text-brand-400 hover:text-brand-300 cursor-pointer font-medium',
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-hashtag]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-hashtag': '' }), 0]
  },

  addCommands() {
    return {
      setHashtag: (attributes) => ({ commands }) => {
        return commands.setMark(this.name, attributes)
      },
      toggleHashtag: (attributes) => ({ commands }) => {
        return commands.toggleMark(this.name, attributes)
      },
      unsetHashtag: () => ({ commands }) => {
        return commands.unsetMark(this.name)
      },
    }
  },
})

// Auto-detect and style hashtags and mentions
export const AutoFormatter = {
  name: 'autoFormatter',
  
  addProseMirrorPlugins() {
    return []
  },

  addInputRules() {
    return [
      // Hashtag rule
      {
        find: /#[\w\u00c0-\u024f\u1e00-\u1eff]+/g,
        handler: ({ state, range, match }) => {
          const { from, to } = range
          const tr = state.tr

          // Apply hashtag mark
          tr.addMark(from, to, state.schema.marks.hashtag.create())
          
          return tr
        },
      },
    ]
  },
}

// Helper function to extract hashtags from content
export const extractHashtags = (content: string): string[] => {
  const hashtagRegex = /#[\w\u00c0-\u024f\u1e00-\u1eff]+/g
  const matches = content.match(hashtagRegex) || []
  return matches.map(tag => tag.slice(1)) // Remove the # symbol
}

// Helper function to extract mentions from content  
export const extractMentions = (content: string): string[] => {
  const mentionRegex = /@[\w\u00c0-\u024f\u1e00-\u1eff]+/g
  const matches = content.match(mentionRegex) || []
  return matches.map(mention => mention.slice(1)) // Remove the @ symbol
}

// Helper function to convert HTML content to plain text for character counting
export const getPlainTextLength = (htmlContent: string): number => {
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = htmlContent
  return tempDiv.textContent?.length || 0
}