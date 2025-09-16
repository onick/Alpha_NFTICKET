'use client'

import { forwardRef, useImperativeHandle, useState, useRef } from 'react'
import { Camera, Image as ImageIcon, MapPin, Smile } from 'lucide-react'

interface SimpleRichTextEditorProps {
  placeholder?: string
  maxLength?: number
  onUpdate?: (content: string) => void
  onKeyDown?: (event: KeyboardEvent) => boolean
  className?: string
}

export interface SimpleRichTextEditorRef {
  getContent: () => string
  setContent: (content: string) => void
  focus: () => void
  getCharacterCount: () => number
}

const SimpleRichTextEditor = forwardRef<SimpleRichTextEditorRef, SimpleRichTextEditorProps>(({
  placeholder = "¿Qué está pasando? Comparte tu experiencia en eventos...",
  maxLength = 280,
  onUpdate,
  onKeyDown,
  className = ""
}, ref) => {
  
  const [content, setContent] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useImperativeHandle(ref, () => ({
    getContent: () => content,
    setContent: (newContent: string) => setContent(newContent),
    focus: () => textareaRef.current?.focus(),
    getCharacterCount: () => content.length,
  }))

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setContent(newContent)
    onUpdate?.(newContent)
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (onKeyDown) {
      const preventDefault = onKeyDown(e.nativeEvent)
      if (preventDefault) {
        e.preventDefault()
      }
    }
  }

  const characterCount = content.length
  const isNearLimit = characterCount > maxLength * 0.8
  const isOverLimit = characterCount > maxLength

  return (
    <div className="space-y-3">
      {/* Editor Content */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full bg-transparent text-white placeholder-gray-400 resize-none border-none outline-none text-lg leading-relaxed min-h-[60px] max-h-[200px] ${className}`}
          style={{ 
            fontFamily: 'inherit',
            lineHeight: '1.5',
            scrollbarWidth: 'thin',
            scrollbarColor: '#404249 transparent'
          }}
          spellCheck="true"
          autoComplete="off"
          autoCorrect="on"
          autoCapitalize="sentences"
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

SimpleRichTextEditor.displayName = 'SimpleRichTextEditor'

export default SimpleRichTextEditor