'use client'

import React, { forwardRef, useImperativeHandle, useEffect, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Mention from '@tiptap/extension-mention'
import { Camera, Image as ImageIcon, MapPin, Smile } from 'lucide-react'
import mentionSuggestion from './mention/suggestion'

interface SimpleTipTapEditorProps {
  placeholder?: string
  maxLength?: number
  onUpdate?: (content: string) => void
  onKeyDown?: (event: KeyboardEvent) => boolean
  className?: string
}

export interface SimpleTipTapEditorRef {
  getContent: () => string
  setContent: (content: string) => void
  focus: () => void
  getCharacterCount: () => number
}

const SimpleTipTapEditor = forwardRef<SimpleTipTapEditorRef, SimpleTipTapEditorProps>(({
  placeholder = "¿Qué está pasando? Comparte tu experiencia en eventos...",
  maxLength = 280,
  onUpdate,
  onKeyDown,
  className = ""
}, ref) => {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

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
      Mention.configure({
        HTMLAttributes: {
          class: 'text-brand-400 hover:text-brand-300 cursor-pointer font-medium',
          'data-type': 'mention',
        },
        suggestion: mentionSuggestion,
      }),
    ],
    content: '',
    immediatelyRender: false,
    editable: true,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      console.log('Editor content updated:', html) // Debug log
      onUpdate?.(html)
    },
    editorProps: {
      handleKeyDown: (view, event) => {
        if (onKeyDown) {
          return onKeyDown(event)
        }
        return false
      },
      attributes: {
        class: `w-full bg-transparent text-white placeholder-gray-400 resize-none border-none outline-none text-lg leading-relaxed min-h-[60px] max-h-[200px] overflow-y-auto prose prose-invert prose-sm max-w-none focus:outline-none ${className}`,
        spellcheck: 'false',
      },
    },
  })

  useImperativeHandle(ref, () => ({
    getContent: () => {
      const content = editor?.getHTML() || ''
      console.log('Getting content:', content) // Debug log
      return content
    },
    setContent: (content: string) => {
      console.log('Setting content:', content) // Debug log
      editor?.commands.setContent(content)
    },
    focus: () => {
      editor?.commands.focus()
    },
    getCharacterCount: () => {
      if (!editor) return 0
      return editor.getText().length
    },
  }))

  if (!isClient) {
    return (
      <div className="space-y-3">
        <div className="w-full min-h-[60px] bg-transparent animate-pulse">
          <div className="h-6 bg-gray-600 rounded w-3/4"></div>
        </div>
        
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
          
          <div className="text-xs text-gray-400">
            0/{maxLength}
          </div>
        </div>
      </div>
    )
  }

  if (!editor) {
    return (
      <div className="w-full min-h-[60px] bg-transparent animate-pulse">
        <div className="h-6 bg-gray-600 rounded w-3/4"></div>
      </div>
    )
  }

  const characterCount = editor.getText().length
  const isNearLimit = characterCount > maxLength * 0.8
  const isOverLimit = characterCount > maxLength

  return (
    <div className="space-y-3">
      {/* Editor Content */}
      <div className="relative">
        <EditorContent 
          editor={editor} 
          className="w-full bg-transparent text-white placeholder-gray-400"
        />
        {characterCount === 0 && (
          <div className="absolute top-0 left-0 pointer-events-none text-gray-400 text-lg leading-relaxed">
            {placeholder}
          </div>
        )}
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

SimpleTipTapEditor.displayName = 'SimpleTipTapEditor'

export default SimpleTipTapEditor