import { Mark, mergeAttributes } from '@tiptap/core'

export interface HashtagOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    hashtag: {
      /**
       * Set a hashtag mark
       */
      setHashtag: (attributes?: { hashtag: string }) => ReturnType
      /**
       * Toggle a hashtag mark
       */
      toggleHashtag: (attributes?: { hashtag: string }) => ReturnType
      /**
       * Unset a hashtag mark
       */
      unsetHashtag: () => ReturnType
    }
  }
}

export const Hashtag = Mark.create<HashtagOptions>({
  name: 'hashtag',

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'hashtag'
      },
    }
  },

  addAttributes() {
    return {
      hashtag: {
        default: null,
        parseHTML: element => element.getAttribute('data-hashtag'),
        renderHTML: attributes => {
          if (!attributes.hashtag) {
            return {}
          }

          return {
            'data-hashtag': attributes.hashtag,
          }
        },
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
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setHashtag:
        attributes =>
        ({ commands }) => {
          return commands.setMark(this.name, attributes)
        },
      toggleHashtag:
        attributes =>
        ({ commands }) => {
          return commands.toggleMark(this.name, attributes)
        },
      unsetHashtag:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name)
        },
    }
  },

  addInputRules() {
    return []
  },

  addPasteRules() {
    return []
  },
})

export default Hashtag