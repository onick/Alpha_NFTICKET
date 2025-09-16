import { Mark, mergeAttributes } from '@tiptap/core'

export interface HashtagOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    hashtag: {
      setHashtag: (attributes?: { hashtag: string }) => ReturnType
      toggleHashtag: (attributes?: { hashtag: string }) => ReturnType
      unsetHashtag: () => ReturnType
    }
  }
}

export const HashtagExtension = Mark.create<HashtagOptions>({
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
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-hashtag': '',
      }),
      0,
    ]
  },

  addCommands() {
    return {
      setHashtag:
        (attributes) =>
        ({ commands }) => {
          return commands.setMark(this.name, attributes)
        },
      toggleHashtag:
        (attributes) =>
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

  // Removed addInputRules for now to prevent runtime issues
  // We'll handle hashtag styling via CSS classes instead
})

export default HashtagExtension