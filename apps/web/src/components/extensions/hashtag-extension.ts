import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

export interface HashtagExtensionOptions {
  hashtagClass: string
}

export const HashtagExtension = Extension.create<HashtagExtensionOptions>({
  name: 'hashtagExtension',

  addOptions() {
    return {
      hashtagClass: 'hashtag text-brand-400 hover:text-brand-300 cursor-pointer font-medium',
    }
  },

  addProseMirrorPlugins() {
    const { hashtagClass } = this.options
    
    return [
      new Plugin({
        key: new PluginKey('hashtag-highlight'),
        
        props: {
          decorations: (state) => {
            const decorations: Decoration[] = []
            const hashtagRegex = /#[\w\u00c0-\u024f\u1e00-\u1eff]+/g
            
            state.doc.descendants((node, pos) => {
              if (!node.isText) return
              
              const text = node.text || ''
              let match
              
              while ((match = hashtagRegex.exec(text)) !== null) {
                const start = pos + match.index
                const end = start + match[0].length
                
                const decoration = Decoration.inline(start, end, {
                  class: hashtagClass,
                  'data-hashtag': match[0].substring(1), // Store without # symbol
                })
                
                decorations.push(decoration)
              }
            })
            
            return DecorationSet.create(state.doc, decorations)
          },
        },
      }),
    ]
  },

  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
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
        },
      },
    ]
  },
})

export default HashtagExtension