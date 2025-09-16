import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

export interface HashtagPluginOptions {
  hashtagClass: string
}

export const hashtagPluginKey = new PluginKey('hashtag-plugin')

export function createHashtagPlugin(options: HashtagPluginOptions) {
  return new Plugin({
    key: hashtagPluginKey,
    
    props: {
      decorations(state) {
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
              class: options.hashtagClass,
              'data-hashtag': match[0].substring(1), // Remove the # symbol
            })
            
            decorations.push(decoration)
          }
        })
        
        return DecorationSet.create(state.doc, decorations)
      },
    },
  })
}