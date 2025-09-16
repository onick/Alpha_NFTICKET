'use client'

import { forwardRef, useImperativeHandle, useEffect, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Mention from '@tiptap/extension-mention'
import { Camera, Image as ImageIcon, MapPin, Smile, X } from 'lucide-react'
import mentionSuggestion from './mention/suggestion'
import HashtagExtension from './extensions/hashtag-extension'
import { TipTapErrorBoundary } from './ErrorBoundary'

interface TipTapEditorProps {
  placeholder?: string
  maxLength?: number
  onUpdate?: (content: string) => void
  onKeyDown?: (event: KeyboardEvent) => boolean
  onImageUpload?: (file: File) => Promise<string>
  className?: string
}

export interface TipTapEditorRef {
  getContent: () => string
  setContent: (content: string) => void
  focus: () => void
  getCharacterCount: () => number
  getUploadedImages: () => string[]
  clearUploadedImages: () => void
}

const TipTapEditor = forwardRef<TipTapEditorRef, TipTapEditorProps>(({
  placeholder = "¿Qué está pasando? Comparte tu experiencia en eventos...",
  maxLength = 280,
  onUpdate,
  onKeyDown,
  onImageUpload,
  className = ""
}, ref) => {
  const [isClient, setIsClient] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    if (!onImageUpload) {
      console.warn('No image upload handler provided')
      return
    }

    if (!file.type.startsWith('image/')) {
      console.error('File is not an image')
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      console.error('Image file too large (max 5MB)')
      return
    }

    setUploadingImage(true)
    try {
      const imageUrl = await onImageUpload(file)
      setUploadedImages(prev => [...prev, imageUrl])
    } catch (error) {
      console.error('Image upload failed:', error)
    } finally {
      setUploadingImage(false)
    }
  }

  // Handle file selection
  const handleImageSelect = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        handleImageUpload(file)
      }
    }
    input.click()
  }

  // Remove uploaded image
  const removeImage = (indexToRemove: number) => {
    setUploadedImages(prev => prev.filter((_, index) => index !== indexToRemove))
  }

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
      HashtagExtension.configure({
        hashtagClass: 'hashtag text-brand-400 hover:text-brand-300 cursor-pointer font-medium',
      }),
    ],
    content: '',
    immediatelyRender: false,
    editable: true,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onUpdate?.(html)
    },
    editorProps: {
      attributes: {
        class: `w-full bg-transparent text-white placeholder-gray-400 resize-none border-none outline-none text-lg leading-relaxed min-h-[60px] max-h-[200px] overflow-y-auto prose prose-invert prose-sm max-w-none focus:outline-none ${className}`,
        spellcheck: 'false',
      },
      handleKeyDown: onKeyDown ? (view, event) => {
        return onKeyDown(event as KeyboardEvent)
      } : undefined,
    },
  })

  useImperativeHandle(ref, () => ({
    getContent: () => editor?.getHTML() || '',
    setContent: (content: string) => {
      editor?.commands.setContent(content)
    },
    focus: () => {
      editor?.commands.focus()
    },
    getCharacterCount: () => {
      if (!editor) return 0
      return editor.getText().length
    },
    getUploadedImages: () => uploadedImages,
    clearUploadedImages: () => setUploadedImages([]),
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
              onClick={handleImageSelect}
              disabled={uploadingImage}
              className={`${
                uploadingImage 
                  ? 'text-gray-500 cursor-not-allowed' 
                  : 'text-brand-400 hover:text-brand-300 hover:bg-brand-400/10'
              } p-2 rounded-full transition-all duration-200`}
              title={uploadingImage ? "Subiendo imagen..." : "Agregar imagen"}
            >
              <ImageIcon size={20} className={uploadingImage ? 'animate-pulse' : ''} />
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

      {/* Uploaded Images Preview */}
      {uploadedImages.length > 0 && (
        <div className="flex flex-wrap gap-2 py-2">
          {uploadedImages.map((imageUrl, index) => (
            <div key={index} className="relative group">
              <img
                src={imageUrl}
                alt={`Uploaded image ${index + 1}`}
                className="w-20 h-20 object-cover rounded-lg border border-[#404249]"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                title="Remove image"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Toolbar and Character Counter */}
      <div className="flex items-center justify-between pt-3 border-t border-[#404249]/50">
        <div className="flex items-center space-x-4">
          <button 
            type="button"
            onClick={handleImageSelect}
            disabled={uploadingImage}
            className={`${
              uploadingImage 
                ? 'text-gray-500 cursor-not-allowed' 
                : 'text-brand-400 hover:text-brand-300 hover:bg-brand-400/10'
            } p-2 rounded-full transition-all duration-200`}
            title={uploadingImage ? "Subiendo imagen..." : "Agregar imagen"}
          >
            <ImageIcon size={20} className={uploadingImage ? 'animate-pulse' : ''} />
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

TipTapEditor.displayName = 'TipTapEditor'

export default TipTapEditor
export type { TipTapEditorProps }