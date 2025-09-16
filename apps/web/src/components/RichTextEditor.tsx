'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Mention from '@tiptap/extension-mention'
import CharacterCount from '@tiptap/extension-character-count'
import Placeholder from '@tiptap/extension-placeholder'
import { forwardRef, useImperativeHandle } from 'react'
import { Camera, Image as ImageIcon, MapPin, Smile } from 'lucide-react'
import tippy from 'tippy.js'
import 'tippy.js/dist/tippy.css'

interface RichTextEditorProps {
  placeholder?: string
  maxLength?: number
  onUpdate?: (content: string) => void
  onKeyDown?: (event: KeyboardEvent) => boolean
  className?: string
}

export interface RichTextEditorRef {
  getContent: () => string
  setContent: (content: string) => void
  focus: () => void
  getCharacterCount: () => number
}

const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(({
  placeholder = "¿Qué está pasando? Comparte tu experiencia en eventos...",
  maxLength = 280,
  onUpdate,
  onKeyDown,
  className = ""
}, ref) => {
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
      CharacterCount.configure({
        limit: maxLength,
      }),
      Mention.configure({
        HTMLAttributes: {
          class: 'text-brand-400 hover:text-brand-300 cursor-pointer font-medium',
        },
        suggestion: {
          items: ({ query }) => {
            // Mock user data - in real app this would be an API call
            const users = [
              { id: '1', name: 'María González', username: 'mariag_music' },
              { id: '2', name: 'Carlos Rivera', username: 'carlostech' },
              { id: '3', name: 'Ana Herrera', username: 'ana_events' },
              { id: '4', name: 'Luis Martinez', username: 'luisdjrd' },
              { id: '5', name: 'Sofia Ramirez', username: 'sofia_art' },
            ]
            
            return users
              .filter(user => 
                user.name.toLowerCase().includes(query.toLowerCase()) ||
                user.username.toLowerCase().includes(query.toLowerCase())
              )
              .slice(0, 5)
          },
          render: () => {
            let component: any
            let popup: any

            return {
              onStart: (props: any) => {
                component = new MentionList({
                  props,
                  editor: props.editor,
                })

                if (!props.clientRect) {
                  return
                }

                popup = tippy(document.body, {
                  getReferenceClientRect: props.clientRect,
                  appendTo: () => document.body,
                  content: component.element,
                  showOnCreate: true,
                  interactive: true,
                  trigger: 'manual',
                  placement: 'bottom-start',
                  theme: 'dark',
                  animation: 'fade',
                })
              },

              onUpdate(props: any) {
                component.updateProps(props)

                if (!props.clientRect) {
                  return
                }

                popup.setProps({
                  getReferenceClientRect: props.clientRect,
                })
              },

              onKeyDown(props: any) {
                if (props.event.key === 'Escape') {
                  popup.hide()
                  return true
                }

                return component.onKeyDown(props)
              },

              onExit() {
                popup.destroy()
                component.destroy()
              },
            }
          },
        },
      }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      const content = editor.getHTML()
      onUpdate?.(content)
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[60px] max-h-[200px] overflow-y-auto text-white ${className}`,
      },
      handleKeyDown: (view, event) => {
        if (onKeyDown) {
          return onKeyDown(event)
        }
        return false
      },
    },
  })

  useImperativeHandle(ref, () => ({
    getContent: () => editor?.getHTML() || '',
    setContent: (content: string) => editor?.commands.setContent(content),
    focus: () => editor?.commands.focus(),
    getCharacterCount: () => editor?.storage.characterCount.characters() || 0,
  }))

  if (!editor) {
    return null
  }

  const characterCount = editor.storage.characterCount.characters()
  const isNearLimit = characterCount > maxLength * 0.8
  const isOverLimit = characterCount > maxLength

  return (
    <div className="space-y-3">
      {/* Editor Content */}
      <div className="relative">
        <EditorContent 
          editor={editor} 
          className="w-full bg-transparent text-white placeholder-gray-400 resize-none border-none outline-none text-lg leading-relaxed"
        />
      </div>

      {/* Toolbar and Character Counter */}
      <div className="flex items-center justify-between pt-3 border-t border-[#404249]/50">
        <div className="flex items-center space-x-4">
          <button 
            type="button"
            className="text-brand-400 hover:text-brand-300 hover:bg-brand-400/10 p-2 rounded-full transition-all duration-200"
            title="Agregar imagen"
          >
            <ImageIcon size={20} />
          </button>
          <button 
            type="button"
            className="text-brand-400 hover:text-brand-300 hover:bg-brand-400/10 p-2 rounded-full transition-all duration-200"
            title="Tomar foto"
          >
            <Camera size={20} />
          </button>
          <button 
            type="button"
            className="text-brand-400 hover:text-brand-300 hover:bg-brand-400/10 p-2 rounded-full transition-all duration-200"
            title="Agregar ubicación"
          >
            <MapPin size={20} />
          </button>
          <button 
            type="button"
            className="text-brand-400 hover:text-brand-300 hover:bg-brand-400/10 p-2 rounded-full transition-all duration-200"
            title="Agregar emoji"
          >
            <Smile size={20} />
          </button>
        </div>
        
        {/* Character Counter */}
        <div className="flex items-center space-x-3">
          <div className={`text-xs ${
            isOverLimit ? 'text-red-400' : 
            isNearLimit ? 'text-yellow-400' : 
            'text-gray-400'
          }`}>
            {characterCount}/{maxLength}
          </div>
          {characterCount > 0 && (
            <div className="w-6 h-6 relative">
              <svg className="w-6 h-6 transform -rotate-90" viewBox="0 0 24 24">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className="text-gray-600"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className={
                    isOverLimit ? 'text-red-400' : 
                    isNearLimit ? 'text-yellow-400' : 
                    'text-brand-400'
                  }
                  strokeDasharray={`${2 * Math.PI * 10}`}
                  strokeDashoffset={`${2 * Math.PI * 10 * (1 - Math.min(characterCount / maxLength, 1))}`}
                  strokeLinecap="round"
                />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

RichTextEditor.displayName = 'RichTextEditor'

// Mock mention list component (simplified version)
class MentionList {
  items: any[]
  command: any
  editor: any
  element: HTMLElement
  selectedIndex: number

  constructor({ props, editor }: any) {
    this.items = props.items
    this.command = props.command
    this.editor = editor
    this.selectedIndex = 0

    this.element = document.createElement('div')
    this.element.className = 'bg-[#313338] border border-[#404249] rounded-lg shadow-lg max-h-48 overflow-y-auto'
    
    this.renderItems()
  }

  renderItems() {
    this.element.innerHTML = this.items
      .map((item: any, index: number) => `
        <div class="flex items-center space-x-3 px-3 py-2 cursor-pointer hover:bg-[#404249] ${
          index === this.selectedIndex ? 'bg-[#404249]' : ''
        }" data-index="${index}">
          <div class="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center">
            <span class="text-white text-sm font-bold">${item.name.charAt(0)}</span>
          </div>
          <div>
            <div class="text-white text-sm font-medium">${item.name}</div>
            <div class="text-gray-400 text-xs">@${item.username}</div>
          </div>
        </div>
      `)
      .join('')

    // Add click handlers
    this.element.addEventListener('click', (e) => {
      const target = e.target as HTMLElement
      const itemElement = target.closest('[data-index]') as HTMLElement
      if (itemElement) {
        const index = parseInt(itemElement.dataset.index || '0')
        this.selectItem(index)
      }
    })
  }

  updateProps(props: any) {
    this.items = props.items
    this.command = props.command
    this.renderItems()
  }

  onKeyDown({ event }: any) {
    if (event.key === 'ArrowUp') {
      this.upHandler()
      return true
    }

    if (event.key === 'ArrowDown') {
      this.downHandler()
      return true
    }

    if (event.key === 'Enter') {
      this.enterHandler()
      return true
    }

    return false
  }

  upHandler() {
    this.selectedIndex = (this.selectedIndex + this.items.length - 1) % this.items.length
    this.renderItems()
  }

  downHandler() {
    this.selectedIndex = (this.selectedIndex + 1) % this.items.length
    this.renderItems()
  }

  enterHandler() {
    this.selectItem(this.selectedIndex)
  }

  selectItem(index: number) {
    const item = this.items[index]
    if (item) {
      this.command({ id: item.id, label: item.username })
    }
  }

  destroy() {
    this.element.remove()
  }
}

// Tippy integration is now handled by the imported library

export default RichTextEditor